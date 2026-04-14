import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';
import api from '../services/api';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSubscriptions(); }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data } = await api.get('/payments/my-subscriptions');
      setSubscriptions(data);
    } catch (e) { /* ignore */ }
    finally { setLoading(false); }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const activePlan = subscriptions.length > 0 ? subscriptions[0] : null;

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      {/* Active Plan */}
      {loading ? (
        <ActivityIndicator color={COLORS.navy} style={{ marginVertical: 16 }} />
      ) : activePlan ? (
        <View style={styles.planCard}>
          <View style={styles.planRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.planName}>{activePlan.plan?.name || 'Active Plan'} · active</Text>
              <Text style={styles.planExpiry}>
                Expires: {new Date(activePlan.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            </View>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.noPlanCard} onPress={() => navigation.navigate('Plans')}>
          <Text style={styles.noPlanText}>No active plan</Text>
          <View style={styles.upgradeBtn}>
            <Text style={styles.upgradeBtnText}>Upgrade</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Details */}
      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Plan</Text>
          <Text style={styles.detailValue}>{activePlan?.plan?.name || 'Free'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Email</Text>
          <Text style={styles.detailValue}>{user?.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Member since</Text>
          <Text style={styles.detailValue}>
            {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('MySubscriptions')}>
          <Text style={styles.actionText}>My Subscriptions</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.actionText}>Settings</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  profileHeader: { alignItems: 'center', paddingTop: 32, paddingBottom: 20 },
  avatar: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.navy,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  avatarText: { fontSize: 22, fontWeight: '700', color: '#fff' },
  userName: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  userEmail: { fontSize: 14, color: COLORS.textMuted, marginTop: 2 },
  planCard: {
    backgroundColor: COLORS.navyBg, borderWidth: 1, borderColor: COLORS.navy,
    borderRadius: 12, padding: 14, marginHorizontal: 16, marginBottom: 16,
  },
  planRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planName: { fontSize: 15, fontWeight: '700', color: COLORS.navy },
  planExpiry: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  activeBadge: { backgroundColor: COLORS.greenBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  activeBadgeText: { fontSize: 11, fontWeight: '700', color: COLORS.green },
  noPlanCard: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginHorizontal: 16,
    marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 0.5, borderColor: COLORS.border,
  },
  noPlanText: { fontSize: 14, color: COLORS.textMuted },
  upgradeBtn: { backgroundColor: COLORS.navy, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 5 },
  upgradeBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  detailsCard: { marginHorizontal: 16, marginBottom: 16 },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: COLORS.borderLight,
  },
  detailLabel: { fontSize: 14, color: COLORS.text },
  detailValue: { fontSize: 14, color: COLORS.navy, fontWeight: '600' },
  actionsContainer: { marginHorizontal: 16, marginBottom: 16 },
  actionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: COLORS.borderLight,
  },
  actionText: { fontSize: 14, color: COLORS.text },
  actionArrow: { fontSize: 14, color: COLORS.navy },
  logoutBtn: {
    marginHorizontal: 16, borderWidth: 1, borderColor: COLORS.redBorder,
    borderRadius: 10, height: 44, justifyContent: 'center', alignItems: 'center',
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: COLORS.red },
});

export default ProfileScreen;
