
import React, { useState } from 'react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSocialAuth = (provider: string) => {
    setLoadingProvider(provider);
    
    // Simulate OAuth Popup and delay
    setTimeout(() => {
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: 'Alex Nomad',
        email: 'alex@tripflux.ai',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop'
      };
      
      onAuthSuccess(mockUser);
      setLoadingProvider(null);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-10">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {isSignUp ? 'Create Account' : 'Welcome to Flux'}
          </h2>
          <p className="text-slate-500 font-medium mt-2">
            {isSignUp ? 'Join the future of travel intelligence' : 'Sign in to save your itineraries'}
          </p>
        </div>

        <div className="space-y-4">
          <button 
            disabled={!!loadingProvider}
            onClick={() => handleSocialAuth('google')}
            className="w-full py-4 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-200 transition-all group active:scale-95 disabled:opacity-50"
          >
            {loadingProvider === 'google' ? (
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            )}
            <span className="font-bold text-slate-700">Continue with Google</span>
          </button>
          
          <button 
            disabled={!!loadingProvider}
            onClick={() => handleSocialAuth('facebook')}
            className="w-full py-4 bg-[#1877F2] text-white rounded-2xl flex items-center justify-center gap-3 hover:bg-[#166fe5] transition-all active:scale-95 shadow-lg shadow-blue-100 disabled:opacity-50"
          >
            {loadingProvider === 'facebook' ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            )}
            <span className="font-bold">Continue with Facebook</span>
          </button>
          
          <button 
            disabled={!!loadingProvider}
            onClick={() => handleSocialAuth('x')}
            className="w-full py-4 bg-black text-white rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-900 transition-all active:scale-95 shadow-lg shadow-slate-100 disabled:opacity-50"
          >
            {loadingProvider === 'x' ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            )}
            <span className="font-bold">Continue with X</span>
          </button>
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-sm font-bold text-slate-500">
            {isSignUp ? 'Already have an account?' : 'New to TripFlux?'}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-2 text-indigo-600 hover:underline cursor-pointer"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
          
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
            By continuing, you agree to TripFlux's <br />
            <a href="#" className="text-slate-500 underline hover:text-indigo-600">Terms of Service</a> and <a href="#" className="text-slate-500 underline hover:text-indigo-600">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
