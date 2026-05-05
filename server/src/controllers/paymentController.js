const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Payment = require('../models/Payment');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');

// ============ PLAN MANAGEMENT (Admin) ============

// @desc    Get all plans
// @route   GET /api/payments/plans
const getPlans = async (req, res) => {
  try {
    const filter = {};
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.durationMonths) filter.durationMonths = parseInt(req.query.durationMonths);

    const plans = await Plan.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single plan
// @route   GET /api/payments/plans/:id
const getPlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create plan
// @route   POST /api/payments/plans
const createPlan = async (req, res) => {
  try {
    const plan = await Plan.create(req.body);
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update plan
// @route   PUT /api/payments/plans/:id
const updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete plan
// @route   DELETE /api/payments/plans/:id
const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ RAZORPAY PAYMENT ============

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
const createOrder = async (req, res) => {
  try {
    const { planId } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    if (!plan.isActive) {
      return res.status(400).json({ message: 'This plan is no longer available' });
    }

    // Reject if user already has an active subscription — must use upgrade endpoint instead
    const existingSub = await Subscription.findOne({
      userId: req.user._id,
      status: 'active',
      endDate: { $gte: new Date() },
    });
    if (existingSub) {
      return res.status(400).json({ message: 'You already have an active subscription. Use the upgrade option to change plans.' });
    }

    const receipt = `receipt_${Date.now()}_${req.user._id.toString().slice(-6)}`;

    const options = {
      amount: Math.round(plan.price * 100),
      currency: 'INR',
      receipt,
      notes: {
        planId: plan._id.toString(),
        userId: req.user._id.toString(),
        planName: plan.planName,
      },
    };

    const order = await razorpay.orders.create(options);

    const payment = await Payment.create({
      userId: req.user._id,
      planId: plan._id,
      razorpayOrderId: order.id,
      amount: plan.price,
      status: 'created',
      receipt,
    });

    res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment._id,
      planName: plan.planName,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id, userId: req.user._id, status: 'created' },
        { status: 'failed' }
      );
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // First, find the payment without updating to validate upgrade state
    const pendingPayment = await Payment.findOne(
      { razorpayOrderId: razorpay_order_id, userId: req.user._id, status: 'created' }
    ).populate('planId');

    if (!pendingPayment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // For upgrades, validate old subscription is still active BEFORE marking payment as paid
    if (pendingPayment.isUpgrade && pendingPayment.oldSubscriptionId) {
      const oldSub = await Subscription.findOne({
        _id: pendingPayment.oldSubscriptionId,
        userId: pendingPayment.userId,
        status: 'active',
      });
      if (!oldSub) {
        await Payment.findByIdAndUpdate(pendingPayment._id, { status: 'refund_needed' });
        return res.status(400).json({ message: 'Subscription was already upgraded. Payment marked for refund.' });
      }
    }

    // Now atomically mark payment as paid
    const payment = await Payment.findOneAndUpdate(
      { _id: pendingPayment._id, status: 'created' },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        gatewayId: razorpay_payment_id,
        status: 'paid',
      },
      { new: true }
    ).populate('planId');

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // Create new subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + payment.planId.validityDays);

    await Subscription.create({
      userId: payment.userId,
      planId: payment.planId._id,
      startDate,
      endDate,
      amountPaid: payment.amount,
      status: 'active',
      isUpgrade: payment.isUpgrade || false,
      upgradedFrom: payment.oldSubscriptionId || null,
    });

    // Handle upgrade: deactivate old subscription AFTER new one is created
    if (payment.isUpgrade && payment.oldSubscriptionId) {
      await Subscription.findOneAndUpdate(
        { _id: payment.oldSubscriptionId, userId: payment.userId, status: 'active' },
        { status: 'upgraded' }
      );
    }

    res.json({
      message: 'Payment verified successfully',
      payment: {
        _id: payment._id,
        status: payment.status,
        amount: payment.amount,
        planName: payment.planId.planName,
      },
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============ PLAN UPGRADE ============

// @desc    Get upgrade price (differential amount)
// @route   GET /api/payments/upgrade-price
const getUpgradePrice = async (req, res) => {
  try {
    // Find user's active 6-month subscription
    const currentSub = await Subscription.findOne({
      userId: req.user._id,
      status: 'active',
      endDate: { $gte: new Date() },
    }).populate('planId').sort({ endDate: -1 });

    if (!currentSub) {
      return res.status(400).json({ message: 'No active subscription found' });
    }

    if (currentSub.planId.durationMonths === 12) {
      return res.status(400).json({ message: 'You already have a 1-year plan' });
    }

    // Find the 1-year (premium) plan
    const yearlyPlan = await Plan.findOne({
      durationMonths: 12,
      isActive: true,
    }).sort({ order: 1 });

    if (!yearlyPlan) {
      return res.status(404).json({ message: 'No 1-year plan available' });
    }

    const amountAlreadyPaid = currentSub.amountPaid || currentSub.planId.price || 0;
    const upgradePrice = Math.max(0, yearlyPlan.price - amountAlreadyPaid);

    res.json({
      currentPlan: {
        _id: currentSub.planId._id,
        planName: currentSub.planId.planName,
        durationMonths: currentSub.planId.durationMonths,
        price: currentSub.planId.price,
        amountPaid: amountAlreadyPaid,
        endDate: currentSub.endDate,
      },
      upgradePlan: {
        _id: yearlyPlan._id,
        planName: yearlyPlan.planName,
        durationMonths: yearlyPlan.durationMonths,
        price: yearlyPlan.price,
      },
      upgradePrice,
      currentSubscriptionId: currentSub._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Razorpay order for plan upgrade
// @route   POST /api/payments/create-upgrade-order
const createUpgradeOrder = async (req, res) => {
  try {
    // Find user's active 6-month subscription
    const currentSub = await Subscription.findOne({
      userId: req.user._id,
      status: 'active',
      endDate: { $gte: new Date() },
    }).populate('planId').sort({ endDate: -1 });

    if (!currentSub) {
      return res.status(400).json({ message: 'No active subscription found' });
    }

    if (currentSub.planId.durationMonths === 12) {
      return res.status(400).json({ message: 'You already have a 1-year plan' });
    }

    // Find the 1-year plan
    const yearlyPlan = await Plan.findOne({
      durationMonths: 12,
      isActive: true,
    }).sort({ order: 1 });

    if (!yearlyPlan) {
      return res.status(404).json({ message: 'No 1-year plan available' });
    }

    const amountAlreadyPaid = currentSub.amountPaid || currentSub.planId.price || 0;
    const upgradePrice = Math.max(0, yearlyPlan.price - amountAlreadyPaid);

    if (upgradePrice <= 0) {
      return res.status(400).json({ message: 'No additional payment required' });
    }

    const receipt = `upgrade_${Date.now()}_${req.user._id.toString().slice(-6)}`;

    const options = {
      amount: Math.round(upgradePrice * 100),
      currency: 'INR',
      receipt,
      notes: {
        planId: yearlyPlan._id.toString(),
        userId: req.user._id.toString(),
        planName: yearlyPlan.planName,
        isUpgrade: 'true',
        oldSubscriptionId: currentSub._id.toString(),
      },
    };

    const order = await razorpay.orders.create(options);

    const payment = await Payment.create({
      userId: req.user._id,
      planId: yearlyPlan._id,
      razorpayOrderId: order.id,
      amount: upgradePrice,
      status: 'created',
      receipt,
      isUpgrade: true,
      oldSubscriptionId: currentSub._id,
    });

    res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment._id,
      planName: yearlyPlan.planName,
      key: process.env.RAZORPAY_KEY_ID,
      isUpgrade: true,
      oldSubscriptionId: currentSub._id,
      upgradePrice,
      originalYearlyPrice: yearlyPlan.price,
      amountAlreadyPaid,
    });
  } catch (error) {
    console.error('Upgrade order creation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============ SUBSCRIPTIONS ============

// @desc    Get user's active subscription
// @route   GET /api/payments/my-subscription
const getMySubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      status: 'active',
      endDate: { $gte: new Date() },
    })
      .populate('planId')
      .sort({ endDate: -1 });

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's payment history
// @route   GET /api/payments/history
const getPaymentHistory = async (req, res) => {
  try {
    const filter = {};

    // If student, only show their own
    if (req.user.role === 'student') {
      filter.userId = req.user._id;
    }

    // Admin can filter by userId
    if (req.user.role === 'admin' && req.query.userId) {
      filter.userId = req.query.userId;
    }

    if (req.query.status) filter.status = req.query.status;

    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Payment.countDocuments(filter);

    const payments = await Payment.find(filter)
      .populate('userId', 'name email mobile')
      .populate('planId', 'planName price validityDays durationMonths')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Revenue stats (admin only)
    let totalRevenue = 0;
    if (req.user.role === 'admin') {
      const revenueResult = await Payment.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      totalRevenue = revenueResult[0]?.total || 0;
    }

    res.json({
      payments,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if user has active subscription
// @route   GET /api/payments/check-access
const checkAccess = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      status: 'active',
      endDate: { $gte: new Date() },
    }).populate('planId');

    if (subscription) {
      return res.json({
        hasAccess: true,
        plan: subscription.planId,
        expiresAt: subscription.endDate,
        durationMonths: subscription.planId.durationMonths,
        canUpgrade: subscription.planId.durationMonths === 6,
      });
    }

    // Return available plans
    const availablePlans = await Plan.find({ isActive: true }).sort({ price: 1 });
    res.json({ hasAccess: false, availablePlans });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
