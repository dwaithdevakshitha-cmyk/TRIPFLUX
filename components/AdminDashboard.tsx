
import React, { useState, useRef } from 'react';
import { TourPackage, MediaFile, ItineraryDay } from '../types';
import { extractBulkToursFromMedia, generateItineraryForPackage, generateDestinationImage } from '../services/geminiService';

interface AdminDashboardProps {
  onAddTour: (tour: TourPackage) => Promise<void>;
  onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onAddTour, onClose }) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'deploy'>('sync');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState<number | null>(null);

  const [bulkTours, setBulkTours] = useState<Partial<TourPackage>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const results = await extractBulkToursFromMedia(base64, file.type);
      setBulkTours(results.map(r => ({ ...r, id: Math.random().toString(36).substr(2, 9) })));
    } catch (err) {
      console.error(err);
      alert("Bulk analysis failed. Ensure the document is clear.");
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUpdateField = (index: number, field: keyof TourPackage, value: any) => {
    const updated = [...bulkTours];
    updated[index] = { ...updated[index], [field]: value };
    setBulkTours(updated);
  };

  const finalizeBulkPublish = async () => {
    setIsFinalizing(true);
    try {
      for (let i = 0; i < bulkTours.length; i++) {
        setCurrentProcessingIndex(i);
        const tour = bulkTours[i];

        // 1. Generate Day-wise Itinerary
        const itinerary = await generateItineraryForPackage(
          tour.title || '',
          tour.destination || '',
          tour.duration || '3 days'
        );

        // 2. Generate AI Image for Destination
        const image = await generateDestinationImage(tour.destination || tour.title || '');

        // 3. Construct Final Package with specific contact info
        const finalTour: TourPackage = {
          id: tour.id || Math.random().toString(36).substr(2, 9),
          title: tour.title || 'TripFlux Exclusive',
          category: tour.category || 'Domestic',
          destination: tour.destination || 'Various',
          dates: tour.dates || '2025 Season',
          price: tour.price || '₹0',
          priceBasis: tour.priceBasis || 'Per Person',
          duration: tour.duration || '3 days',
          image: image,
          itinerary: itinerary,
          highlights: tour.highlights || [],
          features: tour.features || ['Accommodation', 'Sightseeing', 'Transport'],
          contactPhone: '7036665588',
          contactEmail: 'info@tripfux.com'
        } as TourPackage;

        // 4. Save to DB
        await onAddTour(finalTour);
      }
      alert('All packages processed and published successfully!');
      setBulkTours([]);
    } catch (err) {
      console.error(err);
      alert('Error during finalization pipeline.');
    } finally {
      setIsFinalizing(false);
      setCurrentProcessingIndex(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 pb-32">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">Management Center</h2>
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setActiveTab('sync')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'sync' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              Bulk Package Sync
            </button>
            <button
              onClick={() => setActiveTab('deploy')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'deploy' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              Deployment Protocol
            </button>
          </div>
        </div>
        <button onClick={onClose} className="px-6 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all cursor-pointer">
          Exit Dashboard
        </button>
      </div>

      {activeTab === 'sync' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-12 p-1 bg-gradient-to-tr from-indigo-600 to-slate-900 rounded-[48px] shadow-2xl">
            <div className="bg-white rounded-[46px] p-10">
              <div className="flex flex-col lg:flex-row gap-12 items-center">
                <div className="w-full lg:w-1/3">
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3 mb-3">
                    <span className="text-3xl">📥</span> Bulk Scraper
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase leading-relaxed tracking-widest">
                    Upload a PDF or Image brochure. Our AI will extract individual tours row-by-row for your review before publishing.
                  </p>
                </div>

                <div className="flex-1 w-full">
                  <div
                    className={`relative group border-4 border-dashed rounded-[40px] transition-all flex flex-col items-center justify-center p-12 cursor-pointer ${isAnalyzing ? 'bg-slate-50 border-slate-200 cursor-not-allowed' : 'bg-slate-50 border-indigo-100 hover:border-indigo-600 hover:bg-indigo-50/30'}`}
                    onClick={() => !isAnalyzing && !isFinalizing && fileInputRef.current?.click()}
                  >
                    <input type="file" ref={fileInputRef} onChange={handleBulkUpload} className="hidden" accept="application/pdf,image/*,.docx,.xlsx" />
                    {isAnalyzing ? (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Extracting Tours...</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-3xl shadow-xl mb-4 group-hover:scale-110 transition-transform">📂</div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Drag & Drop File or Click to Select</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {bulkTours.length > 0 && (
            <div className="bg-white p-10 rounded-[50px] shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Review Extracted Packages</h3>
                <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase">
                  {bulkTours.length} Packages Detected
                </div>
              </div>

              <div className="overflow-x-auto no-scrollbar mb-10">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-4 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</th>
                      <th className="pb-4 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                      <th className="pb-4 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Destination</th>
                      <th className="pb-4 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                      <th className="pb-4 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Basis</th>
                      <th className="pb-4 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                      <th className="pb-4 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {bulkTours.map((tour, idx) => (
                      <tr key={tour.id || idx} className={`group ${currentProcessingIndex === idx ? 'bg-indigo-50/50' : 'hover:bg-slate-50/50'}`}>
                        <td className="py-4 px-2">
                          <input
                            value={tour.title || ''}
                            onChange={(e) => handleUpdateField(idx, 'title', e.target.value)}
                            className="w-full bg-transparent border-none outline-none font-bold text-slate-900 focus:text-indigo-600 transition-colors"
                          />
                        </td>
                        <td className="py-4 px-2">
                          <select
                            value={tour.category}
                            onChange={(e) => handleUpdateField(idx, 'category', e.target.value)}
                            className="bg-transparent border-none outline-none font-bold text-slate-500 text-xs"
                          >
                            <option>Domestic</option><option>International</option><option>Honeymoon</option><option>Adventure</option><option>Pilgrimage</option>
                          </select>
                        </td>
                        <td className="py-4 px-2">
                          <input
                            value={tour.destination || ''}
                            onChange={(e) => handleUpdateField(idx, 'destination', e.target.value)}
                            className="w-full bg-transparent border-none outline-none font-bold text-slate-600 text-xs"
                          />
                        </td>
                        <td className="py-4 px-2">
                          <input
                            value={tour.price || ''}
                            onChange={(e) => handleUpdateField(idx, 'price', e.target.value)}
                            className="w-full bg-transparent border-none outline-none font-black text-indigo-600"
                          />
                        </td>
                        <td className="py-4 px-2">
                          <select
                            value={tour.priceBasis}
                            onChange={(e) => handleUpdateField(idx, 'priceBasis', e.target.value)}
                            className="bg-transparent border-none outline-none font-bold text-slate-500 text-xs"
                          >
                            <option>Per Person</option><option>Per Couple</option><option>Group</option>
                          </select>
                        </td>
                        <td className="py-4 px-2">
                          <input
                            value={tour.duration || ''}
                            onChange={(e) => handleUpdateField(idx, 'duration', e.target.value)}
                            className="w-full bg-transparent border-none outline-none font-bold text-slate-600 text-xs"
                          />
                        </td>
                        <td className="py-4 px-2">
                          {currentProcessingIndex === idx ? (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div>
                              <span className="text-[8px] font-black uppercase text-indigo-600">Generating AI...</span>
                            </div>
                          ) : currentProcessingIndex !== null && currentProcessingIndex > idx ? (
                            <span className="text-[8px] font-black uppercase text-emerald-500">Live ✓</span>
                          ) : (
                            <span className="text-[8px] font-black uppercase text-slate-300">Queue</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-10 bg-slate-950 rounded-[40px] text-white">
                <div className="flex gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Workflow Status</p>
                    <p className="text-sm font-bold">Ready to publish to Neon DB Cluster</p>
                  </div>
                </div>

                <button
                  onClick={finalizeBulkPublish}
                  disabled={isFinalizing}
                  className="px-12 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 hover:scale-105 transition-all shadow-2xl shadow-indigo-500/30 disabled:opacity-50 flex items-center gap-4"
                >
                  {isFinalizing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing {currentProcessingIndex !== null ? currentProcessingIndex + 1 : 0} / {bulkTours.length}
                    </>
                  ) : (
                    <>
                      <span className="text-xl">🚀</span>
                      Confirm & Sync to DB
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-200">
                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm">⌨️</span>
                  Admin Terminal
                </h4>
                <div className="space-y-4">
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">Database</span>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">CONNECTED</span>
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-3">
                    <p className="text-xs font-semibold text-slate-600">Accessing project: <span className="font-black text-indigo-600">TripFlux Production</span></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-slate-900 rounded-[50px] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl border border-slate-800">
              <h3 className="text-3xl font-black mb-10 flex items-center gap-3">Cloud Hosting Protocol</h3>
              <div className="space-y-10 font-mono text-xs">
                <div className="p-6 bg-black rounded-2xl border border-white/10 text-indigo-400">npm install -g firebase-tools</div>
                <div className="p-6 bg-black rounded-2xl border border-white/10 text-indigo-400">firebase login</div>
                <div className="p-6 bg-indigo-900/30 rounded-2xl border border-indigo-500/50 text-white animate-pulse">firebase deploy --only hosting</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
