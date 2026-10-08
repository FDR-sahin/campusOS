import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { apiRouter } from './src/routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:3000', process.env.ADMIN_URL || 'http://localhost:3001'],
  credentials: true,
}));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.error('MongoDB connection error:', err));
} else {
  console.log('Running without MongoDB connection string (set MONGODB_URI in .env)');
}

// Health route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'CampusOS Backend API',
    institution: 'City University, Bangladesh',
    campus: 'Khagan Permanent Campus, Savar',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`CampusOS Backend running on port ${PORT}`);
});
