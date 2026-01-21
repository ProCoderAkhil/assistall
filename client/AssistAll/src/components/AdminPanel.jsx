import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, Users, Search, Bell, AlertTriangle, MapPin, Menu, Phone, 
  ChevronRight, CheckCircle, Map as MapIcon, FileText,
  Siren, PhoneCall, Radio, Trash2, Power, Video, Key, RefreshCw
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const DEPLOYED_API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://assistall-server.onrender.com';

const AdminPanel = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('verification'); 
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Data States
  const [activeRides, setActiveRides] = useState([]);
  const [volunteers, setVolunteers] = useState([]); // Stores ALL volunteers
  const [allUsers, setAllUsers] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [selectedVol, setSelectedVol] = useState(null);
  
  // Interview Logic
  const [generatedCode, setGeneratedCode] = useState(null);
  
  const [stats, setStats] = useState({ total: 0, pending: 0, active: 0, incidents: 0 });

  // Map Icons
  const icons = useMemo(() => ({
      user: new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', iconSize: [25, 41], iconAnchor: [12, 41] }),
      volunteer: new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', iconSize: [25, 41], iconAnchor: [12, 41] }),
      sos: new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', iconSize: [30, 45], iconAnchor: [15, 45], className: 'animate-bounce' }),
  }), []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); 
    return () => clearInterval(interval);
  }, []); 

  const fetchData = async () => {
    try {
        // 1. Fetch ALL Volunteers (Fixes "No Request" bug)
        const resVols = await fetch(`${DEPLOYED_API_URL}/api/admin/volunteers`); // Ensure this endpoint exists or use all-users filter
        if (resVols.ok) {
            setVolunteers(await resVols.json());
        } else {
            // Fallback: Filter from all users if specific endpoint fails
            const resAll = await fetch(`${DEPLOYED_API_URL}/api/admin/all-users`);
            if (resAll.ok) {
                const users = await resAll.json();
                setVolunteers(users.filter(u => u.role === 'volunteer'));
                setAllUsers(users);
            }
        }

        // 2. Active Requests
        const resReqs = await fetch(`${DEPLOYED_API_URL}/api/requests`);
        if (resReqs.ok) {
            const data = await resReqs.json();
            setActiveRides(data.filter(r => r.status === 'in_progress' || r.status === 'accepted'));
            setSosAlerts(data.filter(r => r.isSOS || r.status === 'sos'));
            
            // Update stats
            setStats({
                total: allUsers.length,
                pending: volunteers.filter(v => v.status !== 'approved').length,
                active: data.filter(r => r.status === 'in_progress').length,
                incidents: data.filter(r => r.isSOS).length
            });
        }
    } catch (e) { console.error("Sync Error", e); }
  };

  const handleStatusUpdate = async (id, status) => {
      if(!window.confirm(`Set user status to ${status}?`)) return;
      try {
          await fetch(`${DEPLOYED_API_URL}/api/admin/verify/${id}`, {
              method: 'PUT', headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status })
          });
          alert("Status Updated!");
          fetchData(); 
          setSelectedVol(null); 
          setGeneratedCode(null);
      } catch (e) { alert("Update Failed"); }
  };

  const generateOTP = () => {
      const code = Math.floor(100000 + Math.random() * 900000);
      setGeneratedCode(code);
      // In a real app, you would send this code to the backend to save it against the user
      // For now, we simulate the Admin giving this code verbally
  };

  // --- COMPONENT: LIVE MAP ---
  const LiveMap = () => (
      <div className="h-full w-full rounded-3xl overflow-hidden border border-white/10 relative">
          <MapContainer center={[9.5916, 76.5222]} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={false}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              {activeRides.map(ride => (
                  <Marker key={ride._id} position={[9.5916, 76.5222]} icon={icons.user}>
                      <Popup>User: {ride.requesterName}</Popup>
                  </Marker>
              ))}
              {sosAlerts.map(alert => (
                  <Marker key={alert._id} position={[9.5916, 76.5222]} icon={icons.sos}>
                      <Popup><div className="text-red-600 font-bold">SOS ALERT!</div></Popup>
                  </Marker>
              ))}
          </MapContainer>
      </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans flex overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#0a0a0a] border-r border-white/10 flex flex-col transition-all duration-300 z-20`}>
            <div className="p-6 flex items-center justify-between">
                {sidebarOpen && <div className="font-black text-lg tracking-tight">Admin<span className="text-green-500">.</span></div>}
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400"><Menu size={20}/></button>
            </div>
            <nav className="flex-1 px-4 space-y-2 mt-4">
                <button onClick={() => setActiveTab('map')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'map' ? 'bg-blue-900/20 text-blue-400' : 'text-gray-400 hover:bg-white/5'}`}><MapIcon size={20}/> {sidebarOpen && <span className="font-bold text-sm">Live Map</span>}</button>
                <button onClick={() => setActiveTab('verification')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'verification' ? 'bg-green-900/20 text-green-400' : 'text-gray-400 hover:bg-white/5'}`}><CheckCircle size={20}/> {sidebarOpen && <span className="font-bold text-sm">Volunteers</span>}</button>
                <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'users' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}><Users size={20}/> {sidebarOpen && <span className="font-bold text-sm">All Users</span>}</button>
                <button onClick={() => setActiveTab('incidents')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'incidents' ? 'bg-red-900/20 text-red-400' : 'text-gray-400 hover:bg-white/5'}`}><Siren size={20}/> {sidebarOpen && <span className="font-bold text-sm">Incidents</span>}</button>
            </nav>
            <div className="p-4 border-t border-white/10"><button onClick={onLogout} className="flex items-center gap-3 w-full p-3 rounded-xl text-red-500 hover:bg-red-900/10 transition"><LogOut size={20}/> {sidebarOpen && <span className="font-bold text-sm">Logout</span>}</button></div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 h-screen overflow-hidden bg-[#050505] p-6 flex flex-col">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-black text-white">{activeTab === 'verification' ? 'Volunteer Management' : activeTab === 'map' ? 'Live Operations' : 'Dashboard'}</h1>
                <div className="flex gap-4">
                    <div className="bg-[#121212] px-4 py-2 rounded-full border border-white/10 text-xs font-bold flex items-center gap-2"><span className="w-2 h-2 bg-yellow-500 rounded-full"></span> {stats.pending} Pending</div>
                    <div className="bg-[#121212] px-4 py-2 rounded-full border border-white/10 text-xs font-bold flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span> {stats.active} Active</div>
                </div>
            </header>

            {/* --- 1. VOLUNTEER MANAGEMENT TAB (FIXED) --- */}
            {activeTab === 'verification' && (
                <div className="flex gap-8 h-full animate-in fade-in">
                    
                    {/* List Column */}
                    <div className="w-1/3 bg-[#121212] rounded-3xl border border-white/5 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-white/5 bg-[#161616] flex justify-between items-center">
                            <h2 className="text-lg font-bold">Volunteer List</h2>
                            <button onClick={fetchData} className="p-2 bg-white/5 rounded-full hover:bg-white/10"><RefreshCw size={14}/></button>
                        </div>
                        <div className="overflow-y-auto flex-1 p-4 space-y-2">
                            {/* Filter to show non-approved first */}
                            {volunteers.sort((a,b) => (a.status === 'approved' ? 1 : -1)).map(v => (
                                <div key={v._id} onClick={() => { setSelectedVol(v); setGeneratedCode(null); }} className={`p-4 rounded-xl border cursor-pointer flex justify-between items-center ${selectedVol?._id === v._id ? 'bg-blue-900/20 border-blue-500' : 'bg-[#1a1a1a] border-white/5 text-gray-400'}`}>
                                    <div>
                                        <h4 className="font-bold text-sm text-white">{v.name}</h4>
                                        <div className="flex gap-2 mt-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${v.status === 'approved' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>{v.status || 'Pending'}</span>
                                            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded">{v.email}</span>
                                        </div>
                                    </div>
                                    <ChevronRight size={16}/>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detail Column */}
                    <div className="flex-1 bg-[#121212] rounded-3xl border border-white/5 p-8 relative flex flex-col">
                        {selectedVol ? (
                            <>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h1 className="text-3xl font-black">{selectedVol.name}</h1>
                                        <p className="text-gray-500 text-sm mt-1">{selectedVol.email} • {selectedVol.phone}</p>
                                    </div>
                                    {selectedVol.status !== 'approved' && <div className="bg-yellow-500/20 text-yellow-500 px-4 py-2 rounded-full font-bold text-xs animate-pulse">Action Required</div>}
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-8 flex-1 overflow-y-auto">
                                    {/* Documents */}
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Documents</p>
                                        <div className="bg-[#050505] p-4 rounded-xl border border-white/10">
                                            <div className="flex justify-between mb-2"><span className="text-gray-400 text-xs">Govt ID</span><CheckCircle size={14} className="text-green-500"/></div>
                                            <div className="flex justify-between"><span className="text-gray-400 text-xs">Vehicle Papers</span><CheckCircle size={14} className="text-green-500"/></div>
                                        </div>
                                    </div>
                                    
                                    {/* Selfie */}
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-green-500 uppercase tracking-widest">Identity Check</p>
                                        <div className="w-full h-40 bg-black rounded-xl border border-white/10 overflow-hidden relative">
                                            {selectedVol.selfieImage ? (
                                                <img src={selectedVol.selfieImage} className="w-full h-full object-cover" alt="Selfie"/>
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-xs">No Selfie Uploaded</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* --- OTP GENERATION PANEL --- */}
                                {selectedVol.status !== 'approved' && (
                                    <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/10 mb-6 flex flex-col items-center text-center">
                                        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Video size={16}/> Interview Panel</h3>
                                        <p className="text-gray-500 text-xs mb-4">1. Start Google Meet. 2. Verify Face. 3. Read OTP to volunteer.</p>
                                        
                                        {!generatedCode ? (
                                            <button onClick={generateOTP} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition">
                                                <Key size={18}/> Generate OTP Code
                                            </button>
                                        ) : (
                                            <div className="animate-in zoom-in">
                                                <p className="text-xs text-blue-400 font-bold mb-1 uppercase tracking-widest">Read this code to volunteer</p>
                                                <div className="text-5xl font-mono font-black text-white tracking-[0.2em] mb-2">{generatedCode}</div>
                                                <p className="text-xs text-gray-600">Waiting for user input...</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="grid grid-cols-2 gap-4 mt-auto">
                                    <button onClick={() => handleStatusUpdate(selectedVol._id, 'rejected')} className="py-4 rounded-xl border border-red-900/50 text-red-500 font-bold hover:bg-red-900/10">Reject Application</button>
                                    <button onClick={() => handleStatusUpdate(selectedVol._id, 'approved')} className="py-4 rounded-xl font-bold bg-green-600 text-black hover:bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                                        <span className="flex items-center justify-center gap-2"><Power size={18}/> Force Activate</span>
                                    </button>
                                </div>
                            </>
                        ) : <div className="h-full flex flex-col items-center justify-center text-gray-600"><Users size={48} className="mb-4 opacity-20"/><p>Select a volunteer from the queue.</p></div>}
                    </div>
                </div>
            )}

            {/* --- 2. LIVE MAP --- */}
            {activeTab === 'map' && <div className="flex-1 bg-[#121212] rounded-3xl border border-white/5 relative"><LiveMap/></div>}

            {/* --- 3. ALL USERS DATABASE --- */}
            {activeTab === 'users' && (
                <div className="bg-[#121212] rounded-3xl border border-white/5 overflow-hidden animate-in fade-in flex-1">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <h2 className="text-xl font-bold">Master Database</h2>
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-full px-4 py-2 flex items-center gap-2"><Search size={14} className="text-gray-500"/><input type="text" placeholder="Search users..." className="bg-transparent outline-none text-sm text-white w-48"/></div>
                    </div>
                    <div className="overflow-y-auto h-full p-4">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-[#1a1a1a] text-gray-200 uppercase text-xs"><tr><th className="p-4">Name</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead>
                            <tbody>
                                {allUsers.map((u, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="p-4 text-white font-bold">{u.name}<br/><span className="text-[10px] text-gray-500 font-normal">{u.email}</span></td>
                                        <td className="p-4 uppercase text-xs font-bold">{u.role}</td>
                                        <td className="p-4">{u.status === 'approved' ? <span className="text-green-500 flex items-center gap-1"><CheckCircle size={12}/> Active</span> : <span className="text-yellow-500">Pending</span>}</td>
                                        <td className="p-4">
                                            {u.role === 'volunteer' && u.status !== 'approved' && (
                                                <button onClick={() => handleStatusUpdate(u._id, 'approved')} className="text-blue-400 hover:text-white font-bold text-xs border border-blue-500/30 px-3 py-1 rounded-lg">Approve</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </main>
    </div>
  );
};

export default AdminPanel;