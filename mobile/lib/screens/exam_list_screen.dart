import 'package:flutter/material.dart';
import '../constants/theme.dart';
import '../services/api_service.dart';
import '../constants/api_constants.dart';

class ExamListScreen extends StatefulWidget {
  const ExamListScreen({super.key});

  @override
  State<ExamListScreen> createState() => _ExamListScreenState();
}

class _ExamListScreenState extends State<ExamListScreen> {
  final ApiService _api = ApiService();
  List<dynamic> _exams = [];
  bool _loading = true;
  Map<String, dynamic>? _args;
  Map<String, int> _attemptCounts = {};

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    if (_args != null && _loading) _loadData();
  }

  Future<void> _loadData() async {
    try {
      final cat = _args!['category'];
      final sub = _args!['subject'];
      final exams = await _api.get('/exams', params: {
        'category': cat['_id'],
        'subject': sub['_id'],
      });

      // Load attempt counts from history
      final history = await _api.get(ApiConstants.examHistory);
      final counts = <String, int>{};
      for (final h in history) {
        final examId = h['exam']?['_id'];
        if (examId != null) {
          counts[examId] = (counts[examId] ?? 0) + 1;
        }
      }

      setState(() {
        _exams = exams;
        _attemptCounts = counts;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final sub = _args?['subject'];
    return Scaffold(
      appBar: AppBar(title: Text(sub?['name'] ?? 'Exams')),
      body: _loading
        ? const Center(child: CircularProgressIndicator())
        : _exams.isEmpty
          ? const Center(child: Text('No exams available'))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _exams.length,
              itemBuilder: (ctx, i) {
                final exam = _exams[i];
                final isPractice = exam['examType'] == 'practice';
                final isDemo = exam['isDemo'] == true;
                final maxAttempts = exam['maxAttempts'] ?? 0;
                final attemptsDone = _attemptCounts[exam['_id']] ?? 0;
                final isLimitReached = maxAttempts > 0 && attemptsDone >= maxAttempts;

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(16),
                    onTap: () => Navigator.pushNamed(context, '/exam-detail', arguments: exam),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: isPractice ? AppColors.success.withValues(alpha: 0.1) : AppColors.orange.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  isPractice ? 'PRACTICE' : 'MOCK',
                                  style: TextStyle(
                                    color: isPractice ? AppColors.success : AppColors.orange,
                                    fontSize: 11, fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              if (isDemo) ...[
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.green.withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: const Text('FREE DEMO',
                                    style: TextStyle(color: Colors.green, fontSize: 11, fontWeight: FontWeight.bold)),
                                ),
                              ],
                              const Spacer(),
                              const Icon(Icons.timer, size: 16, color: AppColors.textSecondary),
                              const SizedBox(width: 4),
                              Text('${exam['duration']} min', style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(exam['title'], style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                          const SizedBox(height: 4),
                          Text('${exam['totalQuestions']} Questions  •  ${exam['totalMarks']} Marks',
                            style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),

                          // Attempt info
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              Icon(Icons.replay, size: 14, color: AppColors.textSecondary),
                              const SizedBox(width: 4),
                              Text(
                                maxAttempts > 0
                                    ? '$attemptsDone / $maxAttempts attempts'
                                    : '$attemptsDone attempts (Unlimited)',
                                style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                              ),
                              if (isLimitReached) ...[
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.error.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: const Text('Limit Reached',
                                    style: TextStyle(color: AppColors.error, fontSize: 10, fontWeight: FontWeight.bold)),
                                ),
                              ],
                            ],
                          ),

                          const SizedBox(height: 12),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: isLimitReached
                                  ? null
                                  : () => Navigator.pushNamed(context, '/exam-detail', arguments: exam),
                              child: Text(isLimitReached ? 'Limit Reached' : attemptsDone > 0 ? 'Retake' : 'Start'),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
