const express = require('express');
const router = express.Router();
const {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyAdmins,
  addCompanyAdmin,
  getCompanyStats,
} = require('../controllers/companyController');
const { protect, masterAdminOnly } = require('../middleware/auth');

// All company routes are Master Admin only
router.get('/stats/overview', protect, masterAdminOnly, getCompanyStats);
router.get('/', protect, masterAdminOnly, getCompanies);
router.get('/:id', protect, masterAdminOnly, getCompany);
router.post('/', protect, masterAdminOnly, createCompany);
router.put('/:id', protect, masterAdminOnly, updateCompany);
router.delete('/:id', protect, masterAdminOnly, deleteCompany);
router.get('/:id/admins', protect, masterAdminOnly, getCompanyAdmins);
router.post('/:id/admins', protect, masterAdminOnly, addCompanyAdmin);

module.exports = router;
