import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, phone);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create account</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={COLORS.textLight} />
          </View>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email / phone" placeholderTextColor={COLORS.textLight} keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone number (optional)" placeholderTextColor={COLORS.textLight} keyboardType="phone-pad" />
          </View>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={COLORS.textLight} secureTextEntry />
          </View>

          <TouchableOpacity style={[styles.btn, styles.btnPrimary, loading && styles.btnDisabled]} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create account</Text>}
          </TouchableOpacity>

          <Text style={styles.terms}>By continuing you agree to our Terms</Text>

          <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Already have an account? <Text style={styles.loginBold}>Sign in →</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.navy },
  form: { width: '100%' },
  inputContainer: { marginBottom: 12 },
  input: {
    height: 48, borderWidth: 1, borderColor: COLORS.inputBorder, borderRadius: 10,
    backgroundColor: COLORS.white, paddingHorizontal: 16, fontSize: 15, color: COLORS.text,
  },
  btn: { height: 48, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 4, marginBottom: 10 },
  btnPrimary: { backgroundColor: COLORS.navy },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  terms: { textAlign: 'center', fontSize: 12, color: COLORS.textLight, marginTop: 4 },
  loginLink: { marginTop: 16, alignItems: 'center' },
  loginText: { fontSize: 14, color: COLORS.textMuted },
  loginBold: { color: COLORS.navy, fontWeight: '600' },
});

export default RegisterScreen;
