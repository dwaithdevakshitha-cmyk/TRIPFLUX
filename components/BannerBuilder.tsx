import React, { useState, useRef, useEffect } from "react";
import { dbService } from "../services/dbService";
import { toJpeg } from "html-to-image";

interface BannerBuilderProps {
  packageId?: number;
}

const BannerBuilder: React.FC<BannerBuilderProps> = ({ packageId }) => {
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<
    string | number | null
  >(packageId || null);
  const [targetLanguage, setTargetLanguage] = useState("Telugu");
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState<"A4" | "Square" | "Banner">("A4");
  const bannerRef = useRef<HTMLDivElement>(null);

  // --- VISIBILITY CONTROLLERS (ADD/DELETE) ---
  const [visibleSections, setVisibleSections] = useState({
    header: true,
    titleBox: true,
    trip1: true,
    trip2: true,
    highTitle: true,
    highGrid: true,
    reservation: true,
    rules: true,
    footer: true,
  });

  const toggleSection = (section: keyof typeof visibleSections) => {
    setVisibleSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // --- FONTS CONTROLLER ---
  const [fonts, setFonts] = useState({
    header: "system-ui, sans-serif",
    titleBox: "system-ui, sans-serif",
    trip1: "system-ui, sans-serif",
    trip2: "system-ui, sans-serif",
    highTitle: "system-ui, sans-serif",
    highGrid: "system-ui, sans-serif",
    reservation: "system-ui, sans-serif",
    rules: "system-ui, sans-serif",
    footer: "system-ui, sans-serif",
  });

  const handleFontChange = (section: keyof typeof fonts, value: string) => {
    setFonts((prev) => ({ ...prev, [section]: value }));
  };

  const [globalBg, setGlobalBg] = useState("#ffffff");
  const [outerBorderColor, setOuterBorderColor] = useState("#ff9900");
  const [outerBorderWidth, setOuterBorderWidth] = useState(40);
  const [sectionBold, setSectionBold] = useState<Record<string, boolean>>({
    header: true,
    titleBox: true,
    trip1: true,
    trip2: true,
    highTitle: true,
    highGrid: true,
    reservation: true,
    rules: true,
    footer: true,
  });
  const [sectionAlign, setSectionAlign] = useState<Record<string, 'left' | 'center' | 'right'>>({
    header: 'center',
    titleBox: 'center',
    trip1: 'left',
    trip2: 'left',
    highTitle: 'center',
    highGrid: 'left',
    reservation: 'center',
    rules: 'left',
    footer: 'center',
  });

  // --- 1. HEADER ---
  const [headerHeight, setHeaderHeight] = useState(220);
  const [brandName, setBrandName] = useState("వాసుదేవ టూర్స్");
  const [brandNameSize, setBrandNameSize] = useState(130);
  const [brandNameColor, setBrandNameColor] = useState("#ffffff");
  const [brandSub, setBrandSub] = useState(
    "డో.నెం.127, ఆర్.టి.సి. బస్టాండ్ ఎదురుగా, రాజంపేట.",
  );
  const [brandSubSize, setBrandSubSize] = useState(24);
  const [brandSubColor, setBrandSubColor] = useState("#ffff00");
  const [headerBgColor, setHeaderBgColor] = useState("#0088cc");
  const [headerImgL, setHeaderImgL] = useState(
    "https://img.freepik.com/free-photo/lord-shiva-statue-himachal-pradesh-india_53876-14187.jpg",
  );
  const [headerImgR, setHeaderImgR] = useState(
    "https://img.freepik.com/free-photo/ancient-temple-india_181624-34539.jpg",
  );

  // --- 2. MAIN TITLE ---
  const [titleImg, setTitleImg] = useState(
    "https://img.freepik.com/free-photo/beautiful-shiva-statue-world-is-one-shiva-statue-isolated-white-background_1258-261.jpg",
  );
  const [titleBoxHeight, setTitleBoxHeight] = useState(120);
  const [title, setTitle] = useState("కాశీ యాత్ర");
  const [titleSize, setTitleSize] = useState(180);
  const [titleColor, setTitleColor] = useState("#ffff00");
  const [titleBoxColor, setTitleBoxColor] = useState("#660099");

  // --- 3. TRIP OPTION 1 ---
  const [trip1Height, setTrip1Height] = useState(210);
  const [trip1Label, setTrip1Label] = useState(
    "25-03-2026 నుండి 10-04-2026 వరకు",
  );
  const [trip1LabelSize, setTrip1LabelSize] = useState(30);
  const [trip1Details, setTrip1Details] = useState(
    "కాశీ, అయోధ్య, ప్రయాగరాజ్, నైమిశారణ్యం, గయ, బుద్ధగయ కలిపి 16 రోజులు యాత్ర, థర్డ్ ఏసి ట్రైన్ - ఏసి రూమ్స్/ ఏసి బస్సు",
  );
  const [trip1DetailsSize, setTrip1DetailsSize] = useState(24);
  const [trip1DetailsColor, setTrip1DetailsColor] = useState("#003300");
  const [trip1Price, setTrip1Price] = useState("29,500/-");
  const [trip1PriceSize, setTrip1PriceSize] = useState(60);
  const [trip1Bg, setTrip1Bg] = useState("#ccff00");
  const [trainImg, setTrainImg] = useState(
    "https://img.freepik.com/free-photo/indian-train-station-with-railway-tracks_181624-52648.jpg",
  );

  // --- 4. TRIP OPTION 2 ---
  const [trip2Height, setTrip2Height] = useState(210);
  const [trip2Label, setTrip2Label] = useState(
    "26-03-2026 నుండి 07-04-2026 వరకు",
  );
  const [trip2LabelSize, setTrip2LabelSize] = useState(30);
  const [trip2Details, setTrip2Details] = useState(
    "హైదరాబాద్/బెంగళూరు నుండి ప్రయాగరాజ్ విమాన యాత్ర 14 రోజులు",
  );
  const [trip2DetailsSize, setTrip2DetailsSize] = useState(24);
  const [trip2DetailsColor, setTrip2DetailsColor] = useState("#003300");
  const [trip2Price, setTrip2Price] = useState("38,000/-");
  const [trip2PriceSize, setTrip2PriceSize] = useState(60);
  const [trip2Bg, setTrip2Bg] = useState("#ffff99");
  const [planeImg, setPlaneImg] = useState(
    "https://img.freepik.com/free-photo/airplane-flying-cloudy-sky_181624-21952.jpg",
  );

  // --- 5. HIGHLIGHTS HEADER ---
  const [highTitleBarHeight, setHighTitleBarHeight] = useState(60);
  const [highTitle, setHighTitle] = useState("దర్శించవలసిన పుణ్యక్షేత్రాలు");
  const [highTitleSize, setHighTitleSize] = useState(28);
  const [highTitleColor, setHighTitleColor] = useState("#ffffff");
  const [highTitleBg, setHighTitleBg] = useState("#cc0066");

  // --- 6. HIGHLIGHTS GRID ---
  const [highGridHeight, setHighGridHeight] = useState(220);
  const [highlights, setHighlights] = useState<string[]>(Array(14).fill("").map((_, i) => [
    "వైద్యనాథ్ ఝార్ఖండ్", "(జ్యోతిర్లింగం)",
    "జానక్ పూర్", "(సీతాదేవి దర్శనం)",
    "ఖట్మాండు", "(పశుపతి నాథ్)",
    "పోక్రా", "(సైట్ సీయింగ్)",
    "మనోకామిని దేవి", "(శక్తి పీఠం)",
    "లుంబిని", "(బుద్ధుని జన్మస్థలం)",
    "బుధనికంఠ", "(నీటిపై తేలే విష్ణుమూర్తి)",
    "ముక్తినాథ్", "(వైష్ణవ దేవాలయం)",
    "నైమిశారణ్యం", "(చక్ర తీర్థ స్నానం)",
    "అయోధ్య", "(బాలరాముని దర్శనం)",
    "అలహాబాద్", "(త్రివేణి సంఘమం)",
    "ప్రయాగ", "(మాధవేశ్వరి శక్తిపీఠం)",
    "కాశీ, వారణాసి", "(కాశీ విశ్వనాథుని దర్శనం)",
    "", ""
  ][i] || ""));
  const [highSize, setHighSize] = useState(30);
  const [highColor, setHighColor] = useState("#003300");
  const [highDisplayMode, setHighDisplayMode] = useState<"Grid" | "Text">(
    "Grid",
  );

  // --- 7. RESERVATION ---
  const [reservationHeight, setReservationHeight] = useState(100);
  const [reservationText, setReservationText] = useState(
    "8000/- రూ. చెల్లించి సీటు రిజర్వ్ చేసుకోగలరు.",
  );
  const [reservationSize, setReservationSize] = useState(36);
  const [reservationBg, setReservationBg] = useState("#ff9900");
  const [reservationColor, setReservationColor] = useState("#ffffff");

  // --- 8. RULES BOX ---
  const [rulesHeight, setRulesHeight] = useState(320);
  const [rules, setRules] = useState<string[]>([
    "మీ వెంట దుస్తులు తక్కువ లగేజీ, కావలిసిన మందులు తీసుకురావలెను.",
    "ఆటో బాడుగలు, దేవాలయం దర్శన టికెట్లు యాత్రికులు భరించవలెను.",
    "డిస్పోజల్ ప్లేట్స్ మరియు రోజుకు 3 వాటర్ లీటర్ బాటిల్స్ ఇవ్వబడును.",
    "యాత్ర విరమించిన వారికి అడ్వాన్స్ బుకింగ్ వాపస్ ఇవ్వబడదు.",
  ]);
  const [ruleSize, setRuleSize] = useState(22);
  const [busImg, setBusImg] = useState(
    "https://img.freepik.com/free-photo/bus-highway-with-mountains-background_181624-9189.jpg",
  );
  const [ruleDisplayMode, setRuleDisplayMode] = useState<"List" | "Text">(
    "List",
  );
  const [ruleBg, setRuleBg] = useState("#004d00");
  const [ruleColor, setRuleColor] = useState("#ffffff");

  const [footerBarHeight, setFooterBarHeight] = useState(120);
  const [footerContactHeight, setFooterContactHeight] = useState(264);
  const [footerQuestion, setFooterQuestion] = useState("మా ప్రత్యేకతలు");
  const [footerQuestionSize, setFooterQuestionSize] = useState(24);
  const [footerPoints, setFooterPoints] = useState<string[]>([
    "ఏసి రూమ్ కి ఇద్దరు", "బస్ 2x2 ఏసి పుష్ బ్యాక్",
    "అనుభవజ్ఞులైన గైడ్లు", "రుచికరమైన భోజనం"
  ]);
  const [footerPointsSize, setFooterPointsSize] = useState(32);
  const [featureBg, setFeatureBg] = useState("#cc0099");

  const [disclaimer, setDisclaimer] = useState(
    "ఎటువంటి కారణం లేకుండా బ్రోచర్ లో ప్రచారం చేయబడిన ఏదైనా పర్యటనలను మార్చడానికి, సవరించడానికి, వాయిదా వేయడానికి లేదా రద్దు చేయడానికి వాసుదేవ టూర్స్ వారికి సంపూర్ణ హక్కును కలిగివుంది.",
  );
  const [disclaimerSize, setDisclaimerSize] = useState(20);
  const [contactBg, setContactBg] = useState("#ffffff");
  const [gamanikaColor, setGamanikaColor] = useState("#003300");
  const [sigName, setSigName] = useState("మీ... చమర్తి రెడ్డియ్య రాజు");
  const [sigNameSize, setSigNameSize] = useState(24);
  const [phone1, setPhone1] = useState("9825219078");
  const [phoneSize, setPhoneSize] = useState(80);
  const [email, setEmail] = useState("raju@vasudevtours.com");
  const [adminPhoto, setAdminPhoto] = useState(
    "https://img.freepik.com/free-photo/portrait-successful-man-having-typical-south-asian-features_23-2150314488.jpg",
  );

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      try {
        const results = await Promise.allSettled([
          dbService.getPackagesAdmin(),
          dbService.getSignatureTours(),
        ]);
        let combined: any[] = [];
        if (
          results[0].status === "fulfilled" &&
          Array.isArray(results[0].value)
        ) {
          combined = [
            ...combined,
            ...results[0].value.map((p: any) => ({
              ...p,
              source: "admin",
              displayId: p.package_id,
              displayName: p.name,
            })),
          ];
        }
        if (
          results[1].status === "fulfilled" &&
          Array.isArray(results[1].value)
        ) {
          combined = [
            ...combined,
            ...results[1].value.map((p: any) => ({
              ...p,
              source: "signature",
              displayId: p.id,
              displayName: p.title,
            })),
          ];
        }
        setPackages(combined);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const generateContent = async () => {
    if (!selectedPackageId) return;
    setLoading(true);
    try {
      const response = await fetch("/api/admin/generate-banner-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: selectedPackageId, targetLanguage }),
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void,
  ) => {
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
      const originalTransform = bannerRef.current.style.transform;
      const originalMargin = bannerRef.current.style.marginBottom;
      const originalShadow = bannerRef.current.style.boxShadow;

      bannerRef.current.style.transform = "none";
      bannerRef.current.style.marginBottom = "0px";
      bannerRef.current.style.boxShadow = "none";
      bannerRef.current.style.pointerEvents = "auto";

      // Give browser time to recalculate the un-scaled layout rects before capture
      await new Promise((resolve) => setTimeout(resolve, 150));

      const node = bannerRef.current;
      // Do not pass width/height here; let html-to-image use native offsetWidth to avoid double-adding borders
      const dataUrl = await toJpeg(node, {
        cacheBust: true,
        pixelRatio: 1.5,
        quality: 0.95,
        backgroundColor: globalBg,
        style: {
          margin: "0",
        },
      });

      const link = document.createElement("a");
      link.download = `trip-banner-${Date.now()}.jpg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed:", err);
      alert(
        "Download failed. This is usually due to external images. Please use the 'Upload' buttons in the editor to use your own photos, then try downloading again.",
      );
    } finally {
      if (bannerRef.current) {
        const dimForRestore = getDimensions();
        bannerRef.current.style.transform = `scale(${dimForRestore.scale})`;
        bannerRef.current.style.marginBottom = `-${(1 - dimForRestore.scale) * dimForRestore.h}px`;
        bannerRef.current.style.boxShadow = "0 100px 200px rgba(0,0,0,0.5)";
      }
      setLoading(false);
    }
  };


  const getDimensions = () => {
    switch (format) {
      case "Square":
        return { w: 1200, h: 1200, scale: 0.45 };
      case "Banner":
        return { w: 1280, h: 720, scale: 0.45 };
      default:
        return { w: 1240, h: 1754, scale: 0.32 };
    }
  };

  const dim = getDimensions();

  const VisibilityToggle = ({
    section,
    label,
  }: {
    section: keyof typeof visibleSections;
    label: string;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className={`w-full py-1 text-[8px] font-black uppercase rounded mb-2 transition-colors ${visibleSections[section] ? "bg-red-500 text-white hover:bg-red-600" : "bg-green-500 text-white hover:bg-green-600"}`}
    >
      {visibleSections[section] ? `🗑️ Delete ${label}` : `➕ Add ${label}`}
    </button>
  );

  const renderFontSelector = (section: keyof typeof fonts) => (
    <div className="flex flex-col gap-1 mb-2">
      <select
        value={fonts[section]}
        onChange={(e) => handleFontChange(section, e.target.value)}
        className="w-full p-1.5 text-[10px] bg-white border rounded uppercase font-bold text-slate-700"
      >
        <option value="system-ui, sans-serif">Sans-Serif</option>
        <option value="ui-serif, Georgia, serif">Serif</option>
        <option value="ui-monospace, SFMono-Regular, monospace">Monospace</option>
        <option value="Arial, Helvetica, sans-serif">Arial</option>
        <option value="'Times New Roman', Times, serif">Times New</option>
        <option value="Verdana, Geneva, Tahoma, sans-serif">Verdana</option>
        <option value="'Courier New', Courier, monospace">Courier</option>
        <option value="'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif">
          Trebuchet
        </option>
        <option value="Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif">
          Impact
        </option>
        <option value="'Comic Sans MS', 'Comic Sans', cursive">Comic Sans</option>
      </select>
      <div className="flex gap-1">
        <button
          onClick={() => setSectionBold(prev => ({ ...prev, [section]: !prev[section] }))}
          className={`flex-1 py-1 text-[9px] font-black rounded border transition-all ${sectionBold[section] ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-800 border-slate-300"}`}
        >
          BOLD
        </button>
        <select
          value={sectionAlign[section]}
          onChange={(e) => setSectionAlign(prev => ({ ...prev, [section]: e.target.value as any }))}
          className="flex-1 p-1 text-[9px] border rounded bg-white font-bold"
        >
          <option value="left">LEFT</option>
          <option value="center">CENTER</option>
          <option value="right">RIGHT</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-0 bg-slate-100 min-h-screen">
      {/* 🛠️ ORGANIZED MEGA EDITOR */}
      <div className="w-full bg-white border-b shadow-2xl p-4 sticky top-0 z-[60] overflow-hidden">
        <div className="max-w-[1800px] mx-auto flex gap-6 h-[420px] overflow-x-auto custom-scrollbar pb-4">
          {/* SECTION 0: GLOBAL */}
          <div className="min-w-[200px] flex flex-col gap-2 border-r pr-6 shrink-0 overflow-y-auto custom-scrollbar">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase mb-2">
              0. Design & Setup
            </h3>
            <div className="space-y-1">
              <div className="flex gap-2 items-center">
                <label className="text-[8px] font-black opacity-40 uppercase">
                  Border
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={outerBorderWidth}
                  onChange={(e) => setOuterBorderWidth(Number(e.target.value))}
                  className="flex-1 h-3"
                />
                <input
                  type="color"
                  value={outerBorderColor}
                  onChange={(e) => setOuterBorderColor(e.target.value)}
                  className="w-6 h-5"
                />
              </div>
              <div className="flex gap-2 items-center">
                <label className="text-[8px] font-black opacity-40 uppercase">
                  BG Color
                </label>
                <input
                  type="color"
                  value={globalBg}
                  onChange={(e) => setGlobalBg(e.target.value)}
                  className="flex-1 h-5"
                />
              </div>
            </div>
            <select
              className="p-1.5 text-[10px] border rounded font-bold mt-2"
              value={selectedPackageId || ""}
              onChange={(e) => setSelectedPackageId(e.target.value)}
            >
              <option value="">Select Package...</option>
              {packages.map((p) => (
                <option key={`${p.source}-${p.displayId}`} value={p.displayId}>
                  {p.displayName}
                </option>
              ))}
            </select>
            <button
              onClick={generateContent}
              className="w-full py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded uppercase"
            >
              ✨ AI Sync
            </button>
            <button
              disabled={loading}
              onClick={downloadBanner}
              className={`w-full py-2 ${loading ? "bg-slate-400" : "bg-yellow-400"} text-black text-[11px] font-black rounded uppercase shadow-lg mt-1`}
            >
              {loading ? "Processing..." : "📥 DOWNLOAD IMAGE"}
            </button>
          </div>

          {/* SECTION 1: HEADER */}
          <div
            className={`min-w-[260px] flex flex-col gap-1 border-r pr-6 shrink-0 overflow-y-auto custom-scrollbar ${!visibleSections.header ? "opacity-40 grayscale" : ""}`}
          >
            <h3 className="text-[10px] font-black text-blue-600 uppercase mb-1 text-center">
              1. Header
            </h3>
            <VisibilityToggle section="header" label="Header" />
            {renderFontSelector("header")}
            <div className="flex gap-2 mb-1">
              <div className="flex-1">
                <label className="text-[7px] font-black opacity-30 uppercase">
                  Photo L
                </label>
                <input
                  type="file"
                  className="text-[8px]"
                  onChange={(e) => handleFileUpload(e, setHeaderImgL)}
                />
              </div>
              <div className="flex-1">
                <label className="text-[7px] font-black opacity-30 uppercase">
                  Photo R
                </label>
                <input
                  type="file"
                  className="text-[8px]"
                  onChange={(e) => handleFileUpload(e, setHeaderImgR)}
                />
              </div>
            </div>
            <input
              className="p-1 px-2 text-xs border rounded"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={brandNameSize}
                onChange={(e) => setBrandNameSize(Number(e.target.value))}
                className="w-1/2 p-1 text-[10px] border rounded"
              />
              <input
                type="color"
                value={brandNameColor}
                onChange={(e) => setBrandNameColor(e.target.value)}
                className="w-1/2 h-6"
              />
            </div>
            <input
              className="p-1 px-2 text-[10px] border rounded mt-1"
              value={brandSub}
              onChange={(e) => setBrandSub(e.target.value)}
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={brandSubSize}
                onChange={(e) => setBrandSubSize(Number(e.target.value))}
                className="w-1/2 p-1 text-[10px] border rounded"
              />
              <input
                type="color"
                value={brandSubColor}
                onChange={(e) => setBrandSubColor(e.target.value)}
                className="w-1/2 h-6"
              />
            </div>
            <div className="pt-2">
              <label className="text-[8px] font-black opacity-30 uppercase">
                Height
              </label>
              <input
                type="range"
                min="100"
                max="800"
                value={headerHeight}
                onChange={(e) => setHeaderHeight(Number(e.target.value))}
                className="w-full h-3"
              />
              <div className="flex gap-2 items-center mt-1">
                <label className="text-[7px] font-black opacity-30 uppercase">Header BG</label>
                <input
                  type="color"
                  value={headerBgColor}
                  onChange={(e) => setHeaderBgColor(e.target.value)}
                  className="flex-1 h-5 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: MAIN TITLE */}
          <div
            className={`min-w-[180px] flex flex-col gap-1 border-r pr-6 shrink-0 overflow-y-auto custom-scrollbar ${!visibleSections.titleBox ? "opacity-40 grayscale" : ""}`}
          >
            <h3 className="text-[10px] font-black text-purple-600 uppercase mb-1 text-center">
              2. Main Title
            </h3>
            <VisibilityToggle section="titleBox" label="Title" />
            {renderFontSelector("titleBox")}
            <div className="mb-1">
              <label className="text-[7px] font-black opacity-30 uppercase">
                Title Photo
              </label>
              <input
                type="file"
                className="text-[8px] w-full"
                onChange={(e) => handleFileUpload(e, setTitleImg)}
              />
            </div>
            <input
              className="p-1 px-2 text-xs border rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="number"
              value={titleSize}
              onChange={(e) => setTitleSize(Number(e.target.value))}
              className="w-full p-1 text-[10px] border rounded mt-1"
            />
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={titleColor}
                onChange={(e) => setTitleColor(e.target.value)}
                className="flex-1 h-6 rounded"
              />
              <input
                type="color"
                value={titleBoxColor}
                onChange={(e) => setTitleBoxColor(e.target.value)}
                className="flex-1 h-6 rounded"
              />
            </div>
            <div className="pt-2">
              <label className="text-[8px] font-black opacity-30 uppercase">
                Height
              </label>
              <input
                type="range"
                min="50"
                max="600"
                value={titleBoxHeight}
                onChange={(e) => setTitleBoxHeight(Number(e.target.value))}
                className="w-full h-3"
              />
            </div>
          </div>

          {/* SECTION 3: TRIP 1 */}
          <div
            className={`min-w-[280px] flex flex-col gap-1 border-r pr-6 shrink-0 bg-slate-50/50 p-2 rounded overflow-y-auto custom-scrollbar ${!visibleSections.trip1 ? "opacity-40 grayscale" : ""}`}
          >
            <h3 className="text-[10px] font-black text-green-700 uppercase mb-1 text-center">
              3. Trip 1
            </h3>
            <VisibilityToggle section="trip1" label="Trip 1" />
            {renderFontSelector("trip1")}
            <div className="flex gap-2 mb-1">
              <div className="flex-1">
                <label className="text-[7px] font-black opacity-30 uppercase">
                  BG
                </label>
                <input
                  type="color"
                  value={trip1Bg}
                  onChange={(e) => setTrip1Bg(e.target.value)}
                  className="w-full h-5 rounded"
                />
              </div>
              <div className="flex-1">
                <label className="text-[7px] font-black opacity-30 uppercase">
                  Text
                </label>
                <input
                  type="color"
                  value={trip1DetailsColor}
                  onChange={(e) => setTrip1DetailsColor(e.target.value)}
                  className="w-full h-5 rounded"
                />
              </div>
              <div className="flex-1">
                <label className="text-[7px] font-black opacity-30 uppercase">
                  Photo
                </label>
                <input
                  type="file"
                  className="text-[8px]"
                  onChange={(e) => handleFileUpload(e, setTrainImg)}
                />
              </div>
            </div>
            <div className="flex gap-1">
              <input
                className="flex-1 p-1 text-[10px] border rounded"
                value={trip1Label}
                onChange={(e) => setTrip1Label(e.target.value)}
              />
              <input
                type="number"
                value={trip1LabelSize}
                onChange={(e) => setTrip1LabelSize(Number(e.target.value))}
                className="w-10 p-1 text-[10px] border rounded"
              />
            </div>
            <textarea
              className="w-full p-1 text-[10px] border rounded h-12"
              value={trip1Details}
              onChange={(e) => setTrip1Details(e.target.value)}
            />
            <div className="flex gap-1 items-center">
              <input
                type="number"
                value={trip1DetailsSize}
                onChange={(e) => setTrip1DetailsSize(Number(e.target.value))}
                className="w-10 p-1 text-[10px] border rounded"
              />
              <input
                className="w-20 p-1 text-[10px] border rounded font-black ml-auto"
                value={trip1Price}
                onChange={(e) => setTrip1Price(e.target.value)}
              />
              <input
                type="number"
                value={trip1PriceSize}
                onChange={(e) => setTrip1PriceSize(Number(e.target.value))}
                className="w-10 p-1 text-[10px] border rounded"
              />
            </div>
            <div className="pt-2">
              <input
                type="range"
                min="50"
                max="800"
                value={trip1Height}
                onChange={(e) => setTrip1Height(Number(e.target.value))}
                className="w-full h-3"
              />
            </div>
          </div>

          {/* SECTION 4: TRIP 2 */}
          <div
            className={`min-w-[280px] flex flex-col gap-1 border-r pr-6 shrink-0 bg-yellow-50/50 p-2 rounded overflow-y-auto custom-scrollbar ${!visibleSections.trip2 ? "opacity-40 grayscale" : ""}`}
          >
            <h3 className="text-[10px] font-black text-orange-600 uppercase mb-1 text-center">
              4. Trip 2
            </h3>
            <VisibilityToggle section="trip2" label="Trip 2" />
            {renderFontSelector("trip2")}
            <div className="flex gap-2 mb-1">
              <div className="flex-1">
                <label className="text-[7px] font-black opacity-30 uppercase">
                  BG
                </label>
                <input
                  type="color"
                  value={trip2Bg}
                  onChange={(e) => setTrip2Bg(e.target.value)}
                  className="w-full h-5 rounded"
                />
              </div>
              <div className="flex-1">
                <label className="text-[7px] font-black opacity-30 uppercase">
                  Text
                </label>
                <input
                  type="color"
                  value={trip2DetailsColor}
                  onChange={(e) => setTrip2DetailsColor(e.target.value)}
                  className="w-full h-5 rounded"
                />
              </div>
              <div className="flex-1">
                <label className="text-[7px] font-black opacity-30 uppercase">
                  Photo
                </label>
                <input
                  type="file"
                  className="text-[8px]"
                  onChange={(e) => handleFileUpload(e, setPlaneImg)}
                />
              </div>
            </div>
            <div className="flex gap-1">
              <input
                className="flex-1 p-1 text-[10px] border rounded"
                value={trip2Label}
                onChange={(e) => setTrip2Label(e.target.value)}
              />
              <input
                type="number"
                value={trip2LabelSize}
                onChange={(e) => setTrip2LabelSize(Number(e.target.value))}
                className="w-10 p-1 text-[10px] border rounded"
              />
            </div>
            <textarea
              className="w-full p-1 text-[10px] border rounded h-12"
              value={trip2Details}
              onChange={(e) => setTrip2Details(e.target.value)}
            />
            <div className="flex gap-1 items-center">
              <input
                type="number"
                value={trip2DetailsSize}
                onChange={(e) => setTrip2DetailsSize(Number(e.target.value))}
                className="w-10 p-1 text-[10px] border rounded"
              />
              <input
                className="w-20 p-1 text-[10px] border rounded font-black ml-auto"
                value={trip2Price}
                onChange={(e) => setTrip2Price(e.target.value)}
              />
              <input
                type="number"
                value={trip2PriceSize}
                onChange={(e) => setTrip2PriceSize(Number(e.target.value))}
                className="w-10 p-1 text-[10px] border rounded"
              />
            </div>
            <div className="pt-2">
              <input
                type="range"
                min="50"
                max="800"
                value={trip2Height}
                onChange={(e) => setTrip2Height(Number(e.target.value))}
                className="w-full h-3"
              />
            </div>
          </div>

          {/* SECTION 5: BAR */}
          <div
            className={`min-w-[150px] flex flex-col gap-1 border-r pr-6 shrink-0 overflow-y-auto custom-scrollbar ${!visibleSections.highTitle ? "opacity-40 grayscale" : ""}`}
          >
            <h3 className="text-[10px] font-black text-pink-600 uppercase mb-1 text-center">
              5. Title Bar
            </h3>
            <VisibilityToggle section="highTitle" label="Bar" />
            {renderFontSelector("highTitle")}
            <input
              className="p-1 px-2 text-xs border rounded"
              value={highTitle}
              onChange={(e) => setHighTitle(e.target.value)}
            />
            <input
              type="number"
              value={highTitleSize}
              onChange={(e) => setHighTitleSize(Number(e.target.value))}
              className="w-full p-1 text-[10px] border rounded mt-1"
            />
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={highTitleBg}
                onChange={(e) => setHighTitleBg(e.target.value)}
                className="flex-1 h-6 rounded"
              />
              <input
                type="color"
                value={highTitleColor}
                onChange={(e) => setHighTitleColor(e.target.value)}
                className="flex-1 h-6 rounded"
              />
            </div>
            <div className="pt-2">
              <label className="text-[8px] font-black opacity-30 uppercase">
                Height
              </label>
              <input
                type="range"
                min="30"
                max="400"
                value={highTitleBarHeight}
                onChange={(e) => setHighTitleBarHeight(Number(e.target.value))}
                className="w-full h-3"
              />
            </div>
          </div>

          {/* SECTION 6: GRID */}
          <div
            className={`min-w-[280px] flex flex-col gap-1 border-r pr-6 shrink-0 overflow-y-auto custom-scrollbar ${!visibleSections.highGrid ? "opacity-40 grayscale" : ""}`}
          >
            <h3 className="text-[10px] font-black text-emerald-600 uppercase mb-1 text-center">
              6. Points Grid
            </h3>
            <VisibilityToggle section="highGrid" label="Grid" />
            {renderFontSelector("highGrid")}
            <select
              className="w-full p-1.5 text-[10px] bg-sky-50 border border-sky-200 rounded mb-2 uppercase font-black text-sky-800"
              value={highDisplayMode}
              onChange={(e) => setHighDisplayMode(e.target.value as any)}
            >
              <option value="Grid">Input: Grid Layout</option>
              <option value="Text">Input: Plain Text</option>
            </select>
            {highDisplayMode === "Text" ? (
              <textarea
                className="w-full h-[150px] p-2 text-[10px] border rounded overflow-y-auto custom-scrollbar resize-none"
                value={highlights.join("\n")}
                onChange={(e) => setHighlights(e.target.value.split("\n"))}
                placeholder="Enter places to visit (one per line)..."
              />
            ) : (
              <div className="grid grid-cols-2 gap-1 h-[150px] overflow-y-auto custom-scrollbar pr-1">
                {highlights.map((h, i) => (
                  <input
                    key={i}
                    className="p-1 px-1.5 text-[9px] border rounded"
                    value={h}
                    onChange={(e) => {
                      const n = [...highlights];
                      n[i] = e.target.value;
                      setHighlights(n);
                    }}
                  />
                ))}
              </div>
            )}
            <div className="flex gap-2 items-center mt-1">
              <input
                type="number"
                value={highSize}
                onChange={(e) => setHighSize(Number(e.target.value))}
                className="w-12 p-1 text-[10px] border rounded"
              />
              <input
                type="color"
                value={highColor}
                onChange={(e) => setHighColor(e.target.value)}
                className="w-6 h-6 rounded"
              />
            </div>
            <div className="pt-2">
              <label className="text-[8px] font-black opacity-30 uppercase">
                Height
              </label>
              <input
                type="range"
                min="100"
                max="1000"
                value={highGridHeight}
                onChange={(e) => setHighGridHeight(Number(e.target.value))}
                className="w-full h-3"
              />
            </div>
          </div>

          {/* SECTION 7: BUBBLE */}
          <div
            className={`min-w-[180px] flex flex-col gap-1 border-r pr-6 shrink-0 overflow-y-auto custom-scrollbar ${!visibleSections.reservation ? "opacity-40 grayscale" : ""}`}
          >
            <h3 className="text-[10px] font-black text-orange-500 uppercase mb-1 text-center">
              7. Bubble
            </h3>
            <VisibilityToggle section="reservation" label="Bubble" />
            {renderFontSelector("reservation")}
            <textarea
              className="w-full p-1 text-[10px] border rounded h-10"
              value={reservationText}
              onChange={(e) => setReservationText(e.target.value)}
            />
            <div className="flex gap-2 items-center mt-1">
              <input
                type="number"
                value={reservationSize}
                onChange={(e) => setReservationSize(Number(e.target.value))}
                className="w-1/2 p-1 text-[10px] border rounded"
              />
              <input
                type="color"
                value={reservationBg}
                onChange={(e) => setReservationBg(e.target.value)}
                className="w-1/2 h-6 rounded"
              />
            </div>
            <div className="pt-2">
              <label className="text-[8px] font-black opacity-30 uppercase">
                Height
              </label>
              <input
                type="range"
                min="50"
                max="600"
                value={reservationHeight}
                onChange={(e) => setReservationHeight(Number(e.target.value))}
                className="w-full h-3"
              />
            </div>
          </div>

          {/* SECTION 8: RULES */}
          <div
            className={`min-w-[220px] flex flex-col gap-1 border-r pr-6 shrink-0 overflow-y-auto custom-scrollbar ${!visibleSections.rules ? "opacity-40 grayscale" : ""}`}
          >
            <h3 className="text-[10px] font-black text-rose-600 uppercase mb-1 text-center">
              8. Rules
            </h3>
            <VisibilityToggle section="rules" label="Rules" />
            {renderFontSelector("rules")}
            <select
              className="w-full p-1.5 text-[10px] bg-rose-50 border border-rose-200 rounded mb-2 uppercase font-black text-rose-800"
              value={ruleDisplayMode}
              onChange={(e) => setRuleDisplayMode(e.target.value as any)}
            >
              <option value="List">Input: Bullet List</option>
              <option value="Text">Input: Plain Text</option>
            </select>
            <div className="mb-1">
              <label className="text-[7px] font-black opacity-30 uppercase">
                Box Photo
              </label>
              <input
                type="file"
                className="text-[8px]"
                onChange={(e) => handleFileUpload(e, setBusImg)}
              />
            </div>
            {ruleDisplayMode === "Text" ? (
              <textarea
                className="w-full h-[80px] p-2 text-[9px] border rounded overflow-y-auto custom-scrollbar resize-none mt-1"
                value={rules.join("\n")}
                onChange={(e) => setRules(e.target.value.split("\n"))}
                placeholder="Enter rules (one per line)..."
              />
            ) : (
              <div className="flex flex-col gap-1 h-[80px] overflow-y-auto custom-scrollbar pr-1">
                {rules.map((r, i) => (
                  <input
                    key={i}
                    className="p-1 px-2 text-[9px] border rounded"
                    value={r}
                    onChange={(e) => {
                      const n = [...rules];
                      n[i] = e.target.value;
                      setRules(n);
                    }}
                  />
                ))}
              </div>
            )}
            <div className="flex gap-2 items-center mt-1">
              <input
                type="number"
                value={ruleSize}
                onChange={(e) => setRuleSize(Number(e.target.value))}
                className="w-12 p-1 text-[10px] border rounded"
              />
              <input
                type="color"
                value={ruleBg}
                onChange={(e) => setRuleBg(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer"
                title="Box BG Color"
              />
              <input
                type="color"
                value={ruleColor}
                onChange={(e) => setRuleColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer"
                title="Text Color"
              />
            </div>
            <div className="pt-2">
              <label className="text-[8px] font-black opacity-30 uppercase">
                Height
              </label>
              <input
                type="range"
                min="100"
                max="1000"
                value={rulesHeight}
                onChange={(e) => setRulesHeight(Number(e.target.value))}
                className="w-full h-3"
              />
            </div>
          </div>

          {/* SECTION 9: FOOTER */}
          <div
            className={`min-w-[480px] flex flex-col gap-1 shrink-0 overflow-y-auto custom-scrollbar ${!visibleSections.footer ? "opacity-40 grayscale" : ""}`}
          >
            <h3 className="text-[10px] font-black text-slate-800 uppercase mb-1 text-center">
              9. Footer
            </h3>
            <VisibilityToggle section="footer" label="Footer" />
            {renderFontSelector("footer")}
            {/* 9. FOOTER FEATURES */}
            <div className="p-2 bg-slate-50 rounded border mb-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[7px] font-black opacity-30 uppercase">Question</label>
                <div className="flex gap-2 items-center">
                  <label className="text-[7px] font-black opacity-30 uppercase">Size</label>
                  <input
                    type="number"
                    value={footerQuestionSize}
                    onChange={(e) => setFooterQuestionSize(Number(e.target.value))}
                    className="w-10 p-1 text-[8px] border rounded"
                  />
                  <label className="text-[7px] font-black opacity-30 uppercase">BG</label>
                  <input
                    type="color"
                    value={featureBg}
                    onChange={(e) => setFeatureBg(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer"
                  />
                </div>
              </div>
              <input
                className="w-full p-1 text-[10px] border rounded mb-2"
                value={footerQuestion}
                onChange={(e) => setFooterQuestion(e.target.value)}
              />
              <div className="flex justify-between items-center mb-1">
                <label className="text-[7px] font-black opacity-30 uppercase">Grid Points</label>
                <div className="flex gap-2 items-center">
                  <label className="text-[7px] font-black opacity-30 uppercase">Size</label>
                  <input
                    type="number"
                    value={footerPointsSize}
                    onChange={(e) => setFooterPointsSize(Number(e.target.value))}
                    className="w-10 p-1 text-[8px] border rounded"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {footerPoints.map((pt, idx) => (
                  <input
                    key={idx}
                    className="p-1 text-[9px] border rounded"
                    value={pt}
                    onChange={(e) => {
                      const newPts = [...footerPoints];
                      newPts[idx] = e.target.value;
                      setFooterPoints(newPts);
                    }}
                    placeholder={`Point ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2 pr-2 pb-2">
              <div className="space-y-1">
                <div className="p-1 bg-slate-100 rounded border">
                  <label className="text-[8px] font-black uppercase block mb-1">
                    Upload Square Photo
                  </label>
                  <input
                    type="file"
                    className="text-[8px] w-full"
                    onChange={(e) => handleFileUpload(e, setAdminPhoto)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <input
                  className="w-full p-1 text-[10px] border rounded font-black"
                  value={sigName}
                  onChange={(e) => setSigName(e.target.value)}
                />
                <div className="flex gap-1">
                  <input
                    className="flex-1 p-1 text-[10px] border rounded font-black"
                    value={phone1}
                    onChange={(e) => setPhone1(e.target.value)}
                  />
                  <input
                    type="number"
                    value={phoneSize}
                    onChange={(e) => setPhoneSize(Number(e.target.value))}
                    className="w-10 p-1 text-[10px] border rounded"
                  />
                </div>
                <input
                  className="w-full p-1 text-[10px] border rounded font-black lowercase text-indigo-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <textarea
                  className="w-full p-1 text-[8px] border rounded h-10 mt-1"
                  value={disclaimer}
                  onChange={(e) => setDisclaimer(e.target.value)}
                />
                <div className="flex gap-2 items-center mt-1">
                  <label className="text-[7px] font-black opacity-30 uppercase">Size</label>
                  <input
                    type="number"
                    value={disclaimerSize}
                    onChange={(e) => setDisclaimerSize(Number(e.target.value))}
                    className="w-10 p-1 text-[10px] border rounded"
                  />
                  <label className="text-[7px] font-black opacity-30 uppercase">BG</label>
                  <input
                    type="color"
                    value={contactBg}
                    onChange={(e) => setContactBg(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer"
                  />
                  <label className="text-[7px] font-black opacity-30 uppercase">Text</label>
                  <input
                    type="color"
                    value={gamanikaColor}
                    onChange={(e) => setGamanikaColor(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="pt-2">
              <label className="text-[8px] font-black opacity-30 uppercase block">Highlights Bar Height</label>
              <input
                type="range"
                min="50"
                max="500"
                value={footerBarHeight}
                onChange={(e) => setFooterBarHeight(Number(e.target.value))}
                className="w-full h-3 mb-2"
              />
              <label className="text-[8px] font-black opacity-30 uppercase block">Contact Box Height</label>
              <input
                type="range"
                min="80"
                max="800"
                value={footerContactHeight}
                onChange={(e) => setFooterContactHeight(Number(e.target.value))}
                className="w-full h-3"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 🖥️ PREVIEW AREA */}
      <div className="flex-1 flex flex-col items-center py-10 bg-slate-200 overflow-y-auto font-sans">
        <div
          ref={bannerRef}
          className="shadow-[0_100px_200px_rgba(0,0,0,0.5)] origin-top pointer-events-none"
          style={{
            boxSizing: "border-box",
            width: `${dim.w}px`,
            height: `${dim.h}px`,
            transform: `scale(${dim.scale})`,
            marginBottom: `-${(1 - dim.scale) * dim.h}px`,
            border: `${outerBorderWidth}px solid ${outerBorderColor}`,
            backgroundColor: globalBg,
            position: "relative",
          }}
        >
          <div
            className="w-full h-full relative flex flex-col overflow-hidden"
            style={{
              backgroundColor: globalBg,
            }}
          >
            {/* 1. HEADER */}
            {visibleSections.header && (brandName || brandSub || headerImgL || headerImgR) && (
              <div
                className="w-full shrink-0 relative"
                style={{
                  height: `${headerHeight}px`,
                  fontFamily: fonts.header,
                }}
              >
                <div className="absolute inset-x-0 top-0 h-[85%] rounded-b-[120px] border-b-[8px] border-[#ffff00] flex items-center justify-between px-16 z-10 overflow-hidden"
                  style={{
                    backgroundColor: headerBgColor,
                    backgroundImage: `linear-gradient(to bottom, ${headerBgColor}, ${headerBgColor}dd)`
                  }}
                >
                  {/* Decorative Cloud Design - Top Left */}
                  <div className="absolute -top-12 -left-12 w-80 h-48 z-0 pointer-events-none">
                    <svg viewBox="0 0 200 100" className="text-yellow-400 opacity-30 absolute inset-0 scale-110">
                      <circle cx="40" cy="30" r="55" fill="currentColor" />
                      <circle cx="100" cy="20" r="65" fill="currentColor" />
                      <circle cx="160" cy="40" r="55" fill="currentColor" />
                      <circle cx="60" cy="70" r="45" fill="currentColor" />
                    </svg>
                    <svg viewBox="0 0 200 100" className="text-white opacity-20 absolute inset-0">
                      <circle cx="40" cy="30" r="55" fill="currentColor" />
                      <circle cx="100" cy="20" r="65" fill="currentColor" />
                      <circle cx="160" cy="40" r="55" fill="currentColor" />
                      <circle cx="60" cy="70" r="45" fill="currentColor" />
                    </svg>
                  </div>

                  {/* Decorative Cloud Design - Top Right */}
                  <div className="absolute -top-12 -right-12 w-80 h-48 z-0 pointer-events-none scale-x-[-1]">
                    <svg viewBox="0 0 200 100" className="text-yellow-400 opacity-30 absolute inset-0 scale-110">
                      <circle cx="40" cy="30" r="55" fill="currentColor" />
                      <circle cx="100" cy="20" r="65" fill="currentColor" />
                      <circle cx="160" cy="40" r="55" fill="currentColor" />
                      <circle cx="60" cy="70" r="45" fill="currentColor" />
                    </svg>
                    <svg viewBox="0 0 200 100" className="text-white opacity-20 absolute inset-0">
                      <circle cx="40" cy="30" r="55" fill="currentColor" />
                      <circle cx="100" cy="20" r="65" fill="currentColor" />
                      <circle cx="160" cy="40" r="55" fill="currentColor" />
                      <circle cx="60" cy="70" r="45" fill="currentColor" />
                    </svg>
                  </div>
                  {headerImgL && (
                    <div
                      className="shrink-0"
                      style={{
                        width: headerHeight * 0.8 + "px",
                        height: headerHeight * 0.8 + "px",
                      }}
                    >
                      <div className="w-full h-full rounded-full border-[6px] border-[#ffff00] bg-white overflow-hidden shadow-xl">
                        <img
                          src={headerImgL}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  <div className={`flex flex-col items-center flex-1 px-4 ${sectionAlign.header === 'left' ? 'items-start text-left' : sectionAlign.header === 'right' ? 'items-end text-right' : 'items-center text-center'}`}>
                    {brandName && (
                      <h1
                        className="italic drop-shadow-[4px_4px_0px_#cc0000] leading-none"
                        style={{
                          fontSize: `${brandNameSize}px`,
                          color: brandNameColor,
                          fontWeight: sectionBold.header ? '900' : 'normal',
                        }}
                      >
                        {brandName}
                      </h1>
                    )}
                    {brandSub && (
                      <p
                        className="bg-[#cc0000] px-8 py-2 rounded-full uppercase tracking-widest mt-2 whitespace-nowrap"
                        style={{
                          color: brandSubColor,
                          fontSize: `${brandSubSize}px`,
                          fontWeight: sectionBold.header ? '900' : 'normal',
                        }}
                      >
                        {brandSub}
                      </p>
                    )}
                  </div>
                  {headerImgR && (
                    <div
                      className="shrink-0"
                      style={{
                        width: headerHeight * 0.8 + "px",
                        height: headerHeight * 0.8 + "px",
                      }}
                    >
                      <div className="w-full h-full rounded-full border-[6px] border-[#ffff00] bg-white overflow-hidden shadow-xl">
                        <img
                          src={headerImgR}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. TITLE */}
            {visibleSections.titleBox && (title || titleImg) && (
              <div
                className="w-full shrink-0 flex items-center justify-center border-y-[4px] border-black relative overflow-hidden"
                style={{
                  backgroundColor: titleBoxColor,
                  height: `${titleBoxHeight}px`,
                  fontFamily: fonts.titleBox,
                }}
              >
                {titleImg && (
                  <div className="absolute left-10 h-[90%] w-auto z-10 flex items-center">
                    <img
                      src={titleImg}
                      className="h-full w-auto object-contain rounded-xl shadow-lg border-2 border-white/20"
                    />
                  </div>
                )}
                {title && (
                  <h2
                    className="italic z-0"
                    style={{ 
                      fontSize: `${titleSize}px`, 
                      color: titleColor,
                      fontWeight: sectionBold.titleBox ? '900' : 'normal',
                      textAlign: sectionAlign.titleBox,
                      textShadow: `8px 8px 0px #000000, 10px 10px 25px rgba(0,0,0,0.5)`,
                      lineHeight: '0.9',
                      letterSpacing: '-2px'
                    }}
                  >
                    {title}
                  </h2>
                )}
              </div>
            )}

            {/* 3. TRIP 1 */}
            {visibleSections.trip1 && (trip1Label || trip1Details || trip1Price || trainImg) && (
              <div
                className="w-full shrink-0 px-12 pb-4 pt-1 border-b-[4px] border-green-700 flex items-center gap-10 relative overflow-hidden"
                style={{
                  backgroundColor: trip1Bg,
                  minHeight: `${trip1Height}px`,
                  fontFamily: fonts.trip1,
                  textAlign: sectionAlign.trip1,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {trip1Label && (
                  <div
                    className="bg-[#cc0066] text-white px-8 py-3 rounded-2xl border-2 border-white shrink-0 shadow-lg"
                    style={{ 
                      fontSize: `${trip1LabelSize}px`,
                      fontWeight: sectionBold.trip1 ? '900' : 'normal',
                    }}
                  >
                    {trip1Label}
                  </div>
                )}
                {trip1Details && (
                  <div
                    className="flex-1 leading-[1.15] z-10 whitespace-pre-wrap"
                    style={{
                      color: trip1DetailsColor,
                      fontSize: `${trip1DetailsSize}px`,
                      fontWeight: sectionBold.trip1 ? '900' : 'normal',
                    }}
                  >
                    {trip1Details}
                  </div>
                )}
                {trip1Price && (
                  <div className="bg-[#cc0066] text-white px-10 py-6 rounded-[80px] border-[12px] border-white shadow-2xl flex items-center justify-center shrink-0 min-w-[380px] z-10">
                    <span
                      style={{ 
                        fontSize: `${trip1PriceSize}px`,
                        fontWeight: sectionBold.trip1 ? '900' : 'normal',
                      }}
                    >
                      {trip1Price}
                    </span>
                  </div>
                )}
                {trainImg && (
                  <img
                    src={trainImg}
                    className="absolute right-[-20px] bottom-[-20px] w-96 opacity-20 grayscale"
                  />
                )}
              </div>
            )}

            {/* 4. TRIP 2 */}
            {visibleSections.trip2 && (trip2Label || trip2Details || trip2Price || planeImg) && (
              <div
                className="w-full shrink-0 px-12 pb-4 pt-1 border-b-[8px] border-rose-700 flex items-center gap-10 relative overflow-hidden"
                style={{
                  backgroundColor: trip2Bg,
                  minHeight: `${trip2Height}px`,
                  fontFamily: fonts.trip2,
                  textAlign: sectionAlign.trip2,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {trip2Label && (
                  <div
                    className="bg-[#cc0066] text-white px-8 py-3 rounded-2xl border-2 border-white shrink-0 shadow-lg"
                    style={{ 
                      fontSize: `${trip2LabelSize}px`,
                      fontWeight: sectionBold.trip2 ? '900' : 'normal',
                    }}
                  >
                    {trip2Label}
                  </div>
                )}
                {trip2Details && (
                  <div
                    className="flex-1 leading-[1.15] z-10 whitespace-pre-wrap"
                    style={{
                      color: trip2DetailsColor,
                      fontSize: `${trip2DetailsSize}px`,
                      fontWeight: sectionBold.trip2 ? '900' : 'normal',
                    }}
                  >
                    {trip2Details}
                  </div>
                )}
                {trip2Price && (
                  <div className="bg-[#cc0066] text-white px-10 py-6 rounded-[80px] border-[12px] border-white shadow-2xl flex items-center justify-center shrink-0 min-w-[380px] z-10">
                    <span
                      style={{ 
                        fontSize: `${trip2PriceSize}px`,
                        fontWeight: sectionBold.trip2 ? '900' : 'normal',
                      }}
                    >
                      {trip2Price}
                    </span>
                  </div>
                )}
                {planeImg && (
                  <img
                    src={planeImg}
                    className="absolute right-[-20px] top-[-20px] w-96 opacity-20 grayscale"
                  />
                )}
              </div>
            )}

            {/* MIDDLE AREA */}
            {((visibleSections.highTitle && highTitle) ||
              (visibleSections.highGrid && highlights.some((h) => h && h.trim() !== "")) ||
              (visibleSections.reservation && reservationText) ||
              (visibleSections.rules && (rules.some((r) => r && r.trim() !== "") || busImg))) && (
                <div
                  className="flex-grow flex flex-col justify-between overflow-hidden p-8"
                  style={{ backgroundColor: globalBg }}
                >
                  {/* 5 & 6 COMBINED: Title Bar and Grid Block */}
                  {((visibleSections.highTitle && highTitle) || (visibleSections.highGrid && highlights.some((h) => h && h.trim() !== ""))) && (
                    <div className="flex flex-col items-center relative w-full mb-2">
                      {/* 5. Highlight Bar */}
                      {visibleSections.highTitle && highTitle && (
                        <div
                          className="shrink-0 uppercase flex items-center justify-center border-b shadow-sm z-20 relative"
                          style={{
                            backgroundColor: highTitleBg,
                            color: highTitleColor,
                            fontSize: `${highTitleSize}px`,
                            minHeight: `${highTitleBarHeight}px`,
                            fontFamily: fonts.highTitle,
                            fontWeight: sectionBold.highTitle ? '900' : 'normal',
                            textAlign: sectionAlign.highTitle,
                            borderRadius: '40px',
                            width: 'fit-content',
                            margin: visibleSections.highGrid ? '0 auto -35px' : '0 auto 24px',
                            padding: '0 60px',
                            border: '4px solid #ffffff33'
                          }}
                        >
                          {highTitle}
                        </div>
                      )}

                      {/* 6. Grid / Text Block */}
                      {visibleSections.highGrid && (
                        <div
                          className="w-full flex-grow p-10 rounded-[40px] border-[5px] border-amber-800/20 shadow-inner relative z-10"
                          style={{ 
                            backgroundColor: '#fdf6e3',
                            minHeight: `${highGridHeight}px`,
                            fontFamily: fonts.highGrid,
                            paddingTop: visibleSections.highTitle && highTitle ? '60px' : '40px'
                          }}
                        >
                          {highDisplayMode === "Grid" ? (
                          <div className={`grid gap-x-12 gap-y-4 h-full ${highlights.filter(h => h && h.trim() !== "").length === 1 ? 'grid-cols-1 content-center' : 'grid-cols-2'}`}>
                              {highlights.map((h, i) => h ? (
                                <div key={i} className={`flex items-baseline gap-2 ${sectionAlign.highGrid === 'center' ? 'justify-center text-center' : sectionAlign.highGrid === 'right' ? 'justify-end text-right' : 'justify-start text-left'}`}>
                                  <span
                                    className="leading-tight break-words"
                                    style={{
                                      fontSize: `${highSize}px`,
                                      color: highColor,
                                      fontWeight: sectionBold.highGrid ? '900' : 'bold',
                                    }}
                                  >
                                    {h}
                                  </span>
                                </div>
                              ) : null)}
                            </div>
                          ) : (
                            <div
                              className="leading-snug whitespace-pre-wrap w-full"
                              style={{ 
                                fontSize: `${highSize}px`, 
                                color: highColor,
                                fontWeight: sectionBold.highGrid ? '900' : 'normal',
                                textAlign: sectionAlign.highGrid,
                              }}
                            >
                              {highlights.join("\n")}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 7 & 8 COMBINED: Reservation and Rules Box */}
                  {((visibleSections.reservation && reservationText) || (visibleSections.rules && (rules.some(r => r && r.trim() !== "") || busImg))) && (
                    <div className="shrink-0 px-12 mb-4 flex-grow flex flex-col items-center relative w-full pt-4">
                      {/* 7. Reservation Bubble */}
                      {visibleSections.reservation && reservationText && (
                        <div
                          className="flex justify-center shrink-0 z-20 relative w-full"
                          style={{
                            minHeight: visibleSections.rules ? 'auto' : `${reservationHeight}px`,
                            fontFamily: fonts.reservation,
                            marginBottom: visibleSections.rules ? '-45px' : '24px'
                          }}
                        >
                          <div
                            className="px-14 py-4 rounded-full border-[10px] border-green-900 shadow-xl inline-flex items-center justify-center text-center"
                            style={{ backgroundColor: reservationBg }}
                          >
                            <p
                              className="leading-tight whitespace-pre-wrap"
                              style={{
                                color: reservationColor,
                                fontSize: `${reservationSize}px`,
                                fontWeight: sectionBold.reservation ? '900' : 'normal',
                                textAlign: sectionAlign.reservation,
                              }}
                            >
                              {reservationText}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 8. Rules Box */}
                      {visibleSections.rules && (
                        <div
                          className="w-full flex-grow relative z-10"
                          style={{
                            minHeight: `${rulesHeight}px`,
                            fontFamily: fonts.rules,
                          }}
                        >
                          <div className={`h-full rounded-[60px] border-[12px] border-[#ccff00] p-10 ${visibleSections.reservation && reservationText ? 'pt-16 pb-12' : ''} flex justify-between items-center shadow-4xl overflow-hidden`} style={{ backgroundColor: ruleBg }}>
                            {ruleDisplayMode === "List" ? (
                              <div className={`flex flex-col gap-6 h-full ${rules.filter(r => r && r.trim() !== "").length === 1 ? 'justify-center' : 'justify-start'}`}>
                                {rules.slice(0, 4).map((rule, i) => rule ? (
                                  <div key={i} className="flex gap-6 items-start">
                                    <span className="text-yellow-400 text-3xl mt-1">
                                      ▶
                                    </span>
                                    <p
                                      className="leading-tight"
                                      style={{ 
                                        color: ruleColor,
                                        fontSize: `${ruleSize}px`,
                                        fontWeight: sectionBold.rules ? '900' : 'normal',
                                        textAlign: sectionAlign.rules,
                                      }}
                                    >
                                      {rule}
                                    </p>
                                  </div>
                                ) : null)}
                              </div>
                            ) : (
                              <div
                                className="flex-1 leading-relaxed whitespace-pre-wrap w-full pr-8"
                                style={{ 
                                  color: ruleColor,
                                  fontSize: `${ruleSize}px`,
                                  fontWeight: sectionBold.rules ? '900' : 'normal',
                                  textAlign: sectionAlign.rules,
                                }}
                              >
                                {rules.join("\n")}
                              </div>
                            )}
                            {busImg && (
                              <div className="w-[380px] h-[240px] bg-white rounded-[40px] overflow-hidden shadow-2xl border-[10px] border-white ml-10 shrink-0">
                                <img
                                  src={busImg}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            {/* 9. FOOTER */}
            {visibleSections.footer && (disclaimer || sigName || phone1 || email || adminPhoto) && (
              <div
                className="w-full shrink-0"
                style={{ backgroundColor: globalBg, fontFamily: fonts.footer }}
              >
                <div
                  className="px-10 flex items-center justify-between border-b-8 border-indigo-900 overflow-hidden"
                  style={{
                    backgroundColor: featureBg,
                    minHeight: `${footerBarHeight}px`,
                    fontWeight: sectionBold.footer ? '900' : 'normal',
                  }}
                >
                  <div className="bg-white/20 px-8 py-2 rounded-full border-2 border-white/30 shadow-sm flex-none min-w-max mr-8 z-10">
                    <span 
                      className="text-white uppercase tracking-widest font-black whitespace-nowrap"
                      style={{ fontSize: `${footerQuestionSize}px` }}
                    >✨ {footerQuestion} ✨</span>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-2">
                    {footerPoints.map((pt, idx) => pt && (
                      <div key={idx} className="flex items-center gap-3 text-white justify-start">
                        <span className="text-yellow-400 text-3xl shrink-0">☸</span>
                        <span className="leading-tight break-words" style={{ fontSize: `${footerPointsSize}px` }}>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="p-10 flex items-center justify-between shadow-2xl overflow-hidden"
                  style={{
                    height: `${footerContactHeight}px`,
                    backgroundColor: contactBg,
                  }}
                >
                  {disclaimer && (
                    <div
                      className={`${(sigName || phone1 || email || adminPhoto) ? 'w-[55%]' : 'flex-1'} border-l-[15px] border-blue-600 pl-12 italic opacity-80 leading-relaxed whitespace-pre-wrap`}
                      style={{ 
                        color: gamanikaColor,
                        fontSize: `${disclaimerSize}px`,
                        fontWeight: sectionBold.footer ? '900' : 'normal',
                        textAlign: sectionAlign.footer,
                      }}
                    >
                      {disclaimer}
                    </div>
                  )}
                  {(sigName || phone1 || email || adminPhoto) && (
                    <div className="flex-1 flex flex-col items-end">
                      <div className="bg-white border-[12px] border-indigo-950 rounded-[60px] p-8 flex items-center gap-10 shadow-4xl relative">
                        <div className="flex flex-col items-end">
                          {sigName && (
                            <span
                              className="text-indigo-900 italic opacity-60 text-2xl mb-2"
                              style={{ 
                                fontSize: `${sigNameSize}px`,
                                fontWeight: sectionBold.footer ? '900' : 'normal',
                                textAlign: sectionAlign.footer,
                              }}
                            >
                              {sigName}
                            </span>
                          )}
                          {phone1 && (
                            <span
                              className="text-emerald-700 tracking-tighter"
                              style={{ 
                                fontSize: `${phoneSize}px`,
                                fontWeight: sectionBold.footer ? '900' : 'normal',
                                textAlign: sectionAlign.footer,
                              }}
                            >
                              {phone1}
                            </span>
                          )}
                          {email && (
                            <p 
                              className="text-indigo-600 mt-2 text-lg lowercase border-b-4 border-indigo-50"
                              style={{
                                fontWeight: sectionBold.footer ? '900' : 'normal',
                                textAlign: sectionAlign.footer,
                              }}
                            >
                              {email}
                            </p>
                          )}
                        </div>
                        {adminPhoto && (
                          <div className="w-[180px] h-[180px] rounded-[50px] overflow-hidden border-[8px] border-indigo-950 shadow-2xl bg-slate-50 shrink-0">
                            <img
                              src={adminPhoto}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
