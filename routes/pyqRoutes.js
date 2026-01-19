import express from "express";
import upload from "../middlewares/upload.js";
import {
  addPYQ,
  getPYQs,
  getPYQsBySubject
} from "../controllers/pyqController.js";

const router = express.Router();

// Test route without file upload
router.post("/test", async (req, res) => {
  try {
    console.log('Environment check:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'
    });
    res.json({ message: "Test successful", env: process.env.CLOUDINARY_CLOUD_NAME });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", upload.single("pdf"), addPYQ);  // Add new PYQ with file upload
router.get("/", getPYQs);                        // Get all PYQs with filters
router.get("/by-subject", getPYQsBySubject);     // Get PYQs by subject name

export default router;
