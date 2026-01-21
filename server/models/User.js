const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // --- Basic Info ---
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['user', 'volunteer', 'admin'], default: 'user' },
  address: { type: String },

  // --- Status & Admin Fields ---
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'active'], default: 'pending' },
  interviewCode: { type: String },

  // --- User / Caregiver Fields ---
  isCaregiverAccount: { type: Boolean, default: false },
  caregiverName: { type: String },
  age: { type: String },
  gender: { type: String },
  bloodGroup: { type: String },
  govtIdNumber: { type: String }, // For Users (Text)
  livingSituation: { type: String },
  
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  medicalCondition: { type: String },
  preferences: {
    largeText: { type: Boolean, default: false },
    wheelchair: { type: Boolean, default: false },
    hearingAid: { type: Boolean, default: false }
  },

  // --- Volunteer Specific Fields ---
  serviceSector: { type: String },
  govtId: { type: String }, // For Volunteers (File Name)
  drivingLicense: { type: String },
  medicalCertificate: { type: String },
  volunteerCertificate: { type: String },
  selfieImage: { type: String },
  
  // ✅ FIX: Correctly define nested object to prevent crashes
  vehicleDetails: {
    vehicleType: { type: String }, 
    model: { type: String },
    number: { type: String }
  },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);