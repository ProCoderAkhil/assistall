import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; 
import AccessCode from '../models/AccessCode.js'; 

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, govtId, adminCode } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Please fill in all required fields." });
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists!" });

    let finalRole = role || 'user';
    let isVerified = false;

    // FORCE ADMIN ROLE
    if (email === 'admin@assistall.com') {
        finalRole = 'admin';
        isVerified = true; 
    } else if (finalRole === 'volunteer') {
      if (!adminCode) return res.status(400).json({ message: "Admin Code is required for Volunteer registration." });
      const validCode = await AccessCode.findOne({ code: adminCode, isUsed: false });
      if (!validCode) return res.status(403).json({ message: "Invalid or Used Admin Code!" });
      validCode.isUsed = true; 
      await validCode.save();
      isVerified = true;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword, role: finalRole, govtId: govtId || null, isVerified });
    const savedUser = await newUser.save();

    const { password: savedPassword, ...userInfo } = savedUser._doc;
    res.status(201).json(userInfo);

  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found!" });

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ message: "Wrong password!" });

    // AUTO-UPGRADE ADMIN
    if (user.email === 'admin@assistall.com' && user.role !== 'admin') {
        user.role = 'admin';
        user.isVerified = true;
        await user.save();
    }

    const accessToken = jwt.sign({ id: user._id, role: user.role, isVerified: user.isVerified }, process.env.JWT_SECRET || "fallback_secret_key", { expiresIn: "3d" });
    const { password, ...others } = user._doc;
    res.status(200).json({ ...others, accessToken });

  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;