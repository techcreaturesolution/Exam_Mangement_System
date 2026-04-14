import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert,
} from 'react-native';
import api from '../services/api';

const ExamListScreen = ({ route, navigation }) => {
  const { examType, categoryId, categoryName } = route.params;
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const { data } = await api.get('/exams', {
        params: { examType, category: categoryId, isActive: 'true' },
      });
      setExams(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = (exam) => {
    Alert.alert(
      exam.title,
      `Duration: ${exam.duration} minutes\nQuestions: ${exam.totalQuestions}\nPassing: ${exam.passingPercentage}%\n\nAre you ready to start?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Exam',
          onPress: () => navigation.navigate('ExamScreen', { examId: exam._id }),
        },
      ]
    );
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
        <Text style={styles.title}>{categoryName}</Text>
        <Text style={styles.subtitle}>
          {examType === 'practice' ? 'Practice' : 'Mock'} Exams
        </Text>
      </View>

      <View style={styles.list}>
        {exams.map((exam) => (
          <TouchableOpacity
            key={exam._id}
            style={styles.examCard}
            onPress={() => handleStartExam(exam)}
          >
            <View style={styles.examHeader}>
              <Text style={styles.examTitle}>{exam.title}</Text>
              <View style={[styles.badge, {
                backgroundColor: exam.level?.color || '#4f46e5'
              }]}>
                <Text style={styles.badgeText}>{exam.level?.name || 'N/A'}</Text>
              </View>
            </View>
            {exam.description && (
              <Text style={styles.examDesc}>{exam.description}</Text>
            )}
            <View style={styles.examInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Duration</Text>
                <Text style={styles.infoValue}>{exam.duration} min</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Questions</Text>
                <Text style={styles.infoValue}>{exam.totalQuestions}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Passing</Text>
                <Text style={styles.infoValue}>{exam.passingPercentage}%</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Marks</Text>
                <Text style={styles.infoValue}>{exam.totalMarks}</Text>
              </View>
            </View>
            <View style={styles.startButton}>
              <Text style={styles.startButtonText}>Start Exam</Text>
            </View>
          </TouchableOpacity>
        ))}

        {exams.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No exams available in this category</Text>
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
  list: { padding: 16, gap: 16 },
  examCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  examHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  examTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  examDesc: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  examInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, backgroundColor: '#f9fafb', borderRadius: 8, padding: 12 },
  infoItem: { alignItems: 'center' },
  infoLabel: { fontSize: 11, color: '#9ca3af', marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  startButton: { backgroundColor: '#4f46e5', padding: 14, borderRadius: 8, alignItems: 'center' },
  startButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#9ca3af' },
});

export default ExamListScreen;
