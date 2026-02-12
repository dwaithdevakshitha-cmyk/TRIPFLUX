import React from 'react';
import { TourPackage } from '../types';

interface TourCardProps {
  tour: TourPackage;
  onSelect?: (tour: TourPackage) => void;
}

const TourCard: React.FC<TourCardProps> = ({ tour, onSelect }) => {
  return (
    <div className="flex flex-col items-center group cursor-pointer" onClick={() => onSelect?.(tour)}>
      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 shadow-sm border border-slate-100 group-hover:shadow-2xl transition-all duration-700">
        <img
          src={tour.image || `https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1776&auto=format&fit=crop`}
          alt={tour.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
        />
      </div>
      <div className="text-center px-2">
        <h3 className="text-[11px] font-extrabold text-[#0c2d3a] uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
          {tour.title}
        </h3>
      </div>
    </div>
  );
};

export default TourCard;
