import React, { useState } from 'react';
import { 
  User, Mail, Lock, Phone, ArrowLeft, Loader2, Heart, 
  ShieldAlert, Type, Accessibility, Check, MapPin, 
  CreditCard, Droplet, Home, Ear, Users, ChevronRight
} from 'lucide-react';
import Toast from './Toast';

// --- CUSTOM STYLES (Matches Landing Page) ---
const styles = `
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob { animation: blob 7s infinite; }
  .animation-delay-2000 { animation-delay: 2s; }
  .animation-delay-4000 { animation-delay: 4s; }
  .glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); }
  .input-glass { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: white; transition: all 0.3s ease; }
  .input-glass:focus { border-color: #22c55e; background: rgba(255, 255, 255, 0.08); box-shadow: 0 0 15px rgba(34, 197, 94, 0.1); }
  .option-card { transition: all 0.3s ease; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.02); }
  .option-card:hover { background: rgba(255,255,255,0.05); transform: translateY(-2px); }
  .option-active { border-color: #22c55e; background: rgba(34, 197, 94, 0.1); }
`;

const UserSignup = ({ onRegister, onBack }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  
  const [formData, setFormData] = useState({
      name: '', email: '', password: '', phone: '',
      isCaregiverAccount: false, caregiverName: '',
      age: '', gender: 'Male', bloodGroup: '', 
      address: '', govtIdNumber: '', livingSituation: 'With Family',
      emergencyName: '', emergencyPhone: '', emergencyRelation: '',
      medicalCondition: '',
      prefersLargeText: false, needsWheelchair: false, needsHearingAid: false
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpInput, setOtpInput] = useState('');

  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://assistall-server.onrender.com';

  const showToast = (msg, type = 'success') => { 
      setToast({ msg, type }); 
      setTimeout(() => setToast(null), 4000); 
  };

  const handleBack = () => {
      if (step > 1) setStep(step - 1);
      else onBack();
  };

  const handleSendOtp = () => {
      if(formData.phone.length < 10) return setError("Enter valid phone number");
      setError('');
      setOtpLoading(true);
      setTimeout(() => {
          setOtpLoading(false);
          setOtpSent(true);
          showToast("SMS: Your AssistAll Code is 5555", "info"); 
      }, 1500);
  };

  const handleVerifyOtp = () => {
      setOtpLoading(true);
      setError('');
      setTimeout(() => {
          setOtpLoading(false);
          if(otpInput === '5555') {
              setOtpVerified(true);
              showToast("Phone Verified Successfully", "success");
          } else {
              setError("Incorrect Code. Please try 5555.");
          }
      }, 1000);
  };

  const handleSubmit = async () => {
      setLoading(true);
      try {
          const payload = {
              ...formData,
              role: 'user',
              emergencyContact: {
                  name: formData.emergencyName,
                  phone: formData.emergencyPhone,
                  relation: formData.emergencyRelation
              }
          };

          const res = await fetch(`${API_URL}/api/auth/register`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
          });

          const data = await res.json();
          if (res.ok) onRegister(data.user, data.token);
          else setError(data.message || "Registration Failed");
      } catch (e) { setError("Network Error"); } 
      finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white font-sans flex items-center justify-center p-6 relative overflow-hidden selection:bg-green-500/30">
      <style>{styles}</style>

      {/* --- ANIMATED BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-4000"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/90 to-[#050505]"></div>
      </div>

      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-[6000] w-full max-w-sm px-4 pointer-events-none">
          {toast && <div className="pointer-events-auto"><Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} /></div>}
      </div>

      {/* --- GLASS CARD CONTAINER --- */}
      <div className="w-full max-w-md glass-card p-8 rounded-[32px] shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
          
          <div className="flex items-center justify-between mb-8">
            <button onClick={handleBack} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition"/>
            </button>
            <div className="flex gap-2">
                {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step >= i ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-white/10'}`}></div>
                ))}
            </div>
            <div className="w-8"></div> {/* Spacer for center alignment */}
          </div>

          <div className="text-center mb-8">
              <h2 className="text-3xl font-black tracking-tight text-white mb-1">
                  {step === 1 ? "Create Account" : step === 2 ? "Personal Details" : step === 3 ? "Safety & Health" : "Comfort Settings"}
              </h2>
              <p className="text-sm font-medium text-gray-500">Step {step} of 4</p>
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl text-center text-sm font-bold mb-6 border border-red-500/20 animate-pulse">
                {error}
            </div>
          )}

          {/* STEP 1: ACCOUNT */}
          {step === 1 && (
              <div className="space-y-5 animate-in slide-in-from-right">
                  
                  {/* Caregiver Toggle */}
                  <div 
                      onClick={() => setFormData(prev => ({...prev, isCaregiverAccount: !prev.isCaregiverAccount}))}
                      className={`p-4 rounded-2xl cursor-pointer flex items-center gap-4 border transition-all duration-300 ${formData.isCaregiverAccount ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                      <div className={`p-2.5 rounded-xl ${formData.isCaregiverAccount ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-400'}`}><Users size={20}/></div>
                      <div className="flex-1">
                          <p className="text-sm font-bold text-white">Managing for a Senior?</p>
                          <p className="text-[10px] text-gray-400">Enable Caregiver Mode</p>
                      </div>
                      {formData.isCaregiverAccount && <div className="bg-blue-500 rounded-full p-1"><Check size={12} className="text-white"/></div>}
                  </div>

                  {formData.isCaregiverAccount && (
                      <div className="relative animate-in fade-in slide-in-from-top-2">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={20}/>
                          <input className="w-full input-glass rounded-2xl py-4 pl-12 pr-4 outline-none" placeholder="Your Name (Caregiver)" onChange={e => setFormData({...formData, caregiverName: e.target.value})} />
                      </div>
                  )}

                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition" size={20}/>
                    <input className="w-full input-glass rounded-2xl py-4 pl-12 pr-4 outline-none" placeholder={formData.isCaregiverAccount ? "Senior's Full Name" : "Full Name"} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition" size={20}/>
                    <input className="w-full input-glass rounded-2xl py-4 pl-12 pr-4 outline-none" placeholder="Email Address" type="email" onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  
                  {/* Phone Verification Box */}
                  <div className={`p-1 rounded-2xl border transition-all duration-300 ${otpVerified ? 'bg-green-500/10 border-green-500/50' : 'bg-white/5 border-white/10'}`}>
                      <div className="flex items-center p-3">
                          <Phone size={20} className={`ml-1 mr-3 ${otpVerified ? "text-green-500" : "text-gray-500"}`}/>
                          <input className="bg-transparent w-full outline-none text-white placeholder-gray-500" placeholder="Phone Number" onChange={e => setFormData({...formData, phone: e.target.value})} disabled={otpVerified || otpSent}/>
                          {!otpVerified && <button onClick={handleSendOtp} disabled={otpLoading || otpSent} className="text-green-400 font-bold text-xs bg-green-500/10 px-3 py-1.5 rounded-lg hover:bg-green-500/20 transition disabled:opacity-50">{otpLoading && !otpSent ? <Loader2 className="animate-spin" size={14}/> : otpSent ? "SENT" : "VERIFY"}</button>}
                          {otpVerified && <Check size={20} className="text-green-500 mr-2"/>}
                      </div>
                      {otpSent && !otpVerified && (
                          <div className="flex gap-2 border-t border-white/10 p-3 animate-in slide-in-from-top-2">
                              <input className="bg-transparent w-full tracking-[0.5em] text-center font-mono text-lg outline-none text-white" placeholder="0000" maxLength={4} onChange={e => setOtpInput(e.target.value)}/>
                              <button onClick={handleVerifyOtp} disabled={otpLoading} className="bg-green-500 text-black px-4 rounded-lg text-xs font-bold hover:bg-green-400 transition disabled:opacity-50">{otpLoading ? <Loader2 className="animate-spin" size={14}/> : "GO"}</button>
                          </div>
                      )}
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition" size={20}/>
                    <input className="w-full input-glass rounded-2xl py-4 pl-12 pr-4 outline-none" placeholder="Password" type="password" onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>

                  <button onClick={() => otpVerified ? setStep(2) : setError("Please verify your phone number")} className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-200 transition mt-2 shadow-lg shadow-white/10">Next Step</button>
              </div>
          )}

          {/* STEP 2: PERSONAL */}
          {step === 2 && (
              <div className="space-y-4 animate-in slide-in-from-right">
                  <div className="grid grid-cols-2 gap-4">
                      <input className="w-full input-glass rounded-2xl p-4 outline-none text-center" placeholder="Age" type="number" onChange={e => setFormData({...formData, age: e.target.value})} />
                      <select className="w-full input-glass rounded-2xl p-4 outline-none text-gray-300 bg-[#121212]" onChange={e => setFormData({...formData, gender: e.target.value})}>
                          <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                      </select>
                  </div>
                  
                  <div className="flex gap-3">
                      <div className="relative flex-1 group">
                        <Droplet className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" size={20}/>
                        <select className="w-full input-glass rounded-2xl p-4 pl-12 outline-none text-gray-300 bg-[#121212] group-focus-within:border-red-500" onChange={e => setFormData({...formData, bloodGroup: e.target.value})}>
                            <option value="">Blood Group</option><option value="A+">A+</option><option value="O+">O+</option><option value="B+">B+</option><option value="AB+">AB+</option>
                        </select>
                      </div>
                      <div className="relative flex-1 group">
                        <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={20}/>
                        <select className="w-full input-glass rounded-2xl p-4 pl-12 outline-none text-gray-300 bg-[#121212] group-focus-within:border-blue-500" onChange={e => setFormData({...formData, livingSituation: e.target.value})}>
                            <option value="With Family">With Family</option><option value="Alone">Living Alone</option><option value="Care Home">Care Home</option>
                        </select>
                      </div>
                  </div>

                  <div className="relative group">
                    <MapPin className="absolute left-4 top-4 text-gray-500 group-focus-within:text-green-500 transition" size={20}/>
                    <textarea className="w-full input-glass rounded-2xl p-4 pl-12 outline-none h-24 resize-none" placeholder="Current Address" onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                  
                  <div className="relative group">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition" size={20}/>
                    <input className="w-full input-glass rounded-2xl p-4 pl-12 outline-none" placeholder="Aadhar / Govt ID Number" onChange={e => setFormData({...formData, govtIdNumber: e.target.value})} />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep(1)} className="px-6 py-4 rounded-2xl font-bold bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition">Back</button>
                    <button onClick={() => setStep(3)} className="flex-1 bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-200 shadow-lg shadow-white/10 transition">Next Step</button>
                  </div>
              </div>
          )}

          {/* STEP 3: SAFETY */}
          {step === 3 && (
              <div className="space-y-4 animate-in slide-in-from-right">
                  <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 mb-4 flex gap-3 items-start">
                      <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={20}/>
                      <p className="text-xs text-red-200 leading-relaxed">We will alert this person if you press the <b>SOS Button</b> or trigger <b>Walk With Me</b> alerts.</p>
                  </div>
                  
                  <input className="w-full input-glass rounded-2xl p-4 outline-none focus:border-red-500 transition" placeholder="Emergency Contact Name" onChange={e => setFormData({...formData, emergencyName: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                      <input className="w-full input-glass rounded-2xl p-4 outline-none focus:border-red-500 transition" placeholder="Relation (e.g. Son)" onChange={e => setFormData({...formData, emergencyRelation: e.target.value})} />
                      <input className="w-full input-glass rounded-2xl p-4 outline-none focus:border-red-500 transition" placeholder="Their Phone" onChange={e => setFormData({...formData, emergencyPhone: e.target.value})} />
                  </div>
                  
                  <div className="relative group">
                    <Heart className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition" size={20}/>
                    <input className="w-full input-glass rounded-2xl p-4 pl-12 outline-none focus:border-blue-500 transition" placeholder="Medical Condition (Diabetes, etc.)" onChange={e => setFormData({...formData, medicalCondition: e.target.value})} />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep(2)} className="px-6 py-4 rounded-2xl font-bold bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition">Back</button>
                    <button onClick={() => setStep(4)} className="flex-1 bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-200 shadow-lg shadow-white/10 transition">Next Step</button>
                  </div>
              </div>
          )}

          {/* STEP 4: COMFORT */}
          {step === 4 && (
              <div className="space-y-4 animate-in slide-in-from-right">
                  <div className="space-y-3">
                      <div onClick={() => setFormData({...formData, prefersLargeText: !formData.prefersLargeText})} className={`flex justify-between items-center p-4 rounded-2xl cursor-pointer option-card ${formData.prefersLargeText ? 'option-active' : ''}`}>
                          <div className="flex gap-3 items-center"><Type size={24} className="text-gray-300"/><span className="text-sm font-bold text-white">Large Text Mode</span></div>
                          {formData.prefersLargeText && <Check className="text-green-500"/>}
                      </div>
                      <div onClick={() => setFormData({...formData, needsWheelchair: !formData.needsWheelchair})} className={`flex justify-between items-center p-4 rounded-2xl cursor-pointer option-card ${formData.needsWheelchair ? 'bg-blue-500/10 border-blue-500' : ''}`}>
                          <div className="flex gap-3 items-center"><Accessibility size={24} className="text-gray-300"/><span className="text-sm font-bold text-white">Wheelchair Access</span></div>
                          {formData.needsWheelchair && <Check className="text-blue-500"/>}
                      </div>
                      <div onClick={() => setFormData({...formData, needsHearingAid: !formData.needsHearingAid})} className={`flex justify-between items-center p-4 rounded-2xl cursor-pointer option-card ${formData.needsHearingAid ? 'bg-yellow-500/10 border-yellow-500' : ''}`}>
                          <div className="flex gap-3 items-center"><Ear size={24} className="text-gray-300"/><span className="text-sm font-bold text-white">Hearing Impairment</span></div>
                          {formData.needsHearingAid && <Check className="text-yellow-500"/>}
                      </div>
                  </div>

                  <div className="flex gap-3 mt-8 pt-4">
                    <button onClick={() => setStep(3)} className="px-6 py-4 rounded-2xl font-bold bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition">Back</button>
                    <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-green-500 text-black font-bold py-4 rounded-2xl hover:bg-green-400 transition shadow-lg shadow-green-500/20 flex justify-center items-center gap-2">
                        {loading ? <Loader2 className="animate-spin" /> : <>Create Account <ChevronRight size={18}/></>}
                    </button>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};
export default UserSignup;