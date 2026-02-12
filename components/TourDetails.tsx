
import React from 'react';
import { TourPackage } from '../types';

interface TourDetailsProps {
    tour: TourPackage;
    onBack: () => void;
}

const TourDetails: React.FC<TourDetailsProps> = ({ tour, onBack }) => {
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
                    </div>

                    <div className="space-y-12 relative before:absolute before:inset-0 before:ml-4 before:-z-10 before:w-0.5 before:bg-slate-100">
                        {tour.itinerary?.map((day, i) => (
                            <div key={i} className="relative pl-12">
                                <div className="absolute left-0 top-0 w-8 h-8 bg-[#0c2d3a] rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-xl shadow-indigo-600/20 ring-4 ring-white">
                                    {day.day}
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-slate-800">{day.title}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {day.activities?.map((act, j) => (
                                            <div key={j} className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 group">
                                                {act.image && (
                                                    <div className="aspect-video rounded-xl overflow-hidden mb-4 border border-slate-200">
                                                        <img src={act.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={act.activity} />
                                                    </div>
                                                )}
                                                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block mb-1">{act.time}</span>
                                                <h4 className="text-[13px] font-bold text-slate-900 mb-1">{act.activity}</h4>
                                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{act.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
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
                            <button className="w-full py-4 bg-white text-[#0c2d3a] rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-50 transition-colors shadow-lg shadow-black/20">
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
        </div>
    );
};

export default TourDetails;
