import React, { useState } from 'react';
import { storageService } from '../services/storageService';

interface SignUpProps {
    onBack: () => void;
    onSuccess: (user: any) => void;
}

const SignUp: React.FC<SignUpProps> = ({ onBack, onSuccess }) => {
    const [isSignIn, setIsSignIn] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        dateOfBirth: '',
        role: 'user',
        promoCode: '',
        emailOrPhone: '',
        password: '',
        confirmPassword: ''
    });
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
            return 'Invalid email format (e.g. username@domain.com)';
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.emailOrPhone || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        if (!isSignIn) {
            if (!formData.firstName || !formData.lastName || !formData.phoneNumber || !formData.dateOfBirth) {
                setError('Please fill in all fields');
                return;
            }

            if (!formData.confirmPassword) {
                setError('Please confirm your password');
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return;
            }

            const phoneRegex = /^\d{10}$/;
            const phoneErr = validatePhone(formData.phoneNumber);
            if (phoneErr) {
                setError(phoneErr);
                return;
            }

            const emailErr = validateEmail(formData.emailOrPhone);
            if (emailErr) {
                setError(emailErr);
                return;
            }

            const birthDate = new Date(formData.dateOfBirth);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            if (age < 18) {
                setError('You must be at least 18 years old to register.');
                return;
            }

            try {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.emailOrPhone,
                        phone: formData.phoneNumber,
                        password: formData.password,
                        role: formData.role,
                        dateOfBirth: formData.dateOfBirth,
                        referralCode: formData.promoCode
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    onSuccess({
                        id: data.user_id,
                        name: `${data.first_name} ${data.last_name || ''}`.trim(),
                        email: data.email,
                        role: data.role,
                        promoCode: data.associate_id || data.custom_user_id,
                        avatar: data.avatar || `https://ui-avatars.com/api/?name=${data.first_name}&background=6366f1&color=fff`
                    });
                } else {
                    const errData = await res.json();
                    setError(errData.error || 'Failed to register.');
                }
            } catch (err) {
                console.error("Signup Error:", err);
                setError('An error occurred during registration.');
            }
            return;
        }

        if (isSignIn) {
            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: formData.emailOrPhone,
                        password: formData.password
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    onSuccess({
                        id: data.user_id?.toString() || '',
                        name: data.first_name || data.email?.split('@')[0].toUpperCase(),
                        email: data.email,
                        role: data.role,
                        promoCode: data.promo_code,
                        avatar: data.avatar || `https://ui-avatars.com/api/?name=${data.first_name}&background=6366f1&color=fff`
                    });
                } else {
                    const errData = await res.json();
                    setError(errData.error || 'Invalid email or password');
                }
            } catch (err) {
                console.error("Login Error:", err);
                setError('Connection error. Please try again.');
            }
        }
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

                <div className="flex bg-slate-100 p-1 mb-8 rounded-2xl relative">
                    <button
                        className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${!isSignIn ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                        onClick={() => setIsSignIn(false)}
                    >
                        User Signup
                    </button>
                    <button
                        className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${isSignIn ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                        onClick={() => setIsSignIn(true)}
                    >
                        Admin/Associate Signup
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isSignIn && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">First Name</label>
                                    <input
                                        type="text"
                                        placeholder="First Name"
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all font-bold text-slate-700"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Last Name</label>
                                    <input
                                        type="text"
                                        placeholder="Last Name"
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all font-bold text-slate-700"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                                    <input
                                        type="text"
                                        maxLength={10}
                                        pattern="\d{10}"
                                        placeholder="10 digit number"
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all font-bold text-slate-700"
                                        value={formData.phoneNumber}
                                        onChange={(e) => {
                                            let val = e.target.value.replace(/\D/g, '');
                                            if (val.length > 10) val = val.slice(0, 10);
                                            setFormData({ ...formData, phoneNumber: val });
                                            setPhoneError(validatePhone(val));
                                        }}
                                        required
                                    />
                                    {phoneError && <p className="text-red-500 text-[9px] font-bold mt-1 ml-1 uppercase">{phoneError}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all font-bold text-slate-700"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Role</label>
                                <select
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all font-bold text-slate-700 appearance-none"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="user">User</option>
                                    <option value="associate">Associate</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Referral / Promo Code (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. ASC123456"
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all font-bold text-slate-700"
                                    value={formData.promoCode}
                                    onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{isSignIn ? 'Email or Phone Number' : 'Email'}</label>
                        <input
                            type="text"
                            placeholder={isSignIn ? "e.g. alex@tripflux.ai" : "e.g. email@example.com"}
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all font-bold text-slate-700"
                            value={formData.emailOrPhone}
                            onChange={(e) => {
                                let val = e.target.value.toLowerCase();
                                // If input is numeric-only, cap at 10 digits
                                if (/^\d+$/.test(val)) {
                                    val = val.slice(0, 10);
                                }
                                setFormData({ ...formData, emailOrPhone: val });
                                if (!isSignIn) setEmailError(validateEmail(val));
                            }}
                        />
                        {!isSignIn && emailError && <p className="text-red-500 text-[9px] font-bold mt-1 ml-1 uppercase">{emailError}</p>}
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
                    {/* Replaced logic since we use internal tabs now, kept for fallback visual spacing if desired */}
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
