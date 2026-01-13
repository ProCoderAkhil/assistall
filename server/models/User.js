const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  role: { type: String, enum: ['user', 'volunteer', 'admin'], default: 'user' },
  
  // Verification Fields
  govtId: { type: String },
  isVerified: { type: Boolean, default: false }, 
  verificationStatus: { 
    type: String, 
    enum: ['pending', 'interview_scheduled', 'approved', 'rejected'], 
    default: 'pending' 
  },
  
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);