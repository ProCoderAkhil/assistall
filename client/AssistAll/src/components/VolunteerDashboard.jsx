import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, User, Navigation, Shield, LogOut, Phone, X, ArrowRight, ArrowLeft,
  BarChart2, Star, ChevronRight, IndianRupee, Clock, Car, Menu, 
  CheckCircle, FileText, Receipt, Power, Bell, HelpCircle, Wallet,
  Home, Briefcase, ShoppingBag, Gift, Lock, Loader2, Tag, Percent, 
  AlertCircle, Zap, LayoutGrid, Timer, Map as MapIcon, TrendingUp,
  CreditCard, Fuel, Wrench, Trophy, Calendar, RefreshCw, Send, DollarSign, Key
} from 'lucide-react';

// --- CONFIG ---
const DEPLOYED_API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://assistall-server.onrender.com';

const initialGigs = [
  { id: 1, day: 'Mon', date: '12', status: 'open', earnings: '₹800', isSpecial: true, reminder: false },
  { id: 2, day: 'Tue', date: '13', status: 'open', earnings: '₹450', isSpecial: false, reminder: false },
  { id: 3, day: 'Wed', date: '14', status: 'locked', earnings: null, isSpecial: false, reminder: false },
];

const initialBazaar = [
  { id: 1, title: "Medical Insurance", desc: "Coverage ₹5L", price: "ACTIVE", color: "text-green-400 bg-green-900/20 border-green-800", icon: Shield, type: 'active' },
  { id: 2, title: "Fuel Card", desc: "Save ₹3/L", price: "Apply", color: "text-orange-400 bg-orange-900/20 border-orange-800", icon: Fuel, type: 'action' },
];

const transactions = [
    { id: 1, to: "HDFC Bank", date: "Today, 10:23 AM", amount: "-₹1,200", status: "success" },
    { id: 2, to: "Ride #8492", date: "Yesterday", amount: "+₹150", status: "income" },
];

