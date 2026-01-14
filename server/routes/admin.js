const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Request = require('../models/Request');

// 1. GET PENDING VOLUNTEERS (Fix for your issue)
router.get('/pending-volunteers', async (req, res) => {
    try {
        // Fetch users who are volunteers AND pending
        const volunteers = await User.find({ 
            role: 'volunteer', 
            verificationStatus: 'pending' 
        }).sort({ createdAt: -1 }); // Newest first
        res.json(volunteers);
    } catch (err) { res.status(500).json({ message: "Server Error" }); }
});

// 2. GET ALL USERS (For User Dashboard)
router.get('/all-users', async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) { res.status(500).json({ message: "Server Error" }); }
});

// 3. GET ACTIVE SOS ALERTS (For SOS Dashboard)
router.get('/sos-alerts', async (req, res) => {
    try {
        // Assuming requests with 'in_progress' might be SOS candidates, 
        // or we filter by specific SOS flag if you add one later.
        // For now, we return active rides as "Safety Monitoring"
        const alerts = await Request.find({ status: 'in_progress' }).sort({ createdAt: -1 });
        res.json(alerts);
    } catch (err) { res.status(500).json({ message: "Server Error" }); }
});

// 4. VERIFY VOLUNTEER ACTION
router.put('/verify/:id', async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        const isVerified = status === 'approved';
        
        await User.findByIdAndUpdate(req.params.id, { 
            verificationStatus: status,
            isVerified: isVerified
        });
        
        res.json({ message: `Volunteer ${status}` });
    } catch (err) { res.status(500).json({ message: "Server Error" }); }
});

// 5. BAN USER
router.put('/ban-user/:id', async (req, res) => {
    try {
        // Toggle active status (assuming you add an isActive field later, or verify logic)
        await User.findByIdAndUpdate(req.params.id, { isVerified: false }); 
        res.json({ message: "User Suspended" });
    } catch (err) { res.status(500).json({ message: "Server Error" }); }
});

module.exports = router;