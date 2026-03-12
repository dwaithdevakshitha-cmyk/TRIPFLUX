import React, { useState, useRef } from 'react';
import { TourPackage } from '../types';
import { dbService } from '../services/dbService';
import BannerBuilder from './BannerBuilder';

interface AdminDashboardProps {
  onClose: () => void;
  onLogout?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'associates' | 'rankings' | 'packages' | 'bookings' | 'commissions' | 'payouts' | 'promocodes' | 'refunds' | 'commissionlevels' | 'traveldates' | 'bannergen'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');

  const [associatesList, setAssociatesList] = useState<any[]>([]);
  const [associateSearch, setAssociateSearch] = useState('');

  const [rankingsList, setRankingsList] = useState<any[]>([]);
  const [rankingSearch, setRankingSearch] = useState('');

  const [packagesList, setPackagesList] = useState<any[]>([]);
  const [packageSearch, setPackageSearch] = useState('');

  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [bookingSearch, setBookingSearch] = useState('');

  const [commissionsList, setCommissionsList] = useState<any[]>([]);
  const [commissionSearch, setCommissionSearch] = useState('');

  const [payoutsList, setPayoutsList] = useState<any[]>([]);
  const [payoutSearch, setPayoutSearch] = useState('');

  const [promoCodesList, setPromoCodesList] = useState<any[]>([]);
  const [promoCodeSearch, setPromoCodeSearch] = useState('');

  const [refundsList, setRefundsList] = useState<any[]>([]);
  const [refundSearch, setRefundSearch] = useState('');

