
import React, { useState } from 'react';

interface AssociateLoginProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const AssociateLogin: React.FC<AssociateLoginProps> = ({ onSuccess, onCancel }) => {
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (passcode === 'trips2025') {
            onSuccess();
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#6366f1_0%,transparent_50%)]"></div>
            </div>

            <div className="relative w-full max-w-md bg-slate-900/40 border border-white/5 rounded-[40px] p-10 shadow-2xl backdrop-blur-3xl animate-in zoom-in-95 duration-500">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                        <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">Associates Portal</h2>
                    <p className="text-white/40 text-sm font-bold mt-2 tracking-tight">Enter your associate access code</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Access Key</label>
                        </div>
                        <input
                            type="password"
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value)}
                            placeholder="••••••••"
                            className={`w-full px-6 py-4 bg-white/5 border ${error ? 'border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:ring-white/10'} rounded-2xl outline-none focus:ring-4 transition-all text-white font-mono tracking-[0.5em] text-center`}
                            autoFocus
                        />
                        {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-tighter text-center mt-2 animate-bounce">Access Denied</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-white text-slate-950 font-black rounded-2xl hover:bg-indigo-50 active:scale-95 transition-all shadow-xl shadow-white/5 cursor-pointer text-xs tracking-widest uppercase"
                    >
                        Authenticate
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full py-2 text-white/30 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors cursor-pointer"
                    >
                        ← Back to Home
                    </button>
                </form>

                <div className="mt-12 pt-8 border-t border-white/5 text-center">
                    <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.2em]">
                        Secure Associate Session <br />
                        Node-8 Encryption Active
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AssociateLogin;
