import 'package:flutter/material.dart';
import '../constants/theme.dart';
import '../services/api_service.dart';
import '../constants/api_constants.dart';

class PlansScreen extends StatefulWidget {
  const PlansScreen({super.key});

  @override
  State<PlansScreen> createState() => _PlansScreenState();
}

class _PlansScreenState extends State<PlansScreen> {
  final ApiService _api = ApiService();
  List<dynamic> _plans = [];
  Map<String, dynamic>? _subscription;
  Map<String, dynamic>? _upgradeInfo;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final plans = await _api.get(ApiConstants.plans);
      Map<String, dynamic>? sub;
      try {
        sub = await _api.get(ApiConstants.mySubscription);
      } catch (_) {}

      // If user has active 6-month plan, fetch upgrade price
      Map<String, dynamic>? upgrade;
      if (sub != null) {
        final plan = sub['planId'];
        if (plan != null && plan['durationMonths'] == 6) {
          try {
            upgrade = await _api.get(ApiConstants.upgradePrice);
          } catch (_) {}
        }
      }

      setState(() {
        _plans = plans is List ? plans : [];
        _subscription = sub;
        _upgradeInfo = upgrade;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Choose Your Plan'),
        backgroundColor: AppColors.navy,
        foregroundColor: Colors.white,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 8),
                    const Center(
                      child: Text(
                        'Unlock Your Full Potential',
                        style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Center(
                      child: Text(
                        'Choose a plan that suits your preparation',
                        style: TextStyle(fontSize: 14, color: AppColors.textSecondary),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Show current plan status if subscribed
                    if (_subscription != null) _buildCurrentPlanBanner(),

                    // Show upgrade card if eligible
                    if (_upgradeInfo != null) _buildUpgradeCard(),

                    // Show plan cards
                    ..._plans.map((plan) => _buildPlanCard(plan)),

                    if (_plans.isEmpty)
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.all(40),
                          child: Text('No plans available', style: TextStyle(fontSize: 16, color: AppColors.textSecondary)),
                        ),
                      ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildCurrentPlanBanner() {
    final plan = _subscription!['planId'];
    if (plan == null) return const SizedBox.shrink();
    final endDate = _subscription!['endDate'] ?? '';
    final durationMonths = plan['durationMonths'] ?? 0;
    final daysLeft = endDate.isNotEmpty
        ? DateTime.parse(endDate).difference(DateTime.now()).inDays
        : 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: durationMonths == 12
              ? [AppColors.orange, AppColors.orangeLight]
              : [AppColors.navy, const Color(0xFF2A4F8E)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.card_membership, color: Colors.white, size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  plan['planName'] ?? 'Active Plan',
                  style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  '${durationMonths == 12 ? "1 Year" : "6 Months"} Plan \u2022 $daysLeft days remaining',
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.85), fontSize: 13),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Text('ACTIVE', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildUpgradeCard() {
    final currentPlan = _upgradeInfo!['currentPlan'];
    final upgradePlan = _upgradeInfo!['upgradePlan'];
    final upgradePrice = _upgradeInfo!['upgradePrice'] ?? 0;
    final amountPaid = currentPlan['amountPaid'] ?? 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFFF3E0), Color(0xFFFFE0B2)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.orange, width: 2),
        boxShadow: [
          BoxShadow(
            color: AppColors.orange.withValues(alpha: 0.2),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.orange.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.upgrade, color: AppColors.orange, size: 24),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Text(
                  'Upgrade to Full Access!',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF333333)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                _buildUpgradeRow('Current Plan', '${currentPlan['planName']} (6 Months)', AppColors.navy),
                const Divider(height: 16),
                _buildUpgradeRow('Already Paid', '\u20B9$amountPaid', AppColors.textSecondary),
                const Divider(height: 16),
                _buildUpgradeRow('Upgrade To', '${upgradePlan['planName']} (1 Year)', AppColors.orange),
                const Divider(height: 16),
                _buildUpgradeRow('1 Year Price', '\u20B9${upgradePlan['price']}', AppColors.textSecondary),
                const Divider(height: 16),
                _buildUpgradeRow(
                  'You Pay Only',
                  '\u20B9$upgradePrice',
                  AppColors.orange,
                  isBold: true,
                  fontSize: 20,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: () => _initiateUpgrade(),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.orange,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: 4,
              ),
              child: Text(
                'Upgrade Now — Pay \u20B9$upgradePrice',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
              ),
            ),
          ),
          const SizedBox(height: 8),
          const Center(
            child: Text(
              'Get full access to all topics & mock tests',
              style: TextStyle(fontSize: 12, color: Color(0xFF666666)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUpgradeRow(String label, String value, Color valueColor, {bool isBold = false, double fontSize = 14}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
        Text(
          value,
          style: TextStyle(
            fontSize: fontSize,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
            color: valueColor,
          ),
        ),
      ],
    );
  }

  Widget _buildPlanCard(dynamic plan) {
    final durationMonths = plan['durationMonths'] ?? 6;
    final isYearly = durationMonths == 12;
    final originalPrice = plan['originalPrice'] ?? plan['price'];
    final price = plan['price'] ?? 0;
    final features = plan['features'] as List<dynamic>? ?? [];
    final topicsAllowed = plan['topicsAllowed'] ?? 0;
    final mockTestsAllowed = plan['mockTestsAllowed'] ?? 0;
    final practiceAll = plan['practiceAccessAll'] ?? false;
    final mockAll = plan['mockTestAccessAll'] ?? false;

    // Check if user already has this plan or any active subscription
    final hasThisPlan = _subscription != null &&
        _subscription!['planId'] != null &&
        _subscription!['planId']['durationMonths'] == durationMonths;

    // If user has a 6-month plan and this is the 1-year card, redirect to upgrade
    final hasActiveSub = _subscription != null && _subscription!['planId'] != null;
    final currentDuration = hasActiveSub ? (_subscription!['planId']['durationMonths'] ?? 0) : 0;
    final shouldUseUpgrade = hasActiveSub && !hasThisPlan && isYearly && currentDuration == 6;
    // Disable button if user has any active sub and this isn't their plan or an upgrade target
    final cannotPurchase = hasActiveSub && !hasThisPlan && !shouldUseUpgrade;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: Stack(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isYearly ? AppColors.orange : AppColors.navy,
                width: isYearly ? 2 : 1,
              ),
              boxShadow: [
                BoxShadow(
                  color: (isYearly ? AppColors.orange : AppColors.navy).withValues(alpha: 0.1),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Duration badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: (isYearly ? AppColors.orange : AppColors.navy).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    isYearly ? '1 YEAR' : '6 MONTHS',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: isYearly ? AppColors.orange : AppColors.navy,
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                // Plan Name
                Text(
                  plan['planName'] ?? (isYearly ? 'Premium Plan' : 'Core Plan'),
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: isYearly ? AppColors.orange : AppColors.navy,
                  ),
                ),
                const SizedBox(height: 12),

                // Price
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    if (originalPrice != price)
                      Text(
                        '\u20B9$originalPrice',
                        style: const TextStyle(
                          fontSize: 16,
                          decoration: TextDecoration.lineThrough,
                          color: AppColors.textLight,
                        ),
                      ),
                    if (originalPrice != price) const SizedBox(width: 8),
                    Text(
                      '\u20B9$price',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: isYearly ? AppColors.orange : AppColors.navy,
                      ),
                    ),
                    Text(
                      ' / ${isYearly ? "1 year" : "6 months"}',
                      style: const TextStyle(fontSize: 14, color: AppColors.textSecondary),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Access Info
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: (isYearly ? AppColors.orange : AppColors.navy).withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          children: [
                            Text(
                              practiceAll ? 'All' : '$topicsAllowed',
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: isYearly ? AppColors.orange : AppColors.navy),
                            ),
                            const Text('Topics', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                          ],
                        ),
                      ),
                      Container(width: 1, height: 30, color: AppColors.border),
                      Expanded(
                        child: Column(
                          children: [
                            Text(
                              mockAll ? 'All' : '$mockTestsAllowed',
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: isYearly ? AppColors.orange : AppColors.navy),
                            ),
                            const Text('Mock Tests', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                if (isYearly) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF8E1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.star, color: AppColors.orange, size: 18),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Full access to all exams, mock tests & practice topics',
                            style: TextStyle(fontSize: 12, color: Color(0xFF666666)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: 16),

                // Features
                ...features.map((f) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    children: [
                      Icon(Icons.check_circle, size: 18, color: isYearly ? AppColors.orange : AppColors.success),
                      const SizedBox(width: 8),
                      Expanded(child: Text(f.toString(), style: const TextStyle(fontSize: 14, color: AppColors.textPrimary))),
                    ],
                  ),
                )),

                const SizedBox(height: 16),

                // Buy Button
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: (hasThisPlan || cannotPurchase)
                        ? null
                        : shouldUseUpgrade
                            ? () => _initiateUpgrade()
                            : () => _purchasePlan(plan),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: (hasThisPlan || cannotPurchase)
                          ? Colors.grey.shade300
                          : (shouldUseUpgrade ? AppColors.orange : (isYearly ? AppColors.orange : AppColors.navy)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(
                      hasThisPlan
                          ? 'Current Plan'
                          : cannotPurchase
                              ? 'Already Subscribed'
                              : shouldUseUpgrade
                                  ? 'Upgrade — Pay Difference Only'
                                  : 'Get ${isYearly ? "1-Year" : "6-Month"} Plan',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: (hasThisPlan || cannotPurchase) ? Colors.grey.shade600 : Colors.white,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Badge
          if (isYearly)
            Positioned(
              top: 12,
              right: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.orange,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text('BEST VALUE', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ),
        ],
      ),
    );
  }

  Future<void> _purchasePlan(dynamic plan) async {
    try {
      final orderData = await _api.post(ApiConstants.createOrder, body: {
        'planId': plan['_id'],
      });

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Order created: ${orderData['orderId'] ?? 'Processing...'}'),
          backgroundColor: AppColors.success,
        ),
      );

      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text('Payment Gateway'),
          content: Text('Razorpay payment for \u20B9${plan['price']} will open here.\n\nOrder ID: ${orderData['orderId'] ?? 'N/A'}'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Close'),
            ),
          ],
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  Future<void> _initiateUpgrade() async {
    try {
      final orderData = await _api.post(ApiConstants.createUpgradeOrder, body: {});

      if (!mounted) return;

      final upgradePrice = orderData['upgradePrice'] ?? 0;
      final oldSubId = orderData['oldSubscriptionId'] ?? '';

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Upgrade order created: ${orderData['orderId'] ?? 'Processing...'}'),
          backgroundColor: AppColors.success,
        ),
      );

      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.upgrade, color: AppColors.orange),
              SizedBox(width: 8),
              Text('Upgrade Payment'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Upgrade to 1-Year Premium Plan'),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF3E0),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Amount to Pay:', style: TextStyle(fontWeight: FontWeight.w600)),
                        Text('\u20B9$upgradePrice', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppColors.orange)),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              Text('Order ID: ${orderData['orderId'] ?? 'N/A'}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
              Text('Subscription: $oldSubId', style: const TextStyle(fontSize: 11, color: AppColors.textLight)),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Close'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                // In production, this opens Razorpay SDK with the upgrade order
              },
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.orange),
              child: const Text('Pay Now', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }
}
