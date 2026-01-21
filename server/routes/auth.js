const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- REGISTER ROUTE ---
router.post('/register', async (req, res) => {
  const { 
      name, email, password, role, phone, address,
      // Caregiver / User
      isCaregiverAccount, caregiverName,
      age, gender, bloodGroup, govtIdNumber, livingSituation,
      emergencyContact, medicalCondition, prefersLargeText, needsWheelchair, needsHearingAid,
      // Volunteer
      govtId, serviceSector, drivingLicense, medicalCertificate, 
      vehicleDetails, selfieImage
  } = req.body;

  try {
    // 1. Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create User
    user = new User({
      name, email, password: hashedPassword, role, phone, address,
      
      // Auto-Activate Users, Pend Volunteers
      status: role === 'volunteer' ? 'pending' : 'active', 

      // Personal Info
      isCaregiverAccount: isCaregiverAccount || false,
      caregiverName: caregiverName || '',
      age: age || '',
      gender: gender || 'Male',
      bloodGroup: bloodGroup || '',
      govtIdNumber: govtIdNumber || '',
      livingSituation: livingSituation || '',

      // Preferences (Mapping frontend booleans to DB object)
      emergencyContact: emergencyContact || {},
      medicalCondition: medicalCondition || '',
      preferences: {
          largeText: prefersLargeText || false,
          wheelchair: needsWheelchair || false,
          hearingAid: needsHearingAid || false
      },

      // Volunteer Info (Defaults to empty strings for Users)
      selfieImage: selfieImage || '',
      serviceSector: serviceSector || '',
      govtId: govtId || '',
      drivingLicense: drivingLicense || '',
      medicalCertificate: medicalCertificate || '',
      volunteerCertificate: req.body.volunteerCertificate || '',
      
      // ✅ FIX: Handle Vehicle Details safely
      vehicleDetails: vehicleDetails ? {
          vehicleType: vehicleDetails.type || '',
          model: vehicleDetails.model || '',
          number: vehicleDetails.number || ''
      } : {}
    });

    await user.save();
    
    // 4. Generate Token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });

    res.status(201).json({ token, user });

  } catch (err) { 
      console.error("Register Error:", err.message); // Check terminal for specific error
      res.status(500).json({ message: 'Server Error' }); 
  }
});

// --- LOGIN ROUTE ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

        // Status Check for Volunteers
        if (user.role === 'volunteer' && user.status !== 'approved' && user.status !== 'active') {
            return res.status(403).json({ message: 'Account Pending Admin Approval' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
        res.json({ token, user });
    } catch (err) { 
        res.status(500).json({ message: 'Server Error' }); 
    }
});

module.exports = router;