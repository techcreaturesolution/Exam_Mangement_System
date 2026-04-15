import 'package:flutter/material.dart';
import '../constants/theme.dart';

class ExamDetailScreen extends StatelessWidget {
  const ExamDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final exam = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    if (exam == null) return const Scaffold(body: Center(child: Text('Exam not found')));

    final antiCheat = exam['antiCheat'] as Map<String, dynamic>? ?? {};
    final hasAntiCheat = antiCheat['preventScreenshot'] == true ||
        antiCheat['preventScreenShare'] == true ||
        antiCheat['preventAppSwitch'] == true;

    return Scaffold(
      appBar: AppBar(title: Text(exam['title'] ?? 'Exam Details')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Exam Info Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(exam['title'] ?? '', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                    if (exam['description'] != null && exam['description'].isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Text(exam['description'], style: const TextStyle(color: AppColors.textSecondary)),
                    ],
                    const SizedBox(height: 20),
                    _infoRow(Icons.quiz, 'Questions', '${exam['totalQuestions']}'),
                    _infoRow(Icons.timer, 'Duration', '${exam['duration']} minutes'),
                    _infoRow(Icons.star, 'Total Marks', '${exam['totalMarks']}'),
                    _infoRow(Icons.check_circle, 'Passing', '${exam['passingPercentage']}%'),
                    if (exam['negativeMarking'] == true)
                      _infoRow(Icons.remove_circle, 'Negative Marking', 'Yes'),
                    if (exam['maxAttempts'] != null && exam['maxAttempts'] > 0)
                      _infoRow(Icons.replay, 'Max Attempts', '${exam['maxAttempts']}'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Anti-cheat Warning
            if (hasAntiCheat)
              Card(
                color: AppColors.warning.withValues(alpha: 0.1),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.shield, color: AppColors.warning),
                          SizedBox(width: 8),
                          Text('Exam Security', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.warning)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      if (antiCheat['preventScreenshot'] == true)
                        _securityItem(Icons.no_photography, 'Screenshots are disabled during this exam'),
                      if (antiCheat['preventScreenShare'] == true)
                        _securityItem(Icons.screen_share, 'Screen sharing is not allowed'),
                      if (antiCheat['preventAppSwitch'] == true)
                        _securityItem(Icons.app_blocking, 'Switching apps will be recorded as a violation'),
                      if (antiCheat['autoSubmitOnViolation'] == true)
                        _securityItem(Icons.warning, 'Exam will auto-submit after ${antiCheat['maxViolations'] ?? 3} violations'),
                    ],
                  ),
                ),
              ),

            // Instructions
            if (exam['instructions'] != null && exam['instructions'].isNotEmpty) ...[
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Instructions', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Text(exam['instructions'], style: const TextStyle(color: AppColors.textSecondary)),
                    ],
                  ),
                ),
              ),
            ],

            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.play_arrow),
                label: const Text('Start Exam', style: TextStyle(fontSize: 18)),
                onPressed: () => Navigator.pushReplacementNamed(context, '/exam-take', arguments: exam),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _infoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.navy),
          const SizedBox(width: 12),
          Text(label, style: const TextStyle(color: AppColors.textSecondary)),
          const Spacer(),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _securityItem(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: AppColors.error),
          const SizedBox(width: 8),
          Expanded(child: Text(text, style: const TextStyle(fontSize: 13, color: AppColors.textPrimary))),
        ],
      ),
    );
  }
}
