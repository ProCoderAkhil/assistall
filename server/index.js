import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import cors from 'cors';

// Import Routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import rideRoutes from './routes/rides.js'; 

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// --- CONNECT DB ---
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        // Optional: Clean ghost requests on start
        try { await mongoose.connection.collection('requests').drop(); } catch(e) {}
    } catch (error) {
        console.error(`❌ Connection Error: ${error.message}`);
    }
};
connectDB();

const rootDir = path.join(__dirname, '../');
const uploadDir = path.join(rootDir, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// --- CORS (Allow Vercel) ---
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// --- ⚠️ CRITICAL FIX: MOUNT THE ROUTES ⚠️ ---
app.use('/api/auth', authRoutes); // This was likely missing or broken
app.use('/api/admin', adminRoutes);
app.use('/api/requests', rideRoutes); 

// Health Check
app.get('/', (req, res) => {
    res.send("API is Running Successfully!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});