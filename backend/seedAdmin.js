import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (existingUser) {
      await User.deleteOne({ email: process.env.ADMIN_EMAIL });
      console.log('🗑️ Existing user with this email deleted');
    }

    // Admin credentials from environment variables
    const adminData = {
      name: process.env.ADMIN_NAME || 'PYQ Hub Admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin'
    };

    if (!adminData.email || !adminData.password) {
      console.log('❌ Please set ADMIN_EMAIL and ADMIN_PASSWORD in .env file');
      process.exit(1);
    }

    // Hash password manually
    const hashedPassword = await bcrypt.hash(adminData.password, 12);
    
    // Create admin with direct MongoDB insert (bypass hooks)
    const admin = await User.collection.insertOne({
      ...adminData,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });
    
    console.log('✅ Admin created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating superadmin:', error.message);
    process.exit(1);
  }
};

createAdmin();
