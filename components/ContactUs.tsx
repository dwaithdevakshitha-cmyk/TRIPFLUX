
import React from 'react';

const ContactUs: React.FC = () => {
    return (
        <div className="animate-in fade-in duration-700 bg-[#edf2f4] min-h-screen py-20 px-6">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl font-extrabold text-[#0c2d3a] text-center mb-16 tracking-tight uppercase">Contact Us</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    {/* Left Column: Contact info */}
                    <div className="space-y-8 pt-4">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-[14px] font-black text-[#0c2d3a] uppercase">Address :</span>
                                <p className="text-[13px] text-slate-600 font-semibold leading-relaxed">
                                    Dwaith Infotech Private Limited <br />
                                    Plot No 6-3-347/9, Flat No: 306 <br />
                                    Riviera Towers, Dwarakapuri Colony, <br />
                                    Panjagutta
                                </p>
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-[14px] font-black text-[#0c2d3a] uppercase">City :</span>
                                <p className="text-[13px] text-slate-600 font-semibold">Hyderabad</p>
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-[14px] font-black text-[#0c2d3a] uppercase">State :</span>
                                <p className="text-[13px] text-slate-600 font-semibold">Telangana</p>
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-[14px] font-black text-[#0c2d3a] uppercase">Pincode :</span>
                                <p className="text-[13px] text-slate-600 font-semibold">500082</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <h3 className="text-[16px] font-black text-[#0c2d3a] uppercase border-b-2 border-indigo-600 w-fit pb-1">Our Contact Numbers</h3>
                            <div className="flex items-center gap-3 text-slate-600">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-[15px] font-bold">7036665588</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-slate-600">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-[14px] font-bold">info@tripflux.com</span>
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <div className="bg-[#0c2d3a] rounded-xl p-10 shadow-2xl space-y-8">
                        <h3 className="text-2xl font-bold text-white text-center">Talk to us</h3>

                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="space-y-2">
                                <label className="text-[12px] font-bold text-white/80 uppercase">Name <span className="text-red-500">*</span></label>
                                <input type="text" className="w-full bg-white rounded px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[12px] font-bold text-white/80 uppercase">Email <span className="text-red-500">*</span></label>
                                <input type="email" className="w-full bg-white rounded px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[12px] font-bold text-white/80 uppercase">Phone number <span className="text-red-500">*</span></label>
                                <input type="tel" className="w-full bg-white rounded px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" required />
                            </div>

                            <button type="submit" className="bg-white text-[#0c2d3a] px-8 py-2 font-bold rounded shadow-lg hover:bg-slate-100 transition-colors uppercase text-[12px]">Submit</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
