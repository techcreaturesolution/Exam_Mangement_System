const Subject = require('../models/Subject');

// @desc    Get all subjects
// @route   GET /api/subjects
const getSubjects = async (req, res) => {
  try {
    const filter = {};
    if (req.query.categoryId) filter.categoryId = req.query.categoryId;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const subjects = await Subject.find(filter)
      .populate('categoryId', 'categoryName')
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
    const subject = await Subject.findById(req.params.id).populate('categoryId', 'categoryName');
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
    const populated = await subject.populate('categoryId', 'categoryName');
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
    }).populate('categoryId', 'categoryName');
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
      categoryId: req.params.categoryId,
      isActive: true,
    })
      .populate('categoryId', 'categoryName')
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
