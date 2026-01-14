import React, { useState, useRef } from 'react';
import { 
  User, Shield, ArrowLeft, Loader2, Camera, FileText, Video, 
  Stethoscope, Car, HeartHandshake, AlertCircle, Check, Calendar, ExternalLink
} from 'lucide-react';

const VolunteerSignup = ({ onRegister, onBack }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
      name: '', email: '', password: '', address: '', phone: '', 
      serviceSector: 'transport', vehicleType: 'Car', vehicleModel: '', vehicleNumber: '' 
  });
  
  // --- STATES ---
  const [govtIdFile, setGovtIdFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToBackgroundCheck, setAgreedToBackgroundCheck] = useState(false);
  
  // Interview State
  const [interviewDate, setInterviewDate] = useState('');
  const [registeredUserId, setRegisteredUserId] = useState(null); // Store ID after Step 3

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://assistall-server.onrender.com';

  // --- CAMERA LOGIC ---
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

  // --- STEP 3 SUBMIT: UPLOAD DATA ---
  const handleVerificationSubmit = async () => {
    setLoading(true); setError('');
    
    if (!govtIdFile) { setError("Government ID is required."); setLoading(false); return; }
    if (!selfie) { setError("Live Selfie is required."); setLoading(false); return; }
    if (!agreedToTerms || !agreedToBackgroundCheck) { setError("Please agree to the terms."); setLoading(false); return; }

    try {
      const payload = {
          ...formData,
          role: 'volunteer',
          govtId: govtIdFile.name,
          drivingLicense: licenseFile ? licenseFile.name : '',
          selfieImage: selfie, // Ensure backend has limit: '50mb'
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
          setRegisteredUserId(data.user._id); // Save ID for next step
          setStep(4); // ✅ Move to Interview Step
      } else {
          setError(data.message || "Registration Failed. Check file size.");
      }
    } catch (e) { 
        setError("Network Error: Make sure backend accepts large files."); 
    } finally { setLoading(false); }
  };

  // --- STEP 4 SUBMIT: SCHEDULE INTERVIEW ---
  const handleScheduleSubmit = async () => {
      if(!interviewDate) return setError("Please select a date and time.");
      setLoading(true);
      
      try {
          await fetch(`${API_URL}/api/auth/schedule-interview/${registeredUserId}`, {
              method: "PUT", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ interviewDate })
          });
          
          // Final Success - Log them in or show success
          alert("Interview Scheduled! Check your email for the Google Meet link.");
          window.location.href = "/"; // Or trigger onRegister callback
      } catch (e) { setError("Failed to schedule."); }
      finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-[#0a0a0a] border border-[#222] p-8 rounded-[32px] shadow-2xl relative z-10">
            {step < 4 && <button onClick={onBack} className="absolute top-6 left-6 p-2 rounded-full hover:bg-[#222] text-gray-500 hover:text-white transition"><ArrowLeft size={20}/></button>}
            
            {/* Progress Bar */}
            <div className="flex justify-center gap-2 mb-8 mt-2">
                {[1,2,3,4].map(i => <div key={i} className={`h-1 w-12 rounded-full transition-all ${step >= i ? 'bg-blue-600' : 'bg-[#222]'}`}></div>)}
            </div>

            <div className="text-center mb-8">
                <h2 className="text-2xl font-black">
                    {step === 1 ? "Identity" : step === 2 ? "Documents" : step === 3 ? "Live Verification" : "Final Step"}
                </h2>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Step {step} of 4</p>
            </div>

            {error && <div className="bg-red-900/20 text-red-500 p-3 rounded-xl text-center text-sm font-bold mb-6 border border-red-900/50 flex items-center justify-center gap-2"><AlertCircle size={16}/> {error}</div>}

            {/* STEP 1: BASICS */}
            {step === 1 && (
                <div className="space-y-4 animate-in slide-in-from-right">
                    <input className="bg-[#111] border border-[#222] p-4 rounded-xl w-full focus:border-blue-600 outline-none" placeholder="Full Name" onChange={e => setFormData({...formData, name: e.target.value})} />
                    <input className="bg-[#111] border border-[#222] p-4 rounded-xl w-full focus:border-blue-600 outline-none" placeholder="Email" type="email" onChange={e => setFormData({...formData, email: e.target.value})} />
                    <input className="bg-[#111] border border-[#222] p-4 rounded-xl w-full focus:border-blue-600 outline-none" placeholder="Password" type="password" onChange={e => setFormData({...formData, password: e.target.value})} />
                    <button onClick={() => setStep(2)} className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition mt-2">Next Step</button>
                </div>
            )}

            {/* STEP 2: DOCUMENTS */}
            {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right">
                    <div className="bg-[#111] p-5 rounded-2xl border border-[#222] space-y-4">
                        <div onClick={() => document.getElementById('govtId').click()} className="flex justify-between p-4 bg-[#0a0a0a] rounded-xl border border-[#222] cursor-pointer hover:border-blue-500">
                            <span className="text-sm">Government ID</span>
                            <span className="text-xs text-blue-400 font-bold">{govtIdFile ? "Uploaded" : "Upload"}</span>
                            <input id="govtId" type="file" hidden onChange={e => setGovtIdFile(e.target.files[0])}/>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setStep(1)} className="px-6 py-4 rounded-xl font-bold bg-[#111] text-gray-400">Back</button>
                        <button onClick={() => setStep(3)} className="flex-1 bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200">Next Step</button>
                    </div>
                </div>
            )}

            {/* STEP 3: LIVENESS */}
            {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right text-center">
                    <div className="bg-[#111] rounded-2xl overflow-hidden border border-[#333] relative h-56 flex items-center justify-center">
                        {selfie ? (
                            <img src={selfie} alt="Selfie" className="w-full h-full object-cover"/>
                        ) : cameraActive ? (
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]"></video>
                        ) : (
                            <div className="text-gray-500 flex flex-col items-center">
                                <Camera size={48} className="mb-2 opacity-50"/>
                                <p className="text-xs uppercase font-bold">Face Verification</p>
                            </div>
                        )}
                        <canvas ref={canvasRef} className="hidden"></canvas>
                    </div>

                    {!selfie ? (
                        cameraActive ? <button onClick={capturePhoto} className="w-full bg-white text-black font-bold py-3 rounded-xl">Capture Photo</button> : <button onClick={startCamera} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl">Start Camera</button>
                    ) : (
                        <button onClick={() => { setSelfie(null); startCamera(); }} className="w-full bg-[#222] text-white font-bold py-3 rounded-xl">Retake</button>
                    )}

                    <div className="text-left space-y-3 px-2">
                        <label className="flex gap-3 items-start cursor-pointer"><input type="checkbox" className="mt-1 w-4 h-4 accent-blue-600" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)}/><span className="text-xs text-gray-400">I agree to the <b className="text-white">Code of Conduct</b>.</span></label>
                        <label className="flex gap-3 items-start cursor-pointer"><input type="checkbox" className="mt-1 w-4 h-4 accent-blue-600" checked={agreedToBackgroundCheck} onChange={e => setAgreedToBackgroundCheck(e.target.checked)}/><span className="text-xs text-gray-400">I consent to a <b className="text-white">Background Check</b>.</span></label>
                    </div>

                    <button onClick={handleVerificationSubmit} disabled={loading} className="w-full bg-green-600 text-black font-bold py-4 rounded-xl disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin mx-auto"/> : "Submit Verification"}
                    </button>
                </div>
            )}

            {/* ✅ STEP 4: GOOGLE MEET SCHEDULER */}
            {step === 4 && (
                <div className="space-y-6 animate-in slide-in-from-right text-center">
                    <div className="bg-blue-900/20 p-6 rounded-3xl border border-blue-500/30 flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 text-blue-400 animate-pulse">
                            <Video size={32}/>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Final Interview</h3>
                        <p className="text-sm text-blue-200 mb-6 max-w-xs">
                            To ensure safety, we require a short 5-minute video call with an admin.
                        </p>
                        
                        <div className="w-full text-left bg-black/50 p-4 rounded-xl border border-white/10 mb-4">
                            <label className="text-xs text-gray-500 font-bold uppercase tracking-widest block mb-2">Select Date & Time</label>
                            <div className="flex items-center gap-3">
                                <Calendar className="text-gray-400" size={20}/>
                                <input 
                                    type="datetime-local" 
                                    className="bg-transparent text-white outline-none w-full font-bold cursor-pointer"
                                    onChange={(e) => setInterviewDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-bold tracking-widest bg-white/5 px-3 py-1 rounded-full">
                            <ExternalLink size={10}/> Google Meet
                        </div>
                    </div>

                    <button onClick={handleScheduleSubmit} disabled={loading} className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-gray-200 transition">
                        {loading ? <Loader2 className="animate-spin mx-auto"/> : "Confirm Schedule"}
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};
export default VolunteerSignup;