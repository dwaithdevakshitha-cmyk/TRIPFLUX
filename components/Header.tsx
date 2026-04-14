
import React from 'react';
import { User } from '../types';

interface HeaderProps {
  onSignIn: () => void;
  onAdminClick: () => void;
  onAssociateLogin: () => void;
  user: User | null;
  onLogout: () => void;
  onViewChange: (view: 'HOME' | 'INTERNATIONAL' | 'DOMESTIC' | 'PILGRIMAGE' | 'ABOUT' | 'CONTACT' | 'SIGNUP' | 'AI_SUGGESTIONS') => void;
  currentView: 'HOME' | 'INTERNATIONAL' | 'DOMESTIC' | 'PILGRIMAGE' | 'ABOUT' | 'CONTACT' | 'SIGNUP' | 'AI_SUGGESTIONS';
  onGoToDashboard?: () => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ onSignIn, onAdminClick, onAssociateLogin, user, onLogout, onViewChange, currentView, onProfileClick, onGoToDashboard, isMenuOpen, setIsMenuOpen }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0c2d3a] border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
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
        </div>

        <nav className="hidden lg:flex items-center gap-1">
          <button onClick={() => onViewChange('HOME')} className={`px-4 py-2 rounded text-[11px] font-bold uppercase tracking-widest transition-all ${currentView === 'HOME' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/5'}`}>Home</button>
          <button onClick={() => onViewChange('PILGRIMAGE')} className={`px-4 py-2 rounded text-[11px] font-bold uppercase tracking-widest transition-all ${currentView === 'PILGRIMAGE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/5'}`}>Temple Specials</button>
          <button onClick={() => onViewChange('INTERNATIONAL')} className={`px-4 py-2 rounded text-[11px] font-bold uppercase tracking-widest transition-all ${currentView === 'INTERNATIONAL' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/5'}`}>International</button>
          <button onClick={() => onViewChange('DOMESTIC')} className={`px-4 py-2 rounded text-[11px] font-bold uppercase tracking-widest transition-all ${currentView === 'DOMESTIC' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/5'}`}>Domestic</button>
          <button onClick={() => onViewChange('ABOUT')} className={`px-4 py-2 rounded text-[11px] font-bold uppercase tracking-widest transition-all ${currentView === 'ABOUT' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/5'}`}>About Us</button>
          <button onClick={() => onViewChange('CONTACT')} className={`px-4 py-2 rounded text-[11px] font-bold uppercase tracking-widest transition-all ${currentView === 'CONTACT' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/5'}`}>Contact Us</button>
          <button onClick={() => onViewChange('AI_SUGGESTIONS')} className={`px-4 py-2 rounded text-[11px] font-bold uppercase tracking-widest transition-all ${currentView === 'AI_SUGGESTIONS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/100 hover:text-white hover:bg-white/10 flex items-center gap-1.5 border border-indigo-500/30'}`}>
            <svg className="w-3 h-3 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L14.85 8.65L22 9.24L16.5 13.97L18.18 21L12 17.27L5.82 21L7.5 13.97L2 9.24L9.15 8.65L12 2Z" />
            </svg>
            AI Suggestions
          </button>
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

      {/* Mobile Menu Drawer */}
      <div className={`
        fixed inset-y-0 left-0 z-[100] w-72 bg-[#0c2d3a] shadow-2xl transition-transform duration-300 ease-in-out lg:hidden
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <span className="text-lg font-black text-white italic">TRIPFLUX</span>
          <button onClick={() => setIsMenuOpen(false)} className="p-2 text-white/60 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 flex flex-col gap-2">
          {[
            { id: 'HOME', label: 'Home' },
            { id: 'PILGRIMAGE', label: 'Temple Specials' },
            { id: 'INTERNATIONAL', label: 'International' },
            { id: 'DOMESTIC', label: 'Domestic' },
            { id: 'ABOUT', label: 'About Us' },
            { id: 'CONTACT', label: 'Contact Us' },
            { id: 'AI_SUGGESTIONS', label: 'AI Suggestions ✨' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id as any);
                setIsMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${currentView === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              {item.label}
            </button>
          ))}

          <div className="mt-8 pt-8 border-t border-white/10 space-y-4 px-4">
            {user ? (
              <div className="flex items-center gap-4 py-2 border-b border-white/5 pb-6">
                <div className="w-12 h-12 rounded-full border border-white/20 overflow-hidden">
                  <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-white text-xs font-black uppercase tracking-wider">{user.name}</p>
                  <button onClick={onLogout} className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mt-1">Logout</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { onSignIn(); setIsMenuOpen(false); }}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all shadow-lg"
              >
                SIGN UP
              </button>
            )}

            {user?.role === 'admin' && (
              <button
                onClick={() => { onGoToDashboard?.(); setIsMenuOpen(false); }}
                className="w-full py-4 border border-indigo-500 text-indigo-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-500/10 transition-all"
              >
                Admin Dashboard
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
