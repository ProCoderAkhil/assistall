import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

const AppLoader = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(timer);
          return 100;
        }
        return Math.min(old + Math.random() * 15, 100);
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center font-sans overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-12 w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-t-green-500 border-r-transparent border-b-green-500/30 border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-4 border-2 border-t-transparent border-r-blue-500 border-b-transparent border-l-blue-500/50 rounded-full animate-spin [animation-direction:reverse]"></div>
            <Shield size={48} className="text-white drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]" />
        </div>
        <div className="w-64 text-center">
            <h2 className="text-2xl font-black text-white mb-2 tracking-tighter">
                ASSIST<span className="text-green-500">ALL</span>
            </h2>
            <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden border border-neutral-800">
                <div className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-200 ease-out shadow-[0_0_10px_#22c55e]" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-[10px] text-gray-500 mt-2 font-mono font-bold tracking-widest">SYSTEM ONLINE {Math.round(progress)}%</p>
        </div>
      </div>
    </div>
  );
};

export default AppLoader;