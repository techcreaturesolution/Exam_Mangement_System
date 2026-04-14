import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.hexagon}>
            <Text style={styles.hexText}>TB</Text>
          </View>
          <Text style={styles.appName}>TestBharti</Text>
          <Text style={styles.tagline}>RECRUITMENT PREP</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email or phone number"
              placeholderTextColor={COLORS.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={COLORS.textLight}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnPrimaryText}>Sign in</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.orText}>or</Text>

          <TouchableOpacity style={[styles.btn, styles.btnOutline]}>
            <Text style={styles.btnOutlineText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerText}>
              New user? <Text style={styles.registerBold}>Register →</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 36 },
  hexagon: {
    width: 72, height: 72, borderRadius: 16, backgroundColor: COLORS.navy,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    transform: [{ rotate: '0deg' }],
  },
  hexText: { fontSize: 24, fontWeight: '700', color: '#fff' },
  appName: { fontSize: 28, fontWeight: '700', color: COLORS.navy },
  tagline: { fontSize: 11, color: COLORS.textLight, letterSpacing: 2, marginTop: 2 },
  form: { width: '100%' },
  inputContainer: { marginBottom: 12 },
  input: {
    height: 48, borderWidth: 1, borderColor: COLORS.inputBorder, borderRadius: 10,
    backgroundColor: COLORS.white, paddingHorizontal: 16, fontSize: 15, color: COLORS.text,
  },
  btn: { height: 48, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  btnPrimary: { backgroundColor: COLORS.navy },
  btnDisabled: { opacity: 0.7 },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  orText: { textAlign: 'center', fontSize: 13, color: COLORS.textLight, marginVertical: 4 },
  btnOutline: { borderWidth: 1.5, borderColor: COLORS.navy, backgroundColor: 'transparent' },
  btnOutlineText: { color: COLORS.navy, fontSize: 14, fontWeight: '600' },
  registerLink: { marginTop: 16, alignItems: 'center' },
  registerText: { fontSize: 14, color: COLORS.textMuted },
  registerBold: { color: COLORS.navy, fontWeight: '600' },
});

export default LoginScreen;
