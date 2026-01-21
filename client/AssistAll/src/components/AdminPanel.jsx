import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, Check, X, LogOut, Users, Search, LayoutDashboard, 
  Bell, Activity, Lock, AlertTriangle, MapPin, Menu, Phone, 
  ChevronRight, CheckCircle, Clock, Map as MapIcon, FileText,
  Siren, PhoneCall, Radio, Trash2, Power
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const DEPLOYED_API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://assistall-server.onrender.com';

const AdminPanel = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('map'); 
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // --- DATA STATES ---
  const [activeRides, setActiveRides] = useState([]);
  const [pendingVolunteers, setPendingVolunteers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [reports, setReports] = useState([]); 
  const [selectedVol, setSelectedVol] = useState(null);
  
  const [stats, setStats] = useState({ total: 0, pending: 0, active: 0, incidents: 0 });

  // --- MAP ICONS ---
  const icons = useMemo(() => ({
      user: new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', iconSize: [25, 41], iconAnchor: [12, 41] }),
      volunteer: new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', iconSize: [25, 41], iconAnchor: [12, 41] }),
      sos: new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', iconSize: [30, 45], iconAnchor: [15, 45], className: 'animate-bounce' }),
  }), []);

  // --- POLLING DATA ---
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); 
    return () => clearInterval(interval);
  }, []); 

  const fetchData = async () => {
    try {
        // 1. Pending Volunteers
        const resPending = await fetch(`${DEPLOYED_API_URL}/api/admin/pending-volunteers`);
        if (resPending.ok) setPendingVolunteers(await resPending.json());

        // 2. All Users (CRITICAL FOR FIXING STUCK ACCOUNTS)
        const resUsers = await fetch(`${DEPLOYED_API_URL}/api/admin/all-users`);
        if (resUsers.ok) setAllUsers(await resUsers.json());

        // 3. Active Requests & SOS
        const resReqs = await fetch(`${DEPLOYED_API_URL}/api/requests`);
        if (resReqs.ok) {
            const data = await resReqs.json();
            setActiveRides(data.filter(r => r.status === 'in_progress' || r.status === 'accepted'));
            
            const emergency = data.filter(r => r.isSOS || r.status === 'sos'); 
            setSosAlerts(emergency);
            
            // Mock Reports Logic
            const mockReports = data.filter(r => r.status === 'completed').slice(0, 3).map(r => ({
                id: r._id,
                reporter: r.requesterName,
                issue: "Safety Concern reported during ride.",
                status: "open",
                time: "10 mins ago"
            }));
            setReports(prev => prev.length > 0 ? prev : mockReports);

            setStats({
                total: allUsers.length,
                pending: pendingVolunteers.length,
                active: data.filter(r => r.status === 'in_progress').length,
                incidents: emergency.length
            });
        }
    } catch (e) { console.error("Admin Sync Error", e); }
  };

  const handleDecision = async (id, status) => {
      try {
          await fetch(`${DEPLOYED_API_URL}/api/admin/verify/${id}`, {
              method: 'PUT', headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status })
          });
          alert(`User status updated to: ${status}`);
          fetchData(); 
          setSelectedVol(null); 
      } catch (e) { alert("Action Failed"); }
  };

  const resolveIncident = (id) => {
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
      alert("Incident marked as Resolved.");
  };

  // --- COMPONENT: LIVE MAP ---
  const LiveMap = () => (
      <div className="h-full w-full rounded-3xl overflow-hidden border border-white/10 relative">
          <MapContainer center={[9.5916, 76.5222]} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={false}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              {activeRides.map(ride => (
                  <React.Fragment key={ride._id}>
                      <Marker position={[9.5916 + (Math.random() * 0.02), 76.5222 + (Math.random() * 0.02)]} icon={icons.user}>
                          <Popup><div className="text-black"><strong>User: {ride.requesterName}</strong><br/>Dest: {ride.drop}</div></Popup>
                      </Marker>
                      <Marker position={[9.5916 - (Math.random() * 0.02), 76.5222 - (Math.random() * 0.02)]} icon={icons.volunteer}>
                          <Popup><strong className="text-black">Vol: {ride.volunteerName}</strong></Popup>
                      </Marker>
                  </React.Fragment>
              ))}
              {sosAlerts.map(alert => (
                  <Marker key={alert._id} position={[9.5916, 76.5222]} icon={icons.sos}>
                      <Popup><div className="text-red-600 font-bold">SOS ALERT!<br/>{alert.requesterName}</div></Popup>
                  </Marker>
              ))}
          </MapContainer>
          <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 z-[400] text-xs space-y-2">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div><span className="text-gray-300">Active User</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div><span className="text-gray-300">Volunteer</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div><span className="text-red-400 font-bold">SOS Incident</span></div>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans flex overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#0a0a0a] border-r border-white/10 flex flex-col transition-all duration-300 z-20`}>
            <div className="p-6 flex items-center justify-between">
                {sidebarOpen && (
                    <div className="flex items-center gap-2 text-green-500 animate-in fade-in">
                        <Shield size={24} strokeWidth={2.5}/> 
                        <span className="font-black text-lg tracking-tight text-white">Admin<span className="text-green-500">.</span></span>
                    </div>
                )}
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400"><Menu size={20}/></button>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                <button onClick={() => setActiveTab('map')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'map' ? 'bg-blue-900/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:bg-white/5'}`}>
                    <MapIcon size={20}/> {sidebarOpen && <span className="font-bold text-sm">Live Map</span>}
                </button>
                <button onClick={() => setActiveTab('incidents')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'incidents' ? 'bg-red-900/20 text-red-400 border border-red-500/30' : 'text-gray-400 hover:bg-white/5'}`}>
                    <Siren size={20}/> {sidebarOpen && <span className="font-bold text-sm">Incidents & SOS</span>}
                    {sidebarOpen && stats.incidents > 0 && <span className="bg-red-600 text-white text-[10px] px-2 rounded-full">{stats.incidents}</span>}
                </button>
                <button onClick={() => setActiveTab('verification')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'verification' ? 'bg-green-900/20 text-green-400 border border-green-500/30' : 'text-gray-400 hover:bg-white/5'}`}>
                    <CheckCircle size={20}/> {sidebarOpen && <span className="font-bold text-sm">Verification</span>}
                    {sidebarOpen && stats.pending > 0 && <span className="bg-yellow-600 text-black text-[10px] px-2 rounded-full">{stats.pending}</span>}
                </button>
                <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'users' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                    <Users size={20}/> {sidebarOpen && <span className="font-bold text-sm">User Database</span>}
                </button>
            </nav>

            <div className="p-4 border-t border-white/10">
                <button onClick={onLogout} className="flex items-center gap-3 w-full p-3 rounded-xl text-red-500 hover:bg-red-900/10 transition"><LogOut size={20}/> {sidebarOpen && <span className="font-bold text-sm">Logout</span>}</button>
            </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 h-screen overflow-hidden bg-[#050505] p-6 flex flex-col">
            
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-black text-white">{activeTab === 'map' ? 'Live Operations' : activeTab === 'incidents' ? 'Incident Command' : 'Admin Panel'}</h1>
                    <p className="text-gray-500 text-xs flex items-center gap-2 mt-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Systems Operational • {stats.active} Active Rides</p>
                </div>
                {sosAlerts.length > 0 && (
                    <div className="bg-red-600 text-white px-6 py-2 rounded-full font-bold animate-pulse flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.6)]">
                        <AlertTriangle size={20}/> {sosAlerts.length} Active SOS Alert!
                    </div>
                )}
            </header>

            {/* --- LIVE MAP VIEW --- */}
            {activeTab === 'map' && <div className="flex-1 bg-[#121212] rounded-3xl border border-white/5 relative"><LiveMap/></div>}

            {/* --- INCIDENT COMMAND VIEW --- */}
            {activeTab === 'incidents' && (
                <div className="flex gap-6 h-full overflow-hidden">
                    <div className="w-1/2 flex flex-col gap-4 overflow-y-auto">
                        <h3 className="text-red-500 font-bold text-lg uppercase tracking-widest flex items-center gap-2"><Siren size={20}/> High Priority (SOS)</h3>
                        {sosAlerts.length === 0 ? <div className="p-8 bg-[#121212] rounded-2xl border border-white/5 text-center text-gray-500">No Active SOS Alerts</div> : sosAlerts.map(alert => (
                            <div key={alert._id} className="bg-red-900/10 border border-red-500 rounded-2xl p-6 relative overflow-hidden animate-pulse">
                                <div className="flex justify-between items-start relative z-10">
                                    <div><h4 className="text-2xl font-black text-white">{alert.requesterName}</h4><p className="text-red-300 font-medium mt-1 flex items-center gap-2"><MapPin size={16}/> {alert.drop}</p></div>
                                    <div className="text-right"><p className="text-xs text-red-400 font-bold uppercase">Volunteer</p><p className="text-white font-bold">{alert.volunteerName}</p></div>
                                </div>
                                <div className="flex gap-3 mt-6 relative z-10"><button className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"><Radio size={18}/> Dispatch Team</button><button className="flex-1 bg-[#222] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 border border-white/10"><PhoneCall size={18}/> Call User</button></div>
                            </div>
                        ))}
                    </div>
                    <div className="w-1/2 flex flex-col gap-4 overflow-y-auto pl-6 border-l border-white/10">
                        <h3 className="text-yellow-500 font-bold text-lg uppercase tracking-widest flex items-center gap-2"><FileText size={20}/> User Reports</h3>
                        {reports.map((report, i) => (
                            <div key={i} className={`p-5 rounded-2xl border ${report.status === 'resolved' ? 'bg-[#121212] border-green-900/30 opacity-60' : 'bg-[#1a1a1a] border-white/10'}`}>
                                <div className="flex justify-between mb-2"><span className="text-blue-400 font-bold text-sm">Ticket #{report.id.slice(-4)}</span><span className="text-gray-500 text-xs">{report.time}</span></div>
                                <p className="text-white font-medium mb-4">"{report.issue}"</p>
                                <div className="flex justify-between items-center"><div className="flex items-center gap-2 text-xs text-gray-400"><Users size={14}/> {report.reporter}</div>{report.status !== 'resolved' ? <button onClick={() => resolveIncident(report.id)} className="px-4 py-2 bg-green-600/20 text-green-400 border border-green-600/50 rounded-lg text-xs font-bold hover:bg-green-600 hover:text-white transition">Mark Resolved</button> : <span className="text-green-500 text-xs font-bold flex items-center gap-1"><CheckCircle size={14}/> Resolved</span>}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- VERIFICATION VIEW --- */}
            {activeTab === 'verification' && (
                <div className="flex gap-8 h-full animate-in fade-in">
                    <div className="w-1/3 bg-[#121212] rounded-3xl border border-white/5 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-white/5 bg-[#161616]"><h2 className="text-lg font-bold">Pending Queue</h2></div>
                        <div className="overflow-y-auto flex-1 p-4 space-y-2">
                            {pendingVolunteers.map(v => (
                                <div key={v._id} onClick={() => setSelectedVol(v)} className={`p-4 rounded-xl border cursor-pointer flex justify-between items-center ${selectedVol?._id === v._id ? 'bg-green-900/20 border-green-500' : 'bg-[#1a1a1a] border-white/5 text-gray-400'}`}>
                                    <div><h4 className="font-bold text-sm text-white">{v.name}</h4><p className="text-[10px] text-gray-500">ID: {v._id.slice(-4)}</p></div><ChevronRight size={16}/>
                                </div>
                            ))}
                            {pendingVolunteers.length === 0 && <div className="p-8 text-center text-gray-600 text-sm">No pending requests.</div>}
                        </div>
                    </div>
                    <div className="flex-1 bg-[#121212] rounded-3xl border border-white/5 p-8 relative flex flex-col">
                        {selectedVol ? (
                            <>
                                <h1 className="text-3xl font-black mb-6">{selectedVol.name}</h1>
                                <div className="grid grid-cols-2 gap-6 mb-8 flex-1 overflow-y-auto">
                                    <div className="space-y-2"><p className="text-xs font-bold text-blue-500 uppercase">Documents</p><div className="bg-[#050505] p-4 rounded-xl border border-white/10 text-center"><span className="text-xs text-gray-400 block mb-2">Govt ID: {selectedVol.govtId}</span><span className="text-xs text-green-400 font-bold">Uploaded</span></div></div>
                                    <div className="space-y-2"><p className="text-xs font-bold text-green-500 uppercase">Selfie</p><div className="w-full h-32 bg-black rounded-xl border border-white/10 overflow-hidden">{selectedVol.selfieImage && <img src={selectedVol.selfieImage} className="w-full h-full object-cover" alt="Selfie"/>}</div></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-auto">
                                    <button onClick={() => handleDecision(selectedVol._id, 'rejected')} className="py-4 rounded-xl border border-red-900/50 text-red-500 font-bold">Reject</button>
                                    <button onClick={() => handleDecision(selectedVol._id, 'approved')} className="py-4 rounded-xl font-bold bg-green-600 text-black hover:bg-green-500">Approve</button>
                                </div>
                            </>
                        ) : <div className="h-full flex flex-col items-center justify-center text-gray-600"><Users size={48} className="mb-4 opacity-20"/><p>Select to review.</p></div>}
                    </div>
                </div>
            )}

            {/* --- USERS VIEW (UPDATED FOR FORCE ACTIVATION) --- */}
            {activeTab === 'users' && (
                <div className="bg-[#121212] rounded-3xl border border-white/5 overflow-hidden animate-in fade-in flex-1">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <h2 className="text-xl font-bold">Registered Users (Database)</h2>
                        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16}/><input type="text" placeholder="Search..." className="bg-[#0a0a0a] border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:border-green-500 outline-none"/></div>
                    </div>
                    <div className="overflow-y-auto h-full">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-[#1a1a1a] text-gray-200 uppercase text-xs font-bold">
                                <tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr>
                            </thead>
                            <tbody>
                                {allUsers.map((u, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="p-4 font-bold text-white">{u.name}</td>
                                        <td className="p-4">{u.email}</td>
                                        <td className="p-4 uppercase text-xs font-bold tracking-wider">{u.role}</td>
                                        <td className="p-4">
                                            {u.status === 'active' || u.status === 'approved' ? (
                                                <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit"><CheckCircle size={10}/> Active</span>
                                            ) : (
                                                <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit"><Clock size={10}/> Pending</span>
                                            )}
                                        </td>
                                        <td className="p-4 flex gap-2">
                                            {/* FORCE ACTIVATE BUTTON */}
                                            {u.role === 'volunteer' && u.status !== 'approved' && (
                                                <button 
                                                    onClick={() => handleDecision(u._id, 'approved')} 
                                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition"
                                                >
                                                    <Power size={12}/> Activate
                                                </button>
                                            )}
                                            {/* DELETE BUTTON */}
                                            <button className="px-2 py-1 bg-red-900/20 text-red-500 hover:bg-red-900/40 rounded-lg transition">
                                                <Trash2 size={16}/>
                                            </button>
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