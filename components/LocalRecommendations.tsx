
import React, { useState, useEffect } from 'react';
import { getLocalRecommendations } from '../services/geminiService';
import { GroundingLink } from '../types';

interface LocalRecommendationsProps {
  destination: string;
}

const LocalRecommendations: React.FC<LocalRecommendationsProps> = ({ destination }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ text: string, links: GroundingLink[] } | null>(null);
  const [activeType, setActiveType] = useState('restaurants');

  const fetchRecs = async (type: string) => {
    setLoading(true);
    try {
      const result = await getLocalRecommendations(destination, type);
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs('restaurants');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination]);

  return (
    <section className="bg-white border-y border-slate-100 py-16">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Live Insights from Google Maps</h2>
        <p className="text-slate-500 mb-8">Up-to-date recommendations powered by AI grounding.</p>
        
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {['restaurants', 'coffee shops', 'museums', 'shopping', 'parks'].map(type => (
            <button
              key={type}
              onClick={() => { setActiveType(type); fetchRecs(type); }}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                activeType === type 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            <div className="h-40 bg-slate-100 rounded-2xl"></div>
            <div className="h-40 bg-slate-100 rounded-2xl"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="prose prose-slate max-w-none text-slate-600">
               {data?.text.split('\n').map((para, i) => (
                 <p key={i} className="mb-2">{para}</p>
               ))}
            </div>
            
            {data?.links && data.links.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.links.map((link, idx) => (
                  <a 
                    key={idx} 
                    href={link.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl shadow-sm">📍</div>
                      <span className="font-bold text-slate-800 group-hover:text-indigo-600">{link.title}</span>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default LocalRecommendations;
