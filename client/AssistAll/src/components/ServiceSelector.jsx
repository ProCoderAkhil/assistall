import React, { useState } from 'react';
import { Car, HeartHandshake, ShoppingBag, Pill, ArrowRight, Search, Zap, Calendar, Clock } from 'lucide-react';

const ServiceSelector = ({ onClose, onFindClick }) => { 
  const [serviceType, setServiceType] = useState('Transport');
  const [dropOff, setDropOff] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  
  // --- SCHEDULING STATE ---
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');

  const hospitals = ["Government Medical College", "Caritas Hospital", "Matha Hospital", "General Hospital", "KIMS Health", "Mandiram Hospital"];
  const services = [
      { id: 'Transport', label: 'Ride', icon: Car, surge: false },
      { id: 'Companion', label: 'Helper', icon: HeartHandshake, surge: false },
      { id: 'Medicine', label: 'Meds', icon: Pill, surge: true },
      { id: 'Groceries', label: 'Shop', icon: ShoppingBag, surge: false },
  ];

  const handleSubmit = () => {
      if(!dropOff) return alert("Please enter a destination");
      onFindClick({ 
          type: serviceType, 
          dropOff,
          isScheduled,
          scheduledTime: isScheduled ? scheduleTime : null
      });
  };

  return (
    <>
        <div className={`absolute left-0 right-0 bg-[#121212] rounded-t-[40px] shadow-2xl z-[40] border-t border-white/5 transition-all duration-500 ease-out ${isExpanded ? 'bottom-0 pb-24' : 'bottom-[-100%]'}`}>
            <div className="w-full flex justify-center pt-4 pb-2 cursor-pointer" onClick={() => setIsExpanded(false)}><div className="w-12 h-1.5 bg-neutral-700 rounded-full"></div></div>
            <div className="p-6 pt-2">
                
                {/* Search */}
                <div className="bg-[#1a1a1a] p-4 rounded-2xl flex items-center border border-white/5 mb-6">
                    <div className="bg-green-600/20 text-green-500 p-2 rounded-xl mr-3"><Search size={20}/></div>
                    <input type="text" list="hospital-list" placeholder="Where to?" className="w-full bg-transparent outline-none font-bold text-lg text-white" value={dropOff} onChange={(e) => setDropOff(e.target.value)}/>
                    <datalist id="hospital-list">{hospitals.map((h, i) => <option key={i} value={h} />)}</datalist>
                </div>

                {/* Services */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                    {services.map(s => (
                        <button key={s.id} onClick={() => setServiceType(s.id)} className={`flex flex-col items-center p-2 py-4 rounded-2xl border transition-all ${serviceType === s.id ? 'border-green-500 bg-green-500/10' : 'border-white/5 bg-[#1a1a1a]'}`}>
                            {s.surge && <div className="absolute top-2 right-2"><Zap size={10} className="text-yellow-500 animate-pulse"/></div>}
                            <s.icon size={28} className={`mb-3 ${serviceType === s.id ? 'text-green-400' : 'text-gray-400'}`}/>
                            <span className={`text-[10px] font-bold ${serviceType === s.id ? 'text-white' : 'text-gray-500'}`}>{s.label}</span>
                        </button>
                    ))}
                </div>

                {/* --- SCHEDULE TOGGLE --- */}
                <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/5 mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2"><Calendar size={18} className="text-blue-400"/><span className="font-bold text-sm text-white">Schedule for Later?</span></div>
                        <input type="checkbox" className="w-5 h-5 accent-blue-500" checked={isScheduled} onChange={(e) => setIsScheduled(e.target.checked)} />
                    </div>
                    {isScheduled && (
                        <div className="flex gap-2 mt-2">
                            <input type="datetime-local" className="bg-black text-white p-3 rounded-xl w-full border border-white/10" onChange={(e) => setScheduleTime(e.target.value)} />
                        </div>
                    )}
                </div>

                <button onClick={handleSubmit} className="w-full bg-white text-black font-black py-4 rounded-2xl shadow-lg hover:bg-gray-200 transition active:scale-95 flex justify-between items-center px-6">
                    <span className="text-lg">{isScheduled ? "Schedule Booking" : `Confirm ${serviceType}`}</span>
                    <div className="bg-black text-white p-2 rounded-full"><ArrowRight size={20}/></div>
                </button>
            </div>
        </div>
        {!isExpanded && <div className="absolute bottom-24 left-4 right-4 z-[35]" onClick={() => setIsExpanded(true)}><div className="bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 p-4 rounded-full shadow-2xl flex items-center justify-between cursor-pointer"><div className="flex items-center gap-3"><div className="bg-green-500 text-black p-2 rounded-full"><Search size={18}/></div><span className="text-white font-bold text-sm">Where to?</span></div></div></div>}
    </>
  );
};
export default ServiceSelector;