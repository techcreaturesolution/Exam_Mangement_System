const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    // Subscription/plan for the company
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free',
    },
    maxUsers: {
      type: Number,
      default: 100,
    },
    maxExams: {
      type: Number,
      default: 10,
    },
    maxQuestions: {
      type: Number,
      default: 500,
    },
    // Features
    features: {
      antiCheat: { type: Boolean, default: true },
      razorpayEnabled: { type: Boolean, default: false },
      razorpayKeyId: { type: String },
      razorpayKeySecret: { type: String },
      customBranding: { type: Boolean, default: false },
      brandColor: { type: String, default: '#1E3A6E' },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Auto-generate slug from name
companySchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Company', companySchema);
