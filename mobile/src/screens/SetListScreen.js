import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { COLORS } from '../constants/theme';
import api from '../services/api';

const SetListScreen = ({ route, navigation }) => {
  const { categoryId, categoryName } = route.params;
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchExams(); }, []);

  const fetchExams = async () => {
    try {
      const { data } = await api.get('/exams', { params: { category: categoryId, isActive: 'true' } });
      setExams(data);
    } catch (e) { Alert.alert('Error', 'Failed to load exams'); }
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← {categoryName}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>{categoryName}</Text>

        {exams.map((exam, i) => (
          <View key={exam._id} style={[styles.examCard, i === 0 && { borderColor: COLORS.navy }]}>
            <View style={styles.examHeader}>
              <Text style={styles.examName}>{exam.title} · {exam.totalQuestions} Qs</Text>
              <View style={[styles.badge, { backgroundColor: i === 0 ? COLORS.blueBg : COLORS.greenBg }]}>
                <Text style={[styles.badgeText, { color: i === 0 ? COLORS.blueText : COLORS.green }]}>
                  {i === 0 ? 'New' : 'Ready'}
                </Text>
              </View>
            </View>
            <Text style={styles.examMeta}>
              Duration: {exam.duration} min · Level: {exam.level?.name || 'All'} · {exam.examType}
            </Text>
            {exam.maxAttempts > 0 && (
              <Text style={styles.attempts}>Attempts left: {exam.maxAttempts}</Text>
            )}
            <TouchableOpacity style={styles.startBtn} onPress={() => handleStart(exam)}>
              <Text style={styles.startBtnText}>Start {exam.examType === 'practice' ? 'practice' : 'test'} →</Text>
            </TouchableOpacity>
          </View>
        ))}

        {exams.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No exams available in this category</Text>
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
  header: { paddingHorizontal: 16, paddingTop: 16 },
  back: { fontSize: 14, color: COLORS.navy, fontWeight: '600' },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.navy, paddingHorizontal: 16, marginTop: 8, marginBottom: 12 },
  examCard: {
    backgroundColor: COLORS.white, borderWidth: 0.5, borderColor: COLORS.border,
    borderRadius: 12, padding: 14, marginHorizontal: 16, marginBottom: 10,
  },
  examHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  examName: { fontSize: 14, fontWeight: '600', color: COLORS.text, flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  examMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  attempts: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  startBtn: {
    backgroundColor: COLORS.navy, borderRadius: 8, height: 36,
    justifyContent: 'center', alignItems: 'center', marginTop: 10,
  },
  startBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: COLORS.textMuted },
});

export default SetListScreen;
