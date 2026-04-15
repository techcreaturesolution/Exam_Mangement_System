const express = require('express');
const router = express.Router();
const {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectsByCategory,
} = require('../controllers/subjectController');
const { protect, adminOnly, companyScope } = require('../middleware/auth');

router.get('/', protect, companyScope, getSubjects);
router.get('/:id', protect, getSubject);
router.get('/category/:categoryId', protect, getSubjectsByCategory);
router.post('/', protect, adminOnly, companyScope, createSubject);
router.put('/:id', protect, adminOnly, companyScope, updateSubject);
router.delete('/:id', protect, adminOnly, companyScope, deleteSubject);

module.exports = router;
