class ApiConstants {
  static const String baseUrl = 'http://10.0.2.2:5000/api'; // Android emulator
  static const String iosBaseUrl = 'http://localhost:5000/api'; // iOS simulator
  
  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String me = '/auth/me';
  
  // Categories
  static const String categories = '/categories';
  
  // Subjects
  static const String subjects = '/subjects';
  
  // Levels
  static const String levels = '/levels';
  
  // Exams
  static const String exams = '/exams';
  static const String examHistory = '/exams/history';
  
  // Questions
  static const String questions = '/questions';
  
  // Payments
  static const String payments = '/payments';
  
  // Violations
  static const String violations = '/violations';
}
