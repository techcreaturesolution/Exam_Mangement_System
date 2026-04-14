const Level = require('../models/Level');

// @desc    Get all levels
// @route   GET /api/levels
const getLevels = async (req, res) => {
  try {
    const levels = await Level.find().sort({ order: 1 });
    res.json(levels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single level
// @route   GET /api/levels/:id
const getLevel = async (req, res) => {
  try {
    const level = await Level.findById(req.params.id);
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }
    res.json(level);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create level
// @route   POST /api/levels
const createLevel = async (req, res) => {
  try {
    const level = await Level.create(req.body);
    res.status(201).json(level);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update level
// @route   PUT /api/levels/:id
const updateLevel = async (req, res) => {
  try {
    const level = await Level.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }
    res.json(level);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete level
// @route   DELETE /api/levels/:id
const deleteLevel = async (req, res) => {
  try {
    const level = await Level.findByIdAndDelete(req.params.id);
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }
    res.json({ message: 'Level deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLevels, getLevel, createLevel, updateLevel, deleteLevel };
