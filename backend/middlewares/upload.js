import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "PYQs",
    resource_type: "raw",
    allowed_formats: ["pdf"],
    use_filename: true,
    unique_filename: false,
    chunk_size: 6000000, // 6MB chunks for faster upload
    timeout: 60000 // 60 second timeout
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB limit (increased)
  }
});

export default upload;
