const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register user (with company code)
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, companyCode } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const userData = { name, email, password, phone };

    // If company code/slug provided, attach user to company
    if (companyCode) {
      const company = await Company.findOne({
        $or: [{ slug: companyCode }, { _id: companyCode.match(/^[0-9a-fA-F]{24}$/) ? companyCode : null }],
        isActive: true,
      });
      if (!company) {
        return res.status(400).json({ message: 'Invalid company code' });
      }
      userData.company = company._id;
    }

    const user = await User.create(userData);
    const populatedUser = await User.findById(user._id).populate('company', 'name slug logo');

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: populatedUser.company || null,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password').populate('company', 'name slug logo');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company || null,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('company', 'name slug logo features');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin login (company admin or master admin)
// @route   POST /api/auth/admin/login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email,
      role: { $in: ['admin', 'master_admin'] },
    }).select('+password').populate('company', 'name slug logo');

    if (!user) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company || null,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (admin - scoped to company)
// @route   GET /api/auth/users
const getUsers = async (req, res) => {
  try {
    const filter = {};

    // Company admin can only see their company's users
    if (req.user.role === 'admin' && req.user.company) {
      filter.company = req.user.company._id || req.user.company;
    }
    // Master admin can see all or filter by company
    if (req.user.role === 'master_admin' && req.query.companyId) {
      filter.company = req.query.companyId;
    }

    const users = await User.find(filter)
      .select('-password')
      .populate('company', 'name slug')
      .sort({ createdAt: -1 });

    // Attach active plan info
    const Payment = require('../models/Payment');
    const usersWithPlans = await Promise.all(users.map(async (user) => {
      const activePlan = await Payment.findOne({
        user: user._id,
        status: 'paid',
        expiresAt: { $gte: new Date() },
      }).populate('plan', 'name planType').sort({ expiresAt: -1 });

      return {
        ...user.toObject(),
        activePlan: activePlan ? { name: activePlan.plan?.name, expiresAt: activePlan.expiresAt } : null,
      };
    }));

    res.json(usersWithPlans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe, adminLogin, getUsers };
