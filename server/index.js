const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- MIDDLEWARE (FIXED) ---
app.use(cors());

// ✅ FIX: Increase body limit to 50mb to handle Base64 Selfie Images
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log(err));

// Routes
app.use('/api/auth', require('./routes/auth'));
// app.use('/api/admin', require('./routes/admin')); // Uncomment if you created a separate admin route file, otherwise keep it inside auth
app.use('/api/requests', require('./routes/requests'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));