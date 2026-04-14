import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import api from '../services/api';

const MySubscriptionsScreen = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [subsRes, paymentsRes] = await Promise.all([
        api.get('/payments/my-subscriptions'),
        api.get('/payments/my-payments'),
      ]);
      setSubscriptions(subsRes.data);
      setPayments(paymentsRes.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
  };

  const getDaysLeft = (expiresAt) => {
    const now = new Date();
    const exp = new Date(expiresAt);
    const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Active Subscriptions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Subscriptions</Text>
        {subscriptions.length > 0 ? (
          subscriptions.map((sub) => (
            <View key={sub._id} style={styles.subCard}>
              <View style={styles.subHeader}>
                <Text style={styles.planName}>{sub.plan?.name}</Text>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
              </View>
              <Text style={styles.planType}>
                {sub.plan?.planType?.replace('_', ' ')}
              </Text>
              <View style={styles.subInfo}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Paid</Text>
                  <Text style={styles.infoValue}>{formatPrice(sub.amount)}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Days Left</Text>
                  <Text style={[styles.infoValue, getDaysLeft(sub.expiresAt) < 7 && styles.warningText]}>
                    {getDaysLeft(sub.expiresAt)}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Expires</Text>
                  <Text style={styles.infoValue}>
                    {new Date(sub.expiresAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No active subscriptions</Text>
          </View>
        )}
      </View>

      {/* Payment History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment History</Text>
        {payments.length > 0 ? (
          payments.map((payment) => (
            <View key={payment._id} style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <Text style={styles.paymentPlan}>{payment.plan?.name || 'Plan'}</Text>
                <Text style={styles.paymentAmount}>{formatPrice(payment.amount)}</Text>
              </View>
              <View style={styles.paymentMeta}>
                <Text style={[styles.statusBadge, {
                  color: payment.status === 'paid' ? '#10b981' :
                         payment.status === 'failed' ? '#ef4444' : '#f59e0b',
                }]}>
                  {payment.status.toUpperCase()}
                </Text>
                <Text style={styles.paymentDate}>
                  {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No payment history</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
  subCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
    borderLeftWidth: 4, borderLeftColor: '#10b981',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  planName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  activeBadge: { backgroundColor: '#d1fae5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  activeBadgeText: { fontSize: 11, fontWeight: '600', color: '#065f46' },
  planType: { fontSize: 13, color: '#6b7280', marginBottom: 12, textTransform: 'capitalize' },
  subInfo: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f9fafb', borderRadius: 8, padding: 10 },
  infoItem: { alignItems: 'center' },
  infoLabel: { fontSize: 11, color: '#9ca3af' },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#1f2937', marginTop: 2 },
  warningText: { color: '#ef4444' },
  paymentCard: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1,
  },
  paymentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  paymentPlan: { fontSize: 14, fontWeight: '500', color: '#374151' },
  paymentAmount: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  paymentMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  statusBadge: { fontSize: 11, fontWeight: '700' },
  paymentDate: { fontSize: 12, color: '#9ca3af' },
  emptyState: { padding: 24, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#9ca3af' },
});

export default MySubscriptionsScreen;
