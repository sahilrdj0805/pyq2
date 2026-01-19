import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import subjectRoutes from './routes/subjectRoutes.js';
import pyqRoutes from './routes/pyqRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRequestRoutes from './routes/uploadRequestRoutes.js';
import authRoutes from './routes/authRoutes.js';
import connectDB from './config/db.js';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PDF Proxy Route for proper viewing
app.get('/api/pdf/:id', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'PDF URL is required' });
    }
    
    // Fetch PDF from Cloudinary
    const response = await axios.get(url, {
      responseType: 'stream'
    });
    
    // Set proper headers for PDF viewing
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    
    // Pipe the PDF stream to response
    response.data.pipe(res);
  } catch (error) {
    console.error('PDF proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch PDF' });
  }
});

// PDF Download Route for forcing download
app.get('/api/download/:id', async (req, res) => {
  try {
    const { url, filename } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'PDF URL is required' });
    }
    
    // Fetch PDF from Cloudinary
    const response = await axios.get(url, {
      responseType: 'stream'
    });
    
    // Set proper headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename || 'document.pdf'}"`); 
    
    // Pipe the PDF stream to response
    response.data.pipe(res);
  } catch (error) {
    console.error('PDF download error:', error);
    res.status(500).json({ error: 'Failed to download PDF' });
  }
});

// Database connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/pyqs', pyqRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload-requests', uploadRequestRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});