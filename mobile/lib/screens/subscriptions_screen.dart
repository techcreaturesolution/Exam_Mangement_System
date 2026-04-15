import 'package:flutter/material.dart';
import '../constants/theme.dart';

class SubscriptionsScreen extends StatelessWidget {
  const SubscriptionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Subscriptions')),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.credit_card_off, size: 64, color: AppColors.textLight),
            SizedBox(height: 16),
            Text('No active subscriptions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w500)),
            SizedBox(height: 8),
            Text('Purchase a plan to access premium exams',
              style: TextStyle(color: AppColors.textSecondary)),
          ],
        ),
      ),
    );
  }
}
