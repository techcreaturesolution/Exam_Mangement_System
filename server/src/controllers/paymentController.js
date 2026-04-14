const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Payment = require('../models/Payment');
const PaymentPlan = require('../models/PaymentPlan');

// ============ PAYMENT PLAN (Admin) ============

// @desc    Get all payment plans
// @route   GET /api/payments/plans
const getPlans = async (req, res) => {
  try {
    const { isActive, planType } = req.query;
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (planType) filter.planType = planType;

    const plans = await PaymentPlan.find(filter)
      .populate('category', 'name')
      .populate('subject', 'name')
      .populate('exam', 'title')
      .sort({ order: 1, createdAt: -1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single plan
// @route   GET /api/payments/plans/:id
const getPlan = async (req, res) => {
  try {
    const plan = await PaymentPlan.findById(req.params.id)
      .populate('category', 'name')
      .populate('subject', 'name')
      .populate('exam', 'title');
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create payment plan
// @route   POST /api/payments/plans
const createPlan = async (req, res) => {
  try {
    const plan = await PaymentPlan.create(req.body);
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update payment plan
// @route   PUT /api/payments/plans/:id
const updatePlan = async (req, res) => {
  try {
    const plan = await PaymentPlan.findByIdAndUpdate(req.params.id, req.body, {
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

// @desc    Delete payment plan
// @route   DELETE /api/payments/plans/:id
const deletePlan = async (req, res) => {
  try {
    const plan = await PaymentPlan.findByIdAndDelete(req.params.id);
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

    const plan = await PaymentPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    if (!plan.isActive) {
      return res.status(400).json({ message: 'This plan is no longer available' });
    }

    const receipt = `receipt_${Date.now()}_${req.user._id.toString().slice(-6)}`;

    const options = {
      amount: Math.round(plan.price * 100), // Razorpay expects amount in paise
      currency: plan.currency || 'INR',
      receipt,
      notes: {
        planId: plan._id.toString(),
        userId: req.user._id.toString(),
        planName: plan.name,
      },
    };

    const order = await razorpay.orders.create(options);

    // Save payment record
    const payment = await Payment.create({
      user: req.user._id,
      plan: plan._id,
      razorpayOrderId: order.id,
      amount: plan.price,
      currency: plan.currency || 'INR',
      status: 'created',
      receipt,
    });

    res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment._id,
      planName: plan.name,
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

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Update payment status to failed
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'failed' }
      );
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'paid',
      },
      { new: true }
    ).populate('plan');

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // Set expiry date based on plan duration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + payment.plan.duration);
    payment.expiresAt = expiresAt;
    await payment.save();

    res.json({
      message: 'Payment verified successfully',
      payment: {
        _id: payment._id,
        status: payment.status,
        amount: payment.amount,
        expiresAt: payment.expiresAt,
        plan: payment.plan.name,
      },
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's active subscriptions
// @route   GET /api/payments/my-subscriptions
const getMySubscriptions = async (req, res) => {
  try {
    const payments = await Payment.find({
      user: req.user._id,
      status: 'paid',
      expiresAt: { $gte: new Date() },
    })
      .populate({
        path: 'plan',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'subject', select: 'name' },
          { path: 'exam', select: 'title' },
        ],
      })
      .sort({ expiresAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's payment history
// @route   GET /api/payments/my-payments
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('plan', 'name price duration planType')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if user has access to an exam
// @route   GET /api/payments/check-access/:examId
const checkAccess = async (req, res) => {
  try {
    const { examId } = req.params;

    // Check for all_access plan
    const allAccess = await Payment.findOne({
      user: req.user._id,
      status: 'paid',
      expiresAt: { $gte: new Date() },
    }).populate({
      path: 'plan',
      match: { planType: 'all_access' },
    });

    if (allAccess && allAccess.plan) {
      return res.json({ hasAccess: true, type: 'all_access' });
    }

    // Check for specific exam plan
    const examAccess = await Payment.findOne({
      user: req.user._id,
      status: 'paid',
      expiresAt: { $gte: new Date() },
    }).populate({
      path: 'plan',
      match: { planType: 'exam', exam: examId },
    });

    if (examAccess && examAccess.plan) {
      return res.json({ hasAccess: true, type: 'exam' });
    }

    // Check for category/subject level access through the exam
    const Exam = require('../models/Exam');
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check category access
    const categoryAccess = await Payment.findOne({
      user: req.user._id,
      status: 'paid',
      expiresAt: { $gte: new Date() },
    }).populate({
      path: 'plan',
      match: { planType: 'category', category: exam.category },
    });

    if (categoryAccess && categoryAccess.plan) {
      return res.json({ hasAccess: true, type: 'category' });
    }

    // Check subject access
    const subjectAccess = await Payment.findOne({
      user: req.user._id,
      status: 'paid',
      expiresAt: { $gte: new Date() },
    }).populate({
      path: 'plan',
      match: { planType: 'subject', subject: exam.subject },
    });

    if (subjectAccess && subjectAccess.plan) {
      return res.json({ hasAccess: true, type: 'subject' });
    }

    // No access - return available plans
    const availablePlans = await PaymentPlan.find({
      isActive: true,
      $or: [
        { planType: 'all_access' },
        { planType: 'exam', exam: examId },
        { planType: 'category', category: exam.category },
        { planType: 'subject', subject: exam.subject },
      ],
    }).sort({ price: 1 });

    res.json({ hasAccess: false, availablePlans });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all payments (Admin)
// @route   GET /api/payments/all
const getAllPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Payment.countDocuments(filter);

    const payments = await Payment.find(filter)
      .populate('user', 'name email')
      .populate('plan', 'name price duration planType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Revenue stats
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      payments,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      totalRevenue: totalRevenue[0]?.total || 0,
    });
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
  getMySubscriptions,
  getMyPayments,
  checkAccess,
  getAllPayments,
};
