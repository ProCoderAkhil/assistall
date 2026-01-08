import React, { useState, useEffect } from 'react';
import { 
  MapPin, User, Navigation, Shield, LogOut, Phone, X, ArrowRight, ArrowLeft,
  BarChart2, Star, ChevronRight, IndianRupee, Clock, Car, Menu, 
  CheckCircle, FileText, Receipt, Power, Bell, HelpCircle, Wallet,
  Home, Briefcase, ShoppingBag, Gift, Lock, Loader2, Tag, Percent, 
  AlertCircle, Zap, LayoutGrid, Timer, Map as MapIcon, TrendingUp,
  CreditCard, Fuel, Wrench, Trophy, Calendar
} from 'lucide-react';

const GOAL_DAILY = 2500;
const initialGigs = [
  { id: 1, day: 'Mon', date: '12', status: 'open', earnings: '₹800', isSpecial: true, reminder: false },
  { id: 2, day: 'Tue', date: '13', status: 'open', earnings: '₹450', isSpecial: false, reminder: false },
  { id: 3, day: 'Wed', date: '14', status: 'locked', earnings: null, isSpecial: false, reminder: false },
  { id: 4, day: 'Thu', date: '15', status: 'locked', earnings: null, isSpecial: false, reminder: false },
  { id: 5, day: 'Fri', date: '16', status: 'locked', earnings: null, isSpecial: true, reminder: false },
];
const initialBazaar = [
  { id: 1, title: "Medical Insurance", desc: "Coverage ₹5L", price: "ACTIVE", color: "text-green-400 bg-green-900/20 border-green-800", icon: Shield, type: 'active' },
  { id: 2, title: "Fuel Card", desc: "Save ₹3/L", price: "Apply", color: "text-orange-400 bg-orange-900/20 border-orange-800", icon: Fuel, type: 'action' },
  { id: 3, title: "Bike Service", desc: "20% Off", price: "Claim", color: "text-blue-400 bg-blue-900/20 border-blue-800", icon: Wrench, type: 'action' },
];

