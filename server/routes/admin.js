const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 1. GET VOLUNTEERS (Fixes "No Request" - fetches all so none are hidden)
router.get('/volunteers', async (req, res) => {
    try {
        const volunteers = await User.find({ role: 'volunteer' }).sort({ createdAt: -1 });
        res.json(volunteers);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// 2. GENERATE OTP
router.post('/generate-code', async (req, res) => {
    try {
        const { userId } = req.body;
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save code to user
        await User.findByIdAndUpdate(userId, { interviewCode: code });
        
        res.json({ success: true, code });
    } catch (err) {
        res.status(500).json({ message: "Code Gen Failed" });
    }
});

// 3. FORCE APPROVE
router.put('/verify/:id', async (req, res) => {
    try {
        const { status } = req.body; // 'approved'
        const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Update Failed" });
    }
});

// 4. ALL USERS
router.get('/all-users', async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;