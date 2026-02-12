
import React, { useState } from 'react';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin passcode - in production this would be validated via a secure backend
    if (passcode === 'flux2025') {
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#4f46e5_0%,transparent_50%)]"></div>
      </div>

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/20">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Management Console</h2>
          <p className="text-slate-500 text-sm font-bold mt-2">Enter credentials to access Neon DB Cluster</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Admin Passcode</label>
            <input 
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="••••••••"
              className={`w-full px-6 py-4 bg-slate-800 border ${error ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-700 focus:ring-indigo-500/20'} rounded-2xl outline-none focus:ring-4 transition-all text-white font-mono tracking-[0.5em] text-center`}
              autoFocus
            />
            {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-tighter text-center mt-2">Invalid Access Key</p>}
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 active:scale-95 transition-all shadow-xl shadow-indigo-500/20 cursor-pointer"
          >
            AUTHORIZE ACCESS
          </button>
          
          <button 
            type="button"
            onClick={onCancel}
            className="w-full py-2 text-slate-500 text-xs font-bold hover:text-white transition-colors cursor-pointer"
          >
            Return to Public View
          </button>
        </form>
        
        <div className="mt-10 pt-8 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            Session Encrypted via TLS 1.3 <br/>
            Connected to Neon AWS us-east-1
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
