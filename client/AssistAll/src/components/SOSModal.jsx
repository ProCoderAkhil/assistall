import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Phone } from 'lucide-react';

const SOSModal = ({ isOpen, onClose, onConfirm }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer;
    if (isOpen && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    } else if (isOpen && countdown === 0) {
      onConfirm(); // Trigger actual alert
    }
    return () => clearInterval(timer);
  }, [isOpen, countdown, onConfirm]);

  useEffect(() => { if (isOpen) setCountdown(5); }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-red-900/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
      <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8 animate-pulse shadow-[0_0_50px_rgba(255,255,255,0.5)]">
        <AlertTriangle size={64} className="text-red-600" />
      </div>
      
      <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Emergency Alert</h2>
      <p className="text-red-200 text-lg mb-8 max-w-xs mx-auto">Sending live location to Police and Contacts in...</p>
      
      <div className="text-8xl font-black text-white mb-12 font-mono tabular-nums">
        {countdown}
      </div>

      <button 
        onClick={onClose} 
        className="w-full max-w-sm bg-white text-red-600 font-black py-5 rounded-2xl text-xl shadow-2xl active:scale-95 transition-transform flex items-center justify-center gap-3"
      >
        <X size={28} strokeWidth={3}/> CANCEL ALERT
      </button>
      
      <p className="mt-8 text-white/50 text-sm font-bold uppercase tracking-widest">Keep screen open</p>
    </div>
  );
};

export default SOSModal;