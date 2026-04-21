const Violation = require('../models/ExamViolation');
const ExamAttempt = require('../models/ExamAttempt');
const Exam = require('../models/Exam');

// @desc    Report a violation during exam
// @route   POST /api/violations
const reportViolation = async (req, res) => {
  try {
    const { examId, attemptId, type, description } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const violation = await Violation.create({
      userId: req.user._id,
      examId,
      attemptId,
      type,
      description,
    });

    // Count violations for this attempt
    const violationCount = await Violation.countDocuments({
      userId: req.user._id,
      attemptId,
    });

    // Update attempt violation count
    await ExamAttempt.findByIdAndUpdate(attemptId, { violations: violationCount });

    let autoSubmitted = false;
    if (exam.antiCheatEnabled && violationCount >= exam.maxViolations) {
      const attempt = await ExamAttempt.findById(attemptId);
      if (attempt && attempt.status === 'in_progress') {
        attempt.status = 'auto_submitted';
        attempt.submittedAt = new Date();
        attempt.timeSpent = Math.round((attempt.submittedAt - attempt.startedAt) / 1000);
        await attempt.save();
        autoSubmitted = true;
      }
    }

    res.status(201).json({
      violation,
      totalViolations: violationCount,
      maxViolations: exam.maxViolations,
      autoSubmitted,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get violations for an attempt
// @route   GET /api/violations/attempt/:attemptId
const getAttemptViolations = async (req, res) => {
  try {
    const violations = await Violation.find({ attemptId: req.params.attemptId })
      .populate('userId', 'name email')
      .populate('examId', 'examTitle')
      .sort({ createdAt: 1 });
    res.json(violations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all violations (admin)
// @route   GET /api/violations
const getViolations = async (req, res) => {
  try {
    const filter = {};
    if (req.query.examId) filter.examId = req.query.examId;
    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.type) filter.type = req.query.type;

    const violations = await Violation.find(filter)
      .populate('userId', 'name email')
      .populate('examId', 'examTitle')
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(violations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { reportViolation, getAttemptViolations, getViolations };
