const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    examTitle: {
      type: String,
      required: [true, 'Exam title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
    },
    levelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Level',
    },
    totalQuestions: {
      type: Number,
      required: [true, 'Total questions is required'],
      min: 1,
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration is required'],
      min: 1,
    },
    passingMarks: {
      type: Number,
      default: 40,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    negativeMarking: {
      type: Boolean,
      default: false,
    },
    randomQuestions: {
      type: Boolean,
      default: true,
    },
    showResult: {
      type: Boolean,
      default: true,
    },
    allowReview: {
      type: Boolean,
      default: true,
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
    maxAttempts: {
      type: Number,
      default: 0,
      comment: '0 = unlimited',
    },
    antiCheatEnabled: {
      type: Boolean,
      default: true,
    },
    maxViolations: {
      type: Number,
      default: 3,
    },
    autoSubmitOnViolation: {
      type: Boolean,
      default: false,
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
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'archived'],
      default: 'active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exam', examSchema);
