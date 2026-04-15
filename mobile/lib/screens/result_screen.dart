import 'package:flutter/material.dart';
import 'package:percent_indicator/circular_percent_indicator.dart';
import '../constants/theme.dart';

class ResultScreen extends StatelessWidget {
  const ResultScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final result = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    if (result == null) return const Scaffold(body: Center(child: Text('No result data')));

    final percentage = (result['percentage'] ?? 0).toDouble();
    final isPassed = result['isPassed'] ?? false;
    final correct = result['correctAnswers'] ?? 0;
    final wrong = result['wrongAnswers'] ?? 0;
    final skipped = result['skippedAnswers'] ?? 0;
    final total = result['totalQuestions'] ?? 0;
    final score = result['score'] ?? 0;
    final totalMarks = result['totalMarks'] ?? 0;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, r) {
        if (!didPop) Navigator.pushReplacementNamed(context, '/home');
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: const Text('Results'),
          leading: IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => Navigator.pushReplacementNamed(context, '/home'),
          ),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              // Score Circle
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      CircularPercentIndicator(
                        radius: 80,
                        lineWidth: 12,
                        percent: (percentage / 100).clamp(0.0, 1.0),
                        center: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text('${percentage.toStringAsFixed(1)}%',
                              style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
                            Text('$score / $totalMarks',
                              style: const TextStyle(color: AppColors.textSecondary, fontSize: 14)),
                          ],
                        ),
                        progressColor: isPassed ? AppColors.success : AppColors.error,
                        backgroundColor: AppColors.border,
                        circularStrokeCap: CircularStrokeCap.round,
                      ),
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                        decoration: BoxDecoration(
                          color: isPassed ? AppColors.success.withValues(alpha: 0.1) : AppColors.error.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          isPassed ? 'PASSED' : 'FAILED',
                          style: TextStyle(
                            color: isPassed ? AppColors.success : AppColors.error,
                            fontWeight: FontWeight.bold, fontSize: 18,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Stats Grid
              Row(
                children: [
                  _statCard('Correct', '$correct', AppColors.success, Icons.check_circle),
                  const SizedBox(width: 12),
                  _statCard('Wrong', '$wrong', AppColors.error, Icons.cancel),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  _statCard('Skipped', '$skipped', AppColors.warning, Icons.skip_next),
                  const SizedBox(width: 12),
                  _statCard('Total', '$total', AppColors.navy, Icons.quiz),
                ],
              ),

              if (result['timeTaken'] != null) ...[
                const SizedBox(height: 12),
                Card(
                  child: ListTile(
                    leading: const Icon(Icons.timer, color: AppColors.navy),
                    title: const Text('Time Taken'),
                    trailing: Text(
                      _formatTime(result['timeTaken']),
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                  ),
                ),
              ],

              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pushReplacementNamed(context, '/home'),
                  child: const Text('Back to Home'),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  String _formatTime(dynamic seconds) {
    final s = (seconds is int) ? seconds : (seconds as double).toInt();
    final m = s ~/ 60;
    final sec = s % 60;
    return '${m}m ${sec}s';
  }

  Widget _statCard(String label, String value, Color color, IconData icon) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Icon(icon, color: color, size: 28),
              const SizedBox(height: 8),
              Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
              Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
            ],
          ),
        ),
      ),
    );
  }
}
