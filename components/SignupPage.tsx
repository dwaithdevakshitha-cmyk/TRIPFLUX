import React, { useState } from 'react';
import { User } from '../types';
import { storageService } from '../services/storageService';

interface SignupPageProps {
    onBack: () => void;
    onAuthSuccess: (user: User) => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onBack, onAuthSuccess }) => {
    const [loginType, setLoginType] = useState<'USER' | 'ASSOCIATE'>('USER');
    const [isRegistering, setIsRegistering] = useState(() => {
        return new URLSearchParams(window.location.search).has('ref');
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');

    const validateEmail = (email: string) => {
        const emailRegex = /^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;
        if (!email) return 'Email is required';
        if (email.includes(' ')) return 'Spaces are not allowed in email';
        if (!email.includes('@')) return 'Email must contain @ symbol';
        if (!emailRegex.test(email)) {
            const [username] = email.split('@');
            if (username.startsWith('.') || username.endsWith('.')) return 'Username cannot start or end with a dot';
            return 'Invalid email format (username@domain.com)';
        }
        return '';
    };

    const validatePhone = (phone: string) => {
        if (!phone) return 'Phone number is required';
        if (!/^\d+$/.test(phone)) return 'Only numbers (0-9) are allowed';
        if (phone.length !== 10) return 'Phone number must be exactly 10 digits';
        if (!/^[6-9]/.test(phone)) return 'Number must start with 6, 7, 8, or 9';
        return '';
    };

    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [panNumber, setPanNumber] = useState('');
    const [panError, setPanError] = useState('');
    const [selectedRole, setSelectedRole] = useState<'admin' | 'associate'>('associate');
    const [referralCode, setReferralCode] = useState(() => {
        return new URLSearchParams(window.location.search).get('ref') || '';
    });
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const endpoint = isRegistering ? '/api/register' : '/api/login';
        const role = loginType === 'ASSOCIATE' ? selectedRole : loginType.toLowerCase();

        // Detection: If it contains letters or @, treat as email attempt
        const isEmail = email.includes('@') || /[a-z]/i.test(email);

        if (isEmail && isRegistering) {
            const emailErr = validateEmail(email);
            if (emailErr) {
                setError(emailErr);
                setIsLoading(false);
                return;
            }
        }

        const userEmail = isEmail ? email : `${email}@placeholder.com`;
        const userPhone = isEmail ? phone : email;

        if (isRegistering) {
            const phoneToCheck = loginType === 'ASSOCIATE' ? phone : userPhone;
            const phoneErr = validatePhone(phoneToCheck);

            if (loginType === 'ASSOCIATE' || !isEmail) {
                if (phoneErr) {
                    setError(phoneErr);
                    setIsLoading(false);
                    return;
                }
            }

            if (loginType === 'ASSOCIATE') {
                if (!dob) {
                    setError('Date of birth is required.');
                    setIsLoading(false);
                    return;
                }
                const birthDate = new Date(dob);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                if (age < 18) {
                    setError('You must be at least 18 years old to register.');
                    setIsLoading(false);
                    return;
                }
            }
        }

        const payload = isRegistering
            ? {
                firstName: firstName || (loginType === 'USER' ? 'User' : ''),
                lastName: lastName || '',
                email: userEmail,
                phone: userPhone,
                password,
                role,
                dateOfBirth: loginType === 'ASSOCIATE' ? dob : null,
                panNumber: loginType === 'ASSOCIATE' ? panNumber : null,
                referralCode
            }
            : { email: userEmail, password };

        try {
            let authUser: User | null = null;
            let errorMessage = '';

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();

                if (!response.ok) {
                    const apiError = typeof data.error === 'string' ? data.error : JSON.stringify(data.error || 'Something went wrong');
                    throw new Error(apiError);
                }

                authUser = {
                    id: data.user_id?.toString() || '',
                    name: data.first_name || data.email?.split('@')[0].toUpperCase(),
                    email: data.email,
                    avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop',
                    role: data.role,
                    promoCode: data.promo_code
                };

                // Ensure we always have a valid numeric DB user_id
                if (!data.user_id && data.email) {
                    try {
                        const lookup = await fetch(`/api/users/by-email/${encodeURIComponent(data.email)}`);
                        if (lookup.ok) {
                            const dbUser = await lookup.json();
                            if (dbUser.user_id) authUser.id = dbUser.user_id.toString();
                        }
                    } catch (_) { /* ignore */ }
                }
            } catch (err: any) {
                console.error("Authentication failed:", err);
                errorMessage = err.message || "Connection refused. Please check your internet or try again later.";
            }

            if (authUser) {
                onAuthSuccess(authUser);
            } else if (errorMessage) {
                setError(errorMessage);
            }

        } catch (err: any) {
            console.error("Auth error:", err);
            const errMsg = err?.message || err?.error || err;
            setError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
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
                        className={`relative flex-1 py-3.5 text-xs font-black tracking-widest uppercase transition-colors duration-300 z-10 ${loginType === 'ASSOCIATE' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                    >
                        Admin/Associate {isRegistering ? 'Signup' : 'Login'}
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm font-medium text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {isRegistering && (
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
                        </>
                    )}

                    {isRegistering && loginType === 'ASSOCIATE' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                                    <input
                                        type="text"
                                        maxLength={10}
                                        pattern="\d{10}"
                                        value={phone}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setPhone(val);
                                            setPhoneError(validatePhone(val));
                                        }}
                                        placeholder="e.g. 9876543210"
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                                        required
                                    />
                                    {phoneError && <p className="text-red-400 text-[9px] font-bold mt-1 ml-1 uppercase">{phoneError}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                                        value={dob}
                                        onChange={(e) => setDob(e.target.value)}
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:[color-scheme:dark] focus:outline-none focus:border-indigo-500 transition-all font-medium"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">PAN Card Number</label>
                                    <input
                                        type="text"
                                        value={panNumber}
                                        onChange={(e) => {
                                            // Enforce: first 5 alpha, next 4 numeric, last 1 alpha
                                            const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                            let built = '';
                                            for (let i = 0; i < raw.length && i < 10; i++) {
                                                const ch = raw[i];
                                                if (i < 5) built += /[A-Z]/.test(ch) ? ch : '';
                                                else if (i < 9) built += /[0-9]/.test(ch) ? ch : '';
                                                else built += /[A-Z]/.test(ch) ? ch : '';
                                            }
                                            setPanNumber(built);
                                            if (built.length === 10) {
                                                const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
                                                setPanError(panRegex.test(built) ? '' : 'Invalid PAN format (e.g. ABCDE1234F)');
                                            } else {
                                                setPanError('');
                                            }
                                        }}
                                        placeholder="ABCDE1234F"
                                        maxLength={10}
                                        className={`w-full px-6 py-4 bg-white/5 border rounded-2xl text-white placeholder:text-white/20 focus:outline-none transition-all font-mono font-bold tracking-widest ${panError ? 'border-red-500 focus:border-red-500' :
                                            panNumber.length === 10 ? 'border-emerald-500 focus:border-emerald-500' :
                                                'border-white/10 focus:border-indigo-500'
                                            }`}
                                        required
                                    />
                                    {panError && <p className="text-red-400 text-[10px] font-bold mt-1 ml-1">{panError}</p>}
                                    {!panError && panNumber.length === 10 && <p className="text-emerald-400 text-[10px] font-bold mt-1 ml-1">✓ Valid PAN format</p>}
                                    {!panError && panNumber.length > 0 && panNumber.length < 10 && (
                                        <p className="text-white/30 text-[10px] mt-1 ml-1">
                                            {panNumber.length < 5 ? `${5 - panNumber.length} more alphabets` :
                                                panNumber.length < 9 ? `${9 - panNumber.length} more digits` :
                                                    '1 more alphabet'}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Role</label>
                                    <select
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'associate')}
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-indigo-500 transition-all font-medium appearance-none"
                                    >
                                        <option value="associate" className="bg-slate-900">Associate</option>
                                        <option value="admin" className="bg-slate-900">Admin</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    {isRegistering && (
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Referral / Promo Code (Optional)</label>
                            <input
                                type="text"
                                value={referralCode}
                                onChange={(e) => setReferralCode(e.target.value)}
                                placeholder="e.g. ASC123456"
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">
                            {isRegistering ? 'Email / Phone Number' : 'Email'}
                        </label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => {
                                let val = e.target.value.toLowerCase();
                                // If input is numeric-only, cap at 10 digits
                                if (/^\d+$/.test(val)) {
                                    val = val.slice(0, 10);
                                }
                                setEmail(val);
                                if (isRegistering) {
                                    // If it contains letters or @, treat it as email for real-time validation
                                    if (/[a-z@.]/.test(val)) {
                                        setEmailError(validateEmail(val));
                                        setPhoneError('');
                                    } else if (val.length > 0) {
                                        setPhoneError(validatePhone(val));
                                        setEmailError('');
                                    } else {
                                        setEmailError('');
                                        setPhoneError('');
                                    }
                                }
                            }}
                            placeholder={isRegistering && loginType === 'USER' ? "e.g. wanderer@flux.com or 9876543210" : "e.g. wanderer@flux.com"}
                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                            required
                        />
                        {emailError && <p className="text-red-400 text-[10px] font-bold mt-1 ml-1 uppercase">{emailError}</p>}
                        {phoneError && <p className="text-red-400 text-[10px] font-bold mt-1 ml-1 uppercase">{phoneError}</p>}
                        {!emailError && !phoneError && isRegistering && loginType === 'USER' && (
                            <p className="text-white/20 text-[9px] mt-1 ml-1 uppercase italic font-bold">Registration via Email or 10-digit Phone</p>
                        )}
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
