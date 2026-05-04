import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createTestUser = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/personal-tracker';
  
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB for seeding user...');

    const email = 'test@example.com';
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log('Test user already exists:', email);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const testUser = new User({
      name: 'Test User',
      email: email,
      password: hashedPassword,
    });

    await testUser.save();
    console.log('Test user created successfully!');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
};

createTestUser();
