import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../constants/theme';

const ResultScreen = ({ route, navigation }) => {
  const { result, examTitle } = route.params;

  return (
    <ScrollView style={styles.container}>
      {/* Score Circle */}
      <View style={styles.scoreCircle}>
        <Text style={styles.scorePercent}>{result.percentage}%</Text>
      </View>

      <View style={styles.examInfo}>
        <Text style={styles.examTitle}>{examTitle}</Text>
        <Text style={styles.examSummary}>
          {result.correctAnswers} correct · {result.wrongAnswers} wrong · {Math.floor((result.timeSpent || 0) / 60)}m {(result.timeSpent || 0) % 60}s
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: COLORS.green }]}>{result.correctAnswers}</Text>
          <Text style={styles.statLabel}>Correct</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: COLORS.red }]}>{result.wrongAnswers}</Text>
          <Text style={styles.statLabel}>Wrong</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{Math.floor((result.timeSpent || 0) / 60)}m {(result.timeSpent || 0) % 60}s</Text>
          <Text style={styles.statLabel}>Time</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: COLORS.orange }]}>{result.unanswered || 0}</Text>
          <Text style={styles.statLabel}>Skipped</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.btnPrimaryText}>Back to home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.btnOutlineText}>Back to sets</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scoreCircle: {
    width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: COLORS.navy,
    justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginTop: 60,
  },
  scorePercent: { fontSize: 28, fontWeight: '700', color: COLORS.navy },
  examInfo: { alignItems: 'center', marginTop: 16, marginBottom: 20 },
  examTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  examSummary: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingHorizontal: 16, marginBottom: 20,
  },
  statItem: {
    flex: 1, minWidth: '40%', backgroundColor: '#f0f4fb', borderRadius: 10,
    padding: 12, alignItems: 'center',
  },
  statNumber: { fontSize: 22, fontWeight: '700', color: COLORS.navy },
  statLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  actions: { paddingHorizontal: 16, gap: 8, paddingBottom: 32 },
  btn: { height: 46, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  btnPrimary: { backgroundColor: COLORS.navy },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnOutline: { borderWidth: 1.5, borderColor: COLORS.navy },
  btnOutlineText: { color: COLORS.navy, fontSize: 14, fontWeight: '600' },
});

export default ResultScreen;
