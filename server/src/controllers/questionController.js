const Question = require('../models/Question');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// @desc    Get all questions
// @route   GET /api/questions
const getQuestions = async (req, res) => {
  try {
    const { category, subject, level, examType, isActive, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (subject) filter.subject = subject;
    if (level) filter.level = level;
    if (examType) filter.examType = { $in: [examType, 'both'] };
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Question.countDocuments(filter);

    const questions = await Question.find(filter)
      .populate('category', 'name')
      .populate('subject', 'name')
      .populate('level', 'name color')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      questions,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single question
// @route   GET /api/questions/:id
const getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('category', 'name')
      .populate('subject', 'name')
      .populate('level', 'name color');
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create question
// @route   POST /api/questions
const createQuestion = async (req, res) => {
  try {
    const question = await Question.create(req.body);
    const populated = await question.populate([
      { path: 'category', select: 'name' },
      { path: 'subject', select: 'name' },
      { path: 'level', select: 'name color' },
    ]);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update question
// @route   PUT /api/questions/:id
const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('category', 'name')
      .populate('subject', 'name')
      .populate('level', 'name color');
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk upload questions from Excel/CSV
// @route   POST /api/questions/bulk-upload
const bulkUploadQuestions = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const { category, subject, level, examType } = req.body;
    if (!category || !subject || !level) {
      return res.status(400).json({
        message: 'Category, subject, and level are required',
      });
    }

    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    const questions = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        const options = [];
        if (row['Option A']) options.push({ text: row['Option A'], isCorrect: row['Correct Answer'] === 'A' });
        if (row['Option B']) options.push({ text: row['Option B'], isCorrect: row['Correct Answer'] === 'B' });
        if (row['Option C']) options.push({ text: row['Option C'], isCorrect: row['Correct Answer'] === 'C' });
        if (row['Option D']) options.push({ text: row['Option D'], isCorrect: row['Correct Answer'] === 'D' });

        if (!row['Question'] || options.length < 2) {
          errors.push({ row: i + 2, error: 'Missing question or options' });
          continue;
        }

        questions.push({
          questionText: row['Question'],
          options,
          explanation: row['Explanation'] || '',
          category,
          subject,
          level,
          examType: examType || 'both',
          marks: row['Marks'] || 1,
          negativeMarks: row['Negative Marks'] || 0,
        });
      } catch (err) {
        errors.push({ row: i + 2, error: err.message });
      }
    }

    let inserted = [];
    if (questions.length > 0) {
      inserted = await Question.insertMany(questions);
    }

    // Cleanup uploaded file
    fs.unlinkSync(filePath);

    res.status(201).json({
      message: `${inserted.length} questions uploaded successfully`,
      uploaded: inserted.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get question count by filters
// @route   GET /api/questions/count
const getQuestionCount = async (req, res) => {
  try {
    const { category, subject, level, examType } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (subject) filter.subject = subject;
    if (level) filter.level = level;
    if (examType) filter.examType = { $in: [examType, 'both'] };

    const count = await Question.countDocuments(filter);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkUploadQuestions,
  getQuestionCount,
};
