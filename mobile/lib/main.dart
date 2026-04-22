import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'constants/theme.dart';
import 'providers/auth_provider.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/forgot_password_screen.dart';
import 'screens/home_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/subjects_screen.dart';
import 'screens/exam_list_screen.dart';
import 'screens/exam_detail_screen.dart';
import 'screens/exam_take_screen.dart';
import 'screens/result_screen.dart';
import 'screens/history_screen.dart';
import 'screens/analytics_screen.dart';
import 'screens/subscriptions_screen.dart';
import 'screens/settings_screen.dart';
import 'screens/exam_review_screen.dart';
import 'screens/performance_screen.dart';
import 'screens/notifications_screen.dart';
import 'screens/support_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ExamApp());
}

class ExamApp extends StatelessWidget {
  const ExamApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AuthProvider(),
      child: Consumer<AuthProvider>(
        builder: (context, auth, _) {
          return MaterialApp(
            title: 'TestBharti',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.theme,
            initialRoute: auth.isLoading ? '/splash' : (auth.isAuthenticated ? '/home' : '/login'),
            routes: {
              '/splash': (ctx) => const SplashScreen(),
              '/login': (ctx) => const LoginScreen(),
              '/register': (ctx) => const RegisterScreen(),
              '/forgot-password': (ctx) => const ForgotPasswordScreen(),
              '/home': (ctx) => const HomeScreen(),
              '/profile': (ctx) => const ProfileScreen(),
              '/subjects': (ctx) => const SubjectsScreen(),
              '/exam-list': (ctx) => const ExamListScreen(),
              '/exam-detail': (ctx) => const ExamDetailScreen(),
              '/exam-take': (ctx) => const ExamTakeScreen(),
              '/result': (ctx) => const ResultScreen(),
              '/history': (ctx) => const HistoryScreen(),
              '/analytics': (ctx) => const AnalyticsScreen(),
              '/subscriptions': (ctx) => const SubscriptionsScreen(),
              '/settings': (ctx) => const SettingsScreen(),
              '/exam-review': (ctx) => const ExamReviewScreen(),
              '/performance': (ctx) => const PerformanceScreen(),
              '/notifications': (ctx) => const NotificationsScreen(),
              '/support': (ctx) => const SupportScreen(),
            },
          );
        },
      ),
    );
  }
}
