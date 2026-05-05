const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Level = require('../models/Level');
const Category = require('../models/Category');
const Subject = require('../models/Subject');
const Plan = require('../models/Plan');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/exam_management');
    console.log('Connected to MongoDB');

    // Create Admin
    const existingAdmin = await User.findOne({ email: 'admin@examportal.com' });
    if (!existingAdmin) {
      await User.create({
        name: 'Admin',
        email: 'admin@examportal.com',
        password: 'admin123456',
        mobile: '9999999999',
        role: 'admin',
      });
      console.log('Admin user created: admin@examportal.com / admin123456');
    } else {
      console.log('Admin user already exists');
    }

    // Create Levels
    const levels = [
      { levelName: 'Easy', sortOrder: 1, color: '#4CAF50' },
      { levelName: 'Medium', sortOrder: 2, color: '#FF9800' },
      { levelName: 'Hard', sortOrder: 3, color: '#F44336' },
      { levelName: 'Expert', sortOrder: 4, color: '#9C27B0' },
    ];

    for (const level of levels) {
      const existing = await Level.findOne({ levelName: level.levelName });
      if (!existing) {
        await Level.create(level);
        console.log(`Level created: ${level.levelName}`);
      }
    }

    // Create main category: Non Teaching Exam Preparation
    const categories = [
      { categoryName: 'Non Teaching Exam Preparation', icon: 'school', description: 'Competitive exam preparation for non-teaching posts', order: 1 },
    ];

    for (const cat of categories) {
      const existing = await Category.findOne({ categoryName: cat.categoryName });
      if (!existing) {
        await Category.create(cat);
        console.log(`Category created: ${cat.categoryName}`);
      }
    }

    // Create subjects/topics under Non Teaching Exam Preparation
    const mainCat = await Category.findOne({ categoryName: 'Non Teaching Exam Preparation' });

    if (mainCat) {
      const subjects = [
        { subjectName: 'GFR - General Financial Rules', categoryId: mainCat._id, description: 'Financial rules and regulations', order: 1 },
        { subjectName: 'Computer Knowledge', categoryId: mainCat._id, description: 'Basic computer concepts and applications', order: 2 },
        { subjectName: 'English Grammar', categoryId: mainCat._id, description: 'Grammar, vocabulary, comprehension', order: 3 },
        { subjectName: 'General Knowledge', categoryId: mainCat._id, description: 'Current affairs and general awareness', order: 4 },
        { subjectName: 'Quantitative Aptitude', categoryId: mainCat._id, description: 'Mathematical reasoning and calculations', order: 5 },
        { subjectName: 'Reasoning', categoryId: mainCat._id, description: 'Logical and analytical reasoning', order: 6 },
        { subjectName: 'Hindi Language', categoryId: mainCat._id, description: 'Hindi grammar and comprehension', order: 7 },
        { subjectName: 'Office Management', categoryId: mainCat._id, description: 'Office procedures and management', order: 8 },
        { subjectName: 'Constitution of India', categoryId: mainCat._id, description: 'Indian constitution and polity', order: 9 },
        { subjectName: 'Science', categoryId: mainCat._id, description: 'General science concepts', order: 10 },
        { subjectName: 'Geography', categoryId: mainCat._id, description: 'Indian and world geography', order: 11 },
      ];

      for (const sub of subjects) {
        const existing = await Subject.findOne({ subjectName: sub.subjectName, categoryId: sub.categoryId });
        if (!existing) {
          await Subject.create(sub);
          console.log(`Subject created: ${sub.subjectName}`);
        }
      }
    }

    // Create subscription plans (6-month & 1-year)
    const plans = [
      {
        planName: '6-Month Core Plan',
        planType: 'core',
        durationMonths: 6,
        originalPrice: 999,
        price: 499,
        validityDays: 180,
        description: 'Access to selected topics and mock tests for 6 months',
        features: [
          'Practice by Topic (Limited)',
          'Selected Mock Tests',
          'Detailed Reports',
          'Smart Analytics',
          'Upgradeable to 1-Year',
        ],
        topicsAllowed: 11,
        mockTestsAllowed: 3,
        practiceAccessAll: false,
        mockTestAccessAll: false,
        order: 1,
      },
      {
        planName: '1-Year Premium Plan',
        planType: 'premium',
        durationMonths: 12,
        originalPrice: 1799,
        price: 999,
        validityDays: 365,
        description: 'Full access to all topics and all mock tests for 1 year',
        features: [
          'All Practice Topics',
          'All Mock Tests',
          'Detailed Reports',
          'Smart Analytics',
          'Priority Support',
          'Full Access - Best Value',
        ],
        topicsAllowed: 0,
        mockTestsAllowed: 0,
        practiceAccessAll: true,
        mockTestAccessAll: true,
        order: 2,
      },
    ];

    for (const plan of plans) {
      const existing = await Plan.findOne({ planName: plan.planName });
      if (!existing) {
        await Plan.create(plan);
        console.log(`Plan created: ${plan.planName} (₹${plan.price} / ${plan.durationMonths} months)`);
      }
    }

    console.log('\nSeed completed successfully!');
    console.log('Admin Login: admin@examportal.com / admin123456');
    console.log('\nApp Flow:');
    console.log('  Category: Non Teaching Exam Preparation');
    console.log('  Topics: GFR, Computer, English, GK, etc.');
    console.log('  Plans: 6-Month Core (₹499) | 1-Year Premium (₹999)');
    console.log('  Upgrade: 6-month → 1-year by paying ₹500 difference');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDB();
