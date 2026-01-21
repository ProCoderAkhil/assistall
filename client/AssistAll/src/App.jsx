import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom'; 
import { Bell, Shield, Menu } from 'lucide-react';

// Context
import { ToastProvider, useToast } from './components/ToastContext'; // ✅ Import Context

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
import LandingPage from './components/LandingPage'; 
import AppLoader from './components/AppLoader'; 
import SOSModal from './components/SOSModal'; 

const DEPLOYED_API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://assistall-server.onrender.com';

// --- GUARDS ---
const GuestGuard = ({ user, children }) => {
  if (user) {
    if (user.role === 'volunteer') return <Navigate to="/volunteer" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/home" replace />;
  }
  return children;
};

const AuthGuard = ({ user, allowedRole, children }) => {
  if (!user) return <Navigate to="/" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" replace />;
  return children;
};

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center font-sans">
          <h1 className="text-2xl font-black mb-2">System Malfunction</h1>
          <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="bg-white text-black px-8 py-3 rounded-full font-bold mt-6">Hard Reset</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ✅ Main App Content (Must be child of ToastProvider)
const AppContent = () => {
  const { addToast } = useToast(); // ✅ Use Global Toast
  
  const [user, setUser] = useState(() => {
      try { return JSON.parse(localStorage.getItem('user')); } catch (e) { return null; }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState('selecting'); 
  const [activeRequestId, setActiveRequestId] = useState(() => localStorage.getItem('activeRideId'));
  const [acceptedRequestData, setAcceptedRequestData] = useState(null);
  const [showSOS, setShowSOS] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const isFirstLoad = useRef(true); 

  // --- SAFE REDIRECT ---
  useEffect(() => {
    if (isFirstLoad.current) {
        isFirstLoad.current = false;
        if (!user && location.pathname !== '/login' && location.pathname !== '/') {
            window.history.replaceState(null, '', '/');
            navigate('/', { replace: true });
        }
    }
    setTimeout(() => setIsLoading(false), 2000);
  }, []); 

  // --- POLLING ---
  useEffect(() => {
    if (!activeRequestId || !user) return;
    const interval = setInterval(async () => {
        try {
          const res = await fetch(`${DEPLOYED_API_URL}/api/requests`);
          if(res.ok) {
              const data = await res.json();
              if (Array.isArray(data)) {
                  const myRequest = data.find(r => r._id === activeRequestId);
                  if (myRequest) {
                     if (myRequest.status === 'accepted' && step !== 'found') {
                        setAcceptedRequestData(myRequest); 
                        setStep('found'); 
                        addToast(`Volunteer Found!`, 'success'); // ✅ Notification
                     } else if (myRequest.status === 'in_progress' && step !== 'in_progress') {
                        setStep('in_progress'); 
                        addToast("Ride Started", 'info'); // ✅ Notification
                     } else if (myRequest.status === 'completed' && step !== 'rating') {
                        setStep('rating'); 
                        addToast("Ride Completed", 'success'); // ✅ Notification
                     }
                  }
              }
          }
        } catch (err) {}
    }, 2000);
    return () => clearInterval(interval);
  }, [activeRequestId, step, user, addToast]);

  const handleLoginSuccess = (userData, token) => {
      localStorage.setItem('user', JSON.stringify(userData));
      if(token) localStorage.setItem('token', token);
      setUser(userData);
      addToast(`Welcome back, ${userData.name}!`, 'success');
  };

  const handleLogout = () => { 
      localStorage.clear(); 
      setUser(null); 
      navigate('/', { replace: true }); 
      addToast("Logged out successfully", "info");
  };

  const handleFindVolunteer = async (bookingDetails) => { 
    setStep('searching'); 
    try {
      const res = await fetch(`${DEPLOYED_API_URL}/api/requests`, {
        method: 'POST', headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            requesterName: user.name, requesterId: user._id, 
            type: bookingDetails.type, 
            price: 150, 
            drop: bookingDetails.dropOff, 
            pickup: "Current Location",
            location: { lat: 9.5916, lng: 76.5222 },
            isScheduled: bookingDetails.isScheduled,
            scheduledTime: bookingDetails.scheduledTime
        }),
      });
      const data = await res.json();
      localStorage.setItem('activeRideId', data._id);
      setActiveRequestId(data._id);
      addToast("Searching for nearby volunteers...", "info");
  } catch (err) { 
      addToast("Network Error: Could not request ride", "error"); 
      setStep('selecting'); 
  }
  };

  if (isLoading) return <AppLoader />;

  return (
    <div className="h-screen w-full bg-[#050505] font-sans text-white relative overflow-hidden">
      
      <Routes>
        <Route path="/" element={<GuestGuard user={user}><LandingPage onLogin={() => navigate('/login')} onSignup={() => navigate('/register')} onVolunteer={() => navigate('/volunteer-register')} /></GuestGuard>} />
        <Route path="/login" element={<GuestGuard user={user}><Login onLogin={handleLoginSuccess} onBack={() => navigate('/')} onSignupClick={() => navigate('/register')} onVolunteerClick={() => navigate('/volunteer-register')} /></GuestGuard>} />
        <Route path="/register" element={<GuestGuard user={user}><UserSignup onRegister={handleLoginSuccess} onBack={() => navigate('/')} /></GuestGuard>} />
        <Route path="/volunteer-register" element={<GuestGuard user={user}><VolunteerSignup onRegister={handleLoginSuccess} onBack={() => navigate('/')} /></GuestGuard>} />

        <Route path="/home" element={
            <AuthGuard user={user} allowedRole="user">
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
                    
                    {/* ✅ RateAndTip now uses global toast, no prop needed */}
                    {step === 'rating' && <RateAndTip requestData={acceptedRequestData} onSkip={() => { setStep('selecting'); setActiveRequestId(null); localStorage.removeItem('activeRideId'); }} onSubmit={() => { setStep('selecting'); setActiveRequestId(null); localStorage.removeItem('activeRideId'); }} />}
                    
                    <BottomNav activeTab="home" onHomeClick={() => navigate('/home')} onProfileClick={() => navigate('/profile')} onActivityClick={() => navigate('/activity')} onSOSClick={() => setShowSOS(true)} />
                    
                    <SOSModal isOpen={showSOS} onClose={() => setShowSOS(false)} onConfirm={() => { setShowSOS(false); addToast("SOS Alert Sent to Authorities!", "error"); }} />
                </>
            </AuthGuard>
        } />

        <Route path="/profile" element={<AuthGuard user={user}><UserProfile user={user} onLogout={handleLogout} onBack={() => navigate('/home')} /></AuthGuard>} />
        <Route path="/activity" element={<AuthGuard user={user}><div className="h-screen bg-[#050505] flex flex-col"><ActivityHistory user={user} onBack={() => navigate('/home')}/><BottomNav activeTab="activity" onHomeClick={() => navigate('/home')} onProfileClick={() => navigate('/profile')} onActivityClick={() => navigate('/activity')} onSOSClick={() => setShowSOS(true)} /></div></AuthGuard>} />
        
        {/* ✅ VolunteerDashboard uses global toast internally */}
        <Route path="/volunteer" element={<AuthGuard user={user} allowedRole="volunteer"><VolunteerDashboard user={user} /></AuthGuard>} />
        <Route path="/admin" element={<AuthGuard user={user} allowedRole="admin"><AdminPanel onLogout={handleLogout} /></AuthGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

// ✅ App Wrapper
function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ErrorBoundary>
  );
}
export default App;