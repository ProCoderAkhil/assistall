const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
app.use(cors());

// ✅ FIX: Increase body limit to 50mb to handle Base64 Selfie Images
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- DATABASE CONNECTION ---
// Ensure your .env file has MONGO_URI=your_connection_string
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// --- ROUTES ---
// 1. Authentication (Login, Signup, OTP)
app.use('/api/auth', require('./routes/auth'));

// 2. Admin Panel (Volunteer Management, OTP Generation, Force Verify)
// ✅ CRITICAL: This enables the Admin Panel features
app.use('/api/admin', require('./routes/admin'));

// 3. Service Requests (Rides, Help, SOS)
app.use('/api/requests', require('./routes/requests'));

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));