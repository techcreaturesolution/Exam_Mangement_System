import 'package:flutter/material.dart';
import '../constants/theme.dart';

class MockTestInstructionsScreen extends StatelessWidget {
  const MockTestInstructionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>? ?? {};
    final examTitle = args['examTitle'] ?? 'Mock Test';
    final totalQuestions = args['totalQuestions'] ?? 100;
    final duration = args['durationMinutes'] ?? 120;
    final instructions = args['instructions'] ?? '';
    final negativeMarking = args['negativeMarking'] ?? false;

    return Scaffold(
      appBar: AppBar(
        title: Text(examTitle),
        backgroundColor: AppColors.navy,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Exam Info Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.navy, AppColors.navyDark],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  const Icon(Icons.assignment, color: Colors.white, size: 48),
                  const SizedBox(height: 12),
                  Text(examTitle, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _buildInfoChip(Icons.quiz, '$totalQuestions', 'Questions'),
                      _buildInfoChip(Icons.timer, '$duration min', 'Duration'),
                      _buildInfoChip(Icons.star, negativeMarking ? 'Yes' : 'No', 'Neg. Marks'),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Instructions Section
            const Text('Instructions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
            const SizedBox(height: 12),

            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (instructions.isNotEmpty)
                    Text(instructions, style: const TextStyle(fontSize: 14, height: 1.6, color: AppColors.textPrimary))
                  else ...[
                    _buildInstruction('1', 'All questions are mandatory.'),
                    _buildInstruction('2', 'Each question carries 1 mark.'),
                    if (negativeMarking) _buildInstruction('3', 'There is negative marking for wrong answers.'),
                    _buildInstruction(negativeMarking ? '4' : '3', 'You can navigate between questions using Previous/Next buttons.'),
                    _buildInstruction(negativeMarking ? '5' : '4', 'The test will auto-submit when the timer ends.'),
                    _buildInstruction(negativeMarking ? '6' : '5', 'Do not switch apps during the test. Anti-cheat is enabled.'),
                    _buildInstruction(negativeMarking ? '7' : '6', 'Review your answers before submitting.'),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Warning
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.warning.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.warning.withValues(alpha: 0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.warning_amber, color: AppColors.warning),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Once started, you cannot pause the test. Make sure you have stable internet and enough time.',
                      style: TextStyle(fontSize: 13, color: AppColors.textPrimary),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // Start Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pushReplacementNamed(context, '/exam-take', arguments: {
                    'examId': args['examId'],
                    'examTitle': examTitle,
                    'totalQuestions': totalQuestions,
                    'durationMinutes': duration,
                    'examType': 'mock_test',
                  });
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.orange,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: const Text('Start Mock Test', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String value, String label) {
    return Column(
      children: [
        Icon(icon, color: AppColors.orangeLight, size: 20),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11)),
      ],
    );
  }

  Widget _buildInstruction(String num, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: AppColors.navy.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(child: Text(num, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.navy))),
          ),
          const SizedBox(width: 12),
          Expanded(child: Text(text, style: const TextStyle(fontSize: 14, color: AppColors.textPrimary, height: 1.4))),
        ],
      ),
    );
  }
}
