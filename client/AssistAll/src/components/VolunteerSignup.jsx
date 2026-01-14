import React, { useState, useRef } from 'react';
import { 
  User, Mail, Lock, Shield, ArrowLeft, Loader2, Key, 
  Camera, Upload, FileText, MapPin, Phone, Video, Stethoscope, Car, HeartHandshake, Briefcase, ChevronRight
} from 'lucide-react';

const VolunteerSignup = ({ onRegister, onBack }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
      name: '', email: '', password: '', address: '', phone: '', adminCode: '',
      serviceSector: 'transport', // Default
      vehicleType: 'Car', vehicleModel: '', vehicleNumber: '' 
  });
  
  // File States
  const [govtIdFile, setGovtIdFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);
  const [medicalFile, setMedicalFile] = useState(null);
  
  // Camera
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://assistall-server.onrender.com';

  // --- CAMERA HELPERS ---
  const startCamera = async () => { setIsCameraOpen(true); try { const s = await navigator.mediaDevices.getUserMedia({video:true}); if(videoRef.current) videoRef.current.srcObject = s; } catch(e){ setError("Camera denied"); setIsCameraOpen(false); } };
  const capturePhoto = () => { const v = videoRef.current; const c = canvasRef.current; if(v && c) { c.width=v.videoWidth; c.height=v.videoHeight; c.getContext('2d').drawImage(v,0,0); setCapturedImage(c.toDataURL('image/png')); const s = v.srcObject; if(s) s.getTracks().forEach(t=>t.stop()); setIsCameraOpen(false); } };

  const handleSubmit = async () => {
    setLoading(true); setError('');
    if (!formData.adminCode) { setError("Enter verification code from Admin."); setLoading(false); return; }
    
    try {
      // Build Payload based on Sector
      const payload = {
          ...formData,
          role: 'volunteer',
          govtId: govtIdFile ? govtIdFile.name : 'uploaded_id.jpg', // In real app, upload to cloud first
          drivingLicense: licenseFile ? licenseFile.name : '',
          medicalCertificate: medicalFile ? medicalFile.name : '',
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
      if (res.ok) onRegister(data.user, data.token);
      else setError(data.message || "Invalid Code");
    } catch (e) { setError("Network Error"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        
        <div className="w-full max-w-lg bg-[#0a0a0a] border border-[#222] p-8 rounded-[32px] shadow-2xl relative z-10 animate-in zoom-in duration-300">
            <button onClick={onBack} className="absolute top-6 left-6 p-2 rounded-full hover:bg-[#222] transition text-gray-500 hover:text-white"><ArrowLeft size={20}/></button>
            
            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mb-8 mt-2">
                {[1,2,3].map(i => <div key={i} className={`h-1 w-12 rounded-full transition-all ${step >= i ? 'bg-blue-600' : 'bg-[#222]'}`}></div>)}
            </div>

            <div className="text-center mb-8">
                <h2 className="text-2xl font-black">{step === 1 ? "Partner Details" : step === 2 ? "Service Sector" : "Admin Approval"}</h2>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Step {step} of 3</p>
            </div>

            {error && <div className="bg-red-900/20 text-red-500 p-3 rounded-xl text-center text-sm font-bold mb-6 border border-red-900/50">{error}</div>}

            {/* STEP 1: Basic Info */}
            {step === 1 && (
                <div className="space-y-4 animate-in slide-in-from-right">
                    <div className="grid grid-cols-2 gap-4">
                        <input className="bg-[#111] border border-[#222] p-4 rounded-xl w-full text-sm focus:border-blue-600 outline-none transition" placeholder="Full Name" onChange={e => setFormData({...formData, name: e.target.value})} />
                        <input className="bg-[#111] border border-[#222] p-4 rounded-xl w-full text-sm focus:border-blue-600 outline-none transition" placeholder="Phone" onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <input className="bg-[#111] border border-[#222] p-4 rounded-xl w-full text-sm focus:border-blue-600 outline-none transition" placeholder="Email Address" type="email" onChange={e => setFormData({...formData, email: e.target.value})} />
                    <input className="bg-[#111] border border-[#222] p-4 rounded-xl w-full text-sm focus:border-blue-600 outline-none transition" placeholder="Full Address" onChange={e => setFormData({...formData, address: e.target.value})} />
                    <input className="bg-[#111] border border-[#222] p-4 rounded-xl w-full text-sm focus:border-blue-600 outline-none transition" placeholder="Create Password" type="password" onChange={e => setFormData({...formData, password: e.target.value})} />
                    <button onClick={() => setStep(2)} className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition mt-2">Next Step</button>
                </div>
            )}

            {/* STEP 2: Sector & Docs */}
            {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right">
                    
                    {/* Sector Selection Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => setFormData({...formData, serviceSector: 'transport'})} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition ${formData.serviceSector === 'transport' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-[#111] border-[#222] text-gray-500 hover:bg-[#1a1a1a]'}`}>
                            <Car size={24}/>
                            <span className="text-[10px] font-bold uppercase">Transport</span>
                        </button>
                        <button onClick={() => setFormData({...formData, serviceSector: 'medical'})} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition ${formData.serviceSector === 'medical' ? 'bg-green-600 border-green-400 text-white' : 'bg-[#111] border-[#222] text-gray-500 hover:bg-[#1a1a1a]'}`}>
                            <Stethoscope size={24}/>
                            <span className="text-[10px] font-bold uppercase">Medical</span>
                        </button>
                        <button onClick={() => setFormData({...formData, serviceSector: 'companionship'})} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition ${formData.serviceSector === 'companionship' ? 'bg-purple-600 border-purple-400 text-white' : 'bg-[#111] border-[#222] text-gray-500 hover:bg-[#1a1a1a]'}`}>
                            <HeartHandshake size={24}/>
                            <span className="text-[10px] font-bold uppercase">Helper</span>
                        </button>
                    </div>

                    {/* Dynamic Inputs based on Sector */}
                    <div className="bg-[#111] p-5 rounded-2xl border border-[#222] space-y-4">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Required Documents</h4>
                        
                        {/* Common: Govt ID */}
                        <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-xl border border-[#222] cursor-pointer hover:border-blue-500 transition" onClick={() => document.getElementById('govtId').click()}>
                            <div className="flex items-center gap-3">
                                <Shield className="text-blue-500" size={18}/>
                                <span className="text-sm font-medium text-gray-300">Government ID (Aadhaar)</span>
                            </div>
                            <span className="text-xs text-blue-400">{govtIdFile ? "Uploaded" : "Upload"}</span>
                            <input id="govtId" type="file" hidden onChange={e => setGovtIdFile(e.target.files[0])}/>
                        </div>

                        {/* Transport Specific */}
                        {formData.serviceSector === 'transport' && (
                            <>
                                <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-xl border border-[#222] cursor-pointer hover:border-blue-500 transition" onClick={() => document.getElementById('license').click()}>
                                    <div className="flex items-center gap-3">
                                        <FileText className="text-orange-500" size={18}/>
                                        <span className="text-sm font-medium text-gray-300">Driving License</span>
                                    </div>
                                    <span className="text-xs text-orange-400">{licenseFile ? "Uploaded" : "Upload"}</span>
                                    <input id="license" type="file" hidden onChange={e => setLicenseFile(e.target.files[0])}/>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input placeholder="Vehicle Model (e.g. Swift)" className="bg-[#0a0a0a] border border-[#222] p-3 rounded-xl text-sm focus:border-blue-500 outline-none" onChange={e => setFormData({...formData, vehicleModel: e.target.value})}/>
                                    <input placeholder="Plate No. (KL-01...)" className="bg-[#0a0a0a] border border-[#222] p-3 rounded-xl text-sm focus:border-blue-500 outline-none" onChange={e => setFormData({...formData, vehicleNumber: e.target.value})}/>
                                </div>
                            </>
                        )}

                        {/* Medical Specific */}
                        {formData.serviceSector === 'medical' && (
                            <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-xl border border-[#222] cursor-pointer hover:border-green-500 transition" onClick={() => document.getElementById('medCert').click()}>
                                <div className="flex items-center gap-3">
                                    <Briefcase className="text-green-500" size={18}/>
                                    <span className="text-sm font-medium text-gray-300">Nursing Certificate</span>
                                </div>
                                <span className="text-xs text-green-400">{medicalFile ? "Uploaded" : "Upload"}</span>
                                <input id="medCert" type="file" hidden onChange={e => setMedicalFile(e.target.files[0])}/>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setStep(1)} className="px-6 py-4 rounded-xl font-bold bg-[#111] text-gray-400 hover:text-white">Back</button>
                        <button onClick={() => setStep(3)} className="flex-1 bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200">Verify Identity</button>
                    </div>
                </div>
            )}

            {/* STEP 3: Admin Approval */}
            {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right text-center">
                    <div className="bg-yellow-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto border border-yellow-500/20 animate-pulse"><Shield size={40} className="text-yellow-500"/></div>
                    <div>
                        <h3 className="text-xl font-bold">Final Verification</h3>
                        <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
                            Please join the video call with our admin to verify your <b>{formData.serviceSector}</b> credentials.
                        </p>
                    </div>
                    
                    <a href="https://meet.google.com/fsv-htsz-srx" target="_blank" className="flex items-center justify-center gap-3 w-full bg-[#111] hover:bg-[#222] text-blue-500 font-bold py-4 rounded-xl border border-blue-900/30 transition">
                        <Video size={20}/> Join Interview
                    </a>

                    <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"/>
                        <input placeholder="Enter Admin Code" className="w-full bg-[#111] border border-[#222] rounded-xl py-4 pl-12 pr-4 text-center font-mono text-xl tracking-widest focus:border-green-500 outline-none transition" onChange={e => setFormData({...formData, adminCode: e.target.value})} />
                    </div>

                    <button onClick={handleSubmit} disabled={loading} className="w-full bg-green-600 text-black font-bold py-4 rounded-xl hover:bg-green-500 transition shadow-[0_0_20px_rgba(22,163,74,0.3)]">
                        {loading ? <Loader2 className="animate-spin mx-auto"/> : "Complete Registration"}
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};
export default VolunteerSignup;