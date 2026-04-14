import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name}!</Text>
          <Text style={styles.subtitle}>Choose your exam mode</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardsContainer}>
        <TouchableOpacity
          style={[styles.card, styles.practiceCard]}
          onPress={() => navigation.navigate('ExamCategories', { examType: 'practice' })}
        >
          <View style={styles.cardIcon}>
            <Text style={styles.iconText}>P</Text>
          </View>
          <Text style={styles.cardTitle}>Practice Exam</Text>
          <Text style={styles.cardDescription}>
            Practice at your own pace. Review answers and explanations after each question.
          </Text>
          <View style={styles.cardFeatures}>
            <Text style={styles.feature}>• Category-wise questions</Text>
            <Text style={styles.feature}>• Flexible timing</Text>
            <Text style={styles.feature}>• Instant feedback</Text>
            <Text style={styles.feature}>• Learn from explanations</Text>
          </View>
          <View style={styles.startBtn}>
            <Text style={styles.startBtnText}>Start Practice →</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.mockCard]}
          onPress={() => navigation.navigate('ExamCategories', { examType: 'mock' })}
        >
          <View style={[styles.cardIcon, styles.mockIcon]}>
            <Text style={styles.iconText}>M</Text>
          </View>
          <Text style={styles.cardTitle}>Mock Exam</Text>
          <Text style={styles.cardDescription}>
            Simulate real exam conditions with timed tests and full scoring.
          </Text>
          <View style={styles.cardFeatures}>
            <Text style={styles.feature}>• Timed exam simulation</Text>
            <Text style={styles.feature}>• Real exam environment</Text>
            <Text style={styles.feature}>• Full score report</Text>
            <Text style={styles.feature}>• Track your progress</Text>
          </View>
          <View style={[styles.startBtn, styles.mockStartBtn]}>
            <Text style={styles.startBtnText}>Start Mock Test →</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.historyCard}
        onPress={() => navigation.navigate('History')}
      >
        <Text style={styles.historyTitle}>Exam History</Text>
        <Text style={styles.historySubtitle}>View your past exam results and progress</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, paddingTop: 60, backgroundColor: '#4f46e5',
  },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  logoutText: { color: '#fff', fontWeight: '600' },
  cardsContainer: { padding: 16, gap: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  practiceCard: { borderLeftWidth: 4, borderLeftColor: '#10b981' },
  mockCard: { borderLeftWidth: 4, borderLeftColor: '#f59e0b' },
  cardIcon: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: '#d1fae5',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  mockIcon: { backgroundColor: '#fef3c7' },
  iconText: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 },
  cardDescription: { fontSize: 14, color: '#6b7280', lineHeight: 20, marginBottom: 12 },
  cardFeatures: { marginBottom: 16 },
  feature: { fontSize: 13, color: '#4b5563', marginBottom: 4 },
  startBtn: { backgroundColor: '#10b981', padding: 12, borderRadius: 8, alignItems: 'center' },
  mockStartBtn: { backgroundColor: '#f59e0b' },
  startBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  historyCard: {
    margin: 16, marginTop: 0, backgroundColor: '#fff', borderRadius: 12, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  historyTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  historySubtitle: { fontSize: 13, color: '#6b7280', marginTop: 4 },
});

export default HomeScreen;
