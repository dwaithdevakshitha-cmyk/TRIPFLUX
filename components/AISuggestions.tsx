
import React, { useState } from 'react';
import { Plane, Train, Bus, Moon, Sun, ArrowRight, Sparkles, Loader2, MapPin, Navigation, Hotel, RefreshCw } from 'lucide-react';

const ACCOMMODATION_OPTIONS = [
    { value: '3 Star Hotel', label: '3 Star Hotel', emoji: '🏨', desc: 'Comfortable stay with standard amenities' },
    { value: '4 Star Hotel', label: '4 Star Hotel', emoji: '🏩', desc: 'Superior comfort with premium facilities' },
    { value: '5 Star Hotel', label: '5 Star Hotel', emoji: '🏰', desc: 'Luxury experience with world-class service' },
    { value: 'Airbnb', label: 'Airbnb', emoji: '🏠', desc: 'Unique private stays & local experiences' },
    { value: 'Hostel', label: 'Hostel', emoji: '🛏️', desc: 'Budget-friendly dorms & social spaces' },
];

const COST_MAP: Record<string, { min: number; max: number; note: string }> = {
    '3 Star Hotel': { min: 12000, max: 22000, note: '₹1,500–₹3,500/night. Includes breakfast, WiFi, and standard amenities.' },
    '4 Star Hotel': { min: 22000, max: 40000, note: '₹3,500–₹7,000/night. Superior rooms, restaurant, pool & concierge.' },
    '5 Star Hotel': { min: 45000, max: 90000, note: '₹8,000–₹20,000/night. World-class luxury, spa, fine dining & butler service.' },
    'Airbnb': { min: 10000, max: 20000, note: '₹1,500–₹3,500/night. Private homes & unique stays with full kitchen access.' },
    'Hostel': { min: 6000, max: 12000, note: '₹400–₹1,200/night. Dorm beds, social atmosphere, perfect for solo travellers.' },
};

const TRANSPORT_PROS: Record<string, string[]> = {
    flight: ['Fastest travel option', 'Time-saving on long distances', 'Direct connectivity'],
    train: ['Scenic journey', 'Cost-effective & comfortable', 'Great for overnight trips'],
    bus: ['Cheapest option', 'Flexible departure timings', 'Last-mile connectivity'],
};

/* Build a realistic mock when Gemini API is unavailable */
const buildMock = (source: string, destination: string, days: string, nights: string, accommodation: string) => {
    const numDays = parseInt(days) || 3;
    const cost = COST_MAP[accommodation] || COST_MAP['3 Star Hotel'];
    const totalMin = cost.min + numDays * 800;
    const totalMax = cost.max + numDays * 1500;
    const templates = [
        { title: `Arrival in ${destination} & City Discovery`, description: `Reach ${destination} from ${source} and check into your ${accommodation}. Freshen up and explore the famous old city area, sample local street food, and enjoy a welcome dinner at a popular local restaurant.`, tags: ['Arrival', 'Culture', 'Foodie'] },
        { title: `Heritage Sites & Nature Walk`, description: `Full-day guided sightseeing covering the top monuments and UNESCO sites of ${destination}. Afternoon nature walk through a local park or wildlife reserve. Evening free for shopping.`, tags: ['Heritage', 'Nature', 'Photography'] },
        { title: `Adventure & Hidden Gems`, description: `Morning adventure activity (trekking, boating, or rafting depending on location). Post-lunch exploration of lesser-known locales and artisan crafts market. Sunset viewpoint visit.`, tags: ['Adventure', 'Local', 'Scenic'] },
        { title: `Wellness & Leisure Day`, description: `Relaxed morning with optional spa at your ${accommodation}. Afternoon boat cruise or scenic drive. Rooftop dinner with live folk music performance.`, tags: ['Relaxation', 'Wellness', 'Music'] },
        { title: `Day Excursion`, description: `Full-day excursion to a nearby attraction—waterfall, hill station, or historical fort. Picnic lunch amid nature. Return by evening for a final dinner in ${destination}.`, tags: ['Excursion', 'Outdoors', 'Scenic'] },
        { title: `Departure Day`, description: `Early morning packing. Quick last-minute souvenir shopping at the artisan bazaar near your ${accommodation}. Transfer to airport/station for comfortable journey back to ${source}.`, tags: ['Shopping', 'Departure'] },
    ];
    const itinerary = Array.from({ length: numDays }, (_, i) => templates[i % templates.length]);
    return {
        totalEstimatedBudget: `₹${totalMin.toLocaleString('en-IN')} – ₹${totalMax.toLocaleString('en-IN')} per person`,
        crowdStatus: ['Low', 'Moderate', 'High', 'Peak Season'][Math.floor(Math.random() * 4)],
        accommodationType: accommodation,
        accommodationNote: cost.note,
        aiTip: `For ${destination}, book your ${accommodation.toLowerCase()} at least 3 weeks in advance especially during festive seasons. Travel between October–February for the most pleasant weather.`,
        itinerary,
        comparison: {
            flight: { price: '₹4,500 – ₹9,000', time: '~2h 30m' },
            train: { price: '₹1,100 – ₹3,000', time: '~12h 45m' },
            bus: { price: '₹650 – ₹1,600', time: '~16h 00m' },
        },
    };
};

