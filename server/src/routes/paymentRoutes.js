const express = require('express');
const router = express.Router();
const {
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  createOrder,
  verifyPayment,
  getMySubscriptions,
  getMyPayments,
  checkAccess,
  getAllPayments,
} = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/auth');

// Public - get active plans
router.get('/plans', getPlans);
router.get('/plans/:id', getPlan);

// Admin - manage plans
router.post('/plans', protect, adminOnly, createPlan);
router.put('/plans/:id', protect, adminOnly, updatePlan);
router.delete('/plans/:id', protect, adminOnly, deletePlan);

// Admin - view all payments
router.get('/all', protect, adminOnly, getAllPayments);

// User - payment flow
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/my-subscriptions', protect, getMySubscriptions);
router.get('/my-payments', protect, getMyPayments);
router.get('/check-access/:examId', protect, checkAccess);

module.exports = router;
