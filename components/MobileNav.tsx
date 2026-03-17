
import React from 'react';

interface MobileNavProps {
  onAdminClick?: () => void;
  onHome?: () => void;
  onViewChange?: (view: string) => void;
  currentView?: string;
}

const MobileNav: React.FC<MobileNavProps> = ({ onAdminClick, onHome, onViewChange, currentView }) => {
  const navItems = [
    {
      id: 'HOME',
      label: 'Home',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      ),
      action: () => onHome?.(),
    },
    {
      id: 'PILGRIMAGE',
      label: 'Temple',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      ),
      action: () => onViewChange?.('PILGRIMAGE'),
    },
    {
      id: 'INTERNATIONAL',
      label: 'Intl',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2.25 2.25 0 012.25-2.25h.741M3.947 17.028A9 9 0 1118.027 4.906" />
      ),
      action: () => onViewChange?.('INTERNATIONAL'),
    },
    {
      id: 'DOMESTIC',
      label: 'Domestic',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      ),
      action: () => onViewChange?.('DOMESTIC'),
    },
    {
      id: 'CONTACT',
      label: 'Contact',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      ),
      action: () => onViewChange?.('CONTACT'),
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-[#0c2d3a]/97 backdrop-blur-xl border-t border-white/10 pb-safe shadow-[0_-4px_30px_rgba(0,0,0,0.3)]">
      <div className="flex justify-around items-stretch h-14 px-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 rounded-xl mx-0.5 my-1 ${
                isActive
                  ? 'text-indigo-400 bg-white/5'
                  : 'text-white/40 hover:text-white/70 active:bg-white/5'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {item.icon}
              </svg>
              <span className={`text-[8px] font-black uppercase tracking-wider leading-none ${isActive ? 'text-indigo-400' : 'text-white/40'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-4 h-0.5 bg-indigo-500 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;
