
import React from 'react';
import { User } from '../types';

interface HeaderProps {
  onSignIn: () => void;
  onAdminClick: () => void;
  onAssociateLogin: () => void;
  user: User | null;
  onLogout: () => void;
  onViewChange: (view: 'HOME' | 'INTERNATIONAL' | 'DOMESTIC' | 'PILGRIMAGE' | 'ABOUT' | 'CONTACT' | 'SIGNUP') => void;
  currentView: 'HOME' | 'INTERNATIONAL' | 'DOMESTIC' | 'PILGRIMAGE' | 'ABOUT' | 'CONTACT' | 'SIGNUP';
  onProfileClick?: () => void;
  onGoToDashboard?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSignIn, onAdminClick, onAssociateLogin, user, onLogout, onViewChange, currentView, onProfileClick, onGoToDashboard }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0c2d3a] border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewChange('HOME')}>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2.25 2.25 0 012.25-2.25h.741M3.947 17.028A9 9 0 1118.027 4.906" />
              </svg>
            </div>
            <span className="text-base md:text-lg font-extrabold tracking-tight text-white uppercase leading-tight">
              TRIPFLUX <br className="hidden md:block" /> <span className="text-[10px] opacity-70 tracking-[0.2em] font-bold">TOURS AND TRAVELS</span>
            </span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1">
          <button onClick={() => onViewChange('HOME')} className={`px-4 py-2 rounded text-[11px] font-bold uppercase tracking-widest transition-all ${currentView === 'HOME' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/5'}`}>Home</button>
          <button onClick={() => onViewChange('PILGRIMAGE')} className={`px-4 py-2 rounded text-[11px] font-bold uppercase tracking-widest transition-all ${currentView === 'PILGRIMAGE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/5'}`}>Temple Specials</button>
          <button onClick={() => onViewChange('INTERNATIONAL')} className={`px-4 py-2 rounded text-[11px] font-bold uppercase tracking-widest transition-all ${currentView === 'INTERNATIONAL' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/5'}`}>International</button>
          <button onClick={() => onViewChange('DOMESTIC')} className={`px-4 py-2 rounded text-[11px] font-bold uppercase tracking-widest transition-all ${currentView === 'DOMESTIC' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/5'}`}>Domestic</button>
          <button onClick={() => onViewChange('ABOUT')} className={`px-4 py-2 rounded text-[11px] font-bold uppercase tracking-widest transition-all ${currentView === 'ABOUT' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/5'}`}>About Us</button>
          <button onClick={() => onViewChange('CONTACT')} className={`px-4 py-2 rounded text-[11px] font-bold uppercase tracking-widest transition-all ${currentView === 'CONTACT' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/5'}`}>Contact Us</button>
        </nav>

        <div className="flex items-center gap-5">
          {user?.role === 'admin' && (
            <button onClick={onGoToDashboard} className="px-5 py-2 border border-indigo-500 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded hover:bg-indigo-500/10 transition-colors shadow-lg">
              Dashboard
            </button>
          )}
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end hidden sm:flex cursor-pointer" onClick={onProfileClick}>
                <span className="text-white text-[10px] font-black tracking-widest uppercase hover:text-indigo-400 transition-colors">{user.name}</span>
                <button onClick={(e) => { e.stopPropagation(); onLogout(); }} className="text-indigo-400 text-[9px] font-bold hover:text-indigo-300 tracking-widest uppercase mt-0.5">Logout</button>
              </div>
              <div onClick={onProfileClick} className="w-10 h-10 rounded-full border border-white/20 overflow-hidden shadow-lg shadow-black/20 cursor-pointer hover:border-indigo-500 transition-colors">
                <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`} alt={user.name} className="w-full h-full object-cover" />
              </div>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="px-6 py-2.5 bg-indigo-600 border border-indigo-500 shadow-lg shadow-indigo-600/20 text-white text-[11px] font-black uppercase tracking-widest rounded hover:bg-indigo-500 transition-all active:scale-95"
            >
              SIGN UP
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
