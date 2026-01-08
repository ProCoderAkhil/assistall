import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, Search, User, Shield, Menu, Car, Heart, Zap, ShoppingBag, ArrowLeft, ArrowRight, Trash2, CreditCard, Star, CheckCircle } from 'lucide-react';

const UserDashboard = () => {
  const [step, setStep] = useState('menu'); // menu -> input -> searching -> found -> completed
  const [selectedService, setSelectedService] = useState(null);
  const [rideId, setRideId] = useState(null); 
  const [volunteerDetails, setVolunteerDetails] = useState(null);
  
  // Payment States
  const [tip, setTip] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' or 'cash'

  const DEPLOYED_API_URL = "https://assistall-server.onrender.com";

  // --- 1. RAZORPAY LOADER ---
  const loadRazorpayScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // --- 2. PAYMENT HANDLER ---
  const handlePayment = async () => {
    if (paymentMethod === 'cash') {
        alert("Please pay cash to the volunteer.");
        window.location.reload(); // Reset app
        return;
    }

    const res = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');

    if (!res) {
      alert('Razorpay SDK failed to load. Check your internet connection.');
      return;
    }

    // Calculate Total (Base Fare 150 + Tip)
    const totalAmount = 150 + tip;

    const options = {
      key: "rzp_test_S1HtYIQWxqe96O", // ⚠️ PASTE YOUR RAZORPAY TEST KEY HERE
      amount: totalAmount * 100, // Amount in paise
      currency: "INR",
      name: "AssistAll Payment",
      description: `Ride Fare + Tip`,
      image: "https://cdn-icons-png.flaticon.com/512/1041/1041888.png",
      handler: function (response) {
        alert(`Payment Successful! ID: ${response.razorpay_payment_id}`);
        window.location.reload(); // Reset app after success
      },
      prefill: {
        name: "John User",
        email: "john@example.com",
        contact: "9999999999"
      },
      theme: { color: "#3B82F6" }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  // --- 3. POLLING (Detects Completion) ---
  useEffect(() => {
    let interval;
    if (rideId && (step === 'searching' || step === 'found')) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${DEPLOYED_API_URL}/api/requests`);
          const allRides = await res.json();
          const myRide = allRides.find(r => r._id === rideId);

          if (myRide) {
            // Volunteer Accepted
            if (myRide.status === 'accepted' || myRide.status === 'in_progress') {
                if (step !== 'found') {
                    setVolunteerDetails({ name: myRide.volunteerName });
                    setStep('found');
                }
            }
            // Ride Completed -> Go to Payment Screen
            if (myRide.status === 'completed') {
                setStep('completed');
                clearInterval(interval);
            }
          }
        } catch (err) { console.error(err); }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [rideId, step]);

  // --- ACTIONS ---
  const handleSelectService = (service) => { setSelectedService(service); setStep('input'); };
  const handleCancel = () => { setStep('menu'); setRideId(null); setSelectedService(null); };
  
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
    } catch (e) { alert("Network Error"); }
  };

  return (
    <div className="h-screen bg-neutral-100 text-black font-sans flex flex-col relative overflow-hidden">
      
      {/* HEADER (Hidden on Completed Screen for clean look) */}
      {step !== 'completed' && (
        <div className="absolute top-0 w-full z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
            <button onClick={() => setStep('menu')} className="p-3 bg-neutral-800/80 rounded-full text-white"><Menu size={20}/></button>
            <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800/80 rounded-full border border-neutral-700 text-white">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div><span className="text-xs font-bold">ONLINE</span>
            </div>
        </div>
      )}

      {/* BACKGROUND MAP */}
      {step !== 'completed' && (
        <div className="absolute inset-0 z-0">
            <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src="https://www.openstreetmap.org/export/embed.html?bbox=76.51%2C9.58%2C76.54%2C9.60&amp;layer=mapnik&amp;marker=9.59%2C76.52" style={{ filter: 'grayscale(100%) invert(90%) contrast(120%)' }}></iframe>
        </div>
      )}

      {/* --- STEP 1: MENU --- */}
      {step === 'menu' && (
         <div className="absolute bottom-0 w-full z-10 bg-white rounded-t-3xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-neutral-800">Select Service</h2>
            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleSelectService('Ride')} className="p-4 bg-green-50 border border-green-200 rounded-2xl flex flex-col items-center gap-2 hover:bg-green-100 transition"><Car size={32} className="text-green-600"/><span className="font-bold text-sm">Ride</span></button>
                <button onClick={() => handleSelectService('Helper')} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col items-center gap-2 hover:bg-gray-100 transition"><Heart size={32} className="text-pink-500"/><span className="font-bold text-sm">Helper</span></button>
                <button onClick={() => handleSelectService('Meds')} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col items-center gap-2 hover:bg-gray-100 transition"><Zap size={32} className="text-yellow-500"/><span className="font-bold text-sm">Meds</span></button>
                <button onClick={() => handleSelectService('Shop')} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col items-center gap-2 hover:bg-gray-100 transition"><ShoppingBag size={32} className="text-blue-500"/><span className="font-bold text-sm">Shop</span></button>
            </div>
         </div>
      )}

      {/* --- STEP 2: INPUT --- */}
      {step === 'input' && (
         <div className="absolute bottom-0 w-full z-10 bg-white rounded-t-3xl p-6 shadow-2xl">
            <h2 className="text-2xl font-black mb-2">Request {selectedService}</h2>
            <div className="space-y-4 mb-6">
                 <div className="bg-gray-100 p-4 rounded-xl flex items-center gap-4"><Navigation size={16} className="text-blue-500"/><input type="text" placeholder="Current Location" className="bg-transparent font-bold w-full outline-none text-black"/></div>
                 <div className="bg-gray-100 p-4 rounded-xl flex items-center gap-4"><MapPin size={16} className="text-red-500"/><input type="text" placeholder="Enter Destination" className="bg-transparent font-bold w-full outline-none text-black"/></div>
            </div>
            <button onClick={handleConfirmRequest} className="w-full bg-black text-white font-black py-4 rounded-xl text-lg flex justify-between px-6 items-center"><span>Confirm</span><ArrowRight/></button>
         </div>
      )}

      {/* --- STEP 3: SEARCHING --- */}
      {step === 'searching' && (
          <div className="absolute bottom-0 w-full z-10 p-6 flex flex-col items-center pb-12 bg-gradient-to-t from-black via-black/90 to-transparent text-white">
               <div className="relative mb-8"><div className="w-24 h-24 bg-blue-500/20 rounded-full animate-ping absolute inset-0"></div><div className="w-24 h-24 bg-black border-2 border-blue-500 rounded-full flex items-center justify-center relative z-10"><Search size={32} className="text-blue-500 animate-pulse"/></div></div>
               <h3 className="text-xl font-bold mb-2">Finding Volunteers...</h3>
               <button onClick={handleCancel} className="bg-neutral-800/80 px-6 py-3 rounded-full font-bold text-sm mt-4 text-white">Cancel</button>
          </div>
      )}

      {/* --- STEP 4: FOUND --- */}
      {step === 'found' && (
          <div className="absolute bottom-4 left-4 right-4 z-20 bg-neutral-900 border border-neutral-800 p-6 rounded-3xl shadow-2xl text-white">
              <div className="flex justify-between items-start mb-6">
                  <div><h3 className="text-green-400 font-bold text-xs uppercase tracking-widest mb-1 flex items-center gap-1"><Shield size={12}/> VOLUNTEER ASSIGNED</h3><h2 className="text-2xl font-black">{volunteerDetails?.name}</h2></div>
                  <div className="w-14 h-14 bg-neutral-800 rounded-full border-2 border-green-500 flex items-center justify-center"><User size={24} className="text-white"/></div>
              </div>
              <button className="w-full bg-green-600 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2"><Phone size={20}/> Call Volunteer</button>
          </div>
      )}

      {/* --- STEP 5: COMPLETED & PAYMENT (Updated from your Screenshot) --- */}
      {step === 'completed' && (
          <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center p-6 animate-in slide-in-from-bottom duration-500">
              <div className="bg-white p-6 rounded-full shadow-lg mb-6"><CheckCircle size={48} className="text-green-500"/></div>
              <h1 className="text-3xl font-black mb-1">Ride Completed!</h1>
              <p className="text-neutral-500 font-bold mb-6">Rate {volunteerDetails?.name || "Volunteer"}</p>
              
              {/* Stars */}
              <div className="flex gap-2 mb-8">
                  {[1,2,3,4,5].map(i => <Star key={i} size={32} className="text-yellow-400 fill-current"/>)}
              </div>

              {/* Tip Selection */}
              <div className="w-full max-w-md mb-8">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3 text-center">ADD A TIP</p>
                  <div className="grid grid-cols-4 gap-3">
                      {[0, 20, 50, 100].map(amount => (
                          <button 
                            key={amount} 
                            onClick={() => setTip(amount)}
                            className={`py-3 rounded-xl font-bold border transition ${tip === amount ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-200 hover:bg-gray-50'}`}
                          >
                              {amount === 0 ? 'No' : `₹${amount}`}
                          </button>
                      ))}
                  </div>
              </div>

              {/* Payment Method */}
              <div className="w-full max-w-md bg-white p-2 rounded-2xl border border-gray-200 flex mb-8">
                  <button onClick={() => setPaymentMethod('online')} className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${paymentMethod === 'online' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-gray-400'}`}>
                      <CreditCard size={16}/> Online
                  </button>
                  <button onClick={() => setPaymentMethod('cash')} className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${paymentMethod === 'cash' ? 'bg-green-50 text-green-600 border border-green-200' : 'text-gray-400'}`}>
                      <span>💵</span> Cash
                  </button>
              </div>

              {/* PAY BUTTON - Triggers Razorpay */}
              <button 
                onClick={handlePayment}
                className="w-full max-w-md bg-blue-600 text-white font-black py-4 rounded-xl text-lg shadow-lg hover:bg-blue-700 transition active:scale-[0.98]"
              >
                  {paymentMethod === 'online' ? `Pay ₹${150 + tip}` : `Confirm Cash Payment`}
              </button>
              
              <button onClick={() => window.location.reload()} className="mt-4 text-gray-400 font-bold text-sm">Skip</button>
          </div>
      )}

    </div>
  );
};

export default UserDashboard;