import UploadRequest from "../models/UploadRequest.js";
import Subject from "../models/Subject.js";
import PYQ from "../models/PYQ.js";

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
    console.error('Get pending requests error:', error);
    res.status(500).json({ message: error.message });
  }
};
export const approveRequest = async (req, res) => {
  try {
    const request = await UploadRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Check if subject exists, if not create it
    let subject = await Subject.findOne({ name: request.subjectName });
    if (!subject) {
      subject = await Subject.create({ name: request.subjectName });
      console.log(`New subject created: ${request.subjectName}`);
    }

    // Create PYQ with the subject (existing or newly created)
    await PYQ.create({
      title: request.title,
      subject: subject._id,
      year: request.year,
      fileUrl: request.fileUrl,
      uploadedBy: "user",
      status: "approved"
    });

    // Update request status
    request.status = "approved";
    await request.save();

    res.json({ 
      message: "Request approved and published successfully!",
      newSubject: subject.name
    });
  } catch (error) {
    console.error('Approve request error:', error);
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
    console.error('Reject request error:', error);
    res.status(500).json({ message: error.message });
  }
};