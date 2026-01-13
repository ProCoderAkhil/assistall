import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, CheckCircle, Navigation, Star, Phone, Shield, User, Share2, MessageSquare, ChevronUp, Loader2, X } from 'lucide-react';
import ServiceSelector from './ServiceSelector';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://assistall-server.onrender.com';

// ... (Sub-components: StatusBanner, FindingVolunteer, ArrivingView, RideInProgress, RateAndTip - keep as provided previously, or see below if needed) ...
// For brevity, assuming you have the sub-components. If not, they are standard.

// MAIN CONTROLLER (Fixes Looping & Dropoff)
const UserDashboard = () => {
    const [viewState, setViewState] = useState('menu'); 
    const [activeRide, setActiveRide] = useState(null);
    const pollRef = useRef(null);

    // PERSISTENCE CHECK (On Load)
    useEffect(() => {
        const savedId = localStorage.getItem('activeRideId');
        if (savedId) {
            setViewState('searching'); // Show loading initially
            startPolling(savedId);
        }
    }, []);

    // 1. REQUEST HANDLER
    const handleRequest = async (requestDetails) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const res = await fetch(`${API_BASE}/api/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    requesterName: user?.name || "User", 
                    requesterId: user?._id,
                    type: requestDetails.type, 
                    price: 150, 
                    pickup: "Kottayam", 
                    drop: requestDetails.dropOff // ⚠️ Sending Hospital Name correctly
                })
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('activeRideId', data._id); // Save ID
                setViewState('searching');
                startPolling(data._id);
            }
        } catch (e) { alert("Connection Error"); }
    };

    // 2. POLLING ENGINE (Prevent Loops)
    const startPolling = (id) => {
        if (pollRef.current) clearTimeout(pollRef.current);
        
        const poll = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/requests?t=${Date.now()}`); // Prevent caching
                if (res.ok) {
                    const data = await res.json();
                    const myRide = data.find(r => r._id === id);
                    
                    if (myRide) {
                        setActiveRide(myRide);
                        
                        // 🔒 STRICT STATE TRANSITIONS
                        if (myRide.status === 'accepted' && viewState !== 'active_ride') setViewState('active_ride');
                        if (myRide.status === 'in_progress' && viewState !== 'active_ride') setViewState('active_ride');
                        if (myRide.status === 'completed' && viewState !== 'completed') {
                            setViewState('completed');
                            localStorage.removeItem('activeRideId');
                            return; // Stop polling
                        }
                    }
                }
            } catch (e) {}
            pollRef.current = setTimeout(poll, 3000);
        };
        poll();
    };

    const handleReset = () => {
        if (pollRef.current) clearTimeout(pollRef.current);
        localStorage.removeItem('activeRideId');
        setViewState('menu');
        window.location.reload();
    };

    return (
        <div className="h-screen bg-neutral-100 text-black font-sans flex flex-col relative overflow-hidden">
            {/* ... Header & Map (Keep existing) ... */}
            
            {/* VIEWS */}
            {viewState === 'menu' && (
                <ServiceSelector onFindClick={handleRequest} />
            )}

            {viewState === 'searching' && <FindingVolunteer onCancel={handleReset} />}

            {viewState === 'active_ride' && activeRide?.status === 'accepted' && (
                <ArrivingView volunteerName={activeRide.volunteerName || "Volunteer"} />
            )}

            {viewState === 'active_ride' && activeRide?.status === 'in_progress' && (
                <RideInProgress requestData={activeRide} />
            )}

            {viewState === 'completed' && (
                <RateAndTip requestData={activeRide} onSkip={handleReset} onSubmit={handleReset} />
            )}
        </div>
    );
};

export default UserDashboard;