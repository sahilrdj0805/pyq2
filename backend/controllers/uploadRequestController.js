import UploadRequest from "../models/UploadRequest.js";
import Subject from "../models/Subject.js";
import PYQ from "../models/PYQ.js";
import User from "../models/User.js";

export const createUploadRequest = async (req, res) => {
  try {
    const { title, subjectName, year } = req.body;

    // Create upload request with subject name (don't check if subject exists)
    const request = await UploadRequest.create({
      title,
      subjectName, // Store subject name directly
      year,
      fileUrl: req.file.path, // Cloudinary PDF
      uploadedByUser: "anonymous",
      status: "pending"
    });

    res.status(201).json({
      message: "Upload request sent for approval",
      request
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const requests = await UploadRequest.find({ status: "pending" });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Prevent deleting self
    if (userId === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }
    
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }, '-password').sort({ createdAt: -1 });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    
    // Hash password
    const bcrypt = (await import('bcryptjs')).default;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const newAdmin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });
    
    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalSubjects, totalPYQs, pendingRequests, approvedToday, rejectedToday, totalDownloadsResult] = await Promise.all([
      User.countDocuments(),
      Subject.countDocuments(),
      PYQ.countDocuments(),
      UploadRequest.countDocuments({ status: "pending" }),
      UploadRequest.countDocuments({ 
        status: "approved", 
        updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      UploadRequest.countDocuments({ 
        status: "rejected", 
        updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      PYQ.aggregate([
        { $group: { _id: null, totalDownloads: { $sum: "$downloadCount" } } }
      ])
    ]);

    const totalDownloads = totalDownloadsResult.length > 0 ? totalDownloadsResult[0].totalDownloads : 0;

    res.json({
      stats: {
        totalUsers,
        totalSubjects,
        totalPYQs,
        pendingRequests,
        totalDownloads,
        approvedToday,
        rejectedToday
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveRequest = async (req, res) => {
  try {
    const request = await UploadRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    let subject = await Subject.findOne({ name: request.subjectName });
    if (!subject) {
      subject = await Subject.create({ name: request.subjectName });
    }

    await PYQ.create({
      title: request.title,
      subject: subject._id,
      year: request.year,
      fileUrl: request.fileUrl,
      uploadedBy: "user",
      status: "approved"
    });

    request.status = "approved";
    await request.save();

    res.json({ 
      message: "Request approved and published successfully!",
      newSubject: subject.name
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const rejectRequest = async (req, res) => {
  try {
    await UploadRequest.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" }
    );

    res.json({ message: "Request rejected" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const adminUploadPYQ = async (req, res) => {
  try {
    const { title, subjectName, year } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    if (!title || !subjectName || !year) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const pdfUrl = req.file.path;

    let subject = await Subject.findOne({ name: subjectName });
    if (!subject) {
      subject = await Subject.create({ name: subjectName });
    }

    const pyq = await PYQ.create({
      title,
      subject: subject._id,
      year: parseInt(year),
      fileUrl: pdfUrl,
      uploadedBy: "admin",
      status: "approved"
    });

    res.status(201).json({
      success: true,
      message: "PYQ uploaded successfully",
      pyq
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error during upload" });
  }
};