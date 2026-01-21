import React, { useState } from 'react';
import { Share2, AlertTriangle, ShieldCheck, Phone, ChevronUp, MapPin } from 'lucide-react';

const RideInProgress = ({ requestData }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [reported, setReported] = useState(false);

  const handleShare = () => {
      if (navigator.share) {
          navigator.share({ title: 'Track my Ride', text: 'I am on a ride with AssistAll!', url: window.location.href });
      } else {
          alert("Link copied to clipboard!");
      }
  };

  const handleReport = async () => {
      if(window.confirm("Report this ride for safety issues? Admin will be notified.")) {
          // In real app, call API here
          setReported(true);
          alert("Report Submitted. Our safety team will call you shortly.");
      }
  };

  if (!requestData) return null;

  return (
    <div className={`absolute left-0 right-0 bg-[#121212] rounded-t-[30px] shadow-2xl z-50 border-t border-white/10 transition-all duration-500 ease-in-out ${isExpanded ? 'bottom-0 pb-24' : 'bottom-0 h-[180px]'}`}>
      <div className="w-full h-8 flex items-center justify-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="w-12 h-1.5 bg-neutral-700 rounded-full mb-1"></div>
      </div>
      
      <div className="px-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
              <div>
                  <div className="flex items-center gap-2 mb-1">
                      <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <p className="text-green-500 text-xs font-bold uppercase tracking-widest">ON TRIP</p>
                  </div>
                  <h2 className="text-3xl font-black text-white">{isExpanded ? "Your Ride" : requestData.volunteerName}</h2>
              </div>
              <div className="flex gap-2">
                  <button onClick={handleShare} className="w-10 h-10 bg-blue-900/30 rounded-full flex items-center justify-center border border-blue-500/50 text-blue-400">
                      <Share2 size={18}/>
                  </button>
                  <button onClick={handleReport} className={`w-10 h-10 rounded-full flex items-center justify-center border ${reported ? 'bg-red-600 text-white' : 'bg-red-900/20 border-red-500/50 text-red-500'}`}>
                      <AlertTriangle size={18}/>
                  </button>
              </div>
          </div>
          
          <div className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
              <div className="bg-[#1a1a1a] p-5 rounded-3xl border border-white/5 mb-6">
                  <div className="flex items-start mb-6">
                      <div className="w-3 h-3 bg-white rounded-full border-2 border-neutral-500 shadow mr-4 mt-1"></div>
                      <div>
                          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Pickup</p>
                          {/* ✅ FIXED: Changed pickupLocation to pickup */}
                          <p className="font-bold text-gray-200 text-sm">{requestData.pickup || "Current Location"}</p>
                      </div>
                  </div>
                  <div className="flex items-start">
                      <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow mr-4 mt-1"></div>
                      <div>
                          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Destination</p>
                          <p className="font-bold text-gray-200 text-sm">{requestData.drop}</p>
                      </div>
                  </div>
              </div>

              {/* Safety Banner */}
              <div className="bg-blue-900/10 p-4 rounded-xl border border-blue-500/20 flex items-center gap-3">
                  <ShieldCheck className="text-blue-400" size={24}/>
                  <div>
                      <p className="text-white font-bold text-sm">Ride Monitored</p>
                      <p className="text-blue-300 text-xs">Admin is tracking this trip for safety.</p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
export default RideInProgress;