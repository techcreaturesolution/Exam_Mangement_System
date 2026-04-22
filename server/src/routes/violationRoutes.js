const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  reportViolation,
  getAttemptViolations,
  getViolations,
} = require('../controllers/violationController');

router.post('/', protect, reportViolation);
router.get('/attempt/:attemptId', protect, getAttemptViolations);
router.get('/', protect, adminOnly, getViolations);

module.exports = router;
