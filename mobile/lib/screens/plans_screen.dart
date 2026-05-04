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
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadPlans();
  }

  Future<void> _loadPlans() async {
    try {
      final data = await _api.get(ApiConstants.plans);
      setState(() {
        _plans = data is List ? data : [];
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
          : SingleChildScrollView(
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
    );
  }

  Widget _buildPlanCard(dynamic plan) {
    final isPremium = plan['planType'] == 'premium';
    final originalPrice = plan['originalPrice'] ?? plan['price'];
    final price = plan['price'] ?? 0;
    final features = plan['features'] as List<dynamic>? ?? [];
    final topicsAllowed = plan['topicsAllowed'] ?? 0;
    final mockTestsAllowed = plan['mockTestsAllowed'] ?? 0;
    final practiceAll = plan['practiceAccessAll'] ?? false;
    final mockAll = plan['mockTestAccessAll'] ?? false;

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
                color: isPremium ? AppColors.orange : AppColors.navy,
                width: isPremium ? 2 : 1,
              ),
              boxShadow: [
                BoxShadow(
                  color: (isPremium ? AppColors.orange : AppColors.navy).withValues(alpha: 0.1),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Plan Name
                Text(
                  plan['planName'] ?? (isPremium ? 'Premium Plan' : 'Core Plan'),
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: isPremium ? AppColors.orange : AppColors.navy,
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
                        color: isPremium ? AppColors.orange : AppColors.navy,
                      ),
                    ),
                    Text(
                      ' /${plan['validityDays'] ?? 30} days',
                      style: const TextStyle(fontSize: 14, color: AppColors.textSecondary),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Access Info
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: (isPremium ? AppColors.orange : AppColors.navy).withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          children: [
                            Text(
                              practiceAll ? 'All' : '$topicsAllowed',
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: isPremium ? AppColors.orange : AppColors.navy),
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
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: isPremium ? AppColors.orange : AppColors.navy),
                            ),
                            const Text('Mock Tests', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Features
                ...features.map((f) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    children: [
                      Icon(Icons.check_circle, size: 18, color: isPremium ? AppColors.orange : AppColors.success),
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
                    onPressed: () => _purchasePlan(plan),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isPremium ? AppColors.orange : AppColors.navy,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(
                      'Get ${isPremium ? "Premium" : "Core"} Plan',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Badge
          if (isPremium)
            Positioned(
              top: 12,
              right: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.orange,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text('MOST POPULAR', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
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
        'amount': plan['price'],
      });

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Order created: ${orderData['orderId'] ?? 'Processing...'}'),
          backgroundColor: AppColors.success,
        ),
      );

      // In production, this would open Razorpay payment gateway
      // For now, show success message
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
}
