import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; 
import AccessCode from '../models/AccessCode.js'; 

const router = express.Router();

// --- REGISTER ROUTE ---
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, govtId, adminCode } = req.body;

    // 1. Basic Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    // 2. Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists!" });
    }

    // 3. DETERMINE ROLE & VERIFICATION
    let finalRole = role || 'user';
    let isVerified = false;

    // A. Special Check: Force Admin for specific email
    if (email === 'admin@assistall.com') {
        finalRole = 'admin';
        isVerified = true; // Admins are auto-verified
    } 
    // B. Volunteer Check (Only if NOT admin)
    else if (finalRole === 'volunteer') {
      if (!adminCode) {
        return res.status(400).json({ message: "Admin Code is required for Volunteer registration." });
      }
      
      // Check if code exists and is unused
      const validCode = await AccessCode.findOne({ code: adminCode, isUsed: false });
      if (!validCode) {
        return res.status(403).json({ message: "Invalid or Used Admin Code!" });
      }

      validCode.isUsed = true; // Mark code as used
      await validCode.save();
      isVerified = true;
    }

    // 4. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create User
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: finalRole, // Use the calculated role
      govtId: govtId || null,
      isVerified
    });

    const savedUser = await newUser.save();

    // 6. Return response (remove password)
    const { password: savedPassword, ...userInfo } = savedUser._doc;
    res.status(201).json(userInfo);

  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// --- LOGIN ROUTE ---
router.post('/login', async (req, res) => {
  try {
    // 1. Find User
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // 2. Validate Password
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Wrong password!" });
    }

    // 3. AUTO-FIX ADMIN ROLE (If missed during register)
    if (user.email === 'admin@assistall.com' && user.role !== 'admin') {
        user.role = 'admin';
        user.isVerified = true;
        await user.save();
        console.log("⚡ Auto-upgraded Admin Account");
    }

    // 4. Generate JWT Token
    const accessToken = jwt.sign(
      { id: user._id, role: user.role, isVerified: user.isVerified },
      process.env.JWT_SECRET || "fallback_secret_key", 
      { expiresIn: "3d" }
    );

    // 5. Return Token + User Info
    const { password, ...others } = user._doc;
    res.status(200).json({ ...others, accessToken });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;