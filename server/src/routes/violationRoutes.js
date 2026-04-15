const express = require('express');
const router = express.Router();
const {
  reportViolation,
  getAttemptViolations,
  getViolations,
} = require('../controllers/violationController');
const { protect, adminOnly, companyScope } = require('../middleware/auth');

// User reports violation during exam
router.post('/', protect, reportViolation);

// Admin views violations
router.get('/', protect, adminOnly, companyScope, getViolations);
router.get('/attempt/:attemptId', protect, adminOnly, getAttemptViolations);

module.exports = router;
