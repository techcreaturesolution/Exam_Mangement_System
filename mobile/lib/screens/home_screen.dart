import 'package:flutter/material.dart';
import '../constants/theme.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../constants/api_constants.dart';
import 'package:provider/provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  final List<Widget> _pages = const [
    _HomePage(),
    _PracticePage(),
    _TestsPage(),
    _ProfilePage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (i) => setState(() => _currentIndex = i),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.menu_book_outlined), activeIcon: Icon(Icons.menu_book), label: 'Practice'),
          BottomNavigationBarItem(icon: Icon(Icons.assignment_outlined), activeIcon: Icon(Icons.assignment), label: 'Tests'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Me'),
        ],
      ),
    );
  }
}

// === HOME TAB ===
class _HomePage extends StatefulWidget {
  const _HomePage();
  @override
  State<_HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<_HomePage> {
  final ApiService _api = ApiService();
  List<dynamic> _categories = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final cats = await _api.get(ApiConstants.categories);
      setState(() { _categories = cats; _loading = false; });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: _loadData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(20),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(colors: [AppColors.navy, AppColors.navyDark]),
                  borderRadius: BorderRadius.only(
                    bottomLeft: Radius.circular(24),
                    bottomRight: Radius.circular(24),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 24,
                          backgroundColor: AppColors.orange,
                          child: Text(
                            (user?['name'] ?? 'U')[0].toUpperCase(),
                            style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Hi, ${user?['name'] ?? 'Student'}!',
                                style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                              if (user?['company']?['name'] != null)
                                Text(user!['company']['name'], style: const TextStyle(color: Colors.white70, fontSize: 13)),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.notifications_outlined, color: Colors.white),
                          onPressed: () {},
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    // Stats row
                    Row(
                      children: [
                        _buildStatChip(Icons.local_fire_department, '0', 'Day Streak'),
                        const SizedBox(width: 12),
                        _buildStatChip(Icons.quiz, '0', 'MCQs Done'),
                        const SizedBox(width: 12),
                        _buildStatChip(Icons.trending_up, '0%', 'Accuracy'),
                      ],
                    ),
                  ],
                ),
              ),

              // Free Demo Banner
              Padding(
                padding: const EdgeInsets.all(16),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [AppColors.orange, AppColors.orangeLight]),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.star, color: Colors.white, size: 40),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Free Demo Available!', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                            const Text('Try practice exams for free', style: TextStyle(color: Colors.white70)),
                          ],
                        ),
                      ),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: AppColors.orange),
                        onPressed: () {},
                        child: const Text('Try Now'),
                      ),
                    ],
                  ),
                ),
              ),

              // Categories
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: const Text('Featured Topics', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
              ),
              const SizedBox(height: 12),

              if (_loading)
                const Center(child: CircularProgressIndicator())
              else if (_categories.isEmpty)
                const Padding(
                  padding: EdgeInsets.all(32),
                  child: Center(child: Text('No topics available yet', style: TextStyle(color: AppColors.textSecondary))),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: _categories.length,
                  itemBuilder: (ctx, i) {
                    final cat = _categories[i];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: AppColors.navy.withValues(alpha: 0.1),
                          child: const Icon(Icons.book, color: AppColors.navy),
                        ),
                        title: Text(cat['name'], style: const TextStyle(fontWeight: FontWeight.w600)),
                        subtitle: Text(cat['examType'] ?? '', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                        trailing: const Icon(Icons.chevron_right, color: AppColors.textLight),
                        onTap: () => Navigator.pushNamed(context, '/subjects', arguments: cat),
                      ),
                    );
                  },
                ),

              const SizedBox(height: 80),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatChip(IconData icon, String value, String label) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(icon, color: AppColors.orange, size: 20),
            const SizedBox(height: 4),
            Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
            Text(label, style: const TextStyle(color: Colors.white70, fontSize: 10)),
          ],
        ),
      ),
    );
  }
}

// === PRACTICE TAB ===
class _PracticePage extends StatefulWidget {
  const _PracticePage();
  @override
  State<_PracticePage> createState() => _PracticePageState();
}

