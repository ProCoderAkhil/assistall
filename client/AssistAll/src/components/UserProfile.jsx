import React, { useState } from 'react';
import { 
  User, Settings, LogOut, ChevronRight, Shield, CreditCard, 
  Bell, HelpCircle, ArrowLeft, Activity, Heart, Phone, 
  Lock, Globe, Smartphone, Plus, History, Check, X, Trash2, Wallet
} from 'lucide-react';
import { useToast } from './ToastContext'; // ✅ Import Context

const UserProfile = ({ user, onLogout, onBack }) => {
  const { addToast } = useToast(); // ✅ Use Hook
  const [subPage, setSubPage] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // --- PAYMENT STATE ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPaymentType, setNewPaymentType] = useState('upi'); // 'upi' or 'card'
  const [newUpiId, setNewUpiId] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([
      { id: 1, type: 'card', label: '•••• 4242', sub: 'Expires 12/28', icon: 'card', active: true },
      { id: 2, type: 'upi', label: 'user@upi', sub: 'Verified', icon: 'upi', active: false }
  ]);

  // --- ACTIONS ---
  const handleSetActive = (id) => {
      setPaymentMethods(prev => prev.map(m => ({ ...m, active: m.id === id })));
      addToast("Default payment method updated", "info");
  };

  const handleDeleteMethod = (e, id) => {
      e.stopPropagation();
      if(window.confirm("Remove this payment method?")) {
          setPaymentMethods(prev => prev.filter(m => m.id !== id));
          addToast("Payment method removed", "success");
      }
  };

  const handleAddPayment = () => {
      if (newPaymentType === 'upi' && !newUpiId) {
          addToast("Please enter a valid UPI ID", "error");
          return;
      }
      
      const newMethod = {
          id: Date.now(),
          type: newPaymentType,
          label: newPaymentType === 'upi' ? newUpiId : '•••• 8888', // Mock card for demo
          sub: newPaymentType === 'upi' ? 'Verified' : 'Expires 01/30',
          icon: newPaymentType,
          active: false
      };
      
      setPaymentMethods([...paymentMethods, newMethod]);
      setShowAddModal(false);
      setNewUpiId('');
      addToast("Payment Method Added Successfully!", "success");
  };

  // --- RENDERERS ---

  const renderAddPaymentModal = () => (
      <div className="fixed inset-0 z-[6000] flex items-end justify-center sm:items-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity" onClick={() => setShowAddModal(false)}></div>
          
          <div className="relative bg-[#1a1a1a] border border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Add Payment</h3>
                  <button onClick={() => setShowAddModal(false)} className="p-2 bg-neutral-800 rounded-full text-neutral-400 hover:text-white"><X size={18}/></button>
              </div>

              {/* Toggle Type */}
              <div className="flex bg-neutral-900 p-1 rounded-xl mb-6">
                  <button onClick={() => setNewPaymentType('upi')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition ${newPaymentType === 'upi' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-500'}`}>UPI ID</button>
                  <button onClick={() => setNewPaymentType('card')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition ${newPaymentType === 'card' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-500'}`}>Card</button>
              </div>

              {newPaymentType === 'upi' ? (
                  <div className="space-y-4">
                      <div className="relative">
                          <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20}/>
                          <input 
                            type="text" 
                            placeholder="ex: name@oksbi" 
                            className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-green-500 transition"
                            value={newUpiId}
                            onChange={(e) => setNewUpiId(e.target.value)}
                          />
                      </div>
                      <p className="text-[10px] text-neutral-500 px-2">We will verify this ID by sending ₹1.</p>
                  </div>
              ) : (
                  <div className="p-4 bg-neutral-900 rounded-xl border border-white/5 text-center">
                      <p className="text-neutral-400 text-sm">Card addition is simulated for this demo.</p>
                  </div>
              )}

              <button onClick={handleAddPayment} className="w-full bg-green-600 text-black font-bold py-4 rounded-xl mt-6 hover:bg-green-500 transition active:scale-95 shadow-[0_0_20px_rgba(22,163,74,0.3)]">
                  Verify & Add
              </button>
          </div>
      </div>
  );

  const renderContent = () => {
      if (subPage === 'medical') return (
          <div className="animate-in slide-in-from-right duration-300">
              <div className="bg-red-900/10 p-6 rounded-3xl border border-red-500/20 mb-6 relative overflow-hidden">
                  <Activity className="absolute -right-4 -top-4 text-red-500/10 w-40 h-40"/>
                  <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                          <div className="p-3 bg-red-500/20 rounded-full text-red-500"><Heart size={24} fill="currentColor"/></div>
                          <h3 className="text-xl font-bold text-white">Medical ID</h3>
                      </div>
                      <div className="space-y-4">
                          <div className="flex justify-between items-center border-b border-red-500/10 pb-3"><span className="text-red-400 text-sm font-medium">Blood Type</span><span className="font-mono font-bold text-white text-lg">{user.bloodGroup || "O+"}</span></div>
                          <div className="flex justify-between items-center border-b border-red-500/10 pb-3"><span className="text-red-400 text-sm font-medium">Conditions</span><span className="font-bold text-white">{user.medicalCondition || "None"}</span></div>
                          <div className="flex justify-between items-center pt-1"><span className="text-red-400 text-sm font-medium">Emergency</span><div className="text-right"><span className="font-bold text-white block">{user.emergencyContact?.name || "None"}</span><span className="text-xs text-red-300 font-mono">{user.emergencyContact?.phone || ""}</span></div></div>
                      </div>
                  </div>
              </div>
              <button className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:bg-red-500 transition active:scale-95">Edit Medical Info</button>
          </div>
      );

      if (subPage === 'payments') return (
          <div className="animate-in slide-in-from-right duration-300 relative">
              {showAddModal && renderAddPaymentModal()}
              
              <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-6 rounded-3xl border border-blue-500/20 mb-8 relative overflow-hidden">
                  <div className="relative z-10 flex justify-between items-end">
                      <div><p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-1">AssistAll Wallet</p><h2 className="text-3xl font-black text-white">₹2,450</h2></div>
                      <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400"><Wallet size={24}/></div>
                  </div>
              </div>

              <div className="mb-4 flex justify-between items-end">
                  <h3 className="text-lg font-bold text-white">Payment Methods</h3>
                  <p className="text-xs text-neutral-500">Tap to select default</p>
              </div>
              
              <div className="space-y-3 mb-8">
                  {paymentMethods.map((method) => (
                      <div 
                        key={method.id} 
                        onClick={() => handleSetActive(method.id)}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${method.active ? 'bg-blue-600/10 border-blue-500/50' : 'bg-[#111] border-white/5 hover:border-white/10'}`}
                      >
                          <div className="flex items-center gap-4">
                              <div className={`w-12 h-8 rounded flex items-center justify-center ${method.type === 'card' ? 'bg-white' : 'bg-neutral-800'}`}>
                                  {method.type === 'card' ? <div className="flex gap-1"><div className="w-3 h-3 rounded-full bg-red-500/80"></div><div className="w-3 h-3 rounded-full bg-yellow-500/80 -ml-1.5"></div></div> : <span className="text-[10px] font-bold text-green-500">UPI</span>}
                              </div>
                              <div>
                                  <p className={`font-medium text-sm ${method.active ? 'text-white' : 'text-neutral-300'}`}>{method.label}</p>
                                  <p className="text-[10px] text-neutral-500">{method.sub}</p>
                              </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                              {!method.active && (
                                  <button onClick={(e) => handleDeleteMethod(e, method.id)} className="p-2 text-neutral-600 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                                      <Trash2 size={16}/>
                                  </button>
                              )}
                              {method.active && <div className="bg-blue-500 rounded-full p-1"><Check size={12} className="text-white"/></div>}
                          </div>
                      </div>
                  ))}
              </div>

              <button 
                onClick={() => setShowAddModal(true)}
                className="w-full py-4 rounded-xl border border-dashed border-white/20 text-neutral-400 font-bold text-sm hover:bg-white/5 hover:border-white/40 transition flex items-center justify-center gap-2"
              >
                  <Plus size={18}/> Add New Method
              </button>

              <div className="mt-8">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2"><History size={18} className="text-neutral-500"/> Recent Activity</h3>
                  <div className="space-y-2">
                      {[{ t: "Ride to Airport", d: "Today, 9:00 AM", a: "-₹450" }, { t: "Pharmacy Delivery", d: "Yesterday", a: "-₹120" }].map((tx, i) => (
                          <div key={i} className="bg-[#111] p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                              <div><p className="text-sm text-white font-bold">{tx.t}</p><p className="text-xs text-neutral-500">{tx.d}</p></div>
                              <span className="text-white font-mono font-bold">{tx.a}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );

      if (subPage === 'settings') return (
          <div className="animate-in slide-in-from-right duration-300 space-y-6">
              <div className="space-y-4">
                  <h3 className="text-neutral-500 text-xs font-bold uppercase tracking-widest ml-1">Preferences</h3>
                  <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between p-4 border-b border-white/5">
                          <div className="flex items-center gap-3"><Bell size={20} className="text-neutral-400"/><span className="text-white font-medium">Push Notifications</span></div>
                          <button onClick={() => { setNotificationsEnabled(!notificationsEnabled); addToast(`Notifications ${!notificationsEnabled ? 'Enabled' : 'Disabled'}`, "info"); }} className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${notificationsEnabled ? 'bg-green-600' : 'bg-neutral-700'}`}><div className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div></button>
                      </div>
                      <div className="flex items-center justify-between p-4"><div className="flex items-center gap-3"><Globe size={20} className="text-neutral-400"/><span className="text-white font-medium">Language</span></div><span className="text-neutral-500 text-sm flex items-center">English <ChevronRight size={16}/></span></div>
                  </div>
              </div>
              <div className="space-y-4">
                  <h3 className="text-neutral-500 text-xs font-bold uppercase tracking-widest ml-1">Security</h3>
                  <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                      <button className="w-full flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 transition text-left"><div className="flex items-center gap-3"><Lock size={20} className="text-neutral-400"/><span className="text-white font-medium">Change Password</span></div><ChevronRight size={16} className="text-neutral-500"/></button>
                      <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition text-left"><div className="flex items-center gap-3"><Smartphone size={20} className="text-neutral-400"/><span className="text-white font-medium">Trusted Devices</span></div><span className="text-neutral-500 text-xs">iPhone 14 Pro</span></button>
                  </div>
              </div>
              <div className="bg-blue-900/10 p-4 rounded-xl border border-blue-500/20 flex items-center justify-between"><div className="flex items-center gap-3"><HelpCircle size={20} className="text-blue-400"/><span className="text-blue-100 font-medium">Help & Support</span></div><ChevronRight size={16} className="text-blue-400"/></div>
              <p className="text-center text-xs text-neutral-600 pt-4">Version 10.2.4 (Build 8821)</p>
          </div>
      );
      
      return (
          <div className="animate-in slide-in-from-left duration-300">
             <div className="bg-[#1a1a1a] p-6 rounded-3xl border border-white/5 shadow-xl mb-8 flex items-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
                 <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mr-5 shadow-lg shadow-blue-500/20 border-4 border-[#1a1a1a]">{user.name.charAt(0)}</div>
                 <div><h2 className="text-2xl font-bold text-white tracking-tight">{user.name}</h2><p className="text-sm text-neutral-400 font-medium mb-2">{user.email}</p><div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20"><Shield size={12} className="text-green-500"/><span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Verified User</span></div></div>
             </div>
             <div className="space-y-3">
                 <button onClick={() => setSubPage('medical')} className="w-full p-5 bg-[#111] border border-white/5 rounded-2xl flex items-center justify-between hover:bg-[#1a1a1a] hover:border-white/10 transition group active:scale-[0.98]"><div className="flex items-center gap-4"><div className="p-3 bg-red-500/10 rounded-xl text-red-500 group-hover:bg-red-500 group-hover:text-white transition"><Activity size={20}/></div><span className="font-bold text-white text-lg">Medical ID</span></div><ChevronRight size={20} className="text-neutral-600 group-hover:text-white transition"/></button>
                 <button onClick={() => setSubPage('payments')} className="w-full p-5 bg-[#111] border border-white/5 rounded-2xl flex items-center justify-between hover:bg-[#1a1a1a] hover:border-white/10 transition group active:scale-[0.98]"><div className="flex items-center gap-4"><div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition"><CreditCard size={20}/></div><span className="font-bold text-white text-lg">Payments</span></div><ChevronRight size={20} className="text-neutral-600 group-hover:text-white transition"/></button>
                 <button onClick={() => setSubPage('settings')} className="w-full p-5 bg-[#111] border border-white/5 rounded-2xl flex items-center justify-between hover:bg-[#1a1a1a] hover:border-white/10 transition group active:scale-[0.98]"><div className="flex items-center gap-4"><div className="p-3 bg-neutral-800 rounded-xl text-neutral-400 group-hover:bg-white group-hover:text-black transition"><Settings size={20}/></div><span className="font-bold text-white text-lg">Settings</span></div><ChevronRight size={20} className="text-neutral-600 group-hover:text-white transition"/></button>
             </div>
             <button onClick={onLogout} className="w-full mt-10 p-4 text-red-500 font-bold bg-red-900/10 border border-red-900/30 rounded-2xl hover:bg-red-900/20 transition flex items-center justify-center gap-2 active:scale-95"><LogOut size={20}/> Log Out</button>
          </div>
      );
  };

  return (
    <div className="h-screen w-full bg-[#050505] text-white flex flex-col font-sans">
        <div className="p-6 pt-10 border-b border-white/5 flex items-center bg-[#0a0a0a]">
            <button onClick={subPage ? () => setSubPage(null) : onBack} className="p-3 bg-[#1a1a1a] hover:bg-[#222] text-white rounded-full mr-4 transition border border-white/5 active:scale-90"><ArrowLeft size={20}/></button>
            <h1 className="text-2xl font-black tracking-tight">{subPage === 'medical' ? 'Medical ID' : subPage === 'payments' ? 'Wallet & Cards' : subPage === 'settings' ? 'Settings' : 'My Profile'}</h1>
        </div>
        <div className="p-6 flex-grow overflow-y-auto pb-24">{renderContent()}</div>
    </div>
  );
};
export default UserProfile;