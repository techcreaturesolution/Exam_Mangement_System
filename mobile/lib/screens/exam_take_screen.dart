import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../constants/theme.dart';
import '../services/api_service.dart';

class ExamTakeScreen extends StatefulWidget {
  const ExamTakeScreen({super.key});

  @override
  State<ExamTakeScreen> createState() => _ExamTakeScreenState();
}

class _ExamTakeScreenState extends State<ExamTakeScreen> with WidgetsBindingObserver {
  final ApiService _api = ApiService();
  
  Map<String, dynamic>? _examData;
  List<dynamic> _questions = [];
  Map<String, dynamic>? _attempt;
  Map<String, dynamic>? _examInfo;
  
  int _currentIndex = 0;
  final Map<int, String> _answers = {}; // index -> 'A', 'B', 'C', 'D'
  final Set<int> _flagged = {};
  
  Timer? _timer;
  int _remainingSeconds = 0;
  bool _loading = true;
  bool _submitting = false;
  int _violationCount = 0;
  
  // Anti-cheat settings
  bool _antiCheatEnabled = false;
  int _maxViolations = 3;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_examData == null) {
      _examData = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
      if (_examData != null) _startExam();
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _timer?.cancel();
    _disableSecurityFeatures();
    super.dispose();
  }

  // Anti-cheat: Detect app switching
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive) {
      if (_antiCheatEnabled && !_submitting) {
        _reportViolation('app_switch');
      }
    }
  }

  Future<void> _enableSecurityFeatures() async {
    try {
      if (_antiCheatEnabled) {
        await SystemChannels.platform.invokeMethod('SystemChrome.setEnabledSystemUIMode', 'immersive');
      }
    } catch (e) {
      // Platform features may not be available
    }
  }

  Future<void> _disableSecurityFeatures() async {
    try {
      await SystemChannels.platform.invokeMethod('SystemChrome.setEnabledSystemUIMode', 'edgeToEdge');
    } catch (e) {
      // ignore
    }
  }

  Future<void> _reportViolation(String type) async {
    setState(() => _violationCount++);
    
    try {
      final result = await _api.post('/violations', body: {
        'examId': _examInfo?['_id'],
        'attemptId': _attempt?['_id'],
        'type': type,
      });
      
      if (result['autoSubmitted'] == true) {
        if (mounted) _showAutoSubmitDialog();
        return;
      }
    } catch (e) {
      // Continue even if violation reporting fails
    }

    if (mounted) _showViolationWarning();
  }

  void _showViolationWarning() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.warning, color: AppColors.error),
            SizedBox(width: 8),
            Text('Warning!'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Switching apps during the exam is not allowed.'),
            const SizedBox(height: 12),
            Text('Violations: $_violationCount / $_maxViolations',
              style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.error)),
            Text('Your exam will be auto-submitted after $_maxViolations violations.',
              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('I Understand'),
          ),
        ],
      ),
    );
  }

  void _showAutoSubmitDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.gpp_bad, color: AppColors.error),
            SizedBox(width: 8),
            Text('Exam Auto-Submitted'),
          ],
        ),
        content: const Text('Your exam has been automatically submitted due to too many security violations.'),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pushReplacementNamed(context, '/home');
            },
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  Future<void> _startExam() async {
    try {
      final examId = _examData!['examId'] ?? _examData!['_id'];
      final data = await _api.post('/exams/$examId/start');
      
      setState(() {
        _attempt = data['attempt'];
        _examInfo = data['exam'] ?? _examData;
        _questions = data['questions'] ?? [];
        _remainingSeconds = (_examInfo?['durationMinutes'] ?? 30) * 60;
        _loading = false;
        
        // Anti-cheat settings
        _antiCheatEnabled = _examInfo?['antiCheatEnabled'] ?? false;
        _maxViolations = _examInfo?['maxViolations'] ?? 3;
      });
      
      _enableSecurityFeatures();
      _startTimer();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.error),
        );
        Navigator.pop(context);
      }
    }
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds <= 0) {
        timer.cancel();
        _submitExam();
        return;
      }
      setState(() => _remainingSeconds--);
    });
  }

  String get _timerText {
    final h = _remainingSeconds ~/ 3600;
    final m = (_remainingSeconds % 3600) ~/ 60;
    final s = _remainingSeconds % 60;
    if (h > 0) return '${h.toString().padLeft(2, '0')}:${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  Future<void> _submitExam() async {
    if (_submitting) return;
    setState(() => _submitting = true);
    _timer?.cancel();

    try {
      final answers = _questions.asMap().entries.map((e) {
        return {
          'questionId': e.value['_id'],
          'selectedAnswer': _answers[e.key] ?? '',
        };
      }).toList();

      final examId = _examData!['examId'] ?? _examData!['_id'];
      final result = await _api.post('/exams/$examId/submit', body: {
        'attemptId': _attempt?['_id'],
        'answers': answers,
      });

      if (mounted) {
        result['attemptId'] = _attempt?['_id'];
        result['examId'] = examId;
        result['examData'] = _examData;
        result['totalQuestions'] = _questions.length;
        result['skippedAnswers'] = result['unanswered'] ?? (_questions.length - _answers.length);
        result['score'] = result['obtainedMarks'] ?? result['score'];
        Navigator.pushReplacementNamed(context, '/result', arguments: result);
      }
    } catch (e) {
      setState(() => _submitting = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Submit error: $e'), backgroundColor: AppColors.error),
        );
      }
    }
  }

  void _confirmSubmit() {
    final answered = _answers.length;
    final total = _questions.length;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Submit Exam?'),
        content: Text('You have answered $answered out of $total questions.\n\nAre you sure you want to submit?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () { Navigator.pop(ctx); _submitExam(); },
            child: const Text('Submit'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (_questions.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Exam')),
        body: const Center(child: Text('No questions available')),
      );
    }

    final question = _questions[_currentIndex];
    // Build options from optionA/B/C/D fields
    final options = <Map<String, String>>[
      {'key': 'A', 'text': question['optionA']?.toString() ?? ''},
      {'key': 'B', 'text': question['optionB']?.toString() ?? ''},
      {'key': 'C', 'text': question['optionC']?.toString() ?? ''},
      {'key': 'D', 'text': question['optionD']?.toString() ?? ''},
    ];
    final isTimeLow = _remainingSeconds < 60;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop) _confirmSubmit();
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: Text('Q ${_currentIndex + 1} / ${_questions.length}'),
          leading: IconButton(
            icon: const Icon(Icons.close),
            onPressed: _confirmSubmit,
          ),
          actions: [
            // Timer
            Container(
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: isTimeLow ? AppColors.error : Colors.white.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                children: [
                  Icon(Icons.timer, size: 16, color: isTimeLow ? Colors.white : Colors.white70),
                  const SizedBox(width: 4),
                  Text(_timerText, style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: isTimeLow ? 16 : 14,
                  )),
                ],
              ),
            ),
          ],
        ),
        body: Column(
          children: [
            // Progress bar
            LinearProgressIndicator(
              value: (_currentIndex + 1) / _questions.length,
              backgroundColor: AppColors.border,
              valueColor: const AlwaysStoppedAnimation(AppColors.orange),
              minHeight: 4,
            ),

            // Violation indicator
            if (_violationCount > 0)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                color: AppColors.error.withValues(alpha: 0.1),
                child: Row(
                  children: [
                    const Icon(Icons.shield, size: 14, color: AppColors.error),
                    const SizedBox(width: 6),
                    Text('Violations: $_violationCount / $_maxViolations',
                      style: const TextStyle(color: AppColors.error, fontSize: 12, fontWeight: FontWeight.w500)),
                  ],
                ),
              ),

            // Question
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Question header
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.navy,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text('Q${_currentIndex + 1}',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        ),
                        const Spacer(),
                        Text('${question['marks'] ?? 1} mark(s)', style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                        const SizedBox(width: 8),
                        IconButton(
                          icon: Icon(
                            _flagged.contains(_currentIndex) ? Icons.flag : Icons.flag_outlined,
                            color: _flagged.contains(_currentIndex) ? AppColors.orange : AppColors.textLight,
                          ),
                          onPressed: () {
                            setState(() {
                              if (_flagged.contains(_currentIndex)) {
                                _flagged.remove(_currentIndex);
                              } else {
                                _flagged.add(_currentIndex);
                              }
                            });
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    Text(
                      question['question'] ?? '',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w500, height: 1.5),
                    ),
                    const SizedBox(height: 24),

                    // Options A, B, C, D
                    ...options.map((opt) {
                      final isSelected = _answers[_currentIndex] == opt['key'];
                      return GestureDetector(
                        onTap: () => setState(() => _answers[_currentIndex] = opt['key']!),
                        child: Container(
                          width: double.infinity,
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: isSelected ? AppColors.navy.withValues(alpha: 0.08) : Colors.white,
                            border: Border.all(
                              color: isSelected ? AppColors.navy : AppColors.border,
                              width: isSelected ? 2 : 1,
                            ),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 32, height: 32,
                                decoration: BoxDecoration(
                                  color: isSelected ? AppColors.navy : AppColors.background,
                                  shape: BoxShape.circle,
                                  border: Border.all(color: isSelected ? AppColors.navy : AppColors.border),
                                ),
                                child: Center(
                                  child: Text(opt['key']!,
                                    style: TextStyle(
                                      color: isSelected ? Colors.white : AppColors.textSecondary,
                                      fontWeight: FontWeight.bold,
                                    )),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(child: Text(opt['text']!, style: const TextStyle(fontSize: 15))),
                            ],
                          ),
                        ),
                      );
                    }),
                  ],
                ),
              ),
            ),

            // Bottom navigation
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -2))],
              ),
              child: Column(
                children: [
                  // Question dots
                  SizedBox(
                    height: 32,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: _questions.length,
                      itemBuilder: (ctx, i) {
                        final isAnswered = _answers.containsKey(i);
                        final isCurrent = i == _currentIndex;
                        final isFlagged = _flagged.contains(i);
                        return GestureDetector(
                          onTap: () => setState(() => _currentIndex = i),
                          child: Container(
                            width: 32, height: 32,
                            margin: const EdgeInsets.only(right: 6),
                            decoration: BoxDecoration(
                              color: isCurrent ? AppColors.navy
                                  : isFlagged ? AppColors.orange
                                  : isAnswered ? AppColors.success
                                  : AppColors.background,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: isCurrent ? AppColors.navy : AppColors.border,
                              ),
                            ),
                            child: Center(
                              child: Text('${i + 1}',
                                style: TextStyle(
                                  color: (isCurrent || isAnswered || isFlagged) ? Colors.white : AppColors.textSecondary,
                                  fontWeight: FontWeight.bold, fontSize: 12,
                                )),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Navigation buttons
                  Row(
                    children: [
                      if (_currentIndex > 0)
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => setState(() => _currentIndex--),
                            child: const Text('Previous'),
                          ),
                        ),
                      if (_currentIndex > 0) const SizedBox(width: 12),
                      Expanded(
                        child: _currentIndex < _questions.length - 1
                            ? ElevatedButton(
                                onPressed: () => setState(() => _currentIndex++),
                                child: const Text('Next'),
                              )
                            : ElevatedButton(
                                style: ElevatedButton.styleFrom(backgroundColor: AppColors.success),
                                onPressed: _confirmSubmit,
                                child: const Text('Submit'),
                              ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