const VolunteerDashboard = ({ user }) => {
  if (!user) return <div className="h-screen bg-[#050505] text-white flex items-center justify-center font-sans"><Loader2 className="animate-spin mr-3 text-blue-500"/> <span className="tracking-widest text-xs font-bold">LOADING SYSTEM...</span></div>;

  const [activeTab, setActiveTab] = useState('feed'); 
  const [requests, setRequests] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [financials, setFinancials] = useState({ total: 1250, base: 1000, tips: 250, jobs: 4 }); 
  const [isOnline, setIsOnline] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [onlineTime, setOnlineTime] = useState(0);
  const [toast, setToast] = useState(null);
  
  const [bazaarList, setBazaarList] = useState(initialBazaar);
  const [gigsList, setGigsList] = useState(initialGigs);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const DEPLOYED_API_URL = "https://assistall-server.onrender.com";

  const showToast = (msg, type) => { setToast({msg, type}); setTimeout(() => setToast(null), 3000); };
  const formatTime = (s) => { const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); return `${h}h ${m}m`; };
  const getGoalProgress = () => Math.min((financials.total / GOAL_DAILY) * 100, 100);

  // --- API ---
  const fetchRequests = async () => { 
    if (!isOnline) return; 
    try { 
      const res = await fetch(`${DEPLOYED_API_URL}/api/requests?volunteer=${user.name}`); 
      if (res.ok) { 
          const data = await res.json(); 
          if(Array.isArray(data)) { 
            const myActive = data.find(r => r.volunteerName === user.name && (r.status === 'accepted' || r.status === 'in_progress')); 
            
            // OPTIMISTIC SYNC: Only update if server has something new, don't overwrite if local state is ahead
            if (myActive) {
                setActiveJob(myActive);
            } else if (activeJob && activeJob.status === 'completed') {
                setActiveJob(null);
            }

            if (!myActive) {
                const pending = data.filter(r => r.status === 'pending');
                setRequests(pending);
                setActiveJob(null);
            } else {
                setRequests([]);
            }
          } 
      } 
    } catch (err) {} 
  };
  
  useEffect(() => { fetchRequests(); const interval = setInterval(fetchRequests, 3000); return () => clearInterval(interval); }, [isOnline]);
  useEffect(() => { let timer; if (isOnline) timer = setInterval(() => setOnlineTime(p => p + 1), 1000); return () => clearInterval(timer); }, [isOnline]);

  const handleAction = async (id, action) => {
    try {
        if (action === 'pickup') {
            showToast("Trip Started!", "success");
            // FORCE LOCAL UPDATE IMMEDIATELY (Prevents Flicker)
            setActiveJob(prev => ({ ...prev, status: 'in_progress' })); 
        }
        else if (action === 'accept') {
            showToast("Accepted!", "success");
        }
        else if (action === 'complete') {
            showToast("Ride Completed!", "success");
            setActiveJob(null);
            setFinancials(prev => ({ ...prev, total: prev.total + 150, jobs: prev.jobs + 1 }));
        }

        await fetch(`${DEPLOYED_API_URL}/api/requests/${id}/${action}`, { 
            method: 'PUT', 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ volunteerName: user.name, volunteerId: user._id })
        });

        // Delay next fetch to allow DB to update
        setTimeout(fetchRequests, 1000);

    } catch(e) { showToast("Network Error", "error"); }
  };

  const handleWithdraw = () => {
      if (financials.total === 0) return showToast("Wallet is empty", "error");
      setIsWithdrawing(true);
      setTimeout(() => { setIsWithdrawing(false); setFinancials(prev => ({ ...prev, total: 0 })); showToast("Funds Sent", "success"); }, 2000);
  };

  const handleBazaarClick = (id) => {
      setBazaarList(prev => prev.map(item => item.id === id ? { ...item, price: "Active", type: 'active', color: "text-gray-400 bg-gray-800 border-gray-700" } : item));
      showToast("Benefit Activated!", "success");
  };

  const toggleGigReminder = (id) => {
      setGigsList(prev => prev.map(g => g.id === id ? { ...g, reminder: !g.reminder } : g));
      showToast("Schedule Updated", "info");
  };

  const OfflineModal = () => (
    <div className="fixed inset-0 bg-black/90 z-[200] flex items-end justify-center animate-in fade-in duration-300 backdrop-blur-sm">
      <div className="bg-[#121212] w-full max-w-md rounded-t-[32px] p-8 border-t border-[#333] animate-in slide-in-from-bottom">
        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">End Shift?</h3>
        <p className="text-neutral-500 mb-8 font-medium">You will stop receiving requests.</p>
        <div className="flex gap-4">
          <button onClick={() => { setIsOnline(false); setShowOfflineModal(false); }} className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-bold active:scale-95 transition shadow-lg shadow-red-900/20">Go Offline</button>
          <button onClick={() => setShowOfflineModal(false)} className="flex-1 bg-[#222] text-white py-4 rounded-2xl font-bold active:scale-95 transition hover:bg-[#2a2a2a]">Cancel</button>
        </div>
      </div>
    </div>
  );

  const FeedView = () => {
    if (!isOnline) return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center pt-20 bg-[#050505]">
            <div className="relative mb-10 group cursor-pointer" onClick={() => setIsOnline(true)}>
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-[60px] animate-pulse group-hover:bg-green-500/30 transition duration-500"></div>
                <div className="w-36 h-36 bg-[#121212] rounded-full flex items-center justify-center border-4 border-[#222] relative z-10 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                    <Power size={48} className="text-neutral-600 group-hover:text-green-500 transition-colors duration-300" />
                </div>
            </div>
            <h2 className="text-3xl font-black text-white mb-3 tracking-tight">You are Offline</h2>
            <p className="text-neutral-500 mb-12 max-w-xs mx-auto font-medium">Tap to start shift.</p>
        </div>
    );
    return (
        <div className="relative h-full w-full bg-[#050505]">
            {/* REAL MAP EMBED */}
            <div className="absolute inset-0 z-0">
               <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src="https://www.openstreetmap.org/export/embed.html?bbox=76.51%2C9.58%2C76.54%2C9.60&amp;layer=mapnik&amp;marker=9.59%2C76.52" style={{ filter: 'grayscale(100%) invert(90%) contrast(120%)' }}></iframe>
            </div>
            
            <div className="absolute top-4 left-0 right-0 px-4 flex justify-between items-start z-10 pointer-events-none">
                <div className="pointer-events-auto bg-[#0a0a0a]/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-4 border border-white/5 cursor-pointer hover:scale-105 transition active:scale-95" onClick={() => setActiveTab('pocket')}>
                    <span className="font-black text-xl tracking-tight">₹{financials.total}</span>
                    <div className="w-[1px] h-5 bg-white/10"></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div><span className="text-[10px] font-black text-green-500 uppercase tracking-widest">ONLINE</span></div>
                </div>
            </div>

            {/* SCANNING */}
            {!activeJob && requests.length === 0 && (
                <div className="absolute bottom-40 left-1/2 -translate-x-1/2 bg-[#0a0a0a]/80 backdrop-blur-md px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border border-white/10 z-10 whitespace-nowrap animate-in fade-in zoom-in">
                    <div className="relative"><div className="w-3 h-3 bg-blue-500 rounded-full animate-ping absolute top-0 left-0"></div><div className="w-3 h-3 bg-blue-500 rounded-full relative z-10"></div></div>
                    <span className="text-white font-bold text-xs tracking-widest uppercase">Scanning Sector...</span>
                </div>
            )}
            
            {/* ACTIVE JOB CARD */}
            {activeJob && (
                <div className="absolute bottom-24 left-4 right-4 bg-white rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-6 z-20 border-t-4 border-blue-600 animate-in slide-in-from-bottom duration-500">
                    <div className="flex justify-between items-center mb-6">
                        <div><div className="flex items-center gap-2 mb-1"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">{activeJob.type}</span></div><h2 className="text-2xl font-black text-gray-900">{activeJob.requesterName}</h2></div>
                        <div className="bg-blue-50 p-3 rounded-full"><Navigation size={24} className="text-blue-600"/></div>
                    </div>
                    {/* BUTTON TOGGLE LOGIC */}
                    {activeJob.status === 'accepted' ? (
                        <button onClick={() => handleAction(activeJob._id, 'pickup')} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl text-lg shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all flex justify-center items-center gap-2">Slide to Pickup <ArrowRight size={20}/></button>
                    ) : (
                        <button onClick={() => handleAction(activeJob._id, 'complete')} className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl text-lg shadow-lg hover:bg-red-700 active:scale-[0.98] transition-all flex justify-center items-center gap-2">Complete Ride <CheckCircle size={20}/></button>
                    )}
                </div>
            )}
            
            {/* INCOMING REQUESTS */}
            {!activeJob && requests.map(req => (
                <div key={req._id} className="absolute bottom-24 left-4 right-4 bg-[#121212] text-white p-6 rounded-[32px] shadow-2xl border border-white/10 z-20 animate-in slide-in-from-bottom duration-300">
                    <div className="flex justify-between items-center mb-4"><div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-green-500/20 flex items-center gap-1"><Zap size={12} fill="currentColor"/> High Pay</div><span className="text-neutral-400 text-xs font-bold">Nearby</span></div>
                    <div className="flex justify-between items-end mb-6"><div><p className="text-neutral-500 text-[10px] uppercase font-bold mb-1 tracking-wider">PASSENGER</p><h3 className="text-2xl font-bold">{req.requesterName}</h3></div><div className="text-right"><p className="text-3xl font-black text-white">₹{req.price}</p><p className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider">ESTIMATED</p></div></div>
                    <button onClick={() => handleAction(req._id, 'accept')} className="w-full bg-white text-black font-black py-4 rounded-2xl text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.98] transition-all hover:bg-gray-200">Tap to Accept</button>
                </div>
            ))}
        </div>
    );
  };

  const PocketView = () => (
    <div className="p-6 pt-24 pb-32 h-full bg-[#050505] animate-in fade-in overflow-y-auto">
        <div className="bg-gradient-to-br from-[#121212] to-[#0a0a0a] rounded-[32px] p-8 border border-white/5 text-center shadow-2xl relative overflow-hidden mb-8">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/10 rounded-full blur-[50px] pointer-events-none"></div>
             <p className="text-neutral-500 text-xs font-black uppercase tracking-widest mb-2 relative z-10">TOTAL BALANCE</p>
             <h2 className="text-6xl font-black text-white mb-8 relative z-10 flex justify-center items-center tracking-tighter"><span className="text-green-500 text-4xl mr-2 font-bold">₹</span>{financials.total}</h2>
             <div className="w-full bg-[#222] h-2 rounded-full mb-3 overflow-hidden"><div className="bg-green-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(34,197,94,0.5)]" style={{ width: `${getGoalProgress()}%` }}></div></div>
             <button onClick={handleWithdraw} disabled={financials.total === 0 || isWithdrawing} className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-gray-200 transition active:scale-[0.98] disabled:opacity-50 relative z-10 flex items-center justify-center gap-2">{isWithdrawing ? <Loader2 className="animate-spin"/> : "Withdraw Funds"}</button>
        </div>
    </div>
  );

  const GigsView = () => (
    <div className="p-6 pt-24 pb-32 h-full bg-[#050505] animate-in fade-in overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 rounded-[32px] p-6 relative overflow-hidden border border-purple-500/20 mb-8">
            <div className="relative z-10"><div className="flex items-center gap-2 mb-3"><span className="bg-white/10 text-white text-[10px] font-black px-2 py-1 rounded backdrop-blur uppercase tracking-wider border border-white/10">3 DAY STREAK</span></div><h2 className="text-2xl font-black text-white mb-2">Complete 3 Rides</h2><p className="text-purple-200 text-sm mb-6 font-medium">Finish 3 more trips by 10 PM to unlock <span className="text-white font-bold">₹200 Bonus</span>.</p><div className="w-full bg-black/30 h-2 rounded-full overflow-hidden"><div className="bg-purple-400 w-1/3 h-full rounded-full shadow-[0_0_15px_rgba(192,132,252,0.5)]"></div></div></div><Zap size={100} className="absolute -right-6 -bottom-6 text-purple-500/10 rotate-12"/>
        </div>
        <div className="space-y-3">{gigsList.map((item) => (<div key={item.id} onClick={() => toggleGigReminder(item.id)} className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] ${item.status === 'locked' ? 'bg-[#121212] border-white/5 opacity-50' : 'bg-[#1a1a1a] border-white/10 hover:border-white/20'}`}><div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${item.isSpecial ? 'bg-green-600 text-black shadow-lg shadow-green-900/20' : 'bg-[#222] text-neutral-400'}`}>{item.date}</div><div><p className="text-white font-bold text-lg">{item.day}</p><p className="text-neutral-500 text-xs font-bold uppercase tracking-wide">{item.status}</p></div></div>{item.earnings ? <div className="text-right"><p className="text-green-400 font-black">{item.earnings}</p><p className="text-[10px] text-neutral-500 uppercase font-bold">Est.</p></div> : <Bell size={20} className={item.reminder ? "text-blue-500 fill-current" : "text-neutral-700"}/>}</div>))}</div>
    </div>
  );

  const BazaarView = () => (
    <div className="p-6 pt-24 pb-32 h-full bg-[#050505] animate-in fade-in overflow-y-auto">
        <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-black text-white">Partner Bazaar</h2></div>
        <div className="space-y-4">{bazaarList.map(item => (<div key={item.id} className={`bg-[#121212] p-5 rounded-[24px] border border-white/5 flex items-center justify-between transition group hover:border-white/10 ${item.type === 'active' ? 'opacity-50' : ''}`}><div className="flex items-center gap-4"><div className={`p-4 rounded-2xl bg-[#1a1a1a] group-hover:scale-110 transition duration-300`}><item.icon size={24} className="text-white"/></div><div><div className={`text-[10px] font-black px-2 py-0.5 rounded w-fit mb-1 border ${item.color} uppercase tracking-wider`}>{item.title}</div><p className="text-neutral-400 text-sm font-medium">{item.desc}</p></div></div><button onClick={() => handleBazaarClick(item.id)} disabled={item.type === 'active'} className={`px-5 py-2.5 rounded-xl font-bold text-xs transition active:scale-95 ${item.type === 'active' ? 'bg-[#222] text-neutral-500' : 'bg-white text-black hover:bg-gray-200'}`}>{item.price}</button></div>))}</div>
    </div>
  );

  const ProfileView = () => (
    <div className="p-6 pt-24 h-full bg-[#050505] animate-in slide-in-from-left overflow-y-auto pb-32">
        <div className="flex items-center mb-8 bg-[#121212] p-6 rounded-[32px] border border-white/5 relative overflow-hidden"><div className="w-20 h-20 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-3xl font-black mr-5 text-black border-4 border-[#121212] relative z-10">{user.name.charAt(0).toUpperCase()}</div><div className="relative z-10"><h2 className="text-2xl font-black text-white tracking-tight">{user.name}</h2></div></div>
        <button onClick={() => window.location.reload()} className="w-full bg-[#1a1a1a] text-red-500 border border-red-900/30 font-bold py-4 rounded-2xl hover:bg-red-900/10 transition active:scale-[0.98] flex items-center justify-center gap-2"><LogOut size={20}/> Sign Out</button>
    </div>
  );

  return (
    <div className="h-screen w-full bg-[#050505] text-white font-sans flex flex-col overflow-hidden relative">
      {toast && <div className={`absolute top-4 left-4 right-4 z-[6000] p-4 rounded-2xl shadow-2xl flex items-center animate-in slide-in-from-top ${toast.type === 'error' ? 'bg-red-900/90 border-red-500' : 'bg-[#222]/90 border-[#333] border'} border backdrop-blur-md`}>{toast.type === 'success' ? <CheckCircle className="text-green-500 mr-3"/> : <Receipt className="text-white mr-3"/>}<p className="font-bold text-sm">{toast.msg}</p></div>}
      
      <div className="absolute top-0 left-0 right-0 bg-[#050505]/80 backdrop-blur-md z-50 px-4 py-4 flex justify-between items-center border-b border-white/5">
        <div onClick={() => setShowOfflineModal(true)} className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-green-500/30 text-green-500 cursor-pointer hover:bg-green-500/10 active:scale-95 transition bg-green-500/5"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div><span className="text-[10px] font-black uppercase tracking-widest">ONLINE</span></div>
        <div className="flex gap-3 items-center"><button onClick={() => setActiveTab('notifications')} className="p-2.5 rounded-full bg-[#1a1a1a] border border-white/5 relative hover:bg-[#222] active:scale-95 transition"><Bell size={20} className="text-neutral-400"/><div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-[#050505] rounded-full"></div></button><button onClick={() => setActiveTab('profile')} className="w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center text-sm font-bold border-2 border-[#222] hover:border-green-500 transition cursor-pointer active:scale-[0.95] text-white shadow-lg">{user.name.charAt(0)}</button></div>
      </div>
      
      <div className="flex-grow relative overflow-hidden">{activeTab === 'feed' && <FeedView />}{activeTab === 'pocket' && <PocketView />}{activeTab === 'gigs' && <GigsView />}{activeTab === 'bazaar' && <BazaarView />}{activeTab === 'profile' && <ProfileView />}</div>
      
      <div className="bg-[#050505]/95 border-t border-white/5 py-2 px-6 flex justify-between items-center z-50 absolute bottom-0 left-0 right-0 pb-6 backdrop-blur-xl">
        {[{id:'feed',icon:Home,l:'Feed'},{id:'pocket',icon:Wallet,l:'Pocket'},{id:'gigs',icon:Briefcase,l:'Gigs'},{id:'bazaar',icon:ShoppingBag,l:'Bazaar'}].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all duration-300 ${activeTab === item.id ? 'text-white' : 'text-neutral-600 hover:text-neutral-400'}`}><item.icon size={26} strokeWidth={activeTab === item.id ? 2.5 : 2} className={`transition-transform ${activeTab === item.id ? 'scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : ''}`}/><span className="text-[9px] font-black tracking-widest uppercase">{item.l}</span></button>
        ))}
      </div>
      {showOfflineModal && <OfflineModal />}
    </div>
  );
};
export default VolunteerDashboard;