import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, Linking,
} from 'react-native';
import api from '../services/api';

const PaymentScreen = ({ route, navigation }) => {
  const { examId, examTitle } = route.params;
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    checkAccessAndLoadPlans();
  }, []);

  const checkAccessAndLoadPlans = async () => {
    try {
      const { data } = await api.get(`/payments/check-access/${examId}`);
      if (data.hasAccess) {
        // User already has access, go directly to exam
        navigation.replace('ExamScreen', { examId });
        return;
      }
      setPlans(data.availablePlans || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to check access');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (plan) => {
    setProcessing(true);
    try {
      // Step 1: Create Razorpay order
      const { data: orderData } = await api.post('/payments/create-order', {
        planId: plan._id,
      });

      // Step 2: Open Razorpay checkout
      // Note: react-native-razorpay requires native module linking.
      // For Expo managed workflow, we use WebView-based checkout as fallback.
      try {
        const RazorpayCheckout = require('react-native-razorpay').default;

        const options = {
          description: plan.name,
          image: '',
          currency: orderData.currency,
          key: orderData.key,
          amount: orderData.amount,
          name: 'Exam Portal',
          order_id: orderData.orderId,
          prefill: {
            email: '',
            contact: '',
          },
          theme: { color: '#4f46e5' },
        };

        const paymentData = await RazorpayCheckout.open(options);

        // Step 3: Verify payment
        const { data: verifyData } = await api.post('/payments/verify', {
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature,
        });

        Alert.alert(
          'Payment Successful!',
          `Your ${plan.name} plan is now active.\nValid until: ${new Date(verifyData.payment.expiresAt).toLocaleDateString()}`,
          [
            {
              text: 'Start Exam',
              onPress: () => navigation.replace('ExamScreen', { examId }),
            },
          ]
        );
      } catch (razorpayError) {
        // Razorpay native module not available (Expo managed) - show instructions
        if (razorpayError.code === 'MODULE_NOT_FOUND' || !razorpayError.razorpay_payment_id) {
          Alert.alert(
            'Payment Gateway',
            'Razorpay native checkout requires a development build. In Expo Go, the payment order has been created. For production, use `expo prebuild` to enable native Razorpay.',
            [{ text: 'OK' }]
          );
        } else {
          // User cancelled or payment failed
          Alert.alert('Payment Cancelled', 'Your payment was not completed.');
        }
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR',
    }).format(price);
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
      <View style={styles.header}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.title}>Premium Access Required</Text>
        <Text style={styles.subtitle}>
          Choose a plan to access "{examTitle}"
        </Text>
      </View>

      <View style={styles.plansContainer}>
        {plans.map((plan, index) => (
          <TouchableOpacity
            key={plan._id}
            style={[
              styles.planCard,
              index === 0 && styles.recommendedPlan,
            ]}
            onPress={() => handlePayment(plan)}
            disabled={processing}
          >
            {index === 0 && (
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>RECOMMENDED</Text>
              </View>
            )}

            <Text style={styles.planName}>{plan.name}</Text>
            {plan.description && (
              <Text style={styles.planDesc}>{plan.description}</Text>
            )}

            <View style={styles.priceContainer}>
              <Text style={styles.price}>{formatPrice(plan.price)}</Text>
              <Text style={styles.duration}>/ {plan.duration} days</Text>
            </View>

            <View style={styles.planTypeTag}>
              <Text style={styles.planTypeText}>
                {plan.planType === 'all_access' ? 'All Exams Access' :
                 plan.planType === 'category' ? 'Category Access' :
                 plan.planType === 'subject' ? 'Subject Access' : 'Single Exam'}
              </Text>
            </View>

            {plan.features && plan.features.length > 0 && (
              <View style={styles.features}>
                {plan.features.map((feature, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Text style={styles.checkmark}>✓</Text>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={[styles.payButton, index === 0 && styles.payButtonPrimary]}>
              <Text style={[styles.payButtonText, index === 0 && styles.payButtonTextPrimary]}>
                {processing ? 'Processing...' : `Pay ${formatPrice(plan.price)}`}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {plans.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Plans Available</Text>
            <Text style={styles.emptyText}>
              No payment plans are configured for this exam yet.
              Contact the administrator.
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.skipText}>Go Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', padding: 24, paddingTop: 20 },
  lockIcon: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 8, textAlign: 'center' },
  plansContainer: { padding: 16, gap: 16 },
  planCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 24,
    borderWidth: 2, borderColor: '#e5e7eb',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  recommendedPlan: { borderColor: '#4f46e5', borderWidth: 2 },
  recommendedBadge: {
    position: 'absolute', top: -12, right: 16,
    backgroundColor: '#4f46e5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
  },
  recommendedText: { color: '#fff', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  planName: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  planDesc: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  price: { fontSize: 32, fontWeight: 'bold', color: '#4f46e5' },
  duration: { fontSize: 14, color: '#6b7280', marginLeft: 4 },
  planTypeTag: {
    backgroundColor: '#eef2ff', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12,
  },
  planTypeText: { fontSize: 12, color: '#4f46e5', fontWeight: '600' },
  features: { marginBottom: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  checkmark: { color: '#10b981', fontSize: 16, fontWeight: 'bold', marginRight: 8 },
  featureText: { fontSize: 14, color: '#374151' },
  payButton: {
    backgroundColor: '#f3f4f6', padding: 14, borderRadius: 10, alignItems: 'center',
    borderWidth: 1, borderColor: '#d1d5db',
  },
  payButtonPrimary: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  payButtonText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  payButtonTextPrimary: { color: '#fff' },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
  skipButton: { padding: 16, alignItems: 'center', marginBottom: 32 },
  skipText: { fontSize: 14, color: '#6b7280' },
});

export default PaymentScreen;
