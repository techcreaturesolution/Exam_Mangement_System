import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { COLORS } from '../constants/theme';
import api from '../services/api';

const PlansScreen = ({ navigation }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await api.get('/payments/plans');
      setPlans(data.filter(p => p.isActive));
      if (data.length > 0) setSelectedPlan(data.find(p => p.isActive)?._id);
    } catch (e) { /* ignore */ }
    finally { setLoading(false); }
  };

  const handlePurchase = async () => {
    if (!selectedPlan) { Alert.alert('Error', 'Please select a plan'); return; }
    setProcessing(true);
    try {
      const { data: order } = await api.post('/payments/create-order', { planId: selectedPlan });

      // Attempt Razorpay checkout
      try {
        const RazorpayCheckout = require('react-native-razorpay').default;
        const options = {
          description: 'TestBharti Subscription',
          currency: order.currency,
          key: order.key,
          amount: order.amount,
          name: 'TestBharti',
          order_id: order.orderId,
          prefill: { email: order.email || '', contact: '' },
          theme: { color: COLORS.navy },
        };
        const result = await RazorpayCheckout.open(options);
        const { data: verification } = await api.post('/payments/verify', {
          razorpay_order_id: result.razorpay_order_id,
          razorpay_payment_id: result.razorpay_payment_id,
          razorpay_signature: result.razorpay_signature,
        });
        Alert.alert('Payment Successful!', `Access granted until ${new Date(verification.payment.expiresAt).toLocaleDateString('en-IN')}`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } catch (rzpError) {
        Alert.alert(
          'Payment Info',
          'Razorpay checkout requires a native build. In development, the order has been created. For production, build with react-native-razorpay.',
          [{ text: 'OK' }]
        );
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to create order');
    } finally { setProcessing(false); }
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.navy} /></View>;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Select your plan</Text>

      {plans.map((plan, i) => {
        const isSelected = selectedPlan === plan._id;
        const isPopular = i === Math.min(1, plans.length - 1);

        return (
          <TouchableOpacity
            key={plan._id}
            style={[styles.planCard, isSelected && styles.planCardSelected]}
            onPress={() => setSelectedPlan(plan._id)}
          >
            {isPopular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </View>
            )}
            <Text style={[styles.planName, isSelected && { color: COLORS.navy }]}>{plan.name}</Text>
            <Text style={styles.planDesc}>{plan.description || plan.features?.join(' · ') || ''}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>₹{plan.price}</Text>
              <Text style={styles.priceSuffix}> / {plan.duration} days</Text>
            </View>
          </TouchableOpacity>
        );
      })}

      {plans.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No plans available</Text>
        </View>
      )}

      {plans.length > 0 && (
        <>
          <TouchableOpacity
            style={[styles.purchaseBtn, processing && { opacity: 0.7 }]}
            onPress={handlePurchase}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.purchaseBtnText}>
                Continue with {plans.find(p => p._id === selectedPlan)?.name || 'plan'}
              </Text>
            )}
          </TouchableOpacity>
          <Text style={styles.noRenewal}>No auto-renewal · Secured by Razorpay</Text>
        </>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.navy, paddingTop: 16, marginBottom: 16 },
  planCard: {
    backgroundColor: COLORS.white, borderWidth: 0.5, borderColor: COLORS.inputBorder,
    borderRadius: 12, padding: 14, marginBottom: 10,
  },
  planCardSelected: { backgroundColor: COLORS.navyBg, borderWidth: 1.5, borderColor: COLORS.navy },
  popularBadge: {
    backgroundColor: COLORS.orange, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 2,
    alignSelf: 'flex-start', marginBottom: 6,
  },
  popularText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  planName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  planDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 3 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 6 },
  price: { fontSize: 22, fontWeight: '700', color: COLORS.navy },
  priceSuffix: { fontSize: 13, color: COLORS.textMuted },
  purchaseBtn: {
    backgroundColor: COLORS.navy, borderRadius: 10, height: 48,
    justifyContent: 'center', alignItems: 'center', marginTop: 8,
  },
  purchaseBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  noRenewal: { textAlign: 'center', fontSize: 12, color: COLORS.textMuted, marginTop: 8 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: COLORS.textMuted },
});

export default PlansScreen;
