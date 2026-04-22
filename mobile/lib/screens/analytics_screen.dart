import 'package:flutter/material.dart';
import 'package:percent_indicator/circular_percent_indicator.dart';
import '../constants/theme.dart';
import '../services/api_service.dart';
import '../constants/api_constants.dart';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  final ApiService _api = ApiService();
  Map<String, dynamic>? _report;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
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
      appBar: AppBar(
        title: const Text('Analytics'),
        actions: [
          IconButton(
            icon: const Icon(Icons.assessment),
            tooltip: 'Detailed Report',
            onPressed: () => Navigator.pushNamed(context, '/performance'),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: _report == null ? _buildEmpty() : _buildContent(),
              ),
            ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.only(top: 100),
        child: Column(
          children: [
            Icon(Icons.analytics, size: 64, color: AppColors.textSecondary.withOpacity(0.5)),
            const SizedBox(height: 16),
            const Text('No analytics yet', style: TextStyle(fontSize: 18, color: AppColors.textSecondary)),
            const SizedBox(height: 8),
            const Text('Take some exams to see your analytics!',
                style: TextStyle(color: AppColors.textLight, fontSize: 14)),
          ],
        ),
      ),
    );
  }

  Widget _buildContent() {
    final overview = _report!['overview'] as Map<String, dynamic>? ?? {};
    final accuracy = (overview['overallAccuracy'] ?? 0).toDouble();
    final totalAttempts = overview['totalAttempts'] ?? 0;
    final totalCorrect = overview['totalCorrect'] ?? 0;
    final totalQuestions = overview['totalQuestionsSolved'] ?? 0;

    return Column(
      children: [
        // Stats Cards
        Row(
          children: [
            _card('Accuracy', '${accuracy.toStringAsFixed(0)}%', Icons.trending_up, AppColors.success),
            const SizedBox(width: 12),
            _card('MCQs Done', '$totalQuestions', Icons.quiz, AppColors.navy),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            _card('Correct', '$totalCorrect', Icons.check_circle, AppColors.orange),
            const SizedBox(width: 12),
            _card('Exams Taken', '$totalAttempts', Icons.assignment, AppColors.navyLight),
          ],
        ),
        const SizedBox(height: 24),

        // Accuracy Circle
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
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
                      const Text('Overall', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                    ],
                  ),
                  progressColor: AppColors.success,
                  backgroundColor: AppColors.border,
                  circularStrokeCap: CircularStrokeCap.round,
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _miniStat('Passed', '${overview['totalPassed'] ?? 0}', AppColors.success),
                    _miniStat('Failed', '${overview['totalFailed'] ?? 0}', AppColors.error),
                    _miniStat('Avg Score', '${overview['avgPercentage'] ?? 0}%', AppColors.navy),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),

        // Category-wise accuracy
        _buildCategorySection(),

        const SizedBox(height: 16),

        // View Full Report button
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            icon: const Icon(Icons.assessment),
            label: const Text('View Full Performance Report'),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            onPressed: () => Navigator.pushNamed(context, '/performance'),
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildCategorySection() {
    final categories = _report!['categoryAccuracy'] as List? ?? [];
    if (categories.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Category-wise Accuracy', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              Center(
                child: Text('Take some exams to see category analytics!',
                    style: TextStyle(color: AppColors.textSecondary.withOpacity(0.7), fontSize: 13)),
              ),
            ],
          ),
        ),
      );
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Category-wise Accuracy', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            ...categories.map((cat) {
              final acc = (cat['accuracy'] ?? 0).toDouble();
              return _topicBar(cat['name'] ?? '', acc / 100);
            }),
          ],
        ),
      ),
    );
  }

  Widget _card(String label, String value, IconData icon, Color color) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Icon(icon, color: color, size: 32),
              const SizedBox(height: 8),
              Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
              Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _miniStat(String label, String value, Color color) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
      ],
    );
  }

  Widget _topicBar(String topic, double value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(topic, style: const TextStyle(fontSize: 13)),
              Text('${(value * 100).toStringAsFixed(0)}%', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: value.clamp(0.0, 1.0),
              backgroundColor: AppColors.border,
              valueColor: AlwaysStoppedAnimation(
                value >= 0.7 ? AppColors.success : value >= 0.4 ? AppColors.warning : AppColors.error,
              ),
              minHeight: 8,
            ),
          ),
        ],
      ),
    );
  }
}
