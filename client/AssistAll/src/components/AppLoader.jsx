import React, { useState, useEffect } from 'react';
import { Shield, Zap, Radio, CheckCircle, Server, Lock, Cpu } from 'lucide-react';

const AppLoader = () => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  // ✅ FIX: Use 'Cpu' icon instead of the undefined 'Power' variable
  const loadingSteps = [
    { text: "INITIALIZING CORE SYSTEMS...", icon: Cpu },
    { text: "ESTABLISHING SECURE UPLINK...", icon: Lock },
    { text: "CALIBRATING GPS SATELLITES...", icon: Radio },
    { text: "VERIFYING USER CREDENTIALS...", icon: Shield },
    { text: "SYNCING VOLUNTEER NETWORK...", icon: Server },
    { text: "ASSISTALL V5 READY.", icon: CheckCircle }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(timer);
          return 100;
        }
        return Math.min(old + Math.random() * 15, 100);
      });
    }, 50);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const stepIndex = Math.floor((progress / 100) * (loadingSteps.length - 1));
    setCurrentStep(stepIndex);
  }, [progress]);

  // Safe icon retrieval
  const StepIcon = loadingSteps[currentStep]?.icon || Shield;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#020202] flex flex-col items-center justify-center font-sans overflow-hidden text-white selection:bg-green-500/30">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[120px] animate-pulse"></div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-48 h-48 mb-12 flex items-center justify-center">
            <div className="absolute inset-0 border border-green-500/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
            <div className="absolute inset-0 border-t border-green-500/60 rounded-full animate-[spin_10s_linear_infinite] shadow-[0_0_20px_rgba(34,197,94,0.2)]"></div>
            <div className="absolute inset-4 border border-blue-500/20 rounded-full animate-[spin_5s_linear_infinite_reverse]"></div>
            <div className="absolute inset-4 border-r border-l border-blue-500/60 rounded-full animate-[spin_5s_linear_infinite_reverse] shadow-[0_0_15px_rgba(59,130,246,0.3)]"></div>
            <div className="absolute inset-10 border-2 border-dashed border-white/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
            
            <div className="relative w-20 h-20 bg-black rounded-full flex items-center justify-center border border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.15)] z-20">
                <div className="absolute inset-0 bg-green-500/10 rounded-full animate-ping"></div>
                <Shield size={32} className="text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
            </div>
        </div>

        <div className="w-80 text-center space-y-6">
            <h1 className="text-3xl font-black tracking-tighter text-white flex items-center justify-center gap-2">
                ASSIST<span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">ALL</span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-400 font-mono tracking-widest border border-white/5">V5.0</span>
            </h1>

            <div className="h-10 flex items-center justify-center gap-3 text-green-400/80 font-mono text-xs font-bold tracking-widest uppercase animate-pulse">
                <StepIcon size={14} />
                {loadingSteps[currentStep]?.text}
            </div>

            <div className="relative w-full h-1.5 bg-[#111] rounded-full overflow-hidden border border-white/10">
                <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-600 via-green-400 to-white transition-all duration-100 ease-out shadow-[0_0_20px_#22c55e]"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AppLoader;