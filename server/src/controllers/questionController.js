const Question = require('../models/Question');
const XLSX = require('xlsx');
const fs = require('fs');

// @desc    Get all questions
// @route   GET /api/questions
const getQuestions = async (req, res) => {
  try {
    const { categoryId, subjectId, levelId, isActive, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (categoryId) filter.categoryId = categoryId;
    if (subjectId) filter.subjectId = subjectId;
    if (levelId) filter.levelId = levelId;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Question.countDocuments(filter);

    const questions = await Question.find(filter)
      .populate('categoryId', 'categoryName')
      .populate('subjectId', 'subjectName')
      .populate('levelId', 'levelName color')
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
      .populate('categoryId', 'categoryName')
      .populate('subjectId', 'subjectName')
      .populate('levelId', 'levelName color');
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
      { path: 'categoryId', select: 'categoryName' },
      { path: 'subjectId', select: 'subjectName' },
      { path: 'levelId', select: 'levelName color' },
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
      .populate('categoryId', 'categoryName')
      .populate('subjectId', 'subjectName')
      .populate('levelId', 'levelName color');
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

// @desc    Import questions from CSV/Excel
// @route   POST /api/questions/import
const importQuestions = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const { categoryId, subjectId, levelId } = req.body;
    if (!categoryId || !subjectId || !levelId) {
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
        if (!row['Question'] || !row['Option A'] || !row['Option B'] || !row['Option C'] || !row['Option D'] || !row['Answer']) {
          errors.push({ row: i + 2, error: 'Missing required fields' });
          continue;
        }

        questions.push({
          categoryId,
          subjectId,
          levelId,
          question: row['Question'],
          optionA: row['Option A'],
          optionB: row['Option B'],
          optionC: row['Option C'],
          optionD: row['Option D'],
          answer: row['Answer'].toUpperCase(),
          marks: row['Marks'] || 1,
          negativeMarks: row['Negative Marks'] || 0,
          explanation: row['Explanation'] || '',
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
      message: `${inserted.length} questions imported successfully`,
      uploaded: inserted.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get question count
// @route   GET /api/questions/count
const getQuestionCount = async (req, res) => {
  try {
    const { categoryId, subjectId, levelId } = req.query;
    const filter = { isActive: true };
    if (categoryId) filter.categoryId = categoryId;
    if (subjectId) filter.subjectId = subjectId;
    if (levelId) filter.levelId = levelId;

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
  importQuestions,
  getQuestionCount,
};
