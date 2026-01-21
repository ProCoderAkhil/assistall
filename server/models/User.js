const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['user', 'volunteer', 'admin'], default: 'user' },
  
  // Status Fields
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'active'], default: 'pending' },
  
  // ✅ NEW: Add this field for the Interview OTP
  interviewCode: { type: String }, 

  // Volunteer Specific Fields
  govtId: { type: String },
  drivingLicense: { type: String },
  medicalCertificate: { type: String },
  volunteerCertificate: { type: String },
  selfieImage: { type: String },
  vehicleDetails: {
    type: { type: String },
    model: { type: String },
    number: { type: String }
  },
  
  // User Specific Fields
  isPremium: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);