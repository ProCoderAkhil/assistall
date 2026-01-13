import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Navigation, Phone, Search, User, Shield, Menu, Car, Heart, Zap, 
  ShoppingBag, ArrowLeft, ArrowRight, Trash2, CreditCard, Star, CheckCircle, 
  Clock, Map, Bell, X, MessageSquare, AlertTriangle, Loader2, ChevronUp, Share2, ShieldCheck, Banknote
} from 'lucide-react';

// --- CONFIG ---
const DEPLOYED_API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://assistall-server.onrender.com';

// ==========================================
// 1. NOTIFICATION BANNER (Top Overlay)
// ==========================================
const StatusBanner = ({ status }) => {
  if (!status || status === 'pending') return null;
  
  let bg = "bg-blue-600";
  let text = "Updating...";
  let icon = <Bell size={16} />;

  if (status === 'accepted') {
      bg = "bg-green-600";
      text = "VOLUNTEER FOUND! ARRIVING NOW";
      icon = <CheckCircle size={16} />;
  } else if (status === 'in_progress') {
      bg = "bg-blue-600";
      text = "RIDE STARTED - HEADING TO DESTINATION";
      icon = <Navigation size={16} />;
  }

  return (
      <div className={`fixed top-0 left-0 right-0 ${bg} text-white px-4 py-3 z-[5000] shadow-xl animate-in slide-in-from-top duration-500 flex items-center justify-center gap-3`}>
          {icon}
          <span className="font-bold text-xs tracking-widest">{text}</span>
      </div>
  );
};

// ==========================================
// 2. SUB-COMPONENTS (Your Designs Integrated)
// ==========================================

const FindingVolunteer = ({ onCancel }) => (
    <div className="absolute bottom-0 left-0 right-0 z-[2000] bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] p-8 pb-12 animate-in slide-in-from-bottom duration-500">
      <div className="flex flex-col items-center justify-center text-center mt-4">
        <div className="relative flex items-center justify-center mb-8">
            <div className="absolute w-64 h-64 bg-green-500/10 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
            <div className="absolute w-48 h-48 bg-green-500/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
            <div className="bg-black p-6 rounded-full z-10 shadow-2xl relative">
                <Loader2 className="text-white animate-spin" size={40} />
            </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Finding Volunteers...</h3>
        <p className="text-gray-500 text-sm max-w-xs mb-8">Broadcasting request to nearby helpers.</p>
        <button onClick={onCancel} className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition shadow-lg"><X size={24}/></button>
      </div>
    </div>
);

const ArrivingView = ({ volunteerName }) => (
    <div className="absolute bottom-4 left-4 right-4 z-20 bg-[#121212] border border-white/10 p-6 rounded-[32px] shadow-2xl text-white animate-in slide-in-from-bottom duration-500">
        <div className="flex justify-between items-start mb-6 mt-2">
            <div>
                <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1 flex items-center gap-1"><Shield size={12}/> VERIFIED PARTNER</h3>
                <h2 className="text-3xl font-black tracking-tight">{volunteerName}</h2>
                <p className="text-green-500 text-sm font-bold mt-1">is arriving in ~3 mins</p>
            </div>
            <div className="w-16 h-16 bg-neutral-800 rounded-full border-2 border-green-500 flex items-center justify-center"><User size={28} className="text-white"/></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
            <button className="bg-green-600 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95"><Phone size={20}/> Call</button>
            <button className="bg-neutral-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95"><Navigation size={20}/> Message</button>
        </div>
    </div>
);

