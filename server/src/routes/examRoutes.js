const express = require('express');
const router = express.Router();
const {
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  startExam,
  submitExam,
  getExamHistory,
  getExamStats,
} = require('../controllers/examController');
const { protect, adminOnly } = require('../middleware/auth');

// Admin routes
router.get('/stats', protect, adminOnly, getExamStats);
router.post('/', protect, adminOnly, createExam);
router.put('/:id', protect, adminOnly, updateExam);
router.delete('/:id', protect, adminOnly, deleteExam);

// Public / User routes
router.get('/', protect, getExams);
router.get('/history', protect, getExamHistory);
router.get('/:id', protect, getExam);
router.post('/:id/start', protect, startExam);
router.post('/:id/submit', protect, submitExam);

module.exports = router;
