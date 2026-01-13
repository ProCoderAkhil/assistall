import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, Shield, X, AlertTriangle } from 'lucide-react';

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

const DEPLOYED_API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://assistall-server.onrender.com';

// --- ERROR BOUNDARY ---
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("Uncaught error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center font-sans">
          <div className="p-6 bg-red-900/20 rounded-full mb-6">
            <AlertTriangle size={48} className="text-red-500"/>
          </div>
          <h1 className="text-2xl font-black mb-2">System Malfunction</h1>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto">Critical error in core matrix.</p>
          <button 
            onClick={() => { localStorage.clear(); window.location.href = '/'; }} 
            className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition"
          >
            Hard Reset
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [user, setUser] = useState(() => {
      try {
          const savedUser = localStorage.getItem('user');
          const savedToken = localStorage.getItem('token');
          if (savedUser && savedUser !== "undefined" && savedToken) {
              return JSON.parse(savedUser);
          }
          return null;
      } catch (e) { 
          localStorage.clear(); 
          return null; 
      }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState('selecting'); 
  const [activeRequestId, setActiveRequestId] = useState(() => localStorage.getItem('activeRideId'));
  const [acceptedRequestData, setAcceptedRequestData] = useState(null);
  const [showSOS, setShowSOS] = useState(false);
  const [toast, setToast] = useState(null); 
  const navigate = useNavigate();
  const location = useLocation();

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  // Loading Timer
  useEffect(() => { 
      const timer = setTimeout(() => setIsLoading(false), 2500); 
      return () => clearTimeout(timer);
  }, []);

  // Auto Redirect
  useEffect(() => {
      if (!isLoading && user && (location.pathname === '/login' || location.pathname === '/' || location.pathname === '/register')) {
          if (user.role === 'admin') navigate('/admin');
          else if (user.role === 'volunteer') navigate('/volunteer');
          else navigate('/home');
      }
  }, [user, isLoading, location.pathname, navigate]);

  // Polling
  useEffect(() => {
    if (!activeRequestId || !user) return;
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
  }, [activeRequestId, step, user]);

  const handleLoginSuccess = (userData, token) => {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      setUser(userData);
      
      if(userData.role === 'volunteer') navigate('/volunteer');
      else if(userData.role === 'admin') navigate('/admin');
      else navigate('/home');
  };

  // ⚠️ CRITICAL FIX: HARD RELOAD
  const handleLogout = () => { 
      localStorage.clear(); 
      window.location.href = "/"; 
  };

  const handleFindVolunteer = async (bookingDetails) => { 
    setStep('searching'); 
    try {
      const res = await fetch(`${DEPLOYED_API_URL}/api/requests`, {
        method: 'POST', headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            requesterName: user.name, requesterId: user._id, type: bookingDetails.type, 
            dropOffLocation: bookingDetails.dropOff, location: { lat: 9.5916, lng: 76.5222 },
            isScheduled: bookingDetails.isScheduled,
            scheduledTime: bookingDetails.scheduledTime
        }),
      });
      const data = await res.json();
      localStorage.setItem('activeRideId', data._id);
      setActiveRequestId(data._id);
  } catch (err) { showToast("Network Error", "error"); setStep('selecting'); }
  };

  return (
    <ErrorBoundary>
      {isLoading ? (
        <AppLoader />
      ) : (
        <div className="h-screen w-full bg-[#050505] font-sans text-white relative overflow-hidden">
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[5000] w-full max-w-sm px-4 pointer-events-none">
              {toast && <div className="pointer-events-auto"><Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} /></div>}
          </div>

          <Routes>
            <Route path="/" element={<LandingPage onGetStarted={() => navigate('/login')} onVolunteerJoin={() => navigate('/volunteer-register')} />} />
            <Route path="/login" element={<Login onLogin={handleLoginSuccess} onBack={() => navigate('/')} onSignupClick={() => navigate('/register')} onVolunteerClick={() => navigate('/volunteer-register')} />} />
            <Route path="/register" element={<UserSignup onRegister={(u, t) => handleLoginSuccess(u, t)} onBack={() => navigate('/')} />} />
            <Route path="/volunteer-register" element={<VolunteerSignup onRegister={(u, t) => handleLoginSuccess(u, t)} onBack={() => navigate('/')} />} />

            {/* USER ROUTES */}
            <Route path="/home" element={user && user.role === 'user' ? (
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
                    {step === 'searching' && <FindingVolunteer requestId={activeRequestId} onCancel={() => { localStorage.removeItem('activeRideId'); setActiveRequestId(null); setStep('selecting'); }} />}
                    {step === 'found' && <VolunteerFound requestData={acceptedRequestData} onReset={() => setStep('selecting')} />}
                    {step === 'in_progress' && <RideInProgress requestData={acceptedRequestData} />}
                    {step === 'rating' && <RateAndTip requestData={acceptedRequestData} onSkip={() => { setStep('selecting'); setActiveRequestId(null); localStorage.removeItem('activeRideId'); }} onSubmit={() => { setStep('selecting'); setActiveRequestId(null); localStorage.removeItem('activeRideId'); }} showToast={showToast} />}
                    
                    <BottomNav activeTab="home" onHomeClick={() => navigate('/home')} onProfileClick={() => navigate('/profile')} onActivityClick={() => navigate('/activity')} onSOSClick={() => setShowSOS(true)} />
                    <SOSModal isOpen={showSOS} onClose={() => setShowSOS(false)} onConfirm={() => { setShowSOS(false); showToast("SOS Alert Sent!", "error"); }} />
                </>
            ) : <Login onLogin={handleLoginSuccess} onBack={() => navigate('/')} />} />

            <Route path="/profile" element={user ? <UserProfile user={user} onLogout={handleLogout} onBack={() => navigate('/home')} /> : <Login onLogin={handleLoginSuccess} onBack={() => navigate('/')} />} />
            <Route path="/activity" element={user ? <div className="h-screen bg-[#050505] flex flex-col"><ActivityHistory user={user} onBack={() => navigate('/home')}/><BottomNav activeTab="activity" onHomeClick={() => navigate('/home')} onProfileClick={() => navigate('/profile')} onActivityClick={() => navigate('/activity')} onSOSClick={() => setShowSOS(true)} /></div> : <Login onLogin={handleLoginSuccess} onBack={() => navigate('/')} />} />
            <Route path="/volunteer" element={user && user.role === 'volunteer' ? <VolunteerDashboard user={user} globalToast={showToast} /> : <Login onLogin={handleLoginSuccess} onBack={() => navigate('/')} />} />
            <Route path="/admin" element={user && user.role === 'admin' ? <AdminPanel onLogout={handleLogout} /> : <Login onLogin={handleLoginSuccess} onBack={() => navigate('/')} />} />
          </Routes>
        </div>
      )}
    </ErrorBoundary>
  );
}
export default App;