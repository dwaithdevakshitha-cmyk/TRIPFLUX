import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { storageService } from '../services/storageService';

interface ProfileDashboardProps {
    user: User;
    onClose: () => void;
    onSignOut: () => void;
    onAccountUpdate?: (user: User) => void;
}

const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ user, onClose, onSignOut, onAccountUpdate }) => {
    const [showPromo, setShowPromo] = useState(false);
    const [showReferrals, setShowReferrals] = useState(false);
    const [showBookings, setShowBookings] = useState(false);
    const [showAccount, setShowAccount] = useState(false);
    const [isSavingAccount, setIsSavingAccount] = useState(false);
    const [accountDetails, setAccountDetails] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        avatar: ''
    });
    const [referrals, setReferrals] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [bookingPassengers, setBookingPassengers] = useState<Record<number, any[]>>({});
    const [expandedBookingId, setExpandedBookingId] = useState<number | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    const toggleBookingPassengers = async (bookingId: number) => {
        if (expandedBookingId === bookingId) {
            setExpandedBookingId(null);
            return;
        }
        setExpandedBookingId(bookingId);
        if (!bookingPassengers[bookingId]) {
            try {
                const res = await fetch(`http://localhost:3001/api/bookings/${bookingId}/passengers`);
                if (res.ok) {
                    const data = await res.json();
                    setBookingPassengers(prev => ({ ...prev, [bookingId]: data }));
                }
            } catch (err) {
                console.warn('Failed to fetch passengers for booking', bookingId);
            }
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            setIsUploadingAvatar(true);
            try {
                const res = await fetch(`http://localhost:3001/api/users/${user.id}/avatar`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ avatar: base64String })
                });

                if (res.ok) {
                    const updatedData = await res.json();
                    setAccountDetails(prev => ({ ...prev, avatar: updatedData.avatar }));
                    if (onAccountUpdate) {
                        onAccountUpdate({ ...user, avatar: updatedData.avatar });
                    }
                } else {
                    console.warn('Backend avatar update failed, falling back to local state.');
                    setAccountDetails(prev => ({ ...prev, avatar: base64String }));
                    storageService.updateCustomer(user.email, { avatar: base64String });
                    if (onAccountUpdate) {
                        onAccountUpdate({ ...user, avatar: base64String });
                    }
                }
            } catch (err) {
                console.warn("Avatar upload network error, falling back to local state:", err);
                setAccountDetails(prev => ({ ...prev, avatar: base64String }));
                storageService.updateCustomer(user.email, { avatar: base64String });
                if (onAccountUpdate) {
                    onAccountUpdate({ ...user, avatar: base64String });
                }
            } finally {
                setIsUploadingAvatar(false);
            }
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        if (showAccount && user.id) {
            fetch(`http://127.0.0.1:3001/api/users/${user.id}`)
                .then(res => res.json())
                .then(data => {
                    setAccountDetails(data);
                })
                .catch(err => console.error("Error fetching user:", err));
        }
    }, [showAccount, user.id]);

    const handleAccountSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingAccount(true);
        try {
            const res = await fetch(`http://localhost:3001/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(accountDetails)
            });
            if (res.ok) {
                const updatedData = await res.json();
                alert('Profile updated successfully!');
                if (onAccountUpdate) {
                    onAccountUpdate({
                        ...user,
                        name: `${updatedData.user.first_name} ${updatedData.user.last_name}`,
                        avatar: updatedData.user.avatar
                    });
                }
            } else {
                console.warn('Failed to update profile via backend. Updating locally.');
                storageService.updateCustomer(user.email, {
                    firstName: accountDetails.first_name,
                    lastName: accountDetails.last_name,
                    password: accountDetails.password,
                    phone: accountDetails.phone
                });
                alert('Profile updated locally!');
                if (onAccountUpdate) {
                    onAccountUpdate({
                        ...user,
                        name: `${accountDetails.first_name} ${accountDetails.last_name}`,
                    });
                }
            }
        } catch (error) {
            console.warn('Network error during update, updating locally:', error);
            storageService.updateCustomer(user.email, {
                firstName: accountDetails.first_name,
                lastName: accountDetails.last_name,
                password: accountDetails.password,
                phone: accountDetails.phone
            });
            alert('Profile updated locally!');
            if (onAccountUpdate) {
                onAccountUpdate({
                    ...user,
                    name: `${accountDetails.first_name} ${accountDetails.last_name}`,
                });
            }
        } finally {
            setIsSavingAccount(false);
        }
    };

    useEffect(() => {
        if (showReferrals) {
            setReferrals([]); // Reset first
            if (!user.id) return;

            // Try primary user.id (may be numeric or custom string like USR12345)
            const fetchReferrals = async () => {
                try {
                    let res = await fetch(`http://localhost:3001/api/referrals/${encodeURIComponent(user.id)}`);
                    if (!res.ok) throw new Error('Primary lookup failed');
                    let data = await res.json();

                    // If empty and user has email, try by email to get real user_id first
                    if ((!data || data.length === 0) && user.email) {
                        const userRes = await fetch(`http://localhost:3001/api/users/by-email/${encodeURIComponent(user.email)}`);
                        if (userRes.ok) {
                            const dbUser = await userRes.json();
                            if (dbUser.user_id && dbUser.user_id.toString() !== user.id) {
                                const res2 = await fetch(`http://localhost:3001/api/referrals/${dbUser.user_id}`);
                                if (res2.ok) {
                                    data = await res2.json();
                                }
                            }
                        }
                    }

                    if (Array.isArray(data)) {
                        setReferrals(data);
                    }
                } catch (err) {
                    console.warn("Error fetching referrals via network, trying local storage:", err);
                    const localRefs = storageService.getReferralsByPromo(user.promoCode || user.id);
                    setReferrals(localRefs);
                }
            };
            fetchReferrals();
        }
    }, [showReferrals, user.id, user.email, user.promoCode]);

    useEffect(() => {
        if (showBookings && user.id) {
            fetch(`http://localhost:3001/api/bookings/${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setBookings(data);
                    }
                })
                .catch(err => console.error("Error fetching bookings:", err));
        }
    }, [showBookings, user.id]);

    useEffect(() => {
        if (showPromo && user.id && (!user.promoCode || user.promoCode === 'PENDING')) {
            fetch(`http://127.0.0.1:3001/api/users/${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.promo_code && onAccountUpdate) {
                        onAccountUpdate({ ...user, promoCode: data.promo_code });
                    }
                })
                .catch(err => console.error("Error fetching promo code:", err));
        }
    }, [showPromo, user.id, user.promoCode, user, onAccountUpdate]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#6366f1_0%,transparent_50%)]"></div>
            </div>

            <div className="relative w-full max-w-lg bg-slate-900/40 border border-white/5 rounded-[40px] p-10 shadow-2xl backdrop-blur-3xl animate-in zoom-in-95 duration-500">
                <div className="flex justify-between items-start mb-10">
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl overflow-hidden shadow-2xl border-2 border-indigo-500 relative group ${isUploadingAvatar ? 'opacity-50 blur-sm' : ''} transition-all`}>
                            <img src={accountDetails.avatar || user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`} alt={user.name} className="w-full h-full object-cover" />
                            <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isUploadingAvatar} />
                            </label>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase">{user.name}</h2>
                            <p className="text-white/40 text-sm font-bold uppercase tracking-widest mt-1">
                                {user.role === 'associate' ? 'TripFlux Associate' : user.role === 'admin' ? 'System Administrator' : 'TripFlux User'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-white/30 hover:text-white transition-colors bg-white/5 rounded-xl">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Email / Contact</label>
                        <p className="text-white font-medium mt-1 text-lg">{user.email}</p>
                    </div>



                    {user.role !== 'associate' && (
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Account Status</label>
                            <p className="text-emerald-400 font-bold mt-1 uppercase tracking-widest">Active Partner</p>
                        </div>
                    )}

                    <div className="space-y-3 mt-8">

                        <div className="w-full">
                            <button onClick={() => setShowAccount(!showAccount)} className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-white text-sm font-bold uppercase tracking-widest leading-none">My Account</span>
                                        <span className="block text-white/40 text-[9px] uppercase tracking-widest mt-1 font-bold">Edit your details</span>
                                    </div>
                                </div>
                                <svg className={`w-4 h-4 text-white/30 group-hover:text-white/70 transition-transform ${showAccount ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                            {showAccount && (
                                <div className="mt-2 p-4 border border-white/5 bg-slate-900/50 rounded-2xl w-full animate-in slide-in-from-top-2 duration-300">
                                    <form onSubmit={handleAccountSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">First Name</label>
                                                <input required type="text" value={accountDetails.first_name || ''} onChange={(e) => setAccountDetails({ ...accountDetails, first_name: e.target.value })} className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 text-sm font-medium" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Last Name</label>
                                                <input required type="text" value={accountDetails.last_name || ''} onChange={(e) => setAccountDetails({ ...accountDetails, last_name: e.target.value })} className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 text-sm font-medium" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Email <span className="text-white/20">(Non-editable)</span></label>
                                            <input disabled type="email" value={accountDetails.email || ''} className="w-full px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-white/50 outline-none text-sm font-medium cursor-not-allowed" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                                            <input required type="text" value={accountDetails.phone || ''} onChange={(e) => setAccountDetails({ ...accountDetails, phone: e.target.value })} className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 text-sm font-medium" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Password</label>
                                            <input required minLength={6} type="password" value={accountDetails.password || ''} onChange={(e) => setAccountDetails({ ...accountDetails, password: e.target.value })} className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 text-sm font-medium" />
                                        </div>
                                        <button type="submit" disabled={isSavingAccount} className={`w-full py-3 rounded-xl text-xs font-black tracking-[0.2em] uppercase transition-all ${isSavingAccount ? 'bg-indigo-500/50 text-white/50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'}`}>
                                            {isSavingAccount ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>

                        <div className="w-full">
                            <button onClick={() => setShowBookings(!showBookings)} className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-white text-sm font-bold uppercase tracking-widest leading-none">My Bookings</span>
                                        <span className="block text-white/40 text-[9px] uppercase tracking-widest mt-1 font-bold">View previous trips</span>
                                    </div>
                                </div>
                                <svg className={`w-4 h-4 text-white/30 group-hover:text-white/70 transition-transform ${showBookings ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                            {showBookings && (
                                <div className="mt-2 p-4 border border-white/5 bg-slate-900/50 rounded-2xl w-full animate-in slide-in-from-top-2 duration-300">
                                    <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-4">Your Recent Bookings</h3>
                                    {bookings.length === 0 ? (
                                        <p className="text-sm text-white/40 italic text-center py-4">No bookings found.</p>
                                    ) : (
                                        <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                                            {bookings.map((b, idx) => (
                                                <div key={idx} className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                                                    <div className="flex justify-between items-center p-3">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-bold text-white uppercase tracking-wider">{b.package_name || 'Package'}</p>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="text-[10px] text-indigo-400 font-bold tracking-widest leading-none block">{b.destination}</span>
                                                                <span className="text-[10px] text-white/40 font-bold tracking-widest leading-none block">{b.travel_date ? new Date(b.travel_date).toLocaleDateString() : '-'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <p className="text-[10px] text-emerald-400 font-bold tracking-widest leading-none">₹{b.total_amount}</p>
                                                                {b.passenger_count > 0 && (
                                                                    <span className="text-[10px] text-white/40 font-bold tracking-widest">{b.passenger_count} traveler{b.passenger_count > 1 ? 's' : ''}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            <span className={`px-2 py-1 text-[10px] font-black tracking-widest uppercase rounded ${b.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                                {b.status}
                                                            </span>
                                                            {b.passenger_count > 0 && (
                                                                <button
                                                                    onClick={() => toggleBookingPassengers(b.booking_id)}
                                                                    className="text-[9px] text-indigo-400 hover:text-indigo-300 font-black uppercase tracking-widest"
                                                                >
                                                                    {expandedBookingId === b.booking_id ? 'Hide ▲' : 'Travelers ▼'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {expandedBookingId === b.booking_id && (
                                                        <div className="px-3 pb-3 border-t border-white/5">
                                                            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest pt-2 mb-2">Traveler Details</p>
                                                            {(bookingPassengers[b.booking_id] || []).length === 0 ? (
                                                                <p className="text-[10px] text-white/30 italic">Loading...</p>
                                                            ) : (
                                                                <div className="space-y-1.5">
                                                                    {(bookingPassengers[b.booking_id] || []).map((p: any, pi: number) => (
                                                                        <div key={pi} className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2">
                                                                            <span className="text-[10px] text-white/30 font-bold">#{pi + 1}</span>
                                                                            <span className="text-xs font-bold text-white">{p.name}</span>
                                                                            <span className="text-[10px] text-white/40">{p.age}y</span>
                                                                            <span className="text-[10px] text-indigo-400 font-bold">{p.gender}</span>
                                                                            {p.id_proof && <span className="text-[10px] text-white/30 ml-auto">{p.id_proof}</span>}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="w-full">
                            <button onClick={() => setShowReferrals(!showReferrals)} className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-white text-sm font-bold uppercase tracking-widest leading-none">My Referrals</span>
                                        <span className="block text-white/40 text-[9px] uppercase tracking-widest mt-1 font-bold">Invite & view rewards</span>
                                    </div>
                                </div>
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={`w-4 h-4 text-white/30 group-hover:text-white/70 transition-transform ${showReferrals ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                            {showReferrals && (
                                <div className="mt-2 p-4 border border-white/5 bg-slate-900/50 rounded-2xl w-full animate-in slide-in-from-top-2 duration-300">
                                    <div className="mb-4 pb-4 border-b border-white/10">
                                        <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2">Share your referral link:</p>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                readOnly
                                                value={`${window.location.origin}/?ref=${user.promoCode || user.id}`}
                                                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-indigo-300 outline-none font-mono"
                                            />
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(`${window.location.origin}/?ref=${user.promoCode || user.id}`);
                                                    alert('Referral link copied!');
                                                }}
                                                className="bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 px-4 py-2 rounded-lg text-xs font-bold transition-colors uppercase tracking-wider"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-4">Your Referrals</h3>
                                    {referrals.length === 0 ? (
                                        <p className="text-sm text-white/40 italic text-center py-4">No referrals found yet.</p>
                                    ) : (
                                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                            {referrals.map((ref, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <div>
                                                        <p className="text-sm font-bold text-white uppercase tracking-wider">{ref.first_name} {ref.last_name}</p>
                                                        <p className="text-[10px] text-indigo-400 font-bold tracking-widest mt-1">ID: {ref.custom_user_id || ref.associate_id} • Type: {ref.referral_type}</p>
                                                    </div>
                                                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-widest uppercase rounded">
                                                        {ref.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {user.role === 'associate' && (
                            <button onClick={() => setShowPromo(!showPromo)} className="w-full flex flex-col p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                                        </div>
                                        <div className="text-left">
                                            <span className="block text-white text-sm font-bold uppercase tracking-widest leading-none">Promo Code</span>
                                            <span className="block text-white/40 text-[9px] uppercase tracking-widest mt-1 font-bold">Share to earn commissions</span>
                                        </div>
                                    </div>
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={`w-4 h-4 text-white/30 group-hover:text-white/70 transition-transform ${showPromo ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                                {showPromo && (
                                    <div className="mt-4 pt-4 border-t border-white/5 w-full animate-in slide-in-from-top-2 duration-300">
                                        <div className="flex flex-col items-center justify-center gap-3 py-2">
                                            <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Your Active Code:</span>
                                            <code className="text-2xl font-mono font-black text-indigo-300 tracking-[0.2em] px-6 py-3 bg-slate-900/50 rounded-2xl border border-indigo-500/50 shadow-inner">
                                                {user.promoCode || 'PENDING'}
                                            </code>
                                        </div>
                                    </div>
                                )}
                            </button>
                        )}
                    </div>

                    <button onClick={onSignOut} className="w-full flex items-center justify-center gap-3 p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl transition-all group mt-6 shadow-inner shadow-red-500/10">
                        <svg className="w-5 h-5 text-red-500 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        <span className="text-red-500 text-xs font-black uppercase tracking-[0.2em]">Sign Out</span>
                    </button>
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 text-center">
                    <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.2em]">
                        TripFlux Profile Dashboard <br />
                        Secure Data Encryption
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProfileDashboard;
