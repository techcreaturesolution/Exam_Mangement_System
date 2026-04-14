import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import api from '../services/api';

const HistoryScreen = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/exams/history');
      setHistory(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load history');
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.title}>Exam History</Text>
        <Text style={styles.subtitle}>{history.length} attempts</Text>
      </View>

      <View style={styles.list}>
        {history.map((attempt) => (
          <View key={attempt._id} style={styles.historyCard}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.examTitle}>{attempt.exam?.title || 'Exam'}</Text>
                <Text style={styles.examMeta}>
                  {attempt.exam?.category?.name} • {attempt.exam?.subject?.name}
                </Text>
              </View>
              <View style={[
                styles.statusBadge,
                attempt.isPassed ? styles.badgePassed : styles.badgeFailed,
              ]}>
                <Text style={styles.badgeText}>
                  {attempt.isPassed ? 'Passed' : 'Failed'}
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{attempt.percentage}%</Text>
                <Text style={styles.statLabel}>Score</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{attempt.correctAnswers}</Text>
                <Text style={styles.statLabel}>Correct</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{attempt.wrongAnswers}</Text>
                <Text style={styles.statLabel}>Wrong</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {Math.floor(attempt.timeSpent / 60)}m
                </Text>
                <Text style={styles.statLabel}>Time</Text>
              </View>
            </View>

            <Text style={styles.dateText}>
              {new Date(attempt.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </Text>
          </View>
        ))}

        {history.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No exam history yet</Text>
            <Text style={styles.emptyText}>Start taking exams to see your results here</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  list: { padding: 16, gap: 12 },
  historyCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  examTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  examMeta: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgePassed: { backgroundColor: '#d1fae5' },
  badgeFailed: { backgroundColor: '#fee2e2' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f9fafb', borderRadius: 8, padding: 12, marginBottom: 8 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  statLabel: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  dateText: { fontSize: 12, color: '#9ca3af' },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
});

export default HistoryScreen;
