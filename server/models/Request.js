const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  requesterName: { type: String, required: true },
  requesterId: { type: String, required: true },
  volunteerName: { type: String },
  volunteerId: { type: String },
  
  type: { type: String, default: 'Ride' },
  status: { type: String, enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  
  pickup: { type: String, required: true },
  drop: { type: String, required: true },
  price: { type: Number, default: 0 },
  
  // ✅ FIX: This field was missing, preventing the OTP from being saved
  pickupOTP: { type: String }, 

  // Rating & Payment
  rating: { type: Number },
  review: { type: String },
  tip: { type: Number, default: 0 },
  paymentMethod: { type: String },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', RequestSchema);