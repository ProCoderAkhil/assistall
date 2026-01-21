const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- 1. REGISTER ---
router.post('/register', async (req, res) => {
  const { 
      name, email, password, role, phone, address,
      // ✅ NEW: Caregiver Fields
      isCaregiverAccount, caregiverName,
      // Personal Details
      age, gender, bloodGroup, govtIdNumber, livingSituation,
      // Volunteer fields
      govtId, serviceSector, drivingLicense, medicalCertificate, 
      vehicleDetails, selfieImage, phoneVerified, agreedToTerms,
      // User fields
      emergencyContact, medicalCondition, prefersLargeText, needsWheelchair, needsHearingAid
  } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name, email, password: hashedPassword, role, phone, address,
      
      // ✅ Save Caregiver Info
      isCaregiverAccount: isCaregiverAccount || false,
      caregiverName: caregiverName || '',

      // Personal Info
      age: age || '',
      gender: gender || 'Male',
      bloodGroup: bloodGroup || '',
      govtIdNumber: govtIdNumber || '',
      livingSituation: livingSituation || '',

      // User Specific Data
      emergencyContact: emergencyContact || {},
      medicalCondition: medicalCondition || '',
      preferences: {
          largeText: prefersLargeText || false,
          wheelchair: needsWheelchair || false,
          hearingAid: needsHearingAid || false
      },

      // Volunteer Specific Data
      phoneVerified: phoneVerified || false,
      agreedToTerms: agreedToTerms || false,
      selfieImage: selfieImage || '',
      serviceSector: serviceSector || 'general',
      govtId: govtId || '',
      drivingLicense: drivingLicense || '',
      medicalCertificate: medicalCertificate || '',
      vehicleDetails: vehicleDetails || {},

      // Status Logic
      isVerified: role === 'user' ? true : false, 
      verificationStatus: role === 'volunteer' ? 'pending' : 'approved',
      interviewStatus: 'pending' 
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
            isVerified: user.isVerified,
            preferences: user.preferences
        } 
    });

  } catch (err) { 
      console.error("Register Error:", err.message);
      res.status(500).json({ message: 'Server Error' }); 
  }
});

// ... (Keep existing LOGIN and INTERVIEW routes unchanged)
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
        res.json({ token, user: { _id: user._id, name: user.name, role: user.role, isVerified: user.isVerified, preferences: user.preferences } });
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

router.put('/complete-interview/:id', async (req, res) => {
    try {
        const { adminCode } = req.body;
        const VALID_ADMIN_CODE = "VERIFIED24"; 
        if (adminCode !== VALID_ADMIN_CODE) return res.status(400).json({ message: "Invalid Code" });
        await User.findByIdAndUpdate(req.params.id, { interviewStatus: 'completed' });
        res.json({ message: "Interview Verified" });
    } catch (err) { res.status(500).json({ message: "Server Error" }); }
});

router.get('/pending-volunteers', async (req, res) => {
    try {
        const users = await User.find({ role: 'volunteer', verificationStatus: 'pending' }).select('-password');
        res.json(users);
    } catch (err) { res.status(500).json({ message: "Server Error" }); }
});

router.put('/verify/:id', async (req, res) => {
    try {
        const { status } = req.body;
        await User.findByIdAndUpdate(req.params.id, { verificationStatus: status, isVerified: status === 'approved' });
        res.json({ message: `User ${status}` });
    } catch (err) { res.status(500).json({ message: "Server Error" }); }
});

module.exports = router;