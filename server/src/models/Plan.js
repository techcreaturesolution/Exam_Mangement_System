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
    durationMonths: {
      type: Number,
      enum: [6, 12],
      required: [true, 'Duration is required (6 or 12 months)'],
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
    },
    mockTestsAllowed: {
      type: Number,
      default: 0,
    },
    practiceAccessAll: {
      type: Boolean,
      default: false,
    },
    mockTestAccessAll: {
      type: Boolean,
      default: false,
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
