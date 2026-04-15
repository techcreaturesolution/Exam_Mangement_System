import 'package:flutter/material.dart';
import '../constants/theme.dart';
import '../services/api_service.dart';

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

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    if (_args != null) _loadExams();
  }

  Future<void> _loadExams() async {
    try {
      final cat = _args!['category'];
      final sub = _args!['subject'];
      final exams = await _api.get('/exams', params: {
        'category': cat['_id'],
        'subject': sub['_id'],
      });
      setState(() { _exams = exams; _loading = false; });
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
                          const SizedBox(height: 12),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: () => Navigator.pushNamed(context, '/exam-detail', arguments: exam),
                              child: const Text('Start'),
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
