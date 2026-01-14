const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  role: { type: String, enum: ['user', 'volunteer', 'admin'], default: 'user' },
  
  // --- VOLUNTEER SPECIFIC FIELDS ---
  serviceSector: { 
      type: String, 
      enum: ['transport', 'medical', 'companionship', 'general'],
      default: 'general' 
  },
  
  // Verification Documents
  govtId: { type: String }, // Common for all
  drivingLicense: { type: String }, // For Transport
  medicalCertificate: { type: String }, // For Medical
  
  // Vehicle Info (For Transport)
  vehicleDetails: {
      type: { type: String }, // Car, Bike, Auto
      model: { type: String }, // e.g., Swift Dzire
      number: { type: String } // KL-01-AB-1234
  },

  isVerified: { type: Boolean, default: false }, 
  verificationStatus: { 
    type: String, 
    enum: ['pending', 'interview_scheduled', 'approved', 'rejected'], 
    default: 'pending' 
  },
  
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);