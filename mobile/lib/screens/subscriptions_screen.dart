import 'package:flutter/material.dart';
import '../constants/theme.dart';
import '../services/api_service.dart';
import '../constants/api_constants.dart';

class SubscriptionsScreen extends StatefulWidget {
  const SubscriptionsScreen({super.key});

  @override
  State<SubscriptionsScreen> createState() => _SubscriptionsScreenState();
}

class _SubscriptionsScreenState extends State<SubscriptionsScreen> {
  final ApiService _api = ApiService();
  Map<String, dynamic>? _subscription;
  List<dynamic> _plans = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final results = await Future.wait([
        _api.get(ApiConstants.mySubscription).catchError((_) => null),
        _api.get(ApiConstants.plans).catchError((_) => []),
      ]);
      setState(() {
        _subscription = results[0] as Map<String, dynamic>?;
        _plans = results[1] as List<dynamic>? ?? [];
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Subscriptions')),
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
                    // Active Plan
                    if (_subscription != null && _subscription!['status'] == 'active') ...[
                      const Text('Active Plan', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),
                      Card(
                        color: AppColors.navy,
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.star, color: AppColors.orange, size: 28),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      _subscription!['planId']?['planName'] ?? 'Premium Plan',
                                      style: const TextStyle(
                                        color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              _subInfoRow('Start Date', _formatDate(_subscription!['startDate'])),
                              _subInfoRow('End Date', _formatDate(_subscription!['endDate'])),
                              _subInfoRow('Status', 'Active'),
                              if (_daysRemaining() > 0)
                                _subInfoRow('Days Remaining', '${_daysRemaining()} days'),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                    ] else ...[
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            children: [
                              Icon(Icons.credit_card_off, size: 48, color: AppColors.textSecondary.withOpacity(0.5)),
                              const SizedBox(height: 12),
                              const Text('No Active Subscription',
                                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                              const SizedBox(height: 4),
                              const Text('Purchase a plan below to access premium exams.',
                                  style: TextStyle(color: AppColors.textSecondary)),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],

                    // Available Plans
                    if (_plans.isNotEmpty) ...[
                      const Text('Available Plans', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),
                      ..._plans.map((plan) => _buildPlanCard(plan)),
                    ],
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildPlanCard(Map<String, dynamic> plan) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(plan['planName'] ?? '',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ),
                Text('₹${plan['price']}',
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.orange)),
              ],
            ),
            const SizedBox(height: 8),
            Text('${plan['validityDays'] ?? 30} days validity',
                style: const TextStyle(color: AppColors.textSecondary)),
            if (plan['description'] != null && plan['description'].toString().isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(plan['description'], style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
            ],
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => _purchasePlan(plan),
                child: const Text('Subscribe Now'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _purchasePlan(Map<String, dynamic> plan) async {
    try {
      final order = await _api.post(ApiConstants.createOrder, body: {
        'planId': plan['_id'],
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Order created: ${order['orderId'] ?? 'Processing'}'),
            backgroundColor: AppColors.success,
          ),
        );
        _loadData();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.error),
        );
      }
    }
  }

  int _daysRemaining() {
    if (_subscription?['endDate'] == null) return 0;
    try {
      final end = DateTime.parse(_subscription!['endDate']);
      return end.difference(DateTime.now()).inDays;
    } catch (e) {
      return 0;
    }
  }

  String _formatDate(String? date) {
    if (date == null) return '';
    try {
      final d = DateTime.parse(date);
      return '${d.day}/${d.month}/${d.year}';
    } catch (e) {
      return '';
    }
  }

  Widget _subInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white70)),
          Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
