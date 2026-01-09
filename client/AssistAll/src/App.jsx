import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Menu, Bell, Shield, X } from 'lucide-react';

// Components
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

// ⚠️ FIXED URL: Forces HTTPS to prevent "Mixed Content" error
const DEPLOYED_API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://assistall-server.onrender.com';

const initialNotifs = [
    { id: 1, title: "Ride Completed", msg: "Trip successful.", time: "10m ago", type: 'success' }
];

function App() {
  // CRASH FIX: Safe LocalStorage Loading
  const [user, setUser] = useState(() => {
      try {
          const saved = localStorage.getItem('user');
          if (!saved || saved === "undefined") return null;
          return JSON.parse(saved);
      } catch (e) { 
          console.error("Storage corrupt, clearing...");
          localStorage.clear(); 
          return null; 
      }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState('selecting'); 
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [acceptedRequestData, setAcceptedRequestData] = useState(null);
  const [showSOS, setShowSOS] = useState(false);
  const [toast, setToast] = useState(null); 

  const navigate = useNavigate();
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  useEffect(() => { setTimeout(() => setIsLoading(false), 1500); }, []);

  // Polling for Updates
  useEffect(() => {
    if (!activeRequestId) return;
    const interval = setInterval(async () => {
        try {
          const res = await fetch(`${DEPLOYED_API_URL}/api/requests`);
          if(res.ok) {
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
          }
        } catch (err) {}
    }, 2000);
    return () => clearInterval(interval);
  }, [activeRequestId, step]);

  const handleLoginSuccess = (userData, token) => {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      setUser(userData);
      
      // Auto Redirect based on Role
      if(userData.role === 'volunteer') navigate('/volunteer');
      else if(userData.role === 'admin') navigate('/admin');
      else navigate('/home');
  };

  const handleLogout = () => { localStorage.clear(); setUser(null); navigate('/'); };

  const handleFindVolunteer = async (bookingDetails) => { 
    setStep('searching'); 
    try {
      const res = await fetch(`${DEPLOYED_API_URL}/api/requests`, {
        method: 'POST', headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            requesterName: user.name, requesterId: user._id, type: bookingDetails.type, 
            dropOffLocation: bookingDetails.dropOff, location: { lat: 9.5916, lng: 76.5222 } 
        }),
      });
      const data = await res.json();
      setActiveRequestId(data._id);
  } catch (err) { showToast("Network Error", "error"); setStep('selecting'); }
  };

  if (isLoading) return <AppLoader />;

  return (
    <div className="h-screen w-full bg-[#050505] font-sans text-white relative overflow-hidden">
      <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[5000] w-full max-w-sm px-4">
          {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>

      <Routes>
        <Route path="/" element={<LandingPage onGetStarted={() => navigate('/login')} onVolunteerJoin={() => navigate('/volunteer-register')} />} />
        <Route path="/login" element={<Login onLogin={handleLoginSuccess} onBack={() => navigate('/')} onSignupClick={() => navigate('/register')} onVolunteerClick={() => navigate('/volunteer-register')} />} />
        <Route path="/register" element={<UserSignup onRegister={(u) => handleLoginSuccess(u, 'token')} onBack={() => navigate('/')} />} />
        <Route path="/volunteer-register" element={<VolunteerSignup onRegister={(u) => handleLoginSuccess(u, 'token')} onBack={() => navigate('/')} />} />

        <Route path="/home" element={user ? (
            <>
                <div className="absolute inset-0 z-0"><MapBackground activeRequest={acceptedRequestData} /></div>
                <div className="absolute top-0 left-0 right-0 p-4 pt-10 z-20 flex justify-between items-start pointer-events-none">
                    <button onClick={() => navigate('/profile')} className="pointer-events-auto w-10 h-10 bg-[#0a0a0a]/90 backdrop-blur-xl rounded-full flex justify-center items-center border border-white/10"><Menu size={20}/></button>
                    <div className="flex gap-3 pointer-events-auto">
                        <button className="w-10 h-10 bg-[#0a0a0a]/90 backdrop-blur-xl rounded-full flex justify-center items-center border border-white/10"><Bell size={18}/></button>
                        <button onClick={() => setShowSOS(true)} className="w-10 h-10 bg-red-600 rounded-full flex justify-center items-center animate-pulse"><Shield size={18}/></button>
                    </div>
                </div>
                {step === 'selecting' && <ServiceSelector onClose={() => {}} onFindClick={handleFindVolunteer} user={user} />}
                {step === 'searching' && <FindingVolunteer requestId={activeRequestId} onCancel={() => setStep('selecting')} />}
                {step === 'found' && <VolunteerFound requestData={acceptedRequestData} onReset={() => setStep('selecting')} />}
                {step === 'in_progress' && <RideInProgress requestData={acceptedRequestData} />}
                {step === 'rating' && <RateAndTip requestData={acceptedRequestData} onSkip={() => setStep('selecting')} onSubmit={() => setStep('selecting')} />}
                <BottomNav activeTab="home" onHomeClick={() => navigate('/home')} onProfileClick={() => navigate('/profile')} onActivityClick={() => navigate('/activity')} onSOSClick={() => setShowSOS(true)} />
                <SOSModal isOpen={showSOS} onClose={() => setShowSOS(false)} onConfirm={() => setShowSOS(false)} />
            </>
        ) : <Login onLogin={handleLoginSuccess} onBack={() => navigate('/')} />} />

        <Route path="/profile" element={<UserProfile user={user} onLogout={handleLogout} onBack={() => navigate('/home')} />} />
        <Route path="/activity" element={<div className="h-screen bg-[#050505] flex flex-col"><ActivityHistory user={user} onBack={() => navigate('/home')}/><BottomNav activeTab="activity" onHomeClick={() => navigate('/home')} onProfileClick={() => navigate('/profile')} onActivityClick={() => navigate('/activity')} onSOSClick={() => setShowSOS(true)} /></div>} />
        <Route path="/volunteer" element={<VolunteerDashboard user={user} globalToast={showToast} />} />
        <Route path="/admin" element={<AdminPanel onLogout={handleLogout} />} />
      </Routes>
    </div>
  );
}
export default App;