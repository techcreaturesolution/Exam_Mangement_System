import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

const SettingsScreen = ({ navigation }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Settings</Text>

      {/* Preferences */}
      <Text style={styles.sectionLabel}>PREFERENCES</Text>
      <View style={styles.row}><Text style={styles.rowLabel}>Language</Text><Text style={styles.rowValue}>English</Text></View>
      <View style={styles.row}><Text style={styles.rowLabel}>Notifications</Text><Text style={styles.rowValue}>On</Text></View>
      <View style={styles.row}><Text style={styles.rowLabel}>Daily reminder</Text><Text style={styles.rowValue}>8:00 AM</Text></View>

      {/* Account */}
      <Text style={styles.sectionLabel}>ACCOUNT</Text>
      <TouchableOpacity style={styles.row}>
        <Text style={styles.rowLabel}>Change password</Text>
        <Text style={styles.rowArrow}>→</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.row}>
        <Text style={styles.rowLabel}>Linked Google</Text>
        <Text style={styles.rowArrow}>→</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.row}>
        <Text style={styles.rowLabel}>Delete account</Text>
        <Text style={[styles.rowArrow, { color: COLORS.red }]}>→</Text>
      </TouchableOpacity>

      {/* About */}
      <Text style={styles.sectionLabel}>ABOUT</Text>
      <View style={styles.row}><Text style={styles.rowLabel}>Version</Text><Text style={styles.rowLight}>1.0.0</Text></View>
      <TouchableOpacity style={styles.row}>
        <Text style={styles.rowLabel}>Privacy policy</Text>
        <Text style={styles.rowArrow}>→</Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 16 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, paddingTop: 16, marginBottom: 16 },
  sectionLabel: { fontSize: 11, color: COLORS.textMuted, letterSpacing: 0.5, marginTop: 16, marginBottom: 8 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: COLORS.borderLight,
  },
  rowLabel: { fontSize: 14, color: COLORS.text },
  rowValue: { fontSize: 14, color: COLORS.navy, fontWeight: '600' },
  rowArrow: { fontSize: 14, color: COLORS.navy },
  rowLight: { fontSize: 14, color: COLORS.textLight },
  logoutBtn: {
    borderWidth: 1, borderColor: COLORS.redBorder, borderRadius: 10,
    height: 44, justifyContent: 'center', alignItems: 'center', marginTop: 20,
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: COLORS.red },
});

export default SettingsScreen;
