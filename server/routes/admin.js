const express = require('express');
const router = express.Router();
const User = require('../models/User');

// --- 1. GET ALL VOLUNTEERS (Fixes "No Request" Issue) ---
router.get('/volunteers', async (req, res) => {
    try {
        // Fetches everyone with role='volunteer' (pending, approved, or rejected)
        const volunteers = await User.find({ role: 'volunteer' }).sort({ createdAt: -1 });
        res.json(volunteers);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

// --- 2. GENERATE INTERVIEW CODE (Fixes "No OTP" Issue) ---
router.post('/generate-code', async (req, res) => {
    try {
        const { userId, code: clientCode } = req.body;
        
        // Use provided code (if generated on client) or generate a new one
        const code = clientCode || Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save this code to the user's record so they can verify it
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { interviewCode: code }, 
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.json({ success: true, code: code });
    } catch (err) {
        console.error("Code Gen Error:", err);
        res.status(500).json({ message: "Code Generation Failed" });
    }
});

// --- 3. FORCE APPROVE USER (The Bypass Button) ---
router.put('/verify/:id', async (req, res) => {
    try {
        const { status } = req.body; // Expect 'approved' or 'rejected'
        const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Update Failed", error: err.message });
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