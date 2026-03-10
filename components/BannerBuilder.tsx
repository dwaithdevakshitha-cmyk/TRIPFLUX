
import React, { useState, useRef, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { toJpeg } from 'html-to-image';

interface BannerBuilderProps {
    packageId?: number;
}

const BannerBuilder: React.FC<BannerBuilderProps> = ({ packageId }) => {
    const [packages, setPackages] = useState<any[]>([]);
    const [selectedPackageId, setSelectedPackageId] = useState<number | null>(packageId || null);
    const [targetLanguage, setTargetLanguage] = useState('Telugu');
    const [loading, setLoading] = useState(false);
    const [format, setFormat] = useState<'Portrait' | 'Square' | 'Banner'>('Portrait');
    const bannerRef = useRef<HTMLDivElement>(null);

    // --- EDITABLE FIELDS ---
    const [brandName, setBrandName] = useState('Tripflux');
    const [brandNameSize, setBrandNameSize] = useState(120);
    const [brandSub, setBrandSub] = useState('Hyderabad');
    const [brandSubSize, setBrandSubSize] = useState(45);

    const [title, setTitle] = useState('TAMIL NADU SPECIAL PACKAGE');
    const [titleSize, setTitleSize] = useState(110);
    const [img1, setImg1] = useState<string | null>(null);
    const [img2, setImg2] = useState<string | null>(null);

    const [dates, setDates] = useState('15-02-2026 నుండి 22-02-2026 వరకు');
    const [datesSize, setDatesSize] = useState(48);
    const [price, setPrice] = useState('22,000/-');
    const [priceSize, setPriceSize] = useState(90);

    const [highlights, setHighlights] = useState<string[]>([
        'అద్భుతమైన పర్యటన అనుభవం',
        'సురక్షితమైన మరియు సౌకర్యవంతమైన ప్రయాణం',
        'రుచికరమైన ఆహారం మరియు వసతి',
        'ప్రధాన దర్శనీయ ప్రదేశాల సందర్శన',
        'అనుభవజ్ఞులైన గైడ్ సహాయం'
    ]);
    const [highSize, setHighSize] = useState(32);

    const [reservationText, setReservationText] = useState('రూ. 5000/- చెల్లించి సీటు రిజర్వ్ చేసుకోగలరు.');
    const [reservationSize, setReservationSize] = useState(36);
    const [rules, setRules] = useState<string[]>([
        "మీ వెంట దుస్తులు తక్కువ లగేజీ, కావలిసిన మందులు తీసుకురావలెను.",
        "ఆటో బాడుగలు, దేవాలయం దర్శన టికెట్లు యాత్రికులు భరించవలెను.",
        "డిస్పోజల్ ప్లేట్స్ మరియు రోజుకు 3 వాటర్ లీటర్ బాటిల్స్ ఇవ్వబడును.",
        "యాత్ర విరమించిన వారికి అడ్వాన్స్ బుకింగ్ వాపస్ ఇవ్వబడదు."
    ]);
    const [ruleSize, setRuleSize] = useState(30);

    const [feature1, setFeature1] = useState('బస్ 2x2 ఎసి పుష్ బ్యాక్');
    const [feature2, setFeature2] = useState('రుచికరమైన భోజనం');
    const [featureSize, setFeatureSize] = useState(42);

    const [sigName, setSigName] = useState('మీ... చమర్తి రెడ్డియ్య రాజు');
    const [sigSize, setSigSize] = useState(30);
    const [phone1, setPhone1] = useState('9825219078');
    const [phone2, setPhone2] = useState('8200671023');
    const [phoneSize, setPhoneSize] = useState(90);
    const [email, setEmail] = useState('raju@vasudevtours.com');
    const [emailSize, setEmailSize] = useState(34);
    const [adminPhoto, setAdminPhoto] = useState('https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png');

    useEffect(() => {
        const fetchPackages = async () => {
            const data = await dbService.getPackagesAdmin();
            setPackages(data);
        };
        fetchPackages();
    }, []);

    const generateContent = async () => {
        if (!selectedPackageId) return;
        setLoading(true);
        try {
            const response = await fetch('/api/admin/generate-banner-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageId: selectedPackageId, targetLanguage })
            });
            const data = await response.json();
            setTitle(data.title ? data.title.toUpperCase() : title);
            setPrice(data.price ? `${data.price}/-` : price);
            if (data.points) setHighlights(data.points);
            setImg1(`https://picsum.photos/seed/travel-${data.destination}/500/500`);
            setImg2(`https://picsum.photos/seed/temple-${data.destination}/500/500`);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleImgUpload = (e: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (slot === 1) setImg1(reader.result as string);
                else setImg2(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const downloadBanner = async () => {
        if (bannerRef.current === null) return;
        setLoading(true);
        await new Promise(r => setTimeout(r, 200));

        try {
            const dimForCapture = getDimensions();
            const dataUrl = await toJpeg(bannerRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                quality: 0.98,
                backgroundColor: '#ffffff',
                width: dimForCapture.w,
                height: dimForCapture.h,
                style: {
                    transform: 'none',
                    margin: '0',
                    padding: '0'
                }
            });
            const link = document.createElement('a');
            link.download = `full-banner.jpg`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Download failed:', err);
            alert('Download issue. Use local uploads for images.');
        } finally {
            setLoading(false);
        }
    };

    const getDimensions = () => {
        switch (format) {
            case 'Square': return { w: 1200, h: 1200, scale: 0.5 };
            case 'Banner': return { w: 1280, h: 720, scale: 0.5 };
            default: return { w: 1200, h: 2000, scale: 0.38 }; // Visible scaling for editor
        }
    };

    const dim = getDimensions();

    return (
        <div className="flex flex-col lg:flex-row gap-8 p-6 bg-white min-h-screen font-sans">
            {/* 🛠️ EDITOR SIDEBAR */}
            <div className="w-full lg:w-[480px] bg-white p-6 rounded-[40px] shadow-2xl border border-slate-100 overflow-y-auto h-[92vh] flex flex-col gap-6 custom-scrollbar">
                <header className="border-b-4 border-indigo-600 pb-2">
                    <h2 className="text-2xl font-black text-indigo-900 italic uppercase">Banner Master</h2>
                </header>

                <div className="bg-slate-900 p-5 rounded-3xl text-white flex flex-col gap-4">
                    <div className="grid grid-cols-3 gap-2">
                        {['Portrait', 'Square', 'Banner'].map(f => (
                            <button key={f} onClick={() => setFormat(f as any)} className={`py-2 px-1 rounded-xl text-[9px] font-black uppercase ${format === f ? 'bg-yellow-400 text-black' : 'bg-white/10'}`}>{f}</button>
                        ))}
                    </div>
                    <div className="flex flex-col gap-3">
                        <select className="p-2.5 bg-white text-black text-xs font-bold rounded-xl" value={selectedPackageId || ''} onChange={(e) => setSelectedPackageId(Number(e.target.value))}>
                            <option value="">Choose Tour Source...</option>
                            {packages.map(p => <option key={p.package_id} value={p.package_id}>{p.name}</option>)}
                        </select>
                        <div className="flex gap-2">
                            <select className="flex-1 p-2.5 bg-white text-black text-xs font-bold rounded-xl" value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
                                <option value="Telugu">Telugu</option>
                                <option value="English">English</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Kannada">Kannada</option>
                            </select>
                            <button onClick={generateContent} className="px-6 bg-indigo-600 text-white font-black text-xs rounded-xl hover:scale-105 transition">✨ AI FETCH</button>
                        </div>
                    </div>
                </div>

                {/* Editor Sections (same functionality, clean UI) */}
                <section className="flex flex-col gap-4 bg-red-50 p-5 rounded-3xl border border-red-100">
                    <h3 className="text-[11px] font-black uppercase text-red-600">1. Header</h3>
                    <input className="p-2 border rounded-xl" value={brandName} onChange={(e) => setBrandName(e.target.value)} />
                    <input type="range" min="40" max="180" value={brandNameSize} onChange={(e) => setBrandNameSize(Number(e.target.value))} />
                    <input className="p-2 border rounded-xl" value={brandSub} onChange={(e) => setBrandSub(e.target.value)} />
                    <input type="range" min="15" max="80" value={brandSubSize} onChange={(e) => setBrandSubSize(Number(e.target.value))} />
                </section>

                <section className="flex flex-col gap-4 bg-amber-50 p-5 rounded-3xl border border-amber-100">
                    <h3 className="text-[11px] font-black uppercase text-amber-600">2. Trip Photos (2)</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <input type="file" onChange={(e) => handleImgUpload(e, 1)} className="text-[9px]" />
                        <input type="file" onChange={(e) => handleImgUpload(e, 2)} className="text-[9px]" />
                    </div>
                </section>

                <section className="flex flex-col gap-4 bg-rose-50 p-5 rounded-3xl border border-rose-100">
                    <h3 className="text-[11px] font-black uppercase text-rose-600">3. Title & Price</h3>
                    <textarea className="p-2 border rounded-xl" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <input type="range" min="40" max="250" value={titleSize} onChange={(e) => setTitleSize(Number(e.target.value))} />
                    <input className="p-2 border rounded-xl" value={dates} onChange={(e) => setDates(e.target.value)} />
                    <input type="range" min="20" max="80" value={datesSize} onChange={(e) => setDatesSize(Number(e.target.value))} />
                    <input className="p-2 border rounded-xl" value={price} onChange={(e) => setPrice(e.target.value)} />
                    <input type="range" min="40" max="180" value={priceSize} onChange={(e) => setPriceSize(Number(e.target.value))} />
                </section>

                <section className="flex flex-col gap-2 bg-indigo-50 p-5 rounded-3xl border border-indigo-100">
                    <h3 className="text-[11px] font-black text-indigo-600 uppercase border-b pb-1">4. Details & Rules</h3>
                    {highlights.map((h, i) => (
                        <input key={i} className="p-2 border rounded-xl text-[10px]" value={h} onChange={(e) => {
                            const next = [...highlights];
                            next[i] = e.target.value;
                            setHighlights(next);
                        }} />
                    ))}
                    <input type="range" min="20" max="60" value={highSize} onChange={(e) => setHighSize(Number(e.target.value))} />
                    <textarea value={reservationText} onChange={(e) => setReservationText(e.target.value)} className="p-2 border rounded-lg text-[10px] bg-yellow-50" />
                    <input type="range" min="20" max="80" value={reservationSize} onChange={(e) => setReservationSize(Number(e.target.value))} />
                    {rules.map((r, i) => (
                        <input key={i} className="p-2 border rounded-lg text-[9px]" value={r} onChange={(e) => {
                            const next = [...rules];
                            next[i] = e.target.value;
                            setRules(next);
                        }} />
                    ))}
                    <input type="range" min="15" max="60" value={ruleSize} onChange={(e) => setRuleSize(Number(e.target.value))} />
                </section>

                <section className="flex flex-col gap-3 bg-fuchsia-50 p-5 rounded-3xl border border-fuchsia-100">
                    <h3 className="text-[11px] font-black uppercase text-fuchsia-600">5. Feature Strip</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <input className="p-2 border rounded-lg text-[10px]" value={feature1} onChange={(e) => setFeature1(e.target.value)} />
                        <input className="p-2 border rounded-lg text-[10px]" value={feature2} onChange={(e) => setFeature2(e.target.value)} />
                    </div>
                    <input type="range" min="20" max="80" value={featureSize} onChange={(e) => setFeatureSize(Number(e.target.value))} />
                </section>

                <section className="flex flex-col gap-4 bg-slate-900 p-6 rounded-[35px] text-white">
                    <h3 className="text-xs font-black text-slate-400">6. Signatory Footer</h3>
                    <input className="p-2 bg-white/10 rounded-xl" value={sigName} onChange={(e) => setSigName(e.target.value)} />
                    <input type="range" min="15" max="60" value={sigSize} onChange={(e) => setSigSize(Number(e.target.value))} />
                    <div className="grid grid-cols-2 gap-2">
                        <input className="p-2 bg-white/10 rounded-xl text-yellow-400" value={phone1} onChange={(e) => setPhone1(e.target.value)} />
                        <input className="p-2 bg-white/10 rounded-xl text-yellow-400" value={phone2} onChange={(e) => setPhone2(e.target.value)} />
                    </div>
                    <input type="range" min="40" max="150" value={phoneSize} onChange={(e) => setPhoneSize(Number(e.target.value))} />
                    <input className="p-2 bg-white/10 rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input type="range" min="20" max="80" value={emailSize} onChange={(e) => setEmailSize(Number(e.target.value))} />
                    <input className="p-2 bg-white/10 rounded-xl text-[9px]" value={adminPhoto} onChange={(e) => setAdminPhoto(e.target.value)} />
                </section>

                <button onClick={downloadBanner} disabled={loading} className="w-full py-6 bg-yellow-400 text-black font-black uppercase text-sm rounded-3xl tracking-[0.4em] hover:shadow-xl transition active:scale-95">📥 DOWNLOAD</button>
            </div>

            {/* 🖥️ BANNER PREVIEW: REBALANCED AND VISIBLE */}
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-100 rounded-[60px] p-4 lg:p-10 relative overflow-hidden">
                <div
                    className="shadow-2xl overflow-y-auto overflow-x-hidden p-4 flex flex-col items-center bg-white rounded-3xl scroll-smooth custom-scrollbar"
                    style={{ width: '100%', height: '100%' }}
                >
                    <div
                        className="origin-top my-4"
                        style={{
                            width: `${dim.w}px`,
                            height: `${dim.h}px`,
                            transform: `scale(${dim.scale})`,
                            marginBottom: `-${(1 - dim.scale) * dim.h}px`
                        }}
                    >
                        <div
                            ref={bannerRef}
                            className="bg-white flex flex-col items-center relative"
                            style={{ width: `${dim.w}px`, height: `${dim.h}px` }}
                        >
                            {/* Header */}
                            <div className="w-[1120px] h-[220px] bg-[#fb1d1d] mt-10 rounded-[110px] border-[12px] border-[#ffd700] flex flex-col items-center justify-center relative shadow-xl flex-shrink-0">
                                <h1 className="font-black text-white italic tracking-tighter drop-shadow-[8px_8px_0px_rgba(0,0,0,0.5)]" style={{ fontSize: `${brandNameSize}px` }}>{brandName}</h1>
                                <p className="text-yellow-300 font-black tracking-widest uppercase" style={{ fontSize: `${brandSubSize}px` }}>{brandSub}</p>
                            </div>

                            {/* Title Section */}
                            <div className="w-full h-[360px] mt-8 flex items-center justify-between px-20 border-y-[12px] border-yellow-400 bg-[#004d00] flex-shrink-0">
                                <div className="w-[310px] h-[310px] rounded-full border-[10px] border-white overflow-hidden shadow-2xl shrink-0 bg-slate-100">
                                    {img1 && <img src={img1} className="w-full h-full object-cover" alt="Pic1" />}
                                </div>
                                <div className="flex-1 px-8 text-center text-yellow-300 drop-shadow-[5px_5px_0px_rgba(0,0,0,1)] font-black tracking-tighter" style={{ fontSize: `${titleSize}px`, lineHeight: '0.85' }}>{title}</div>
                                <div className="w-[310px] h-[310px] rounded-full border-[10px] border-white overflow-hidden shadow-2xl shrink-0 bg-slate-100">
                                    {img2 && <img src={img2} className="w-full h-full object-cover" alt="Pic2" />}
                                </div>
                            </div>

                            {/* Date & Price */}
                            <div className="w-[1140px] bg-[#ccff00] rounded-[70px] border-[10px] border-indigo-950 mt-10 p-10 flex items-center justify-between px-24 shadow-2xl flex-shrink-0">
                                <span className="font-black text-indigo-950 leading-none" style={{ fontSize: `${datesSize}px` }}>{dates}</span>
                                <div className="bg-rose-600 text-white px-16 py-8 rounded-[60px] border-[10px] border-white shadow-2xl min-w-[480px] text-center">
                                    <span className="font-black" style={{ fontSize: `${priceSize}px` }}>{price}</span>
                                </div>
                            </div>

                            {/* Highlights */}
                            <div className="w-[1140px] flex flex-col gap-4 mt-8 bg-white/80 p-10 rounded-[60px] border-4 border-slate-100 shadow-inner flex-shrink-0">
                                {highlights.slice(0, 5).map((h, i) => (
                                    <div key={i} className="flex items-center gap-10">
                                        <span className="text-4xl text-indigo-900 border-2 border-indigo-950 p-2 rounded-lg bg-indigo-50 leading-none">☸️</span>
                                        <p className="font-black text-slate-800 border-b-2 border-slate-100 flex-1" style={{ fontSize: `${highSize}px` }}>{h}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Rules Area */}
                            <div className="w-[1140px] mt-10 flex flex-col items-center gap-4 flex-shrink-0">
                                <div className="w-full bg-yellow-400 p-8 rounded-[50px] border-[10px] border-rose-600 shadow-2xl text-center">
                                    <p className="font-black text-rose-600 tracking-tight" style={{ fontSize: `${reservationSize}px` }}>{reservationText}</p>
                                </div>
                                <div className="w-full bg-[#004d00] rounded-[65px] border-[12px] border-yellow-400 p-12 flex flex-col gap-8 shadow-2xl">
                                    {rules.map((rule, i) => (
                                        <div key={i} className="flex gap-8 text-white border-b border-white/10 pb-4 last:border-0">
                                            <span className="text-4xl text-yellow-400 mt-1">▶️</span>
                                            <p className="font-black leading-tight drop-shadow-md" style={{ fontSize: `${ruleSize}px` }}>{rule}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Feature Strip */}
                            <div className="w-full bg-[#ff00ff] h-[110px] mt-12 flex items-center justify-center gap-48 border-y-8 border-yellow-300 font-black italic text-white flex-shrink-0 shadow-lg" style={{ fontSize: `${featureSize}px` }}>
                                <div className="drop-shadow-lg flex items-center gap-6">🚌 {feature1}</div>
                                <div className="drop-shadow-lg flex items-center gap-6">🍲 {feature2}</div>
                            </div>

                            {/* Signature Footer */}
                            <div className="w-full bg-slate-50 border-t-[14px] border-indigo-950 p-12 flex items-center justify-between px-24 mt-auto flex-shrink-0">
                                <div className="flex items-center gap-14">
                                    <div className="w-56 h-56 rounded-[50px] border-[12px] border-indigo-950 overflow-hidden bg-white shadow-3xl">
                                        <img src={adminPhoto} className="w-full h-full object-cover" alt="Admin" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-black text-indigo-950 opacity-40 italic tracking-wider mb-2" style={{ fontSize: `${sigSize}px` }}>{sigName}</span>
                                        <div className="flex items-center gap-8">
                                            <span className="font-black text-[#15803d] leading-none drop-shadow-sm" style={{ fontSize: `${phoneSize}px` }}>{phone1}</span>
                                            {phone2 && (
                                                <>
                                                    <div className="w-3 h-20 bg-indigo-100 rounded-full"></div>
                                                    <span className="font-black text-[#15803d] leading-none drop-shadow-sm" style={{ fontSize: `${phoneSize}px` }}>{phone2}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col gap-6">
                                    <div className="bg-yellow-300 px-14 py-4 rounded-[40px] border-[6px] border-white shadow-2xl font-black text-3xl uppercase tracking-widest text-indigo-950 text-center">సంప్రదించండి</div>
                                    <div className="font-black text-indigo-600 italic border-b-8 border-indigo-100 pb-2 tracking-tighter" style={{ fontSize: `${emailSize}px` }}>{email}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }`}</style>
        </div>
    );
};

export default BannerBuilder;
