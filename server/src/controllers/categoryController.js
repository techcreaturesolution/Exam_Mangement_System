const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
const getCategories = async (req, res) => {
  try {
    const { examType, isActive } = req.query;
    const filter = {};
    if (examType) filter.examType = { $in: [examType, 'both'] };
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    // Apply company scoping
    if (req.companyFilter) {
      Object.assign(filter, req.companyFilter);
    }

    const categories = await Category.find(filter)
      .populate('company', 'name')
      .sort({ order: 1, createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('company', 'name');
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create category
// @route   POST /api/categories
const createCategory = async (req, res) => {
  try {
    const data = { ...req.body };
    // Auto-set company for company admins
    if (req.companyId) {
      data.company = req.companyId;
    }
    const category = await Category.create(data);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory };
