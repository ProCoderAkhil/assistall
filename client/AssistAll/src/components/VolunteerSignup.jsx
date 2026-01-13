import React, { useState, useRef } from 'react';
import { 
  User, Mail, Lock, Shield, ArrowLeft, Loader2, Key, 
  Camera, Upload, X, FileText, ChevronRight, MapPin, Phone, Video
} from 'lucide-react';

const VolunteerSignup = ({ onRegister, onBack }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', govtId: '', address: '', phone: '', adminCode: '' });
  const [capturedImage, setCapturedImage] = useState(null);
  const [idFile, setIdFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Camera state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://assistall-server.onrender.com';

  // --- CAMERA HELPERS ---
  const startCamera = async () => { setIsCameraOpen(true); try { const s = await navigator.mediaDevices.getUserMedia({video:true}); if(videoRef.current) videoRef.current.srcObject = s; } catch(e){ setError("Camera denied"); setIsCameraOpen(false); } };
  const capturePhoto = () => { const v = videoRef.current; const c = canvasRef.current; if(v && c) { c.width=v.videoWidth; c.height=v.videoHeight; c.getContext('2d').drawImage(v,0,0); setCapturedImage(c.toDataURL('image/png')); const s = v.srcObject; if(s) s.getTracks().forEach(t=>t.stop()); setIsCameraOpen(false); } };

  const handleSubmit = async () => {
    setLoading(true); setError('');
    if (!formData.adminCode) { setError("Enter verification code from Admin."); setLoading(false); return; }
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: 'volunteer' })
      });
      const data = await res.json();
      if (res.ok) onRegister(data.user, data.token);
      else setError(data.message || "Invalid Code");
    } catch (e) { setError("Network Error"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-6 relative overflow-hidden">
        {/* V6 Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        
        <div className="w-full max-w-lg bg-[#0a0a0a] border border-[#222] p-8 rounded-[32px] shadow-2xl relative z-10 animate-in zoom-in duration-300">
            <button onClick={onBack} className="absolute top-6 left-6 p-2 rounded-full hover:bg-[#222] transition text-gray-500 hover:text-white"><ArrowLeft size={20}/></button>
            
            {/* Steps Indicator */}
            <div className="flex justify-center gap-2 mb-8 mt-2">
                {[1,2,3].map(i => <div key={i} className={`h-1 w-12 rounded-full transition-all ${step >= i ? 'bg-blue-600' : 'bg-[#222]'}`}></div>)}
            </div>

            <div className="text-center mb-8">
                <h2 className="text-2xl font-black">{step === 1 ? "Partner Details" : step === 2 ? "Identity Check" : "Admin Approval"}</h2>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Step {step} of 3</p>
            </div>

            {error && <div className="bg-red-900/20 text-red-500 p-3 rounded-xl text-center text-sm font-bold mb-6 border border-red-900/50">{error}</div>}

            {/* STEP 1 */}
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

            {/* STEP 2 */}
            {step === 2 && (
                <div className="space-y-4 animate-in slide-in-from-right">
                    <div className="bg-[#111] h-48 rounded-xl border border-[#222] flex items-center justify-center overflow-hidden relative">
                        {isCameraOpen ? <video ref={videoRef} autoPlay className="w-full h-full object-cover"/> : capturedImage ? <img src={capturedImage} className="w-full h-full object-cover"/> : <Camera size={32} className="text-gray-600"/>}
                        {!isCameraOpen && !capturedImage && <button onClick={startCamera} className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-400 hover:text-white">Tap to take selfie</button>}
                        {isCameraOpen && <button onClick={capturePhoto} className="absolute bottom-4 bg-white text-black px-6 py-2 rounded-full font-bold">Capture</button>}
                        <canvas ref={canvasRef} className="hidden"/>
                    </div>
                    <div className="bg-[#111] p-4 rounded-xl border border-[#222] flex items-center gap-4 cursor-pointer hover:border-blue-600 transition" onClick={() => document.getElementById('doc').click()}>
                        <div className="p-3 bg-[#222] rounded-lg text-blue-500"><FileText/></div>
                        <div><p className="font-bold text-sm">Upload Govt ID / DigiLocker</p><p className="text-xs text-gray-500">{idFile ? idFile.name : "Tap to browse"}</p></div>
                        <input id="doc" type="file" className="hidden" onChange={e => setIdFile(e.target.files[0])}/>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button onClick={() => setStep(1)} className="px-6 py-4 rounded-xl font-bold bg-[#111] text-gray-400 hover:text-white">Back</button>
                        <button onClick={() => setStep(3)} className="flex-1 bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200">Verify Identity</button>
                    </div>
                </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right text-center">
                    <div className="bg-yellow-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto border border-yellow-500/20"><Shield size={40} className="text-yellow-500"/></div>
                    <div><h3 className="text-xl font-bold">Verification Call Required</h3><p className="text-gray-500 text-sm mt-2">Join the video call to get your 6-digit code.</p></div>
                    
                    <a href="https://meet.google.com/fsv-htsz-srx" target="_blank" className="flex items-center justify-center gap-3 w-full bg-[#111] hover:bg-[#222] text-blue-500 font-bold py-4 rounded-xl border border-blue-900/30 transition">
                        <Video size={20}/> Join Admin Call
                    </a>

                    <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"/>
                        <input placeholder="Enter 6-Digit Code" className="w-full bg-[#111] border border-[#222] rounded-xl py-4 pl-12 pr-4 text-center font-mono text-xl tracking-widest focus:border-green-500 outline-none transition" onChange={e => setFormData({...formData, adminCode: e.target.value})} />
                    </div>

                    <button onClick={handleSubmit} disabled={loading} className="w-full bg-green-600 text-black font-bold py-4 rounded-xl hover:bg-green-500 transition">
                        {loading ? <Loader2 className="animate-spin mx-auto"/> : "Complete Registration"}
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};
export default VolunteerSignup;