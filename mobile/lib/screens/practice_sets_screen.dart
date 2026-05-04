import 'package:flutter/material.dart';
import '../constants/theme.dart';
import '../services/api_service.dart';
import '../constants/api_constants.dart';

class PracticeSetsScreen extends StatefulWidget {
  const PracticeSetsScreen({super.key});

  @override
  State<PracticeSetsScreen> createState() => _PracticeSetsScreenState();
}

class _PracticeSetsScreenState extends State<PracticeSetsScreen> {
  final ApiService _api = ApiService();
  List<dynamic> _sets = [];
  bool _loading = true;
  String _title = 'Practice Sets';
  bool _isDemo = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    if (args != null && _loading) {
      _isDemo = args['isDemo'] ?? false;
      _title = args['subjectName'] ?? args['title'] ?? 'Practice Sets';
      _loadSets(args);
    }
  }

  Future<void> _loadSets(Map<String, dynamic> args) async {
    try {
      String url = '${ApiConstants.exams}?examType=practice';
      if (_isDemo) {
        url = '${ApiConstants.exams}?isDemo=true';
      } else if (args['subjectId'] != null) {
        url += '&subjectId=${args['subjectId']}';
      }
      if (args['categoryId'] != null) {
        url += '&categoryId=${args['categoryId']}';
      }

      final data = await _api.get(url);
      setState(() {
        _sets = data is List ? data : [];
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_title),
        backgroundColor: AppColors.navy,
        foregroundColor: Colors.white,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _sets.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.quiz_outlined, size: 64, color: Colors.grey.shade300),
                      const SizedBox(height: 16),
                      const Text('No practice sets available yet', style: TextStyle(fontSize: 16, color: AppColors.textSecondary)),
                      const SizedBox(height: 8),
                      const Text('Check back later!', style: TextStyle(fontSize: 13, color: AppColors.textLight)),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _sets.length,
                  itemBuilder: (ctx, i) => _buildSetCard(_sets[i], i),
                ),
    );
  }

  Widget _buildSetCard(dynamic exam, int index) {
    final setNumber = exam['setNumber'] ?? (index + 1);
    final totalQuestions = exam['totalQuestions'] ?? 25;
    final duration = exam['durationMinutes'] ?? 30;
    final isDemo = exam['isDemo'] == true;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => _startExam(exam),
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4))],
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: isDemo
                        ? [AppColors.success, AppColors.success.withValues(alpha: 0.7)]
                        : [AppColors.navy, AppColors.navyLight],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Text(
                    isDemo ? 'D' : '$setNumber',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      exam['examTitle'] ?? 'Set $setNumber',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.quiz, size: 14, color: Colors.grey.shade500),
                        const SizedBox(width: 4),
                        Text('$totalQuestions MCQs', style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
                        const SizedBox(width: 12),
                        Icon(Icons.timer_outlined, size: 14, color: Colors.grey.shade500),
                        const SizedBox(width: 4),
                        Text('$duration min', style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
                      ],
                    ),
                  ],
                ),
              ),
              if (isDemo)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.success,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text('FREE', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
                )
              else
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.orange.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.play_arrow, color: AppColors.orange, size: 20),
                ),
            ],
          ),
        ),
      ),
    );
  }

  void _startExam(dynamic exam) {
    Navigator.pushNamed(context, '/exam-take', arguments: {
      'examId': exam['_id'],
      'examTitle': exam['examTitle'],
      'totalQuestions': exam['totalQuestions'],
      'durationMinutes': exam['durationMinutes'],
      'examType': 'practice',
    });
  }
}