const RideInProgress = ({ requestData }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  if (!requestData) return null;

  return (
    <div className={`absolute left-0 right-0 bg-[#121212] rounded-t-[30px] shadow-[0_-10px_40px_rgba(0,0,0,0.8)] z-50 border-t border-white/10 transition-all duration-500 ease-in-out ${isExpanded ? 'bottom-0 pb-24 h-[60vh]' : 'bottom-0 h-[180px]'}`}>
      <div className="w-full h-8 flex items-center justify-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="w-12 h-1.5 bg-neutral-700 rounded-full mb-1"></div>
      </div>
      <div className="px-6">
          <div className="flex justify-between items-center mb-6">
              <div>
                  <div className="flex items-center gap-2 mb-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <p className="text-green-500 text-xs font-bold uppercase tracking-widest">ON TRIP</p>
                  </div>
                  <h2 className="text-3xl font-black text-white">{isExpanded ? "Your Ride" : requestData.volunteerName}</h2>
              </div>
              <button className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center border border-white/10 text-white hover:bg-neutral-700 active:scale-90 transition"><Share2 size={18}/></button>
          </div>
          <div className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
              <div className="bg-[#1a1a1a] p-5 rounded-3xl border border-white/5 mb-6 relative">
                  <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-neutral-700"></div>
                  <div className="flex items-start mb-6 relative z-10">
                      <div className="w-3 h-3 bg-white rounded-full border-2 border-neutral-500 shadow mr-4 mt-1"></div>
                      <div><p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Pickup</p><p className="font-bold text-gray-200 text-sm">{requestData.pickupLocation || "Kottayam"}</p></div>
                  </div>
                  <div className="flex items-start relative z-10">
                      <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow mr-4 mt-1"></div>
                      <div><p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Destination</p><p className="font-bold text-gray-200 text-sm">{requestData.dropOffLocation || "Medical College"}</p></div>
                  </div>
              </div>
              <div className="flex items-center justify-between bg-black border border-white/10 p-4 rounded-3xl shadow-lg">
                  <div className="flex items-center">
                      <div className="w-14 h-14 bg-gradient-to-br from-neutral-800 to-black text-white rounded-2xl flex items-center justify-center font-bold text-xl mr-4 border border-white/5">{requestData.volunteerName?.charAt(0)}</div>
                      <div><p className="font-bold text-white text-lg">{requestData.volunteerName}</p><div className="flex items-center mt-1"><ShieldCheck size={12} className="text-blue-500 mr-1"/><span className="text-[10px] text-blue-400 font-bold uppercase">Verified</span></div></div>
                  </div>
                  <div className="flex gap-3"><button className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-lg active:scale-95"><Phone size={18}/></button></div>
              </div>
          </div>
          {!isExpanded && (<div className="flex items-center gap-4 text-gray-400 text-sm"><p>Tap to see full ride details</p><ChevronUp size={16} className="animate-bounce"/></div>)}
      </div>
    </div>
  );
};

