import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createSuperAdmin = async () => {
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

    // SuperAdmin credentials from environment variables
    const superAdminData = {
      name: process.env.ADMIN_NAME || 'PYQ Hub Super Admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'superadmin'
    };

    if (!superAdminData.email || !superAdminData.password) {
      console.log('❌ Please set ADMIN_EMAIL and ADMIN_PASSWORD in .env file');
      process.exit(1);
    }

    // Hash password manually
    const hashedPassword = await bcrypt.hash(superAdminData.password, 12);
    
    // Create superadmin with direct MongoDB insert (bypass hooks)
    const superAdmin = await User.collection.insertOne({
      ...superAdminData,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });
    
    console.log('✅ Super Admin created successfully!');
    console.log('📧 Email:', superAdminData.email);
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating superadmin:', error.message);
    process.exit(1);
  }
};

createSuperAdmin();
