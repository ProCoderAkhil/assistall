import React, { useState } from 'react';
import { Car, HeartHandshake, ShoppingBag, Pill, ArrowRight, Search, Zap, Calendar, MapPin, ChevronDown, Check } from 'lucide-react';

const ServiceSelector = ({ onClose, onFindClick }) => { 
  const [serviceType, setServiceType] = useState('Transport');
  const [selectedDest, setSelectedDest] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');

  const hospitals = [
      { name: "Government Medical College", dist: "2.4 km" },
      { name: "Caritas Hospital", dist: "4.1 km" },
      { name: "Matha Hospital", dist: "1.8 km" },
      { name: "General Hospital", dist: "3.5 km" },
      { name: "KIMS Health", dist: "5.2 km" },
      { name: "Mandiram Hospital", dist: "6.0 km" }
  ];

  const filteredHospitals = hospitals.filter(h => 
      h.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const services = [
      { id: 'Transport', label: 'Ride', icon: Car, surge: false },
      { id: 'Companion', label: 'Helper', icon: HeartHandshake, surge: false },
      { id: 'Medicine', label: 'Meds', icon: Pill, surge: true },
      { id: 'Groceries', label: 'Shop', icon: ShoppingBag, surge: false },
  ];

  const handleSubmit = () => {
      if(!selectedDest) return alert("Please select a destination");
      onFindClick({ 
          type: serviceType, 
          dropOff: selectedDest,
          isScheduled,
          scheduledTime: isScheduled ? scheduleTime : null
      });
  };

  return (
    <>
        <div className={`absolute left-0 right-0 bg-[#121212] rounded-t-[40px] shadow-2xl z-[40] border-t border-white/5 transition-all duration-500 ease-out ${isExpanded ? 'bottom-0 pb-24' : 'bottom-[-100%]'}`}>
            <div className="w-full flex justify-center pt-4 pb-2 cursor-pointer" onClick={() => setIsExpanded(false)}><div className="w-12 h-1.5 bg-neutral-700 rounded-full"></div></div>
            <div className="p-6 pt-2">
                
                {/* --- MODERN DROPDOWN --- */}
                <div className="relative mb-6">
                    <div 
                        className={`flex items-center bg-[#1a1a1a] p-4 rounded-2xl border transition-all cursor-pointer ${isDropdownOpen ? 'border-green-500 ring-1 ring-green-500/30' : 'border-white/10'}`}
                    >
                        <div className="bg-green-500/20 text-green-500 p-2 rounded-xl mr-3"><Search size={20}/></div>
                        <input 
                            type="text"
                            placeholder="Where to?" 
                            className="w-full bg-transparent outline-none font-bold text-lg text-white placeholder-gray-500 cursor-pointer"
                            value={selectedDest || searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setSelectedDest(''); 
                                setIsDropdownOpen(true);
                            }}
                            onClick={() => setIsDropdownOpen(true)}
                        />
                        <ChevronDown size={20} className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}/>
                    </div>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-3 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-50 animate-in fade-in zoom-in-95 scrollbar-hide">
                            {filteredHospitals.map((h, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => { setSelectedDest(h.name); setIsDropdownOpen(false); }}
                                    className="flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-neutral-800 p-2 rounded-full text-gray-400 group-hover:bg-green-500 group-hover:text-black transition"><MapPin size={16}/></div>
                                        <div>
                                            <p className="text-white font-bold text-sm">{h.name}</p>
                                            <p className="text-gray-500 text-xs">{h.dist} away</p>
                                        </div>
                                    </div>
                                    {selectedDest === h.name && <Check size={16} className="text-green-500"/>}
                                </div>
                            ))}
                            {filteredHospitals.length === 0 && (
                                <div className="p-4 text-center text-gray-500 text-sm">No locations found.</div>
                            )}
                        </div>
                    )}
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

                {/* Schedule Toggle */}
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