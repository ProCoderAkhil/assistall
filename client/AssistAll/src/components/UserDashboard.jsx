import React, { useState, useEffect, useRef } from 'react';
import { 
    Menu, Bell, CheckCircle, Navigation, Star, Phone, Shield, Share2, 
    MessageSquare, Loader2, X, Stethoscope, MapPin, 
    CreditCard, Banknote, ShieldCheck, AlertTriangle 
} from 'lucide-react';
import ServiceSelector from './ServiceSelector';
import { useToast } from './ToastContext'; // ✅ Import the Global Toast Hook

// ✅ Dynamic API URL
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://assistall-server.onrender.com';

// ==========================================
// 1. HELPER COMPONENTS
// ==========================================

const StatusBanner = ({ status }) => {
    if (!status || status === 'pending' || status === 'completed') return null;
    let bg = "bg-blue-600", text = "Updating...", icon = <Bell size={16} />;
    if (status === 'accepted') { bg = "bg-green-600"; text = "VOLUNTEER FOUND"; icon = <CheckCircle size={16} />; }
    else if (status === 'in_progress') { bg = "bg-blue-600"; text = "RIDE IN PROGRESS"; icon = <Navigation size={16} />; }
    
    return (
        <div className={`fixed top-0 left-0 right-0 ${bg} text-white px-4 py-3 z-[5000] shadow-xl animate-in slide-in-from-top flex items-center justify-center gap-3`}>
            {icon} <span className="font-bold text-xs tracking-widest">{text}</span>
        </div>
    );
};

const FindingVolunteer = ({ requestId, onCancel }) => {
    const { addToast } = useToast(); // ✅ Use Toast

    const handleCancel = async () => {
        if (requestId) {
            try {
                await fetch(`${API_BASE}/api/requests/${requestId}/cancel`, {
                    method: 'PUT',
                    headers: { "Content-Type": "application/json" }
                });
                addToast("Request Cancelled", "info");
            } catch (e) { 
                console.error("Cancel failed", e);
                // Even if it fails, we close the UI so user isn't stuck
            }
        }
        onCancel();
    };

    return (
        <div className="absolute bottom-0 left-0 right-0 z-[2000] bg-white rounded-t-3xl shadow-2xl p-8 pb-12 animate-in slide-in-from-bottom">
            <div className="flex flex-col items-center text-center mt-4">
                <div className="relative flex items-center justify-center mb-8">
                    <div className="absolute w-64 h-64 bg-green-500/10 rounded-full animate-ping" style={{animationDuration: '3s'}}></div>
                    <div className="bg-black p-6 rounded-full z-10 shadow-2xl relative"><Loader2 className="text-white animate-spin" size={40} /></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Finding Volunteers...</h3>
                <p className="text-gray-500 text-sm max-w-xs mb-8">Broadcasting request to verified helpers.</p>
                <button onClick={handleCancel} className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center hover:bg-red-100 text-red-600 transition shadow-md">
                    <X size={24}/>
                </button>
                <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-wider">Cancel Request</p>
            </div>
        </div>
    );
};

