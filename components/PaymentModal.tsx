import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { User } from '../types';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    tourTitle: string;
    amount: string;
    tourId: string;
    user: User | null;
    availableDates: string;
}

type PaymentMethod = 'UPI' | 'NETBANKING' | 'CARD';

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, tourTitle, amount, tourId, user, availableDates }) => {
    const [travelSuccess, setTravelSuccess] = useState(false);
    const [travelOption, setTravelOption] = useState<'scheduled' | 'flexible' | null>(null);
    const [travelDate, setTravelDate] = useState('');
    const [promoCode, setPromoCode] = useState(user?.promoCode || '');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // UPI State
    const [upiId, setUpiId] = useState('');

    // Net Banking State
    const [selectedBank, setSelectedBank] = useState('');

    // Card State
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');

    // Passenger State
    const [passengers, setPassengers] = useState([
        { name: '', age: '', gender: 'Male', id_type: 'aadhaar', id_proof: '', id_error: '' }
    ]);

    useEffect(() => {
        if (isOpen) {
            setPassengers([{ name: '', age: '', gender: 'Male', id_type: 'aadhaar', id_proof: '', id_error: '' }]);
            setTravelDate('');
            setPromoCode(user?.promoCode || '');
            setPaymentMethod('UPI');
            setPaymentSuccess(false);
            setIsProcessing(false);
        }
    }, [isOpen, user]);

    // Calculate dynamic total amount
    const basePrice = parseFloat(amount.replace(/[^\d.]/g, '')) || 0;
    const totalAmountValue = basePrice * passengers.length;
    // Format the total amount as Indian Rupee
    const formattedTotalAmount = `₹${totalAmountValue.toLocaleString('en-IN')}`;

    const addPassenger = () => {
        setPassengers(prev => [...prev, { name: '', age: '', gender: 'Male', id_type: 'aadhaar', id_proof: '', id_error: '' }]);
    };

    const removePassenger = (index: number) => {
        setPassengers(prev => prev.filter((_, i) => i !== index));
    };

    const updatePassenger = (index: number, field: string, value: string) => {
        setPassengers(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
    };

    // --- Format enforcement: Aadhaar (12 digits, formatted XXXX XXXX XXXX) ---
    const handleAadhaarInput = (index: number, raw: string) => {
        const digits = raw.replace(/\D/g, '').slice(0, 12);
        const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
        let error = '';
        if (digits.length === 12) error = '';
        else if (digits.length > 0) error = '';
        setPassengers(prev => prev.map((p, i) => i === index
            ? { ...p, id_proof: formatted, id_error: error }
            : p
        ));
    };

    // --- Format enforcement: PAN (ABCDE1234F) ---
    const handlePanInput = (index: number, raw: string) => {
        const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
        let built = '';
        for (let i = 0; i < cleaned.length && i < 10; i++) {
            const ch = cleaned[i];
            if (i < 5) built += /[A-Z]/.test(ch) ? ch : '';
            else if (i < 9) built += /[0-9]/.test(ch) ? ch : '';
            else built += /[A-Z]/.test(ch) ? ch : '';
        }
        let error = '';
        if (built.length === 10 && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(built)) {
            error = 'Invalid PAN format';
        }
        setPassengers(prev => prev.map((p, i) => i === index
            ? { ...p, id_proof: built, id_error: error }
            : p
        ));
    };

    const switchIdType = (index: number, newType: string) => {
        setPassengers(prev => prev.map((p, i) => i === index
            ? { ...p, id_type: newType, id_proof: '', id_error: '' }
            : p
        ));
    };

    // Bank Account Details
    const bankDetails = {
        accountName: 'MDR RETAIL INDIA PRIVATE LIMITED',
        accountNumber: '630805501030',
        ifscCode: 'ICIC0006308',
        bankName: 'ICICI Bank'
    };

    const banks = [
        'ICICI Bank', 'HDFC Bank', 'State Bank of India', 'Axis Bank',
        'Kotak Mahindra Bank', 'Punjab National Bank', 'Bank of Baroda',
        'Canara Bank', 'Union Bank of India', 'IDBI Bank'
    ];

    if (!isOpen) return null;

    const handlePayment = async () => {
        if (!user) {
            alert('Please login to book a package');
            return;
        }

        if (!travelOption) {
            alert('Please choose either "Scheduled Trip Dates" or "Flexible Travel Date"');
            return;
        }

        if (!travelDate) {
            alert('Please select a travel date');
            return;
        }

        // Validate passengers — at least one with a name
        const validPassengers = passengers.filter(p => p.name.trim());
        if (validPassengers.length === 0) {
            alert('Please enter at least one passenger name.');
            return;
        }

        setIsProcessing(true);

        try {
            // Resolve real DB user_id before booking
            // If user.id is a large timestamp (from localStorage fallback), look up by email
            let resolvedUserId: string | number = user.id;
            const numericId = parseInt(user.id);
            const isTimestampId = !isNaN(numericId) && numericId > 2147483647;
            const isNonNumericId = isNaN(numericId);

            if ((isTimestampId || isNonNumericId) && user.email) {
                const realUserId = await dbService.resolveUserIdByEmail(user.email);
                if (realUserId) {
                    resolvedUserId = realUserId;
                }
            }

            // Create booking in database - results in 'pending' status by default
            const bookingRes = await dbService.createBooking({
                userId: resolvedUserId,
                userEmail: user.email,
                packageId: tourId,
                travelDate: travelDate,
                totalAmount: formattedTotalAmount,
                promoCode: promoCode,
                associateId: user.role === 'associate' ? resolvedUserId : undefined,
                passengers: validPassengers.map(p => ({
                    name: p.name.trim(),
                    age: parseInt(p.age) || 0,
                    gender: p.gender,
                    id_proof: p.id_proof.trim() || null
                }))
            });

            const bookingId = bookingRes.booking?.booking_id;

            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            const mockTransactionId = `TXN${Date.now()}`;

            // 1. Update Booking Status to 'confirmed'
            if (bookingId) {
                await dbService.updateBookingStatus(bookingId, 'confirmed');

                // 2. Record Payment Transaction in 'payments' table
                await dbService.recordPayment({
                    booking_id: bookingId,
                    amount: basePrice * passengers.length,
                    method: paymentMethod,
                    transaction_id: mockTransactionId,
                    status: 'success'
                });
            }

            setIsProcessing(false);
            setPaymentSuccess(true);

            // Auto close after success
            setTimeout(() => {
                setPaymentSuccess(false);
                onClose();
            }, 3000);
        } catch (error: any) {
            setIsProcessing(false);
            // In a real flow, if we have an ID but payment fails, we'd update to 'failed'
            // For now, we simple show the error
            alert(error.message || 'Booking failed. Please try again.');
        }
    };

    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\s/g, '');
        const chunks = cleaned.match(/.{1,4}/g);
        return chunks ? chunks.join(' ') : cleaned;
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\s/g, '');
        if (value.length <= 16 && /^\d*$/.test(value)) {
            setCardNumber(value);
        }
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        setExpiryDate(value);
    };

    const getCardType = (number: string) => {
        if (number.startsWith('4')) return 'Visa';
        if (number.startsWith('5')) return 'Mastercard';
        if (number.startsWith('6')) return 'RuPay';
        if (number.startsWith('3')) return 'Amex';
        return '';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                {/* Success Animation */}
                {paymentSuccess && (
                    <div className="absolute inset-0 z-50 bg-white flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
                                <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-3xl font-black text-green-600 mb-2">Payment Successful!</h3>
                            <p className="text-slate-600">Your booking has been confirmed</p>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="text-2xl font-black tracking-tight uppercase mb-2">Complete Payment</h3>
                            <p className="text-white/80 text-sm font-medium mb-4">{tourTitle}</p>
                            <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                                <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">Total Amount</p>
                                <p className="text-4xl font-black">{formattedTotalAmount}</p>
                                <p className="text-xs font-medium text-white/80 mt-1">({passengers.length} Traveler{passengers.length > 1 ? 's' : ''} × {amount})</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 bg-white/10 hover:bg-white text-white hover:text-indigo-600 rounded-xl transition-all duration-200 shadow-lg backdrop-blur-md border border-white/20 group"
                            title="Close"
                        >
                            <svg className="w-6 h-6 transform group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Scrollable Middle: Booking Options + Passengers + Payment */}
                <div className="flex-1 overflow-y-auto flex flex-col">

                    {/* Booking Options */}
                    <div className="bg-slate-50 p-6 border-b border-slate-200 flex-shrink-0">
                        <div className="space-y-6">
                            {/* Option Selection */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTravelOption('scheduled');
                                        setTravelDate('');
                                    }}
                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center group ${travelOption === 'scheduled' ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-600/10' : 'border-slate-200 bg-white hover:border-indigo-300'}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${travelOption === 'scheduled' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <div>
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${travelOption === 'scheduled' ? 'text-indigo-600' : 'text-slate-500'}`}>Scheduled</p>
                                        <p className={`text-[9px] font-bold ${travelOption === 'scheduled' ? 'text-indigo-400' : 'text-slate-400'}`}>Trip Dates</p>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTravelOption('flexible');
                                        setTravelDate('');
                                    }}
                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center group ${travelOption === 'flexible' ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-600/10' : 'border-slate-200 bg-white hover:border-indigo-300'}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${travelOption === 'flexible' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <div>
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${travelOption === 'flexible' ? 'text-indigo-600' : 'text-slate-500'}`}>Flexible</p>
                                        <p className={`text-[9px] font-bold ${travelOption === 'flexible' ? 'text-indigo-400' : 'text-slate-400'}`}>Travel Date</p>
                                    </div>
                                </button>
                            </div>

                            {/* Date Detail Selection */}
                            <div className="grid grid-cols-2 gap-6 items-end">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <svg className="w-3 h-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Select {travelOption === 'flexible' ? 'Future Date (up to 2030)' : 'Scheduled Date'}
                                    </label>
                                    {!travelOption ? (
                                        <div className="h-[50px] flex items-center px-4 bg-slate-100 rounded-xl border-2 border-slate-200 text-slate-400 text-xs font-bold italic">
                                            Please choose an option above
                                        </div>
                                    ) : travelOption === 'scheduled' ? (
                                        <div className="relative group">
                                            {availableDates && availableDates !== '2025 Flexible' && availableDates.includes('-') ? (
                                                <>
                                                    <select
                                                        value={travelDate}
                                                        onChange={(e) => setTravelDate(e.target.value)}
                                                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none font-bold text-sm h-[50px] appearance-none cursor-pointer hover:border-indigo-300 transition-colors"
                                                        required
                                                    >
                                                        <option value="">Choose a Scheduled Date</option>
                                                        {availableDates.split(',').map(d => d.trim()).filter(d => Boolean(d)).map(date => (
                                                            <option key={date} value={date}>
                                                                {new Date(date).toLocaleDateString('en-IN', {
                                                                    day: '2-digit',
                                                                    month: 'long',
                                                                    year: 'numeric'
                                                                })}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="h-[50px] flex items-center px-4 bg-amber-50 rounded-xl border-2 border-amber-200 text-amber-700 text-xs font-bold">
                                                    No scheduled dates available.
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={travelDate}
                                                onChange={(e) => setTravelDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                max="2030-12-31"
                                                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none font-bold text-sm h-[50px] hover:border-indigo-300 transition-colors"
                                                required
                                            />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Promo Code (Optional)</label>
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                        placeholder="E.G. SAVE10"
                                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none font-bold text-sm h-[50px]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Passenger Details Section */}
                    <div className="bg-white px-8 py-6 border-b border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Traveler Details</h4>
                            <button
                                type="button"
                                onClick={addPassenger}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                Add Passenger
                            </button>
                        </div>
                        <div className="space-y-4 pr-1">
                            {passengers.map((passenger, index) => (
                                <div key={index} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 relative">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Traveler {index + 1}</span>
                                        {passengers.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removePassenger(index)}
                                                className="text-red-400 hover:text-red-600 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Full Name *</label>
                                            <input
                                                type="text"
                                                value={passenger.name}
                                                onChange={e => updatePassenger(index, 'name', e.target.value)}
                                                placeholder="Enter full name"
                                                className="w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm font-medium"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Age *</label>
                                            <input
                                                type="number"
                                                value={passenger.age}
                                                onChange={e => updatePassenger(index, 'age', e.target.value)}
                                                placeholder="Age"
                                                min="1" max="120"
                                                className="w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Gender *</label>
                                            <select
                                                value={passenger.gender}
                                                onChange={e => updatePassenger(index, 'gender', e.target.value)}
                                                className="w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm font-medium"
                                            >
                                                <option>Male</option>
                                                <option>Female</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">ID Proof (Optional)</label>
                                            {/* Type toggle */}
                                            <div className="flex gap-2 mb-2">
                                                {(['aadhaar', 'pan'] as const).map(t => (
                                                    <button
                                                        key={t}
                                                        type="button"
                                                        onClick={() => switchIdType(index, t)}
                                                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${passenger.id_type === t
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                            }`}
                                                    >
                                                        {t === 'aadhaar' ? 'Aadhaar' : 'PAN Card'}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Aadhaar Input */}
                                            {passenger.id_type === 'aadhaar' && (
                                                <>
                                                    <input
                                                        type="text"
                                                        value={passenger.id_proof}
                                                        onChange={e => handleAadhaarInput(index, e.target.value)}
                                                        placeholder="1234 5678 9012"
                                                        maxLength={14}
                                                        className={`w-full px-3 py-2 border-2 rounded-xl focus:outline-none text-sm font-mono font-bold tracking-widest ${passenger.id_proof.replace(/\s/g, '').length === 12
                                                            ? 'border-emerald-500 focus:border-emerald-500 bg-emerald-50'
                                                            : 'border-slate-200 focus:border-indigo-500 bg-white'
                                                            }`}
                                                    />
                                                    <div className="flex justify-between mt-1">
                                                        <span className="text-[10px] text-slate-400">12 digits · no alphabets · XXXX XXXX XXXX</span>
                                                        {passenger.id_proof.replace(/\s/g, '').length === 12 &&
                                                            <span className="text-[10px] text-emerald-600 font-bold">✓ Valid</span>
                                                        }
                                                        {passenger.id_proof.length > 0 && passenger.id_proof.replace(/\s/g, '').length < 12 &&
                                                            <span className="text-[10px] text-slate-400">{12 - passenger.id_proof.replace(/\s/g, '').length} more</span>
                                                        }
                                                    </div>
                                                </>
                                            )}

                                            {/* PAN Input */}
                                            {passenger.id_type === 'pan' && (
                                                <>
                                                    <input
                                                        type="text"
                                                        value={passenger.id_proof}
                                                        onChange={e => handlePanInput(index, e.target.value)}
                                                        placeholder="ABCDE1234F"
                                                        maxLength={10}
                                                        className={`w-full px-3 py-2 border-2 rounded-xl focus:outline-none text-sm font-mono font-bold tracking-[0.2em] uppercase ${passenger.id_error ? 'border-red-400 focus:border-red-500 bg-red-50' :
                                                            passenger.id_proof.length === 10 ? 'border-emerald-500 focus:border-emerald-500 bg-emerald-50' :
                                                                'border-slate-200 focus:border-indigo-500 bg-white'
                                                            }`}
                                                    />
                                                    <div className="flex justify-between mt-1">
                                                        <span className="text-[10px] text-slate-400">5 letters · 4 digits · 1 letter</span>
                                                        {passenger.id_error && <span className="text-[10px] text-red-500 font-bold">{passenger.id_error}</span>}
                                                        {!passenger.id_error && passenger.id_proof.length === 10 && <span className="text-[10px] text-emerald-600 font-bold">✓ Valid</span>}
                                                        {!passenger.id_error && passenger.id_proof.length > 0 && passenger.id_proof.length < 10 &&
                                                            <span className="text-[10px] text-slate-400">
                                                                {passenger.id_proof.length < 5 ? `${5 - passenger.id_proof.length} letters` :
                                                                    passenger.id_proof.length < 9 ? `${9 - passenger.id_proof.length} digits` : '1 letter'}
                                                            </span>
                                                        }
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Method Tabs */}
                    <div className="flex border-b border-slate-200 bg-slate-50 flex-shrink-0">
                        <button
                            onClick={() => setPaymentMethod('UPI')}
                            className={`flex-1 py-4 px-6 font-bold text-sm uppercase tracking-wider transition-all ${paymentMethod === 'UPI'
                                ? 'bg-white text-indigo-600 border-b-4 border-indigo-600'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            UPI
                        </button>
                        <button
                            onClick={() => setPaymentMethod('NETBANKING')}
                            className={`flex-1 py-4 px-6 font-bold text-sm uppercase tracking-wider transition-all ${paymentMethod === 'NETBANKING'
                                ? 'bg-white text-indigo-600 border-b-4 border-indigo-600'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Net Banking
                        </button>
                        <button
                            onClick={() => setPaymentMethod('CARD')}
                            className={`flex-1 py-4 px-6 font-bold text-sm uppercase tracking-wider transition-all ${paymentMethod === 'CARD'
                                ? 'bg-white text-indigo-600 border-b-4 border-indigo-600'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Card
                        </button>
                    </div>

                    {/* Payment Content */}
                    <div className="p-8">
                        {/* UPI Payment */}
                        {paymentMethod === 'UPI' && (
                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-orange-900 text-lg">Scan & Pay</h4>
                                            <p className="text-xs text-orange-700 font-medium">Use any UPI app to scan</p>
                                        </div>
                                    </div>

                                    {/* QR Code Display */}
                                    <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                                        <div className="w-64 h-64 mx-auto bg-white rounded-xl flex items-center justify-center mb-6 border border-slate-100 p-2">
                                            <img
                                                src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=eazypay.2000038785@icici&pn=MDR%20RETAIL%20INDIA%20PRIVATE%20LIMITED&cu=INR"
                                                alt="UPI QR Code"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Supported Apps</p>
                                        <div className="flex items-center justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Pay_Logo_%282020%29.svg" alt="GPay" className="h-8 object-contain" />
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b6/PhonePe_Logo.svg" alt="PhonePe" className="h-8 object-contain" />
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" className="h-6 object-contain" />
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/BHIM_Logo.svg" alt="BHIM" className="h-8 object-contain" />
                                        </div>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-white text-slate-500 font-bold uppercase tracking-wider">Or Enter UPI ID</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">UPI ID</label>
                                    <input
                                        type="text"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        placeholder="username@paytm"
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none font-medium"
                                    />
                                </div>

                                {/* Bank Details */}
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                                    <h5 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">Bank Account Details</h5>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-bold text-slate-600">Account Name:</span>
                                            <span className="text-sm font-black text-slate-900">{bankDetails.accountName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-bold text-slate-600">Account Number:</span>
                                            <span className="text-sm font-mono font-black text-slate-900">{bankDetails.accountNumber}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-bold text-slate-600">IFSC Code:</span>
                                            <span className="text-sm font-mono font-black text-slate-900">{bankDetails.ifscCode}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-bold text-slate-600">Bank:</span>
                                            <span className="text-sm font-black text-slate-900">{bankDetails.bankName}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Net Banking */}
                        {paymentMethod === 'NETBANKING' && (
                            <div className="space-y-6">
                                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-blue-900 text-lg">Net Banking</h4>
                                            <p className="text-xs text-blue-700 font-medium">Select your bank to proceed</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Select Bank</label>
                                    <select
                                        value={selectedBank}
                                        onChange={(e) => setSelectedBank(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none font-medium bg-white"
                                    >
                                        <option value="">Choose your bank</option>
                                        {banks.map(bank => (
                                            <option key={bank} value={bank}>{bank}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Bank Details */}
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                                    <h5 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">Transfer To</h5>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-bold text-slate-600">Account Name:</span>
                                            <span className="text-sm font-black text-slate-900">{bankDetails.accountName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-bold text-slate-600">Account Number:</span>
                                            <span className="text-sm font-mono font-black text-slate-900">{bankDetails.accountNumber}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-bold text-slate-600">IFSC Code:</span>
                                            <span className="text-sm font-mono font-black text-slate-900">{bankDetails.ifscCode}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-bold text-slate-600">Bank:</span>
                                            <span className="text-sm font-black text-slate-900">{bankDetails.bankName}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Card Payment */}
                        {paymentMethod === 'CARD' && (
                            <div className="space-y-6">
                                <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-purple-900 text-lg">Credit/Debit Card</h4>
                                            <p className="text-xs text-purple-700 font-medium">Visa, Mastercard, RuPay accepted</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Card Number</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={formatCardNumber(cardNumber)}
                                            onChange={handleCardNumberChange}
                                            placeholder="1234 5678 9012 3456"
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none font-mono font-bold"
                                            maxLength={19}
                                        />
                                        {cardNumber && (
                                            <span className="absolute right-4 top-3 text-xs font-black text-indigo-600">
                                                {getCardType(cardNumber)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Cardholder Name</label>
                                    <input
                                        type="text"
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                        placeholder="JOHN DOE"
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none font-bold uppercase"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Expiry Date</label>
                                        <input
                                            type="text"
                                            value={expiryDate}
                                            onChange={handleExpiryChange}
                                            placeholder="MM/YY"
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none font-mono font-bold"
                                            maxLength={5}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">CVV</label>
                                        <input
                                            type="password"
                                            value={cvv}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length <= 4 && /^\d*$/.test(value)) {
                                                    setCvv(value);
                                                }
                                            }}
                                            placeholder="123"
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none font-mono font-bold"
                                            maxLength={4}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div> {/* End scrollable middle */}

                {/* Footer — always visible, pinned at bottom */}
                <div className="bg-slate-50 p-6 border-t border-slate-200 flex-shrink-0">
                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-white border-2 border-slate-400 text-slate-800 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-100 hover:border-slate-500 transition-all shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing || !travelOption || !travelDate}
                            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                `Pay ${formattedTotalAmount}`
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
