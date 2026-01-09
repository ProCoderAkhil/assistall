import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, Shield, X } from 'lucide-react';

// Import all your components
import BottomNav from './components/BottomNav';
import MapBackground from './components/MapBackground';
import ServiceSelector from './components/ServiceSelector';
import FindingVolunteer from './components/FindingVolunteer';
import VolunteerFound from './components/VolunteerFound';
import RideInProgress from './components/RideInProgress';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import VolunteerDashboard from './components/VolunteerDashboard';
import ActivityHistory from './components/ActivityHistory';
import VolunteerSignup from './components/VolunteerSignup';
import UserSignup from './components/UserSignup'; 
import AdminPanel from './components/AdminPanel';
import RateAndTip from './components/RateAndTip';
import Toast from './components/Toast';
import LandingPage from './components/LandingPage'; 
import AppLoader from './components/AppLoader'; 
import SOSModal from './components/SOSModal'; 

// SMART URL
const DEPLOYED_API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://assistall-server.onrender.com';

const initialNotifs = [
    { id: 1, title: "Ride Completed", msg: "Your trip to Cyber Park was successful.", time: "10m ago", type: 'success' },
    { id: 2, title: "Promo Applied", msg: "You saved ₹50 on your last ride.", time: "1h ago", type: 'info' }
];

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [isLoading, setIsLoading] = useState(true);
  
  // V15 FEATURES
  const [showSOS, setShowSOS] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifs);
  const [step, setStep] = useState('selecting'); 
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [acceptedRequestData, setAcceptedRequestData] = useState(null);
  const [toast, setToast] = useState(null); 

  const navigate = useNavigate();
  const location = useLocation();

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  useEffect(() => { 
      const timer = setTimeout(() => setIsLoading(false), 1500); 
      return () => clearTimeout(timer); 
  }, []);

  // REAL-TIME STATUS POLLING
  useEffect(() => {
    let interval;
    if (activeRequestId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${DEPLOYED_API_URL}/api/requests`); 
          if (!res.ok) return;
          const data = await res.json();
          const myRequest = data.find(r => r._id === activeRequestId);
          
          if (myRequest) {
             if (myRequest.status === 'accepted' && step !== 'found') {
                setAcceptedRequestData(myRequest); setStep('found'); showToast(`Volunteer Found!`, 'success');
             } else if (myRequest.status === 'in_progress' && step !== 'in_progress') {
               setStep('in_progress'); showToast("Ride Started", 'info');
             } else if (myRequest.status === 'completed' && step !== 'rating') {
               setStep('rating'); showToast("Ride Completed", 'success');
             }
          }
        } catch (err) { }
      }, 2000); 
    }
    return () => clearInterval(interval);
  }, [activeRequestId, step]);

  const handleLoginSuccess = (userData, token) => {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      setUser(userData);
      if(userData.role === 'volunteer') navigate('/volunteer');
      else if(userData.role === 'admin') navigate('/admin');
      else navigate('/home');
  };

  const handleLogout = () => {
      localStorage.clear();
      setUser(null);
      navigate('/');
  };

  const handleFindVolunteer = async (bookingDetails) => { 
    if (!bookingDetails.dropOff) { showToast("Please enter a destination", "error"); return; }
    setStep('searching'); 
    try {
      const res = await fetch(`${DEPLOYED_API_URL}/api/requests`, {
        method: 'POST', headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            requesterName: user.name, 
            requesterId: user._id,
            type: bookingDetails.type, 
            dropOffLocation: bookingDetails.dropOff,
            location: { lat: 9.5916, lng: 76.5222 } 
        }),
      });
      const data = await res.json();
      setActiveRequestId(data._id);
      showToast("Searching for volunteers...", "info");
    } catch (err) { showToast("Network Error", "error"); setStep('selecting'); }
  };

  if (isLoading) return <AppLoader />;

  return (
    <div className="h-screen w-full relative overflow-hidden bg-[#050505] font-sans text-white">
      <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[5000] w-full max-w-sm px-4">
          {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<LandingPage onGetStarted={() => navigate('/login')} onVolunteerJoin={() => navigate('/volunteer-register')} />} />
        
        <Route path="/login" element={
            <Login 
                onLogin={(u, t) => handleLoginSuccess(u, t)} 
                onVolunteerClick={() => navigate('/volunteer-register')} 
                onSignupClick={() => navigate('/register')} 
                onBack={() => navigate('/')} 
            />
        } />
        
        <Route path="/register" element={<UserSignup onRegister={(u) => handleLoginSuccess(u, 'temp-token')} onBack={() => navigate('/')} />} />
        <Route path="/volunteer-register" element={<VolunteerSignup onRegister={(u) => handleLoginSuccess(u, 'temp-token')} onBack={() => navigate('/')} />} />

        {/* PROTECTED ROUTES */}
        {user && (
            <>
                <Route path="/home" element={
                    <>
                        <div className="absolute inset-0 z-0"><MapBackground activeRequest={acceptedRequestData} /></div>
                        
                        {/* HEADER */}
                        <div className="absolute top-0 left-0 right-0 p-4 pt-10 z-20 flex justify-between items-start pointer-events-none">
                            <button onClick={() => navigate('/profile')} className="pointer-events-auto w-10 h-10 bg-[#0a0a0a]/90 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 text-white shadow-xl"><Menu size={20}/></button>
                            <div className="bg-[#0a0a0a]/90 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/10 shadow-2xl flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${step==='selecting'?'bg-green-500':'bg-yellow-500'} animate-pulse`}></div>
                                <span className="text-xs font-bold text-white uppercase tracking-wider">{step==='selecting'?'Live':'Active'}</span>
                            </div>
                            <div className="flex gap-3 pointer-events-auto">
                                <button onClick={() => setShowNotifs(!showNotifs)} className="w-10 h-10 bg-[#0a0a0a]/90 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10"><Bell size={18}/></button>
                                <button onClick={() => setShowSOS(true)} className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center border-2 border-red-500 animate-pulse"><Shield size={18}/></button>
                            </div>
                        </div>

                        {/* CONTENT SWITCHER */}
                        {step === 'selecting' && <ServiceSelector onClose={() => {}} onFindClick={handleFindVolunteer} user={user} />}
                        {step === 'searching' && <FindingVolunteer requestId={activeRequestId} onCancel={() => setStep('selecting')} />}
                        {step === 'found' && <VolunteerFound requestData={acceptedRequestData} onReset={() => setStep('selecting')} />}
                        {step === 'in_progress' && <RideInProgress requestData={acceptedRequestData} />}
                        {step === 'rating' && <RateAndTip requestData={acceptedRequestData} onSkip={() => setStep('selecting')} onSubmit={() => setStep('selecting')} showToast={showToast} />}

                        <BottomNav activeTab="home" onHomeClick={() => navigate('/home')} onProfileClick={() => navigate('/profile')} onActivityClick={() => navigate('/activity')} onSOSClick={() => setShowSOS(true)} />
                        
                        <SOSModal isOpen={showSOS} onClose={() => setShowSOS(false)} onConfirm={() => {setShowSOS(false); showToast("🚨 ALERT SENT!", "error");}} />
                    </>
                } />

                <Route path="/profile" element={<UserProfile user={user} onLogout={handleLogout} onBack={() => navigate('/home')} />} />
                <Route path="/activity" element={<div className="h-screen bg-[#050505] flex flex-col"><ActivityHistory user={user} onBack={() => navigate('/home')}/><BottomNav activeTab="activity" onHomeClick={() => navigate('/home')} onProfileClick={() => navigate('/profile')} onActivityClick={() => navigate('/activity')} onSOSClick={() => setShowSOS(true)} /></div>} />
                <Route path="/volunteer" element={<VolunteerDashboard user={user} globalToast={showToast} />} />
                <Route path="/admin" element={<AdminPanel onLogout={handleLogout} />} />
            </>
        )}
      </Routes>
    </div>
  );
}

export default App;