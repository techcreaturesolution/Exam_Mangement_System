class ApiConstants {
  static const String baseUrl = 'http://10.0.2.2:5000/api'; // Android emulator
  static const String iosBaseUrl = 'http://localhost:5000/api'; // iOS simulator
  
  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String forgotPassword = '/auth/forgot-password';
  static const String me = '/auth/me';
  static const String changePassword = '/auth/change-password';
  
  // Categories
  static const String categories = '/categories';
  
  // Subjects
  static const String subjects = '/subjects';
  
  // Levels
  static const String levels = '/levels';
  
  // Exams
  static const String exams = '/exams';
  static const String examHistory = '/exams/history';
  static const String examPerformance = '/exams/performance';
  static const String examReview = '/exams/review'; // append /:attemptId
  
  // Questions
  static const String questions = '/questions';
  
  // Payments
  static const String payments = '/payments';
  static const String plans = '/payments/plans';
  static const String createOrder = '/payments/create-order';
  static const String verifyPayment = '/payments/verify';
  static const String mySubscription = '/payments/my-subscription';
  static const String checkAccess = '/payments/check-access';
  static const String paymentHistory = '/payments/history';
  
  // Violations
  static const String violations = '/violations';
}
