const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Level = require('../models/Level');
const Company = require('../models/Company');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  try {
    await connectDB();

    // Create Master Admin (service provider)
    const existingAdmin = await User.findOne({ email: 'admin@examportal.com' });
    if (!existingAdmin) {
      await User.create({
        name: 'Master Admin',
        email: 'admin@examportal.com',
        password: 'admin123456',
        role: 'master_admin',
      });
      console.log('Master Admin created: admin@examportal.com / admin123456');
    } else {
      // Update existing admin to master_admin role
      if (existingAdmin.role !== 'master_admin') {
        existingAdmin.role = 'master_admin';
        await existingAdmin.save();
        console.log('Existing admin upgraded to master_admin role');
      } else {
        console.log('Master Admin already exists');
      }
    }

    // Create a sample company with company admin
    const existingCompany = await Company.findOne({ slug: 'demo-academy' });
    if (!existingCompany) {
      const masterAdmin = await User.findOne({ email: 'admin@examportal.com' });
      const company = await Company.create({
        name: 'Demo Academy',
        slug: 'demo-academy',
        description: 'A demo exam conducting company',
        email: 'info@demoacademy.com',
        phone: '9876543210',
        plan: 'premium',
        maxUsers: 500,
        maxExams: 50,
        maxQuestions: 5000,
        features: {
          antiCheat: true,
          razorpayEnabled: true,
          customBranding: false,
        },
        createdBy: masterAdmin._id,
      });

      // Create company admin
      const existingCompanyAdmin = await User.findOne({ email: 'companyadmin@demoacademy.com' });
      if (!existingCompanyAdmin) {
        await User.create({
          name: 'Company Admin',
          email: 'companyadmin@demoacademy.com',
          password: 'admin123456',
          role: 'admin',
          company: company._id,
        });
        console.log('Demo company created with admin: companyadmin@demoacademy.com / admin123456');
      }
    } else {
      console.log('Demo company already exists');
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
