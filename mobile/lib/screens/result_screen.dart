import 'package:flutter/material.dart';
import 'package:percent_indicator/circular_percent_indicator.dart';
import '../constants/theme.dart';
import '../services/api_service.dart';
import '../constants/api_constants.dart';

class ResultScreen extends StatefulWidget {
  const ResultScreen({super.key});

  @override
  State<ResultScreen> createState() => _ResultScreenState();
}

class _ResultScreenState extends State<ResultScreen> {
  final ApiService _api = ApiService();
  List<dynamic>? _reviewQuestions;
  bool _loadingReview = false;
  bool _reviewExpanded = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_reviewQuestions == null && !_loadingReview) {
      final result = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
      if (result != null && result['attemptId'] != null) {
        _loadReviewData(result['attemptId']);
      }
    }
  }

  Future<void> _loadReviewData(String attemptId) async {
    setState(() => _loadingReview = true);
    try {
      final data = await _api.get('${ApiConstants.examReview}/$attemptId');
      if (mounted) {
        setState(() {
          _reviewQuestions = data['questions'] as List<dynamic>?;
          _loadingReview = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loadingReview = false);
      }
    }
  }

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
                          color: isPassed ? AppColors.success.withOpacity(0.1) : AppColors.error.withOpacity(0.1),
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

              // Answer Key with Correct Answers & Explanations
              _buildAnswerKeySection(result),

              const SizedBox(height: 16),

              // Detailed Review Button
              if (result['attemptId'] != null)
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.rate_review),
                    label: const Text('Detailed Review (Full Screen)'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.navy,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    onPressed: () => Navigator.pushNamed(context, '/exam-review', arguments: result['attemptId']),
                  ),
                ),
              const SizedBox(height: 12),

              // Performance Report Button
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  icon: const Icon(Icons.bar_chart),
                  label: const Text('View Performance Report'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  onPressed: () => Navigator.pushNamed(context, '/performance'),
                ),
              ),
              const SizedBox(height: 12),

              // Retake Button
              if (result['examId'] != null)
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.replay),
                    label: const Text('Retake Exam'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      foregroundColor: AppColors.orange,
                    ),
                    onPressed: () {
                      Navigator.pushReplacementNamed(context, '/exam-detail', arguments: result['examData']);
                    },
                  ),
                ),
              const SizedBox(height: 12),

              SizedBox(
                width: double.infinity,
                child: TextButton(
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

  Widget _buildAnswerKeySection(Map<String, dynamic> result) {
    return Card(
      child: Column(
        children: [
          // Header with toggle
          InkWell(
            onTap: () => setState(() => _reviewExpanded = !_reviewExpanded),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  const Icon(Icons.quiz_outlined, color: AppColors.navy),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Answer Key & Explanations',
                          style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
                        SizedBox(height: 2),
                        Text('View correct answers for each question',
                          style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                      ],
                    ),
                  ),
                  Icon(_reviewExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                    color: AppColors.textSecondary),
                ],
              ),
            ),
          ),

          if (_reviewExpanded) ...[
            const Divider(height: 1),
            if (_loadingReview)
              const Padding(
                padding: EdgeInsets.all(24),
                child: Center(child: CircularProgressIndicator()),
              )
            else if (_reviewQuestions != null && _reviewQuestions!.isNotEmpty)
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _reviewQuestions!.length,
                separatorBuilder: (_, __) => const Divider(height: 1),
                itemBuilder: (ctx, i) => _buildQuestionItem(i, _reviewQuestions![i]),
              )
            else
              const Padding(
                padding: EdgeInsets.all(24),
                child: Text('Answer review not available for this exam.',
                  style: TextStyle(color: AppColors.textSecondary),
                  textAlign: TextAlign.center),
              ),
          ],
        ],
      ),
    );
  }

  Widget _buildQuestionItem(int index, Map<String, dynamic> question) {
    final selectedAnswer = question['selectedAnswer']?.toString() ?? '';
    final correctAnswer = question['correctAnswer']?.toString() ?? '';
    final isCorrect = question['isCorrect'] ?? false;
    final isSkipped = selectedAnswer.isEmpty;
    final explanation = question['explanation']?.toString() ?? '';

    final optionKeys = ['A', 'B', 'C', 'D'];
    final optionTexts = [
      question['optionA']?.toString() ?? '',
      question['optionB']?.toString() ?? '',
      question['optionC']?.toString() ?? '',
      question['optionD']?.toString() ?? '',
    ];

    // Status color and icon
    Color statusColor;
    IconData statusIcon;
    if (isSkipped) {
      statusColor = AppColors.warning;
      statusIcon = Icons.remove_circle_outline;
    } else if (isCorrect) {
      statusColor = AppColors.success;
      statusIcon = Icons.check_circle;
    } else {
      statusColor = AppColors.error;
      statusIcon = Icons.cancel;
    }

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Question header with status
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                alignment: Alignment.center,
                child: Text('${index + 1}',
                  style: TextStyle(fontWeight: FontWeight.bold, color: statusColor, fontSize: 13)),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  question['question'] ?? '',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, height: 1.3),
                ),
              ),
              const SizedBox(width: 8),
              Icon(statusIcon, color: statusColor, size: 22),
            ],
          ),
          const SizedBox(height: 12),

          // Options
          ...List.generate(4, (i) {
            final key = optionKeys[i];
            final text = optionTexts[i];
            final isUserSelected = selectedAnswer == key;
            final isCorrectOpt = correctAnswer == key;

            Color bgColor = Colors.transparent;
            Color textColor = AppColors.textPrimary;
            FontWeight weight = FontWeight.normal;
            IconData? optIcon;
            Color? optIconColor;

            if (isCorrectOpt) {
              bgColor = AppColors.success.withOpacity(0.08);
              textColor = AppColors.success;
              weight = FontWeight.w600;
              optIcon = Icons.check_circle;
              optIconColor = AppColors.success;
            } else if (isUserSelected && !isCorrectOpt) {
              bgColor = AppColors.error.withOpacity(0.08);
              textColor = AppColors.error;
              weight = FontWeight.w600;
              optIcon = Icons.cancel;
              optIconColor = AppColors.error;
            }

            return Container(
              margin: const EdgeInsets.only(bottom: 6),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Text('$key. ', style: TextStyle(fontWeight: FontWeight.bold, color: textColor, fontSize: 14)),
                  Expanded(child: Text(text, style: TextStyle(color: textColor, fontWeight: weight, fontSize: 14))),
                  if (optIcon != null) Icon(optIcon, color: optIconColor, size: 18),
                ],
              ),
            );
          }),

          // Your answer vs Correct answer summary
          if (!isSkipped && !isCorrect)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Row(
                children: [
                  Text('Your answer: ', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  Text(selectedAnswer, style: TextStyle(fontSize: 12, color: AppColors.error, fontWeight: FontWeight.bold)),
                  const SizedBox(width: 16),
                  Text('Correct: ', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  Text(correctAnswer, style: TextStyle(fontSize: 12, color: AppColors.success, fontWeight: FontWeight.bold)),
                ],
              ),
            ),

          // Explanation
          if (explanation.isNotEmpty) ...[
            const SizedBox(height: 10),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.navy.withOpacity(0.04),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.navy.withOpacity(0.12)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.lightbulb_outline, size: 16, color: AppColors.orange),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      explanation,
                      style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
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
