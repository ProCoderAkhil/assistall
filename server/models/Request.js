const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  requesterName: { type: String, required: true },
  requesterId: { type: String, required: true },
  volunteerId: { type: String }, 
  volunteerName: { type: String },
  
  type: { type: String, required: true }, // Transport, Medicine, etc.
  status: { 
      type: String, 
      enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'], 
      default: 'pending' 
  },
  
  location: {
      lat: { type: Number },
      lng: { type: Number }
  },
  drop: { type: String },
  price: { type: Number, default: 150 },
  
  // ✅ NEW: OTP Field
  pickupOTP: { type: String },

  isScheduled: { type: Boolean, default: false },
  scheduledTime: { type: String },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', RequestSchema);