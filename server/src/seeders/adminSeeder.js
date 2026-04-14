const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Level = require('../models/Level');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  try {
    await connectDB();

    // Create default admin
    const existingAdmin = await User.findOne({ email: 'admin@examportal.com' });
    if (!existingAdmin) {
      await User.create({
        name: 'Master Admin',
        email: 'admin@examportal.com',
        password: 'admin123456',
        role: 'admin',
      });
      console.log('Admin user created: admin@examportal.com / admin123456');
    } else {
      console.log('Admin user already exists');
    }

    // Create default levels
    const levelCount = await Level.countDocuments();
    if (levelCount === 0) {
      await Level.insertMany([
        { name: 'easy', description: 'Basic level questions', order: 1, color: '#4CAF50' },
        { name: 'medium', description: 'Intermediate level questions', order: 2, color: '#FF9800' },
        { name: 'hard', description: 'Advanced level questions', order: 3, color: '#F44336' },
        { name: 'expert', description: 'Expert level questions', order: 4, color: '#9C27B0' },
      ]);
      console.log('Default levels created');
    } else {
      console.log('Levels already exist');
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding:', error);
    process.exit(1);
  }
};

seedAdmin();
