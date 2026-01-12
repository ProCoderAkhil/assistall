import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Navigation, Phone, Search, User, Shield, Menu, Car, Heart, Zap, 
  ShoppingBag, ArrowLeft, ArrowRight, Trash2, CreditCard, Star, CheckCircle, 
  Clock, Map, Bell, X, MessageSquare, AlertTriangle, Loader2
} from 'lucide-react';

const UserDashboard = () => {
  // --- STATE MANAGEMENT ---
  const [step, setStep] = useState('menu'); 
  const [selectedService, setSelectedService] = useState(null);
  
  // Load Ride ID from memory if it exists (Fixes refresh/loop issues)
  const [rideId, setRideId] = useState(() => localStorage.getItem('activeRideId') || null);
  
  const [volunteerDetails, setVolunteerDetails] = useState({ name: "Volunteer", vehicle: "Maruti Swift" });
  
  // Modals
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  
  // Payment
  const [tip, setTip] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('online'); 

  const DEPLOYED_API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000' 
      : 'https://assistall-server.onrender.com';

  const pollingRef = useRef(null);

  // --- 1. THE "RATCHET" POLLING ENGINE (V36) ---
  useEffect(() => {
    if (!rideId) return;

    // Save ID to prevent loss
    localStorage.setItem('activeRideId', rideId);

    const checkStatus = async () => {
      try {
        const res = await fetch(`${DEPLOYED_API_URL}/api/requests?t=${Date.now()}`);
        if (!res.ok) return;

        const allRides = await res.json();
        const myRide = allRides.find(r => r._id === rideId);

        if (myRide) {
            const s = myRide.status;
            
            // 🛑 RATCHET LOGIC: Only allow FORWARD progress
            // This prevents the "Loop" if the server flickers
            
            // PHASE 1: ACCEPTED (Volunteer Coming)
            if (s === 'accepted' && step !== 'arriving' && step !== 'riding' && step !== 'completed') {
                console.log("Status: Accepted -> Arriving");
                setVolunteerDetails({ name: myRide.volunteerName || "Volunteer", vehicle: "Maruti Swift" });
                setStep('arriving');
                if(navigator.vibrate) navigator.vibrate([200, 100, 200]);
            }
            
            // PHASE 2: IN PROGRESS (Picked Up)
            else if (s === 'in_progress' && step !== 'riding' && step !== 'completed') {
                console.log("Status: In Progress -> Riding");
                setStep('riding');
                setShowPickupModal(true); // SHOW POPUP
                if(navigator.vibrate) navigator.vibrate(500);
            }

            // PHASE 3: COMPLETED
            else if (s === 'completed' && step !== 'completed') {
                console.log("Status: Completed");
                setStep('completed');
                localStorage.removeItem('activeRideId'); // Clear memory
                if(navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
            }
        }
      } catch (e) { console.error("Sync skip"); }
    };

    // Run immediately then loop
    checkStatus();
    pollingRef.current = setInterval(checkStatus, 3000);

    return () => clearInterval(pollingRef.current);
  }, [rideId, step]); // Dependencies ensure we always have fresh state

  // --- 2. PAYMENT ---
  const loadRazorpayScript = (src) => new Promise(resolve => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePayment = async () => {
    if (paymentMethod === 'cash') {
        alert("Please pay cash to the volunteer.");
        window.location.reload(); 
        return;
    }
    const res = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) return alert('Razorpay failed.');

    const options = {
      key: "rzp_test_S1HtYIQWxqe96O", 
      amount: (150 + tip) * 100, 
      currency: "INR",
      name: "AssistAll Payment",
      description: `Ride Fare`,
      handler: function (response) {
        alert(`Success! Ref: ${response.razorpay_payment_id}`);
        window.location.reload(); 
      },
      prefill: { name: "User", contact: "9999999999" },
      theme: { color: "#3B82F6" }
    };
    new window.Razorpay(options).open();
  };

  // --- 3. ACTIONS ---
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
      }
    } catch (e) { alert("Connection Error"); }
  };

  const handleCancel = () => {
      localStorage.removeItem('activeRideId');
      setRideId(null);
      setStep('menu');
  };

  // --- V36 VIEWS ---

  // 1. ARRIVING VIEW
  const ArrivingView = () => (
      <div className="absolute bottom-4 left-4 right-4 z-20 bg-[#121212] border border-white/10 p-6 rounded-[32px] shadow-2xl text-white animate-in slide-in-from-bottom duration-500">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/50 flex items-center gap-2">
              <Bell size={10} fill="currentColor"/> Volunteer Arriving
          </div>
          <div className="flex justify-between items-start mb-6 mt-2">
              <div>
                  <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1 flex items-center gap-1"><Shield size={12}/> VERIFIED PARTNER</h3>
                  <h2 className="text-3xl font-black tracking-tight">{volunteerDetails.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                      <div className="bg-white/10 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Star size={10} className="text-yellow-400 fill-current"/> 4.9</div>
                      <div className="bg-white/10 px-2 py-1 rounded text-xs font-bold text-neutral-400">Maruti Swift</div>
                  </div>
              </div>
              <div className="w-16 h-16 bg-neutral-800 rounded-full border-2 border-blue-500 flex items-center justify-center">
                  <User size={28} className="text-white"/>
              </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
              <button className="bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-500 transition active:scale-95"><Phone size={20}/> Call</button>
              <button className="bg-neutral-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-700 transition active:scale-95"><Navigation size={20}/> Message</button>
          </div>
      </div>
  );

  // 2. RIDING VIEW (UPDATED)
  const RidingView = () => (
      <div className="absolute bottom-4 left-4 right-4 z-20 bg-[#121212] border border-green-500/30 p-6 rounded-[32px] shadow-2xl text-white animate-in slide-in-from-bottom duration-500">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-900/50 flex items-center gap-2 animate-pulse">
              <Navigation size={10} fill="currentColor"/> ON TRIP
          </div>
          <div className="flex items-center justify-between mb-8 mt-2">
              <div>
                  <p className="text-neutral-400 text-xs font-bold uppercase mb-1">Heading to</p>
                  <h2 className="text-2xl font-black text-white">Medical College</h2>
                  <p className="text-green-400 text-sm font-bold mt-1">~15 mins remaining</p>
              </div>
              <div className="w-14 h-14 bg-green-900/20 rounded-full border-2 border-green-500 flex items-center justify-center animate-pulse">
                  <Car size={24} className="text-green-500"/>
              </div>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full mb-6 overflow-hidden">
              <div className="bg-green-500 h-full w-[60%] rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)]"></div>
          </div>
          <button onClick={() => setShowSOS(true)} className="w-full bg-red-900/20 border border-red-500/50 text-red-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-900/40 transition active:scale-95">
              <AlertTriangle size={20}/> Emergency SOS
          </button>
      </div>
  );

  // 3. POPUP MODAL (When Picked Up)
  const PickupModal = () => (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-[85%] max-w-sm p-6 rounded-[32px] text-center shadow-2xl animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
                  <Car size={40} className="text-green-600"/>
              </div>
              <h2 className="text-2xl font-black mb-2 text-neutral-900">Ride Started!</h2>
              <p className="text-neutral-500 mb-8 font-medium leading-relaxed">Volunteer picked you up.<br/>Heading to destination.</p>
              <button onClick={() => setShowPickupModal(false)} className="w-full bg-black text-white font-bold py-4 rounded-2xl shadow-xl hover:scale-[1.02] transition">Awesome</button>
          </div>
      </div>
  );

  return (
    <div className="h-screen bg-neutral-100 text-black font-sans flex flex-col relative overflow-hidden">
      
      {/* HEADER */}
      {step !== 'completed' && (
        <div className="absolute top-0 w-full z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
            <button onClick={() => setStep('menu')} className="p-3 bg-neutral-800/80 rounded-full text-white backdrop-blur-md border border-white/10 hover:bg-neutral-700 transition"><Menu size={20}/></button>
            <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800/80 rounded-full border border-neutral-700 text-white backdrop-blur-md">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div><span className="text-xs font-bold tracking-wider">ONLINE</span>
            </div>
        </div>
      )}

      {/* MAP */}
      {step !== 'completed' && (
        <div className="absolute inset-0 z-0">
            <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src="https://www.openstreetmap.org/export/embed.html?bbox=76.51%2C9.58%2C76.54%2C9.60&amp;layer=mapnik&amp;marker=9.59%2C76.52" style={{ filter: 'grayscale(100%) invert(90%) contrast(120%)' }}></iframe>
        </div>
      )}

      {/* RENDER STEPS */}
      {step === 'menu' && (
         <div className="absolute bottom-0 w-full z-10 bg-white rounded-t-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom">
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
            <button onClick={handleConfirmRequest} className="w-full bg-black text-white font-black py-4 rounded-2xl text-lg shadow-xl active:scale-95 transition-all">Confirm Request <ArrowRight size={20}/></button>
         </div>
      )}

      {step === 'searching' && (
          <div className="absolute bottom-0 w-full z-10 p-6 flex flex-col items-center pb-12 bg-gradient-to-t from-black via-black/90 to-transparent text-white animate-in fade-in">
               <div className="relative mb-8">
                   <div className="w-32 h-32 bg-blue-500/10 rounded-full animate-ping absolute inset-0"></div>
                   <div className="w-32 h-32 bg-black border-4 border-blue-500 rounded-full flex items-center justify-center relative z-10"><Search size={40} className="text-blue-500 animate-pulse"/></div>
               </div>
               <h3 className="text-2xl font-black mb-1">Finding Help...</h3>
               <button onClick={handleCancel} className="bg-white/10 backdrop-blur-md px-8 py-3 rounded-full font-bold text-sm text-white mt-6">Cancel</button>
          </div>
      )}

      {step === 'arriving' && <ArrivingView />}
      {step === 'riding' && <RidingView />}

      {step === 'completed' && (
          <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 animate-in zoom-in duration-500">
              <div className="bg-green-50 p-8 rounded-full shadow-xl mb-6 border border-green-100 animate-bounce"><CheckCircle size={64} className="text-green-500"/></div>
              <h1 className="text-4xl font-black mb-2 text-neutral-900 tracking-tight">Ride Completed!</h1>
              <div className="flex gap-2 mb-10">{[1,2,3,4,5].map(i => <Star key={i} size={36} className="text-yellow-400 fill-current drop-shadow-md cursor-pointer hover:scale-110 transition"/>)}</div>
              
              <div className="w-full max-w-md mb-8">
                  <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4 text-center">ADD A TIP</p>
                  <div className="grid grid-cols-4 gap-3">
                      {[0, 20, 50, 100].map(amount => (
                          <button key={amount} onClick={() => setTip(amount)} className={`py-3 rounded-2xl font-bold border-2 transition active:scale-95 ${tip === amount ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-100'}`}>{amount === 0 ? 'No' : `₹${amount}`}</button>
                      ))}
                  </div>
              </div>

              <button onClick={handlePayment} className="w-full max-w-md bg-blue-600 text-white font-black py-5 rounded-2xl text-lg shadow-xl hover:bg-blue-700 transition active:scale-[0.98]">
                  {paymentMethod === 'online' ? `Pay ₹${150 + tip}` : `Confirm Cash Payment`} <ArrowRight size={20}/>
              </button>
              <button onClick={() => window.location.reload()} className="mt-6 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-black transition">Skip</button>
          </div>
      )}

      {showPickupModal && <PickupModal />}
      {showSOS && <SOSModal />}
    </div>
  );
};

const SOSModal = () => <div className="fixed inset-0 z-[100] bg-red-900/90 flex items-center justify-center text-white"><h1 className="text-4xl font-black">SOS ALERT SENT</h1></div>;

export default UserDashboard;