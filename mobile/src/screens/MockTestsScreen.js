import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { COLORS } from '../constants/theme';
import api from '../services/api';

const MockTestsScreen = ({ navigation }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMockExams(); }, []);

  const fetchMockExams = async () => {
    try {
      const { data } = await api.get('/exams', { params: { examType: 'mock', isActive: 'true' } });
      setExams(data);
    } catch (e) { Alert.alert('Error', 'Failed to load mock tests'); }
    finally { setLoading(false); }
  };

  const handleStart = (exam) => {
    navigation.navigate('Payment', { examId: exam._id, examTitle: exam.title });
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.navy} /></View>;
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Mock tests</Text>
        </View>

        {exams.map((exam, i) => {
          const isDone = false;
          const isLocked = i >= exams.length - 1 && exams.length > 3;

          return (
            <TouchableOpacity
              key={exam._id}
              style={[
                styles.testCard,
                i === 1 && { borderColor: COLORS.orange },
                isLocked && { opacity: 0.6 },
              ]}
              onPress={() => !isLocked && handleStart(exam)}
              disabled={isLocked}
            >
              <View style={styles.testHeader}>
                <Text style={styles.testName}>{exam.title}</Text>
                <View style={[
                  styles.badge,
                  isDone ? { backgroundColor: COLORS.greenBg } :
                  i === 1 ? { backgroundColor: COLORS.orangeLight } :
                  isLocked ? { backgroundColor: COLORS.redBg } :
                  { backgroundColor: COLORS.blueBg },
                ]}>
                  <Text style={[
                    styles.badgeText,
                    isDone ? { color: COLORS.green } :
                    i === 1 ? { color: COLORS.orangeText } :
                    isLocked ? { color: COLORS.red } :
                    { color: COLORS.blueText },
                  ]}>
                    {isDone ? 'Done' : i === 1 ? 'Resume' : isLocked ? 'Locked' : 'New'}
                  </Text>
                </View>
              </View>
              <Text style={styles.testMeta}>
                {exam.totalQuestions} Qs · {exam.duration} min
                {exam.passingPercentage ? ` · Pass: ${exam.passingPercentage}%` : ''}
              </Text>
              {i === 1 && (
                <TouchableOpacity style={styles.resumeBtn} onPress={() => handleStart(exam)}>
                  <Text style={styles.resumeBtnText}>Resume →</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}

        {exams.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No mock tests available</Text>
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
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  testCard: {
    backgroundColor: COLORS.white, borderWidth: 0.5, borderColor: COLORS.border,
    borderRadius: 12, padding: 14, marginHorizontal: 16, marginBottom: 10,
  },
  testHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  testName: { fontSize: 15, fontWeight: '600', color: COLORS.text, flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  testMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  resumeBtn: {
    backgroundColor: COLORS.orange, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 4,
    alignSelf: 'flex-start', marginTop: 8,
  },
  resumeBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: COLORS.textMuted },
});

export default MockTestsScreen;
