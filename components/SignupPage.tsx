
import React, { useState } from 'react';
import { User } from '../types';

interface SignupPageProps {
    onBack: () => void;
    onAuthSuccess: (user: User) => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onBack, onAuthSuccess }) => {
    const [loginType, setLoginType] = useState<'USER' | 'ASSOCIATE'>('USER');
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulated login
        setTimeout(() => {
            const displayName = email.split('@')[0].toUpperCase();
            const mockUser: User = {
                id: Math.random().toString(36).substr(2, 9),
                name: displayName,
                email: email,
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop'
            };
            onAuthSuccess(mockUser);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#0c2d3a] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>

            <div className="w-full max-w-xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl relative z-10">
                <div className="text-center mb-10">
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
                        JOIN <span className="text-indigo-400">TRIPFLUX</span>
                    </h2>
                    <p className="text-white/60 font-medium">Elevate your travel experience with AI</p>
                </div>

                {/* Sliding Toggle */}
                <div className="relative w-full bg-white/5 border border-white/10 p-1.5 rounded-2xl flex items-center mb-10 group">
                    <div
                        className={`absolute top-1.5 bottom-1.5 w-[calc(50%-3px)] bg-indigo-600 rounded-xl transition-all duration-500 ease-out shadow-lg shadow-indigo-600/20 ${loginType === 'ASSOCIATE' ? 'translate-x-[100%]' : 'translate-x-0'}`}
                    />
                    <button
                        onClick={() => setLoginType('USER')}
                        className={`relative flex-1 py-3.5 text-sm font-black tracking-widest uppercase transition-colors duration-300 z-10 ${loginType === 'USER' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                    >
                        User Login
                    </button>
                    <button
                        onClick={() => setLoginType('ASSOCIATE')}
                        className={`relative flex-1 py-3.5 text-sm font-black tracking-widest uppercase transition-colors duration-300 z-10 ${loginType === 'ASSOCIATE' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                    >
                        Associates Login
                    </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {loginType === 'ASSOCIATE' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">First Name</label>
                                    <input
                                        type="text"
                                        placeholder="First Name"
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Last Name</label>
                                    <input
                                        type="text"
                                        placeholder="Last Name"
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Date of Birth</label>
                                <input
                                    type="date"
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:[color-scheme:dark] focus:outline-none focus:border-indigo-500 transition-all font-medium"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">PAN Card Number</label>
                                <input
                                    type="text"
                                    placeholder="e.g. ABCDE1234F"
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                                    required
                                />
                            </div>
                        </>
                    )}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. wanderer@flux.com"
                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                LOGIN
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;
