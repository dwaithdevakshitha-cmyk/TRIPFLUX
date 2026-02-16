import React, { useState } from 'react';
import { storageService } from '../services/storageService';

interface SignUpProps {
    onBack: () => void;
    onSuccess: (user: any) => void;
}

const SignUp: React.FC<SignUpProps> = ({ onBack, onSuccess }) => {
    const [isSignIn, setIsSignIn] = useState(false);
    const [formData, setFormData] = useState({
        emailOrPhone: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.emailOrPhone || !formData.password) {
            setError('Please fill in all fields');
            return;
        }
        if (!isSignIn && !formData.confirmPassword) {
            setError('Please confirm your password');
            return;
        }
        if (!isSignIn && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const userData = {
            emailOrPhone: formData.emailOrPhone,
            password: formData.password,
            timestamp: new Date().toISOString()
        };

        // Encrypt and store customer data
        storageService.saveCustomer(userData);

        const mockUser = {
            id: Date.now().toString(),
            name: formData.emailOrPhone.split('@')[0],
            email: formData.emailOrPhone.includes('@') ? formData.emailOrPhone : formData.emailOrPhone + '@tripflux.ai',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop'
        };

        onSuccess(mockUser);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 bg-slate-50">
            <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95 duration-500 border border-slate-100">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-white">
                            <path d="M5 12h14m-7-7l7 7-7 7" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{isSignIn ? 'Sign In' : 'Sign Up'}</h2>
                    <p className="text-slate-500 font-medium mt-2">{isSignIn ? 'Welcome back to TripFlux' : 'Join the future of travel intelligence'}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email or Phone Number</label>
                        <input
                            type="text"
                            placeholder="e.g. alex@tripflux.ai"
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all font-bold text-slate-700"
                            value={formData.emailOrPhone}
                            onChange={(e) => setFormData({ ...formData, emailOrPhone: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all font-bold text-slate-700"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    {!isSignIn && (
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all font-bold text-slate-700"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                        </div>
                    )}

                    {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider text-center">{error}</p>}

                    <button
                        type="submit"
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] transition-all active:scale-95"
                    >
                        {isSignIn ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsSignIn(!isSignIn)}
                        className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline transition-colors"
                    >
                        {isSignIn ? "New to TripFlux? Create Account" : "Already have an account? Sign In"}
                    </button>
                </div>

                <div className="mt-8 text-center pt-6 border-t border-slate-50">
                    <button
                        onClick={onBack}
                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                    >
                        « Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
