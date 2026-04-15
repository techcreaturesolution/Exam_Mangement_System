const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Exam title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    examType: {
      type: String,
      enum: ['practice', 'mock'],
      required: [true, 'Exam type is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
    },
    level: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Level',
      required: [true, 'Level is required'],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company is required'],
    },
    totalQuestions: {
      type: Number,
      required: [true, 'Total questions is required'],
      min: 1,
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: 1,
      comment: 'Duration in minutes',
    },
    passingPercentage: {
      type: Number,
      default: 40,
      min: 0,
      max: 100,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    negativeMarking: {
      type: Boolean,
      default: false,
    },
    shuffleQuestions: {
      type: Boolean,
      default: true,
    },
    showResult: {
      type: Boolean,
      default: true,
    },
    showAnswers: {
      type: Boolean,
      default: false,
    },
    maxAttempts: {
      type: Number,
      default: 0,
      comment: '0 = unlimited',
    },
    instructions: {
      type: String,
      trim: true,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    // Anti-cheat / Proctoring settings
    antiCheat: {
      preventScreenshot: { type: Boolean, default: true },
      preventScreenShare: { type: Boolean, default: true },
      preventAppSwitch: { type: Boolean, default: true },
      autoSubmitOnViolation: { type: Boolean, default: false },
      maxViolations: { type: Number, default: 3 },
      warningMessage: {
        type: String,
        default: 'Warning: Switching apps or taking screenshots during the exam is not allowed.',
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exam', examSchema);
