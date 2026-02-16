import React, { useState } from 'react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    tourTitle: string;
    amount: string;
    tourId: string;
}

type PaymentMethod = 'UPI' | 'NETBANKING' | 'CARD';

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, tourTitle, amount, tourId }) => {
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
        setIsProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsProcessing(false);
        setPaymentSuccess(true);

        // Auto close after success
        setTimeout(() => {
            setPaymentSuccess(false);
            onClose();
        }, 3000);
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
                                <p className="text-4xl font-black">{amount}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Payment Method Tabs */}
                <div className="flex border-b border-slate-200 bg-slate-50">
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
                <div className="flex-1 overflow-y-auto p-8">
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

                {/* Footer */}
                <div className="bg-slate-50 p-6 border-t border-slate-200">
                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
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
                                `Pay ${amount}`
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
