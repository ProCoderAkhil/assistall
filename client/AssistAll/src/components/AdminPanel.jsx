import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Car, Settings, LogOut, 
  Shield, Bell, CheckCircle, XCircle, RefreshCw, 
  MapPin, Phone, Mail, FileText, Stethoscope, Video, X, Eye
} from 'lucide-react';

const AdminPanel = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ volunteers: 0, users: 0, rides: 0, earnings: 0 });
  const [volunteers, setVolunteers] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [generatedCode, setGeneratedCode] = useState("------"); 
  
  // 🔍 SELECTED VOLUNTEER STATE (For Detail Modal)
  const [selectedVol, setSelectedVol] = useState(null);

  const DEPLOYED_API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000' 
      : 'https://assistall-server.onrender.com';

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
        const resStats = await fetch(`${DEPLOYED_API_URL}/api/admin/stats`);
        if(resStats.ok) setStats(await resStats.json());

        const resVol = await fetch(`${DEPLOYED_API_URL}/api/admin/volunteers`);
        if(resVol.ok) {
            const data = await resVol.json();
            setVolunteers(data);
            setPendingVerifications(data.filter(v => !v.isVerified));
        }

        const resCode = await fetch(`${DEPLOYED_API_URL}/api/admin/code`);
        if(resCode.ok) {
            const data = await resCode.json();
            if(data.code) setGeneratedCode(data.code);
        }
    } catch (error) {}
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  // --- ACTIONS ---
  const generateCode = async () => {
    try {
        const res = await fetch(`${DEPLOYED_API_URL}/api/admin/generate-code`, { method: 'POST' });
        const data = await res.json();
        if (res.ok) setGeneratedCode(data.code);
    } catch(e) { alert("Error"); }
  };

  const approveVolunteer = async (id) => {
      try {
          await fetch(`${DEPLOYED_API_URL}/api/admin/verify/${id}`, { method: 'PUT' });
          fetchData();
          setSelectedVol(null); // Close modal if open
      } catch(e) { alert("Failed"); }
  };

  // --- VIEWS ---

  const VolunteerDetailModal = () => {
      if (!selectedVol) return null;
      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-[#121212] w-full max-w-2xl rounded-3xl border border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  
                  {/* Header */}
                  <div className="p-6 border-b border-neutral-800 flex justify-between items-start bg-[#1a1a1a]">
                      <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg border-2 border-white/10">
                              {selectedVol.name.charAt(0)}
                          </div>
                          <div>
                              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                  {selectedVol.name}
                                  {selectedVol.isVerified && <CheckCircle size={20} className="text-green-500"/>}
                              </h2>
                              <div className="flex gap-2 mt-1">
                                  {selectedVol.isGeriatricTrained && (
                                      <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20 font-bold flex items-center gap-1">
                                          <Stethoscope size={10}/> GERIATRIC PRO
                                      </span>
                                  )}
                                  <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold uppercase">
                                      {selectedVol.role}
                                  </span>
                              </div>
                          </div>
                      </div>
                      <button onClick={() => setSelectedVol(null)} className="p-2 bg-neutral-800 rounded-full text-neutral-400 hover:text-white hover:bg-red-500 transition"><X size={20}/></button>
                  </div>

                  {/* Body */}
                  <div className="p-8 overflow-y-auto space-y-8">
                      
                      {/* Contact Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-800 pb-2">Contact Details</h3>
                              <div className="flex items-center gap-3 text-neutral-300"><Mail size={18} className="text-blue-500"/> {selectedVol.email}</div>
                              <div className="flex items-center gap-3 text-neutral-300"><Phone size={18} className="text-green-500"/> {selectedVol.phone || "N/A"}</div>
                              <div className="flex items-center gap-3 text-neutral-300"><MapPin size={18} className="text-red-500"/> {selectedVol.address || "N/A"}</div>
                          </div>

                          <div className="space-y-4">
                              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-800 pb-2">Documents</h3>
                              
                              <div className="flex items-center justify-between bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                                  <div className="flex items-center gap-3">
                                      <div className="bg-neutral-800 p-2 rounded-lg"><FileText size={18} className="text-white"/></div>
                                      <div><p className="text-sm font-bold text-white">Govt ID Proof</p><p className="text-xs text-neutral-500">{selectedVol.govtId || "Pending"}</p></div>
                                  </div>
                                  <button className="text-xs font-bold text-blue-400 hover:text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-lg">View</button>
                              </div>

                              {selectedVol.isGeriatricTrained && (
                                  <div className="flex items-center justify-between bg-green-900/10 p-3 rounded-xl border border-green-500/20">
                                      <div className="flex items-center gap-3">
                                          <div className="bg-green-500/20 p-2 rounded-lg"><Stethoscope size={18} className="text-green-500"/></div>
                                          <div><p className="text-sm font-bold text-white">Training Cert</p><p className="text-xs text-neutral-500">{selectedVol.trainingCertificate || "Uploaded"}</p></div>
                                      </div>
                                      <button className="text-xs font-bold text-green-400 hover:text-green-300 border border-green-500/30 px-3 py-1.5 rounded-lg">View</button>
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Verification Status Area */}
                      <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 text-center">
                          <h3 className="text-sm font-bold text-white mb-2">Verification Status</h3>
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4 ${selectedVol.isVerified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'}`}>
                              {selectedVol.isVerified ? <CheckCircle size={16}/> : <RefreshCw size={16} className="animate-spin"/>}
                              {selectedVol.isVerified ? "APPROVED & ACTIVE" : "PENDING INTERVIEW"}
                          </div>
                          
                          {!selectedVol.isVerified && (
                              <div className="flex gap-3 justify-center">
                                  <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition">
                                      <Video size={18}/> Start Video Interview
                                  </button>
                                  <button onClick={() => approveVolunteer(selectedVol._id)} className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition">
                                      <CheckCircle size={18}/> Approve Now
                                  </button>
                              </div>
                          )}
                          
                          {selectedVol.isVerified && (
                              <button onClick={() => approveVolunteer(selectedVol._id)} className="text-red-500 text-sm font-bold hover:underline">Revoke Verification</button>
                          )}
                      </div>

                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-black font-sans flex text-gray-100 overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-64 bg-[#0a0a0a] border-r border-neutral-800 p-6 flex flex-col hidden lg:flex">
        <div className="flex items-center mb-10 text-white font-black text-xl gap-2"><Shield className="text-blue-500" fill="currentColor"/> Admin Panel</div>
        <nav className="space-y-2 flex-1">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center p-3 rounded-xl font-bold transition ${activeTab==='dashboard'?'bg-blue-600 text-white':'text-neutral-400 hover:bg-white/5'}`}><LayoutDashboard size={20} className="mr-3"/> Dashboard</button>
            <button onClick={() => setActiveTab('verification')} className={`w-full flex items-center p-3 rounded-xl font-bold transition ${activeTab==='verification'?'bg-blue-600 text-white':'text-neutral-400 hover:bg-white/5'}`}><Users size={20} className="mr-3"/> Verification</button>
        </nav>
        <button onClick={onLogout} className="text-red-500 font-bold flex items-center p-3 hover:bg-red-900/10 rounded-xl"><LogOut size={20} className="mr-3"/> Sign Out</button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 relative">
          <header className="flex justify-between items-center mb-8"><h1 className="text-3xl font-black text-white capitalize">{activeTab}</h1><div className="flex items-center gap-4"><Bell className="text-neutral-400"/><div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full"></div></div></header>
          
          {activeTab === 'dashboard' && (
              <div className="grid grid-cols-4 gap-6 animate-in fade-in">
                  <div className="bg-[#111] p-6 rounded-2xl border border-neutral-800"><h3 className="text-gray-500 text-xs font-bold">Total Users</h3><p className="text-3xl font-black text-white">{stats.users}</p></div>
                  <div className="bg-[#111] p-6 rounded-2xl border border-neutral-800"><h3 className="text-gray-500 text-xs font-bold">Pending</h3><p className="text-3xl font-black text-yellow-500">{pendingVerifications.length}</p></div>
                  <div className="bg-[#111] p-6 rounded-2xl border border-neutral-800 col-span-2 flex justify-between items-center">
                      <div><h3 className="text-gray-500 text-xs font-bold">Active OTP</h3><p className="text-4xl font-black text-green-500 tracking-widest font-mono">{generatedCode}</p></div>
                      <button onClick={generateCode} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-500"><RefreshCw size={18}/></button>
                  </div>
              </div>
          )}

          {activeTab === 'verification' && (
            <div className="animate-in slide-in-from-right">
                <div className="bg-[#111] rounded-3xl border border-neutral-800 overflow-hidden">
                    <div className="p-6 border-b border-neutral-800"><h3 className="font-bold text-white">Verification Queue</h3></div>
                    <table className="w-full text-left">
                        <thead className="bg-[#0a0a0a] text-gray-500 text-xs uppercase font-bold"><tr><th className="p-4">Name</th><th className="p-4">Training</th><th className="p-4">Status</th><th className="p-4 text-right">Action</th></tr></thead>
                        <tbody className="divide-y divide-neutral-800 text-sm text-gray-300">
                            {pendingVerifications.map(v => (
                                <tr key={v._id} className="hover:bg-white/5 transition cursor-pointer" onClick={() => setSelectedVol(v)}>
                                    <td className="p-4 font-bold text-white flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center text-xs">{v.name.charAt(0)}</div>
                                        <div>{v.name}<p className="text-gray-500 text-xs font-normal">{v.email}</p></div>
                                    </td>
                                    <td className="p-4">
                                        {v.isGeriatricTrained ? <span className="flex items-center gap-1 text-green-400 text-xs font-bold"><Stethoscope size={12}/> Trained</span> : <span className="text-gray-600 text-xs">Standard</span>}
                                    </td>
                                    <td className="p-4"><span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-xs border border-yellow-500/20">Pending</span></td>
                                    <td className="p-4 text-right"><button className="text-blue-400 hover:text-white font-bold text-xs border border-blue-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1 ml-auto"><Eye size={12}/> View Details</button></td>
                                </tr>
                            ))}
                            {pendingVerifications.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-600">No pending requests.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
          )}
          
          {/* Detail Modal */}
          <VolunteerDetailModal />
      </div>
    </div>
  );
};

export default AdminPanel;