
import React, { useState } from 'react';
import { User } from '../types';

interface SignupPageProps {
    onBack: () => void;
    onAuthSuccess: (user: User) => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onBack, onAuthSuccess }) => {
    const [loginType, setLoginType] = useState<'USER' | 'ASSOCIATE'>('USER');
    const [isRegistering, setIsRegistering] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [pan, setPan] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const endpoint = isRegistering ? '/api/register' : '/api/login';
        const role = loginType.toLowerCase();

        // Basic detection if the input is email or phone
        const isEmail = email.includes('@');
        const userEmail = isEmail ? email : `${email}@placeholder.com`; // DB needs unique email, we might need a better strategy here
        const userPhone = isEmail ? phone : email;

        const payload = isRegistering
            ? {
                firstName: loginType === 'ASSOCIATE' ? firstName : 'User',
                lastName: loginType === 'ASSOCIATE' ? lastName : '',
                email: userEmail,
                phone: userPhone,
                password,
                role,
                panNumber: loginType === 'ASSOCIATE' ? pan : 'NA',
                dateOfBirth: loginType === 'ASSOCIATE' ? dob : null
            }
            : { email: userEmail, password };

        try {
            const response = await fetch(`http://localhost:3001${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            const authUser: User = {
                id: data.user_id?.toString() || Math.random().toString(),
                name: data.first_name || data.email?.split('@')[0].toUpperCase(),
                email: data.email,
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop'
            };

            onAuthSuccess(authUser);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#0c2d3a] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>

            <div className="w-full max-w-xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl relative z-10">
                <div className="text-center mb-10">
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
                        {isRegistering ? 'CREATE ACCOUNT' : 'JOIN TRIPFLUX'}
                    </h2>
                    <p className="text-white/60 font-medium">Elevate your travel experience with AI</p>
                </div>

                {/* Sliding Toggle */}
                <div className="relative w-full bg-white/5 border border-white/10 p-1.5 rounded-2xl flex items-center mb-8 group">
                    <div
                        className={`absolute top-1.5 bottom-1.5 w-[calc(50%-3px)] bg-indigo-600 rounded-xl transition-all duration-500 ease-out shadow-lg shadow-indigo-600/20 ${loginType === 'ASSOCIATE' ? 'translate-x-[100%]' : 'translate-x-0'}`}
                    />
                    <button
                        onClick={() => setLoginType('USER')}
                        className={`relative flex-1 py-3.5 text-sm font-black tracking-widest uppercase transition-colors duration-300 z-10 ${loginType === 'USER' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                    >
                        User {isRegistering ? 'Signup' : 'Login'}
                    </button>
                    <button
                        onClick={() => setLoginType('ASSOCIATE')}
                        className={`relative flex-1 py-3.5 text-sm font-black tracking-widest uppercase transition-colors duration-300 z-10 ${loginType === 'ASSOCIATE' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                    >
                        Associates {isRegistering ? 'Signup' : 'Login'}
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm font-medium text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {isRegistering && loginType === 'ASSOCIATE' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">First Name</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="First Name"
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Last Name"
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="e.g. 9876543210"
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={dob}
                                        onChange={(e) => setDob(e.target.value)}
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:[color-scheme:dark] focus:outline-none focus:border-indigo-500 transition-all font-medium"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">PAN Card Number</label>
                                <input
                                    type="text"
                                    value={pan}
                                    onChange={(e) => setPan(e.target.value)}
                                    placeholder="e.g. ABCDE1234F"
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                                    required
                                />
                            </div>
                        </>
                    )}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Email / Phone Number</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. wanderer@flux.com or 9876543210"
                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                {isRegistering ? 'SIGN UP' : 'LOGIN'}
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </>
                        )}
                    </button>

                    <div className="text-center pt-4">
                        <button
                            type="button"
                            onClick={() => setIsRegistering(!isRegistering)}
                            className="text-white/40 hover:text-white/80 text-[11px] font-black uppercase tracking-widest transition-colors"
                        >
                            {isRegistering ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;
