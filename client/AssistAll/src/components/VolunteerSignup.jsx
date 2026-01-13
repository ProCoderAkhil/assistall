import React, { useState, useRef } from 'react';
import { 
  User, Mail, Lock, Shield, ArrowLeft, Loader2, CreditCard, 
  Key, CheckCircle, Camera, Upload, X, Eye, FileText, ChevronRight,
  MapPin, Phone
} from 'lucide-react';

const VolunteerSignup = ({ onRegister, onBack }) => {
  const [step, setStep] = useState(1); // 1: Info, 2: Docs, 3: Admin Verification
  const [formData, setFormData] = useState({ 
      name: '', email: '', password: '', 
      govtId: '', address: '', phone: '', adminCode: '' 
  });
  const [capturedImage, setCapturedImage] = useState(null);
  const [idFile, setIdFile] = useState(null);
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const DEPLOYED_API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000' 
      : 'https://assistall-server.onrender.com';

  // --- CAMERA LOGIC (Unchanged) ---
  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setError("Camera access denied. Please allow permissions.");
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach(track => track.stop());
    setIsCameraOpen(false);
  };

  // --- FORM LOGIC ---
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setIdFile(e.target.files[0]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    if (!formData.adminCode) {
        setError("Please enter the verification code from Admin.");
        setLoading(false);
        return;
    }

    try {
      const response = await fetch(`${DEPLOYED_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...formData,
            role: 'volunteer'
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        onRegister(data.user || data, data.token);
      } else {
        setError(data.message || "Invalid Admin Code.");
      }
    } catch (err) { 
        setError("Connection failed."); 
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex items-center justify-center p-6 relative overflow-hidden">
        
        {/* Background V6 */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10 animate-in zoom-in duration-300">
            
            <button onClick={onBack} className="absolute top-6 left-6 text-neutral-500 hover:text-white transition p-2 hover:bg-white/5 rounded-full">
                <ArrowLeft size={20}/>
            </button>

            {/* Progress Bar */}
            <div className="flex justify-center mb-8 gap-2 mt-2">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`h-1 w-12 rounded-full transition-colors ${step >= i ? 'bg-blue-500' : 'bg-neutral-800'}`}></div>
                ))}
            </div>

            <div className="text-center mb-8">
                <h2 className="text-2xl font-black tracking-tight text-white">
                    {step === 1 ? "Volunteer Profile" : step === 2 ? "Verify Identity" : "Admin Approval"}
                </h2>
                <p className="text-neutral-500 text-xs mt-2 uppercase tracking-widest font-bold">Step {step} of 3</p>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-xs font-bold text-center">{error}</div>}

            {/* --- STEP 1: BASIC INFO --- */}
            {step === 1 && (
                <div className="space-y-4 animate-in slide-in-from-right">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-blue-500 transition" size={18} />
                            <input name="name" type="text" placeholder="Full Name" className="w-full bg-[#111] border border-neutral-800 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition" onChange={handleChange} value={formData.name} />
                        </div>
                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-blue-500 transition" size={18} />
                            <input name="phone" type="text" placeholder="Phone" className="w-full bg-[#111] border border-neutral-800 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition" onChange={handleChange} value={formData.phone} />
                        </div>
                    </div>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-blue-500 transition" size={18} />
                        <input name="email" type="email" placeholder="Email Address" className="w-full bg-[#111] border border-neutral-800 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition" onChange={handleChange} value={formData.email} />
                    </div>
                    <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-blue-500 transition" size={18} />
                        <input name="address" type="text" placeholder="Residential Address" className="w-full bg-[#111] border border-neutral-800 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition" onChange={handleChange} value={formData.address} />
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-blue-500 transition" size={18} />
                        <input name="password" type="password" placeholder="Create Password" className="w-full bg-[#111] border border-neutral-800 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition" onChange={handleChange} value={formData.password} />
                    </div>
                    
                    <button onClick={() => { if(formData.name && formData.email && formData.password) setStep(2); else setError("Please fill all fields"); }} className="w-full bg-white text-black font-bold py-4 rounded-xl mt-4 hover:bg-gray-200 transition flex items-center justify-center gap-2">
                        Next Step <ChevronRight size={18}/>
                    </button>
                </div>
            )}

            {/* --- STEP 2: DOCUMENTS (DigiLocker Sim) --- */}
            {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right">
                    
                    {/* Live Selfie */}
                    <div className="bg-[#111] p-4 rounded-2xl border border-neutral-800 text-center relative overflow-hidden group">
                        {isCameraOpen ? (
                            <div className="relative rounded-xl overflow-hidden bg-black aspect-video mb-4">
                                <video ref={videoRef} autoPlay className="w-full h-full object-cover"></video>
                                <button onClick={capturePhoto} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition">Capture</button>
                            </div>
                        ) : capturedImage ? (
                            <div className="relative rounded-xl overflow-hidden aspect-video mb-2 border border-green-500/50">
                                <img src={capturedImage} alt="Selfie" className="w-full h-full object-cover"/>
                                <button onClick={() => setCapturedImage(null)} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-red-500 transition"><X size={16}/></button>
                                <div className="absolute bottom-0 inset-x-0 bg-green-500/90 text-black text-xs font-bold py-1">PHOTO VERIFIED</div>
                            </div>
                        ) : (
                            <button onClick={startCamera} className="w-full py-8 border-2 border-dashed border-neutral-700 rounded-xl hover:border-blue-500 hover:bg-blue-500/5 transition flex flex-col items-center gap-3 group">
                                <div className="p-3 bg-neutral-800 rounded-full group-hover:bg-blue-500 group-hover:text-white transition"><Camera size={24}/></div>
                                <span className="text-sm font-bold text-neutral-400 group-hover:text-blue-400">Take Live Selfie</span>
                            </button>
                        )}
                        <canvas ref={canvasRef} className="hidden"></canvas>
                    </div>

                    {/* DigiLocker / ID Upload */}
                    <div className="relative">
                        <div className="flex items-center gap-4 bg-[#111] border border-neutral-800 p-4 rounded-xl cursor-pointer hover:border-blue-500 transition group" onClick={() => document.getElementById('file-upload').click()}>
                            <div className="p-3 bg-blue-900/20 text-blue-500 rounded-lg"><FileText size={24}/></div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-white">{idFile ? idFile.name : "DigiLocker / Aadhaar Upload"}</p>
                                <p className="text-xs text-neutral-500">{idFile ? "Verified" : "Tap to browse documents"}</p>
                            </div>
                            {idFile ? <CheckCircle size={20} className="text-green-500"/> : <Upload size={20} className="text-neutral-600"/>}
                        </div>
                        <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setStep(1)} className="px-6 py-4 bg-neutral-800 rounded-xl font-bold text-neutral-400 hover:text-white transition">Back</button>
                        <button onClick={() => { if(capturedImage && idFile) setStep(3); else setError("Please complete verification."); }} className="flex-1 bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center hover:bg-gray-200 transition">
                            Verify & Proceed <ChevronRight size={18} className="ml-2"/>
                        </button>
                    </div>
                </div>
            )}

            {/* --- STEP 3: ADMIN CALL & OTP --- */}
            {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right text-center">
                    <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto border border-yellow-500/30">
                        <Shield size={40} className="text-yellow-500"/>
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-bold text-white">Pending Admin Approval</h3>
                        <p className="text-neutral-400 text-sm mt-2 leading-relaxed">
                            To ensure safety, a <b>Video Call</b> with an Admin is required. <br/>
                            After the call, they will share a <b>6-digit code</b>.
                        </p>
                    </div>

                    <div className="bg-[#111] p-4 rounded-xl border border-neutral-800 text-left">
                        <p className="text-xs font-bold text-neutral-500 uppercase mb-2">Instructions</p>
                        <ul className="text-sm text-neutral-300 space-y-2 list-disc pl-4">
                            <li>Keep your ID proof ready.</li>
                            <li>Join the call link sent to your email.</li>
                            <li>Enter the code provided by the Admin below.</li>
                        </ul>
                    </div>

                    <div className="relative group">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500/70" size={18} />
                        <input 
                            name="adminCode" 
                            type="text" 
                            maxLength="6"
                            placeholder="Enter 6-Digit Admin Code" 
                            className="w-full bg-yellow-900/5 border border-yellow-500/20 rounded-xl py-4 pl-12 pr-4 text-sm text-yellow-100 placeholder-yellow-500/30 focus:outline-none focus:border-yellow-500/50 transition font-mono tracking-widest text-center" 
                            onChange={handleChange} 
                            value={formData.adminCode}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setStep(2)} className="px-6 py-4 bg-neutral-800 rounded-xl font-bold text-neutral-400 hover:text-white transition">Back</button>
                        <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center hover:bg-green-500 transition shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                            {loading ? <Loader2 className="animate-spin" /> : "Verify Code & Register"} 
                        </button>
                    </div>
                </div>
            )}

        </div>
    </div>
  );
};
export default VolunteerSignup;