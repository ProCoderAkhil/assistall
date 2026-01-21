import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

// --- CUSTOM STYLES (Matches Landing Page) ---
const styles = `
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob { animation: blob 7s infinite; }
  .animation-delay-2000 { animation-delay: 2s; }
  .animation-delay-4000 { animation-delay: 4s; }
  .glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); }
  .input-glass { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: white; }
  .input-glass:focus { border-color: #22c55e; background: rgba(255, 255, 255, 0.08); }
`;

const Login = ({ onLogin, onBack, onSignupClick, onVolunteerClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000' 
      : 'https://assistall-server.onrender.com'; 

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email: email.trim(), 
            password: password.trim() 
        })
      });

      const data = await res.json();

      if (res.ok) {
        onLogin(data.user || data, data.token || data.accessToken);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Server might be sleeping (Free Tier). Try again in 30s.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white font-sans flex items-center justify-center p-4 relative overflow-hidden selection:bg-green-500/30">
      <style>{styles}</style>

      {/* --- ANIMATED BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-4000"></div>
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/90 to-[#050505]"></div>
      </div>

      {/* --- LOGIN CARD --- */}
      <div className="w-full max-w-md glass-card p-8 rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-500 relative z-10">
        
        {/* Back Button */}
        <button 
            onClick={onBack} 
            className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition group text-sm font-bold uppercase tracking-widest"
        >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Back
        </button>

        {/* Header */}
        <div className="mb-8">
            <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-gray-400">Enter your credentials to access the platform.</p>
        </div>

        {/* Error Message */}
        {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl mb-6 flex items-start gap-3 text-sm font-medium animate-in slide-in-from-top-2">
                <AlertCircle size={20} className="shrink-0 mt-0.5" /> 
                <span>{error}</span>
            </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" size={20} />
            <input 
              type="email" 
              placeholder="Email Address" 
              className="w-full input-glass rounded-2xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-gray-600" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full input-glass rounded-2xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-gray-600" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-white text-black hover:bg-gray-200 font-bold py-4 rounded-2xl mt-4 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-white/5"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Sign In <ArrowRight size={20} /></>}
          </button>
        </form>

        {/* Footer / Links */}
        <div className="mt-10 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-500 text-sm mb-4">Don't have an account?</p>
            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={onSignupClick} 
                    className="py-3 rounded-xl border border-white/10 hover:border-green-500/50 hover:bg-green-500/10 text-gray-300 hover:text-green-400 text-sm font-bold transition"
                >
                    User Signup
                </button>
                <button 
                    onClick={onVolunteerClick} 
                    className="py-3 rounded-xl border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 text-gray-300 hover:text-blue-400 text-sm font-bold transition"
                >
                    Volunteer
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Login;