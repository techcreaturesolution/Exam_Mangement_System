const mongoose = require('mongoose');

const paymentPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: 1,
      comment: 'Duration in days',
    },
    planType: {
      type: String,
      enum: ['category', 'subject', 'exam', 'all_access'],
      required: [true, 'Plan type is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
    },
    examType: {
      type: String,
      enum: ['practice', 'mock', 'both'],
      default: 'both',
    },
    features: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentPlan', paymentPlanSchema);
