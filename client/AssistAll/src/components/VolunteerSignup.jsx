import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Shield, ArrowLeft, Loader2, Camera, FileText, Video, 
  Stethoscope, Car, HeartHandshake, AlertCircle, ExternalLink, Lock, Award, CheckCircle, ChevronRight
} from 'lucide-react';

// --- CUSTOM STYLES ---
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
  .input-glass:focus { border-color: #3b82f6; background: rgba(255, 255, 255, 0.08); box-shadow: 0 0 15px rgba(59, 130, 246, 0.1); }
  .sector-card { transition: all 0.3s ease; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.02); }
  .sector-card:hover { background: rgba(255,255,255,0.05); transform: translateY(-2px); border-color: rgba(255,255,255,0.2); }
  .sector-active { border-color: #3b82f6; background: rgba(59, 130, 246, 0.1); box-shadow: 0 0 20px rgba(59, 130, 246, 0.1); }
`;

const VolunteerSignup = ({ onRegister, onBack }) => {
  const API_URL = 'https://assistall-server.onrender.com';

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
      name: '', email: '', password: '', address: '', phone: '', gender: 'Male',
      serviceSector: 'transport', vehicleType: 'Car', vehicleModel: '', vehicleNumber: '' 
  });
  
  // --- FILE STATES ---
  const [govtIdFile, setGovtIdFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);
  const [medicalFile, setMedicalFile] = useState(null); 
  const [volunteerCertFile, setVolunteerCertFile] = useState(null);
  const [selfie, setSelfie] = useState(null);
  
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToBackgroundCheck, setAgreedToBackgroundCheck] = useState(false);
  const [registeredUserId, setRegisteredUserId] = useState(null);
  const [adminCodeInput, setAdminCodeInput] = useState(''); 

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const GOOGLE_MEET_LINK = "https://meet.google.com/hva-psuy-qds"; 

  useEffect(() => {
      setStep(1);
      setError('');
  }, []);

  const handleBack = () => {
      if (step > 1) setStep(step - 1);
      else onBack();
  };

  const startCamera = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraActive(true);
    } catch (err) { setError("Camera access denied."); }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        setSelfie(canvas.toDataURL('image/jpeg'));
        video.srcObject.getTracks().forEach(track => track.stop());
        setCameraActive(false);
    }
  };

  const handleVerificationSubmit = async () => {
    setLoading(true); setError('');
    
    if (!govtIdFile) { setError("Government ID is required."); setLoading(false); return; }
    if (!selfie) { setError("Live Selfie is required."); setLoading(false); return; }
    
    if (formData.serviceSector === 'transport') {
        if (!licenseFile) { setError("Driving License is required for Drivers."); setLoading(false); return; }
        if (!volunteerCertFile) { setError("Volunteer Certificate is required."); setLoading(false); return; }
    }

    if (formData.serviceSector === 'medical') {
        if (!medicalFile) { setError("Nursing/Medical Certificate is required."); setLoading(false); return; }
        if (!volunteerCertFile) { setError("Volunteer Certificate is required."); setLoading(false); return; }
    }

    if (formData.serviceSector === 'companionship') {
        if (!volunteerCertFile) { setError("Volunteer Certificate is required."); setLoading(false); return; }
    }

    if (!agreedToTerms || !agreedToBackgroundCheck) { setError("Please agree to the terms."); setLoading(false); return; }

    try {
      const payload = {
          ...formData,
          role: 'volunteer',
          govtId: govtIdFile.name,
          drivingLicense: licenseFile ? licenseFile.name : '',
          medicalCertificate: medicalFile ? medicalFile.name : '',
          volunteerCertificate: volunteerCertFile ? volunteerCertFile.name : '', 
          selfieImage: selfie, 
          phoneVerified: true,
          agreedToTerms: true,
          vehicleDetails: formData.serviceSector === 'transport' ? {
              type: formData.vehicleType,
              model: formData.vehicleModel,
              number: formData.vehicleNumber
          } : {}
      };

      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok) {
          setRegisteredUserId(data.user._id);
          setStep(4);
      } else {
          setError(data.message || "Registration Failed.");
      }
    } catch (e) { setError("Network Error. Please try again."); } finally { setLoading(false); }
  };

  const handleCodeSubmit = async () => {
      setLoading(true);
      try {
          const res = await fetch(`${API_URL}/api/auth/complete-interview/${registeredUserId}`, {
              method: "PUT", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ adminCode: adminCodeInput })
          });
          
          if(res.ok) {
              alert("Interview Verified! Account Pending Admin Approval.");
              const userData = await res.json();
              if (onRegister) onRegister(userData.user, userData.token);
          } else {
              setError("Invalid Code.");
          }
      } catch (e) { setError("Validation Failed."); }
      finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white font-sans flex items-center justify-center p-6 relative overflow-hidden selection:bg-blue-500/30">
      <style>{styles}</style>

      {/* --- ANIMATED BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-green-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-4000"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/90 to-[#050505]"></div>
      </div>

      <div className="w-full max-w-lg glass-card p-8 rounded-[32px] shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
          
          {/* Header & Back */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={handleBack} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition"/>
            </button>
            <div className="flex gap-2">
                {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step >= i ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' : 'bg-white/10'}`}></div>
                ))}
            </div>
            <div className="w-8"></div>
          </div>

          <div className="text-center mb-8">
              <h2 className="text-3xl font-black tracking-tight text-white mb-1">
                  {step === 4 ? "Live Verification" : "Partner Signup"}
              </h2>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Step {step} of 4</p>
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl text-center text-sm font-bold mb-6 border border-red-500/20 animate-pulse flex items-center justify-center gap-2">
                <AlertCircle size={16}/> {error}
            </div>
          )}

          {/* STEP 1: BASICS */}
          {step === 1 && (
              <div className="space-y-4 animate-in slide-in-from-right">
                  <input className="w-full input-glass p-4 rounded-2xl outline-none" placeholder="Full Name" onChange={e => setFormData({...formData, name: e.target.value})} />
                  
                  <div className="flex gap-3">
                      <select className="w-1/3 input-glass p-4 rounded-2xl outline-none text-gray-300 bg-[#121212] cursor-pointer" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                          <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                      </select>
                      <input className="flex-1 input-glass p-4 rounded-2xl outline-none" placeholder="Phone Number" onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>

                  <input className="w-full input-glass p-4 rounded-2xl outline-none" placeholder="Email Address" type="email" onChange={e => setFormData({...formData, email: e.target.value})} />
                  <input className="w-full input-glass p-4 rounded-2xl outline-none" placeholder="Create Password" type="password" onChange={e => setFormData({...formData, password: e.target.value})} />
                  
                  <button onClick={() => setStep(2)} className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-200 transition mt-2 shadow-lg shadow-white/10 flex items-center justify-center gap-2 group">
                      Next Step <ChevronRight size={18} className="group-hover:translate-x-1 transition"/>
                  </button>
              </div>
          )}
          
          {/* STEP 2: DOCUMENTS */}
          {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right">
                  <div className="grid grid-cols-3 gap-3">
                      {['transport', 'medical', 'companionship'].map(sector => (
                          <button key={sector} onClick={() => setFormData({...formData, serviceSector: sector})} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 sector-card ${formData.serviceSector === sector ? 'sector-active' : 'border-white/10'}`}>
                              {sector === 'transport' ? <Car className={formData.serviceSector === sector ? 'text-blue-400' : 'text-gray-500'}/> : sector === 'medical' ? <Stethoscope className={formData.serviceSector === sector ? 'text-blue-400' : 'text-gray-500'}/> : <HeartHandshake className={formData.serviceSector === sector ? 'text-blue-400' : 'text-gray-500'}/>}
                              <span className={`text-[10px] font-bold uppercase ${formData.serviceSector === sector ? 'text-blue-400' : 'text-gray-500'}`}>{sector}</span>
                          </button>
                      ))}
                  </div>
                  
                  <div className="space-y-3">
                      {/* Govt ID */}
                      <div onClick={() => document.getElementById('govtId').click()} className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/10 cursor-pointer hover:border-blue-500 transition group">
                          <span className="text-sm flex items-center gap-3 text-gray-300 group-hover:text-white"><Shield size={18} className="text-blue-500"/> Government ID</span>
                          <span className={`text-xs font-bold ${govtIdFile ? "text-green-400" : "text-blue-400"}`}>{govtIdFile ? "Uploaded ✓" : "Upload"}</span>
                          <input id="govtId" type="file" hidden onChange={e => setGovtIdFile(e.target.files[0])}/>
                      </div>

                      {/* Dynamic Requirements */}
                      {formData.serviceSector === 'transport' && (
                          <div onClick={() => document.getElementById('license').click()} className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/10 cursor-pointer hover:border-blue-500 transition group">
                              <span className="text-sm flex items-center gap-3 text-gray-300 group-hover:text-white"><Car size={18} className="text-orange-500"/> Driving License</span>
                              <span className={`text-xs font-bold ${licenseFile ? "text-green-400" : "text-orange-400"}`}>{licenseFile ? "Uploaded ✓" : "Upload"}</span>
                              <input id="license" type="file" hidden onChange={e => setLicenseFile(e.target.files[0])}/>
                          </div>
                      )}

                      {formData.serviceSector === 'medical' && (
                          <div onClick={() => document.getElementById('medicalCert').click()} className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/10 cursor-pointer hover:border-blue-500 transition group">
                              <span className="text-sm flex items-center gap-3 text-gray-300 group-hover:text-white"><Stethoscope size={18} className="text-green-500"/> Medical Cert</span>
                              <span className={`text-xs font-bold ${medicalFile ? "text-green-400" : "text-green-400"}`}>{medicalFile ? "Uploaded ✓" : "Upload"}</span>
                              <input id="medicalCert" type="file" hidden onChange={e => setMedicalFile(e.target.files[0])}/>
                          </div>
                      )}

                      <div onClick={() => document.getElementById('volCert').click()} className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/10 cursor-pointer hover:border-blue-500 transition group">
                          <span className="text-sm flex items-center gap-3 text-gray-300 group-hover:text-white"><Award size={18} className="text-purple-500"/> Volunteer Cert</span>
                          <span className={`text-xs font-bold ${volunteerCertFile ? "text-green-400" : "text-purple-400"}`}>{volunteerCertFile ? "Uploaded ✓" : "Upload"}</span>
                          <input id="volCert" type="file" hidden onChange={e => setVolunteerCertFile(e.target.files[0])}/>
                      </div>
                  </div>

                  <div className="flex gap-3">
                      <button onClick={() => setStep(1)} className="px-6 py-4 rounded-2xl font-bold bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition">Back</button>
                      <button onClick={() => setStep(3)} className="flex-1 bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-200 shadow-lg shadow-white/10 transition">Next Step</button>
                  </div>
              </div>
          )}

          {/* STEP 3: SELFIE & CONSENT */}
          {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right text-center">
                  <div className="bg-black/50 rounded-[24px] overflow-hidden border border-white/10 relative h-64 flex items-center justify-center shadow-inner">
                      {selfie ? <img src={selfie} alt="Selfie" className="w-full h-full object-cover"/> : cameraActive ? <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]"></video> : <Camera size={48} className="text-white/20"/>}
                      <canvas ref={canvasRef} className="hidden"></canvas>
                  </div>
                  
                  {!selfie ? (cameraActive ? <button onClick={capturePhoto} className="w-full bg-white text-black font-bold py-3 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.3)]">Capture Photo</button> : <button onClick={startCamera} className="w-full bg-blue-600 text-white font-bold py-3 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)]">Start Camera</button>) : <button onClick={() => { setSelfie(null); startCamera(); }} className="w-full bg-white/10 text-white font-bold py-3 rounded-2xl border border-white/10 hover:bg-white/20 transition">Retake</button>}
                  
                  <div className="text-left space-y-3 px-2">
                      <label className="flex gap-3 items-center cursor-pointer group">
                          <input type="checkbox" className="accent-blue-600 w-5 h-5 rounded-md cursor-pointer" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)}/>
                          <span className="text-xs text-gray-400 group-hover:text-white transition">I agree to the <b>Code of Conduct</b></span>
                      </label>
                      <label className="flex gap-3 items-center cursor-pointer group">
                          <input type="checkbox" className="accent-blue-600 w-5 h-5 rounded-md cursor-pointer" checked={agreedToBackgroundCheck} onChange={e => setAgreedToBackgroundCheck(e.target.checked)}/>
                          <span className="text-xs text-gray-400 group-hover:text-white transition">I consent to a <b>Background Check</b></span>
                      </label>
                  </div>

                  <div className="flex gap-3">
                      <button onClick={() => setStep(2)} className="px-6 py-4 rounded-2xl font-bold bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition">Back</button>
                      <button onClick={handleVerificationSubmit} disabled={loading} className="flex-1 bg-green-600 text-black font-bold py-4 rounded-2xl hover:bg-green-500 transition shadow-[0_0_20px_rgba(22,163,74,0.4)] disabled:opacity-50 disabled:shadow-none">
                          {loading ? <Loader2 className="animate-spin mx-auto"/> : "Proceed to Interview"}
                      </button>
                  </div>
              </div>
          )}

          {/* STEP 4: INTERVIEW */}
          {step === 4 && (
              <div className="space-y-6 animate-in slide-in-from-right text-center">
                  <div className="bg-blue-500/10 p-8 rounded-[32px] border border-blue-500/30 flex flex-col items-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[50px]"></div>
                      <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 text-blue-400 animate-pulse border-4 border-blue-500/10"><Video size={36}/></div>
                      <h3 className="text-2xl font-black text-white mb-2">Live Interview</h3>
                      <p className="text-sm text-blue-200/80 mb-8 max-w-xs leading-relaxed">Join the meet link below. Show your ID to the admin and enter the code they provide.</p>
                      
                      <a href={GOOGLE_MEET_LINK} target="_blank" rel="noreferrer" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 mb-8 transition shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.6)] hover:-translate-y-1">
                          <ExternalLink size={20}/> Join Google Meet
                      </a>
                      
                      <div className="w-full bg-black/40 p-1 rounded-2xl border border-white/10">
                          <input type="text" placeholder="ENTER ADMIN CODE" className="bg-transparent text-white text-center text-3xl font-black font-mono tracking-[0.2em] outline-none w-full uppercase py-4 placeholder:text-white/20" value={adminCodeInput} onChange={(e) => setAdminCodeInput(e.target.value)}/>
                      </div>
                  </div>
                  
                  <button onClick={handleCodeSubmit} disabled={loading} className="w-full bg-green-600 text-black font-black py-4 rounded-2xl hover:bg-green-500 transition shadow-[0_0_20px_rgba(22,163,74,0.4)]">
                      {loading ? <Loader2 className="animate-spin mx-auto"/> : "Verify & Submit"}
                  </button>
                  
                  <p className="text-[10px] text-red-400 font-bold uppercase mt-4 flex items-center justify-center gap-2 bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                      <Lock size={12}/> Locked until Admin Approval
                  </p>
              </div>
          )}
      </div>
    </div>
  );
};
export default VolunteerSignup;