const RateAndTip = ({ requestData, onSkip, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [selectedTip, setSelectedTip] = useState(0);
  const [paymentMode, setPaymentMode] = useState('online');

  return (
    <div className="fixed inset-0 z-[3000] bg-white flex flex-col items-center justify-center p-6 animate-in zoom-in duration-300">
      <div className="text-center mb-6"><div className="mx-auto bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-4"><CheckCircle size={40} className="text-green-600" /></div><h2 className="text-3xl font-black text-gray-900">Ride Completed!</h2><p className="text-gray-500 mt-2 font-medium">Rate {requestData?.volunteerName}</p></div>
      <div className="flex justify-center gap-3 mb-8">{[1, 2, 3, 4, 5].map((star) => (<Star key={star} size={40} className={`cursor-pointer transition hover:scale-110 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} onClick={() => setRating(star)}/>))}</div>
      <div className="grid grid-cols-4 gap-3 mb-8 w-full max-w-sm">{[0, 20, 50, 100].map((amt) => (<button key={amt} onClick={() => setSelectedTip(amt)} className={`py-4 rounded-2xl font-bold border transition ${selectedTip === amt ? 'bg-black text-white border-black scale-105 shadow-xl' : 'bg-gray-50 text-gray-700 border-transparent hover:bg-gray-100'}`}>{amt === 0 ? "No" : `₹${amt}`}</button>))}</div>
      <div className="w-full max-w-sm bg-blue-50 p-4 rounded-2xl mb-6 border border-blue-100"><p className="text-[10px] font-black text-blue-600 uppercase mb-3 flex items-center gap-2"><ShieldCheck size={12}/> Secure Payment</p><div className="flex gap-3"><button onClick={() => setPaymentMode('online')} className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center justify-center transition ${paymentMode === 'online' ? 'border-blue-600 bg-white text-blue-700 shadow-md' : 'border-transparent bg-blue-100/50 text-gray-500 hover:bg-white'}`}><CreditCard size={24} className="mb-1"/><span className="text-xs font-bold">Online</span></button><button onClick={() => setPaymentMode('cash')} className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center justify-center transition ${paymentMode === 'cash' ? 'border-green-600 bg-white text-green-700 shadow-md' : 'border-transparent bg-green-100/50 text-gray-500 hover:bg-white'}`}><Banknote size={24} className="mb-1"/><span className="text-xs font-bold">Cash</span></button></div></div>
      <button onClick={onSubmit} className="w-full max-w-sm bg-black text-white font-bold py-4 rounded-2xl mb-4 hover:bg-gray-800 shadow-xl active:scale-95">{paymentMode === 'online' ? `Pay ₹${150 + selectedTip}` : "Confirm Cash"}</button>
      <button onClick={onSkip} className="text-gray-400 font-bold text-sm hover:text-black transition">Skip</button>
    </div>
  );
};

// ==========================================
// 3. MAIN DASHBOARD CONTROLLER (V40 - The Fix)
// ==========================================
const UserDashboard = () => {
  const [step, setStep] = useState('menu'); // 'menu' | 'input' | 'searching' | 'arriving' | 'riding' | 'rating'
  const [selectedService, setSelectedService] = useState(null);
  
  // Data
  const [rideId, setRideId] = useState(null); 
  const [rideData, setRideData] = useState(null);
  
  // Logic Guards
  const pollingRef = useRef(null);
  const lastKnownStatus = useRef('pending'); // ⚠️ PREVENTS LOOPS

  // --- ACTIONS ---
  const handleConfirmRequest = async () => {
    try {
      const res = await fetch(`${DEPLOYED_API_URL}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterName: "John User", type: selectedService || "Ride", price: 150, pickup: "Kottayam", drop: "Medical College" })
      });
      if (res.ok) {
        const data = await res.json();
        setRideId(data._id);
        setStep('searching');
        lastKnownStatus.current = 'pending'; // Reset logic
      }
    } catch (e) { alert("Connection Error"); }
  };

  const handleReset = () => {
      setRideId(null);
      setRideData(null);
      lastKnownStatus.current = 'pending';
      setStep('menu');
      if (pollingRef.current) clearInterval(pollingRef.current);
  };

  // --- V40 STABLE POLLING ENGINE ---
  useEffect(() => {
    if (!rideId || step === 'menu') return;

    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${DEPLOYED_API_URL}/api/requests?t=${Date.now()}`);
        if (!res.ok) return;

        const allRides = await res.json();
        const myRide = allRides.find(r => r._id === rideId);

        if (myRide) {
            const serverStatus = myRide.status;
            
            // 🛑 ABSOLUTE LOOP PROTECTION
            // If the server status matches what we already know, DO NOTHING.
            if (serverStatus === lastKnownStatus.current) return;

            console.log(`State Change Detected: ${lastKnownStatus.current} -> ${serverStatus}`);
            lastKnownStatus.current = serverStatus; // Update Memory
            setRideData(myRide); // Update Data

            // ONE-TIME TRANSITIONS
            if (serverStatus === 'accepted') {
                setStep('arriving'); 
                if(navigator.vibrate) navigator.vibrate([200, 100, 200]);
            } 
            else if (serverStatus === 'in_progress') {
                setStep('riding'); // Switches to RideInProgress
                if(navigator.vibrate) navigator.vibrate(500);
            }
            else if (serverStatus === 'completed') {
                setStep('rating'); // Switches to RateAndTip
                clearInterval(pollingRef.current); // Stop polling immediately
            }
        }
      } catch (e) {}
    }, 2000); // Poll every 2s

    return () => clearInterval(pollingRef.current);
  }, [rideId]); // Only restart if rideID changes, NOT step

  return (
    <div className="h-screen bg-neutral-100 text-black font-sans flex flex-col relative overflow-hidden">
      
      {/* GLOBAL BANNER NOTIFICATION */}
      {(step === 'arriving' || step === 'riding' || step === 'rating') && (
          <StatusBanner status={lastKnownStatus.current} />
      )}

      {/* HEADER */}
      {step !== 'rating' && (
        <div className="absolute top-0 w-full z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
            <button onClick={handleReset} className="p-3 bg-neutral-800/80 rounded-full text-white backdrop-blur-md border border-white/10 hover:bg-neutral-700 transition"><Menu size={20}/></button>
            <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800/80 rounded-full border border-neutral-700 text-white backdrop-blur-md">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div><span className="text-xs font-bold tracking-wider">ONLINE</span>
            </div>
        </div>
      )}

      {/* MAP */}
      {step !== 'rating' && (
        <div className="absolute inset-0 z-0">
            <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src="https://www.openstreetmap.org/export/embed.html?bbox=76.51%2C9.58%2C76.54%2C9.60&amp;layer=mapnik&amp;marker=9.59%2C76.52" style={{ filter: 'grayscale(100%) invert(90%) contrast(120%)' }}></iframe>
        </div>
      )}

      {/* --- SCREENS --- */}
      {step === 'menu' && (
         <div className="absolute bottom-0 w-full z-10 bg-white rounded-t-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
            <h2 className="text-2xl font-black mb-6 text-neutral-800">What do you need?</h2>
            <div className="grid grid-cols-2 gap-4">
                {[{ id: 'Ride', icon: Car, color: 'text-green-600', bg: 'bg-green-50' }, { id: 'Helper', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50' }, { id: 'Meds', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50' }, { id: 'Shop', icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50' }].map(s => (
                    <button key={s.id} onClick={() => { setSelectedService(s.id); setStep('input'); }} className={`p-5 ${s.bg} rounded-2xl flex flex-col items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-sm`}>
                        <s.icon size={32} className={s.color}/>
                        <span className="font-bold text-sm text-neutral-700">{s.id}</span>
                    </button>
                ))}
            </div>
         </div>
      )}

      {step === 'input' && (
         <div className="absolute bottom-0 w-full z-10 bg-white rounded-t-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom">
            <button onClick={() => setStep('menu')} className="mb-4"><ArrowLeft className="text-neutral-400"/></button>
            <h2 className="text-2xl font-black mb-6">Request {selectedService}</h2>
            <div className="space-y-4 mb-8">
                 <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-4"><div className="bg-blue-100 p-2 rounded-full"><Navigation size={16} className="text-blue-600"/></div><input type="text" placeholder="Current Location" className="bg-transparent font-bold w-full outline-none"/></div>
                 <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-4"><div className="bg-red-100 p-2 rounded-full"><MapPin size={16} className="text-red-600"/></div><input type="text" placeholder="Where to?" className="bg-transparent font-bold w-full outline-none"/></div>
            </div>
            <button onClick={handleConfirmRequest} className="w-full bg-black text-white font-black py-4 rounded-2xl text-lg shadow-xl active:scale-95 transition-all">Confirm Request <ArrowRight size={20}/></button>
         </div>
      )}

      {step === 'searching' && <FindingVolunteer onCancel={handleReset} />}
      
      {step === 'arriving' && <ArrivingView volunteerName={rideData?.volunteerName || "Volunteer"} />}
      
      {step === 'riding' && <RideInProgress requestData={rideData} />}
      
      {step === 'rating' && <RateAndTip requestData={rideData} onSkip={handleReset} onSubmit={handleReset} />}

    </div>
  );
};

export default UserDashboard;