import express from 'express';
import User from '../models/User.js';
import Request from '../models/Request.js';
import AccessCode from '../models/AccessCode.js';

const router = express.Router();

// --- DASHBOARD STATS ---
router.get('/stats', async (req, res) => {
    try {
        const volunteers = await User.countDocuments({ role: 'volunteer' });
        const users = await User.countDocuments({ role: 'user' });
        const rides = await Request.countDocuments();
        const recent = await Request.find().sort({ createdAt: -1 }).limit(5);
        res.json({ volunteers, users, rides, earnings: rides * 150, recent });
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

// --- GET ACTIVE CODE ---
router.get('/code', async (req, res) => {
    try {
        const latest = await AccessCode.findOne({ isUsed: false }).sort({ createdAt: -1 });
        res.json({ code: latest ? latest.code : "------" });
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

// --- GENERATE NEW CODE ---
router.post('/generate-code', async (req, res) => {
    try {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        await new AccessCode({ code }).save();
        res.json({ code });
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

// --- GET VOLUNTEERS ---
router.get('/volunteers', async (req, res) => {
    try {
        const vols = await User.find({ role: 'volunteer' });
        res.json(vols);
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

// --- TOGGLE VERIFICATION ---
router.put('/verify/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.isVerified = !user.isVerified;
            await user.save();
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

export default router;