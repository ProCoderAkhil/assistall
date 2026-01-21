const express = require('express');
const router = express.Router();
const Request = require('../models/Request');

// --- 1. RESET DATABASE (For Testing) ---
router.delete('/reset', async (req, res) => {
    try {
        await Request.deleteMany({});
        res.json({ message: "Reset Successful" });
    } catch (err) { res.status(500).json({ message: "Reset Failed" }); }
});

// --- 2. GET REQUESTS ---
router.get('/', async (req, res) => {
    try {
        const { volunteer } = req.query;
        let query = {};

        // If a volunteer is querying, show available rides + their active rides
        if (volunteer) {
             query = {
                 $or: [
                     { status: 'pending' },
                     { status: 'accepted', volunteerName: volunteer },
                     { status: 'in_progress', volunteerName: volunteer },
                     // Include recently completed so they don't vanish instantly
                     { status: 'completed', volunteerName: volunteer } 
                 ]
             };
        }
        
        // Return requests sorted by newest first
        const requests = await Request.find(query).sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) { res.status(500).json({ message: "Error fetching requests" }); }
});

// --- 3. CREATE RIDE ---
router.post('/', async (req, res) => {
    try {
        const newRequest = new Request({
            requesterName: req.body.requesterName || "User",
            requesterId: req.body.requesterId, // Ensure ID is saved
            type: req.body.type || 'Ride',
            price: req.body.price || 0,
            status: 'pending',
            pickup: req.body.pickup || "Kottayam",
            drop: req.body.drop || "Hospital",
            createdAt: Date.now()
        });
        await newRequest.save();
        res.status(201).json(newRequest);
    } catch (err) { res.status(500).json({ message: "Failed to create request" }); }
});

// --- 4. RIDE ACTIONS (Handle All Status Changes) ---
router.put('/:id/:action', async (req, res) => {
    try {
        const { action } = req.params;
        const ride = await Request.findById(req.params.id);
        
        if (!ride) return res.status(404).json({ message: "Not Found" });

        // 1. Volunteer Accepts
        if (action === 'accept') {
            if (ride.status !== 'pending') return res.status(400).json({ message: "Ride already taken" });
            ride.status = 'accepted';
            ride.volunteerName = req.body.volunteerName;
            ride.volunteerId = req.body.volunteerId;
        } 
        
        // 2. Volunteer Starts Trip
        else if (action === 'pickup') {
            ride.status = 'in_progress';
        }
        
        // 3. Volunteer Completes Trip
        else if (action === 'complete') {
            ride.status = 'completed';
        }

        // 4. User Cancels (Missing in your code)
        else if (action === 'cancel') {
            ride.status = 'cancelled';
        }

        // 5. User Reviews (Missing in your code)
        else if (action === 'review') {
            ride.rating = req.body.rating;
            ride.review = req.body.review;
            ride.tip = req.body.tip;
            ride.paymentMethod = req.body.paymentMethod;
        }

        await ride.save();
        res.json(ride);
    } catch (err) { 
        console.error("Update Error:", err);
        res.status(500).json({ message: "Update Error" }); 
    }
});

module.exports = router;