import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, Check, X, LogOut, Users, Search, 
  Bell, Activity, Lock, AlertTriangle, MapPin, Menu, Phone, 
  ChevronRight, CheckCircle, Clock, Map as MapIcon, FileText,
  Siren, PhoneCall, Radio, Trash2, Power, Video, Key
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const DEPLOYED_API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://assistall-server.onrender.com';

const AdminPanel = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('verification'); // ✅ Default to Verification
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Data States
  const [activeRides, setActiveRides] = useState([]);
  const [volunteers, setVolunteers] = useState([]); // Stores ALL volunteers
  const [allUsers, setAllUsers] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [selectedVol, setSelectedVol] = useState(null);
  
  // Interview Logic
  const [interviewCode, setInterviewCode] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [stats, setStats] = useState({ total: 0, pending: 0, active: 0, incidents: 0 });

  // Map Icons (Memoized)
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
        // 1. Get ALL Volunteers (Fixes the "Missing Request" issue)
        const resVols = await fetch(`${DEPLOYED_API_URL}/api/admin/volunteers`);
        if (resVols.ok) setVolunteers(await resVols.json());

        // 2. All Users
        const resUsers = await fetch(`${DEPLOYED_API_URL}/api/admin/all-users`);
        if (resUsers.ok) setAllUsers(await resUsers.json());

        // 3. Active Requests
        const resReqs = await fetch(`${DEPLOYED_API_URL}/api/requests`);
        if (resReqs.ok) {
            const data = await resReqs.json();
            setActiveRides(data.filter(r => r.status === 'in_progress' || r.status === 'accepted'));
            setSosAlerts(data.filter(r => r.isSOS || r.status === 'sos'));
            setStats({
                total: allUsers.length,
                pending: volunteers.filter(v => v.status !== 'approved').length,
                active: data.filter(r => r.status === 'in_progress').length,
                incidents: data.filter(r => r.isSOS).length
            });
        }
    } catch (e) { console.error("Sync Error", e); }
  };

  const handleDecision = async (id, status) => {
      if(!window.confirm(`Are you sure you want to set status to: ${status}?`)) return;
      try {
          await fetch(`${DEPLOYED_API_URL}/api/admin/verify/${id}`, {
              method: 'PUT', headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status })
          });
          alert(`User ${status}`);
          fetchData(); 
          setSelectedVol(null); 
          setInterviewCode(null);
      } catch (e) { alert("Action Failed"); }
  };

  // ✅ GENERATE OTP FOR INTERVIEW
  const generateInterviewCode = async (userId) => {
      setIsGenerating(true);
      try {
          const res = await fetch(`${DEPLOYED_API_URL}/api/admin/generate-code`, {
              method: 'POST', headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId })
          });
          if(res.ok) {
              const data = await res.json();
              setInterviewCode(data.code);
          } else {
              alert("Failed to generate code.");
          }
      } catch(e) { alert("Network Error"); }
      finally { setIsGenerating(false); }
  };

  // Live Map Component
  const LiveMap = () => (
      <div className="h-full w-full rounded-3xl overflow-hidden border border-white/10 relative">
          <MapContainer center={[9.5916, 76.5222]} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={false}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              {activeRides.map(ride => (
                  <Marker key={ride._id} position={[9.5916, 76.5222]} icon={icons.user}>
                      <Popup>User: {ride.requesterName}</Popup>
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
                <button onClick={() => setActiveTab('incidents')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'incidents' ? 'bg-red-900/20 text-red-400' : 'text-gray-400 hover:bg-white/5'}`}><Siren size={20}/> {sidebarOpen && <span className="font-bold text-sm">Incidents</span>}</button>
                <button onClick={() => setActiveTab('verification')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'verification' ? 'bg-green-900/20 text-green-400' : 'text-gray-400 hover:bg-white/5'}`}><CheckCircle size={20}/> {sidebarOpen && <span className="font-bold text-sm">Verification</span>}</button>
                <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'users' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}><Users size={20}/> {sidebarOpen && <span className="font-bold text-sm">User DB</span>}</button>
            </nav>
            <div className="p-4 border-t border-white/10"><button onClick={onLogout} className="flex items-center gap-3 w-full p-3 rounded-xl text-red-500 hover:bg-red-900/10 transition"><LogOut size={20}/> {sidebarOpen && <span className="font-bold text-sm">Logout</span>}</button></div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 h-screen overflow-hidden bg-[#050505] p-6 flex flex-col">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-black text-white">{activeTab === 'verification' ? 'Volunteer Management' : 'Admin Panel'}</h1>
                <div className="flex gap-4">
                    <div className="bg-[#121212] px-4 py-2 rounded-full border border-white/10 text-xs font-bold flex items-center gap-2"><span className="w-2 h-2 bg-yellow-500 rounded-full"></span> {stats.pending} Pending</div>
                    <div className="bg-[#121212] px-4 py-2 rounded-full border border-white/10 text-xs font-bold flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span> {stats.active} Active</div>
                </div>
            </header>

            {/* --- VERIFICATION VIEW (UPDATED) --- */}
            {activeTab === 'verification' && (
                <div className="flex gap-8 h-full animate-in fade-in">
                    
                    {/* List of Volunteers */}
                    <div className="w-1/3 bg-[#121212] rounded-3xl border border-white/5 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-white/5 bg-[#161616]"><h2 className="text-lg font-bold">Volunteer Queue</h2></div>
                        <div className="overflow-y-auto flex-1 p-4 space-y-2">
                            {volunteers
                                .filter(v => v.status !== 'approved') // Show only pending/rejected
                                .map(v => (
                                <div key={v._id} onClick={() => { setSelectedVol(v); setInterviewCode(null); }} className={`p-4 rounded-xl border cursor-pointer flex justify-between items-center ${selectedVol?._id === v._id ? 'bg-green-900/20 border-green-500' : 'bg-[#1a1a1a] border-white/5 text-gray-400'}`}>
                                    <div>
                                        <h4 className="font-bold text-sm text-white">{v.name}</h4>
                                        <p className="text-[10px] text-gray-500 uppercase">{v.status || 'Pending'}</p>
                                    </div>
                                    <ChevronRight size={16}/>
                                </div>
                            ))}
                            {volunteers.filter(v => v.status !== 'approved').length === 0 && <div className="p-8 text-center text-gray-600 text-sm">All volunteers approved.</div>}
                        </div>
                    </div>

                    {/* Action Panel */}
                    <div className="flex-1 bg-[#121212] rounded-3xl border border-white/5 p-8 relative flex flex-col">
                        {selectedVol ? (
                            <>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h1 className="text-3xl font-black">{selectedVol.name}</h1>
                                        <p className="text-gray-500 text-sm">{selectedVol.email}</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedVol.status==='approved' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>{selectedVol.status || 'Pending'}</div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-8 flex-1 overflow-y-auto">
                                    <div className="space-y-2"><p className="text-xs font-bold text-blue-500 uppercase">Documents</p><div className="bg-[#050505] p-4 rounded-xl border border-white/10 text-center"><span className="text-xs text-gray-400 block mb-2">Govt ID: {selectedVol.govtId}</span><span className="text-xs text-green-400 font-bold">Uploaded</span></div></div>
                                    <div className="space-y-2"><p className="text-xs font-bold text-green-500 uppercase">Selfie</p><div className="w-full h-32 bg-black rounded-xl border border-white/10 overflow-hidden">{selectedVol.selfieImage ? <img src={selectedVol.selfieImage} className="w-full h-full object-cover" alt="Selfie"/> : <div className="h-full flex items-center justify-center text-gray-600 text-xs">No Selfie</div>}</div></div>
                                </div>

                                {/* --- INTERVIEW SECTION --- */}
                                <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/10 mb-6">
                                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Video size={16}/> Live Interview</h3>
                                    
                                    {!interviewCode ? (
                                        <button onClick={() => generateInterviewCode(selectedVol._id)} disabled={isGenerating} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                                            {isGenerating ? "Generating..." : "Generate OTP Code"}
                                        </button>
                                    ) : (
                                        <div className="text-center animate-in zoom-in">
                                            <p className="text-xs text-gray-500 mb-2">Share this code with the volunteer:</p>
                                            <div className="text-4xl font-mono font-black text-blue-400 tracking-widest bg-blue-900/20 p-4 rounded-xl border border-blue-500/50 mb-4">{interviewCode}</div>
                                            <p className="text-xs text-green-500 font-bold flex items-center justify-center gap-1"><CheckCircle size={12}/> Ready for validation</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-2 gap-4 mt-auto">
                                    <button onClick={() => handleDecision(selectedVol._id, 'rejected')} className="py-4 rounded-xl border border-red-900/50 text-red-500 font-bold hover:bg-red-900/10">Reject</button>
                                    <button onClick={() => handleDecision(selectedVol._id, 'approved')} className="py-4 rounded-xl font-bold bg-green-600 text-black hover:bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]">Force Approve</button>
                                </div>
                            </>
                        ) : <div className="h-full flex flex-col items-center justify-center text-gray-600"><Users size={48} className="mb-4 opacity-20"/><p>Select a volunteer to manage.</p></div>}
                    </div>
                </div>
            )}

            {/* Other tabs (Map, Incidents, Users) remain essentially same as before */}
            {activeTab === 'map' && <div className="flex-1 bg-[#121212] rounded-3xl border border-white/5 relative"><LiveMap/></div>}
            {activeTab === 'users' && (
                <div className="bg-[#121212] rounded-3xl border border-white/5 overflow-hidden flex-1">
                    <div className="p-6 border-b border-white/5"><h2 className="text-xl font-bold">All Users</h2></div>
                    <div className="overflow-y-auto h-full p-4">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-[#1a1a1a] text-gray-200"><tr><th className="p-3">Name</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead>
                            <tbody>
                                {allUsers.map((u, i) => (
                                    <tr key={i} className="border-b border-white/5">
                                        <td className="p-3">{u.name}</td>
                                        <td className="p-3 uppercase text-xs font-bold">{u.role}</td>
                                        <td className="p-3">{u.status === 'approved' ? <span className="text-green-500">Active</span> : <span className="text-yellow-500">Pending</span>}</td>
                                        <td className="p-3">
                                            {u.role === 'volunteer' && u.status !== 'approved' && (
                                                <button onClick={() => handleDecision(u._id, 'approved')} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">Activate</button>
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