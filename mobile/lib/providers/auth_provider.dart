import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import '../constants/api_constants.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  
  Map<String, dynamic>? _user;
  bool _isLoading = true;
  bool _isAuthenticated = false;

  Map<String, dynamic>? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;
  String get userName => _user?['name'] ?? 'Student';
  String get userEmail => _user?['email'] ?? '';

  AuthProvider() {
    _loadUser();
  }

  Future<void> _loadUser() async {
    try {
      final token = await _api.getToken();
      if (token != null) {
        final prefs = await SharedPreferences.getInstance();
        final userData = prefs.getString('user');
        if (userData != null) {
          _user = jsonDecode(userData);
          _isAuthenticated = true;
        }
      }
    } catch (e) {
      // Token invalid
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    final data = await _api.post(ApiConstants.login, body: {
      'email': email,
      'password': password,
    });
    
    await _api.setToken(data['token']);
    _user = data;
    _isAuthenticated = true;
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user', jsonEncode(data));
    
    notifyListeners();
  }

  Future<void> register(String name, String email, String password, String mobile) async {
    final data = await _api.post(ApiConstants.register, body: {
      'name': name,
      'email': email,
      'password': password,
      'mobile': mobile,
    });
    
    await _api.setToken(data['token']);
    _user = data;
    _isAuthenticated = true;
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user', jsonEncode(data));
    
    notifyListeners();
  }

  Future<void> forgotPassword(String email) async {
    await _api.post(ApiConstants.forgotPassword, body: {'email': email});
  }

  Future<void> updateProfile(Map<String, dynamic> data) async {
    final updated = await _api.put('/auth/profile', body: data);
    _user = updated;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user', jsonEncode(updated));
    notifyListeners();
  }

  Future<void> refreshUser() async {
    try {
      final data = await _api.get(ApiConstants.me);
      _user = data;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user', jsonEncode(data));
      notifyListeners();
    } catch (e) {
      // ignore
    }
  }

  Future<void> logout() async {
    await _api.removeToken();
    _user = null;
    _isAuthenticated = false;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user');
    notifyListeners();
  }
}
