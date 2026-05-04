import 'package:flutter/material.dart';
import '../constants/theme.dart';
import '../services/api_service.dart';
import '../constants/api_constants.dart';

class TopicsScreen extends StatefulWidget {
  const TopicsScreen({super.key});

  @override
  State<TopicsScreen> createState() => _TopicsScreenState();
}

class _TopicsScreenState extends State<TopicsScreen> {
  final ApiService _api = ApiService();
  List<dynamic> _subjects = [];
  Map<String, dynamic>? _subscription;
  bool _loading = true;
  String _categoryName = '';
  String _categoryId = '';

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    if (args != null && _categoryId.isEmpty) {
      _categoryId = args['categoryId'] ?? '';
      _categoryName = args['categoryName'] ?? 'Topics';
      _loadData();
    }
  }

  Future<void> _loadData() async {
    try {
      final subjects = await _api.get('${ApiConstants.subjects}?categoryId=$_categoryId');
      Map<String, dynamic>? sub;
      try {
        sub = await _api.get(ApiConstants.mySubscription);
      } catch (_) {}
      setState(() {
        _subjects = subjects is List ? subjects : [];
        _subscription = sub;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  bool _isTopicLocked(int index) {
    if (_subscription == null) return index > 0;
    final plan = _subscription!['plan'];
    if (plan == null) return index > 0;
    if (plan['practiceAccessAll'] == true) return false;
    final topicsAllowed = plan['topicsAllowed'] ?? 0;
    if (topicsAllowed <= 0) return true; // 0 or unset means no access without practiceAccessAll
    return index >= topicsAllowed;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_categoryName),
        backgroundColor: AppColors.navy,
        foregroundColor: Colors.white,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _subjects.isEmpty
              ? const Center(child: Text('No topics available', style: TextStyle(fontSize: 16, color: AppColors.textSecondary)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _subjects.length,
                  itemBuilder: (ctx, i) {
                    final subject = _subjects[i];
                    final isLocked = _isTopicLocked(i);
                    return _buildTopicCard(subject, isLocked, i);
                  },
                ),
    );
  }

  Widget _buildTopicCard(dynamic subject, bool isLocked, int index) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: isLocked
            ? () => _showUpgradeDialog()
            : () {
                Navigator.pushNamed(context, '/practice-sets', arguments: {
                  'subjectId': subject['_id'],
                  'subjectName': subject['subjectName'],
                  'categoryId': _categoryId,
                  'categoryName': _categoryName,
                });
              },
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isLocked ? Colors.grey.shade50 : Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4))],
            border: Border.all(color: isLocked ? Colors.grey.shade300 : AppColors.border),
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: isLocked ? Colors.grey.shade200 : AppColors.navy.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Center(
                  child: Text(
                    '${index + 1}',
                    style: TextStyle(
                      color: isLocked ? Colors.grey : AppColors.navy,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      subject['subjectName'] ?? '',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: isLocked ? Colors.grey : AppColors.textPrimary,
                      ),
                    ),
                    if (subject['description'] != null && subject['description'].toString().isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(
                          subject['description'],
                          style: TextStyle(fontSize: 13, color: isLocked ? Colors.grey.shade400 : AppColors.textSecondary),
                        ),
                      ),
                  ],
                ),
              ),
              Icon(
                isLocked ? Icons.lock : Icons.arrow_forward_ios,
                color: isLocked ? Colors.grey : AppColors.textLight,
                size: isLocked ? 22 : 18,
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
            Text('Topic Locked'),
          ],
        ),
        content: const Text('Upgrade your plan to access this topic. Premium plan gives you access to all topics and mock tests.'),
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
