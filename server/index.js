import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import rideRoutes from './routes/rides.js'; 

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// --- CONNECT DB & AUTO-CLEAN ---
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        try { await mongoose.connection.collection('requests').drop(); } catch(e) {}
    } catch (error) { console.error(`❌ Error: ${error.message}`); }
};
connectDB();

const rootDir = path.join(__dirname, '../');
const uploadDir = path.join(rootDir, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// --- ALLOW CORS (CRITICAL) ---
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));

app.use(express.json());
app.use('/uploads', express.static(uploadDir));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/requests', rideRoutes); 

app.get('/', (req, res) => res.send("API is Live!"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));