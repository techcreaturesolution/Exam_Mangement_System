const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  register,
  login,
  forgotPassword,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Admin user management
const User = require('../models/User');
const Subscription = require('../models/Subscription');

// GET /api/users - Get all students (admin)
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const filter = { role: 'student' };
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { mobile: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    // Attach active subscription info
    const usersWithSubs = await Promise.all(users.map(async (user) => {
      const subscription = await Subscription.findOne({
        userId: user._id,
        status: 'active',
        endDate: { $gte: new Date() },
      }).populate('planId', 'planName');

      return {
        ...user.toObject(),
        activeSubscription: subscription ? {
          planName: subscription.planId?.planName,
          expiresAt: subscription.endDate,
        } : null,
      };
    }));

    res.json(usersWithSubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/users/:id
router.get('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/users/:id
router.put('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, email, mobile, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, mobile, isActive },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/users/:id
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
