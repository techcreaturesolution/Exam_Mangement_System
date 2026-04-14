const Subject = require('../models/Subject');

// @desc    Get all subjects
// @route   GET /api/subjects
const getSubjects = async (req, res) => {
  try {
    const { category, isActive } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const subjects = await Subject.find(filter)
      .populate('category', 'name examType')
      .sort({ order: 1, createdAt: -1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
const getSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id).populate('category');
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create subject
// @route   POST /api/subjects
const createSubject = async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    const populated = await subject.populate('category', 'name examType');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category', 'name examType');
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get subjects by category
// @route   GET /api/subjects/category/:categoryId
const getSubjectsByCategory = async (req, res) => {
  try {
    const subjects = await Subject.find({
      category: req.params.categoryId,
      isActive: true,
    })
      .populate('category', 'name')
      .sort({ order: 1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectsByCategory,
};
