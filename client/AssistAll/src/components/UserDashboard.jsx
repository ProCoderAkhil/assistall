import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, CheckCircle, Navigation, Star, Phone, Shield, User, Share2, MessageSquare, ChevronUp, Loader2, X, Banknote, CreditCard } from 'lucide-react';
import ServiceSelector from './ServiceSelector'; // ⚠️ Import the new selector

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://assistall-server.onrender.com';

// --- SUB-COMPONENTS ---
const StatusBanner = ({ status }) => {
    if (!status || status === 'pending') return null;
    let bg = "bg-blue-600", text = "Updating...", icon = <Bell size={16} />;
    if (status === 'accepted') { bg = "bg-green-600"; text = "VOLUNTEER FOUND"; icon = <CheckCircle size={16} />; }
    else if (status === 'in_progress') { bg = "bg-blue-600"; text = "RIDE IN PROGRESS"; icon = <Navigation size={16} />; }
    return (
        <div className={`fixed top-0 left-0 right-0 ${bg} text-white px-4 py-3 z-[5000] shadow-xl animate-in slide-in-from-top flex items-center justify-center gap-3`}>
            {icon} <span className="font-bold text-xs tracking-widest">{text}</span>
        </div>
    );
};

const FindingVolunteer = ({ onCancel }) => (
    <div className="absolute bottom-0 left-0 right-0 z-[2000] bg-white rounded-t-3xl shadow-2xl p-8 pb-12 animate-in slide-in-from-bottom">
        <div className="flex flex-col items-center text-center mt-4">
            <div className="relative flex items-center justify-center mb-8">
                <div className="absolute w-64 h-64 bg-green-500/10 rounded-full animate-ping" style={{animationDuration: '3s'}}></div>
                <div className="bg-black p-6 rounded-full z-10 shadow-2xl relative"><Loader2 className="text-white animate-spin" size={40} /></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Finding Volunteers...</h3>
            <p className="text-gray-500 text-sm max-w-xs mb-8">Broadcasting to nearby verified helpers.</p>
            <button onClick={onCancel} className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center hover:bg-red-100 text-red-600 transition shadow-md"><X size={24}/></button>
        </div>
    </div>
);

const ArrivingView = ({ volunteerName }) => (
    <div className="absolute bottom-4 left-4 right-4 z-20 bg-[#121212] border border-white/10 p-6 rounded-[32px] shadow-2xl text-white animate-in slide-in-from-bottom">
        <div className="flex justify-between items-start mb-6 mt-2">
            <div>
                <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1 flex items-center gap-1"><Shield size={12}/> VERIFIED PARTNER</h3>
                <h2 className="text-3xl font-black tracking-tight">{volunteerName}</h2>
                <p className="text-green-500 text-sm font-bold mt-1">is arriving now</p>
            </div>
            <div className="w-16 h-16 bg-neutral-800 rounded-full border-2 border-green-500 flex items-center justify-center"><User size={28} className="text-white"/></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
            <button className="bg-green-600 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95"><Phone size={20}/> Call</button>
            <button className="bg-neutral-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95"><Navigation size={20}/> Chat</button>
        </div>
    </div>
);

