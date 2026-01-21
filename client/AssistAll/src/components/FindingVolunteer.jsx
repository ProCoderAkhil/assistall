import React, { useState, useEffect } from 'react';
import { Loader2, X, Users, Shield } from 'lucide-react';

const DEPLOYED_API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://assistall-server.onrender.com';

const FindingVolunteer = ({ requestId, onCancel }) => {
  const [statusText, setStatusText] = useState("Scanning nearby sectors...");
  const [volunteersFound, setVolunteersFound] = useState(3);

  useEffect(() => {
    // 1. Dynamic Text Cycling
    const messages = [
      "Scanning nearby sectors...",
      "Pinging verified partners...",
      "Checking availability...",
      "Optimizing best match...",
      "Connecting securely..."
    ];
    let i = 0;
    const textTimer = setInterval(() => {
      i = (i + 1) % messages.length;
      setStatusText(messages[i]);
    }, 2500);

    // 2. Simulated Volunteer Count Update
    const volTimer = setInterval(() => {
        setVolunteersFound(prev => Math.min(prev + 1, 12));
    }, 4000);

    return () => {
        clearInterval(textTimer);
        clearInterval(volTimer);
    };
  }, []);

  const handleCancelRequest = async () => {
      // ✅ SAFETY CHECK: If no ID exists yet, just close the UI
      if (!requestId) {
          onCancel();
          return;
      }

      try {
          await fetch(`${DEPLOYED_API_URL}/api/requests/${requestId}/cancel`, {
              method: 'PUT',
              headers: { "Content-Type": "application/json" }
          });
      } catch (e) {
          console.error("Cancel failed:", e);
          // We don't alert here because we want to let the user exit regardless of network status
      } finally {
          // ✅ CRITICAL FIX: Always close the window, even if API fails
          onCancel(); 
      }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[2000] bg-[#121212] rounded-t-[40px] shadow-[0_-20px_60px_rgba(0,0,0,0.7)] p-8 pb-12 animate-in slide-in-from-bottom duration-500 border-t border-white/10 text-white font-sans">
      <div className="flex flex-col items-center justify-center text-center mt-2">
        
        {/* --- RADAR ANIMATION --- */}
        <div className="relative flex items-center justify-center mb-10 mt-4">
            {/* Outer Ripple */}
            <div className="absolute w-80 h-80 bg-green-500/5 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            {/* Middle Ripple */}
            <div className="absolute w-56 h-56 bg-green-500/10 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            {/* Inner Glow */}
            <div className="absolute w-32 h-32 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
            
            {/* Center Core */}
            <div className="bg-[#000] p-6 rounded-full z-10 shadow-2xl relative border border-green-500/30">
                <div className="absolute inset-0 border-t-2 border-green-500 rounded-full animate-spin"></div>
                <Loader2 className="text-green-400 animate-spin" size={40} />
            </div>

            {/* Orbiting Satellite Icons (Decoration) */}
            <div className="absolute w-48 h-48 animate-[spin_8s_linear_infinite]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]"></div>
            </div>
        </div>

        {/* Text & Status */}
        <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Finding Partner...</h3>
        <p className="text-green-400 font-mono text-xs uppercase tracking-[0.2em] mb-8 animate-pulse">
            {statusText}
        </p>

        {/* Info Pills */}
        <div className="flex gap-3 mb-10">
            <div className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-2 rounded-full border border-white/5">
                <Users size={14} className="text-blue-400"/>
                <span className="text-xs font-bold text-gray-300">{volunteersFound} Active Nearby</span>
            </div>
            <div className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-2 rounded-full border border-white/5">
                <Shield size={14} className="text-green-400"/>
                <span className="text-xs font-bold text-gray-300">Verified Only</span>
            </div>
        </div>

        {/* Cancel Button */}
        <button 
            onClick={handleCancelRequest} 
            className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center hover:bg-red-900/20 hover:border-red-500/50 border border-white/10 transition-all duration-300 group shadow-lg active:scale-95"
        >
            <X size={24} className="text-gray-400 group-hover:text-red-500 transition-colors"/>
        </button>
        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-4">Cancel Request</p>

      </div>
    </div>
  );
};

export default FindingVolunteer;