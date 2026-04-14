import React, { useState } from 'react';
import { dbService } from '../services/dbService';

const ContactUs: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const validateEmail = (email: string) => {
        const emailRegex = /^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;
        if (!email) return 'Email is required';
        if (email.includes(' ')) return 'Spaces are not allowed in email';
        if (!email.includes('@')) return 'Email must contain @ symbol';
        if (!emailRegex.test(email)) return 'Invalid email format (e.g. username@domain.com)';
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
        
        // Final validations
        const emailErr = validateEmail(formData.email);
        const phoneErr = validatePhone(formData.phone);
        const nameErr = !formData.name ? 'Name is required' : '';
        const messageErr = !formData.message ? 'Message is required' : '';

        if (emailErr || phoneErr || nameErr || messageErr) {
            setErrors({
                email: emailErr,
                phone: phoneErr,
                name: nameErr,
                message: messageErr
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await dbService.submitContactForm(formData);
            setSuccess(true);
            setFormData({ name: '', email: '', phone: '', message: '' });
            setErrors({ name: '', email: '', phone: '', message: '' });
            alert("Thank you! Your message has been sent successfully.");
        } catch (err) {
            console.error("Submission error:", err);
            alert("Failed to send message. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-700 bg-[#edf2f4] min-h-screen py-12 sm:py-20 px-4 sm:px-6 pb-24 md:pb-20">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0c2d3a] text-center mb-10 sm:mb-16 tracking-tight uppercase">Contact Us</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-start">
                    {/* Left Column: Contact info */}
                    <div className="space-y-6 pt-0 sm:pt-4">
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
                            <div className="grid grid-cols-2 sm:grid-cols-1 gap-3">
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
                        </div>

                        <div className="space-y-3 pt-2">
                            <h3 className="text-[16px] font-black text-[#0c2d3a] uppercase border-b-2 border-indigo-600 w-fit pb-1">Our Contact Numbers</h3>
                            <div className="flex items-center gap-3 text-slate-600">
                                <svg className="w-5 h-5 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <a href="tel:8297788789" className="text-[15px] font-bold hover:text-indigo-600 transition-colors">8297788789</a>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-slate-600">
                            <svg className="w-5 h-5 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <a href="mailto:info@tripflux.com" className="text-[14px] font-bold hover:text-indigo-600 transition-colors break-all">info@tripflux.com</a>
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <div className="bg-[#0c2d3a] rounded-xl p-6 sm:p-10 shadow-2xl space-y-6 sm:space-y-8">
                        <h3 className="text-xl sm:text-2xl font-bold text-white text-center">Talk to us</h3>

                        <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label className="text-[12px] font-bold text-white/80 uppercase">Name <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    className={`w-full bg-white rounded px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${errors.name ? 'border-2 border-red-500' : ''}`}
                                    placeholder="Your full name"
                                    value={formData.name}
                                    onChange={(e) => {
                                        setFormData({...formData, name: e.target.value});
                                        if (errors.name) setErrors({...errors, name: ''});
                                    }}
                                />
                                {errors.name && <p className="text-red-400 text-[10px] font-bold uppercase ml-1 italic">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[12px] font-bold text-white/80 uppercase">Email <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    className={`w-full bg-white rounded px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${errors.email ? 'border-2 border-red-500' : ''}`}
                                    placeholder="email@example.com"
                                    value={formData.email}
                                    onChange={(e) => {
                                        const val = e.target.value.toLowerCase().trim();
                                        setFormData({...formData, email: val});
                                        setErrors({...errors, email: validateEmail(val)});
                                    }}
                                />
                                {errors.email && <p className="text-red-400 text-[10px] font-bold uppercase ml-1 italic">{errors.email}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[12px] font-bold text-white/80 uppercase">Phone number <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    maxLength={10}
                                    placeholder="10 digit number"
                                    className={`w-full bg-white rounded px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${errors.phone ? 'border-2 border-red-500' : ''}`}
                                    value={formData.phone}
                                    onChange={(e) => {
                                        let val = e.target.value.replace(/\D/g, '');
                                        if (val.length > 10) val = val.slice(0, 10);
                                        setFormData({...formData, phone: val});
                                        setErrors({...errors, phone: validatePhone(val)});
                                    }}
                                />
                                {errors.phone && <p className="text-red-400 text-[10px] font-bold uppercase ml-1 italic">{errors.phone}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[12px] font-bold text-white/80 uppercase">Message <span className="text-red-500">*</span></label>
                                <textarea 
                                    className={`w-full bg-white rounded px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm h-32 resize-none ${errors.message ? 'border-2 border-red-500' : ''}`}
                                    value={formData.message}
                                    onChange={(e) => {
                                        setFormData({...formData, message: e.target.value});
                                        if (errors.message) setErrors({...errors, message: ''});
                                    }}
                                    placeholder="How can we help you?"
                                />
                                {errors.message && <p className="text-red-400 text-[10px] font-bold uppercase ml-1 italic">{errors.message}</p>}
                            </div>
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className={`w-full sm:w-auto bg-white text-[#0c2d3a] px-12 py-4 font-black rounded-lg shadow-xl hover:bg-slate-100 transition-all uppercase text-[12px] tracking-widest active:scale-95 ${isSubmitting ? 'opacity-50' : ''}`}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
