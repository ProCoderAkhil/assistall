import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, X, Info } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
  // State to manage the progress bar width
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = 4000;
    const intervalTime = 10;
    const step = (100 * intervalTime) / duration;

    // Timer for the progress bar
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) return 0;
        return prev - step;
      });
    }, intervalTime);

    // Timer to close the toast
    const closeTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(closeTimer);
    };
  }, []);

  const handleClose = () => {
    setIsExiting(true); // Trigger exit animation
    setTimeout(onClose, 300); // Wait for animation to finish before unmounting
  };

  const config = {
    info: { icon: Info, bg: 'bg-blue-600', border: 'border-blue-400', shadow: 'shadow-blue-900/20' },
    success: { icon: CheckCircle, bg: 'bg-green-600', border: 'border-green-400', shadow: 'shadow-green-900/20' },
    error: { icon: AlertTriangle, bg: 'bg-red-600', border: 'border-red-400', shadow: 'shadow-red-900/20' },
  };

  const { icon: Icon, bg, border, shadow } = config[type] || config.info;

  return (
    <div 
        className={`
            relative overflow-hidden flex items-start w-80 p-4 rounded-2xl 
            text-white font-sans border-t border-l border-white/20 backdrop-blur-xl ${bg} ${shadow} shadow-2xl
            transform transition-all duration-300 ease-out
            ${isExiting ? 'translate-y-[-20px] opacity-0 scale-95' : 'translate-y-0 opacity-100 scale-100 animate-in slide-in-from-top-8 fade-in zoom-in-95'}
            hover:scale-[1.02] hover:shadow-3xl cursor-pointer group
        `}
        role="alert"
    >
      {/* Animated Icon */}
      <div className="mr-4 p-2 rounded-full bg-white/20 backdrop-blur-md animate-bounce">
        <Icon size={20} strokeWidth={3} className="drop-shadow-md" />
      </div>

      <div className="flex-grow pt-1">
        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-75 mb-0.5">{type}</h4>
        <p className="text-sm font-bold leading-tight shadow-black drop-shadow-sm">{message}</p>
      </div>

      {/* Close Button with Rotate Animation */}
      <button 
        onClick={handleClose} 
        className="p-1.5 rounded-full hover:bg-white/20 transition-all duration-300 group-hover:rotate-90 active:scale-90"
      >
        <X size={16} strokeWidth={3} />
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-white/40 transition-all duration-75 ease-linear" style={{ width: `${progress}%` }}></div>
      
      {/* Shine Effect */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
    </div>
  );
};

export default Toast;