import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import subjectRoutes from './routes/subjectRoutes.js';
import pyqRoutes from './routes/pyqRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRequestRoutes from './routes/uploadRequestRoutes.js';
import authRoutes from './routes/authRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import connectDB from './config/db.js';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000', // React dev server
  'https://your-frontend-domain.com', // Production frontend
  'https://your-app.vercel.app', // Vercel deployment
  'https://your-app.netlify.app' // Netlify deployment
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    
    // Increment download count for this PYQ
    const pyqId = req.params.id;
    if (pyqId && pyqId !== 'undefined' && pyqId !== 'null') {
      try {
        const PYQ = (await import('./models/PYQ.js')).default;
        const result = await PYQ.findByIdAndUpdate(
          pyqId, 
          { $inc: { downloadCount: 1 } },
          { new: true }
        );
        if (result) {
          console.log(`Download count updated for PYQ ${pyqId}: ${result.downloadCount}`);
        }
      } catch (error) {
        console.log('Could not update download count:', error.message);
      }
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
app.use('/api/admin', statsRoutes);
app.use('/api/upload-requests', uploadRequestRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});