const VolunteerDashboard = ({ user, globalToast }) => {
  if (!user) return <div className="h-screen bg-[#050505] text-white flex items-center justify-center font-sans"><Loader2 className="animate-spin mr-3 text-blue-500"/> <span className="tracking-widest text-xs font-bold">LOADING SYSTEM...</span></div>;

  const [activeTab, setActiveTab] = useState('feed'); 
  const [requests, setRequests] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [financials, setFinancials] = useState({ total: 1250, base: 1000, tips: 250, jobs: 4, potential: 0 }); 
  const [leaderboard, setLeaderboard] = useState([]);
  
  // --- PERSISTENCE: Load Online State ---
  const [isOnline, setIsOnline] = useState(() => localStorage.getItem('isOnline') === 'true');
  const [dismissedIds, setDismissedIds] = useState([]); // Stores IDs of dismissed rides
  
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false); // ✅ NEW: OTP Modal
  const [otpInput, setOtpInput] = useState("");
  const [toast, setToast] = useState(null);
  
  // --- NEW: Ride Timer ---
  const [rideTime, setRideTime] = useState(0);
  
  const isProcessing = useRef(false);
  const pollingRef = useRef(null);
  const timerRef = useRef(null);

  const [bazaarList, setBazaarList] = useState(initialBazaar);
  const [gigsList, setGigsList] = useState(initialGigs);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const showToast = (msg, type) => { setToast({msg, type}); setTimeout(() => setToast(null), 3000); };
  
  // Save Online State
  useEffect(() => { localStorage.setItem('isOnline', isOnline); }, [isOnline]);

  // --- RIDE TIMER LOGIC ---
  useEffect(() => {
      if (activeJob && activeJob.status === 'in_progress') {
          timerRef.current = setInterval(() => {
              setRideTime(prev => prev + 1);
          }, 1000);
      } else {
          clearInterval(timerRef.current);
          setRideTime(0);
      }
      return () => clearInterval(timerRef.current);
  }, [activeJob]);

  const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- API POLLING ---
  const fetchRequests = async () => { 
    if (!isOnline || isProcessing.current) return; 

    try { 
      const res = await fetch(`${DEPLOYED_API_URL}/api/requests?t=${Date.now()}`); 
      if (res.ok) { 
          const data = await res.json(); 
          if(Array.isArray(data)) { 
            const myActive = data.find(r => 
                r.volunteerId === user._id && 
                (r.status === 'accepted' || r.status === 'in_progress')
            );
            
            setActiveJob(myActive || null);

            if (!myActive) {
                // Filter out stale and dismissed requests
                const now = new Date();
                const validRequests = data.filter(r => {
                    if (dismissedIds.includes(r._id)) return false; // Filter dismissed
                    if (r.status !== 'pending') return false;
                    const reqTime = new Date(r.createdAt);
                    const diffMins = Math.round(((now - reqTime) % 86400000) / 60000);
                    return diffMins < 30; // Filter stale (>30m)
                });
                
                // Prevent infinite loop by checking if data actually changed
                setRequests(prev => {
                    if (JSON.stringify(prev) !== JSON.stringify(validRequests)) return validRequests;
                    return prev;
                });
                
                // Calculate potential earnings
                const potential = validRequests.reduce((acc, curr) => acc + (curr.price || 150), 0);
                setFinancials(prev => ({ ...prev, potential }));
            } else {
                setRequests([]); 
            }
          } 
      } 
    } catch (err) {} 
  };

  // --- FETCH LEADERBOARD ---
  const fetchLeaderboard = async () => {
      try {
          const res = await fetch(`${DEPLOYED_API_URL}/api/requests/leaderboard`);
          if(res.ok) setLeaderboard(await res.json());
      } catch(e) {}
  };
  
  useEffect(() => { 
      if(isOnline) {
          fetchRequests(); 
          pollingRef.current = setInterval(fetchRequests, 3000); 
      } else {
          clearInterval(pollingRef.current);
      }
      return () => clearInterval(pollingRef.current); 
  }, [isOnline, dismissedIds]);

  useEffect(() => {
      if(activeTab === 'leaderboard') fetchLeaderboard();
  }, [activeTab]);

  // --- ACTION HANDLER ---
  const handleAction = async (id, action, otpValue = null) => {
    // Intercept 'pickup' to show OTP modal first
    if (action === 'pickup' && !otpValue) {
        setShowOTPModal(true); 
        return;
    }

    isProcessing.current = true;

    try {
        let endpoint = `/api/requests/${id}/${action}`;
        let body = { volunteerId: user._id, volunteerName: user.name, otp: otpValue };

        const res = await fetch(`${DEPLOYED_API_URL}${endpoint}`, { 
            method: 'PUT', 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || "Action Failed");
        }

        if (action === 'accept') {
            const req = requests.find(r => r._id === id);
            if(req) {
                setActiveJob({ ...req, status: 'accepted', volunteerId: user._id });
                setRequests([]); 
            }
            showToast("Ride Accepted!", "success");
        } 
        else if (action === 'pickup') {
            setActiveJob(prev => ({ ...prev, status: 'in_progress' })); 
            setShowOTPModal(false);
            setOtpInput("");
            showToast("OTP Verified! Trip Started.", "success");
        } 
        else if (action === 'complete') {
            setActiveJob(null);
            setFinancials(prev => ({ ...prev, total: prev.total + 150, jobs: prev.jobs + 1 }));
            showToast("Ride Completed!", "success");
        }

    } catch(e) { 
        showToast(e.message || "Network Error", "error"); 
    } finally {
        setTimeout(() => {
            isProcessing.current = false;
            fetchRequests(); 
        }, 1000);
    }
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

  const safeLogout = () => {
      localStorage.clear();
      window.location.href = "/"; 
  };

  // --- VIEWS ---
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
            <div className="absolute inset-0 z-0">
               <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src="https://www.openstreetmap.org/export/embed.html?bbox=76.51%2C9.58%2C76.54%2C9.60&amp;layer=mapnik&amp;marker=9.59%2C76.52" style={{ filter: 'grayscale(100%) invert(90%) contrast(120%)' }}></iframe>
            </div>
            
            <div className="absolute top-4 left-0 right-0 px-4 flex justify-between items-start z-10 pointer-events-none">
                <div className="pointer-events-auto bg-[#0a0a0a]/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-4 border border-white/5 cursor-pointer hover:scale-105 transition active:scale-95" onClick={() => setActiveTab('pocket')}>
                    <span className="font-black text-xl tracking-tight">₹{financials.total}</span>
                    <div className="w-[1px] h-5 bg-white/10"></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div><span className="text-[10px] font-black text-green-500 uppercase tracking-widest">ONLINE</span></div>
                </div>
                <button onClick={fetchRequests} className="pointer-events-auto bg-[#0a0a0a]/90 p-3 rounded-full border border-white/10 text-white active:scale-95"><RefreshCw size={18}/></button>
            </div>

            {!activeJob && requests.length === 0 && (
                <div className="absolute bottom-40 left-1/2 -translate-x-1/2 bg-[#0a0a0a]/80 backdrop-blur-md px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border border-white/10 z-10 whitespace-nowrap animate-in fade-in zoom-in">
                    <div className="relative"><div className="w-3 h-3 bg-blue-500 rounded-full animate-ping absolute top-0 left-0"></div><div className="w-3 h-3 bg-blue-500 rounded-full relative z-10"></div></div>
                    <span className="text-white font-bold text-xs tracking-widest uppercase">Scanning...</span>
                </div>
            )}
            
            {activeJob && (
                <div className="absolute bottom-24 left-4 right-4 bg-white rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-6 z-20 border-t-4 border-blue-600 animate-in slide-in-from-bottom duration-500">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">{activeJob.type}</span>
                                {activeJob.status === 'in_progress' && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1"><Timer size={10}/> {formatTime(rideTime)}</span>}
                            </div>
                            <h2 className="text-2xl font-black text-gray-900">{activeJob.requesterName}</h2>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-full"><Navigation size={24} className="text-blue-600"/></div>
                    </div>
                    {/* Destination Display */}
                    <div className="flex gap-2 mb-4 bg-gray-50 p-3 rounded-xl items-center">
                        <MapPin size={16} className="text-gray-400" />
                        <p className="text-sm text-gray-600 font-bold">{activeJob.drop || "General Trip"}</p>
                    </div>

                    {activeJob.status === 'accepted' ? (
                        <button onClick={() => handleAction(activeJob._id, 'pickup')} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl text-lg shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all flex justify-center items-center gap-2">Slide to Pickup <ArrowRight size={20}/></button>
                    ) : (
                        <button onClick={() => handleAction(activeJob._id, 'complete')} className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl text-lg shadow-lg hover:bg-green-700 active:scale-[0.98] transition-all flex justify-center items-center gap-2">Complete Ride <CheckCircle size={20}/></button>
                    )}
                </div>
            )}
            
            {!activeJob && requests.map(req => (
                <div key={req._id} className="absolute bottom-24 left-4 right-4 bg-[#121212] text-white p-6 rounded-[32px] shadow-2xl border border-white/10 z-20 animate-in slide-in-from-bottom duration-300">
                    <div className="flex justify-between items-center mb-4"><div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-green-500/20 flex items-center gap-1"><Zap size={12} fill="currentColor"/> High Pay</div><span className="text-neutral-400 text-xs font-bold">Nearby</span></div>
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <p className="text-neutral-500 text-[10px] uppercase font-bold mb-1 tracking-wider">PASSENGER</p>
                            <h3 className="text-2xl font-bold">{req.requesterName}</h3>
                            <div className="flex items-center gap-1 mt-1 text-gray-400 text-xs"><MapPin size={12}/> <span className="truncate max-w-[150px]">{req.drop || "General Trip"}</span></div>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-black text-white">₹{req.price || 150}</p>
                            <p className="text-neutral-500 text-xs font-bold tracking-wider">ESTIMATED</p>
                        </div>
                    </div>
                    
                    {/* --- ACTION BUTTONS --- */}
                    <div className="flex gap-3">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setDismissedIds(prev => [...prev, req._id]); // Add to blocklist
                                setRequests(prev => prev.filter(r => r._id !== req._id));
                            }} 
                            className="w-16 bg-[#222] text-white rounded-2xl flex items-center justify-center hover:bg-red-900/30 hover:text-red-500 transition border border-white/5 active:scale-95"
                        >
                            <X size={24} />
                        </button>
                        <button 
                            onClick={() => handleAction(req._id, 'accept')} 
                            className="flex-1 bg-white text-black font-black py-4 rounded-2xl text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.98] transition-all hover:bg-gray-200"
                        >
                            Tap to Accept
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
  };

  const LeaderboardView = () => (
      <div className="p-6 pt-24 h-full bg-[#050505] animate-in fade-in overflow-y-auto pb-32">
          <div className="text-center mb-8">
              <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/30"><Trophy size={40} className="text-yellow-500"/></div>
              <h2 className="text-3xl font-black text-white">Top Helpers</h2>
              <p className="text-neutral-500 text-sm">This Week's Heroes</p>
          </div>
          <div className="space-y-4">
              {leaderboard.length === 0 && <p className="text-center text-neutral-600">No data yet.</p>}
              {leaderboard.map((vol, index) => (
                  <div key={index} className={`flex items-center p-4 rounded-2xl border ${index===0 ? 'bg-yellow-900/10 border-yellow-500/30' : 'bg-[#121212] border-white/5'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black mr-4 ${index===0 ? 'bg-yellow-500 text-black' : 'bg-neutral-800 text-neutral-400'}`}>{index+1}</div>
                      <div className="flex-1">
                          <h4 className="font-bold text-white">{vol._id || "Volunteer"}</h4>
                          <p className="text-xs text-neutral-500">{vol.rides} Rides Completed</p>
                      </div>
                      <div className="text-right">
                          <p className="text-green-400 font-bold">₹{vol.earnings}</p>
                          <div className="flex items-center justify-end text-[10px] text-yellow-500 font-bold gap-1"><Star size={10} fill="currentColor"/> {vol.rating?.toFixed(1)}</div>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const PocketView = () => (
    <div className="p-6 pt-24 pb-32 h-full bg-[#050505] animate-in fade-in overflow-y-auto">
        <div className="bg-gradient-to-br from-[#121212] to-[#0a0a0a] rounded-[32px] p-8 border border-white/5 text-center shadow-2xl relative overflow-hidden mb-8 shadow-2xl group">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-green-500/20 transition duration-700"></div>
             <div className="flex justify-between items-start mb-6">
                 <div>
                     <p className="text-neutral-500 text-xs font-black uppercase tracking-widest mb-1">Available Balance</p>
                     <h2 className="text-5xl font-black text-white tracking-tighter flex items-start gap-1">
                         <span className="text-2xl mt-2 text-green-500">₹</span>{financials.total}
                     </h2>
                 </div>
                 <div className="bg-[#1a1a1a] p-3 rounded-2xl border border-white/5">
                     <CreditCard size={24} className="text-white"/>
                 </div>
             </div>
             <button onClick={handleWithdraw} disabled={financials.total === 0 || isWithdrawing} className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-gray-200 transition active:scale-[0.98] disabled:opacity-50 relative z-10 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                 {isWithdrawing ? <Loader2 className="animate-spin"/> : <><ArrowRight size={20} className="-rotate-45"/> Withdraw to Bank</>}
             </button>
        </div>
        
        {/* Pending Earnings Card */}
        <div className="bg-[#121212] p-6 rounded-[32px] border border-white/5 mb-8">
            <h3 className="text-lg font-bold text-white mb-2">Pending Earnings</h3>
            <p className="text-neutral-500 text-sm">You have <span className="text-white font-bold">₹{financials.potential}</span> in potential gigs nearby.</p>
        </div>

        <div className="mb-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Clock size={18} className="text-neutral-500"/> Recent Activity</h3>
            <div className="space-y-3">
                {transactions.map(t => (
                    <div key={t.id} className="bg-[#121212] p-4 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-[#1a1a1a] transition">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${t.status==='income'?'bg-green-500/10 text-green-500':'bg-neutral-800 text-white'}`}>
                                {t.status==='income' ? <ArrowLeft size={18} className="rotate-45"/> : <ArrowRight size={18} className="-rotate-45"/>}
                            </div>
                            <div>
                                <p className="font-bold text-white">{t.to}</p>
                                <p className="text-xs text-neutral-500 font-medium">{t.date}</p>
                            </div>
                        </div>
                        <span className={`font-black ${t.status==='income'?'text-green-500':'text-white'}`}>{t.amount}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );

  const GigsView = () => (
    <div className="p-6 pt-24 pb-32 h-full bg-[#050505] animate-in fade-in overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 rounded-[32px] p-6 relative overflow-hidden border border-purple-500/20 mb-8">
            <div className="relative z-10"><div className="flex items-center gap-2 mb-3"><span className="bg-white/10 text-white text-[10px] font-black px-2 py-1 rounded backdrop-blur uppercase tracking-wider border border-white/10">3 DAY STREAK</span></div><h2 className="text-2xl font-black text-white mb-2">Complete 3 Rides</h2><p className="text-purple-200 text-sm mb-6 font-medium">Finish 3 more trips by 10 PM to unlock <span className="text-white font-bold">₹200 Bonus</span>.</p></div><Zap size={100} className="absolute -right-6 -bottom-6 text-purple-500/10 rotate-12"/>
        </div>
        <div className="space-y-3">{gigsList.map((item) => (<div key={item.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] ${item.status === 'locked' ? 'bg-[#121212] border-white/5 opacity-50' : 'bg-[#1a1a1a] border-white/10 hover:border-white/20'}`}><div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${item.isSpecial ? 'bg-green-600 text-black shadow-lg shadow-green-900/20' : 'bg-[#222] text-neutral-400'}`}>{item.date}</div><div><p className="text-white font-bold text-lg">{item.day}</p><p className="text-neutral-500 text-xs font-bold uppercase tracking-wide">{item.status}</p></div></div>{item.earnings ? <div className="text-right"><p className="text-green-400 font-black">{item.earnings}</p><p className="text-[10px] text-neutral-500 uppercase font-bold">Est.</p></div> : <Bell size={20} className={item.reminder ? "text-blue-500 fill-current" : "text-neutral-700"}/>}</div>))}</div>
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
        <div className="flex items-center mb-8 bg-[#121212] p-6 rounded-[32px] border border-white/5 relative overflow-hidden"><div className="w-20 h-20 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-3xl font-black mr-5 text-black border-4 border-[#121212] relative z-10">{user.name.charAt(0).toUpperCase()}</div><div className="relative z-10"><h2 className="text-2xl font-black text-white tracking-tight">{user.name}</h2><p className="text-green-500 text-sm font-bold mt-1">Verified Partner</p></div></div>
        <button onClick={safeLogout} className="w-full bg-[#1a1a1a] text-red-500 border border-red-900/30 font-bold py-4 rounded-2xl hover:bg-red-900/10 transition active:scale-[0.98] flex items-center justify-center gap-2"><LogOut size={20}/> Sign Out</button>
    </div>
  );

  return (
    <div className="h-screen w-full bg-[#050505] text-white font-sans flex flex-col overflow-hidden relative">
      {/* Toast Notification */}
      {toast && <div className={`absolute top-4 left-4 right-4 z-[6000] p-4 rounded-2xl shadow-2xl flex items-center animate-in slide-in-from-top ${toast.type === 'error' ? 'bg-red-900/90 border-red-500' : 'bg-[#222]/90 border-[#333] border'} border backdrop-blur-md`}>{toast.type === 'success' ? <CheckCircle className="text-green-500 mr-3"/> : <Receipt className="text-white mr-3"/>}<p className="font-bold text-sm">{toast.msg}</p></div>}
      
      {/* Offline Modal */}
      {showOfflineModal && (
        <div className="fixed inset-0 bg-black/90 z-[200] flex items-end justify-center animate-in fade-in duration-300 backdrop-blur-sm">
          <div className="bg-[#121212] w-full max-w-md rounded-t-[32px] p-8 border-t border-[#333] animate-in slide-in-from-bottom">
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">End Shift?</h3>
            <p className="text-neutral-500 mb-8 font-medium">You will stop receiving requests.</p>
            <div className="flex gap-4">
              <button onClick={() => { setIsOnline(false); setShowOfflineModal(false); }} className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-bold">Go Offline</button>
              <button onClick={() => setShowOfflineModal(false)} className="flex-1 bg-[#222] text-white py-4 rounded-2xl font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ NEW: OTP Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center animate-in fade-in duration-300 backdrop-blur-sm p-6">
          <div className="bg-[#121212] w-full max-w-sm rounded-[32px] p-8 border border-white/10 text-center shadow-2xl">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6"><Key className="text-blue-500" size={32}/></div>
            <h3 className="text-2xl font-black text-white mb-2">Enter OTP</h3>
            <p className="text-gray-500 mb-6 text-sm">Ask passenger for the 4-digit code.</p>
            <input 
                type="tel" maxLength="4" autoFocus
                className="bg-[#050505] border border-white/20 text-white text-center text-4xl font-mono tracking-[0.5em] rounded-2xl w-full py-4 mb-6 focus:border-blue-500 focus:outline-none"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
            />
            <div className="flex gap-3">
                <button onClick={() => setShowOTPModal(false)} className="flex-1 bg-[#222] text-white py-4 rounded-2xl font-bold">Cancel</button>
                <button 
                    onClick={() => handleAction(activeJob._id, 'pickup', otpInput)} 
                    className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold disabled:opacity-50"
                    disabled={otpInput.length !== 4}
                >
                    Start Ride
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-[#050505]/80 backdrop-blur-md z-50 px-4 py-4 flex justify-between items-center border-b border-white/5">
        <div onClick={() => setShowOfflineModal(true)} className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-green-500/30 text-green-500 cursor-pointer hover:bg-green-500/10 active:scale-95 transition bg-green-500/5"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div><span className="text-[10px] font-black uppercase tracking-widest">ONLINE</span></div>
        <div className="flex gap-3 items-center"><button onClick={() => setActiveTab('profile')} className="w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center text-sm font-bold border-2 border-[#222] hover:border-green-500 transition cursor-pointer active:scale-[0.95] text-white shadow-lg">{user.name.charAt(0)}</button></div>
      </div>
      
      {/* Content Area */}
      <div className="flex-grow relative overflow-hidden">{activeTab === 'feed' && <FeedView />}{activeTab === 'pocket' && <PocketView />}{activeTab === 'leaderboard' && <LeaderboardView />}{activeTab === 'gigs' && <GigsView />}{activeTab === 'bazaar' && <BazaarView />}{activeTab === 'profile' && <ProfileView />}</div>
      
      {/* Bottom Nav */}
      <div className="bg-[#050505]/95 border-t border-white/5 py-2 px-6 flex justify-between items-center z-50 absolute bottom-0 left-0 right-0 pb-6 backdrop-blur-xl">
        {[{id:'feed',icon:Home,l:'Feed'},{id:'pocket',icon:Wallet,l:'Pocket'},{id:'leaderboard',icon:Trophy,l:'Rank'},{id:'gigs',icon:Briefcase,l:'Gigs'},{id:'bazaar',icon:ShoppingBag,l:'Bazaar'}].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all duration-300 ${activeTab === item.id ? 'text-white' : 'text-neutral-600 hover:text-neutral-400'}`}><item.icon size={26} strokeWidth={activeTab === item.id ? 2.5 : 2} className={`transition-transform ${activeTab === item.id ? 'scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : ''}`}/><span className="text-[9px] font-black tracking-widest uppercase">{item.l}</span></button>
        ))}
      </div>
    </div>
  );
};
export default VolunteerDashboard;