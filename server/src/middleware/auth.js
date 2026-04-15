const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).populate('company');
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Master Admin only
const masterAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'master_admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Master Admin only.' });
  }
};

// Admin (company admin) or Master Admin
const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'master_admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

// Middleware to inject company filter for multi-tenant data scoping
const companyScope = (req, res, next) => {
  if (req.user.role === 'master_admin') {
    // Master admin can access all companies' data
    // If a company query param is provided, scope to that company
    req.companyFilter = req.query.companyId ? { company: req.query.companyId } : {};
  } else if (req.user.role === 'admin') {
    // Company admin can only access their own company's data
    if (!req.user.company) {
      return res.status(403).json({ message: 'Admin not assigned to any company.' });
    }
    req.companyFilter = { company: req.user.company._id || req.user.company };
    req.companyId = req.user.company._id || req.user.company;
  } else {
    // Regular user - scope to their company
    if (req.user.company) {
      req.companyFilter = { company: req.user.company._id || req.user.company };
      req.companyId = req.user.company._id || req.user.company;
    } else {
      req.companyFilter = {};
    }
  }
  next();
};

module.exports = { protect, masterAdminOnly, adminOnly, companyScope };
