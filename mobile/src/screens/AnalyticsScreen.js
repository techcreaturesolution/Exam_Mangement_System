import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/theme';
import api from '../services/api';

const AnalyticsScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/exams/history');
      setHistory(data);
    } catch (e) { /* ignore */ }
    finally { setLoading(false); }
  };

  const totalAttempts = history.length;
  const totalCorrect = history.reduce((sum, h) => sum + (h.correctAnswers || 0), 0);
  const totalQuestions = history.reduce((sum, h) => sum + (h.totalQuestions || 0), 0);
  const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const mcqsDone = totalQuestions;

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.navy} /></View>;
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>My progress</Text>
          <Text style={styles.headerSub}>This month</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{avgAccuracy}%</Text>
            <Text style={styles.statLabel}>Avg accuracy</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{mcqsDone}</Text>
            <Text style={styles.statLabel}>MCQs done</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.orange }]}>0</Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalAttempts}</Text>
            <Text style={styles.statLabel}>Tests done</Text>
          </View>
        </View>

        {/* Accuracy by topic - from exam history */}
        <Text style={styles.sectionLabel}>Recent attempts</Text>
        {history.slice(0, 10).map((attempt, i) => (
          <View key={i} style={styles.topicRow}>
            <Text style={styles.topicName}>{attempt.examTitle || 'Exam'}</Text>
            <View style={styles.topicBarContainer}>
              <View style={styles.topicBarBg}>
                <View style={[
                  styles.topicBarFill,
                  { width: `${attempt.percentage || 0}%` },
                  (attempt.percentage || 0) < 50 && { backgroundColor: COLORS.orange },
                ]} />
              </View>
              <Text style={[
                styles.topicPercent,
                (attempt.percentage || 0) < 50 && { color: COLORS.orange },
              ]}>
                {attempt.percentage || 0}%
              </Text>
            </View>
          </View>
        ))}

        {history.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No exam history yet. Start practicing!</Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12,
  },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  headerSub: { fontSize: 13, color: COLORS.textMuted },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingHorizontal: 16, marginBottom: 16,
  },
  statCard: {
    flex: 1, minWidth: '40%', backgroundColor: '#f0f4fb', borderRadius: 10,
    padding: 12, alignItems: 'center',
  },
  statNumber: { fontSize: 22, fontWeight: '700', color: COLORS.navy },
  statLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  sectionLabel: { fontSize: 13, color: COLORS.textMuted, paddingHorizontal: 16, marginBottom: 8 },
  topicRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 0.5,
    borderBottomColor: COLORS.borderLight,
  },
  topicName: { fontSize: 14, color: COLORS.text, flex: 1 },
  topicBarContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  topicBarBg: { width: 60, height: 4, backgroundColor: '#e8e8e8', borderRadius: 2 },
  topicBarFill: { height: 4, borderRadius: 2, backgroundColor: COLORS.navy },
  topicPercent: { fontSize: 12, fontWeight: '700', color: COLORS.navy, width: 35, textAlign: 'right' },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: COLORS.textMuted },
});

export default AnalyticsScreen;
