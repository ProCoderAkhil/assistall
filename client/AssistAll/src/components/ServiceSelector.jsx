import React, { useState } from 'react';
import { 
  Car, HeartHandshake, ShoppingBag, Pill, ArrowRight, Search, 
  Zap, Calendar, MapPin, ChevronDown, Check, Mic, MicOff, Accessibility 
} from 'lucide-react';
import { useToast } from './ToastContext';

const ServiceSelector = ({ onClose, onFindClick }) => { 
  const { addToast } = useToast();
  const [serviceType, setServiceType] = useState('Transport');
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  // Smart Features State
  const [needsWheelchair, setNeedsWheelchair] = useState(false);
  const [needsMedicalCar, setNeedsMedicalCar] = useState(false);
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // --- VOICE GUIDED BOOKING ---
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return addToast("Voice input not supported", "error");

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript); // Auto-fill destination
      
      // Simple Intent Recognition
      if (transcript.toLowerCase().includes("hospital") || transcript.toLowerCase().includes("doctor")) {
        setServiceType("Transport");
        setNeedsMedicalCar(true);
        addToast("Medical Transport detected", "info");
      }
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleSubmit = () => {
      if(!searchQuery) {
          addToast("Please select a destination", "error");
          return;
      }
      onFindClick({ 
          type: serviceType, 
          dropOff: searchQuery,
          // ✅ Passing Smart Matching Preferences
          preferences: { wheelchair: needsWheelchair, medicalCar: needsMedicalCar } 
      });
  };

  return (
    <>
        <div className={`absolute left-0 right-0 bg-[#121212] rounded-t-[40px] shadow-2xl z-[40] border-t border-white/5 transition-all duration-500 ease-out ${isExpanded ? 'bottom-0 pb-24' : 'bottom-[-100%]'}`}>
            <div className="w-full flex justify-center pt-4 pb-2 cursor-pointer" onClick={() => setIsExpanded(false)}>
                <div className="w-12 h-1.5 bg-neutral-700 rounded-full"></div>
            </div>
            
            <div className="p-6 pt-2">
                
                {/* --- DESTINATION INPUT + VOICE --- */}
                <div className="relative mb-6">
                    <div className="flex gap-2">
                        <div className={`flex-1 flex items-center bg-[#1a1a1a] p-4 rounded-2xl border transition-all ${isDropdownOpen ? 'border-green-500' : 'border-white/10'}`}>
                            <div className="bg-green-500/20 text-green-500 p-2 rounded-xl mr-3"><Search size={20}/></div>
                            <input 
                                type="text"
                                placeholder="Where to?" 
                                className="w-full bg-transparent outline-none font-bold text-lg text-white placeholder-gray-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsDropdownOpen(true)}
                            />
                        </div>
                        {/* 🎤 Voice Button */}
                        <button 
                            onClick={handleVoiceInput}
                            className={`p-4 rounded-2xl border transition-all flex items-center justify-center ${isListening ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-[#1a1a1a] border-white/10 text-gray-400'}`}
                        >
                            {isListening ? <MicOff size={24}/> : <Mic size={24}/>}
                        </button>
                    </div>
                </div>

                {/* --- SERVICES --- */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                    {[
                        { id: 'Transport', label: 'Ride', icon: Car },
                        { id: 'Companion', label: 'Helper', icon: HeartHandshake },
                        { id: 'Medicine', label: 'Meds', icon: Pill },
                        { id: 'Groceries', label: 'Shop', icon: ShoppingBag },
                    ].map(s => (
                        <button key={s.id} onClick={() => setServiceType(s.id)} className={`flex flex-col items-center p-2 py-4 rounded-2xl border transition-all ${serviceType === s.id ? 'border-green-500 bg-green-500/10' : 'border-white/5 bg-[#1a1a1a]'}`}>
                            <s.icon size={28} className={`mb-3 ${serviceType === s.id ? 'text-green-400' : 'text-gray-400'}`}/>
                            <span className={`text-[10px] font-bold ${serviceType === s.id ? 'text-white' : 'text-gray-500'}`}>{s.label}</span>
                        </button>
                    ))}
                </div>

                {/* --- SMART AI MATCHING TOGGLES --- */}
                <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/5 mb-6">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Zap size={12}/> Smart Matching Requirements</p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setNeedsWheelchair(!needsWheelchair)}
                            className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition ${needsWheelchair ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'border-white/10 text-gray-500'}`}
                        >
                            <Accessibility size={18}/> Wheelchair
                        </button>
                        <button 
                            onClick={() => setNeedsMedicalCar(!needsMedicalCar)}
                            className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition ${needsMedicalCar ? 'bg-red-500/20 border-red-500 text-red-400' : 'border-white/10 text-gray-500'}`}
                        >
                            <Pill size={18}/> Medical Kit
                        </button>
                    </div>
                </div>

                <button onClick={handleSubmit} className="w-full bg-white text-black font-black py-4 rounded-2xl shadow-lg hover:bg-gray-200 transition active:scale-95 flex justify-between items-center px-6">
                    <span className="text-lg">Find Volunteer</span>
                    <div className="bg-black text-white p-2 rounded-full"><ArrowRight size={20}/></div>
                </button>
            </div>
        </div>
        
        {/* Minimized Trigger */}
        {!isExpanded && <div className="absolute bottom-24 left-4 right-4 z-[35]" onClick={() => setIsExpanded(true)}><div className="bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 p-4 rounded-full shadow-2xl flex items-center justify-between cursor-pointer"><div className="flex items-center gap-3"><div className="bg-green-500 text-black p-2 rounded-full"><Search size={18}/></div><span className="text-white font-bold text-sm">Where to?</span></div></div></div>}
    </>
  );
};
export default ServiceSelector;