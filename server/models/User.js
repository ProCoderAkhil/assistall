const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // --- EXISTING FIELDS ---
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['user', 'volunteer', 'admin'], default: 'user' },
  
  // ✅ NEW: PREMIUM MEMBERSHIP FIELDS
  isPremium: { type: Boolean, default: false },
  planType: { type: String, enum: ['free', 'gold'], default: 'free' },
  subscriptionExpiry: { type: Date },

  // --- EXISTING PERSONAL DETAILS ---
  age: { type: String },
  gender: { type: String, default: 'Male' },
  bloodGroup: { type: String },
  govtIdNumber: { type: String }, 
  livingSituation: { type: String },

  // ... (Rest of your existing schema: emergencyContact, preferences, volunteer fields) ...
  
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);