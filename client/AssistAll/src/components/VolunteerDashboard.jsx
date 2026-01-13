import React, { useState, useEffect, useRef } from 'react';
import { 
  Navigation, Phone, ArrowRight, CheckCircle, 
  Power, Bell, Wallet, Home, Briefcase, ShoppingBag, 
  Loader2, Zap, CreditCard, Clock, Receipt, RefreshCw
} from 'lucide-react';

const DEPLOYED_API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://assistall-server.onrender.com';

const VolunteerDashboard = ({ user }) => {
  if (!user) return <div className="h-screen bg-[#050505] text-white flex items-center justify-center font-sans"><Loader2 className="animate-spin mr-3 text-blue-500"/> <span className="tracking-widest text-xs font-bold">LOADING SYSTEM...</span></div>;

  const [activeTab, setActiveTab] = useState('feed'); 
  const [requests, setRequests] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [financials, setFinancials] = useState({ total: 1250 }); 
  const [isOnline, setIsOnline] = useState(false);
  const [toast, setToast] = useState(null);
  const pollingRef = useRef(null);

  const showToast = (msg, type) => { setToast({msg, type}); setTimeout(() => setToast(null), 3000); };

  // --- API POLLING (FIXED) ---
  const fetchRequests = async () => { 
    if (!isOnline) return; 

    try { 
      const res = await fetch(`${DEPLOYED_API_URL}/api/requests?t=${Date.now()}`); 
      if (res.ok) { 
          const data = await res.json(); 
          if(Array.isArray(data)) { 
            // 1. Check if I already have a job (Accepted/In Progress)
            // We verify matching volunteerId AND ensure status isn't 'completed' or 'pending'
            const myActive = data.find(r => 
                r.volunteerId === user._id && 
                (r.status === 'accepted' || r.status === 'in_progress')
            );
            
            // 2. State Sync
            setActiveJob(myActive || null);

            // 3. Populate Feed: Only show 'pending' requests that aren't taken
            // If I am busy (activeJob exists), I shouldn't see new requests to prevent double booking myself
            if (!myActive) {
                const pending = data.filter(r => r.status === 'pending');
                setRequests(pending);
            } else {
                setRequests([]); // Clear pending list if I'm busy
            }
          } 
      } 
    } catch (err) {
        console.error("Poll Error:", err);
    } 
  };
  
  // Start/Stop Polling based on Online Status
  useEffect(() => { 
      if(isOnline) {
          fetchRequests(); // Initial fetch
          pollingRef.current = setInterval(fetchRequests, 3000); 
      } else {
          clearInterval(pollingRef.current);
      }
      return () => clearInterval(pollingRef.current); 
  }, [isOnline]);

  const handleAction = async (id, action) => {
    try {
        let endpoint = `/api/requests/${id}/${action}`;
        let body = { volunteerId: user._id, volunteerName: user.name };

        // Send Update
        const res = await fetch(`${DEPLOYED_API_URL}${endpoint}`, { 
            method: 'PUT', 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(body)
        });

        if (res.ok) {
            if(action === 'accept') showToast("Ride Accepted!", "success");
            if(action === 'pickup') showToast("Trip Started!", "success");
            if(action === 'complete') showToast("Ride Completed!", "success");
            
            // Force immediate refresh to update UI state
            fetchRequests(); 
        } else {
            const err = await res.json();
            showToast(err.message || "Action Failed", "error");
        }

    } catch(e) { 
        showToast("Network Error", "error"); 
    }
  };

  // --- VIEWS ---
  const FeedView = () => {
    if (!isOnline) return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center pt-20 bg-[#050505]">
            <div className="relative mb-10 group cursor-pointer" onClick={() => setIsOnline(true)}>
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-[60px] animate-pulse"></div>
                <div className="w-36 h-36 bg-[#121212] rounded-full flex items-center justify-center border-4 border-[#222] relative z-10 shadow-2xl hover:scale-105 transition">
                    <Power size={48} className="text-neutral-600 hover:text-green-500 transition" />
                </div>
            </div>
            <h2 className="text-3xl font-black text-white mb-3">You are Offline</h2>
            <p className="text-neutral-500 mb-12">Tap to start shift.</p>
        </div>
    );

    return (
        <div className="relative h-full w-full bg-[#050505]">
            {/* Map Placeholder */}
            <div className="absolute inset-0 z-0">
               <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src="https://www.openstreetmap.org/export/embed.html?bbox=76.51%2C9.58%2C76.54%2C9.60&amp;layer=mapnik&amp;marker=9.59%2C76.52" style={{ filter: 'grayscale(100%) invert(90%) contrast(120%)' }}></iframe>
            </div>
            
            {/* Top Stats */}
            <div className="absolute top-4 left-0 right-0 px-4 flex justify-between items-start z-10 pointer-events-none">
                <div className="pointer-events-auto bg-[#0a0a0a]/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-4 border border-white/5" onClick={() => setActiveTab('pocket')}>
                    <span className="font-black text-xl">₹{financials.total}</span>
                    <div className="w-[1px] h-5 bg-white/10"></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div><span className="text-[10px] font-black text-green-500 tracking-widest">ONLINE</span></div>
                </div>
                <button onClick={fetchRequests} className="pointer-events-auto bg-[#0a0a0a]/90 p-3 rounded-full border border-white/10 text-white"><RefreshCw size={18}/></button>
            </div>

            {/* SCANNING (Only if NO active job and NO requests) */}
            {!activeJob && requests.length === 0 && (
                <div className="absolute bottom-40 left-1/2 -translate-x-1/2 bg-[#0a0a0a]/80 backdrop-blur-md px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border border-white/10 z-10 whitespace-nowrap animate-in fade-in">
                    <div className="relative"><div className="w-3 h-3 bg-blue-500 rounded-full animate-ping absolute top-0 left-0"></div><div className="w-3 h-3 bg-blue-500 rounded-full relative z-10"></div></div>
                    <span className="text-white font-bold text-xs tracking-widest uppercase">Scanning Sector...</span>
                </div>
            )}
            
            {/* ACTIVE JOB CARD */}
            {activeJob && (
                <div className="absolute bottom-24 left-4 right-4 bg-white rounded-[32px] shadow-2xl p-6 z-20 border-t-4 border-blue-600 animate-in slide-in-from-bottom">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">{activeJob.type}</span></div>
                            <h2 className="text-2xl font-black text-gray-900">{activeJob.requesterName}</h2>
                            <p className="text-gray-500 text-sm mt-1">To: <span className="font-bold text-black">{activeJob.drop}</span></p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-full"><Navigation size={24} className="text-blue-600"/></div>
                    </div>
                    {activeJob.status === 'accepted' ? (
                        <button onClick={() => handleAction(activeJob._id, 'pickup')} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl text-lg shadow-lg flex justify-center items-center gap-2">Slide to Pickup <ArrowRight size={20}/></button>
                    ) : (
                        <button onClick={() => handleAction(activeJob._id, 'complete')} className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl text-lg shadow-lg flex justify-center items-center gap-2">Complete Ride <CheckCircle size={20}/></button>
                    )}
                </div>
            )}
            
            {/* INCOMING REQUESTS */}
            {!activeJob && requests.map(req => (
                <div key={req._id} className="absolute bottom-24 left-4 right-4 bg-[#121212] text-white p-6 rounded-[32px] shadow-2xl border border-white/10 z-20 animate-in slide-in-from-bottom">
                    <div className="flex justify-between items-center mb-4"><div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-green-500/20 flex items-center gap-1"><Zap size={12} fill="currentColor"/> High Pay</div><span className="text-neutral-400 text-xs font-bold">Nearby</span></div>
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <p className="text-neutral-500 text-[10px] uppercase font-bold mb-1 tracking-wider">PASSENGER</p>
                            <h3 className="text-2xl font-bold">{req.requesterName}</h3>
                            <p className="text-xs text-gray-400 mt-1">Dest: {req.drop}</p>
                        </div>
                        <div className="text-right"><p className="text-3xl font-black text-white">₹{req.price}</p></div>
                    </div>
                    <button onClick={() => handleAction(req._id, 'accept')} className="w-full bg-white text-black font-black py-4 rounded-2xl text-lg shadow-lg active:scale-[0.98] transition-all hover:bg-gray-200">Tap to Accept</button>
                </div>
            ))}
        </div>
    );
  };

  return (
    <div className="h-screen w-full bg-[#050505] text-white font-sans flex flex-col overflow-hidden relative">
      {toast && <div className="absolute top-4 left-4 right-4 z-[6000] p-4 rounded-2xl shadow-2xl flex items-center animate-in slide-in-from-top bg-[#222]/90 border border-[#333] backdrop-blur-md"><CheckCircle className="text-green-500 mr-3"/><p className="font-bold text-sm">{toast.msg}</p></div>}
      <div className="flex-grow relative overflow-hidden">{activeTab === 'feed' && <FeedView />}</div>
      <div className="bg-[#050505]/95 border-t border-white/5 py-2 px-6 flex justify-between items-center z-50 absolute bottom-0 left-0 right-0 pb-6 backdrop-blur-xl">
        <button onClick={() => setActiveTab('feed')} className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ${activeTab === 'feed' ? 'text-white' : 'text-neutral-600'}`}><Home size={26}/><span className="text-[9px] font-black uppercase">Home</span></button>
        <button onClick={() => setActiveTab('pocket')} className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ${activeTab === 'pocket' ? 'text-white' : 'text-neutral-600'}`}><Wallet size={26}/><span className="text-[9px] font-black uppercase">Wallet</span></button>
      </div>
    </div>
  );
};
export default VolunteerDashboard;