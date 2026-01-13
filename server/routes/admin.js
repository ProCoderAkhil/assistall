const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AccessCode = require('../models/AccessCode');
const Request = require('../models/Request');
const sendEmail = require('../utils/emailService'); 

// 1. Generate OTP Code (For Live Call)
router.post('/generate-code', async (req, res) => {
    try {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await AccessCode.deleteMany({}); // Clear old codes
        const newCode = new AccessCode({ code });
        await newCode.save();
        res.json({ code });
    } catch (err) {
        res.status(500).json({ message: 'Generation failed' });
    }
});

// 2. Get Current Active Code
router.get('/code', async (req, res) => {
    try {
        const activeCode = await AccessCode.findOne().sort({ createdAt: -1 });
        res.json({ code: activeCode ? activeCode.code : null });
    } catch (err) { res.status(500).send("Server Error"); }
});

// 3. Get Volunteers
router.get('/volunteers', async (req, res) => {
    try {
        const volunteers = await User.find({ role: 'volunteer' }).select('-password');
        res.json(volunteers);
    } catch (err) { res.status(500).send("Server Error"); }
});

// 4. Send Interview Invite Email
router.post('/send-invite', async (req, res) => {
    const { email, meetingLink } = req.body;

    const subject = "Action Required: Complete Your Volunteer Verification";
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #2563EB; text-align: center;">Welcome to AssistAll!</h2>
            <p>Hello,</p>
            <p>Thank you for signing up. To activate your account, verify your identity via a quick video call.</p>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="margin: 0; font-weight: bold;">Step 1: Join the Video Call</p>
                <a href="${meetingLink}" style="display: inline-block; margin-top: 10px; background: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Join Meeting</a>
            </div>

            <p><strong>Step 2:</strong> During the call, the Admin will provide a <strong>6-digit Code</strong>.</p>
            <p><strong>Step 3:</strong> Enter this code on your signup screen to register.</p>
            
            <p>See you soon,<br/>The AssistAll Team</p>
        </div>
    `;

    const success = await sendEmail(email, subject, html);
    if (success) res.json({ message: "Invite sent successfully" });
    else res.status(500).json({ message: "Failed to send email" });
});

// 5. Approve Volunteer
router.put('/verify/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isVerified = !user.isVerified;
        user.verificationStatus = user.isVerified ? 'approved' : 'pending';
        await user.save();

        if (user.isVerified) {
            await sendEmail(
                user.email,
                "🎉 You are now a Verified Volunteer!",
                `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h3 style="color: #10B981;">Congratulations, ${user.name}!</h3>
                    <p>Your account has been approved. You can now log in to the Dashboard.</p>
                    <a href="http://localhost:5173/login" style="background: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a>
                </div>`
            );
        }
        res.json(user);
    } catch (err) { res.status(500).json({ message: 'Update failed' }); }
});

// 6. Stats
router.get('/stats', async (req, res) => {
    try {
        const volunteers = await User.countDocuments({ role: 'volunteer' });
        const users = await User.countDocuments({ role: 'user' });
        const rides = await Request.countDocuments({});
        const recent = await Request.find().sort({ createdAt: -1 }).limit(5);
        res.json({ volunteers, users, rides, earnings: rides * 150, recent });
    } catch (err) { res.status(500).send("Server Error"); }
});

module.exports = router;