import React, { useEffect, useState } from 'react';
import { Clock, RotateCcw, CheckCircle, Loader2, AlertCircle, MapPin } from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://assistall-server.onrender.com';

const ActivityHistory = ({ user }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH HISTORY ---
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/requests`);
        if (res.ok) {
          const data = await res.json();
          // Filter requests for the current logged-in user
          const userRequests = data.filter(req => req.requesterId === user._id);
          
          setHistory(userRequests);
        }
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchHistory();
  }, [user]);

  // --- DATE FORMATTER ---
  const formatDate = (dateString) => {
      const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  return (
    <div className="flex-grow overflow-y-auto pb-32 font-sans text-white">
        {/* Header */}
        <div className="p-6 pt-12 pb-6 border-b border-white/5 bg-[#0a0a0a] sticky top-0 z-10">
            <h1 className="text-3xl font-black tracking-tight mb-1">Your Activity</h1>
            <p className="text-neutral-500 text-sm font-medium">Recent trips and requests</p>
        </div>

        {/* List */}
        <div className="p-6 space-y-4">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                    <Loader2 size={32} className="animate-spin mb-4 text-green-500"/>
                    <p className="text-xs font-bold tracking-widest uppercase">Loading History...</p>
                </div>
            ) : history.length === 0 ? (
                <div className="text-center py-20 bg-[#121212] rounded-3xl border border-white/5">
                    <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock size={32} className="text-neutral-600"/>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">No Activity Yet</h3>
                    <p className="text-neutral-500 text-sm">Your completed rides will appear here.</p>
                </div>
            ) : (
                history.map((item) => (
                    <div key={item._id} className="bg-[#121212] p-5 rounded-3xl border border-white/5 hover:border-white/10 transition group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-2xl ${item.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                    {item.status === 'completed' ? <CheckCircle size={20}/> : <Clock size={20}/>}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                        {item.drop || "General Trip"}
                                    </h3>
                                    <p className="text-neutral-500 text-xs font-medium">{formatDate(item.createdAt)}</p>
                                </div>
                            </div>
                            <span className="font-mono font-bold text-white bg-[#1a1a1a] px-3 py-1 rounded-lg border border-white/5">
                                ₹{item.price || 150}
                            </span>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/5 pt-4">
                            <div className="flex items-center gap-2">
                                {item.status === 'completed' ? (
                                    <span className="text-xs font-bold text-green-500 uppercase tracking-wider flex items-center gap-1">
                                        Completed
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1">
                                        {item.status.replace('_', ' ')}
                                    </span>
                                )}
                                <span className="text-neutral-600 text-xs">• {item.volunteerName || "Finding..."}</span>
                            </div>
                            
                            {/* Rebook Button (Visual Only for now) */}
                            <button className="flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-white transition">
                                <RotateCcw size={14}/> Rebook
                            </button>
                        </div>
                    </div>
                ))
            )}
            
            {!loading && history.length > 0 && (
                <div className="text-center mt-8">
                    <button className="text-neutral-500 text-xs font-bold uppercase tracking-widest hover:text-white transition">End of List</button>
                </div>
            )}
        </div>
    </div>
  );
};

export default ActivityHistory;