import mongoose from 'mongoose';
import PYQ from './models/PYQ.js';
import Subject from './models/Subject.js';
import dotenv from 'dotenv';

dotenv.config();

const addSamplePYQs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find or create subjects
    const mathSubject = await Subject.findOneAndUpdate(
      { name: 'Mathematics' },
      { name: 'Mathematics' },
      { upsert: true, new: true }
    );

    const physicsSubject = await Subject.findOneAndUpdate(
      { name: 'Physics' },
      { name: 'Physics' },
      { upsert: true, new: true }
    );

    // Sample PYQs with download counts
    const samplePYQs = [
      {
        title: 'Mathematics Final Exam 2023',
        subject: mathSubject._id,
        year: 2023,
        fileUrl: 'https://example.com/math-2023.pdf',
        status: 'approved',
        downloadCount: 145
      },
      {
        title: 'Mathematics Midterm 2022',
        subject: mathSubject._id,
        year: 2022,
        fileUrl: 'https://example.com/math-2022.pdf',
        status: 'approved',
        downloadCount: 89
      },
      {
        title: 'Physics Final Exam 2023',
        subject: physicsSubject._id,
        year: 2023,
        fileUrl: 'https://example.com/physics-2023.pdf',
        status: 'approved',
        downloadCount: 234
      },
      {
        title: 'Physics Lab Exam 2022',
        subject: physicsSubject._id,
        year: 2022,
        fileUrl: 'https://example.com/physics-lab-2022.pdf',
        status: 'approved',
        downloadCount: 67
      }
    ];

    // Insert sample PYQs
    for (const pyqData of samplePYQs) {
      await PYQ.findOneAndUpdate(
        { title: pyqData.title },
        pyqData,
        { upsert: true, new: true }
      );
    }

    console.log('✅ Sample PYQs added successfully!');
    console.log('📊 Total downloads will now show real data');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding sample PYQs:', error.message);
    process.exit(1);
  }
};

addSamplePYQs();