import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

// Props passed from App.jsx's Router
const Login = ({ onLogin, onBack, onSignupClick, onVolunteerClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- AUTO URL ---
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
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        // SUCCESS: Pass data up to App.jsx
        onLogin(data.user, data.token);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Connection failed. Server might be sleeping (wait 30s).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#121212] p-8 rounded-3xl border border-neutral-800 shadow-2xl animate-in slide-in-from-bottom duration-500">
        
        <button onClick={onBack} className="mb-6 text-neutral-400 hover:text-white transition">
            &larr; Back
        </button>

        <h2 className="text-3xl font-black mb-2">Welcome Back</h2>
        <p className="text-neutral-500 mb-8">Enter your credentials to continue.</p>

        {error && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3 text-sm font-bold">
                <AlertCircle size={18} />
                {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-4 top-4 text-neutral-500 group-focus-within:text-white transition" size={20} />
            <input 
              type="email" placeholder="Email Address" 
              className="w-full bg-[#1a1a1a] border border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition"
              value={email} onChange={(e) => setEmail(e.target.value)} required 
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-4 text-neutral-500 group-focus-within:text-white transition" size={20} />
            <input 
              type="password" placeholder="Password" 
              className="w-full bg-[#1a1a1a] border border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition"
              value={password} onChange={(e) => setPassword(e.target.value)} required 
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl mt-4 flex items-center justify-center gap-2 hover:bg-gray-200 transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Sign In <ArrowRight size={20} /></>}
          </button>
        </form>

        <div className="mt-8 text-center">
            <p className="text-neutral-500 text-sm">Don't have an account?</p>
            <div className="flex justify-center gap-4 mt-2">
                <button onClick={onSignupClick} className="text-white font-bold hover:underline">User Signup</button>
                <span className="text-neutral-600">|</span>
                <button onClick={onVolunteerClick} className="text-green-500 font-bold hover:underline">Volunteer</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;