const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  createOrder,
  verifyPayment,
  getMySubscription,
  getPaymentHistory,
  checkAccess,
  getUpgradePrice,
  createUpgradeOrder,
} = require('../controllers/paymentController');

// Plan management (admin)
router.get('/plans', protect, getPlans);
router.get('/plans/:id', protect, getPlan);
router.post('/plans', protect, adminOnly, createPlan);
router.put('/plans/:id', protect, adminOnly, updatePlan);
router.delete('/plans/:id', protect, adminOnly, deletePlan);

// Payment operations
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/my-subscription', protect, getMySubscription);
router.get('/check-access', protect, checkAccess);
router.get('/history', protect, getPaymentHistory);

// Plan upgrade
router.get('/upgrade-price', protect, getUpgradePrice);
router.post('/create-upgrade-order', protect, createUpgradeOrder);

module.exports = router;
