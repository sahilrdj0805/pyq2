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
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000', // React dev server
  'http://127.0.0.1:5173', // Alternative localhost
  'http://127.0.0.1:3000', // Alternative localhost
  // TODO: Add your production frontend URLs here after deployment:
  // 'https://your-pyq-app.vercel.app',
  // 'https://your-pyq-app.netlify.app',
  // 'https://pyq-hub.vercel.app',
  // 'https://pyqbbd.netlify.app'
];

// Universal CORS setup that works in all environments
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, check allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  preflightContinue: false,
  optionsSuccessStatus: 200
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
app.use('/api/upload-requests', uploadRequestRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});