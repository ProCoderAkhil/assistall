const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AccessCode = require('../models/AccessCode');

// REGISTER
router.post('/register', async (req, res) => {
  const { 
      name, email, password, role, govtId, address, phone, adminCode,
      serviceSector, drivingLicense, medicalCertificate, vehicleDetails
  } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    let isVerified = false;
    
    // Volunteer Verification Logic
    if (role === 'volunteer') {
        if (!adminCode) return res.status(400).json({ message: 'Verification Code Required' });
        const validCode = await AccessCode.findOne({ code: adminCode });
        if (!validCode) return res.status(400).json({ message: 'Invalid Verification Code' });
        isVerified = false; // Pending manual approval
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name, email, password: hashedPassword, role,
      govtId, address, phone,
      
      // New Fields
      serviceSector: serviceSector || 'general',
      drivingLicense: drivingLicense || '',
      medicalCertificate: medicalCertificate || '',
      vehicleDetails: vehicleDetails || {},

      isVerified: role === 'user' ? true : isVerified, 
      verificationStatus: role === 'volunteer' ? 'pending' : 'approved'
    });

    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ 
        token, 
        user: { 
            _id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role, 
            isVerified: user.isVerified 
        } 
    });

  } catch (err) { 
      console.error(err);
      res.status(500).json({ message: 'Server Error' }); 
  }
});

// LOGIN
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

        if (user.role === 'volunteer' && !user.isVerified) {
            return res.status(403).json({ message: 'Account Pending Admin Approval' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.json({ token, user: { _id: user._id, name: user.name, role: user.role, isVerified: user.isVerified } });
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

// PUBLIC PROFILE
router.get('/user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -adminCode');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) { res.status(500).json({ message: "Server Error" }); }
});

module.exports = router;