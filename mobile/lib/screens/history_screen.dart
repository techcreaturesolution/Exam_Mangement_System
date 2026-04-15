import 'package:flutter/material.dart';
import '../constants/theme.dart';
import '../services/api_service.dart';
import '../constants/api_constants.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  final ApiService _api = ApiService();
  List<dynamic> _history = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final data = await _api.get(ApiConstants.examHistory);
      setState(() { _history = data; _loading = false; });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Exam History')),
      body: _loading
        ? const Center(child: CircularProgressIndicator())
        : _history.isEmpty
          ? const Center(child: Text('No exam history yet'))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _history.length,
              itemBuilder: (ctx, i) {
                final h = _history[i];
                final isPassed = h['isPassed'] ?? false;
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: isPassed ? AppColors.success.withValues(alpha: 0.1) : AppColors.error.withValues(alpha: 0.1),
                      child: Icon(
                        isPassed ? Icons.check : Icons.close,
                        color: isPassed ? AppColors.success : AppColors.error,
                      ),
                    ),
                    title: Text(h['exam']?['title'] ?? 'Exam', style: const TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: Text(
                      '${h['percentage']?.toStringAsFixed(1)}% • ${h['correctAnswers']}/${h['totalQuestions']} correct',
                      style: const TextStyle(fontSize: 13),
                    ),
                    trailing: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(isPassed ? 'Passed' : 'Failed',
                          style: TextStyle(color: isPassed ? AppColors.success : AppColors.error, fontWeight: FontWeight.bold, fontSize: 12)),
                        Text(_formatDate(h['createdAt']), style: const TextStyle(fontSize: 11, color: AppColors.textLight)),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }

  String _formatDate(String? date) {
    if (date == null) return '';
    try {
      final d = DateTime.parse(date);
      return '${d.day}/${d.month}/${d.year}';
    } catch (e) {
      return '';
    }
  }
}
