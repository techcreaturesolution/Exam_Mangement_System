const ExamViolation = require('../models/ExamViolation');
const ExamAttempt = require('../models/ExamAttempt');
const Exam = require('../models/Exam');

// @desc    Report a violation during exam
// @route   POST /api/violations
const reportViolation = async (req, res) => {
  try {
    const { examId, attemptId, violationType, description } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const violation = await ExamViolation.create({
      user: req.user._id,
      exam: examId,
      attemptId,
      violationType,
      description,
      company: exam.company,
    });

    // Check if max violations exceeded
    const violationCount = await ExamViolation.countDocuments({
      user: req.user._id,
      attemptId,
    });

    let autoSubmitted = false;
    if (exam.antiCheat.autoSubmitOnViolation && violationCount >= exam.antiCheat.maxViolations) {
      // Auto-submit the exam
      const attempt = await ExamAttempt.findById(attemptId);
      if (attempt && attempt.status === 'in_progress') {
        attempt.status = 'completed';
        attempt.endTime = new Date();
        attempt.timeSpent = Math.round((attempt.endTime - attempt.startTime) / 1000);
        await attempt.save();
        autoSubmitted = true;
      }
    }

    res.status(201).json({
      violation,
      totalViolations: violationCount,
      maxViolations: exam.antiCheat.maxViolations,
      autoSubmitted,
      warning: exam.antiCheat.warningMessage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get violations for an attempt (admin)
// @route   GET /api/violations/attempt/:attemptId
const getAttemptViolations = async (req, res) => {
  try {
    const violations = await ExamViolation.find({ attemptId: req.params.attemptId })
      .populate('user', 'name email')
      .populate('exam', 'title')
      .sort({ timestamp: 1 });
    res.json(violations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get violations for company (admin)
// @route   GET /api/violations
const getViolations = async (req, res) => {
  try {
    const filter = {};
    if (req.companyFilter && req.companyFilter.company) {
      filter.company = req.companyFilter.company;
    }
    if (req.query.examId) filter.exam = req.query.examId;
    if (req.query.userId) filter.user = req.query.userId;
    if (req.query.violationType) filter.violationType = req.query.violationType;

    const violations = await ExamViolation.find(filter)
      .populate('user', 'name email')
      .populate('exam', 'title')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(violations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { reportViolation, getAttemptViolations, getViolations };
