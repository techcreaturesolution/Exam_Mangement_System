import 'package:flutter/material.dart';
import 'package:percent_indicator/circular_percent_indicator.dart';
import '../constants/theme.dart';
import '../services/api_service.dart';
import '../constants/api_constants.dart';

class PerformanceScreen extends StatefulWidget {
  const PerformanceScreen({super.key});

  @override
  State<PerformanceScreen> createState() => _PerformanceScreenState();
}

class _PerformanceScreenState extends State<PerformanceScreen> {
  final ApiService _api = ApiService();
  Map<String, dynamic>? _report;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadPerformance();
  }

  Future<void> _loadPerformance() async {
    try {
      final data = await _api.get(ApiConstants.examPerformance);
      setState(() {
        _report = data;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Performance Report')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _report == null
              ? const Center(child: Text('Failed to load performance data'))
              : RefreshIndicator(
                  onRefresh: _loadPerformance,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildOverviewSection(),
                        const SizedBox(height: 20),
                        _buildAccuracyCircle(),
                        const SizedBox(height: 20),
                        _buildStatsGrid(),
                        const SizedBox(height: 20),
                        _buildCategoryAccuracy(),
                        const SizedBox(height: 20),
                        _buildExamBreakdown(),
                        const SizedBox(height: 20),
                        _buildRecentTrend(),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildOverviewSection() {
    final overview = _report!['overview'] as Map<String, dynamic>? ?? {};
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Overview', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Row(
              children: [
                _overviewTile('Total Exams', '${overview['totalAttempts'] ?? 0}', Icons.assignment, AppColors.navy),
                const SizedBox(width: 12),
                _overviewTile('Passed', '${overview['totalPassed'] ?? 0}', Icons.check_circle, AppColors.success),
                const SizedBox(width: 12),
                _overviewTile('Failed', '${overview['totalFailed'] ?? 0}', Icons.cancel, AppColors.error),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _overviewTile(String label, String value, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 6),
            Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: color)),
            Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
          ],
        ),
      ),
    );
  }

  Widget _buildAccuracyCircle() {
    final overview = _report!['overview'] as Map<String, dynamic>? ?? {};
    final accuracy = (overview['overallAccuracy'] ?? 0).toDouble();
    final avgPct = (overview['avgPercentage'] ?? 0).toDouble();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            CircularPercentIndicator(
              radius: 60,
              lineWidth: 10,
              percent: (accuracy / 100).clamp(0.0, 1.0),
              center: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('${accuracy.toStringAsFixed(0)}%',
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                  const Text('Accuracy', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                ],
              ),
              progressColor: AppColors.success,
              backgroundColor: AppColors.border,
              circularStrokeCap: CircularStrokeCap.round,
            ),
            const SizedBox(width: 24),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _statRow('Avg Score', '${avgPct.toStringAsFixed(0)}%'),
                  _statRow('Questions Solved', '${overview['totalQuestionsSolved'] ?? 0}'),
                  _statRow('Correct', '${overview['totalCorrect'] ?? 0}'),
                  _statRow('Wrong', '${overview['totalWrong'] ?? 0}'),
                  _statRow('Time Spent', _formatDuration(overview['totalTimeSpent'] ?? 0)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _statRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
        ],
      ),
    );
  }

  Widget _buildStatsGrid() {
    final overview = _report!['overview'] as Map<String, dynamic>? ?? {};
    return Row(
      children: [
        _statCard('Correct', '${overview['totalCorrect'] ?? 0}', AppColors.success, Icons.check_circle),
        const SizedBox(width: 12),
        _statCard('Wrong', '${overview['totalWrong'] ?? 0}', AppColors.error, Icons.cancel),
        const SizedBox(width: 12),
        _statCard('Skipped', '${overview['totalUnanswered'] ?? 0}', AppColors.warning, Icons.skip_next),
      ],
    );
  }

  Widget _statCard(String label, String value, Color color, IconData icon) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            children: [
              Icon(icon, color: color, size: 24),
              const SizedBox(height: 6),
              Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
              Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryAccuracy() {
    final categories = _report!['categoryAccuracy'] as List? ?? [];
    if (categories.isEmpty) return const SizedBox.shrink();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Category-wise Accuracy', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            ...categories.map((cat) {
              final accuracy = (cat['accuracy'] ?? 0).toDouble();
              return Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(child: Text(cat['name'] ?? '', style: const TextStyle(fontSize: 14))),
                        Text('${accuracy.toStringAsFixed(0)}%',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        const SizedBox(width: 8),
                        Text('(${cat['totalAttempts']} exams)',
                            style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: (accuracy / 100).clamp(0.0, 1.0),
                        backgroundColor: AppColors.border,
                        valueColor: AlwaysStoppedAnimation(
                          accuracy >= 70
                              ? AppColors.success
                              : accuracy >= 40
                                  ? AppColors.warning
                                  : AppColors.error,
                        ),
                        minHeight: 8,
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildExamBreakdown() {
    final exams = _report!['examBreakdown'] as List? ?? [];
    if (exams.isEmpty) return const SizedBox.shrink();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Exam Breakdown', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            ...exams.map((e) {
              final exam = e['exam'] as Map<String, dynamic>? ?? {};
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(exam['title'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600)),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.navy.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text('${e['totalAttempts']} attempts',
                              style: const TextStyle(fontSize: 11, color: AppColors.navy, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '${exam['category'] ?? ''} • ${exam['subject'] ?? ''}',
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        _examStat('Best', '${e['bestScore']}%', AppColors.success),
                        const SizedBox(width: 16),
                        _examStat('Average', '${e['averageScore']}%', AppColors.navy),
                        const SizedBox(width: 16),
                        _examStat('Attempts', '${e['totalAttempts']}', AppColors.orange),
                      ],
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _examStat(String label, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(value, style: TextStyle(fontWeight: FontWeight.bold, color: color, fontSize: 15)),
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
      ],
    );
  }

  Widget _buildRecentTrend() {
    final trend = _report!['recentTrend'] as List? ?? [];
    if (trend.isEmpty) return const SizedBox.shrink();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Recent Performance', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            ...trend.map((t) {
              final pct = (t['percentage'] ?? 0).toDouble();
              final passed = t['isPassed'] ?? false;
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundColor: passed
                          ? AppColors.success.withOpacity(0.1)
                          : AppColors.error.withOpacity(0.1),
                      child: Icon(
                        passed ? Icons.check : Icons.close,
                        size: 16,
                        color: passed ? AppColors.success : AppColors.error,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(t['examTitle'] ?? '', style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13)),
                          Text(_formatDate(t['date']),
                              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                        ],
                      ),
                    ),
                    Text('${pct.toStringAsFixed(0)}%',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: passed ? AppColors.success : AppColors.error,
                        )),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }

  String _formatDuration(dynamic seconds) {
    final s = (seconds is int) ? seconds : (seconds as double).toInt();
    if (s < 60) return '${s}s';
    if (s < 3600) return '${s ~/ 60}m ${s % 60}s';
    return '${s ~/ 3600}h ${(s % 3600) ~/ 60}m';
  }

  String _formatDate(dynamic date) {
    if (date == null) return '';
    try {
      final d = DateTime.parse(date.toString());
      return '${d.day}/${d.month}/${d.year}';
    } catch (e) {
      return '';
    }
  }
}
