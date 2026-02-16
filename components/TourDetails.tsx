
import React, { useState, useEffect } from 'react';
import { TourPackage } from '../types';
import { locationTrackingService, TrackedLocation } from '../services/locationTrackingService';
import PaymentModal from './PaymentModal';

interface TourDetailsProps {
    tour: TourPackage;
    onBack: () => void;
}

interface DayLocation {
    dayNumber: number;
    enabled: boolean;
    latitude?: number;
    longitude?: number;
    timestamp?: string;
    error?: string;
}

const TourDetails: React.FC<TourDetailsProps> = ({ tour, onBack }) => {
    const [dayLocations, setDayLocations] = useState<DayLocation[]>([]);
    const [showTrackModal, setShowTrackModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [allTrackedLocations, setAllTrackedLocations] = useState<TrackedLocation[]>([]);

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
        const existingLocation = dayLocations.find(loc => loc.dayNumber === dayNumber);

        if (existingLocation?.enabled) {
            // Disable location tracking
            setDayLocations(prev => prev.map(loc =>
                loc.dayNumber === dayNumber ? { ...loc, enabled: false } : loc
            ));

            // Remove from global tracking service
            const tourLocations = locationTrackingService.getLocationsByTour(tour.id);
            const locationToRemove = tourLocations.find(loc => loc.dayNumber === dayNumber);
            if (locationToRemove) {
                locationTrackingService.removeLocation(locationToRemove.id);
                loadTrackedLocations();
            }
        } else {
            // Enable location tracking and get current location
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const dayInfo = tour.itinerary?.find(d => d.day === dayNumber);

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

                        // Save to global tracking service
                        locationTrackingService.addLocation({
                            tourId: tour.id,
                            tourTitle: tour.title,
                            dayNumber,
                            dayTitle: dayInfo?.title || `Day ${dayNumber}`,
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            timestamp: new Date().toISOString()
                        });

                        console.log(`Day ${dayNumber} Location saved to global tracking:`, {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                            time: new Date().toISOString()
                        });
                    },
                    (error) => {
                        let errorMessage = 'Unable to get location';

                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
                                break;
                            case error.POSITION_UNAVAILABLE:
                                errorMessage = 'Location information unavailable. Please check your GPS/network.';
                                break;
                            case error.TIMEOUT:
                                errorMessage = 'Location request timed out. Please try again.';
                                break;
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
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 15000,
                        maximumAge: 0
                    }
                );
            } else {
                alert('Geolocation is not supported by your browser');
            }
        }
    };

    const isLocationEnabled = (dayNumber: number) => {
        return dayLocations.find(loc => loc.dayNumber === dayNumber)?.enabled || false;
    };

    const getLocationData = (dayNumber: number) => {
        return dayLocations.find(loc => loc.dayNumber === dayNumber);
    };

    const getVisitedPlaces = () => {
        return allTrackedLocations.sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
    };

    const openInGoogleMaps = (lat: number, lng: number) => {
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    };

    return (
        <div className="animate-in fade-in duration-700 bg-white min-h-screen">
            {/* Hero Section */}
            <div className="relative h-[60vh] w-full">
                <img src={tour.image} className="w-full h-full object-cover" alt={tour.title} />
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-8 md:p-16">
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
                        <span className="text-indigo-400 font-black text-xs uppercase tracking-[0.4em] mb-4 block">{tour.category} PACKAGE</span>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase mb-2">{tour.title}</h1>
                        <p className="text-white/80 text-lg font-medium">{tour.destination} • {tour.duration}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
                {/* Left: Itinerary */}
                <div className="lg:col-span-2 space-y-12">
                    <div className="flex items-center gap-4 mb-8">
                        <h2 className="text-3xl font-black text-[#0c2d3a] tracking-tight uppercase">Itinerary</h2>
                        <div className="h-1 flex-1 bg-slate-100 rounded-full"></div>

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
                                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500 group">
                                        <div className="p-8 w-full">
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
                                                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">{act.time}</span>
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

                {/* Right: Booking & Features */}
                <div className="space-y-8">
                    <div className="sticky top-24 space-y-8">
                        <div className="bg-[#0c2d3a] text-white rounded-[40px] p-10 shadow-2xl shadow-indigo-900/20">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Pricing Details</p>
                            <div className="mb-8">
                                <span className="text-xs font-bold text-white/50 uppercase">{tour.priceBasis}</span>
                                <p className="text-5xl font-black tracking-tighter">{tour.price}</p>
                            </div>
                            <button
                                onClick={() => setShowPaymentModal(true)}
                                className="w-full py-4 bg-white text-[#0c2d3a] rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-50 transition-colors shadow-lg shadow-black/20"
                            >
                                Book This Package
                            </button>
                            <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                                <div className="flex items-center gap-3 text-white/60">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span className="text-xs font-bold">7036665588</span>
                                </div>
                                <div className="flex items-center gap-3 text-white/60">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-xs font-bold">info@tripflux.com</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-[40px] p-10 space-y-6">
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
                                    <h3 className="text-3xl font-black tracking-tight uppercase mb-2">Your Journey Track</h3>
                                    <p className="text-white/80 text-sm font-medium">Places you've visited on this tour</p>
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
                        <div className="flex-1 overflow-y-auto p-8">
                            {getVisitedPlaces().length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-700 mb-2">No Places Tracked Yet</h4>
                                    <p className="text-slate-500 text-sm">Enable location tracking on any day to start building your journey map!</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Summary Stats */}
                                    <div className="grid grid-cols-3 gap-4 mb-8">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl border border-blue-200">
                                            <p className="text-xs font-black text-blue-600 uppercase tracking-wider mb-1">Total Places</p>
                                            <p className="text-3xl font-black text-blue-700">{getVisitedPlaces().length}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl border border-green-200">
                                            <p className="text-xs font-black text-green-600 uppercase tracking-wider mb-1">Tours Visited</p>
                                            <p className="text-3xl font-black text-green-700">{new Set(getVisitedPlaces().map(l => l.tourId)).size}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl border border-purple-200">
                                            <p className="text-xs font-black text-purple-600 uppercase tracking-wider mb-1">Latest Visit</p>
                                            <p className="text-sm font-bold text-purple-700">{getVisitedPlaces().length > 0 ? new Date(getVisitedPlaces()[getVisitedPlaces().length - 1]?.timestamp).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                    </div>

                                    {/* Timeline of Visited Places */}
                                    <div className="space-y-4 relative before:absolute before:left-6 before:top-0 before:bottom-0 before:w-0.5 before:bg-gradient-to-b before:from-indigo-200 before:to-purple-200">
                                        {getVisitedPlaces().map((location, index) => {
                                            return (
                                                <div key={location.id} className="relative pl-16 animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                                                    {/* Timeline Dot */}
                                                    <div className="absolute left-0 top-3 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-xs font-black text-white shadow-lg shadow-indigo-200 ring-4 ring-white">
                                                        {location.dayNumber}
                                                    </div>

                                                    {/* Location Card */}
                                                    <div className="bg-white border-2 border-slate-100 rounded-2xl p-6 hover:border-indigo-200 hover:shadow-xl transition-all">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex-1">
                                                                {/* Tour Badge */}
                                                                <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-black uppercase tracking-wider mb-2">
                                                                    {location.tourTitle}
                                                                </div>
                                                                <h4 className="text-lg font-black text-slate-800 mb-1">{location.dayTitle}</h4>
                                                                <p className="text-xs text-slate-500 font-medium">
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
                                                                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-green-600 transition-all shadow-lg shadow-green-200"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                                                </svg>
                                                                View Map
                                                            </button>
                                                        </div>

                                                        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Coordinates:</span>
                                                                <span className="text-xs font-mono text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200">
                                                                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                                                </span>
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
            />
        </div>
    );
};

export default TourDetails;
