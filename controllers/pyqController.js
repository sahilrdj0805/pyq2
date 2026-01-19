import PYQ from "../models/PYQ.js";
import Subject from "../models/Subject.js";

export const addPYQ = async (req, res) => {
  try {
    const { title, subjectName, year } = req.body;

    const subject = await Subject.findOne({ name: subjectName });
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const pyq = await PYQ.create({
      title,
      subject: subject._id,
      year,
      fileUrl: req.file.path,   // Cloudinary PDF URL
      uploadedBy: "admin",
      status: "approved"
    });

    res.status(201).json(pyq);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all PYQs with optional filtering
export const getPYQs = async (req, res) => {
  try {
    const { subject, year } = req.query;
    const filter = { status: "approved" };
    
    if (subject) filter.subject = subject;
    if (year) filter.year = year;

    const pyqs = await PYQ.find(filter).populate('subject').sort({ year: -1 });
    res.json(pyqs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPYQsBySubject = async (req, res) => {
  try {
    const { subject } = req.query;

    if (!subject) {
      return res.status(400).json({ message: "Subject parameter is required" });
    }

    const subjectData = await Subject.findOne({ name: subject });
    
    if (!subjectData) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const pyqs = await PYQ.find({
      subject: subjectData._id,
      status: "approved"
    }).populate('subject');

    res.json(pyqs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};