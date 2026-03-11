
import React, { useState, useRef, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { toJpeg } from 'html-to-image';

interface BannerBuilderProps {
    packageId?: number;
}

const BannerBuilder: React.FC<BannerBuilderProps> = ({ packageId }) => {
    const [packages, setPackages] = useState<any[]>([]);
    const [selectedPackageId, setSelectedPackageId] = useState<string | number | null>(packageId || null);
    const [targetLanguage, setTargetLanguage] = useState('Telugu');
    const [loading, setLoading] = useState(false);
    const [format, setFormat] = useState<'A4' | 'Square' | 'Banner'>('A4');
    const bannerRef = useRef<HTMLDivElement>(null);

    // --- VISIBILITY CONTROLLERS (NEW: ADD/DELETE) ---
    const [visibleSections, setVisibleSections] = useState({
        header: true,
        titleBox: true,
        trip1: true,
        trip2: true,
        highTitle: true,
        highGrid: true,
        reservation: true,
        rules: true,
        footer: true
    });

    const toggleSection = (section: keyof typeof visibleSections) => {
        setVisibleSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // --- GLOBAL DESIGN ---
    const [globalBg, setGlobalBg] = useState('#ffffff');
    const [outerBorderColor, setOuterBorderColor] = useState('#ff9900');
    const [outerBorderWidth, setOuterBorderWidth] = useState(40);

    // --- 1. HEADER ---
    const [headerHeight, setHeaderHeight] = useState(220);
    const [brandName, setBrandName] = useState('వాసుదేవ టూర్స్');
    const [brandNameSize, setBrandNameSize] = useState(130);
    const [brandNameColor, setBrandNameColor] = useState('#ffffff');
    const [brandSub, setBrandSub] = useState('డో.నెం.127, ఆర్.టి.సి. బస్టాండ్ ఎదురుగా, రాజంపేట.');
    const [brandSubSize, setBrandSubSize] = useState(24);
    const [brandSubColor, setBrandSubColor] = useState('#ffff00');
    const [headerImgL, setHeaderImgL] = useState('https://img.freepik.com/free-photo/lord-shiva-statue-himachal-pradesh-india_53876-14187.jpg');
    const [headerImgR, setHeaderImgR] = useState('https://img.freepik.com/free-photo/ancient-temple-india_181624-34539.jpg');

    // --- 2. MAIN TITLE ---
    const [titleBoxHeight, setTitleBoxHeight] = useState(120);
    const [title, setTitle] = useState('కాశీ యాత్ర');
    const [titleSize, setTitleSize] = useState(180);
    const [titleColor, setTitleColor] = useState('#ffff00');
    const [titleBoxColor, setTitleBoxColor] = useState('#660099');

    // --- 3. TRIP OPTION 1 ---
    const [trip1Height, setTrip1Height] = useState(210);
    const [trip1Label, setTrip1Label] = useState('25-03-2026 నుండి 10-04-2026 వరకు');
    const [trip1LabelSize, setTrip1LabelSize] = useState(30);
    const [trip1Details, setTrip1Details] = useState('కాశీ, అయోధ్య, ప్రయాగరాజ్, నైమిశారణ్యం, గయ, బుద్ధగయ కలిపి 16 రోజులు యాత్ర, థర్డ్ ఏసి ట్రైన్ - ఏసి రూమ్స్/ ఏసి బస్సు');
    const [trip1DetailsSize, setTrip1DetailsSize] = useState(24);
    const [trip1Price, setTrip1Price] = useState('29,500/-');
    const [trip1PriceSize, setTrip1PriceSize] = useState(60);
    const [trip1Bg, setTrip1Bg] = useState('#ccff00');
    const [trainImg, setTrainImg] = useState('https://img.freepik.com/free-photo/indian-train-station-with-railway-tracks_181624-52648.jpg');

    // --- 4. TRIP OPTION 2 ---
    const [trip2Height, setTrip2Height] = useState(210);
    const [trip2Label, setTrip2Label] = useState('26-03-2026 నుండి 07-04-2026 వరకు');
    const [trip2LabelSize, setTrip2LabelSize] = useState(30);
    const [trip2Details, setTrip2Details] = useState('హైదరాబాద్/బెంగళూరు నుండి ప్రయాగరాజ్ విమాన యాత్ర 14 రోజులు');
    const [trip2DetailsSize, setTrip2DetailsSize] = useState(24);
    const [trip2Price, setTrip2Price] = useState('38,000/-');
    const [trip2PriceSize, setTrip2PriceSize] = useState(60);
    const [trip2Bg, setTrip2Bg] = useState('#ffff99');
    const [planeImg, setPlaneImg] = useState('https://img.freepik.com/free-photo/airplane-flying-cloudy-sky_181624-21952.jpg');

    // --- 5. HIGHLIGHTS HEADER ---
    const [highTitleBarHeight, setHighTitleBarHeight] = useState(60);
    const [highTitle, setHighTitle] = useState('దర్శించవలసిన పుణ్యక్షేత్రాలు');
    const [highTitleSize, setHighTitleSize] = useState(28);
    const [highTitleColor, setHighTitleColor] = useState('#ffffff');
    const [highTitleBg, setHighTitleBg] = useState('#cc0066');

    // --- 6. HIGHLIGHTS GRID ---
    const [highGridHeight, setHighGridHeight] = useState(220);
    const [highlights, setHighlights] = useState<string[]>(['కాశీ విశ్వనాథుని మందిరం', 'అయోధ్య', 'ప్రయాగరాజ్', 'త్రివేణి సంఘమం', 'నైమిశారణ్యం', 'గయ', 'బుద్ధగయ', 'కాశీ విశాలాక్షి', 'సరియు నది']);
    const [highSize, setHighSize] = useState(36);
    const [highColor, setHighColor] = useState('#003300');

    // --- 7. RESERVATION ---
    const [reservationHeight, setReservationHeight] = useState(100);
    const [reservationText, setReservationText] = useState('8000/- రూ. చెల్లించి సీటు రిజర్వ్ చేసుకోగలరు.');
    const [reservationSize, setReservationSize] = useState(36);
    const [reservationBg, setReservationBg] = useState('#ff9900');
    const [reservationColor, setReservationColor] = useState('#ffffff');

    // --- 8. RULES BOX ---
    const [rulesHeight, setRulesHeight] = useState(320);
    const [rules, setRules] = useState<string[]>(["మీ వెంట దుస్తులు తక్కువ లగేజీ, కావలిసిన మందులు తీసుకురావలెను.", "ఆటో బాడుగలు, దేవాలయం దర్శన టికెట్లు యాత్రికులు భరించవలెను.", "డిస్పోజల్ ప్లేట్స్ మరియు రోజుకు 3 వాటర్ లీటర్ బాటిల్స్ ఇవ్వబడును.", "యాత్ర విరమించిన వారికి అడ్వాన్స్ బుకింగ్ వాపస్ ఇవ్వబడదు."]);
    const [ruleSize, setRuleSize] = useState(22);
    const [busImg, setBusImg] = useState('https://img.freepik.com/free-photo/bus-highway-with-mountains-background_181624-9189.jpg');

    // --- 9. FOOTER ---
    const [footerBarHeight, setFooterBarHeight] = useState(80);
    const [footerContactHeight, setFooterContactHeight] = useState(264);
    const [transportDetails, setTransportDetails] = useState('బస్ 2x2 ఏసి పుష్ బ్యాక్');
    const [transportDetailsSize, setTransportDetailsSize] = useState(30);
    const [foodDetails, setFoodDetails] = useState('రుచికరమైన భోజనం (నెల్లూరు వారిచే)');
    const [foodDetailsSize, setFoodDetailsSize] = useState(30);
    const [featureBg, setFeatureBg] = useState('#cc0099');

    const [disclaimer, setDisclaimer] = useState('ఎటువంటి కారణం లేకుండా బ్రోచర్ లో ప్రచారం చేయబడిన ఏదైనా పర్యటనలను మార్చడానికి, సవరించడానికి, వాయిదా వేయడానికి లేదా రద్దు చేయడానికి వాసుదేవ టూర్స్ వారికి సంపూర్ణ హక్కును కలిగివుంది.');
    const [disclaimerSize, setDisclaimerSize] = useState(20);
    const [sigName, setSigName] = useState('మీ... చమర్తి రెడ్డియ్య రాజు');
    const [sigNameSize, setSigNameSize] = useState(24);
    const [phone1, setPhone1] = useState('9825219078');
    const [phoneSize, setPhoneSize] = useState(80);
    const [email, setEmail] = useState('raju@vasudevtours.com');
    const [adminPhoto, setAdminPhoto] = useState('https://img.freepik.com/free-photo/portrait-successful-man-having-typical-south-asian-features_23-2150314488.jpg');

    useEffect(() => {
        const fetchPackages = async () => {
            setLoading(true);
            try {
                const results = await Promise.allSettled([dbService.getPackagesAdmin(), dbService.getSignatureTours()]);
                let combined: any[] = [];
                if (results[0].status === 'fulfilled' && Array.isArray(results[0].value)) {
                    combined = [...combined, ...results[0].value.map((p: any) => ({ ...p, source: 'admin', displayId: p.package_id, displayName: p.name }))];
                }
                if (results[1].status === 'fulfilled' && Array.isArray(results[1].value)) {
                    combined = [...combined, ...results[1].value.map((p: any) => ({ ...p, source: 'signature', displayId: p.id, displayName: p.title }))];
                }
                setPackages(combined);
            } catch (err) { console.error(err); } finally { setLoading(false); }
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
            if (data.title) setTitle(data.title);
            if (data.points) setHighlights(data.points.slice(0, 9));
            if (data.brandName) setBrandName(data.brandName);
            if (data.brandSub) setBrandSub(data.brandSub);
            if (data.highTitle) setHighTitle(data.highTitle);
            if (data.reservationText) setReservationText(data.reservationText);
            if (data.rules) setRules(data.rules);
            if (data.disclaimer) setDisclaimer(data.disclaimer);
            if (data.sigName) setSigName(data.sigName);
            if (data.price) {
                setTrip1Price(`${data.price}/-`);
                setTrip2Price(`${data.price}/-`);
            }
            if (data.tripDetails) {
                setTrip1Details(data.tripDetails);
                setTrip2Details(data.tripDetails);
            }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setter(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const downloadBanner = async () => {
        if (!bannerRef.current) return;
        setLoading(true);
        try {
            const dimForCapture = getDimensions();
            bannerRef.current.style.transform = 'none';
            bannerRef.current.style.pointerEvents = 'auto';

            const node = bannerRef.current;
            const dataUrl = await toJpeg(node, { 
                cacheBust: true, 
                pixelRatio: 1.5,
                quality: 0.95, 
                width: dimForCapture.w, 
                height: dimForCapture.h,
                bgcolor: globalBg,
            });

            const link = document.createElement('a');
            link.download = `trip-banner-${Date.now()}.jpg`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) { 
            console.error("Download failed:", err);
            alert("Download failed. This is usually due to external images. Please use the 'Upload' buttons in the editor to use your own photos, then try downloading again.");
        } finally { 
            setLoading(false); 
        }
    };

    const getDimensions = () => {
        switch (format) {
            case 'Square': return { w: 1200, h: 1200, scale: 0.45 };
            case 'Banner': return { w: 1280, h: 720, scale: 0.45 };
            default: return { w: 1240, h: 1754, scale: 0.32 }; 
        }
    };

    const dim = getDimensions();

    const VisibilityToggle = ({ section, label }: { section: keyof typeof visibleSections, label: string }) => (
        <button 
            onClick={() => toggleSection(section)}
            className={`w-full py-1 text-[8px] font-black uppercase rounded mb-2 transition-colors ${visibleSections[section] ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'}`}
        >
            {visibleSections[section] ? `🗑️ Delete ${label}` : `➕ Add ${label}`}
        </button>
    );

    return (
        <div className="flex flex-col gap-0 bg-slate-100 min-h-screen">
            {/* 🛠️ ORGANIZED MEGA EDITOR - ALL SECTIONS + ADD/DELETE TOGGLES */}
            <div className="w-full bg-white border-b shadow-2xl p-4 sticky top-0 z-[60] overflow-hidden">
                <div className="max-w-[1800px] mx-auto flex gap-6 h-[290px] overflow-x-auto custom-scrollbar pb-4">
                    
                    {/* SECTION 0: GLOBAL */}
                    <div className="min-w-[200px] flex flex-col gap-2 border-r pr-6 shrink-0">
                         <h3 className="text-[10px] font-black text-indigo-600 uppercase mb-2">0. Design & Setup</h3>
                         <div className="space-y-1">
                             <div className="flex gap-2 items-center">
                                 <label className="text-[8px] font-black opacity-40 uppercase">Border</label>
                                 <input type="range" min="0" max="100" value={outerBorderWidth} onChange={e => setOuterBorderWidth(Number(e.target.value))} className="flex-1 h-3" />
                                 <input type="color" value={outerBorderColor} onChange={e => setOuterBorderColor(e.target.value)} className="w-6 h-5" />
                             </div>
                             <div className="flex gap-2 items-center">
                                 <label className="text-[8px] font-black opacity-40 uppercase">BG Color</label>
                                 <input type="color" value={globalBg} onChange={e => setGlobalBg(e.target.value)} className="flex-1 h-5" />
                             </div>
                         </div>
                         <select className="p-1.5 text-[10px] border rounded font-bold mt-2" value={selectedPackageId || ''} onChange={e => setSelectedPackageId(e.target.value)}>
                             <option value="">Select Package...</option>
                             {packages.map(p => <option key={`${p.source}-${p.displayId}`} value={p.displayId}>{p.displayName}</option>)}
                         </select>
                         <button onClick={generateContent} className="w-full py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded uppercase">✨ AI Sync</button>
                         <button 
                            disabled={loading}
                            onClick={downloadBanner} 
                            className={`w-full py-2 ${loading ? 'bg-slate-400' : 'bg-yellow-400'} text-black text-[11px] font-black rounded uppercase shadow-lg mt-1`}
                         >
                             {loading ? 'Processing...' : '📥 DOWNLOAD IMAGE'}
                         </button>
                    </div>

                    {/* SECTION 1: HEADER */}
                    <div className={`min-w-[260px] flex flex-col gap-1 border-r pr-6 shrink-0 ${!visibleSections.header ? 'opacity-40 grayscale' : ''}`}>
                        <h3 className="text-[10px] font-black text-blue-600 uppercase mb-1 text-center">1. Header</h3>
                        <VisibilityToggle section="header" label="Header" />
                        <div className="flex gap-2 mb-1">
                            <div className="flex-1">
                                <label className="text-[7px] font-black opacity-30 uppercase">Photo L</label>
                                <input type="file" className="text-[8px]" onChange={e => handleFileUpload(e, setHeaderImgL)} />
                            </div>
                            <div className="flex-1">
                                <label className="text-[7px] font-black opacity-30 uppercase">Photo R</label>
                                <input type="file" className="text-[8px]" onChange={e => handleFileUpload(e, setHeaderImgR)} />
                            </div>
                        </div>
                        <input className="p-1 px-2 text-xs border rounded" value={brandName} onChange={e => setBrandName(e.target.value)} />
                        <div className="flex gap-2">
                            <input type="number" value={brandNameSize} onChange={e => setBrandNameSize(Number(e.target.value))} className="w-1/2 p-1 text-[10px] border rounded" />
                            <input type="color" value={brandNameColor} onChange={e => setBrandNameColor(e.target.value)} className="w-1/2 h-6" />
                        </div>
                        <input className="p-1 px-2 text-[10px] border rounded mt-1" value={brandSub} onChange={e => setBrandSub(e.target.value)} />
                        <div className="flex gap-2">
                             <input type="number" value={brandSubSize} onChange={e => setBrandSubSize(Number(e.target.value))} className="w-1/2 p-1 text-[10px] border rounded" />
                             <input type="color" value={brandSubColor} onChange={e => setBrandSubColor(e.target.value)} className="w-1/2 h-6" />
                        </div>
                        <div className="mt-auto">
                            <label className="text-[8px] font-black opacity-30 uppercase">Height</label>
                            <input type="range" min="150" max="400" value={headerHeight} onChange={e => setHeaderHeight(Number(e.target.value))} className="w-full h-3" />
                        </div>
                    </div>

                    {/* SECTION 2: MAIN TITLE */}
                    <div className={`min-w-[180px] flex flex-col gap-1 border-r pr-6 shrink-0 ${!visibleSections.titleBox ? 'opacity-40 grayscale' : ''}`}>
                        <h3 className="text-[10px] font-black text-purple-600 uppercase mb-1 text-center">2. Main Title</h3>
                        <VisibilityToggle section="titleBox" label="Title" />
                        <input className="p-1 px-2 text-xs border rounded" value={title} onChange={e => setTitle(e.target.value)} />
                        <input type="number" value={titleSize} onChange={e => setTitleSize(Number(e.target.value))} className="w-full p-1 text-[10px] border rounded mt-1" />
                        <div className="flex gap-2 mt-1">
                             <input type="color" value={titleColor} onChange={e => setTitleColor(e.target.value)} className="flex-1 h-6 rounded" />
                             <input type="color" value={titleBoxColor} onChange={e => setTitleBoxColor(e.target.value)} className="flex-1 h-6 rounded" />
                        </div>
                        <div className="mt-auto">
                            <label className="text-[8px] font-black opacity-30 uppercase">Height</label>
                            <input type="range" min="80" max="300" value={titleBoxHeight} onChange={e => setTitleBoxHeight(Number(e.target.value))} className="w-full h-3" />
                        </div>
                    </div>

                    {/* SECTION 3: TRIP 1 */}
                    <div className={`min-w-[280px] flex flex-col gap-1 border-r pr-6 shrink-0 bg-slate-50/50 p-2 rounded ${!visibleSections.trip1 ? 'opacity-40 grayscale' : ''}`}>
                        <h3 className="text-[10px] font-black text-green-700 uppercase mb-1 text-center">3. Trip 1</h3>
                        <VisibilityToggle section="trip1" label="Trip 1" />
                        <div className="mb-1">
                            <label className="text-[7px] font-black opacity-30 uppercase">Row Photo</label>
                            <input type="file" className="text-[8px]" onChange={e => handleFileUpload(e, setTrainImg)} />
                        </div>
                        <div className="flex gap-1">
                            <input className="flex-1 p-1 text-[10px] border rounded" value={trip1Label} onChange={e => setTrip1Label(e.target.value)} />
                            <input type="number" value={trip1LabelSize} onChange={e => setTrip1LabelSize(Number(e.target.value))} className="w-10 p-1 text-[10px] border rounded" />
                        </div>
                        <textarea className="w-full p-1 text-[10px] border rounded h-12" value={trip1Details} onChange={e => setTrip1Details(e.target.value)} />
                        <div className="flex gap-1 items-center">
                            <input type="number" value={trip1DetailsSize} onChange={e => setTrip1DetailsSize(Number(e.target.value))} className="w-10 p-1 text-[10px] border rounded" />
                            <input className="w-20 p-1 text-[10px] border rounded font-black ml-auto" value={trip1Price} onChange={e => setTrip1Price(e.target.value)} />
                            <input type="number" value={trip1PriceSize} onChange={e => setTrip1PriceSize(Number(e.target.value))} className="w-10 p-1 text-[10px] border rounded" />
                        </div>
                        <div className="mt-auto pt-1">
                            <input type="range" min="150" max="400" value={trip1Height} onChange={e => setTrip1Height(Number(e.target.value))} className="w-full h-3" />
                        </div>
                    </div>

                    {/* SECTION 4: TRIP 2 */}
                    <div className={`min-w-[280px] flex flex-col gap-1 border-r pr-6 shrink-0 bg-yellow-50/50 p-2 rounded ${!visibleSections.trip2 ? 'opacity-40 grayscale' : ''}`}>
                        <h3 className="text-[10px] font-black text-orange-600 uppercase mb-1 text-center">4. Trip 2</h3>
                        <VisibilityToggle section="trip2" label="Trip 2" />
                        <div className="mb-1">
                            <label className="text-[7px] font-black opacity-30 uppercase">Row Photo</label>
                            <input type="file" className="text-[8px]" onChange={e => handleFileUpload(e, setPlaneImg)} />
                        </div>
                        <div className="flex gap-1">
                            <input className="flex-1 p-1 text-[10px] border rounded" value={trip2Label} onChange={e => setTrip2Label(e.target.value)} />
                            <input type="number" value={trip2LabelSize} onChange={e => setTrip2LabelSize(Number(e.target.value))} className="w-10 p-1 text-[10px] border rounded" />
                        </div>
                        <textarea className="w-full p-1 text-[10px] border rounded h-12" value={trip2Details} onChange={e => setTrip2Details(e.target.value)} />
                        <div className="flex gap-1 items-center">
                            <input type="number" value={trip2DetailsSize} onChange={e => setTrip2DetailsSize(Number(e.target.value))} className="w-10 p-1 text-[10px] border rounded" />
                            <input className="w-20 p-1 text-[10px] border rounded font-black ml-auto" value={trip2Price} onChange={e => setTrip2Price(e.target.value)} />
                            <input type="number" value={trip2PriceSize} onChange={e => setTrip2PriceSize(Number(e.target.value))} className="w-10 p-1 text-[10px] border rounded" />
                        </div>
                        <div className="mt-auto pt-1">
                            <input type="range" min="150" max="400" value={trip2Height} onChange={e => setTrip2Height(Number(e.target.value))} className="w-full h-3" />
                        </div>
                    </div>

                    {/* SECTION 5: BAR */}
                    <div className={`min-w-[150px] flex flex-col gap-1 border-r pr-6 shrink-0 ${!visibleSections.highTitle ? 'opacity-40 grayscale' : ''}`}>
                        <h3 className="text-[10px] font-black text-pink-600 uppercase mb-1 text-center">5. Title Bar</h3>
                        <VisibilityToggle section="highTitle" label="Bar" />
                        <input className="p-1 px-2 text-xs border rounded" value={highTitle} onChange={e => setHighTitle(e.target.value)} />
                        <input type="number" value={highTitleSize} onChange={e => setHighTitleSize(Number(e.target.value))} className="w-full p-1 text-[10px] border rounded mt-1" />
                        <div className="flex gap-2 mt-1">
                             <input type="color" value={highTitleBg} onChange={e => setHighTitleBg(e.target.value)} className="flex-1 h-6 rounded" />
                             <input type="color" value={highTitleColor} onChange={e => setHighTitleColor(e.target.value)} className="flex-1 h-6 rounded" />
                        </div>
                        <div className="mt-auto">
                             <label className="text-[8px] font-black opacity-30 uppercase">Height</label>
                             <input type="range" min="40" max="150" value={highTitleBarHeight} onChange={e => setHighTitleBarHeight(Number(e.target.value))} className="w-full h-3" />
                        </div>
                    </div>

                    {/* SECTION 6: GRID */}
                    <div className={`min-w-[280px] flex flex-col gap-1 border-r pr-6 shrink-0 ${!visibleSections.highGrid ? 'opacity-40 grayscale' : ''}`}>
                        <h3 className="text-[10px] font-black text-emerald-600 uppercase mb-1 text-center">6. Points Grid</h3>
                        <VisibilityToggle section="highGrid" label="Grid" />
                        <div className="grid grid-cols-3 gap-1 h-[100px] overflow-y-auto custom-scrollbar pr-1">
                            {highlights.map((h, i) => (
                                <input key={i} className="p-1 text-[8px] border rounded" value={h} onChange={e => {
                                    const n = [...highlights]; n[i] = e.target.value; setHighlights(n);
                                }} />
                            ))}
                        </div>
                        <div className="flex gap-2 items-center mt-1">
                            <input type="number" value={highSize} onChange={e => setHighSize(Number(e.target.value))} className="w-12 p-1 text-[10px] border rounded" />
                            <input type="color" value={highColor} onChange={e => setHighColor(e.target.value)} className="w-6 h-6 rounded" />
                        </div>
                        <div className="mt-auto">
                            <label className="text-[8px] font-black opacity-30 uppercase">Height</label>
                            <input type="range" min="100" max="500" value={highGridHeight} onChange={e => setHighGridHeight(Number(e.target.value))} className="w-full h-3" />
                        </div>
                    </div>

                    {/* SECTION 7: BUBBLE */}
                    <div className={`min-w-[180px] flex flex-col gap-1 border-r pr-6 shrink-0 ${!visibleSections.reservation ? 'opacity-40 grayscale' : ''}`}>
                        <h3 className="text-[10px] font-black text-orange-500 uppercase mb-1 text-center">7. Bubble</h3>
                        <VisibilityToggle section="reservation" label="Bubble" />
                        <textarea className="w-full p-1 text-[10px] border rounded h-10" value={reservationText} onChange={e => setReservationText(e.target.value)} />
                        <div className="flex gap-2 items-center mt-1">
                            <input type="number" value={reservationSize} onChange={e => setReservationSize(Number(e.target.value))} className="w-1/2 p-1 text-[10px] border rounded" />
                            <input type="color" value={reservationBg} onChange={e => setReservationBg(e.target.value)} className="w-1/2 h-6 rounded" />
                        </div>
                        <div className="mt-auto">
                            <label className="text-[8px] font-black opacity-30 uppercase">Height</label>
                            <input type="range" min="60" max="250" value={reservationHeight} onChange={e => setReservationHeight(Number(e.target.value))} className="w-full h-3" />
                        </div>
                    </div>

                    {/* SECTION 8: RULES */}
                    <div className={`min-w-[220px] flex flex-col gap-1 border-r pr-6 shrink-0 ${!visibleSections.rules ? 'opacity-40 grayscale' : ''}`}>
                        <h3 className="text-[10px] font-black text-rose-600 uppercase mb-1 text-center">8. Rules</h3>
                        <VisibilityToggle section="rules" label="Rules" />
                        <div className="mb-1">
                            <label className="text-[7px] font-black opacity-30 uppercase">Box Photo</label>
                            <input type="file" className="text-[8px]" onChange={e => handleFileUpload(e, setBusImg)} />
                        </div>
                        <div className="flex flex-col gap-1 h-[80px] overflow-y-auto custom-scrollbar pr-1">
                            {rules.map((r, i) => (
                                <input key={i} className="p-1 px-2 text-[9px] border rounded" value={r} onChange={e => {
                                    const n = [...rules]; n[i] = e.target.value; setRules(n);
                                }} />
                            ))}
                        </div>
                        <input type="number" value={ruleSize} onChange={e => setRuleSize(Number(e.target.value))} className="w-full p-1 text-[10px] border rounded mt-1" />
                        <div className="mt-auto">
                            <label className="text-[8px] font-black opacity-30 uppercase">Height</label>
                            <input type="range" min="150" max="500" value={rulesHeight} onChange={e => setRulesHeight(Number(e.target.value))} className="w-full h-3" />
                        </div>
                    </div>

                    {/* SECTION 9: FOOTER */}
                    <div className={`min-w-[480px] flex flex-col gap-1 shrink-0 ${!visibleSections.footer ? 'opacity-40 grayscale' : ''}`}>
                         <h3 className="text-[10px] font-black text-slate-800 uppercase mb-1 text-center">9. Footer</h3>
                         <VisibilityToggle section="footer" label="Footer" />
                         <div className="grid grid-cols-2 gap-4 h-[150px] overflow-y-auto custom-scrollbar pr-2">
                             <div className="space-y-1">
                                 <div className="p-1 bg-slate-100 rounded border">
                                     <label className="text-[8px] font-black uppercase block mb-1">Upload Square Photo</label>
                                     <input type="file" className="text-[8px] w-full" onChange={e => handleFileUpload(e, setAdminPhoto)} />
                                 </div>
                                 <input className="w-full p-1 text-[10px] border rounded" value={transportDetails} onChange={e => setTransportDetails(e.target.value)} />
                                 <input className="w-full p-1 text-[10px] border rounded" value={foodDetails} onChange={e => setFoodDetails(e.target.value)} />
                                 <div className="flex gap-2">
                                     <input type="number" value={transportDetailsSize} onChange={e => setTransportDetailsSize(Number(e.target.value))} className="w-1/2 p-1 text-[10px] border rounded" />
                                     <input type="number" value={foodDetailsSize} onChange={e => setFoodDetailsSize(Number(e.target.value))} className="w-1/2 p-1 text-[10px] border rounded" />
                                 </div>
                             </div>
                             <div className="space-y-1">
                                 <input className="w-full p-1 text-[10px] border rounded font-black" value={sigName} onChange={e => setSigName(e.target.value)} />
                                 <div className="flex gap-1">
                                    <input className="flex-1 p-1 text-[10px] border rounded font-black" value={phone1} onChange={e => setPhone1(e.target.value)} />
                                    <input type="number" value={phoneSize} onChange={e => setPhoneSize(Number(e.target.value))} className="w-10 p-1 text-[10px] border rounded" />
                                 </div>
                                 <textarea className="w-full p-1 text-[8px] border rounded h-10 mt-1" value={disclaimer} onChange={e => setDisclaimer(e.target.value)} />
                             </div>
                         </div>
                         <div className="grid grid-cols-2 gap-2 mt-auto">
                            <input type="range" min="40" max="150" value={footerBarHeight} onChange={e => setFooterBarHeight(Number(e.target.value))} className="w-full h-3" />
                            <input type="range" min="200" max="400" value={footerContactHeight} onChange={e => setFooterContactHeight(Number(e.target.value))} className="w-full h-3" />
                         </div>
                    </div>

                </div>
            </div>

            {/* 🖥️ PREVIEW AREA - CONDITIONAL RENDERING */}
            <div className="flex-1 flex flex-col items-center py-10 bg-slate-200 overflow-y-auto font-sans">
                <div 
                    className="shadow-[0_100px_200px_rgba(0,0,0,0.5)] origin-top pointer-events-none box-content"
                    style={{ 
                        width: `${dim.w}px`, 
                        height: `${dim.h}px`, 
                        transform: `scale(${dim.scale})`,
                        marginBottom: `-${(1 - dim.scale) * dim.h}px`,
                        border: `${outerBorderWidth}px solid ${outerBorderColor}`,
                        backgroundColor: globalBg
                    }}
                >
                    <div ref={bannerRef} className="w-full h-full relative flex flex-col overflow-hidden" style={{ width: `${dim.w}px`, height: `${dim.h}px`, backgroundColor: globalBg }}>
                        
                        {/* 1. HEADER */}
                        {visibleSections.header && (
                            <div className="w-full shrink-0 relative" style={{ height: `${headerHeight}px` }}>
                                <div className="absolute inset-x-0 top-0 h-[85%] bg-gradient-to-b from-[#0088cc] to-[#0055aa] rounded-b-[120px] border-b-[8px] border-[#ffff00] flex items-center justify-between px-16 z-10">
                                    <div className="shrink-0" style={{ width: headerHeight*0.8+'px', height: headerHeight*0.8+'px' }}>
                                        <div className="w-full h-full rounded-full border-[6px] border-[#ffff00] bg-white overflow-hidden shadow-xl"><img src={headerImgL} className="w-full h-full object-cover" /></div>
                                    </div>
                                    <div className="flex flex-col items-center flex-1 text-center px-4">
                                        <h1 className="font-black italic drop-shadow-[4px_4px_0px_#cc0000] leading-none" style={{ fontSize: `${brandNameSize}px`, color: brandNameColor }}>{brandName}</h1>
                                        <p className="font-bold bg-[#cc0000] px-8 py-2 rounded-full uppercase tracking-widest mt-2 whitespace-nowrap" style={{ color: brandSubColor, fontSize: `${brandSubSize}px` }}>{brandSub}</p>
                                    </div>
                                    <div className="shrink-0" style={{ width: headerHeight*0.8+'px', height: headerHeight*0.8+'px' }}>
                                        <div className="w-full h-full rounded-full border-[6px] border-[#ffff00] bg-white overflow-hidden shadow-xl"><img src={headerImgR} className="w-full h-full object-cover" /></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. TITLE */}
                        {visibleSections.titleBox && (
                            <div className="w-full shrink-0 flex items-center justify-center border-y-[4px] border-black" style={{ backgroundColor: titleBoxColor, height: `${titleBoxHeight}px` }}>
                                <h2 className="font-black italic drop-shadow-[8px_8px_0px_#000000]" style={{ fontSize: `${titleSize}px`, color: titleColor }}>{title}</h2>
                            </div>
                        )}

                        {/* 3. TRIP 1 */}
                        {visibleSections.trip1 && (
                            <div className="w-full shrink-0 px-12 pb-4 pt-1 border-b-[4px] border-green-700 flex items-center gap-10 relative overflow-hidden" style={{ backgroundColor: trip1Bg, height: `${trip1Height}px` }}>
                                <div className="bg-[#cc0066] text-white px-8 py-3 rounded-2xl font-black border-2 border-white shrink-0 shadow-lg" style={{ fontSize: `${trip1LabelSize}px` }}>{trip1Label}</div>
                                <div className="flex-1 font-bold leading-[1.15] z-10" style={{ color: '#003300', fontSize: `${trip1DetailsSize}px` }}>{trip1Details}</div>
                                <div className="bg-[#cc0066] text-white px-10 py-6 rounded-[80px] border-[12px] border-white shadow-2xl flex items-center justify-center shrink-0 min-w-[380px] z-10">
                                    <span className="font-black" style={{ fontSize: `${trip1PriceSize}px` }}>{trip1Price}</span>
                                </div>
                                <img src={trainImg} className="absolute right-[-20px] bottom-[-20px] w-96 opacity-20 grayscale" />
                            </div>
                        )}

                        {/* 4. TRIP 2 */}
                        {visibleSections.trip2 && (
                            <div className="w-full shrink-0 px-12 pb-4 pt-1 border-b-[8px] border-rose-700 flex items-center gap-10 relative overflow-hidden" style={{ backgroundColor: trip2Bg, height: `${trip2Height}px` }}>
                                <div className="bg-[#cc0066] text-white px-8 py-3 rounded-2xl font-black border-2 border-white shrink-0 shadow-lg" style={{ fontSize: `${trip2LabelSize}px` }}>{trip2Label}</div>
                                <div className="flex-1 font-bold leading-[1.15] z-10" style={{ color: '#003300', fontSize: `${trip2DetailsSize}px` }}>{trip2Details}</div>
                                <div className="bg-[#cc0066] text-white px-10 py-6 rounded-[80px] border-[12px] border-white shadow-2xl flex items-center justify-center shrink-0 min-w-[380px] z-10">
                                    <span className="font-black" style={{ fontSize: `${trip2PriceSize}px` }}>{trip2Price}</span>
                                </div>
                                <img src={planeImg} className="absolute right-[-20px] top-[-20px] w-96 opacity-20 grayscale" />
                            </div>
                        )}

                        {/* MIDDLE AREA (5, 6, 7, 8) */}
                        <div className="flex-grow flex flex-col overflow-hidden p-8" style={{ backgroundColor: globalBg }}>
                             {/* 5. Highlight Bar */}
                             {visibleSections.highTitle && (
                                <div className="w-full shrink-0 text-center font-black uppercase flex items-center justify-center border-b mb-6 shadow-sm" style={{ backgroundColor: highTitleBg, color: highTitleColor, fontSize: `${highTitleSize}px`, height: `${highTitleBarHeight}px` }}>✨ {highTitle} ✨</div>
                             )}
                             
                             {/* 6. Grid */}
                             {visibleSections.highGrid && (
                                <div className="grid grid-cols-3 gap-y-12 gap-x-12 px-12 flex-grow" style={{ height: `${highGridHeight}px` }}>
                                    {highlights.map((h, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="w-14 h-14 flex-shrink-0 bg-[#004d00] rounded-xl border-2 border-yellow-400 flex items-center justify-center shadow-lg"><span className="text-3xl text-yellow-300">☸</span></div>
                                            <span className="font-black leading-none tracking-tighter" style={{ fontSize: `${highSize}px`, color: highColor }}>{h}</span>
                                        </div>
                                    ))}
                                </div>
                             )}

                             {/* 7. Reservation */}
                             {visibleSections.reservation && (
                                <div className="flex justify-center shrink-0 my-6" style={{ height: `${reservationHeight}px` }}>
                                    <div className="px-14 py-4 rounded-full border-[10px] border-green-900 shadow-xl flex items-center justify-center" style={{ backgroundColor: reservationBg }}>
                                        <p className="font-black text-center leading-none" style={{ color: reservationColor, fontSize: `${reservationSize}px` }}>{reservationText}</p>
                                    </div>
                                </div>
                             )}

                             {/* 8. Rules Box */}
                             {visibleSections.rules && (
                                <div className="shrink-0 px-12 mb-4" style={{ height: `${rulesHeight}px` }}>
                                    <div className="h-full bg-[#004d00] rounded-[60px] border-[12px] border-[#ccff00] p-10 flex justify-between items-center shadow-4xl overflow-hidden">
                                        <div className="flex flex-col gap-6">
                                            {rules.slice(0, 4).map((rule, i) => (
                                                <div key={i} className="flex gap-6 items-start">
                                                    <span className="text-yellow-400 text-3xl mt-1">▶</span>
                                                    <p className="text-white font-bold leading-tight" style={{ fontSize: `${ruleSize}px` }}>{rule}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="w-[380px] h-[240px] bg-white rounded-[40px] overflow-hidden shadow-2xl border-[10px] border-white ml-10 shrink-0"><img src={busImg} className="w-full h-full object-cover" /></div>
                                    </div>
                                </div>
                             )}
                        </div>

                         {/* 9. FOOTER */}
                        {visibleSections.footer && (
                            <div className="w-full shrink-0" style={{ backgroundColor: globalBg }}>
                                <div className="w-full grid grid-cols-2 border-y-[10px] border-[#ffff00] font-black italic shadow-2xl overflow-hidden" style={{ backgroundColor: featureBg, height: `${footerBarHeight}px` }}>
                                    <div className="flex items-center px-10 border-r-[4px] border-white/30 gap-6">
                                        <span className="bg-white px-6 py-1 rounded-lg uppercase tracking-widest text-xl not-italic" style={{ color: featureBg }}>TRAVEL</span>
                                        <span className="text-white whitespace-nowrap" style={{ fontSize: `${transportDetailsSize}px` }}>{transportDetails}</span>
                                    </div>
                                    <div className="flex items-center px-10 gap-6">
                                        <span className="bg-white px-6 py-1 rounded-lg uppercase tracking-widest text-xl not-italic" style={{ color: featureBg }}>FOOD</span>
                                        <span className="text-white whitespace-nowrap" style={{ fontSize: `${foodDetailsSize}px` }}>{foodDetails}</span>
                                    </div>
                                </div>

                                <div className="p-10 flex items-center justify-between shadow-2xl overflow-hidden" style={{ height: `${footerContactHeight}px`, backgroundColor: '#ffffff' }}>
                                    <div className="w-[55%] font-bold border-l-[15px] border-blue-600 pl-12 italic text-[#003300] opacity-80 leading-relaxed" style={{ fontSize: `${disclaimerSize}px` }}>{disclaimer}</div>
                                    <div className="flex-1 flex flex-col items-end">
                                        <div className="bg-white border-[12px] border-indigo-950 rounded-[60px] p-8 flex items-center gap-10 shadow-4xl relative">
                                            <div className="flex flex-col items-end">
                                                    <span className="text-indigo-900 font-black italic opacity-60 text-2xl mb-2" style={{ fontSize: `${sigNameSize}px` }}>{sigName}</span>
                                                    <span className="text-emerald-700 font-black tracking-tighter" style={{ fontSize: `${phoneSize}px` }}>{phone1}</span>
                                                    <p className="text-indigo-600 font-bold mt-2 text-lg lowercase border-b-4 border-indigo-50">{email}</p>
                                            </div>
                                            <div className="w-[180px] h-[180px] rounded-[50px] overflow-hidden border-[8px] border-indigo-950 shadow-2xl bg-slate-50 shrink-0"><img src={adminPhoto} className="w-full h-full object-cover" /></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
            `}</style>
        </div>
    );
};

export default BannerBuilder;
