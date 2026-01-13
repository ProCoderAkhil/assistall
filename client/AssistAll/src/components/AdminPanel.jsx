import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Car, Settings, LogOut, 
  CreditCard, Shield, Activity, Search, Bell, Menu, 
  RefreshCw, CheckCircle, XCircle, AlertTriangle, MoreVertical, 
  Filter, Key, Power, Star, Phone, Video
} from 'lucide-react';

const AdminPanel = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ volunteers: 0, users: 0, rides: 0, earnings: 0, recent: [] });
  const [volunteers, setVolunteers] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]); // NEW
  const [allRides, setAllRides] = useState([]);
  const [generatedCode, setGeneratedCode] = useState("------"); 
  const [notifications, setNotifications] = useState([]); 

  const DEPLOYED_API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000' 
      : 'https://assistall-server.onrender.com';

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
  };

  const fetchData = async () => {
    try {
        const resStats = await fetch(`${DEPLOYED_API_URL}/api/admin/stats`);
        if(resStats.ok) setStats(await resStats.json());

        // Fetch Volunteers
        const resVol = await fetch(`${DEPLOYED_API_URL}/api/admin/volunteers`);
        if(resVol.ok) {
            const data = await resVol.json();
            setVolunteers(data);
            setPendingVerifications(data.filter(v => !v.isVerified)); // Filter pending
        }

        // Fetch Code
        const resCode = await fetch(`${DEPLOYED_API_URL}/api/admin/code`);
        if(resCode.ok) {
            const data = await resCode.json();
            if(data.code) setGeneratedCode(data.code);
        }
    } catch (error) {}
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const generateCode = async () => {
    try {
        const res = await fetch(`${DEPLOYED_API_URL}/api/admin/generate-code`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (res.ok) {
            setGeneratedCode(data.code);
            addNotification(`New Code: ${data.code}`, "success");
        }
    } catch(e) { addNotification("Error generating code", "error"); }
  };

  const approveVolunteer = async (id) => {
      // In a real app, this might just mark them as 'Interviewed'. 
      // The final registration happens when THEY enter the code.
      // But for admin control, let's mark them verified manually if needed.
      try {
          await fetch(`${DEPLOYED_API_URL}/api/admin/verify/${id}`, { method: 'PUT' });
          addNotification("Volunteer Verified!", "success");
          fetchData();
      } catch(e) { addNotification("Failed", "error"); }
  };

  // --- VIEWS ---

  const DashboardView = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in">
          {/* Stats Cards (Same as before) */}
          <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800"><h3 className="text-neutral-500 text-xs font-bold uppercase">Total Users</h3><p className="text-3xl font-black text-white">{stats.users}</p></div>
          <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800"><h3 className="text-neutral-500 text-xs font-bold uppercase">Pending Verifications</h3><p className="text-3xl font-black text-yellow-500">{pendingVerifications.length}</p></div>
          <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800"><h3 className="text-neutral-500 text-xs font-bold uppercase">Active OTP</h3><p className="text-3xl font-black text-green-500 tracking-widest font-mono">{generatedCode}</p></div>
      </div>
  );

  const VerificationView = () => (
    <div className="space-y-6 animate-in slide-in-from-right">
        {/* OTP Generator Panel */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-8 rounded-3xl border border-blue-500/30 flex justify-between items-center">
            <div>
                <h3 className="text-2xl font-bold text-white mb-2">Live Interview Session</h3>
                <p className="text-neutral-400 text-sm">Generate a code to share with the volunteer during the call.</p>
            </div>
            <div className="text-right">
                <div className="text-5xl font-mono font-black text-white tracking-widest mb-4 bg-black/50 px-6 py-2 rounded-xl border border-white/10">{generatedCode}</div>
                <button onClick={generateCode} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-500 transition flex items-center gap-2 ml-auto">
                    <RefreshCw size={18}/> Generate New OTP
                </button>
            </div>
        </div>

        {/* Pending List */}
        <div className="bg-neutral-900 rounded-3xl border border-neutral-800 overflow-hidden">
            <div className="p-6 border-b border-neutral-800 flex justify-between">
                <h3 className="font-bold text-white">Pending Verification Queue</h3>
                <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold">{pendingVerifications.length} Waiting</span>
            </div>
            <table className="w-full text-left">
                <thead className="bg-black text-neutral-500 text-xs uppercase font-bold"><tr><th className="p-4">Name</th><th className="p-4">Docs</th><th className="p-4">Status</th><th className="p-4 text-right">Action</th></tr></thead>
                <tbody className="divide-y divide-neutral-800 text-sm text-neutral-300">
                    {pendingVerifications.map(v => (
                        <tr key={v._id} className="hover:bg-white/5">
                            <td className="p-4 font-bold text-white">{v.name}<br/><span className="text-neutral-500 font-normal">{v.email}</span></td>
                            <td className="p-4"><span className="flex items-center gap-1 text-green-400"><CheckCircle size={14}/> Uploaded</span></td>
                            <td className="p-4"><span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-xs border border-yellow-500/20">Interview Pending</span></td>
                            <td className="p-4 text-right flex justify-end gap-2">
                                <button className="p-2 bg-blue-600/20 text-blue-500 rounded-lg hover:bg-blue-600/30" title="Start Video Call"><Video size={18}/></button>
                                <button onClick={() => approveVolunteer(v._id)} className="p-2 bg-green-600/20 text-green-500 rounded-lg hover:bg-green-600/30" title="Manual Approve"><CheckCircle size={18}/></button>
                            </td>
                        </tr>
                    ))}
                    {pendingVerifications.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-neutral-500">Queue is empty.</td></tr>}
                </tbody>
            </table>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black font-sans flex text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-neutral-900 border-r border-neutral-800 p-6 flex flex-col">
        <div className="flex items-center mb-10 text-white font-black text-xl"><Shield className="mr-2 text-blue-500"/> Admin Panel</div>
        <nav className="space-y-2 flex-1">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center p-3 rounded-xl font-bold transition ${activeTab==='dashboard'?'bg-blue-600 text-white':'text-neutral-400 hover:bg-white/5'}`}><LayoutDashboard size={20} className="mr-3"/> Dashboard</button>
            <button onClick={() => setActiveTab('verification')} className={`w-full flex items-center p-3 rounded-xl font-bold transition ${activeTab==='verification'?'bg-blue-600 text-white':'text-neutral-400 hover:bg-white/5'}`}><Users size={20} className="mr-3"/> Verification</button>
        </nav>
        <button onClick={onLogout} className="text-red-500 font-bold flex items-center p-3 hover:bg-red-900/20 rounded-xl"><LogOut size={20} className="mr-3"/> Sign Out</button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
          <header className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-black text-white capitalize">{activeTab}</h1>
              <div className="flex items-center gap-4"><Bell className="text-neutral-400"/><div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full"></div></div>
          </header>
          
          {/* Notifications */}
          <div className="fixed top-5 right-5 z-50 space-y-2">
              {notifications.map(n => (
                  <div key={n.id} className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2 ${n.type==='error'?'bg-red-900 border-red-500':'bg-neutral-800 border-neutral-700'}`}>{n.message}</div>
              ))}
          </div>

          {activeTab === 'dashboard' && <DashboardView/>}
          {activeTab === 'verification' && <VerificationView/>}
      </div>
    </div>
  );
};

export default AdminPanel;