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
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getSubjects);
router.get('/:id', getSubject);
router.get('/category/:categoryId', getSubjectsByCategory);
router.post('/', protect, adminOnly, createSubject);
router.put('/:id', protect, adminOnly, updateSubject);
router.delete('/:id', protect, adminOnly, deleteSubject);

module.exports = router;
