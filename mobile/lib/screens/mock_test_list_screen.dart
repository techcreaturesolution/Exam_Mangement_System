import 'package:flutter/material.dart';
import '../constants/theme.dart';
import '../services/api_service.dart';
import '../constants/api_constants.dart';

class MockTestListScreen extends StatefulWidget {
  const MockTestListScreen({super.key});

  @override
  State<MockTestListScreen> createState() => _MockTestListScreenState();
}

class _MockTestListScreenState extends State<MockTestListScreen> {
  final ApiService _api = ApiService();
  List<dynamic> _mockTests = [];
  Map<String, dynamic>? _subscription;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final tests = await _api.get('${ApiConstants.exams}?examType=mock_test');
      Map<String, dynamic>? sub;
      try {
        sub = await _api.get(ApiConstants.mySubscription);
      } catch (_) {}
      setState(() {
        _mockTests = tests is List ? tests : [];
        _subscription = sub;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  bool _isMockTestLocked(int index) {
    if (_mockTests[index]['isFree'] == true || _mockTests[index]['isDemo'] == true) {
      return false;
    }
    if (_subscription == null) return true;
    final plan = _subscription!['plan'];
    if (plan == null) return true;
    if (plan['mockTestAccessAll'] == true) return false;
    final allowed = plan['mockTestsAllowed'] ?? 0;
    if (allowed == 0) return false;
    return index >= allowed;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mock Tests'),
        backgroundColor: AppColors.navy,
        foregroundColor: Colors.white,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _mockTests.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.assignment_outlined, size: 64, color: AppColors.textLight),
                      SizedBox(height: 16),
                      Text('No mock tests available', style: TextStyle(fontSize: 16, color: AppColors.textSecondary)),
                      SizedBox(height: 8),
                      Text('Check back later!', style: TextStyle(fontSize: 13, color: AppColors.textLight)),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _mockTests.length,
                  itemBuilder: (ctx, i) => _buildMockTestCard(_mockTests[i], i),
                ),
    );
  }

  Widget _buildMockTestCard(dynamic test, int index) {
    final isLocked = _isMockTestLocked(index);
    final totalQuestions = test['totalQuestions'] ?? 100;
    final duration = test['durationMinutes'] ?? 120;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: isLocked
            ? () => _showUpgradeDialog()
            : () {
                Navigator.pushNamed(context, '/mock-test-instructions', arguments: {
                  'examId': test['_id'],
                  'examTitle': test['examTitle'],
                  'totalQuestions': totalQuestions,
                  'durationMinutes': duration,
                  'instructions': test['instructions'] ?? '',
                  'negativeMarking': test['negativeMarking'] ?? false,
                });
              },
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isLocked ? Colors.grey.shade50 : Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4))],
            border: Border.all(color: isLocked ? Colors.grey.shade300 : AppColors.orange.withValues(alpha: 0.3)),
          ),
          child: Row(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: isLocked
                        ? [Colors.grey.shade300, Colors.grey.shade200]
                        : [AppColors.orange, AppColors.orangeLight],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Icon(
                    isLocked ? Icons.lock : Icons.assignment,
                    color: Colors.white,
                    size: 24,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      test['examTitle'] ?? 'Mock Test ${index + 1}',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: isLocked ? Colors.grey : AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.quiz, size: 14, color: isLocked ? Colors.grey.shade400 : Colors.grey.shade500),
                        const SizedBox(width: 4),
                        Text('$totalQuestions MCQs', style: TextStyle(fontSize: 13, color: isLocked ? Colors.grey.shade400 : Colors.grey.shade600)),
                        const SizedBox(width: 12),
                        Icon(Icons.timer_outlined, size: 14, color: isLocked ? Colors.grey.shade400 : Colors.grey.shade500),
                        const SizedBox(width: 4),
                        Text('$duration min', style: TextStyle(fontSize: 13, color: isLocked ? Colors.grey.shade400 : Colors.grey.shade600)),
                      ],
                    ),
                  ],
                ),
              ),
              if (isLocked)
                const Icon(Icons.lock, color: Colors.grey, size: 22)
              else
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.orange,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text('START', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                ),
            ],
          ),
        ),
      ),
    );
  }

  void _showUpgradeDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.lock, color: AppColors.orange),
            SizedBox(width: 8),
            Text('Mock Test Locked'),
          ],
        ),
        content: const Text('Upgrade your plan to access this mock test. Premium plan gives you unlimited access to all mock tests.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pushNamed(context, '/plans');
            },
            child: const Text('Upgrade Plan'),
          ),
        ],
      ),
    );
  }
}
