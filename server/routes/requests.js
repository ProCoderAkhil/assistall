const express = require('express');
const router = express.Router();
const Request = require('../models/Request');

// GET REQUESTS
router.get('/', async (req, res) => {
    try {
        const twentyFourHoursAgo = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
        const requests = await Request.find({
            $or: [
                { status: 'pending', createdAt: { $gte: twentyFourHoursAgo } },
                { status: { $in: ['accepted', 'in_progress'] } }
            ]
        }).sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (err) { res.status(500).json({ message: "Server Error" }); }
});

// CREATE REQUEST (Generate OTP)
router.post('/', async (req, res) => {
    try {
        // ✅ NEW: Generate 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        
        const newRequest = new Request({
            ...req.body,
            pickupOTP: otp
        });
        const savedRequest = await newRequest.save();
        res.status(201).json(savedRequest);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// UPDATE STATUS (With OTP Check)
router.put('/:id/:action', async (req, res) => {
    try {
        const { action } = req.params;
        const { volunteerId, volunteerName, otp } = req.body; // Receive OTP
        const request = await Request.findById(req.params.id);

        if (!request) return res.status(404).json({ message: "Request not found" });

        if (action === 'accept') {
            request.status = 'accepted';
            request.volunteerId = volunteerId;
            request.volunteerName = volunteerName;
        } 
        else if (action === 'pickup') {
            // ✅ NEW: Verify OTP
            if (request.pickupOTP !== otp) {
                return res.status(400).json({ message: "Incorrect OTP" });
            }
            request.status = 'in_progress';
        } 
        else if (action === 'complete') {
            request.status = 'completed';
        }

        await request.save();
        res.json(request);
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
});

// GET LEADERBOARD
router.get('/leaderboard', async (req, res) => {
    try {
        const stats = await Request.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: "$volunteerName", rides: { $sum: 1 }, earnings: { $sum: "$price" } } },
            { $sort: { rides: -1 } },
            { $limit: 5 }
        ]);
        res.json(stats);
    } catch (err) { res.status(500).json({ message: "Server Error" }); }
});

module.exports = router;