const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Level = require('../models/Level');
const Category = require('../models/Category');
const Subject = require('../models/Subject');

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

    // Create sample categories
    const categories = [
      { categoryName: 'Mathematics', icon: 'calculate', description: 'Mathematical concepts and problem solving' },
      { categoryName: 'Science', icon: 'science', description: 'Physics, Chemistry, Biology' },
      { categoryName: 'English', icon: 'menu_book', description: 'Grammar, Vocabulary, Reading' },
      { categoryName: 'General Knowledge', icon: 'public', description: 'Current affairs and general awareness' },
    ];

    for (const cat of categories) {
      const existing = await Category.findOne({ categoryName: cat.categoryName });
      if (!existing) {
        await Category.create(cat);
        console.log(`Category created: ${cat.categoryName}`);
      }
    }

    // Create sample subjects
    const mathCat = await Category.findOne({ categoryName: 'Mathematics' });
    const sciCat = await Category.findOne({ categoryName: 'Science' });

    if (mathCat) {
      const mathSubjects = [
        { subjectName: 'Algebra', categoryId: mathCat._id, description: 'Equations and expressions' },
        { subjectName: 'Geometry', categoryId: mathCat._id, description: 'Shapes and spatial relationships' },
        { subjectName: 'Trigonometry', categoryId: mathCat._id, description: 'Triangles and angles' },
      ];
      for (const sub of mathSubjects) {
        const existing = await Subject.findOne({ subjectName: sub.subjectName, categoryId: sub.categoryId });
        if (!existing) {
          await Subject.create(sub);
          console.log(`Subject created: ${sub.subjectName}`);
        }
      }
    }

    if (sciCat) {
      const sciSubjects = [
        { subjectName: 'Physics', categoryId: sciCat._id, description: 'Laws of nature and forces' },
        { subjectName: 'Chemistry', categoryId: sciCat._id, description: 'Elements and reactions' },
        { subjectName: 'Biology', categoryId: sciCat._id, description: 'Living organisms and life sciences' },
      ];
      for (const sub of sciSubjects) {
        const existing = await Subject.findOne({ subjectName: sub.subjectName, categoryId: sub.categoryId });
        if (!existing) {
          await Subject.create(sub);
          console.log(`Subject created: ${sub.subjectName}`);
        }
      }
    }

    console.log('\nSeed completed successfully!');
    console.log('Admin Login: admin@examportal.com / admin123456');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDB();
