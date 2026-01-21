import UploadRequest from "../models/UploadRequest.js";
import Subject from "../models/Subject.js";
import PYQ from "../models/PYQ.js";
import User from "../models/User.js";
import mongoose from "mongoose";

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
    // Get all users except current admin
    const users = await User.find({ 
      _id: { $ne: req.user.id },  // Exclude current user
      role: { $ne: 'admin' }      // Exclude admin users
    }, '-password').sort({ createdAt: -1 });
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

export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ name: 1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const subjectId = req.params.id;
    
    // First delete all PYQs associated with this subject
    const deletedPYQs = await PYQ.deleteMany({ subject: subjectId });
    
    // Then delete the subject
    const deletedSubject = await Subject.findByIdAndDelete(subjectId);
    
    if (!deletedSubject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    
    res.json({ 
      message: `Subject deleted successfully along with ${deletedPYQs.deletedCount} PYQ(s)` 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePYQ = async (req, res) => {
  try {
    const pyqId = req.params.id;
    
    const deletedPYQ = await PYQ.findByIdAndDelete(pyqId);
    
    if (!deletedPYQ) {
      return res.status(404).json({ message: "PYQ not found" });
    }
    
    // Check if this was the last PYQ for this subject
    const remainingPYQs = await PYQ.countDocuments({ subject: deletedPYQ.subject });
    
    let message = "PYQ deleted successfully";
    
    // If no PYQs remain for this subject, delete the subject too
    if (remainingPYQs === 0) {
      await Subject.findByIdAndDelete(deletedPYQ.subject);
      message = "PYQ deleted successfully. Subject also deleted as no PYQs remain.";
    }
    
    res.json({ message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalSubjects, totalPYQs, pendingRequests, approvedToday, rejectedToday, totalDownloadsResult, popularSubjects] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),  // Exclude admin users from count
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
      ]),
      // Get most popular subjects by total downloads
      PYQ.aggregate([
        {
          $group: {
            _id: "$subject",
            totalDownloads: { $sum: "$downloadCount" },
            pyqCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "subjects",
            localField: "_id",
            foreignField: "_id",
            as: "subjectInfo"
          }
        },
        {
          $unwind: "$subjectInfo"
        },
        {
          $project: {
            name: "$subjectInfo.name",
            totalDownloads: 1,
            pyqCount: 1
          }
        },
        {
          $sort: { totalDownloads: -1 }
        },
        {
          $limit: 5
        }
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
        rejectedToday,
        popularSubjects
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