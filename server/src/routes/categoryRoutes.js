const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, adminOnly, companyScope } = require('../middleware/auth');

router.get('/', protect, companyScope, getCategories);
router.get('/:id', protect, getCategory);
router.post('/', protect, adminOnly, companyScope, createCategory);
router.put('/:id', protect, adminOnly, companyScope, updateCategory);
router.delete('/:id', protect, adminOnly, companyScope, deleteCategory);

module.exports = router;
