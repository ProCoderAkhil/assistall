import React, { useState } from 'react';
import { User, Mail, Phone, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

const UserSignup = ({ onRegister, onBack }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ⚠️ FIXED URL: Ensures it goes to Render HTTPS
  const API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000' 
      : 'https://assistall-server.onrender.com';

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        onRegister(data.user || data);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#121212] p-8 rounded-3xl border border-neutral-800 shadow-2xl">
        <button onClick={onBack} className="mb-6 text-neutral-400 hover:text-white transition">&larr; Back</button>
        <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-900/20">
                <span className="text-3xl font-black text-white">+</span>
            </div>
            <h2 className="text-3xl font-black mb-2">Join AssistAll</h2>
            <p className="text-neutral-500">Start your journey to independence.</p>
        </div>

        {error && <div className="bg-red-900/20 text-red-400 p-4 rounded-xl mb-6 flex gap-3 text-sm font-bold"><AlertCircle size={18} />{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative group"><User className="absolute left-4 top-4 text-neutral-500" size={20} /><input type="text" placeholder="Full Name" className="w-full bg-[#1a1a1a] border border-neutral-800 rounded-2xl py-4 pl-12 text-white" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
          <div className="relative group"><Mail className="absolute left-4 top-4 text-neutral-500" size={20} /><input type="email" placeholder="Email Address" className="w-full bg-[#1a1a1a] border border-neutral-800 rounded-2xl py-4 pl-12 text-white" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div>
          <div className="relative group"><Phone className="absolute left-4 top-4 text-neutral-500" size={20} /><input type="text" placeholder="Phone Number" className="w-full bg-[#1a1a1a] border border-neutral-800 rounded-2xl py-4 pl-12 text-white" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required /></div>
          <div className="relative group"><Lock className="absolute left-4 top-4 text-neutral-500" size={20} /><input type="password" placeholder="Password" className="w-full bg-[#1a1a1a] border border-neutral-800 rounded-2xl py-4 pl-12 text-white" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required /></div>
          <button type="submit" disabled={loading} className="w-full bg-white text-black font-bold py-4 rounded-2xl mt-4 flex justify-center gap-2">{loading ? <Loader2 className="animate-spin" /> : <>Create Account <ArrowRight size={20} /></>}</button>
        </form>
      </div>
    </div>
  );
};

export default UserSignup;