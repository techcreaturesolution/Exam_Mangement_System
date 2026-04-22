const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  startExam,
  submitExam,
  getExamHistory,
  reviewAttempt,
  getPerformanceReport,
  getResults,
  getRankings,
  getDashboardStats,
} = require('../controllers/examController');

// Admin dashboard
router.get('/dashboard', protect, adminOnly, getDashboardStats);

// Reports
router.get('/reports/results', protect, adminOnly, getResults);
router.get('/reports/rankings', protect, adminOnly, getRankings);
router.get('/reports/analytics', protect, getPerformanceReport);

// Exam history & review (student)
router.get('/history', protect, getExamHistory);
router.get('/review/:attemptId', protect, reviewAttempt);

// CRUD
router.get('/', protect, getExams);
router.get('/:id', protect, getExam);
router.post('/', protect, adminOnly, createExam);
router.put('/:id', protect, adminOnly, updateExam);
router.delete('/:id', protect, adminOnly, deleteExam);

// Start & submit exam
router.post('/:id/start', protect, startExam);
router.post('/:id/submit', protect, submitExam);

module.exports = router;
