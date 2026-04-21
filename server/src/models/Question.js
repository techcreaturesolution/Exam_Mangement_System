const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
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
      required: [true, 'Level is required'],
    },
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    optionA: {
      type: String,
      required: [true, 'Option A is required'],
    },
    optionB: {
      type: String,
      required: [true, 'Option B is required'],
    },
    optionC: {
      type: String,
      required: [true, 'Option C is required'],
    },
    optionD: {
      type: String,
      required: [true, 'Option D is required'],
    },
    answer: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
      required: [true, 'Correct answer is required'],
    },
    marks: {
      type: Number,
      default: 1,
    },
    negativeMarks: {
      type: Number,
      default: 0,
    },
    explanation: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
