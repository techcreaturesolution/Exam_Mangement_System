import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const ResultScreen = ({ route, navigation }) => {
  const { result, examTitle } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, result.isPassed ? styles.headerPassed : styles.headerFailed]}>
        <Text style={styles.resultIcon}>{result.isPassed ? '🎉' : '📚'}</Text>
        <Text style={styles.resultStatus}>
          {result.isPassed ? 'Congratulations!' : 'Keep Practicing!'}
        </Text>
        <Text style={styles.resultSubtitle}>
          {result.isPassed ? 'You passed the exam!' : 'You did not pass this time'}
        </Text>
      </View>

      <View style={styles.scoreCard}>
        <Text style={styles.examTitleText}>{examTitle}</Text>
        <View style={styles.scoreCircle}>
          <Text style={styles.scorePercent}>{result.percentage}%</Text>
          <Text style={styles.scoreLabel}>Score</Text>
        </View>
        <Text style={styles.marksText}>
          {result.obtainedMarks} / {result.totalMarks} marks
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statItem, styles.statCorrect]}>
          <Text style={styles.statNumber}>{result.correctAnswers}</Text>
          <Text style={styles.statLabel}>Correct</Text>
        </View>
        <View style={[styles.statItem, styles.statWrong]}>
          <Text style={styles.statNumber}>{result.wrongAnswers}</Text>
          <Text style={styles.statLabel}>Wrong</Text>
        </View>
        <View style={[styles.statItem, styles.statSkipped]}>
          <Text style={styles.statNumber}>{result.unanswered}</Text>
          <Text style={styles.statLabel}>Skipped</Text>
        </View>
      </View>

      <View style={styles.timeCard}>
        <Text style={styles.timeLabel}>Time Spent</Text>
        <Text style={styles.timeValue}>
          {Math.floor(result.timeSpent / 60)} min {result.timeSpent % 60} sec
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { padding: 32, paddingTop: 60, alignItems: 'center' },
  headerPassed: { backgroundColor: '#10b981' },
  headerFailed: { backgroundColor: '#ef4444' },
  resultIcon: { fontSize: 48, marginBottom: 12 },
  resultStatus: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  resultSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  scoreCard: {
    backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 24,
    alignItems: 'center', elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  examTitleText: { fontSize: 16, fontWeight: '600', color: '#6b7280', marginBottom: 16 },
  scoreCircle: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: '#eef2ff',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    borderWidth: 4, borderColor: '#4f46e5',
  },
  scorePercent: { fontSize: 32, fontWeight: 'bold', color: '#4f46e5' },
  scoreLabel: { fontSize: 13, color: '#6b7280' },
  marksText: { fontSize: 16, color: '#374151', fontWeight: '500' },
  statsGrid: { flexDirection: 'row', padding: 16, gap: 12 },
  statItem: { flex: 1, borderRadius: 12, padding: 16, alignItems: 'center' },
  statCorrect: { backgroundColor: '#d1fae5' },
  statWrong: { backgroundColor: '#fee2e2' },
  statSkipped: { backgroundColor: '#e0e7ff' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  statLabel: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  timeCard: {
    backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12,
    padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  timeLabel: { fontSize: 15, color: '#6b7280' },
  timeValue: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  actions: { padding: 16, paddingBottom: 32 },
  homeBtn: { backgroundColor: '#4f46e5', padding: 16, borderRadius: 12, alignItems: 'center' },
  homeBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default ResultScreen;
