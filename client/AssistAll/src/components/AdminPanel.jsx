import React, { useState, useEffect } from 'react';
import { 
  Shield, Check, X, LogOut, Users, FileText, Search, LayoutDashboard, 
  Bell, Activity, Lock, Eye, AlertTriangle, MapPin, Menu, Phone, Calendar
} from 'lucide-react';

const DEPLOYED_API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://assistall-server.onrender.com';

const AdminPanel = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Data States
  const [pendingVolunteers, setPendingVolunteers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [selectedVol, setSelectedVol] = useState(null);
  
  // Stats
  const [stats, setStats] = useState({ total: 0, pending: 0, active: 0 });

  // Initial Fetch
  useEffect(() => {
    fetchData();
  }, [activeTab]); // Refresh when tab changes

  const fetchData = async () => {
    try {
        // Fetch Pending
        const resPending = await fetch(`${DEPLOYED_API_URL}/api/admin/pending-volunteers`);
        if (resPending.ok) {
            const data = await resPending.json();
            setPendingVolunteers(data);
            setStats(prev => ({ ...prev, pending: data.length }));
        }

        // Fetch Users
        const resUsers = await fetch(`${DEPLOYED_API_URL}/api/admin/all-users`);
        if (resUsers.ok) {
            const data = await resUsers.json();
            setAllUsers(data);
            setStats(prev => ({ ...prev, total: data.length }));
        }

        // Fetch SOS/Active Rides
        const resSos = await fetch(`${DEPLOYED_API_URL}/api/admin/sos-alerts`);
        if (resSos.ok) {
            const data = await resSos.json();
            setSosAlerts(data);
            setStats(prev => ({ ...prev, active: data.length }));
        }

    } catch (e) { console.error("Admin Fetch Error", e); }
  };

  const handleDecision = async (id, status) => {
      try {
          await fetch(`${DEPLOYED_API_URL}/api/admin/verify/${id}`, {
              method: 'PUT',
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status })
          });
          alert(`Volunteer ${status}`);
          fetchData(); // Refresh list
          setSelectedVol(null);
      } catch (e) { alert("Action Failed"); }
  };

  // --- SUB-COMPONENTS ---

  const SidebarItem = ({ id, icon: Icon, label, count, color }) => (
      <button 
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${activeTab === id ? 'bg-white/10 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
      >
          <Icon size={20} className={activeTab === id ? color : ""} />
          {sidebarOpen && <span className="font-bold text-sm flex-1 text-left">{label}</span>}
          {sidebarOpen && count > 0 && <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{count}</span>}
      </button>
  );

  const StatCard = ({ icon: Icon, label, value, color }) => (
      <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition">
          <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110 ${color}`}>
              <Icon size={64} />
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-white/5 ${color}`}>
              <Icon size={24} />
          </div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{label}</p>
          <h3 className="text-3xl font-black text-white mt-1">{value}</h3>
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
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
                    <Menu size={20}/>
                </button>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                <SidebarItem id="dashboard" icon={LayoutDashboard} label="Overview" color="text-blue-500"/>
                <SidebarItem id="verification" icon={Check} label="Verification" count={pendingVolunteers.length} color="text-green-500"/>
                <SidebarItem id="users" icon={Users} label="All Users" color="text-purple-500"/>
                <SidebarItem id="alerts" icon={AlertTriangle} label="Safety Monitor" count={sosAlerts.length} color="text-red-500"/>
                <SidebarItem id="audit" icon={Activity} label="Audit Logs" color="text-yellow-500"/>
            </nav>

            <div className="p-4 border-t border-white/10">
                <button onClick={onLogout} className={`flex items-center gap-3 w-full p-3 rounded-xl text-red-500 hover:bg-red-900/10 transition ${!sidebarOpen && 'justify-center'}`}>
                    <LogOut size={20}/>
                    {sidebarOpen && <span className="font-bold text-sm">Logout</span>}
                </button>
            </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 h-screen overflow-y-auto bg-[#050505] p-8">
            
            {/* HEADER */}
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-black text-white">{activeTab === 'dashboard' ? 'Overview' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                    <p className="text-gray-500 text-sm mt-1">System Status: <span className="text-green-500 font-bold">Operational</span></p>
                </div>
            </header>

            {/* --- DASHBOARD VIEW --- */}
            {activeTab === 'dashboard' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <StatCard icon={Users} label="Total Users" value={stats.total} color="text-purple-500" />
                        <StatCard icon={Lock} label="Pending Review" value={stats.pending} color="text-yellow-500" />
                        <StatCard icon={Activity} label="Active Rides" value={stats.active} color="text-green-500" />
                        <StatCard icon={AlertTriangle} label="SOS Triggers" value="0" color="text-red-500" />
                    </div>
                    {/* Recent Activity Placeholder */}
                    <div className="bg-[#121212] rounded-3xl border border-white/5 p-8">
                        <h3 className="text-xl font-bold mb-6">Recent System Activity</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-[#0a0a0a] rounded-xl border border-white/5">
                                <span className="text-gray-400 text-sm">New Volunteer Registered</span>
                                <span className="text-green-500 text-xs font-bold">Just Now</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-[#0a0a0a] rounded-xl border border-white/5">
                                <span className="text-gray-400 text-sm">Ride #8492 Completed</span>
                                <span className="text-blue-500 text-xs font-bold">2m ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- VERIFICATION VIEW (Pending Request Fix) --- */}
            {activeTab === 'verification' && (
                <div className="flex gap-8 h-[calc(100vh-140px)] animate-in fade-in">
                    {/* List */}
                    <div className="w-1/3 bg-[#121212] rounded-3xl border border-white/5 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-white/5 bg-[#161616]">
                            <h2 className="text-lg font-bold">Pending Queue</h2>
                            <p className="text-xs text-gray-500">{pendingVolunteers.length} waiting for approval</p>
                        </div>
                        <div className="overflow-y-auto flex-1 p-4 space-y-2">
                            {pendingVolunteers.map(v => (
                                <div 
                                    key={v._id} 
                                    onClick={() => setSelectedVol(v)}
                                    className={`p-4 rounded-xl border cursor-pointer transition flex justify-between items-center ${selectedVol?._id === v._id ? 'bg-green-900/20 border-green-500' : 'bg-[#1a1a1a] border-white/5 text-gray-400 hover:bg-[#222]'}`}
                                >
                                    <div>
                                        <h4 className={`font-bold text-sm ${selectedVol?._id === v._id ? 'text-white' : 'text-gray-200'}`}>{v.name}</h4>
                                        <p className="text-[10px] text-gray-600">{v.email}</p>
                                    </div>
                                </div>
                            ))}
                            {pendingVolunteers.length === 0 && <div className="p-8 text-center text-gray-600 text-sm">No pending requests.</div>}
                        </div>
                    </div>

                    {/* Detail Panel */}
                    <div className="flex-1 bg-[#121212] rounded-3xl border border-white/5 p-8 relative flex flex-col">
                        {selectedVol ? (
                            <>
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h1 className="text-3xl font-black">{selectedVol.name}</h1>
                                        <div className="flex gap-2 mt-2">
                                            <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{selectedVol.serviceSector}</span>
                                            <span className="bg-white/10 text-gray-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">ID: {selectedVol._id.slice(-4)}</span>
                                        </div>
                                    </div>
                                    <div className="text-right"><p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Applied On</p><p className="font-mono text-sm text-white">{new Date(selectedVol.createdAt).toLocaleDateString()}</p></div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-8 flex-1 overflow-y-auto">
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-blue-500 uppercase">Govt ID</p>
                                        <div className="w-full h-48 bg-black rounded-xl border border-white/10 flex items-center justify-center text-gray-600"><span className="text-xs font-mono">{selectedVol.govtId}</span></div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-green-500 uppercase">Live Selfie</p>
                                        <div className="w-full h-48 bg-black rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
                                            {selectedVol.selfieImage ? <img src={selectedVol.selfieImage} className="w-full h-full object-cover" alt="Selfie"/> : <span className="text-xs text-gray-600">No Image</span>}
                                        </div>
                                    </div>
                                    {/* Google Meet Link */}
                                    <div className="col-span-2 bg-blue-900/10 p-4 rounded-xl border border-blue-500/20 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs font-bold text-blue-400 uppercase">Step 2: Interview</p>
                                            <p className="text-sm text-gray-300">Schedule a quick video call to verify details.</p>
                                        </div>
                                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-blue-500 transition">Open Google Meet</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-auto">
                                    <button onClick={() => handleDecision(selectedVol._id, 'rejected')} className="py-4 rounded-xl border border-red-900/50 text-red-500 font-bold hover:bg-red-900/10 transition uppercase text-sm tracking-widest">Reject</button>
                                    <button onClick={() => handleDecision(selectedVol._id, 'approved')} className="py-4 rounded-xl bg-green-600 text-black font-bold hover:bg-green-500 transition uppercase text-sm tracking-widest">Approve Volunteer</button>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600"><Users size={48} className="mb-4 opacity-20"/><p>Select a volunteer to review.</p></div>
                        )}
                    </div>
                </div>
            )}

            {/* --- ALL USERS VIEW --- */}
            {activeTab === 'users' && (
                <div className="bg-[#121212] rounded-3xl border border-white/5 overflow-hidden animate-in fade-in">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <h2 className="text-xl font-bold">Registered Users</h2>
                        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16}/><input type="text" placeholder="Search users..." className="bg-[#0a0a0a] border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:border-green-500 outline-none"/></div>
                    </div>
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-[#1a1a1a] text-gray-200 uppercase text-xs font-bold">
                            <tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Phone</th><th className="p-4">Status</th></tr>
                        </thead>
                        <tbody>
                            {allUsers.map((u, i) => (
                                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition">
                                    <td className="p-4 font-bold text-white">{u.name}</td>
                                    <td className="p-4">{u.email}</td>
                                    <td className="p-4">{u.phone || "N/A"}</td>
                                    <td className="p-4"><span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-[10px] font-black uppercase">Active</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- SOS / SAFETY MONITOR VIEW --- */}
            {activeTab === 'alerts' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                    {sosAlerts.length === 0 ? (
                        <div className="col-span-2 p-12 text-center bg-[#121212] rounded-3xl border border-white/5">
                            <Check className="mx-auto mb-4 text-green-500" size={48}/>
                            <h3 className="text-xl font-bold text-white">All Clear</h3>
                            <p className="text-gray-500">No active SOS alerts or emergency rides in progress.</p>
                        </div>
                    ) : (
                        sosAlerts.map(alert => (
                            <div key={alert._id} className="bg-red-900/10 border border-red-500/30 p-6 rounded-2xl flex justify-between items-center relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 animate-pulse"></div>
                                <div>
                                    <h4 className="text-red-500 font-black text-lg flex items-center gap-2"><AlertTriangle size={20}/> ACTIVE RIDE</h4>
                                    <p className="text-white font-bold text-xl mt-1">{alert.requesterName}</p>
                                    <div className="flex gap-2 mt-2 text-sm text-gray-400"><MapPin size={16}/> {alert.drop}</div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-red-400 font-bold uppercase tracking-widest">Volunteer</p>
                                    <p className="text-white font-bold">{alert.volunteerName}</p>
                                    <button className="mt-4 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-xs transition">Dispatch Help</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* --- AUDIT LOGS VIEW (Mocked for UI) --- */}
            {activeTab === 'audit' && (
                <div className="bg-[#121212] rounded-3xl border border-white/5 p-6 animate-in fade-in">
                    <h2 className="text-xl font-bold mb-6">System Audit Logs</h2>
                    <div className="space-y-4">
                        {[1,2,3].map(i => (
                            <div key={i} className="flex gap-4 items-center p-3 rounded-xl hover:bg-white/5 transition">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <p className="text-sm text-gray-400 font-mono">2025-01-14 10:3{i} AM</p>
                                <p className="text-sm text-white">Admin <span className="font-bold">approved</span> volunteer <span className="text-blue-400">#849{i}</span></p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </main>
    </div>
  );
};

export default AdminPanel;