const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema(
  {
    levelName: {
      type: String,
      required: [true, 'Level name is required'],
      trim: true,
    },
    sortOrder: {
      type: Number,
      required: true,
      default: 0,
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
