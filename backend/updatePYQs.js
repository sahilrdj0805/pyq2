import mongoose from 'mongoose';
import PYQ from './models/PYQ.js';
import dotenv from 'dotenv';

dotenv.config();

const updateExistingPYQs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all existing PYQs that don't have downloadCount field
    const result = await PYQ.updateMany(
      { downloadCount: { $exists: false } }, // Find PYQs without downloadCount
      { $set: { downloadCount: 0 } }         // Set downloadCount to 0
    );

    console.log(`✅ Updated ${result.modifiedCount} existing PYQs with downloadCount field`);
    
    // Show current stats
    const totalPYQs = await PYQ.countDocuments();
    const totalDownloads = await PYQ.aggregate([
      { $group: { _id: null, total: { $sum: "$downloadCount" } } }
    ]);
    
    console.log(`📊 Total PYQs: ${totalPYQs}`);
    console.log(`📥 Total Downloads: ${totalDownloads[0]?.total || 0}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating PYQs:', error.message);
    process.exit(1);
  }
};

updateExistingPYQs();