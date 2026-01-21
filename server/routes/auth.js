const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- REGISTER ---
router.post('/register', async (req, res) => {
  const { 
      name, email, password, role, phone, address,
      isCaregiverAccount, caregiverName,
      age, gender, bloodGroup, govtIdNumber, livingSituation,
      govtId, serviceSector, drivingLicense, medicalCertificate, 
      vehicleDetails, selfieImage,
      emergencyContact, medicalCondition, prefersLargeText, needsWheelchair, needsHearingAid
  } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name, email, password: hashedPassword, role, phone, address,
      
      // Admin Panel Logic
      status: role === 'volunteer' ? 'pending' : 'active', 

      // Personal & Caregiver
      isCaregiverAccount: isCaregiverAccount || false,
      caregiverName: caregiverName || '',
      age, gender, bloodGroup, govtIdNumber, livingSituation,

      // User Prefs
      emergencyContact: emergencyContact || {},
      medicalCondition: medicalCondition || '',
      preferences: {
          largeText: prefersLargeText || false,
          wheelchair: needsWheelchair || false,
          hearingAid: needsHearingAid || false
      },

      // Volunteer Docs
      selfieImage: selfieImage || '',
      serviceSector: serviceSector || 'general',
      govtId: govtId || '',
      drivingLicense: drivingLicense || '',
      medicalCertificate: medicalCertificate || '',
      volunteerCertificate: req.body.volunteerCertificate || '',
      vehicleDetails: vehicleDetails || {},
    });

    await user.save();
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });

    res.status(201).json({ token, user });

  } catch (err) { 
      console.error("Register Error:", err.message);
      res.status(500).json({ message: 'Server Error' }); 
  }
});

// --- LOGIN ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

        // ✅ FIXED STATUS CHECK
        // Allows login if 'approved' OR 'active'
        if (user.role === 'volunteer' && user.status !== 'approved' && user.status !== 'active') {
            return res.status(403).json({ message: 'Account Pending Admin Approval' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
        res.json({ token, user });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ message: 'Server Error' }); 
    }
});

module.exports = router;