const VolunteerProfileModal = ({ volunteer, onClose }) => {
    if (!volunteer) return null;
    return (
        <div className="fixed inset-0 z-[6000] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#121212] w-full max-w-sm sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl border border-white/10 animate-in slide-in-from-bottom">
                <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-bold text-white">Volunteer Profile</h3>
                    <button onClick={onClose} className="p-2 bg-[#222] rounded-full text-white hover:bg-red-600 transition"><X size={18}/></button>
                </div>
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold text-white border-4 border-[#222]">{volunteer.name?.charAt(0)}</div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{volunteer.name}</h2>
                        <div className="flex items-center gap-1 text-green-500 text-xs font-bold uppercase mt-1"><Shield size={12} fill="currentColor"/> Verified Partner</div>
                    </div>
                </div>
                <div className="space-y-3 mb-8">
                    {volunteer.isGeriatricTrained && (
                        <div className="bg-green-900/20 border border-green-500/30 p-3 rounded-xl flex items-center gap-3">
                            <div className="bg-green-500/20 p-2 rounded-lg text-green-400"><Stethoscope size={20}/></div>
                            <div><p className="text-white font-bold text-sm">Geriatric Trained</p><p className="text-gray-400 text-xs">Certified for elderly care</p></div>
                        </div>
                    )}
                    <div className="bg-[#1a1a1a] p-3 rounded-xl flex items-center justify-between border border-white/5">
                        <div className="flex items-center gap-3"><div className="bg-blue-500/10 p-2 rounded-lg text-blue-400"><Phone size={18}/></div><p className="text-gray-300 text-sm">{volunteer.phone || "No number"}</p></div>
                        <button className="text-xs bg-white text-black px-3 py-1.5 rounded-lg font-bold">Call</button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#1a1a1a] p-3 rounded-xl text-center border border-white/5"><p className="text-gray-500 text-xs uppercase font-bold">Rating</p><p className="text-white font-black text-xl flex items-center justify-center gap-1">4.9 <Star size={14} className="text-yellow-400 fill-current"/></p></div>
                    <div className="bg-[#1a1a1a] p-3 rounded-xl text-center border border-white/5"><p className="text-gray-500 text-xs uppercase font-bold">Trips</p><p className="text-white font-black text-xl">142</p></div>
                </div>
            </div>
        </div>
    );
};

const ArrivingView = ({ rideData, onViewProfile }) => (
    <div className="absolute bottom-4 left-4 right-4 z-20 bg-[#121212] border border-white/10 p-6 rounded-[32px] shadow-2xl text-white animate-in slide-in-from-bottom">
        <div className="flex justify-between items-start mb-6 mt-2">
            <div>
                <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1 flex items-center gap-1"><Shield size={12}/> VERIFIED PARTNER</h3>
                <h2 className="text-3xl font-black tracking-tight">{rideData?.volunteerName}</h2>
                <div className="flex items-center gap-3 mt-2">
                    <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">Maruti Swift • White</div>
                    <div className="text-green-400 font-bold text-lg">₹{rideData?.price}</div>
                </div>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full border-2 border-white/20 flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition" onClick={onViewProfile}>
                <span className="text-2xl font-bold">{rideData?.volunteerName?.charAt(0)}</span>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
            <button className="bg-green-600 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition hover:bg-green-500"><Phone size={20}/> Call</button>
            <button className="bg-[#222] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition hover:bg-[#333]"><Navigation size={20}/> Message</button>
        </div>
        <button onClick={onViewProfile} className="w-full py-3 text-sm font-bold text-gray-400 hover:text-white transition border-t border-white/5">View Full Volunteer Profile</button>
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
                        <div className="flex items-center gap-2 mb-1"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span><p className="text-green-500 text-xs font-bold uppercase tracking-widest">ON TRIP</p></div>
                        <h2 className="text-3xl font-black text-white">{isExpanded ? "Your Ride" : requestData.volunteerName}</h2>
                    </div>
                    <button className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center border border-white/10 text-white"><Share2 size={18}/></button>
                </div>
                <div className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                    <div className="bg-[#1a1a1a] p-5 rounded-3xl border border-white/5 mb-6">
                        <div className="flex items-start mb-6"><div className="w-3 h-3 bg-white rounded-full border-2 border-neutral-500 shadow mr-4 mt-1"></div><div><p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Pickup</p><p className="font-bold text-gray-200 text-sm">{requestData.pickup || "Current Location"}</p></div></div>
                        <div className="flex items-start"><div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow mr-4 mt-1"></div><div><p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Destination</p><p className="font-bold text-gray-200 text-sm">{requestData.drop}</p></div></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RateAndTip = ({ requestData, onSkip, onSubmit }) => {
    const { addToast } = useToast(); // ✅ Use Toast Hook
    const [rating, setRating] = useState(5);
    const [feedback, setFeedback] = useState('');
    const [selectedTip, setSelectedTip] = useState(0);
    const [loading, setLoading] = useState(false);
    const [paymentMode, setPaymentMode] = useState('online');

    const handleFinalSubmit = async (method) => {
        setLoading(true);
        try {
            await fetch(`${API_BASE}/api/requests/${requestData._id}/review`, {
                method: 'PUT',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating, review: feedback, tip: selectedTip, paymentMethod: method })
            });
            addToast("Thank you! Feedback Submitted.", "success"); // ✅ Use Toast
            onSubmit(); 
        } catch (err) { onSubmit(); } 
        finally { setLoading(false); }
    };

    const handleCashPayment = () => {
        setLoading(true);
        addToast(`Please give ₹${selectedTip} cash to the volunteer.`, "info"); // ✅ Use Toast
        setTimeout(() => { handleFinalSubmit('cash'); }, 2000);
    };

    const handleOnlinePayment = () => { handleFinalSubmit('online'); };
    const submitReviewOnly = () => { handleFinalSubmit('none'); };

    return (
        <div className="fixed inset-0 z-[6000] bg-white flex flex-col items-center justify-center p-6 animate-in zoom-in font-sans">
            <div className="text-center mb-6">
                <div className="mx-auto bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-4"><CheckCircle size={40} className="text-green-600" /></div>
                <h2 className="text-3xl font-black text-gray-900">Ride Completed!</h2>
                <p className="text-gray-500 mt-2 font-medium">How was {requestData?.volunteerName}?</p>
            </div>
            
            <div className="flex justify-center gap-3 mb-6">
                {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} size={40} className={`cursor-pointer transition hover:scale-110 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} onClick={() => setRating(star)}/>
                ))}
            </div>
            
            <div className="w-full max-w-sm mb-6 relative">
                <MessageSquare className="absolute left-4 top-4 text-gray-400" size={18} />
                <textarea className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 pl-12 text-sm focus:outline-none focus:border-green-500 resize-none text-gray-700" rows="2" placeholder="Write a review..." value={feedback} onChange={(e) => setFeedback(e.target.value)}/>
            </div>

            <p className="font-bold text-gray-700 mb-3 text-center text-xs uppercase tracking-wide">Add a Tip</p>
            <div className="grid grid-cols-4 gap-3 mb-6 w-full max-w-sm">
                {[0, 20, 50, 100].map(amt => (
                    <button key={amt} onClick={() => setSelectedTip(amt)} className={`py-3 rounded-xl font-bold border transition ${selectedTip === amt ? 'bg-black text-white' : 'bg-gray-50 text-gray-700'}`}>{amt === 0 ? "No" : `₹${amt}`}</button>
                ))}
            </div>
            
            {selectedTip > 0 && (
                <div className="bg-blue-50 p-4 rounded-xl mb-6 w-full max-w-sm border border-blue-100">
                    <p className="text-xs font-bold text-blue-600 uppercase mb-3 flex items-center"><ShieldCheck size={14} className="mr-1"/> Payment Method</p>
                    <div className="flex gap-3">
                        <button onClick={() => setPaymentMode('online')} className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center justify-center transition ${paymentMode === 'online' ? 'border-blue-600 bg-white text-blue-700' : 'border-transparent bg-blue-100/50 text-gray-500'}`}><CreditCard size={24} className="mb-1"/><span className="text-xs font-bold">Online</span></button>
                        <button onClick={() => setPaymentMode('cash')} className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center justify-center transition ${paymentMode === 'cash' ? 'border-green-600 bg-white text-green-700' : 'border-transparent bg-green-100/50 text-gray-500'}`}><Banknote size={24} className="mb-1"/><span className="text-xs font-bold">Cash</span></button>
                    </div>
                </div>
            )}
            
            {selectedTip > 0 ? (
                <button onClick={paymentMode === 'online' ? handleOnlinePayment : handleCashPayment} disabled={loading} className={`w-full max-w-sm text-white font-bold py-4 rounded-2xl mb-3 transition flex items-center justify-center shadow-lg active:scale-95 ${paymentMode === 'online' ? 'bg-[#3395ff]' : 'bg-green-600'}`}>{loading ? <Loader2 className="animate-spin"/> : paymentMode === 'online' ? `Pay ₹${selectedTip}` : `Confirm Cash Payment`}</button>
            ) : (
                <button onClick={submitReviewOnly} disabled={loading} className="w-full max-w-sm bg-black text-white font-bold py-4 rounded-2xl mb-3 hover:bg-gray-800 shadow-lg active:scale-95 flex items-center justify-center">{loading ? <Loader2 className="animate-spin"/> : "Submit Review"}</button>
            )}
            
            <button onClick={onSkip} className="text-gray-400 font-bold text-sm">Skip Feedback</button>
        </div>
    );
};

// ==========================================
// 2. MAIN CONTROLLER
// ==========================================

const UserDashboard = () => {
    const { addToast } = useToast(); // ✅ Use Global Toast Hook
    const [viewState, setViewState] = useState('menu'); 
    const [activeRide, setActiveRide] = useState(null);
    const [volunteerDetails, setVolunteerDetails] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [rideIdToPoll, setRideIdToPoll] = useState(() => localStorage.getItem('activeRideId'));

    const fetchVolunteerDetails = async (volunteerId) => {
        if (!volunteerId) return;
        try {
            const res = await fetch(`${API_BASE}/api/auth/user/${volunteerId}`);
            if (res.ok) setVolunteerDetails(await res.json());
        } catch (e) {}
    };

    const handleRequest = async (requestDetails) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const res = await fetch(`${API_BASE}/api/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    requesterName: user?.name || "User", 
                    requesterId: user?._id,
                    type: requestDetails.type, 
                    price: 150, 
                    pickup: "Kottayam", 
                    drop: requestDetails.dropOff 
                })
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('activeRideId', data._id);
                setRideIdToPoll(data._id);
                setViewState('searching');
                addToast("Searching for volunteers...", "info"); // ✅ Add Toast
            }
        } catch (e) { addToast("Connection Error", "error"); } // ✅ Add Toast
    };

    // --- POLLING EFFECT ---
    useEffect(() => {
        if (!rideIdToPoll) {
            setViewState('menu');
            return;
        }

        if (viewState === 'menu') setViewState('searching');

        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`${API_BASE}/api/requests?t=${Date.now()}`);
                if (res.ok) {
                    const data = await res.json();
                    const myRide = data.find(r => r._id === rideIdToPoll);

                    if (myRide) {
                        setActiveRide(myRide);

                        if (myRide.status === 'completed') {
                            setViewState('completed');
                            localStorage.removeItem('activeRideId');
                            setRideIdToPoll(null);
                            addToast("Ride Completed", "success"); // ✅ Add Toast
                            return;
                        }

                        if (myRide.status === 'accepted') {
                            if (viewState !== 'active_ride') addToast("Volunteer Found!", "success"); // ✅ Add Toast
                            setViewState('active_ride');
                            setVolunteerDetails(prev => {
                                if(!prev) fetchVolunteerDetails(myRide.volunteerId);
                                return prev;
                            });
                        } 
                        else if (myRide.status === 'in_progress') {
                            if (viewState !== 'active_ride') addToast("Ride In Progress", "info"); // ✅ Add Toast
                            setViewState('active_ride');
                        }
                    }
                }
            } catch (e) { console.error("Polling Error", e); }
        }, 3000);

        return () => clearInterval(pollInterval);
    }, [rideIdToPoll, viewState, addToast]); // ✅ Depend on addToast

    const handleReset = () => {
        localStorage.removeItem('activeRideId');
        setRideIdToPoll(null);
        setActiveRide(null);
        setViewState('menu');
        addToast("Request Cancelled", "info"); // ✅ Add Toast
    };

    return (
        <div className="h-screen bg-neutral-100 text-black font-sans flex flex-col relative overflow-hidden">
            {viewState !== 'completed' && (
                <div className="absolute inset-0 z-0">
                    <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src="https://www.openstreetmap.org/export/embed.html?bbox=76.51%2C9.58%2C76.54%2C9.60&amp;layer=mapnik&amp;marker=9.59%2C76.52" style={{ filter: 'grayscale(100%) invert(90%) contrast(120%)' }}></iframe>
                </div>
            )}

            {viewState !== 'completed' && (
                <div className="absolute top-0 w-full z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                    <button onClick={handleReset} className="p-3 bg-neutral-800/80 rounded-full text-white backdrop-blur-md border border-white/10 hover:bg-neutral-700 transition"><Menu size={20}/></button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800/80 rounded-full border border-neutral-700 text-white backdrop-blur-md">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div><span className="text-xs font-bold tracking-wider">ONLINE</span>
                    </div>
                </div>
            )}

            {activeRide && viewState !== 'completed' && <StatusBanner status={activeRide.status} />}

            {viewState === 'menu' && <ServiceSelector onFindClick={handleRequest} />}
            
            {viewState === 'searching' && <FindingVolunteer requestId={rideIdToPoll} onCancel={handleReset} />}

            {viewState === 'active_ride' && activeRide?.status === 'accepted' && (
                <>
                    <ArrivingView rideData={activeRide} onViewProfile={() => setShowProfile(true)} />
                    {showProfile && <VolunteerProfileModal volunteer={volunteerDetails} onClose={() => setShowProfile(false)} />}
                </>
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