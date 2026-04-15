const Company = require('../models/Company');
const User = require('../models/User');

// @desc    Get all companies (Master Admin)
// @route   GET /api/companies
const getCompanies = async (req, res) => {
  try {
    const { isActive, plan, search } = req.query;
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (plan) filter.plan = plan;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const companies = await Company.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Count admins and users per company
    const companiesWithCounts = await Promise.all(
      companies.map(async (company) => {
        const adminCount = await User.countDocuments({ company: company._id, role: 'admin' });
        const userCount = await User.countDocuments({ company: company._id, role: 'user' });
        return {
          ...company.toObject(),
          adminCount,
          userCount,
        };
      })
    );

    res.json(companiesWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single company
// @route   GET /api/companies/:id
const getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('createdBy', 'name email');
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const adminCount = await User.countDocuments({ company: company._id, role: 'admin' });
    const userCount = await User.countDocuments({ company: company._id, role: 'user' });

    res.json({
      ...company.toObject(),
      adminCount,
      userCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create company (Master Admin)
// @route   POST /api/companies
const createCompany = async (req, res) => {
  try {
    const companyData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const company = await Company.create(companyData);

    // If adminEmail and adminName provided, create admin user for this company
    if (req.body.adminEmail && req.body.adminName) {
      const existingAdmin = await User.findOne({ email: req.body.adminEmail });
      if (existingAdmin) {
        return res.status(400).json({ message: 'Admin email already exists' });
      }

      await User.create({
        name: req.body.adminName,
        email: req.body.adminEmail,
        password: req.body.adminPassword || 'admin123456',
        phone: req.body.adminPhone || '',
        role: 'admin',
        company: company._id,
      });
    }

    const populated = await company.populate('createdBy', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update company (Master Admin)
// @route   PUT /api/companies/:id
const updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'name email');

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete company (Master Admin)
// @route   DELETE /api/companies/:id
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Deactivate all users in this company
    await User.updateMany({ company: company._id }, { isActive: false });

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get company admins
// @route   GET /api/companies/:id/admins
const getCompanyAdmins = async (req, res) => {
  try {
    const admins = await User.find({ company: req.params.id, role: 'admin' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add admin to company
// @route   POST /api/companies/:id/admins
const addCompanyAdmin = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const admin = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password || 'admin123456',
      phone: req.body.phone || '',
      role: 'admin',
      company: company._id,
    });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      company: admin.company,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get company stats (Master Admin dashboard)
// @route   GET /api/companies/stats/overview
const getCompanyStats = async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const activeCompanies = await Company.countDocuments({ isActive: true });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalUsers = await User.countDocuments({ role: 'user' });

    // Companies by plan
    const byPlan = await Company.aggregate([
      { $group: { _id: '$plan', count: { $sum: 1 } } },
    ]);

    // Recent companies
    const recentCompanies = await Company.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name plan isActive createdAt');

    res.json({
      totalCompanies,
      activeCompanies,
      totalAdmins,
      totalUsers,
      byPlan,
      recentCompanies,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyAdmins,
  addCompanyAdmin,
  getCompanyStats,
};
