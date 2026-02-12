
import React, { useState, useEffect } from 'react';

interface TravelFormProps {
  onPlan: (source: string, dest: string, duration: string, interests: string) => void;
  isLoading: boolean;
  initialData?: {
    source: string;
    dest: string;
    duration: string;
    interests: string;
  };
}

const TravelForm: React.FC<TravelFormProps> = ({ onPlan, isLoading, initialData }) => {
  const [source, setSource] = useState('');
  const [dest, setDest] = useState('');
  const [duration, setDuration] = useState('3 days');
  const [interests, setInterests] = useState('');

  useEffect(() => {
    if (initialData) {
      setSource(initialData.source);
      setDest(initialData.dest);
      setDuration(initialData.duration);
      setInterests(initialData.interests);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (source && dest && interests) {
      onPlan(source, dest, duration, interests);
    }
  };

  return (
    <div id="planner-form" className="bg-white p-8 rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-100 max-w-2xl mx-auto -mt-20 relative z-10">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Source (Origin)</label>
            <input 
              type="text" 
              placeholder="e.g. London, UK"
              className="px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-slate-800 font-semibold placeholder:text-slate-300"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Destination</label>
            <input 
              type="text" 
              placeholder="e.g. Tokyo, Japan"
              className="px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-slate-800 font-semibold placeholder:text-slate-300"
              value={dest}
              onChange={(e) => setDest(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Duration</label>
            <select 
              className="px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-slate-800 font-semibold appearance-none"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option>Weekend</option>
              <option>3 days</option>
              <option>5 days</option>
              <option>1 week</option>
              <option>Fortnight</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Your Vibe</label>
            <input 
              type="text" 
              placeholder="Ghibli spots, local food..."
              className="px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-slate-800 font-semibold placeholder:text-slate-300"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              required
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full py-5 bg-indigo-600 text-white font-black text-lg rounded-2xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-indigo-100"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              FLUXING ITINERARY...
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              GENERATE FLOW
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TravelForm;
