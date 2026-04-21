import 'package:flutter/material.dart';
import '../constants/theme.dart';
import '../services/api_service.dart';

class SubjectsScreen extends StatefulWidget {
  const SubjectsScreen({super.key});

  @override
  State<SubjectsScreen> createState() => _SubjectsScreenState();
}

class _SubjectsScreenState extends State<SubjectsScreen> {
  final ApiService _api = ApiService();
  List<dynamic> _subjects = [];
  bool _loading = true;
  Map<String, dynamic>? _category;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _category = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    if (_category != null && _loading) _loadSubjects();
  }

  Future<void> _loadSubjects() async {
    try {
      final subs = await _api.get('/subjects/category/${_category!['_id']}');
      setState(() { _subjects = subs; _loading = false; });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_category?['categoryName'] ?? 'Subjects')),
      body: _loading
        ? const Center(child: CircularProgressIndicator())
        : _subjects.isEmpty
          ? const Center(child: Text('No subjects available'))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _subjects.length,
              itemBuilder: (ctx, i) {
                final sub = _subjects[i];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: AppColors.orange.withOpacity(0.1),
                      child: const Icon(Icons.subject, color: AppColors.orange),
                    ),
                    title: Text(sub['subjectName'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600)),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => Navigator.pushNamed(context, '/exam-list', arguments: {
                      'category': _category,
                      'subject': sub,
                    }),
                  ),
                );
              },
            ),
    );
  }
}
