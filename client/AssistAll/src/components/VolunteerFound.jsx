import React from 'react';
import { CheckCircle, Phone, MessageSquare } from 'lucide-react';

const VolunteerFound = ({ requestData, onReset }) => {
    return (
        <div className="absolute bottom-0 left-0 right-0 z-[2000] p-6 pb-12 bg-[#121212] rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom duration-500 text-center border-t border-white/10">
            
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)] animate-bounce">
                <CheckCircle size={40} className="text-green-500" />
            </div>

            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Volunteer Found!</h2>
            <p className="text-gray-400 mb-8 font-medium">{requestData?.volunteerName} is heading your way.</p>
            
            {/* Details Card */}
            <div className="bg-[#1a1a1a] p-5 rounded-2xl border border-white/5 flex items-center justify-between mb-8">
                <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-4 text-lg border-2 border-[#121212] shadow-lg">
                        {requestData?.volunteerName?.charAt(0)}
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-white text-lg leading-none">{requestData?.volunteerName}</p>
                        <p className="text-[10px] font-bold text-green-500 uppercase tracking-wider mt-1">Verified Partner</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Fare</p>
                    <p className="font-mono font-bold text-2xl text-green-400">₹{requestData?.price || 150}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <button className="bg-green-600 hover:bg-green-500 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition active:scale-95">
                    <Phone size={20}/> Call
                </button>
                <button className="bg-[#222] hover:bg-[#333] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition active:scale-95">
                    <MessageSquare size={20}/> Chat
                </button>
            </div>

            <button onClick={onReset} className="text-red-500 font-bold text-xs uppercase tracking-widest hover:text-red-400 transition">
                Cancel Request
            </button>
        </div>
    );
};
export default VolunteerFound;