import 'package:flutter/material.dart';
import '../constants/theme.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notifications')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.notifications_none, size: 80, color: AppColors.textSecondary.withOpacity(0.4)),
              const SizedBox(height: 16),
              const Text('No Notifications', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
              const SizedBox(height: 8),
              const Text('You\'re all caught up! Check back later for exam updates and announcements.',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
            ],
          ),
        ),
      ),
    );
  }
}
