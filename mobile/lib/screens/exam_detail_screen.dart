import 'package:flutter/material.dart';
import '../constants/theme.dart';
import '../services/api_service.dart';
import '../constants/api_constants.dart';

class ExamDetailScreen extends StatefulWidget {
  const ExamDetailScreen({super.key});

  @override
  State<ExamDetailScreen> createState() => _ExamDetailScreenState();
}

class _ExamDetailScreenState extends State<ExamDetailScreen> {
  final ApiService _api = ApiService();
  Map<String, dynamic>? _exam;
  int _attemptCount = 0;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_exam == null) {
      _exam = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
      if (_exam != null) _loadAttemptCount();
    }
  }

  Future<void> _loadAttemptCount() async {
    try {
      final history = await _api.get(ApiConstants.examHistory);
      int count = 0;
      for (final h in history) {
        if (h['exam']?['_id'] == _exam!['_id']) count++;
      }
      setState(() {
        _attemptCount = count;
      });
    } catch (e) {
      // Failed to load attempts, continue with default
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_exam == null) return const Scaffold(body: Center(child: Text('Exam not found')));

    final antiCheat = _exam!['antiCheat'] as Map<String, dynamic>? ?? {};
    final hasAntiCheat = antiCheat['preventScreenshot'] == true ||
        antiCheat['preventScreenShare'] == true ||
        antiCheat['preventAppSwitch'] == true;
    final isDemo = _exam!['isDemo'] == true;
    final maxAttempts = _exam!['maxAttempts'] ?? 0;
    final isLimitReached = maxAttempts > 0 && _attemptCount >= maxAttempts;

    return Scaffold(
      appBar: AppBar(title: Text(_exam!['title'] ?? 'Exam Details')),
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
                    // Title and badges
                    Row(
                      children: [
                        Expanded(
                          child: Text(_exam!['title'] ?? '', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    // Type and Demo badges
                    Wrap(
                      spacing: 8,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: _exam!['examType'] == 'practice'
                                ? AppColors.success.withValues(alpha: 0.1)
                                : AppColors.orange.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            (_exam!['examType'] ?? '').toString().toUpperCase(),
                            style: TextStyle(
                              color: _exam!['examType'] == 'practice' ? AppColors.success : AppColors.orange,
                              fontSize: 12, fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        if (isDemo)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.green.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text('FREE DEMO',
                                style: TextStyle(color: Colors.green, fontSize: 12, fontWeight: FontWeight.bold)),
                          ),
                      ],
                    ),
                    if (_exam!['description'] != null && _exam!['description'].toString().isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Text(_exam!['description'], style: const TextStyle(color: AppColors.textSecondary)),
                    ],
                    const SizedBox(height: 20),
                    _infoRow(Icons.quiz, 'Questions', '${_exam!['totalQuestions']}'),
                    _infoRow(Icons.timer, 'Duration', '${_exam!['duration']} minutes'),
                    _infoRow(Icons.star, 'Total Marks', '${_exam!['totalMarks']}'),
                    _infoRow(Icons.check_circle, 'Passing', '${_exam!['passingPercentage']}%'),
                    if (_exam!['negativeMarking'] == true)
                      _infoRow(Icons.remove_circle, 'Negative Marking', 'Yes'),
                    _infoRow(Icons.replay, 'Attempts',
                        maxAttempts > 0 ? '$_attemptCount / $maxAttempts' : '$_attemptCount (Unlimited)'),
                    if (_exam!['allowReview'] == true)
                      _infoRow(Icons.rate_review, 'Paper Review', 'Enabled'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Demo exam info
            if (isDemo)
              Card(
                color: Colors.green.withValues(alpha: 0.08),
                child: const Padding(
                  padding: EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Icon(Icons.card_giftcard, color: Colors.green, size: 28),
                      SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Free Demo Exam', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.green)),
                            SizedBox(height: 4),
                            Text('This exam is free to take. No subscription required.',
                                style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

            // Anti-cheat Warning
            if (hasAntiCheat) ...[
              const SizedBox(height: 16),
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
            ],

            // Instructions
            if (_exam!['instructions'] != null && _exam!['instructions'].toString().isNotEmpty) ...[
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Instructions', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Text(_exam!['instructions'], style: const TextStyle(color: AppColors.textSecondary)),
                    ],
                  ),
                ),
              ),
            ],

            // Limit reached warning
            if (isLimitReached) ...[
              const SizedBox(height: 16),
              Card(
                color: AppColors.error.withValues(alpha: 0.08),
                child: const Padding(
                  padding: EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Icon(Icons.block, color: AppColors.error, size: 28),
                      SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Attempt Limit Reached', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.error)),
                            SizedBox(height: 4),
                            Text('You have used all available attempts for this exam.',
                                style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                          ],
                        ),
                      ),
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
                icon: Icon(isLimitReached ? Icons.block : (_attemptCount > 0 ? Icons.replay : Icons.play_arrow)),
                label: Text(
                  isLimitReached ? 'Limit Reached' : (_attemptCount > 0 ? 'Retake Exam' : 'Start Exam'),
                  style: const TextStyle(fontSize: 18),
                ),
                onPressed: isLimitReached ? null : () => Navigator.pushReplacementNamed(context, '/exam-take', arguments: _exam),
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