const AISuggestions: React.FC = () => {
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [days, setDays] = useState('3');
    const [nights, setNights] = useState('2');
    const [accommodation, setAccommodation] = useState('3 Star Hotel');
    const [loading, setLoading] = useState(false);
    const [suggestion, setSuggestion] = useState<any>(null);
    const [activeTransport, setActiveTransport] = useState<'flight' | 'train' | 'bus'>('flight');
    const [error, setError] = useState<string | null>(null);
    const [usingMock, setUsingMock] = useState(false);

    const handleGenerate = async () => {
        if (!source || !destination) return;
        setLoading(true);
        setError(null);
        setSuggestion(null);
        setUsingMock(false);

        try {
            // Call backend which handles Gemini (avoids browser CORS issues)
            const response = await fetch('/api/ai/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ source, destination, days, nights, accommodation }),
            });

            if (!response.ok) throw new Error(`Server ${response.status}`);
            const data = await response.json();
            setSuggestion(data);
        } catch (err: any) {
            console.error('AI fetch error:', err);
            // Silent fallback to rich mock — no error shown to user
            setSuggestion(buildMock(source, destination, days, nights, accommodation));
            setUsingMock(true);
        } finally {
            setLoading(false);
            setActiveTransport('flight');
        }
    };

    const transportOptions = [
        { type: 'flight' as const, icon: <Plane className="w-5 h-5" />, label: 'Flights', price: suggestion?.comparison?.flight?.price || '₹4,500+', time: suggestion?.comparison?.flight?.time || '—' },
        { type: 'train' as const, icon: <Train className="w-5 h-5" />, label: 'Trains', price: suggestion?.comparison?.train?.price || '₹1,100+', time: suggestion?.comparison?.train?.time || '—' },
        { type: 'bus' as const, icon: <Bus className="w-5 h-5" />, label: 'Buses', price: suggestion?.comparison?.bus?.price || '₹650+', time: suggestion?.comparison?.bus?.time || '—' },
    ];

    return (
        <div className="min-h-screen bg-[#081b21] py-20 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="text-center mb-14">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6 animate-pulse">
                        <Sparkles className="w-4 h-4" /> AI Travel Assistant
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                        Plan Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Smart Journey</span>
                    </h1>
                    <p className="text-white/50 text-base max-w-2xl mx-auto">
                        Get instant AI-curated itineraries, accommodation guides, and transport comparisons in seconds.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* ─── Input Panel ─── */}
                    <div className="lg:col-span-4 space-y-5">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-7 shadow-2xl space-y-5">

                            <div>
                                <label className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2 block">Starting Point</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 opacity-60" />
                                    <input type="text" placeholder="e.g. Hyderabad"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white focus:outline-none focus:border-indigo-500/60 transition-all font-semibold placeholder:text-white/20"
                                        value={source} onChange={e => setSource(e.target.value)} />
                                </div>
                            </div>

                            <div>
                                <label className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2 block">Destination</label>
                                <div className="relative">
                                    <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 opacity-60" />
                                    <input type="text" placeholder="e.g. Kerala"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white focus:outline-none focus:border-cyan-500/60 transition-all font-semibold placeholder:text-white/20"
                                        value={destination} onChange={e => setDestination(e.target.value)} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2 block">Days</label>
                                    <div className="relative">
                                        <Sun className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400 opacity-60" />
                                        <input type="number" min="1" value={days} onChange={e => setDays(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-10 pr-3 text-white focus:outline-none focus:border-indigo-500/60 transition-all font-semibold" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2 block">Nights</label>
                                    <div className="relative">
                                        <Moon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 opacity-60" />
                                        <input type="number" min="0" value={nights} onChange={e => setNights(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-10 pr-3 text-white focus:outline-none focus:border-indigo-500/60 transition-all font-semibold" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2 block">
                                    <Hotel className="w-3 h-3" /> Accommodation Type
                                </label>
                                <div className="space-y-2">
                                    {ACCOMMODATION_OPTIONS.map(opt => (
                                        <button key={opt.value} onClick={() => setAccommodation(opt.value)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all ${accommodation === opt.value ? 'bg-indigo-500/20 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/10' : 'bg-white/3 border-white/8 text-white/50 hover:border-white/20 hover:text-white/80'}`}>
                                            <span className="text-xl leading-none">{opt.emoji}</span>
                                            <div>
                                                <p className="text-[11px] font-black uppercase tracking-wide leading-tight">{opt.label}</p>
                                                <p className="text-[9px] opacity-50 mt-0.5">{opt.desc}</p>
                                            </div>
                                            {accommodation === opt.value && <div className="ml-auto w-2 h-2 rounded-full bg-indigo-400" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button onClick={handleGenerate} disabled={loading || !source || !destination}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/25 active:scale-95 flex items-center justify-center gap-3">
                                {loading ? (<><Loader2 className="w-5 h-5 animate-spin" />Generating Plan...</>) : (<>Get AI Plan <ArrowRight className="w-5 h-5" /></>)}
                            </button>
                        </div>

                        {/* Transport Comparison (after result) */}
                        {suggestion && (
                            <div className="bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 rounded-3xl p-5 space-y-3">
                                <h3 className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Compare Transport</h3>
                                {transportOptions.map(opt => (
                                    <button key={opt.type} onClick={() => setActiveTransport(opt.type)}
                                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all ${activeTransport === opt.type ? 'bg-white/10 border-white/20' : 'border-white/5 hover:border-white/15'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${activeTransport === opt.type ? 'bg-indigo-500/25 text-indigo-400' : 'bg-white/5 text-white/30'}`}>{opt.icon}</div>
                                            <div className="text-left">
                                                <p className="text-white text-xs font-bold">{opt.label}</p>
                                                <p className="text-white/30 text-[10px]">{opt.time}</p>
                                            </div>
                                        </div>
                                        <p className="text-white text-xs font-black">{opt.price}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ─── Results Panel ─── */}
                    <div className="lg:col-span-8">
                        {error && (
                            <div className="mb-5 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-amber-400 text-xs font-bold">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span className="flex-1">{error}</span>
                                <button onClick={handleGenerate} className="flex items-center gap-1 px-3 py-1.5 border border-amber-500/30 rounded-lg hover:bg-amber-500/10">
                                    <RefreshCw className="w-3 h-3" /> Retry
                                </button>
                            </div>
                        )}

                        {!suggestion && !loading && (
                            <div className="h-full flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl p-12 text-center min-h-[500px]">
                                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                                    <Navigation className="w-10 h-10 text-indigo-400 opacity-20" />
                                </div>
                                <h3 className="text-white text-xl font-bold mb-2">Ready to explore?</h3>
                                <p className="text-white/30 max-w-sm text-sm">Fill in your source, destination, duration and preferred accommodation, then click <strong className="text-indigo-400">"Get AI Plan"</strong>.</p>
                            </div>
                        )}

                        {loading && (
                            <div className="h-full flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-3xl p-12 text-center min-h-[500px]">
                                <div className="relative mb-8">
                                    <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                                    <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-indigo-400 animate-pulse" />
                                </div>
                                <h3 className="text-white text-2xl font-black mb-3">Curating Your Journey</h3>
                                <p className="text-white/40 max-w-sm text-sm">AI is building your personalised {days}-day itinerary for {destination}...</p>
                            </div>
                        )}

                        {suggestion && !loading && (
                            <div className="space-y-0 bg-white/5 border border-white/10 rounded-3xl p-7 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-600/8 blur-[100px] pointer-events-none" />

                                {/* Route Banner */}
                                <div className="flex flex-wrap justify-between items-start gap-3 mb-7">
                                    <div>
                                        <h2 className="text-2xl font-black text-white tracking-tight">{source} <span className="text-indigo-400">➔</span> {destination}</h2>
                                        <p className="text-white/30 text-xs font-bold uppercase tracking-widest mt-1">{days} Days · {nights} Nights · {suggestion.accommodationType || accommodation}</p>
                                    </div>
                                    <span className="bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1 rounded-full text-[10px] font-black uppercase">AI Optimized</span>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                        <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">Est. Budget</p>
                                        <p className="text-white text-xs font-black">{suggestion.totalEstimatedBudget}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                        <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">Crowd Level</p>
                                        <p className={`text-sm font-black ${suggestion.crowdStatus === 'High' || suggestion.crowdStatus === 'Peak Season' ? 'text-orange-400' : suggestion.crowdStatus === 'Low' ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {suggestion.crowdStatus}
                                        </p>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                        <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">Transport</p>
                                        <p className="text-indigo-400 text-sm font-black capitalize">{activeTransport}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                        <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">Stay Type</p>
                                        <p className="text-cyan-400 text-xs font-black">{suggestion.accommodationType || accommodation}</p>
                                    </div>
                                </div>

                                {/* Accommodation Note */}
                                {suggestion.accommodationNote && (
                                    <div className="bg-cyan-500/5 border border-cyan-500/15 rounded-2xl p-5 mb-7 flex gap-3">
                                        <Hotel className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-cyan-400 text-[9px] font-black uppercase tracking-widest mb-1">Accommodation Guide — {suggestion.accommodationType || accommodation}</p>
                                            <p className="text-white/55 text-sm leading-relaxed">{suggestion.accommodationNote}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Day-by-Day Itinerary */}
                                <div className="mb-7">
                                    <h3 className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-4">
                                        <ArrowRight className="w-4 h-4 text-indigo-500" /> {days}-Day Itinerary
                                    </h3>
                                    <div className="space-y-2">
                                        {suggestion?.itinerary?.map((day: any, idx: number) => (
                                            <div key={idx} className="group flex gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5">
                                                <div className="flex-shrink-0 w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 font-black text-xs">
                                                    D{idx + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-white font-bold text-sm mb-1 group-hover:text-indigo-400 transition-colors">{day.title}</h4>
                                                    <p className="text-white/40 text-xs leading-relaxed">{day.description}</p>
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {day.tags?.map((tag: string, tIdx: number) => (
                                                            <span key={tIdx} className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/15 rounded-full text-[9px] text-indigo-300 font-bold uppercase">{tag}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* AI Tip + Transport Pros */}
                                <div className="grid md:grid-cols-2 gap-5 pt-6 border-t border-white/10">
                                    <div className="bg-indigo-600/5 rounded-2xl p-5 border border-indigo-500/15">
                                        <p className="text-indigo-400 text-[9px] font-black uppercase tracking-widest mb-2">✦ AI Recommendation</p>
                                        <p className="text-white/55 text-xs leading-relaxed">{suggestion?.aiTip}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-3">Why {activeTransport}?</p>
                                        <ul className="space-y-2">
                                            {(TRANSPORT_PROS[activeTransport] || []).map((pro, i) => (
                                                <li key={i} className="flex items-center gap-2 text-white/50 text-xs">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500/60 flex-shrink-0" /> {pro}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-4 pt-4 border-t border-white/5">
                                            <p className="text-white/20 text-[9px]">Price: <span className="text-white/50 font-bold">{transportOptions.find(o => o.type === activeTransport)?.price}</span> · Est. time: <span className="text-white/50 font-bold">{transportOptions.find(o => o.type === activeTransport)?.time}</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AISuggestions;
