import 'package:flutter/material.dart';
import '../constants/theme.dart';
import '../services/api_service.dart';
import '../constants/api_constants.dart';

class ExamReviewScreen extends StatefulWidget {
  const ExamReviewScreen({super.key});

  @override
  State<ExamReviewScreen> createState() => _ExamReviewScreenState();
}

class _ExamReviewScreenState extends State<ExamReviewScreen> {
  final ApiService _api = ApiService();
  Map<String, dynamic>? _reviewData;
  bool _loading = true;
  String? _error;
  int _currentQuestion = 0;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final attemptId = ModalRoute.of(context)?.settings.arguments as String?;
    if (attemptId != null && _reviewData == null) {
      _loadReview(attemptId);
    }
  }

  Future<void> _loadReview(String attemptId) async {
    try {
      final data = await _api.get('${ApiConstants.examReview}/$attemptId');
      setState(() {
        _reviewData = data;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_reviewData?['exam']?['examTitle'] ?? 'Exam Review'),
        actions: [
          if (_reviewData != null)
            Center(
              child: Padding(
                padding: const EdgeInsets.only(right: 16),
                child: Text(
                  '${_currentQuestion + 1}/${(_reviewData!['questions'] as List).length}',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ),
            ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, size: 48, color: AppColors.error),
                        const SizedBox(height: 16),
                        Text(_error!, textAlign: TextAlign.center,
                            style: const TextStyle(color: AppColors.textSecondary)),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () => Navigator.pop(context),
                          child: const Text('Go Back'),
                        ),
                      ],
                    ),
                  ),
                )
              : _buildReviewContent(),
    );
  }

  Widget _buildReviewContent() {
    final questions = _reviewData!['questions'] as List;
    if (questions.isEmpty) {
      return const Center(child: Text('No questions to review'));
    }

    return Column(
      children: [
        // Summary bar
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          color: AppColors.navy.withOpacity(0.05),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _summaryItem('Score', '${_reviewData!['percentage']}%',
                  (_reviewData!['isPassed'] ?? false) ? AppColors.success : AppColors.error),
              _summaryItem('Correct', '${_reviewData!['correctAnswers']}', AppColors.success),
              _summaryItem('Wrong', '${_reviewData!['wrongAnswers']}', AppColors.error),
              _summaryItem('Skipped', '${_reviewData!['unanswered']}', AppColors.warning),
            ],
          ),
        ),

        // Question navigation dots
        Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          height: 56,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            itemCount: questions.length,
            itemBuilder: (ctx, i) {
              final q = questions[i];
              final isSelected = i == _currentQuestion;
              Color dotColor;
              if (q['isCorrect'] == true) {
                dotColor = AppColors.success;
              } else if (q['selectedOption'] == null || q['selectedOption'] == '') {
                dotColor = AppColors.warning;
              } else {
                dotColor = AppColors.error;
              }
              return GestureDetector(
                onTap: () => setState(() => _currentQuestion = i),
                child: Container(
                  width: 36,
                  height: 36,
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  decoration: BoxDecoration(
                    color: isSelected ? dotColor : dotColor.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                    border: isSelected ? Border.all(color: dotColor, width: 2) : null,
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    '${i + 1}',
                    style: TextStyle(
                      color: isSelected ? Colors.white : dotColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                ),
              );
            },
          ),
        ),

        const Divider(height: 1),

        // Question content
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: _buildQuestion(questions[_currentQuestion]),
          ),
        ),

        // Navigation buttons
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                if (_currentQuestion > 0)
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.arrow_back),
                      label: const Text('Previous'),
                      onPressed: () => setState(() => _currentQuestion--),
                    ),
                  ),
                if (_currentQuestion > 0 && _currentQuestion < questions.length - 1)
                  const SizedBox(width: 12),
                if (_currentQuestion < questions.length - 1)
                  Expanded(
                    child: ElevatedButton.icon(
                      icon: const Icon(Icons.arrow_forward),
                      label: const Text('Next'),
                      onPressed: () => setState(() => _currentQuestion++),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildQuestion(Map<String, dynamic> question) {
    final selectedOption = question['selectedOption']?.toString() ?? '';
    final correctAnswer = question['correctAnswer']?.toString() ?? '';
    final isCorrect = question['isCorrect'] ?? false;
    final isSkipped = selectedOption.isEmpty;

    // Build options from optionA/B/C/D
    final optionKeys = ['A', 'B', 'C', 'D'];
    final optionTexts = [
      question['optionA']?.toString() ?? '',
      question['optionB']?.toString() ?? '',
      question['optionC']?.toString() ?? '',
      question['optionD']?.toString() ?? '',
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Status badge
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: isSkipped
                ? AppColors.warning.withOpacity(0.1)
                : isCorrect
                    ? AppColors.success.withOpacity(0.1)
                    : AppColors.error.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                isSkipped ? Icons.skip_next : isCorrect ? Icons.check_circle : Icons.cancel,
                size: 18,
                color: isSkipped ? AppColors.warning : isCorrect ? AppColors.success : AppColors.error,
              ),
              const SizedBox(width: 6),
              Text(
                isSkipped ? 'Skipped' : isCorrect ? 'Correct' : 'Wrong',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: isSkipped ? AppColors.warning : isCorrect ? AppColors.success : AppColors.error,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                '${question['marksObtained'] ?? 0} / ${question['marks'] ?? 1} marks',
                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Question text
        Text(
          question['question'] ?? '',
          style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w600, height: 1.4),
        ),
        const SizedBox(height: 20),

        // Options A, B, C, D
        ...List.generate(4, (i) {
          final key = optionKeys[i];
          final text = optionTexts[i];
          final isUserSelected = selectedOption == key;
          final isCorrectOpt = correctAnswer == key;

          Color borderColor = AppColors.border;
          Color bgColor = Colors.white;
          IconData? icon;
          Color? iconColor;

          if (isCorrectOpt) {
            borderColor = AppColors.success;
            bgColor = AppColors.success.withOpacity(0.05);
            icon = Icons.check_circle;
            iconColor = AppColors.success;
          } else if (isUserSelected && !isCorrectOpt) {
            borderColor = AppColors.error;
            bgColor = AppColors.error.withOpacity(0.05);
            icon = Icons.cancel;
            iconColor = AppColors.error;
          }

          return Container(
            width: double.infinity,
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: borderColor, width: isCorrectOpt || isUserSelected ? 2 : 1),
            ),
            child: Row(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isCorrectOpt
                        ? AppColors.success.withOpacity(0.1)
                        : isUserSelected
                            ? AppColors.error.withOpacity(0.1)
                            : AppColors.background,
                    border: Border.all(color: borderColor),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    key,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: isCorrectOpt
                          ? AppColors.success
                          : isUserSelected
                              ? AppColors.error
                              : AppColors.textSecondary,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    text,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: isCorrectOpt || isUserSelected ? FontWeight.w600 : FontWeight.normal,
                    ),
                  ),
                ),
                if (icon != null)
                  Icon(icon, color: iconColor, size: 22),
              ],
            ),
          );
        }),

        // Explanation
        if (question['explanation'] != null && question['explanation'].toString().isNotEmpty) ...[
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.navy.withOpacity(0.05),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.navy.withOpacity(0.2)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.lightbulb, size: 18, color: AppColors.orange),
                    SizedBox(width: 8),
                    Text('Explanation', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.navy)),
                  ],
                ),
                const SizedBox(height: 8),
                Text(question['explanation'], style: const TextStyle(color: AppColors.textSecondary, height: 1.4)),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _summaryItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
      ],
    );
  }
}
