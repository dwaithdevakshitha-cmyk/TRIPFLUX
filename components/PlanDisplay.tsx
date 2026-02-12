
import React from 'react';
import { TravelPlan, GroundingLink } from '../types';

interface PlanDisplayProps {
  plan: TravelPlan;
  heroImage: string;
  sources?: GroundingLink[];
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, heroImage, sources }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 space-y-12">
      <div className="relative h-[450px] md:h-[500px] rounded-[50px] overflow-hidden shadow-2xl mx-auto">
        <img src={heroImage || `https://picsum.photos/1200/600?random=${plan.destination}`} className="w-full h-full object-cover" alt={plan.destination} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex flex-col justify-end p-10 md:p-16">
          <span className="text-indigo-400 font-black uppercase tracking-[0.3em] text-xs mb-3">{plan.vibe}</span>
          <h1 className="text-5xl md:text-7xl text-white font-extrabold leading-tight mb-6 tracking-tighter">{plan.destination}</h1>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-2 text-white text-sm font-bold flex items-center gap-2">
              <span className="text-lg">🗓️</span> {plan.duration}
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-2 text-white text-sm font-bold flex items-center gap-2">
              <span className="text-lg">💰</span> {plan.estimatedBudget}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Daily Flow</h2>
            <div className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest">
              Live Plan
            </div>
          </div>
          
          <div className="space-y-12">
            {plan.itinerary.map((day) => (
              <div key={day.day} className="relative pl-10 border-l-2 border-indigo-100">
                <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-indigo-600 border-4 border-white shadow-lg"></div>
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-slate-900 leading-none">Day {day.day}</h3>
                  <p className="text-indigo-600 font-bold text-sm mt-1 uppercase tracking-widest">{day.title}</p>
                </div>
                <div className="grid gap-6">
                  {day.activities.map((activity, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl uppercase tracking-[0.1em]">{activity.time}</span>
                        {activity.location && (
                          <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {activity.location}
                          </div>
                        )}
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-xl mb-3 group-hover:text-indigo-600 transition-colors">{activity.activity}</h4>
                      <p className="text-slate-500 leading-relaxed font-medium text-sm">{activity.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sources Section */}
          {sources && sources.length > 0 && (
            <div className="mt-16 pt-10 border-t border-slate-100">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6">Research Sources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sources.map((source, idx) => (
                  <a 
                    key={idx} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-indigo-300 hover:bg-white transition-all group"
                  >
                    <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0 shadow-sm group-hover:text-indigo-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.828a4.493 4.493 0 013.333-1.333c1.11 0 2.113.404 2.872 1.074m3.273 3.273A4.494 4.494 0 0115.832 16h-.033m-2.144-6.144L15.656 8a4 4 0 115.656 5.656l-1.101 1.101m-.758-4.828a4.493 4.493 0 01-3.333 1.333c-1.11 0-2.113-.404-2.872-1.074" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-slate-600 line-clamp-1 group-hover:text-indigo-600">{source.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-10">
          <div className="bg-slate-900 p-10 rounded-[45px] text-white shadow-2xl sticky top-24 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <h3 className="text-2xl font-black mb-6 flex items-center gap-3 relative z-10">
              <span className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl">💡</span>
              Flux Intel
            </h3>
            <ul className="space-y-6 relative z-10">
              {plan.tips.map((tip, idx) => (
                <li key={idx} className="flex gap-4 text-sm font-medium text-slate-300 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2"></div>
                  {tip}
                </li>
              ))}
            </ul>
            <div className="mt-10 pt-10 border-t border-white/10 relative z-10">
              <button className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                OFFLINE SYNC
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDisplay;
