import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import { initGridFS } from './config/gridfs.js';

// Initialize app
dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://proud-smoke-03c159f0f.2.azurestaticapps.net',
  credentials: true,
}));
app.use(express.json());

// Database Connection
connectDB();

// Initialize GridFS after DB connection
mongoose.connection.once('open', async () => {
  try {
    // Initialize GridFS
    initGridFS();
    
    // Import routes AFTER GridFS initialization
    const { default: authRoutes } = await import('./routes/authRoutes.js');
    const { default: blogRoutes } = await import('./routes/blogRoutes.js');
    const { default: paperRoutes } = await import('./routes/paperRoutes.js');
    const { default: commentRoutes } = await import('./routes/commentRoutes.js');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/blogs', blogRoutes);
    app.use('/api/papers', paperRoutes);
    app.use('/api/comments', commentRoutes);
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server initialization failed:', error);
    process.exit(1);
  }
});

// Handle database connection errors
mongoose.connection.on('error', (error) => {
  console.error('Database connection error:', error);
  process.exit(1);
});