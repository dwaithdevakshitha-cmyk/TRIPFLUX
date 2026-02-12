
import React from 'react';
import { TravelTemplate } from '../types';

interface TemplateGalleryProps {
  onSelect: (template: TravelTemplate) => void;
}

const templates: TravelTemplate[] = [
  {
    id: 'tokyo-neon',
    title: 'Neon Dreams',
    subtitle: 'Tokyo Tech & Tradition',
    source: 'San Francisco',
    destination: 'Tokyo, Japan',
    duration: '1 week',
    interests: 'Ghibli Museum, Robot Cafe, Akihabara tech, high-end sushi, hidden shrines',
    image: 'https://images.unsplash.com/photo-1540959733332-e94e270b2d42?q=80&w=1770&auto=format&fit=crop',
    color: 'indigo'
  },
  {
    id: 'bali-nomad',
    title: 'Digital Zenith',
    subtitle: 'Bali Nomad Sanctuary',
    source: 'London',
    destination: 'Ubud, Bali',
    duration: 'Fortnight',
    interests: 'Co-working spaces, rice paddy hikes, yoga retreats, sunset beach clubs, digital nomad vibes',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1776&auto=format&fit=crop',
    color: 'emerald'
  },
  {
    id: 'paris-classic',
    title: 'Silk & Stone',
    subtitle: 'Parisian Heritage',
    source: 'New York',
    destination: 'Paris, France',
    duration: '3 days',
    interests: 'Art galleries, vintage boutiques, café culture, Seine river walks, hidden jazz clubs',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1773&auto=format&fit=crop',
    color: 'blue'
  },
  {
    id: 'iceland-fire',
    title: 'Frost & Fire',
    subtitle: 'Icelandic Frontier',
    source: 'Berlin',
    destination: 'Reykjavik, Iceland',
    duration: '5 days',
    interests: 'Northern lights, geothermal spas, black sand beaches, volcanic craters, road trip adventure',
    image: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=1859&auto=format&fit=crop',
    color: 'sky'
  }
];

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelect }) => {
  return (
    <div className="py-16">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div>
          <span className="text-indigo-600 font-black uppercase tracking-[0.3em] text-[10px] mb-2 block">One-Tap Adventures</span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Curated <span className="serif italic">Fluxes</span></h2>
          <p className="text-slate-500 font-medium mt-2">Start with a masterfully designed baseline.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {templates.map((template) => (
          <div 
            key={template.id}
            onClick={() => onSelect(template)}
            className="group relative h-[420px] rounded-[40px] overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
          >
            <img 
              src={template.image} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
              alt={template.title} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/10 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-start gap-2">
              <span className={`px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[9px] font-black uppercase tracking-widest text-white`}>
                {template.duration}
              </span>
              <h3 className="text-3xl font-black text-white leading-none tracking-tight">{template.title}</h3>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest">{template.subtitle}</p>
              
              <div className="mt-6 w-full h-px bg-white/10"></div>
              
              <div className="mt-4 flex items-center justify-between w-full">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Start Flux</span>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-900 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateGallery;