class _PracticePageState extends State<_PracticePage> {
  final ApiService _api = ApiService();
  List<dynamic> _categories = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final cats = await _api.get(ApiConstants.categories, params: {'examType': 'practice'});
      setState(() { _categories = cats; _loading = false; });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Practice'), centerTitle: true),
      body: _loading
        ? const Center(child: CircularProgressIndicator())
        : _categories.isEmpty
          ? const Center(child: Text('No practice categories available'))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _categories.length,
              itemBuilder: (ctx, i) {
                final cat = _categories[i];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: AppColors.navy.withValues(alpha: 0.1),
                      child: const Icon(Icons.book, color: AppColors.navy),
                    ),
                    title: Text(cat['name'], style: const TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: Text(cat['description'] ?? '', maxLines: 1, overflow: TextOverflow.ellipsis),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => Navigator.pushNamed(context, '/subjects', arguments: cat),
                  ),
                );
              },
            ),
    );
  }
}

// === TESTS TAB ===
class _TestsPage extends StatefulWidget {
  const _TestsPage();
  @override
  State<_TestsPage> createState() => _TestsPageState();
}

class _TestsPageState extends State<_TestsPage> {
  final ApiService _api = ApiService();
  List<dynamic> _exams = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final exams = await _api.get(ApiConstants.exams, params: {'examType': 'mock'});
      setState(() { _exams = exams; _loading = false; });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mock Tests'), centerTitle: true),
      body: _loading
        ? const Center(child: CircularProgressIndicator())
        : _exams.isEmpty
          ? const Center(child: Text('No mock tests available'))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _exams.length,
              itemBuilder: (ctx, i) {
                final exam = _exams[i];
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
                                  color: AppColors.orange.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text('MOCK', style: TextStyle(color: AppColors.orange, fontSize: 11, fontWeight: FontWeight.bold)),
                              ),
                              const Spacer(),
                              Icon(Icons.timer, size: 16, color: AppColors.textSecondary),
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
                              child: const Text('Start Test'),
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

// === PROFILE TAB ===
class _ProfilePage extends StatelessWidget {
  const _ProfilePage();

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    return Scaffold(
      appBar: AppBar(title: const Text('Profile'), centerTitle: true),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Avatar
            CircleAvatar(
              radius: 50,
              backgroundColor: AppColors.navy,
              child: Text(
                (user?['name'] ?? 'U')[0].toUpperCase(),
                style: const TextStyle(fontSize: 40, color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 12),
            Text(user?['name'] ?? '', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            Text(user?['email'] ?? '', style: const TextStyle(color: AppColors.textSecondary)),
            if (user?['company']?['name'] != null) ...[
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.navy.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(user!['company']['name'], style: const TextStyle(color: AppColors.navy, fontSize: 12)),
              ),
            ],
            const SizedBox(height: 24),

            // Menu items
            _profileItem(Icons.history, 'Exam History', () => Navigator.pushNamed(context, '/history')),
            _profileItem(Icons.credit_card, 'My Subscriptions', () => Navigator.pushNamed(context, '/subscriptions')),
            _profileItem(Icons.analytics_outlined, 'Analytics', () => Navigator.pushNamed(context, '/analytics')),
            _profileItem(Icons.settings, 'Settings', () => Navigator.pushNamed(context, '/settings')),
            const Divider(height: 32),
            _profileItem(Icons.logout, 'Logout', () async {
              await context.read<AuthProvider>().logout();
              if (context.mounted) Navigator.pushReplacementNamed(context, '/login');
            }, color: AppColors.error),
          ],
        ),
      ),
    );
  }

  Widget _profileItem(IconData icon, String title, VoidCallback onTap, {Color? color}) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: color ?? AppColors.navy),
        title: Text(title, style: TextStyle(color: color, fontWeight: FontWeight.w500)),
        trailing: Icon(Icons.chevron_right, color: color ?? AppColors.textLight),
        onTap: onTap,
      ),
    );
  }
}