  const [commissionLevelsList, setCommissionLevelsList] = useState<any[]>([]);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState<number | null>(null);
  const [newLevelData, setNewLevelData] = useState({ level: '', percentage: '' });

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAssociates: 0,
    totalPackages: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingCommissions: 0
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newPackage, setNewPackage] = useState({
    name: '',
    destination: '',
    duration: '',
    price: '',
    category: 'Domestic',
    image: '',
    location: '',
    track: '',
    status: 'active'
  });

  const [itineraryRows, setItineraryRows] = useState<{ day: number; activity: string; description: string }[]>([]);

  const addItineraryRow = () => {
    const nextDay = itineraryRows.length > 0 ? Math.max(...itineraryRows.map(r => r.day)) + 1 : 1;
    setItineraryRows([...itineraryRows, { day: nextDay, activity: '', description: '' }]);
  };

  const removeItineraryRow = (index: number) => {
    setItineraryRows(itineraryRows.filter((_, i) => i !== index));
  };

  const updateItineraryRow = (index: number, field: string, value: any) => {
    const updated = [...itineraryRows];
    updated[index] = { ...updated[index], [field]: value };
    setItineraryRows(updated);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPackage({ ...newPackage, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeTab === 'overview') setStats(await dbService.getAdminStats());
        if (activeTab === 'users') setUsersList(await dbService.getUsers());
        if (activeTab === 'associates') setAssociatesList(await dbService.getAssociates());
        if (activeTab === 'rankings') setRankingsList(await dbService.getAssociateRankings());
        if (activeTab === 'packages') setPackagesList(await dbService.getPackagesAdmin());
        if (activeTab === 'bookings') setBookingsList(await dbService.getBookingsAdmin());
        if (activeTab === 'commissions') setCommissionsList(await dbService.getCommissionsAdmin());
        if (activeTab === 'payouts') setPayoutsList(await dbService.getPayoutsAdmin());
        if (activeTab === 'promocodes') setPromoCodesList(await dbService.getPromoCodesAdmin());
        if (activeTab === 'refunds') setRefundsList(await dbService.getRefundsAdmin());
        if (activeTab === 'commissionlevels') setCommissionLevelsList(await dbService.getCommissionLevelsAdmin());
        if (activeTab === 'traveldates') setPackagesList(await dbService.getPackagesAdmin());
      } catch (e) {
        console.error("Fetch area error:", e);
      }
    };
    fetchData();
  }, [activeTab]);

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackage.name || !newPackage.destination || !newPackage.price || !newPackage.duration) {
      alert("Please fill in all required fields.");
      return;
    }

    const formattedItinerary: any[] = [];
    const daysMap = new Map<number, any>();

    itineraryRows.forEach(row => {
      if (!daysMap.has(row.day)) {
        daysMap.set(row.day, { day: row.day, title: `Day ${row.day}`, activities: [] });
      }
      daysMap.get(row.day).activities.push({
        time: '', // empty as requested to remove
        activity: row.activity,
        description: row.description
      });
    });

    const finalItinerary = Array.from(daysMap.values()).sort((a, b) => a.day - b.day);

    setIsSaving(true);
    try {
      const packageData = { ...newPackage, itinerary: finalItinerary };
      if (editingPackageId) {
        await dbService.updatePackageAdmin({ ...packageData, package_id: editingPackageId });
        alert("Package updated successfully!");
      } else {
        await dbService.createPackageAdmin(packageData);
        alert("Package added successfully!");
      }

      setShowAddModal(false);
      setEditingPackageId(null);
      setNewPackage({
        name: '',
        destination: '',
        duration: '',
        price: '',
        category: 'Domestic',
        image: '',
        location: '',
        track: '',
        status: 'active'
      });
      setItineraryRows([]);
      setPackagesList(await dbService.getPackagesAdmin());
    } catch (err) {
      console.error("Failed to save package", err);
      alert("Error saving package. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLevelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const l = parseInt(newLevelData.level);
    const p = parseFloat(newLevelData.percentage);

    if (isNaN(l) || isNaN(p)) {
      alert("Invalid input values.");
      return;
    }

    if (p < 0 || p > 100) {
      alert("Percentage must be between 0 and 100.");
      return;
    }

    // Check unique level for new levels
    if (!editingLevel && commissionLevelsList.find(cl => cl.level === l)) {
      alert("Level number already exists.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingLevel) {
        await dbService.updateCommissionLevelAdmin({ level: editingLevel, percentage: p });
      } else {
        await dbService.createCommissionLevelAdmin({ level: l, percentage: p });
      }
      setCommissionLevelsList(await dbService.getCommissionLevelsAdmin());
      setShowLevelModal(false);
      setEditingLevel(null);
      setNewLevelData({ level: '', percentage: '' });
    } catch (err) {
      console.error(err);
      alert("Failed to save commission level.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Header Toggle */}
      <div className="lg:hidden bg-slate-900 p-4 flex justify-between items-center sticky top-0 z-[60] shadow-lg">
        <h2 className="text-xl font-black text-white tracking-tight">TripFlux</h2>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-white bg-indigo-600 rounded-lg"
        >
          {isSidebarOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Sidebar - Fixed on desktop, overlay on mobile */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        h-full lg:h-screen overflow-y-auto shadow-2xl
      `}>
        <div className="p-6 pb-2">
          <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-1">TripFlux</h2>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Admin Command</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {[
            { id: 'overview', icon: '📊', label: 'Dashboard' },
            { id: 'users', icon: '👥', label: 'Users' },
            { id: 'associates', icon: '💼', label: 'Associates' },
            { id: 'rankings', icon: '🏆', label: 'Rankings' },
            { id: 'packages', icon: '📦', label: 'Packages' },
            { id: 'bookings', icon: '📅', label: 'Bookings' },
            { id: 'commissions', icon: '💰', label: 'Commissions' },
            { id: 'payouts', icon: '💸', label: 'Payouts' },
            { id: 'promocodes', icon: '🎟️', label: 'Promo Codes' },
            { id: 'refunds', icon: '🔄', label: 'Refunds' },
            { id: 'commissionlevels', icon: '⚖️', label: 'Commission Levels' },
            { id: 'traveldates', icon: '📅', label: 'Travel Dates' },
            { id: 'bannergen', icon: '✨', label: 'AI Smart Banner' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setIsSidebarOpen(false); // Close on selection on mobile
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[11px] font-black uppercase tracking-wider">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800 flex flex-col gap-2">
          <button onClick={onClose} className="w-full px-4 py-3 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
            <span>🏠</span> Go to Home Page
          </button>
          <button onClick={onLogout} className="w-full px-4 py-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
            <span>🚪</span> Logout
          </button>
        </div>
      </div>

      {/* Sidebar Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 p-4 md:p-8 lg:p-12 overflow-x-hidden">

        {activeTab === 'overview' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
                { label: 'Total Associates', value: stats.totalAssociates, icon: '💼' },
                { label: 'Total Packages', value: stats.totalPackages, icon: '📦' },
                { label: 'Total Bookings', value: stats.totalBookings, icon: '📅' },
                { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: '💰' },
                { label: 'Pending Commissions', value: `₹${stats.pendingCommissions.toLocaleString()}`, icon: '⏳' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                  </div>
                  <div className="text-4xl bg-indigo-50 w-16 h-16 flex items-center justify-center rounded-2xl">
                    {stat.icon}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'users' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-8 rounded-3xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900 uppercase">User Management</h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search Users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b uppercase text-[10px] font-black text-slate-400">
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Joined</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.filter(u => `${u.first_name} ${u.last_name} ${u.email} ${u.phone}`.toLowerCase().includes(userSearch.toLowerCase())).map(u => (
                    <tr key={u.user_id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-bold">{u.first_name} {u.last_name}</td>
                      <td className="p-3 text-sm">{u.email}</td>
                      <td className="p-3 text-sm">{u.phone}</td>
                      <td className="p-3 text-[10px] uppercase font-bold">
                        <span className={`px-2 py-1 rounded ${u.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="p-3">
                        <button
                          onClick={async () => {
                            const newStatus = u.status === 'active' ? 'inactive' : 'active';
                            await dbService.updateUserStatus(u.user_id, newStatus);
                            setUsersList(await dbService.getUsers());
                          }}
                          className={`text-xs px-3 py-1 rounded font-bold ${u.status === 'active' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {u.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'associates' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-8 rounded-3xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900 uppercase">Associate Management</h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search Associates..."
                  value={associateSearch}
                  onChange={(e) => setAssociateSearch(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b uppercase text-[10px] font-black text-slate-400">
                    <th className="p-3">Name / Parent</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">PAN</th>
                    <th className="p-3">KYC</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {associatesList.filter(u => `${u.first_name} ${u.last_name} ${u.email} ${u.phone} ${u.pan_number}`.toLowerCase().includes(associateSearch.toLowerCase())).map(u => (
                    <tr key={u.user_id} className="border-b hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-bold">{u.first_name} {u.last_name}</div>
                        <div className="text-[10px] text-slate-400">Parent: {u.parent_associate_id || 'None'}</div>
                      </td>
                      <td className="p-3 text-sm">
                        <div>{u.email}</div>
                        <div className="text-slate-500">{u.phone}</div>
                      </td>
                      <td className="p-3 text-sm font-mono">{u.pan_number || 'N/A'}</td>
                      <td className="p-3 text-[10px] uppercase font-bold">
                        <span className={`px-2 py-1 rounded ${u.kyc_status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {u.kyc_status || 'Pending'}
                        </span>
                      </td>
                      <td className="p-3 text-[10px] uppercase font-bold">
                        <span className={`px-2 py-1 rounded ${u.status === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-700'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3 flex flex-wrap gap-2">
                        <button
                          onClick={async () => {
                            const nextKyc = u.kyc_status === 'approved' ? 'pending' : 'approved';
                            await dbService.updateAssociateKyc(u.user_id, nextKyc);
                            setAssociatesList(await dbService.getAssociates());
                          }}
                          className={`text-[10px] px-2 py-1 rounded font-bold ${u.kyc_status === 'approved' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {u.kyc_status === 'approved' ? 'Revoke KYC' : 'Approve KYC'}
                        </button>
                        <button
                          onClick={async () => {
                            const newStatus = u.status === 'active' ? 'suspended' : 'active';
                            await dbService.updateAssociateStatus(u.user_id, newStatus);
                            setAssociatesList(await dbService.getAssociates());
                          }}
                          className={`text-[10px] px-2 py-1 rounded font-bold ${u.status === 'active' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'rankings' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-8 rounded-3xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900 uppercase">Associate Rankings</h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search Rank/ID/Name..."
                  value={rankingSearch}
                  onChange={(e) => setRankingSearch(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b uppercase text-[10px] font-black text-slate-400">
                    <th className="p-3">Associate Name</th>
                    <th className="p-3">Associate ID</th>
                    <th className="p-3 text-center">Rank</th>
                    <th className="p-3 text-right">Team Turnover</th>
                    <th className="p-3 text-center">Downline</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingsList.filter(r => `${r.name} ${r.custom_id} ${r.rank}`.toLowerCase().includes(rankingSearch.toLowerCase())).map((r, idx) => (
                    <tr key={idx} className="border-b hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 uppercase tracking-wider">{r.name}</div>
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded text-xs">{r.custom_id}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${r.rank === 'Crown Associate' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' :
                          r.rank === 'Platinum Associate' ? 'bg-slate-200 text-slate-800' :
                            r.rank === 'Diamond Associate' ? 'bg-indigo-400 text-white' :
                              r.rank === 'Gold Associate' ? 'bg-amber-400 text-amber-950' :
                                r.rank === 'Silver Associate' ? 'bg-slate-400 text-slate-900' :
                                  r.rank === 'Bronze Associate' ? 'bg-orange-700 text-white' :
                                    'bg-slate-800 text-slate-400'
                          }`}>
                          {r.rank || 'Associate'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-slate-900 font-black tracking-tight text-sm">₹{parseFloat(r.team_turnover).toLocaleString('en-IN')}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-slate-500 font-bold text-xs">{r.downline_count} Members</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'packages' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-8 rounded-3xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900 uppercase">Package Management</h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search Packages..."
                  value={packageSearch}
                  onChange={(e) => setPackageSearch(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm"
                />
                <button className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs uppercase hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20" onClick={() => {
                  setEditingPackageId(null);
                  setNewPackage({
                    name: '',
                    destination: '',
                    duration: '',
                    price: '',
                    category: 'Domestic',
                    image: '',
                    location: '',
                    track: '',
                    status: 'active'
                  });
                  setItineraryRows([]);
                  setShowAddModal(true);
                }}>
                  + New Package
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b uppercase text-[10px] font-black text-slate-400">
                    <th className="p-3">Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Destination</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {packagesList.filter(p => `${p.name} ${p.destination}`.toLowerCase().includes(packageSearch.toLowerCase())).map(p => (
                    <tr key={p.package_id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-bold">{p.name}</td>
                      <td className="p-3 text-[10px] uppercase font-medium">{p.category}</td>
                      <td className="p-3 text-sm">{p.destination}</td>
                      <td className="p-3 text-sm font-mono">₹{p.price}</td>
                      <td className="p-3 text-sm">{p.duration}</td>
                      <td className="p-3 text-[10px] uppercase font-bold">
                        <span className={`px-2 py-1 rounded ${p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 flex gap-2">
                        <button
                          onClick={() => {
                            setEditingPackageId(p.package_id);
                            setNewPackage({
                              name: p.name,
                              destination: p.destination,
                              duration: p.duration,
                              price: p.price.toString(),
                              category: p.category || 'Domestic',
                              image: p.image || '',
                              location: p.location || '',
                              track: p.track || '',
                              status: p.status
                            });

                            // Load itinerary rows
                            const rows: { day: number; activity: string; description: string }[] = [];
                            if (p.itinerary && Array.isArray(p.itinerary)) {
                              p.itinerary.forEach((day: any) => {
                                if (day.activities && Array.isArray(day.activities)) {
                                  day.activities.forEach((act: any) => {
                                    rows.push({
                                      day: day.day,
                                      activity: act.activity,
                                      description: act.description
                                    });
                                  });
                                }
                              });
                            }
                            setItineraryRows(rows);
                            setShowAddModal(true);
                          }}
                          className="text-[10px] px-2 py-1 rounded font-bold bg-indigo-50 text-indigo-600">
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            const newStatus = p.status === 'active' ? 'inactive' : 'active';
                            await dbService.updatePackageStatus(p.package_id, newStatus);
                            setPackagesList(await dbService.getPackagesAdmin());
                          }}
                          className={`text-[10px] px-2 py-1 rounded font-bold ${p.status === 'active' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          Toggle Status
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Delete this package permanently?')) {
                              await dbService.deletePackageAdmin(p.package_id);
                              setPackagesList(await dbService.getPackagesAdmin());
                            }
                          }}
                          className="text-[10px] px-2 py-1 rounded font-bold bg-red-50 text-red-600">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'bookings' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-8 rounded-3xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900 uppercase">Booking Management</h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search Bookings..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b uppercase text-[10px] font-black text-slate-400">
                    <th className="p-3">ID</th>
                    <th className="p-3">Passenger</th>
                    <th className="p-3">Associate</th>
                    <th className="p-3">Package</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingsList.map(b => (
                    <tr key={b.booking_id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-mono text-xs">#{b.booking_id}</td>
                      <td className="p-3 font-bold">{b.user_first_name} {b.user_last_name}</td>
                      <td className="p-3 text-sm text-indigo-600">{b.assoc_first_name} {b.assoc_last_name}</td>
                      <td className="p-3 text-sm">{b.package_name}</td>
                      <td className="p-3 text-sm">{new Date(b.travel_date).toLocaleDateString()}</td>
                      <td className="p-3 text-sm font-mono">₹{b.total_amount}</td>
                      <td className="p-3 text-[10px] uppercase font-bold">
                        <span className={`px-2 py-1 rounded ${b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          className="text-xs border border-slate-200 rounded p-1"
                          value={b.status}
                          onChange={async (e) => {
                            await dbService.updateBookingStatus(b.booking_id, e.target.value);
                            setBookingsList(await dbService.getBookingsAdmin());
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'commissions' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-8 rounded-3xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900 uppercase">Commission Management</h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search Commissions..."
                  value={commissionSearch}
                  onChange={(e) => setCommissionSearch(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b uppercase text-[10px] font-black text-slate-400">
                    <th className="p-3">ID</th>
                    <th className="p-3">Assoc ID</th>
                    <th className="p-3">Booking ID</th>
                    <th className="p-3">Level</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {commissionsList.map(c => (
                    <tr key={c.commission_id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-mono text-xs">#{c.commission_id}</td>
                      <td className="p-3 text-sm font-bold">Assoc #{c.associate_id}</td>
                      <td className="p-3 text-sm">Booking #{c.booking_id}</td>
                      <td className="p-3 text-sm">Lvl {c.level || 1}</td>
                      <td className="p-3 text-sm font-mono text-emerald-600">₹{c.commission_amount}</td>
                      <td className="p-3 text-[10px] uppercase font-bold">
                        <span className={`px-2 py-1 rounded ${c.status === 'paid' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={async () => {
                            const newStatus = c.status === 'paid' ? 'pending' : 'paid';
                            await dbService.updateCommissionStatus(c.commission_id, newStatus);
                            setCommissionsList(await dbService.getCommissionsAdmin());
                          }}
                          className={`text-[10px] px-2 py-1 rounded font-bold ${c.status === 'paid' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          Mark as {c.status === 'paid' ? 'Pending' : 'Paid'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'payouts' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-8 rounded-3xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900 uppercase">Payout Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b uppercase text-[10px] font-black text-slate-400">
                    <th className="p-3">Payout ID</th>
                    <th className="p-3">Associate ID</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Mode</th>
                    <th className="p-3">Ref ID</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payoutsList.map(p => (
                    <tr key={p.payout_id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-mono text-xs">#{p.payout_id}</td>
                      <td className="p-3 text-sm font-bold">Assoc #{p.associate_id}</td>
                      <td className="p-3 text-sm font-mono text-emerald-600">₹{p.amount}</td>
                      <td className="p-3 text-sm uppercase text-[10px] font-bold">{p.payment_mode}</td>
                      <td className="p-3 text-sm font-mono text-xs">{p.transaction_reference}</td>
                      <td className="p-3 text-sm text-slate-500">{new Date(p.paid_at).toLocaleString()}</td>
                      <td className="p-3 text-[10px] uppercase font-bold">
                        <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'promocodes' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-8 rounded-3xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900 uppercase">Promo Code Tracking</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b uppercase text-[10px] font-black text-slate-400">
                    <th className="p-3">Code</th>
                    <th className="p-3">Associate ID</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {promoCodesList.map(p => (
                    <tr key={p.promo_id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-bold font-mono text-indigo-600">{p.code}</td>
                      <td className="p-3 text-sm font-bold">Assoc #{p.associate_id}</td>
                      <td className="p-3 text-[10px] uppercase font-bold">
                        <span className={`px-2 py-1 rounded ${p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-slate-500">{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'refunds' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-8 rounded-3xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900 uppercase">Refund Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b uppercase text-[10px] font-black text-slate-400">
                    <th className="p-3">Refund ID</th>
                    <th className="p-3">Booking ID</th>
                    <th className="p-3">Gateway Ref</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {refundsList.map(r => (
                    <tr key={r.refund_id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-mono text-xs">#{r.refund_id}</td>
                      <td className="p-3 text-sm font-bold">Booking #{r.booking_id}</td>
                      <td className="p-3 font-mono text-xs">{r.payment_id}</td>
                      <td className="p-3 text-sm font-mono text-red-600">₹{r.amount}</td>
                      <td className="p-3 text-sm max-w-xs truncate">{r.reason}</td>
                      <td className="p-3 text-[10px] uppercase font-bold">
                        <span className={`px-2 py-1 rounded ${r.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : r.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          className="text-xs border border-slate-200 rounded p-1"
                          value={r.status}
                          onChange={async (e) => {
                            await dbService.updateRefundStatus(r.refund_id, e.target.value);
                            setRefundsList(await dbService.getRefundsAdmin());
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'commissionlevels' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-8 rounded-3xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900 uppercase">Commission Levels</h3>
              <button
                onClick={() => {
                  setEditingLevel(null);
                  setNewLevelData({ level: '', percentage: '' });
                  setShowLevelModal(true);
                }}
                className="px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-indigo-600/30 uppercase text-xs tracking-widest"
              >
                + New Level
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b uppercase text-[10px] font-black text-slate-400">
                    <th className="p-3">Level</th>
                    <th className="p-3">Percentage (%)</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {commissionLevelsList.map(cl => (
                    <tr key={cl.level} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">Level {cl.level}</td>
                      <td className="p-3 font-mono font-bold text-indigo-600">{cl.percentage}%</td>
                      <td className="p-3 flex gap-2">
                        <button
                          onClick={() => {
                            setEditingLevel(cl.level);
                            setNewLevelData({ level: cl.level.toString(), percentage: cl.percentage.toString() });
                            setShowLevelModal(true);
                          }}
                          className="text-[10px] px-2 py-1 rounded font-bold bg-indigo-50 text-indigo-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Are you sure you want to delete Level ${cl.level}? This may affect future commission calculations.`)) {
                              await dbService.deleteCommissionLevelAdmin(cl.level);
                              setCommissionLevelsList(await dbService.getCommissionLevelsAdmin());
                            }
                          }}
                          className="text-[10px] px-2 py-1 rounded font-bold bg-red-50 text-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'traveldates' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-8 rounded-3xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900 uppercase">Travel Dates Management</h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search Packages..."
                  value={packageSearch}
                  onChange={(e) => setPackageSearch(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b uppercase text-[10px] font-black text-slate-400">
                    <th className="p-3">Package Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Current Dates</th>
                    <th className="p-3">Manage Dates</th>
                  </tr>
                </thead>
                <tbody>
                  {packagesList.filter(p => p.name.toLowerCase().includes(packageSearch.toLowerCase())).map(p => (
                    <tr key={p.package_id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-bold">{p.name}</td>
                      <td className="p-3 text-[10px] uppercase font-medium">{p.category}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {p.dates && p.dates !== '2025 Flexible' ? (
                            p.dates.split(',').map((date: string, idx: number) => (
                              <span key={idx} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold border border-indigo-100">
                                {date.trim()}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[10px] font-bold italic uppercase tracking-widest">
                              {p.dates || 'No Dates Set'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="date"
                            id={`add-date-${p.package_id}`}
                            className="text-xs border border-slate-200 rounded p-1.5 focus:border-indigo-500 outline-none"
                          />
                          <button
                            onClick={async () => {
                              const input = document.getElementById(`add-date-${p.package_id}`) as HTMLInputElement;
                              const newDate = input.value;
                              if (!newDate) return;

                              let currentDatesRaw = p.dates === '2025 Flexible' || !p.dates ? '' : p.dates;
                              let dateArray = currentDatesRaw.split(',').map((d: string) => d.trim()).filter(Boolean);

                              if (dateArray.includes(newDate)) {
                                alert('This date is already added.');
                                return;
                              }

                              dateArray.push(newDate);
                              dateArray.sort();
                              const finalDates = dateArray.join(',');

                              try {
                                await dbService.updatePackageDates(p.package_id, finalDates);
                                input.value = '';
                                setPackagesList(await dbService.getPackagesAdmin());
                              } catch (err) {
                                alert('Failed to add date');
                              }
                            }}
                            className="bg-indigo-600 text-white text-[10px] px-3 py-1.5 rounded font-black uppercase tracking-widest hover:bg-black transition-all"
                          >
                            Add
                          </button>
                          {p.dates && p.dates !== '2025 Flexible' && (
                            <button
                              onClick={() => {
                                const dateToRemove = prompt('Enter the exact date to remove (YYYY-MM-DD):', '');
                                if (!dateToRemove) return;

                                let dateArray = p.dates.split(',').map((d: string) => d.trim()).filter(Boolean);
                                const newArray = dateArray.filter((d: string) => d !== dateToRemove);

                                if (dateArray.length === newArray.length) {
                                  alert('Date not found in current list.');
                                  return;
                                }

                                dbService.updatePackageDates(p.package_id, newArray.join(',') || '2025 Flexible')
                                  .then(() => dbService.getPackagesAdmin())
                                  .then(res => setPackagesList(res))
                                  .catch(() => alert('Failed to update'));
                              }}
                              className="text-red-500 hover:text-red-700 text-[10px] font-black uppercase tracking-widest bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded"
                            >
                              Remove
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const newDatesValue = prompt('Edit all dates (comma separated):', p.dates);
                              if (newDatesValue === null) return;

                              dbService.updatePackageDates(p.package_id, newDatesValue || '2025 Flexible')
                                .then(() => dbService.getPackagesAdmin())
                                .then(res => setPackagesList(res))
                                .catch(() => alert('Failed to update'));
                            }}
                            className="text-slate-500 hover:text-slate-800 text-[10px] font-black uppercase tracking-widest bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded"
                          >
                            Edit All
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'bannergen' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h3 className="text-3xl font-black text-slate-900 uppercase">AI Smart Banner Generator</h3>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Create professional marketing pamphlets in seconds</p>
            </div>
            <BannerBuilder />
          </div>
        ) : null}
      </div >

      {/* Add Package Modal */}
      {
        showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase">{editingPackageId ? 'Edit Tour Package' : 'Add New Tour Package'}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{editingPackageId ? `ID: #${editingPackageId}` : 'Manual Entry'}</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleAddPackage} className="flex flex-col max-h-[90vh]">
                <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Package Name *</label>
                      <input
                        required
                        type="text"
                        value={newPackage.name}
                        onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all text-sm"
                        placeholder="e.g. KASHMIR SPECIAL"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Destination *</label>
                      <input
                        required
                        type="text"
                        value={newPackage.destination}
                        onChange={(e) => setNewPackage({ ...newPackage, destination: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all text-sm"
                        placeholder="e.g. Gulmarg, Srinigar"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Category *</label>
                      <select
                        required
                        value={newPackage.category}
                        onChange={(e) => setNewPackage({ ...newPackage, category: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all text-sm"
                      >
                        <option value="Domestic">Domestic</option>
                        <option value="International">International</option>
                        <option value="Temple">Temple</option>
                        <option value="Pilgrimage">Pilgrimage</option>
                        <option value="Adventure">Adventure</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Duration *</label>
                      <input
                        required
                        type="text"
                        value={newPackage.duration}
                        onChange={(e) => setNewPackage({ ...newPackage, duration: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all text-sm"
                        placeholder="e.g. 6 Nights - 7 Days"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Price (₹) *</label>
                      <input
                        required
                        type="number"
                        value={newPackage.price}
                        onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all text-sm font-mono"
                        placeholder="25000"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Status</label>
                      <select
                        value={newPackage.status}
                        onChange={(e) => setNewPackage({ ...newPackage, status: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all text-sm"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Current Location</label>
                      <input
                        type="text"
                        value={newPackage.location}
                        onChange={(e) => setNewPackage({ ...newPackage, location: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all text-sm"
                        placeholder="e.g. Near Mall Road"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Tourist Track (Places)</label>
                      <input
                        type="text"
                        value={newPackage.track}
                        onChange={(e) => setNewPackage({ ...newPackage, track: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all text-sm"
                        placeholder="e.g. Delhi > Agra > Jaipur"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Package Image</label>
                    <div className="flex items-center gap-4">
                      {newPackage.image && (
                        <img
                          src={newPackage.image}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-xl border-2 border-slate-100"
                        />
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="package-image-upload"
                        />
                        <label
                          htmlFor="package-image-upload"
                          className="inline-block px-6 py-3 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-xs font-bold text-slate-500 cursor-pointer hover:bg-slate-100 transition-all text-center w-full"
                        >
                          {newPackage.image ? 'Change Image' : 'Click to Upload Package Image'}
                        </label>
                      </div>
                    </div>
                  </div>


                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Day-wise Itinerary</label>
                      <button
                        type="button"
                        onClick={addItineraryRow}
                        className="text-[10px] font-black text-indigo-600 uppercase hover:text-indigo-700"
                      >
                        + Add Day/Entry
                      </button>
                    </div>

                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {itineraryRows.map((row, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 relative group">
                          <button
                            type="button"
                            onClick={() => removeItineraryRow(idx)}
                            className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all font-bold text-xs"
                          >
                            ✕
                          </button>
                          <div className="grid grid-cols-4 gap-3">
                            <div className="col-span-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Day</label>
                              <input
                                type="number"
                                value={row.day}
                                onChange={(e) => updateItineraryRow(idx, 'day', parseInt(e.target.value))}
                                className="w-full px-3 py-2 bg-white border border-slate-100 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                            <div className="col-span-3">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Activity</label>
                              <input
                                type="text"
                                value={row.activity}
                                onChange={(e) => updateItineraryRow(idx, 'activity', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-100 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="e.g. Arrival & Hotel Check-in"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Description</label>
                            <textarea
                              value={row.description}
                              onChange={(e) => updateItineraryRow(idx, 'description', e.target.value)}
                              className="w-full h-16 px-3 py-2 bg-white border border-slate-100 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                              placeholder="What will tourists do on this day?"
                            />
                          </div>
                        </div>
                      ))}
                      {itineraryRows.length === 0 && (
                        <p className="text-center py-4 text-xs text-slate-400 font-medium italic">No itinerary entries added yet.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-8 border-t border-slate-100 flex gap-4 bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-8 py-4 border border-slate-200 text-slate-400 font-bold rounded-2xl hover:bg-slate-50 transition-all uppercase text-xs tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-2 px-12 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-indigo-600/30 uppercase text-xs tracking-widest disabled:opacity-50"
                  >
                    {isSaving ? 'Processing...' : (editingPackageId ? 'Update Package' : 'Add Package')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
      {/* Commission Level Modal */}
      {
        showLevelModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase">{editingLevel ? 'Edit Level' : 'Add New Level'}</h3>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Adjust MLM commission rules</p>
                </div>
                <button
                  onClick={() => setShowLevelModal(false)}
                  className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleLevelSubmit}>
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Level Number</label>
                    <input
                      required
                      type="number"
                      disabled={!!editingLevel}
                      value={newLevelData.level}
                      onChange={(e) => setNewLevelData({ ...newLevelData, level: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all text-sm disabled:opacity-50"
                      placeholder="e.g. 1"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Percentage (%)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={newLevelData.percentage}
                      onChange={(e) => setNewLevelData({ ...newLevelData, percentage: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all text-sm"
                      placeholder="e.g. 5"
                    />
                  </div>
                </div>
                <div className="p-8 border-t border-slate-100 flex gap-4 bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => setShowLevelModal(false)}
                    className="flex-1 px-8 py-4 border border-slate-200 text-slate-400 font-bold rounded-2xl hover:bg-slate-50 transition-all uppercase text-xs tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-2 px-12 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-indigo-600/30 uppercase text-xs tracking-widest disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : (editingLevel ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default AdminDashboard;
