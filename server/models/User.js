const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // --- COMMON FIELDS ---
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  role: { type: String, enum: ['user', 'volunteer', 'admin'], default: 'user' },
  
  // --- USER (PASSENGER) SPECIFIC FIELDS ---
  emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relation: { type: String }
  },
  medicalCondition: { type: String },
  preferences: {
      largeText: { type: Boolean, default: false },
      wheelchair: { type: Boolean, default: false }
  },

  // --- VOLUNTEER SPECIFIC FIELDS ---
  // Security & Legal
  phoneVerified: { type: Boolean, default: false },
  agreedToTerms: { type: Boolean, default: false },
  
  // Documents & Verification
  selfieImage: { type: String }, // Stores Base64 string (Large payload)
  govtId: { type: String },      // File name or URL
  drivingLicense: { type: String }, 
  serviceSector: { 
      type: String, 
      enum: ['transport', 'medical', 'companionship', 'general'],
      default: 'general' 
  },
  vehicleDetails: {
      type: { type: String },
      model: { type: String },
      number: { type: String }
  },

  // --- ADMIN / VERIFICATION STATUS ---
  isVerified: { type: Boolean, default: false }, 
  verificationStatus: { 
    type: String, 
    enum: ['pending', 'interview_scheduled', 'approved', 'rejected'], 
    default: 'pending' 
  },
  
  // Interview Logic
  interviewDate: { type: Date },
  googleMeetLink: { type: String, default: "https://meet.google.com/abc-defg-hij" }, // Default link for demo

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);