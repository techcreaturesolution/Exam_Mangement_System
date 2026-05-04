const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    planName: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
    },
    planType: {
      type: String,
      enum: ['core', 'premium'],
      required: [true, 'Plan type is required'],
    },
    originalPrice: {
      type: Number,
      required: [true, 'Original price is required'],
      min: 0,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    validityDays: {
      type: Number,
      required: [true, 'Validity days is required'],
      min: 1,
    },
    description: {
      type: String,
      trim: true,
    },
    features: [
      {
        type: String,
      },
    ],
    topicsAllowed: {
      type: Number,
      default: 0,
      comment: '0 = unlimited (premium), N = specific number of topics allowed',
    },
    mockTestsAllowed: {
      type: Number,
      default: 0,
      comment: '0 = unlimited (premium), N = specific number of mock tests allowed',
    },
    practiceAccessAll: {
      type: Boolean,
      default: false,
      comment: 'If true, all practice topics accessible',
    },
    mockTestAccessAll: {
      type: Boolean,
      default: false,
      comment: 'If true, all mock tests accessible',
    },
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

module.exports = mongoose.model('Plan', planSchema);
