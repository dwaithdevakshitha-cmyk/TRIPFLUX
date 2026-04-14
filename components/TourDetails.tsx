
import React, { useState, useEffect } from 'react';
import { TourPackage, User } from '../types';
import { locationTrackingService, TrackedLocation } from '../services/locationTrackingService';
import PaymentModal from './PaymentModal';

interface TourDetailsProps {
    tour: TourPackage;
    user: User | null;
    onBack: () => void;
    onRequireLogin?: () => void;
}

interface DayLocation {
    dayNumber: number;
    enabled: boolean;
    latitude?: number;
    longitude?: number;
    timestamp?: string;
    error?: string;
}

const TourDetails: React.FC<TourDetailsProps> = ({ tour, user, onBack, onRequireLogin }) => {
    const [dayLocations, setDayLocations] = useState<DayLocation[]>([]);
    const [showTrackModal, setShowTrackModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [allTrackedLocations, setAllTrackedLocations] = useState<TrackedLocation[]>([]);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const watchIds = React.useRef<{ [key: number]: number }>({});


    // Load tracked locations on mount and when modal opens
    useEffect(() => {
        loadTrackedLocations();
    }, [showTrackModal]);

    const loadTrackedLocations = () => {
        const locations = locationTrackingService.getAllLocations();
        setAllTrackedLocations(locations);

        // Load current tour's locations into dayLocations state
        const tourLocations = locationTrackingService.getLocationsByTour(tour.id);
        const dayLocs: DayLocation[] = tourLocations.map(loc => ({
            dayNumber: loc.dayNumber,
            enabled: true,
            latitude: loc.latitude,
            longitude: loc.longitude,
            timestamp: loc.timestamp
        }));
        setDayLocations(dayLocs);
    };

    const toggleLocationTracking = (dayNumber: number) => {
        const isCurrentlyEnabled = isLocationEnabled(dayNumber);

        if (isCurrentlyEnabled) {
            // Disable continuous tracking
            if (watchIds.current[dayNumber]) {
                navigator.geolocation.clearWatch(watchIds.current[dayNumber]);
                delete watchIds.current[dayNumber];
            }

            setDayLocations(prev => prev.map(loc =>
                loc.dayNumber === dayNumber ? { ...loc, enabled: false } : loc
            ));
        } else {
            // Enable continuous tracking
            if ('geolocation' in navigator) {
                const dayInfo = tour.itinerary?.find(d => d.day === dayNumber);
                
                // Track the last time we saved a location to prevent too many updates
                let lastSaveTime = 0;
                const MIN_SAVE_INTERVAL = 30000; // 30 seconds

                const watchId = navigator.geolocation.watchPosition(
                    (position) => {
                        const currentTime = Date.now();
                        const newLocation: DayLocation = {
                            dayNumber,
                            enabled: true,
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            timestamp: new Date().toISOString()
                        };

                        setDayLocations(prev => {
                            const filtered = prev.filter(loc => loc.dayNumber !== dayNumber);
                            return [...filtered, newLocation];
                        });

                        // Only save if moved more than 50 meters or it's the first point
                        const lastPoint = getVisitedPlaces().filter(loc => loc.dayNumber === dayNumber).pop();
                        
                        const shouldSave = !lastPoint || (() => {
                            const R = 6371e3; // metres
                            const φ1 = lastPoint.latitude * Math.PI/180;
                            const φ2 = position.coords.latitude * Math.PI/180;
                            const Δφ = (position.coords.latitude - lastPoint.latitude) * Math.PI/180;
                            const Δλ = (position.coords.longitude - lastPoint.longitude) * Math.PI/180;

                            const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                                    Math.cos(φ1) * Math.cos(φ2) *
                                    Math.sin(Δλ/2) * Math.sin(Δλ/2);
                            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                            const d = R * c;
                            return d > 50; // 50 meters
                        })();

                        if ((currentTime - lastSaveTime >= MIN_SAVE_INTERVAL) && shouldSave) {
                            locationTrackingService.addLocation({
                                tourId: tour.id,
                                tourTitle: tour.title,
                                dayNumber,
                                dayTitle: dayInfo?.title || `Day ${dayNumber}`,
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                                timestamp: new Date().toISOString()
                            });
                            lastSaveTime = currentTime;
                            loadTrackedLocations();
                        }

                        console.log(`Day ${dayNumber} location updated:`, {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                            time: new Date().toISOString()
                        });
                    },
                    (error) => {
                        let errorMessage = 'Unable to get location';
                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                errorMessage = 'Location permission denied. Please enable location access.';
                                break;
                            case error.POSITION_UNAVAILABLE:
                                errorMessage = 'Location information unavailable.';
                                break;
                            case error.TIMEOUT:
                                return; // Just ignore timeout errors during watch
                        }

                        const errorLocation: DayLocation = {
                            dayNumber,
                            enabled: false,
                            error: errorMessage
                        };

                        setDayLocations(prev => {
                            const filtered = prev.filter(loc => loc.dayNumber !== dayNumber);
                            return [...filtered, errorLocation];
                        });

                        alert(errorMessage);
                        // Clean up watch on serious error
                        if (watchIds.current[dayNumber]) {
                            navigator.geolocation.clearWatch(watchIds.current[dayNumber]);
                            delete watchIds.current[dayNumber];
                        }
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 30000,
                        maximumAge: 5000
                    }
                );

                watchIds.current[dayNumber] = watchId;
                
                // Mark as enabled immediately
                setDayLocations(prev => {
                    const filtered = prev.filter(loc => loc.dayNumber !== dayNumber);
                    return [...filtered, { dayNumber, enabled: true }];
                });
            } else {
                alert('Geolocation is not supported by your browser');
            }
        }
    };

    // Cleanup all watches on unmount
    useEffect(() => {
        const currentWatchIds = watchIds.current;
        return () => {
            Object.values(currentWatchIds).forEach(id => {
                if (typeof id === 'number') {
                    navigator.geolocation.clearWatch(id);
                }
            });
        };
    }, []);


    const isLocationEnabled = (dayNumber: number) => {
        return dayLocations.find(loc => loc.dayNumber === dayNumber)?.enabled || false;
    };

    const getLocationData = (dayNumber: number) => {
        return dayLocations.find(loc => loc.dayNumber === dayNumber);
    };

    const getVisitedPlaces = () => {
        return allTrackedLocations
            .filter(loc => loc.tourId === tour.id)
            .sort((a, b) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
    };

    const openInGoogleMaps = (lat: number, lng: number) => {
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    };

    return (
        <div className="animate-in fade-in duration-700 bg-white min-h-screen pb-24 md:pb-0">
            {/* Hero Section */}
            <div className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] w-full">
                <img src={tour.image} className="w-full h-full object-cover" alt={tour.title} />
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6 md:p-16">
                    <div className="max-w-7xl mx-auto w-full">
                        <button
                            onClick={onBack}
                            className="mb-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Explore
                        </button>
                        <span className="text-indigo-400 font-black text-[10px] md:text-xs uppercase tracking-[0.4em] mb-4 block">{tour.category} PACKAGE</span>
                        <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter uppercase mb-2 leading-tight">{tour.title}</h1>
                        <p className="text-white/80 text-sm md:text-lg font-medium">{tour.destination} • {tour.duration}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-16 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-16">
                {/* Left: Itinerary */}
                <div className="lg:col-span-2 space-y-12">
                    <div className="flex items-center gap-4 mb-8">
                        {tour.itinerary && tour.itinerary.length > 0 && (
                            <>
                                <h2 className="text-3xl font-black text-[#0c2d3a] tracking-tight uppercase">Itinerary</h2>
                                <div className="h-1 flex-1 bg-slate-100 rounded-full"></div>
                            </>
                        )}

                        {/* Track Button */}
                        <button
                            onClick={() => setShowTrackModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            Track ({getVisitedPlaces().length})
                        </button>
                    </div>

                    {tour.description && (
                        <div className="bg-slate-50 rounded-2xl md:rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <h3 className="text-xl font-extrabold text-[#0c2d3a] mb-4 flex items-center gap-3">
                                Overview
                                <span className="h-1 w-8 bg-indigo-600 rounded-full"></span>
                            </h3>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">
                                {tour.description}
                            </p>
                        </div>
                    )}

                    <div className="space-y-16 relative before:absolute before:inset-0 before:ml-5 before:-z-10 before:w-1 before:bg-slate-100/50">
                        {tour.itinerary?.map((day, i) => {
                            const locationData = getLocationData(day.day);
                            const isEnabled = isLocationEnabled(day.day);

                            return (
                                <div key={i} className="relative pl-16 animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                    {/* Day Marker */}
                                    <div className="absolute left-0 top-0 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-xs font-black text-white shadow-2xl shadow-indigo-200 ring-8 ring-white z-10">
                                        {day.day}
                                    </div>

                                    {/* Day Card */}
                                    <div className="bg-white rounded-2xl md:rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500 group">
                                        <div className="p-6 md:p-8 w-full">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-xl font-extrabold text-[#0c2d3a] flex items-center gap-3">
                                                    {day.title}
                                                    <span className="h-1 w-8 bg-indigo-600 rounded-full"></span>
                                                </h3>

                                                {/* Location Toggle Button */}
                                                <button
                                                    onClick={() => toggleLocationTracking(day.day)}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${isEnabled
                                                        ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                        }`}
                                                    title={isEnabled ? 'Location tracking enabled' : 'Enable location tracking'}
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {isEnabled ? 'ON' : 'OFF'}
                                                </button>
                                            </div>

                                            {/* Location Info Display */}
                                            {locationData && locationData.enabled && (
                                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                                                    <p className="text-xs font-bold text-green-700 mb-1">📍 Location Tracked</p>
                                                    <p className="text-[10px] text-green-600 font-medium">
                                                        Lat: {locationData.latitude?.toFixed(6)}, Lng: {locationData.longitude?.toFixed(6)}
                                                    </p>
                                                    <p className="text-[9px] text-green-500 mt-1">
                                                        {locationData.timestamp && new Date(locationData.timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                            )}

                                            {locationData && locationData.error && (
                                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                                                    <p className="text-xs font-bold text-red-700">⚠️ Location Error</p>
                                                    <p className="text-[10px] text-red-600">{locationData.error}</p>
                                                </div>
                                            )}

                                            <div className="space-y-4">
                                                {day.activities?.map((act, j) => (
                                                    <div key={j} className="flex gap-4 items-start last:border-0 border-b border-slate-50 pb-4 last:pb-0">
                                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0"></div>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-[14px] font-bold text-slate-800">{act.activity}</h4>
                                                            </div>
                                                            <p className="text-[12px] text-slate-500 leading-relaxed font-medium">{act.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Booking & Features - shows first on mobile via order */}
                <div className="space-y-6 sm:space-y-8 lg:order-last order-first">
                    <div className="sticky top-24 space-y-8">
                        <div className="bg-[#0c2d3a] text-white rounded-2xl sm:rounded-[40px] p-6 sm:p-10 shadow-2xl shadow-indigo-900/20">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Pricing Details</p>
                            <div className="mb-8">
                                <span className="text-xs font-bold text-white/50 uppercase">{tour.priceBasis}</span>
                                <p className="text-3xl sm:text-5xl font-black tracking-tighter">{tour.price}</p>
                            </div>
                            <button
                                onClick={() => {
                                    if (!user) {
                                        onRequireLogin?.();
                                    } else {
                                        setShowPaymentModal(true);
                                    }
                                }}
                                className="w-full py-4 bg-white text-[#0c2d3a] rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-50 transition-colors shadow-lg shadow-black/20"
                            >
                                Book This Package
                            </button>
                            {(tour.location || tour.track) && (
                                <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">Live Tour Status</p>
                                    {tour.location && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-white/40 uppercase tracking-wider">Current Location</p>
                                                <p className="text-sm font-bold text-white">{tour.location}</p>
                                            </div>
                                        </div>
                                    )}
                                    {tour.track && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-white/40 uppercase tracking-wider">Trip Track</p>
                                                <p className="text-[11px] font-medium text-white/80 italic">{tour.track}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                                <div className="flex items-center gap-3 text-white/60">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span className="text-xs font-bold">8297788789</span>
                                </div>
                                <div className="flex items-center gap-3 text-white/60">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-xs font-bold">info@tripflux.com</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-[40px] p-6 sm:p-10 space-y-6">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Package Inclusions</h4>
                            <div className="flex flex-wrap gap-2">
                                {(tour.features && tour.features.length > 0 ? tour.features : ['Premium Hotels', 'Sightseeing', 'Expert Support', 'Deluxe Coach']).map((f, i) => (
                                    <span key={i} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 shadow-sm">✓ {f}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Track Modal */}
            {showTrackModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="relative w-full max-w-3xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[80vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-3xl font-black tracking-tight uppercase mb-1">Your Journey Track</h3>
                                    <p className="text-white/80 text-sm font-medium">{tour.title}</p>
                                </div>
                                <button
                                    onClick={() => setShowTrackModal(false)}
                                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {/* Overall Interactive Map */}
                            <div className="mb-10 rounded-3xl overflow-hidden border-4 border-slate-100 shadow-xl bg-slate-50 relative group">
                                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-slate-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                                        <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Live Overall Route</span>
                                    </div>
                                </div>
                                <iframe 
                                    className="w-full h-[400px] pointer-events-auto"
                                    sandbox="allow-scripts allow-same-origin allow-popups"
                                    srcDoc={`
                                        <!DOCTYPE html>
                                        <html>
                                        <head>
                                            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                                            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                                            <style>
                                                body { margin: 0; padding: 0; font-family: sans-serif; }
                                                #map { width: 100vw; height: 100vh; }
                                                .custom-popup .leaflet-popup-content-wrapper { border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
                                                .custom-popup .leaflet-popup-content { margin: 16px; margin-bottom: 12px; }
                                                .leaflet-container { background: #f8fafc; }
                                            </style>
                                        </head>
                                        <body>
                                            <div id="map"></div>
                                            <script>
                                                const map = L.map('map', { zoomControl: false });
                                                L.control.zoom({ position: 'bottomright' }).addTo(map);
                                                
                                                L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                                                    attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
                                                }).addTo(map);

                                                const locations = ${JSON.stringify(getVisitedPlaces().map(loc => ({
                                                    lat: loc.latitude, 
                                                    lng: loc.longitude, 
                                                    day: loc.dayNumber, 
                                                    title: loc.dayTitle,
                                                    time: new Date(loc.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                                })))};

                                                const latlngs = [];
                                                const bounds = L.latLngBounds([]);

                                                locations.forEach((loc, index) => {
                                                    latlngs.push([loc.lat, loc.lng]);
                                                    bounds.extend([loc.lat, loc.lng]);

                                                    // Custom Map Marker Icon
                                                    const markerHtml = \`
                                                        <div style="background:#4f46e5; color:white; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:12px; border:3px solid white; box-shadow:0 4px 6px rgba(0,0,0,0.3);">
                                                            \${loc.day}
                                                        </div>
                                                    \`;
                                                    
                                                    const icon = L.divIcon({
                                                        html: markerHtml,
                                                        className: '',
                                                        iconSize: [28, 28],
                                                        iconAnchor: [14, 14]
                                                    });

                                                    const marker = L.marker([loc.lat, loc.lng], {icon}).addTo(map);
                                                    
                                                    marker.bindPopup(\`
                                                        <div style="text-align:center;">
                                                            <div style="font-size:10px; font-weight:900; color:#818cf8; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Day \${loc.day}</div>
                                                            <div style="font-size:14px; font-weight:bold; color:#0f172a; margin-bottom:6px;">\${loc.title}</div>
                                                            <div style="font-size:11px; color:#64748b;">\${loc.time}</div>
                                                            <div style="margin-top:8px; font-size:9px; color:#94a3b8; font-family:monospace;">\${loc.lat.toFixed(4)}, \${loc.lng.toFixed(4)}</div>
                                                        </div>
                                                    \`, { className: 'custom-popup' });
                                                });

                                                if (locations.length > 1) {
                                                    // Draw a dashed highly visible line connecting the route
                                                    L.polyline(latlngs, {
                                                        color: '#4f46e5', 
                                                        weight: 4, 
                                                        opacity: 0.8,
                                                        dashArray: '8, 8',
                                                        lineJoin: 'round'
                                                    }).addTo(map);
                                                }

                                                if (locations.length > 0) {
                                                    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
                                                } else {
                                                    map.setView([20.5937, 78.9629], 4); // Default India center
                                                }
                                            </script>
                                        </body>
                                        </html>
                                    `}
                                />
                                {tour.track && (
                                    <div className="absolute bottom-4 left-4 right-4 z-10 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-indigo-50 rounded-xl mt-1">
                                                <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Official Trip Itinerary Track</h4>
                                                <p className="text-sm font-bold text-slate-700 leading-snug">{tour.track}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actual Visits Timeline</h4>
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    <button 
                                        onClick={() => setSelectedDay(null)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${selectedDay === null ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        All
                                    </button>
                                    {Array.from(new Set(getVisitedPlaces().map(l => l.dayNumber))).sort((a: any, b: any) => (a as number) - (b as number)).map((day: any) => (
                                        <button 
                                            key={day}
                                            onClick={() => setSelectedDay(day as number)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${selectedDay === day ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Day {day}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {getVisitedPlaces().filter(loc => selectedDay === null || loc.dayNumber === selectedDay).length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-700 mb-2">No Places Tracked {selectedDay ? `for Day ${selectedDay}` : 'Yet'}</h4>
                                    <p className="text-slate-500 text-sm">Enable location tracking on any day to start building your journey map!</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Summary Stats */}
                                    <div className="grid grid-cols-3 gap-4 mb-8">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl border border-blue-200">
                                            <p className="text-xs font-black text-blue-600 uppercase tracking-wider mb-1">Total Places</p>
                                            <p className="text-3xl font-black text-blue-700">{getVisitedPlaces().filter(loc => selectedDay === null || loc.dayNumber === selectedDay).length}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl border border-green-200">
                                            <p className="text-xs font-black text-green-600 uppercase tracking-wider mb-1">Days with Tracks</p>
                                            <p className="text-3xl font-black text-green-700">{new Set(getVisitedPlaces().map(l => l.dayNumber)).size}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl border border-purple-200">
                                            <p className="text-xs font-black text-purple-600 uppercase tracking-wider mb-1">Latest Visit</p>
                                            <p className="text-sm font-bold text-purple-700">
                                                {getVisitedPlaces().filter(loc => selectedDay === null || loc.dayNumber === selectedDay).length > 0 
                                                    ? new Date(getVisitedPlaces().filter(loc => selectedDay === null || loc.dayNumber === selectedDay).slice(-1)[0]?.timestamp).toLocaleDateString() 
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Timeline of Visited Places */}
                                    <div className="space-y-4 relative before:absolute before:left-6 before:top-0 before:bottom-0 before:w-0.5 before:bg-gradient-to-b before:from-indigo-200 before:to-purple-200">
                                        {getVisitedPlaces().filter(loc => selectedDay === null || loc.dayNumber === selectedDay).map((location, index) => {
                                            return (
                                                <div key={location.id} className="relative pl-16 animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                                                    {/* Timeline Dot */}
                                                    <div className="absolute left-0 top-3 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-xs font-black text-white shadow-lg shadow-indigo-200 ring-4 ring-white">
                                                        {location.dayNumber}
                                                    </div>

                                                    {/* Location Card */}
                                                    <div className="bg-white border-2 border-slate-100 rounded-2xl p-6 hover:border-indigo-200 hover:shadow-xl transition-all">
                                                        <div className="flex flex-col lg:flex-row gap-6">
                                                            <div className="flex-1">
                                                                <div className="flex items-start justify-between mb-4">
                                                                    <div>
                                                                        {/* Tour Badge */}
                                                                        <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-black uppercase tracking-wider mb-2">
                                                                            {location.tourTitle}
                                                                        </div>
                                                                        <h4 className="text-lg font-black text-slate-800 mb-1">{location.dayTitle}</h4>
                                                                        <p className="text-xs text-slate-500 font-medium tracking-wide">
                                                                            📅 {new Date(location.timestamp).toLocaleDateString('en-US', {
                                                                                weekday: 'short',
                                                                                year: 'numeric',
                                                                                month: 'short',
                                                                                day: 'numeric',
                                                                                hour: '2-digit',
                                                                                minute: '2-digit'
                                                                            })}
                                                                        </p>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => openInGoogleMaps(location.latitude, location.longitude)}
                                                                        className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-indigo-100 transition-all"
                                                                    >
                                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                        </svg>
                                                                        Open App
                                                                    </button>
                                                                </div>

                                                                <div className="bg-slate-50 rounded-xl p-4 shadow-inner">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                                                            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                            </svg>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GPS Coordinates</p>
                                                                            <p className="text-xs font-mono text-slate-700 tracking-tight">
                                                                                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Embedded Map */}
                                                            <div className="w-full lg:w-1/2 h-48 lg:h-auto min-h-[160px] rounded-xl overflow-hidden border border-slate-200 shadow-sm relative group bg-slate-100">
                                                                <iframe
                                                                    width="100%"
                                                                    height="100%"
                                                                    frameBorder="0"
                                                                    scrolling="no"
                                                                    marginHeight={0}
                                                                    marginWidth={0}
                                                                    title={`Map for Day ${location.dayNumber}`}
                                                                    className="absolute inset-0 w-full h-full grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                                                                    src={`https://maps.google.com/maps?q=${location.latitude},${location.longitude}&z=14&output=embed`}
                                                                ></iframe>
                                                                {/* Map Overlay Pointer event bypass */}
                                                                <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-indigo-500/10 transition-colors rounded-xl"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-slate-50 p-6 border-t border-slate-100">
                            <button
                                onClick={() => setShowTrackModal(false)}
                                className="w-full py-3 bg-slate-800 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                tourTitle={tour.title}
                amount={tour.price}
                tourId={tour.id}
                user={user}
                availableDates={tour.dates}
            />
        </div>
    );
};

export default TourDetails;
