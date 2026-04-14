import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/theme';
import api from '../services/api';

const MySubscriptionsScreen = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [subsRes, payRes] = await Promise.all([
        api.get('/payments/my-subscriptions'),
        api.get('/payments/my-payments'),
      ]);
      setSubscriptions(subsRes.data);
      setPayments(payRes.data);
    } catch (e) { /* ignore */ }
    finally { setLoading(false); }
  };

  const getDaysLeft = (expiresAt) => {
    return Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return { bg: COLORS.greenBg, text: COLORS.green };
      case 'created': return { bg: COLORS.blueBg, text: COLORS.blueText };
      case 'failed': return { bg: COLORS.redBg, text: COLORS.red };
      case 'refunded': return { bg: COLORS.orangeLight, text: COLORS.orangeText };
      default: return { bg: '#f0f0f0', text: COLORS.textMuted };
    }
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.navy} /></View>;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Active Subscriptions */}
      <Text style={styles.sectionTitle}>Active subscriptions</Text>
      {subscriptions.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No active subscriptions</Text>
        </View>
      ) : (
        subscriptions.map((sub, i) => {
          const daysLeft = getDaysLeft(sub.expiresAt);
          return (
            <View key={i} style={styles.subCard}>
              <View style={styles.subHeader}>
                <Text style={styles.subName}>{sub.plan?.name || 'Plan'}</Text>
                <View style={[styles.badge, { backgroundColor: COLORS.greenBg }]}>
                  <Text style={[styles.badgeText, { color: COLORS.green }]}>Active</Text>
                </View>
              </View>
              <Text style={styles.subMeta}>
                {sub.plan?.planType} · ₹{sub.amount} paid
              </Text>
              <View style={styles.subFooter}>
                <Text style={styles.daysLeft}>{daysLeft} days left</Text>
                <Text style={styles.expiry}>
                  Expires: {new Date(sub.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              </View>
            </View>
          );
        })
      )}

      {/* Payment History */}
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Payment history</Text>
      {payments.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No payment history</Text>
        </View>
      ) : (
        payments.map((payment, i) => {
          const colors = getStatusColor(payment.status);
          return (
            <View key={i} style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <Text style={styles.paymentName}>{payment.plan?.name || 'Plan'}</Text>
                <Text style={styles.paymentAmount}>₹{payment.amount}</Text>
              </View>
              <View style={styles.paymentFooter}>
                <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                  <Text style={[styles.statusText, { color: colors.text }]}>{payment.status}</Text>
                </View>
                <Text style={styles.paymentDate}>
                  {new Date(payment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              </View>
            </View>
          );
        })
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, paddingTop: 16, marginBottom: 10 },
  emptyCard: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 24,
    alignItems: 'center', borderWidth: 0.5, borderColor: COLORS.border,
  },
  emptyText: { fontSize: 14, color: COLORS.textMuted },
  subCard: {
    backgroundColor: COLORS.white, borderWidth: 0.5, borderColor: COLORS.border,
    borderRadius: 12, padding: 14, marginBottom: 8,
  },
  subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subName: { fontSize: 15, fontWeight: '700', color: COLORS.navy },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  subMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  subFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  daysLeft: { fontSize: 13, fontWeight: '600', color: COLORS.orange },
  expiry: { fontSize: 12, color: COLORS.textMuted },
  paymentCard: {
    backgroundColor: COLORS.white, borderWidth: 0.5, borderColor: COLORS.border,
    borderRadius: 12, padding: 14, marginBottom: 8,
  },
  paymentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paymentName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  paymentAmount: { fontSize: 15, fontWeight: '700', color: COLORS.navy },
  paymentFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  paymentDate: { fontSize: 12, color: COLORS.textMuted },
});

export default MySubscriptionsScreen;
