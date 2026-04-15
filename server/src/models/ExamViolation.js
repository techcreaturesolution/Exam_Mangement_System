const mongoose = require('mongoose');

const examViolationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    attemptId: {
      type: String,
      required: true,
    },
    violationType: {
      type: String,
      enum: ['screenshot', 'screen_share', 'app_switch', 'other'],
      required: true,
    },
    description: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ExamViolation', examViolationSchema);
