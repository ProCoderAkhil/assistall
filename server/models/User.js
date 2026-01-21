const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Basic Info
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['user', 'volunteer', 'admin'], default: 'user' },
  address: { type: String },

  // ✅ CRITICAL FOR ADMIN PANEL
  // We unify everything to use 'status' for logic
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'active'], default: 'pending' },
  interviewCode: { type: String }, // For OTP

  // User / Caregiver Specific
  isCaregiverAccount: { type: Boolean, default: false },
  caregiverName: { type: String },
  age: { type: String },
  gender: { type: String },
  bloodGroup: { type: String },
  govtIdNumber: { type: String },
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

  // Volunteer Specific
  serviceSector: { type: String },
  govtId: { type: String },
  drivingLicense: { type: String },
  medicalCertificate: { type: String },
  volunteerCertificate: { type: String },
  selfieImage: { type: String },
  vehicleDetails: {
    type: String,
    model: String,
    number: String
  },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);