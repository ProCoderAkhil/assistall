const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    requesterName: { type: String, required: true },
    requesterId: { type: String },
    type: { type: String, default: 'Ride' },
    price: { type: Number, default: 0 },
    pickup: { type: String, default: '' },
    drop: { type: String, default: '' },
    
    volunteerName: { type: String, default: '' },
    volunteerId: { type: String, default: '' },
    
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'], 
        default: 'pending' 
    },

    // --- NEW: SCHEDULING ---
    isScheduled: { type: Boolean, default: false },
    scheduledTime: { type: Date }, // e.g., "2025-10-12T10:00:00"

    // --- NEW: SAFETY ---
    isEmergency: { type: Boolean, default: false },
    reports: [{
        by: String, // 'user' or 'volunteer'
        reason: String,
        timestamp: { type: Date, default: Date.now }
    }],

    // --- REVIEW & PAYMENT ---
    rating: { type: Number, default: 0 },
    feedback: { type: String, default: '' },
    tip: { type: Number, default: 0 },
    paymentMethod: { type: String, default: 'none' },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', RequestSchema);