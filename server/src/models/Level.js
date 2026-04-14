const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Level name is required'],
      trim: true,
      enum: ['easy', 'medium', 'hard', 'expert'],
    },
    description: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
      default: '#4CAF50',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Level', levelSchema);
