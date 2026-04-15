import 'package:flutter/material.dart';
import '../constants/theme.dart';

class AnalyticsScreen extends StatelessWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Analytics')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Stats Cards
            Row(
              children: [
                _card('Accuracy', '0%', Icons.trending_up, AppColors.success),
                const SizedBox(width: 12),
                _card('MCQs Done', '0', Icons.quiz, AppColors.navy),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _card('Day Streak', '0', Icons.local_fire_department, AppColors.orange),
                const SizedBox(width: 12),
                _card('Exams Taken', '0', Icons.assignment, AppColors.navyLight),
              ],
            ),
            const SizedBox(height: 24),

            // Topic Accuracy placeholder
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Topic-wise Accuracy', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    _topicBar('General Knowledge', 0.0),
                    _topicBar('Mathematics', 0.0),
                    _topicBar('Science', 0.0),
                    _topicBar('English', 0.0),
                    const SizedBox(height: 8),
                    const Center(
                      child: Text('Take some exams to see your analytics!',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _card(String label, String value, IconData icon, Color color) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Icon(icon, color: color, size: 32),
              const SizedBox(height: 8),
              Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
              Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _topicBar(String topic, double value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(topic, style: const TextStyle(fontSize: 13)),
              Text('${(value * 100).toStringAsFixed(0)}%', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: value,
              backgroundColor: AppColors.border,
              valueColor: const AlwaysStoppedAnimation(AppColors.navy),
              minHeight: 8,
            ),
          ),
        ],
      ),
    );
  }
}
