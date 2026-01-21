const express = require('express');
const router = express.Router();
const User = require('../models/User');

// --- 1. GET ALL VOLUNTEERS (Fixes "No Request" Issue) ---
// This fetches EVERYONE with role='volunteer' so nobody is hidden.
router.get('/volunteers', async (req, res) => {
    try {
        const volunteers = await User.find({ role: 'volunteer' }).sort({ createdAt: -1 });
        res.json(volunteers);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

// --- 2. GENERATE INTERVIEW CODE (Fixes "No OTP" Issue) ---
router.post('/generate-code', async (req, res) => {
    try {
        const { userId } = req.body;
        // Generate a random 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save this code to the user's record so they can verify it
        // Note: Ensure your User model has an 'interviewCode' field or use a temporary field
        // If your User schema is strict, you might need to add interviewCode: String to models/User.js
        // For now, we will assume we can update it or use a generic field.
        await User.findByIdAndUpdate(userId, { interviewCode: code });
        
        res.json({ code });
    } catch (err) {
        res.status(500).json({ message: "Code Generation Failed" });
    }
});

// --- 3. FORCE APPROVE USER (The Bypass) ---
router.put('/verify/:id', async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Update Failed" });
    }
});

// --- 4. GET ALL USERS (Master List) ---
router.get('/all-users', async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;