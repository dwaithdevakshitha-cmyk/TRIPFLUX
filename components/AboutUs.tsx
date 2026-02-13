
import React from 'react';

const AboutUs: React.FC = () => {
    return (
        <div className="animate-in fade-in duration-700 bg-white min-h-screen py-20 px-6">
            <div className="max-w-4xl mx-auto space-y-24 text-center">

                {/* Intro Section */}
                <section className="space-y-8">
                    <h2 className="text-[12px] font-black text-indigo-600 uppercase tracking-[0.4em]">Know About Us</h2>
                    <div className="flex justify-center">
                        <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner">
                            <svg className="w-16 h-16 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2.25 2.25 0 012.25-2.25h.741M3.947 17.028A9 9 0 1118.027 4.906" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed max-w-2xl mx-auto font-medium">
                        TripFlux is a next-generation travel intelligence platform dedicated to redefining how the world explores. Leveraging advanced AI-driven curation and a deep-rooted commitment to local grounding, we provide seamless, premium travel experiences that bridge the gap between digital convenience and authentic discovery. Our group tours span the majestic landscapes of Pan India, the historic charm of Europe, and the vibrant shores of South East Asia.
                    </p>
                </section>

                {/* Vision Section */}
                <section className="space-y-4">
                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Our Vision</h3>
                    <p className="text-[10px] text-indigo-600 font-bold italic">“Synchronizing the world through intelligent exploration and boundless discovery.”</p>
                </section>

                {/* Mission Section */}
                <section className="space-y-4 max-w-2xl mx-auto">
                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Our Mission</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-bold">
                        We are firmly committed to excellence in travel intelligence. Our mission is to uphold the highest ethical standards while creating new benchmarks in the travel industry through AI-enhanced synchronization and personalized support for every traveler.
                    </p>
                    <div className="pt-8 space-y-1">
                        <p className="text-[11px] font-black text-slate-900">KC Rajanna</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Managing Director, TripFlux</p>
                    </div>
                </section>

                {/* Detailed About Section */}
                <section className="space-y-12 text-left bg-slate-50 p-12 rounded-[40px] border border-slate-100">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Our Heritage</h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                            Founded on the principles of innovation and integrity, TripFlux has rapidly evolved into a leader of tech-enabled travel. We focus on delivering "Value for Innovation," ensuring that every itinerary is optimized for both experience and efficiency. Our growth is fueled by the trust of thousands of travelers who seek more than just a trip—they seek a Flux experience.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Why Choose TripFlux?</h4>
                        <ul className="space-y-3">
                            {[
                                "AI-Synchronized Itineraries: Real-time updates and smart scheduling.",
                                "Premium Local Grounding: Expert support at every destination.",
                                "Transparent Pricing: No hidden costs, just pure exploration.",
                                "Global Connectivity: Seamless booking across Pan India and International borders.",
                                "Niche Specialization: Customized tours for Ladies, Students, and Senior Citizens."
                            ].map((item, i) => (
                                <li key={i} className="flex gap-3 items-start">
                                    <span className="text-indigo-600 font-bold">»</span>
                                    <p className="text-[11px] text-slate-600 font-medium">{item}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-16 px-6 bg-[#0c2d3a] rounded-[40px] text-white">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                        {[
                            { label: 'Global Destinations', value: '50+' },
                            { label: 'Happy Travelers', value: '12,000+' },
                            { label: 'AI Optimized Routes', value: '1,500+' },
                            { label: 'Expert Local Guides', value: '200+' }
                        ].map((stat, i) => (
                            <div key={i} className="space-y-2">
                                <p className="text-4xl font-black tracking-tighter text-indigo-400">{stat.value}</p>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Thank You Section */}
                <section className="space-y-8">
                    <h2 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.4em]">Thank You</h2>
                    <p className="text-[11px] text-slate-500 leading-relaxed max-w-xl mx-auto font-medium">
                        For your continued support and the confidence that you, the traveler, have placed in us. We recognize that our success is a reflection of your trust. We remain dedicated to serving you with unparalleled passion and technological precision.
                    </p>
                </section>

            </div>
        </div>
    );
};

export default AboutUs;
