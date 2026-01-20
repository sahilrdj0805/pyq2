import User from "../models/User.js";
import PYQ from "../models/PYQ.js";
import UploadRequest from "../models/UploadRequest.js";

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    // Get total approved PYQs count
    const totalPYQs = await PYQ.countDocuments({ status: 'approved' });
    
    // Get pending upload requests count
    const pendingRequests = await UploadRequest.countDocuments({ status: 'pending' });
    
    // Calculate total downloads (sum of downloadCount from all PYQs)
    const downloadStats = await PYQ.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, totalDownloads: { $sum: "$downloadCount" } } }
    ]);
    
    const totalDownloads = downloadStats.length > 0 ? downloadStats[0].totalDownloads : 0;

    // Get additional stats for admin dashboard
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const approvedToday = await UploadRequest.countDocuments({
      status: 'approved',
      updatedAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });
    
    const rejectedToday = await UploadRequest.countDocuments({
      status: 'rejected',
      updatedAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalPYQs,
        pendingRequests,
        totalDownloads,
        totalAdmins,
        approvedToday,
        rejectedToday
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard statistics' 
    });
  }
};

// Get recent activities for admin dashboard
export const getRecentActivities = async (req, res) => {
  try {
    // Get recent upload requests
    const recentUploads = await UploadRequest.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('subjectName year status createdAt uploadedByUser');

    // Get recent user registrations
    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt');

    res.json({
      success: true,
      activities: {
        recentUploads,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch recent activities' 
    });
  }
};