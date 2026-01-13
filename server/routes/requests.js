const express = require('express');
const router = express.Router();
const Request = require('../models/Request');

// 1. GET ALL REQUESTS
router.get('/', async (req, res) => {
    try {
        const requests = await Request.find().sort({ isScheduled: -1, scheduledTime: 1, createdAt: -1 });
        res.status(200).json(requests);
    } catch (err) { res.status(500).json({ message: "Server Error" }); }
});

// 2. CREATE REQUEST (Supports Scheduling)
router.post('/', async (req, res) => {
    try {
        const newRequest = new Request({
            ...req.body,
            status: 'pending'
        });
        const savedRequest = await newRequest.save();
        res.status(201).json(savedRequest);
    } catch (err) { res.status(500).json({ message: "Failed to create request" }); }
});

// 3. REPORT ISSUE (Safety)
router.post('/:id/report', async (req, res) => {
    try {
        await Request.findByIdAndUpdate(req.params.id, {
            $push: { reports: { by: req.body.by, reason: req.body.reason } }
        });
        res.json({ message: "Report logged. Admin notified." });
    } catch (err) { res.status(500).json(err); }
});

// 4. LEADERBOARD (Gamification)
router.get('/leaderboard', async (req, res) => {
    try {
        const leaderboard = await Request.aggregate([
            { $match: { status: 'completed' } },
            { $group: { 
                _id: "$volunteerName", 
                rides: { $sum: 1 }, 
                earnings: { $sum: "$price" },
                rating: { $avg: "$rating" }
            }},
            { $sort: { rides: -1 } },
            { $limit: 10 }
        ]);
        res.json(leaderboard);
    } catch (err) { res.status(500).json(err); }
});

// ... (Keep existing Accept, Pickup, Complete, Review routes) ...
// 5. RIDE ACTIONS
router.put('/:id/:action', async (req, res) => {
    try {
        const { action } = req.params;
        const ride = await Request.findById(req.params.id);
        if (!ride) return res.status(404).json({ message: "Not Found" });

        if (action === 'accept') {
            if (ride.status !== 'pending') return res.status(400).json({ message: "Taken" });
            ride.status = 'accepted';
            ride.volunteerName = req.body.volunteerName;
            ride.volunteerId = req.body.volunteerId;
        } else if (action === 'pickup') {
            ride.status = 'in_progress';
        } else if (action === 'complete') {
            ride.status = 'completed';
        }
        await ride.save();
        res.json(ride);
    } catch (err) { res.status(500).json({ message: "Action Failed" }); }
});

router.put('/:id/review', async (req, res) => {
    try {
        const updated = await Request.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) { res.status(500).json(err); }
});

module.exports = router;