const RideInProgress = ({ requestData }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    if (!requestData) return null;
    return (
        <div className={`absolute left-0 right-0 bg-[#121212] rounded-t-[30px] shadow-2xl z-50 border-t border-white/10 transition-all duration-500 ease-in-out ${isExpanded ? 'bottom-0 pb-24 h-[60vh]' : 'bottom-0 h-[180px]'}`}>
            <div className="w-full h-8 flex items-center justify-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}><div className="w-12 h-1.5 bg-neutral-700 rounded-full mb-1"></div></div>
            <div className="px-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
                            <p className="text-green-500 text-xs font-bold uppercase tracking-widest">ON TRIP</p>
                        </div>
                        <h2 className="text-3xl font-black text-white">{isExpanded ? "Your Ride" : requestData.volunteerName}</h2>
                    </div>
                    <button className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center border border-white/10 text-white"><Share2 size={18}/></button>
                </div>
                <div className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                    <div className="bg-[#1a1a1a] p-5 rounded-3xl border border-white/5 mb-6">
                        <div className="flex items-start mb-6"><div className="w-3 h-3 bg-white rounded-full border-2 border-neutral-500 shadow mr-4 mt-1"></div><div><p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Pickup</p><p className="font-bold text-gray-200 text-sm">{requestData.pickupLocation || "Current Location"}</p></div></div>
                        <div className="flex items-start"><div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow mr-4 mt-1"></div><div><p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Destination</p><p className="font-bold text-gray-200 text-sm">{requestData.dropOffLocation || "Medical College"}</p></div></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RateAndTip = ({ requestData, onSkip, onSubmit }) => {
    const [rating, setRating] = useState(5);
    const [selectedTip, setSelectedTip] = useState(0);
    return (
        <div className="fixed inset-0 z-[3000] bg-white flex flex-col items-center justify-center p-6 animate-in zoom-in">
            <div className="text-center mb-6"><div className="mx-auto bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-4"><CheckCircle size={40} className="text-green-600" /></div><h2 className="text-3xl font-black text-gray-900">Ride Completed!</h2><p className="text-gray-500 mt-2 font-medium">Rate {requestData?.volunteerName}</p></div>
            <div className="flex justify-center gap-3 mb-8">{[1, 2, 3, 4, 5].map(star => (<Star key={star} size={40} className={`cursor-pointer transition hover:scale-110 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} onClick={() => setRating(star)}/>))}</div>
            <div className="grid grid-cols-4 gap-3 mb-8 w-full max-w-sm">{[0, 20, 50, 100].map(amt => (<button key={amt} onClick={() => setSelectedTip(amt)} className={`py-4 rounded-2xl font-bold border transition ${selectedTip === amt ? 'bg-black text-white' : 'bg-gray-50 text-gray-700'}`}>{amt === 0 ? "No" : `₹${amt}`}</button>))}</div>
            <button onClick={onSubmit} className="w-full max-w-sm bg-black text-white font-bold py-4 rounded-2xl mb-4 shadow-xl">Pay ₹{150 + selectedTip}</button>
            <button onClick={onSkip} className="text-gray-400 font-bold text-sm">Skip</button>
        </div>
    );
};

// --- MAIN CONTROLLER ---
const UserDashboard = () => {
    const [viewState, setViewState] = useState('menu'); 
    const [activeRide, setActiveRide] = useState(null);
    const pollRef = useRef(null);

    // --- 1. START REQUEST ---
    const handleRequest = async (requestDetails) => {
        try {
            const res = await fetch(`${API_BASE}/api/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    requesterName: "John User", 
                    type: requestDetails.type, 
                    price: 150, 
                    pickup: "Kottayam", 
                    drop: requestDetails.dropOff // ⚠️ Sending correct DropOff now
                })
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('activeRideId', data._id); // Save ID
                setViewState('searching');
                startPolling(data._id);
            }
        } catch (e) { alert("Connection Error"); }
    };

    // --- 2. ROBUST POLLING ---
    const startPolling = (id) => {
        if (pollRef.current) clearTimeout(pollRef.current);
        const poll = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/requests?t=${Date.now()}`);
                if (res.ok) {
                    const data = await res.json();
                    const myRide = data.find(r => r._id === id);
                    if (myRide) {
                        setActiveRide(myRide);
                        // 🔒 STATE LOCKING to prevent loops
                        if (myRide.status === 'accepted' && viewState !== 'active_ride') setViewState('active_ride');
                        if (myRide.status === 'in_progress' && viewState !== 'active_ride') setViewState('active_ride');
                        if (myRide.status === 'completed' && viewState !== 'completed') {
                            setViewState('completed');
                            localStorage.removeItem('activeRideId');
                            return; // STOP
                        }
                    }
                }
            } catch (e) {}
            pollRef.current = setTimeout(poll, 3000);
        };
        poll();
    };

    const handleReset = () => {
        if (pollRef.current) clearTimeout(pollRef.current);
        localStorage.removeItem('activeRideId');
        setViewState('menu');
        window.location.reload();
    };

    return (
        <div className="h-screen bg-neutral-100 text-black font-sans flex flex-col relative overflow-hidden">
            {/* Header */}
            {viewState !== 'completed' && (
                <div className="absolute top-0 w-full z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                    <button onClick={handleReset} className="p-3 bg-neutral-800/80 rounded-full text-white backdrop-blur-md border border-white/10 hover:bg-neutral-700 transition"><Menu size={20}/></button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800/80 rounded-full border border-neutral-700 text-white backdrop-blur-md">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div><span className="text-xs font-bold tracking-wider">ONLINE</span>
                    </div>
                </div>
            )}

            {/* Map */}
            {viewState !== 'completed' && (
                <div className="absolute inset-0 z-0">
                    <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src="https://www.openstreetmap.org/export/embed.html?bbox=76.51%2C9.58%2C76.54%2C9.60&amp;layer=mapnik&amp;marker=9.59%2C76.52" style={{ filter: 'grayscale(100%) invert(90%) contrast(120%)' }}></iframe>
                </div>
            )}

            {/* Status Banner */}
            {activeRide && <StatusBanner status={activeRide.status} />}

            {/* VIEWS */}
            {viewState === 'menu' && (
                <ServiceSelector onFindClick={handleRequest} />
            )}

            {viewState === 'searching' && <FindingVolunteer onCancel={handleReset} />}

            {viewState === 'active_ride' && activeRide?.status === 'accepted' && (
                <ArrivingView volunteerName={activeRide.volunteerName || "Volunteer"} />
            )}

            {viewState === 'active_ride' && activeRide?.status === 'in_progress' && (
                <RideInProgress requestData={activeRide} />
            )}

            {viewState === 'completed' && (
                <RateAndTip requestData={activeRide} onSkip={handleReset} onSubmit={handleReset} />
            )}
        </div>
    );
};

export default UserDashboard;