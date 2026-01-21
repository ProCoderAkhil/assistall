import React from 'react';
import { Home, User, History, ShieldAlert } from 'lucide-react';

const BottomNav = ({ activeTab, onHomeClick, onActivityClick, onProfileClick, onSOSClick }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#050505] border-t border-white/10 h-20 flex justify-around items-center z-[4000] shadow-[0_-5px_20px_rgba(0,0,0,0.5)] pb-2 backdrop-blur-md">
      
      {/* Home Button */}
      <button 
        onClick={onHomeClick}
        className={`flex flex-col items-center transition duration-300 ${activeTab === 'home' ? 'text-green-500 scale-110' : 'text-neutral-500 hover:text-white'}`}
      >
        <Home size={24} strokeWidth={activeTab === 'home' ? 3 : 2} />
        <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Home</span>
      </button>
      
      {/* Activity Button */}
      <button 
        onClick={onActivityClick}
        className={`flex flex-col items-center transition duration-300 ${activeTab === 'activity' ? 'text-green-500 scale-110' : 'text-neutral-500 hover:text-white'}`}
      >
        <History size={24} strokeWidth={activeTab === 'activity' ? 3 : 2} />
        <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Activity</span>
      </button>

      {/* The SOS Button (Popping out) */}
      <div className="relative -top-6">
        <button 
            onClick={onSOSClick}
            className="bg-red-600 text-white p-4 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)] border-[6px] border-[#050505] flex items-center justify-center animate-pulse active:scale-95 transition hover:bg-red-500"
        >
           <ShieldAlert size={28} fill="currentColor" className="text-white"/>
        </button>
      </div>

      {/* Profile Button */}
      <button 
        onClick={onProfileClick}
        className={`flex flex-col items-center transition duration-300 ${activeTab === 'profile' ? 'text-green-500 scale-110' : 'text-neutral-500 hover:text-white'}`}
      >
        <User size={24} strokeWidth={activeTab === 'profile' ? 3 : 2} />
        <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Profile</span>
      </button>
    </div>
  );
};

export default BottomNav;