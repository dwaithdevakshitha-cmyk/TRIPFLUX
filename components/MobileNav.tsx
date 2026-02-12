
import React from 'react';

interface MobileNavProps {
  onAdminClick?: () => void;
  onHome?: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ onAdminClick, onHome }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-[#0c2d3a]/95 backdrop-blur-xl border-t border-white/5 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
      <div className="flex justify-around items-center h-14">
        <button 
          onClick={onHome}
          className="flex flex-col items-center justify-center gap-1 w-full text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[8px] font-black uppercase tracking-widest">Home</span>
        </button>
        <button 
          onClick={onAdminClick}
          className="flex flex-col items-center justify-center gap-1 w-full text-white/40 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-[8px] font-black uppercase tracking-widest">Admin</span>
        </button>
      </div>
    </div>
  );
};

export default MobileNav;
