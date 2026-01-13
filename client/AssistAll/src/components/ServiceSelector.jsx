import React, { useState } from 'react';
import { Car, HeartHandshake, Home, Briefcase, ShoppingBag, Pill, ArrowRight, Search, Zap, ChevronUp, MapPin } from 'lucide-react';

const ServiceSelector = ({ onClose, onFindClick, user }) => { 
  const [serviceType, setServiceType] = useState('Transport');
  const [dropOff, setDropOff] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  // 🏥 LIST OF HOSPITALS (Searchable Dropdown)
  const hospitals = [
      "Government Medical College, Kottayam",
      "Caritas Hospital, Thellakom",
      "Matha Hospital, Thellakom",
      "General Hospital, Kottayam",
      "KIMS Health, Kudamaloor",
      "Mandiram Hospital, Manganam",
      "Bharath Hospital, Kottayam",
      "S H Medical Centre, Nagampadam",
      "Mitera Hospital, Thellakom",
      "Indo-American Hospital, Vaikom",
      "Marian Medical Centre, Pala",
      "St. Thomas Hospital, Chethipuzha"
  ];

  const services = [
      { id: 'Transport', label: 'Ride', icon: Car, time: '3 min', price: '₹40+', surge: false },
      { id: 'Companion', label: 'Helper', icon: HeartHandshake, time: '10 min', price: '₹150/h', surge: false },
      { id: 'Medicine', label: 'Meds', icon: Pill, time: '30 min', price: 'Delivery', surge: true },
      { id: 'Groceries', label: 'Shop', icon: ShoppingBag, time: '45 min', price: 'Delivery', surge: false },
  ];

  return (
    <>
        {/* --- DRAWER --- */}
        <div className={`absolute left-0 right-0 bg-[#121212] rounded-t-[40px] shadow-2xl z-[40] border-t border-white/5 transition-all duration-500 ease-out ${isExpanded ? 'bottom-0 pb-24' : 'bottom-[-100%] pointer-events-none'}`}>
            
            <div className="w-full flex justify-center pt-4 pb-2 cursor-pointer" onClick={() => setIsExpanded(false)}>
                <div className="w-12 h-1.5 bg-neutral-700 rounded-full"></div>
            </div>

            <div className="p-6 pt-2">
                {/* 🏥 HOSPITAL SEARCH INPUT */}
                <div className="relative mb-8 group">
                    <div className="bg-[#1a1a1a] p-4 rounded-2xl flex items-center border border-white/5 focus-within:border-green-500 transition-all shadow-lg">
                        <div className="bg-green-600/20 text-green-500 p-2 rounded-xl mr-3"><Search size={20}/></div>
                        <input 
                            type="text" 
                            list="hospital-list" // Connects to the datalist below
                            placeholder="Where to? (e.g. Medical College)" 
                            className="w-full bg-transparent outline-none font-bold text-lg text-white placeholder-neutral-600" 
                            value={dropOff} 
                            onChange={(e) => setDropOff(e.target.value)}
                        />
                    </div>
                    {/* Native Datalist for Dropdown Suggestions */}
                    <datalist id="hospital-list">
                        {hospitals.map((h, i) => <option key={i} value={h} />)}
                    </datalist>
                </div>

                {/* Service Grid */}
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 ml-1">Select Service</p>
                <div className="grid grid-cols-4 gap-3 mb-8">
                    {services.map(s => (
                        <button key={s.id} onClick={() => setServiceType(s.id)} className={`flex flex-col items-center p-2 py-4 rounded-2xl border transition-all active:scale-95 duration-300 relative ${serviceType === s.id ? 'border-green-500 bg-green-500/10' : 'border-white/5 bg-[#1a1a1a]'}`}>
                            {s.surge && <div className="absolute top-2 right-2"><Zap size={10} className="text-yellow-500 fill-current animate-pulse"/></div>}
                            <s.icon size={28} className={`mb-3 ${serviceType === s.id ? 'text-green-400' : 'text-gray-400'}`}/>
                            <span className={`text-[10px] font-bold ${serviceType === s.id ? 'text-white' : 'text-gray-500'}`}>{s.label}</span>
                        </button>
                    ))}
                </div>

                <button onClick={() => { if(!dropOff) return alert("Please enter a destination"); onFindClick({ type: serviceType, dropOff }); }} className="w-full bg-white text-black font-black py-4 rounded-2xl shadow-lg hover:bg-gray-200 transition active:scale-95 flex justify-between items-center px-6">
                    <span className="text-lg">Confirm {serviceType}</span>
                    <div className="bg-black text-white p-2 rounded-full"><ArrowRight size={20}/></div>
                </button>
            </div>
        </div>

        {/* --- FLOATING TRIGGER (When Closed) --- */}
        <div className={`absolute bottom-24 left-4 right-4 z-[35] transition-all duration-500 ${!isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
            <div onClick={() => setIsExpanded(true)} className="bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 p-4 rounded-full shadow-2xl flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                    <div className="bg-green-500 text-black p-2 rounded-full"><Search size={18}/></div>
                    <span className="text-white font-bold text-sm">Where to?</span>
                </div>
            </div>
        </div>
    </>
  );
};
export default ServiceSelector;