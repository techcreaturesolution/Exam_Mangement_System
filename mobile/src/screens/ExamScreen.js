import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, BackHandler,
} from 'react-native';
import { COLORS } from '../constants/theme';
import api from '../services/api';

const ExamScreen = ({ route, navigation }) => {
  const { examId } = route.params;
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    startExam();
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBackPress();
      return true;
    });
    return () => {
      backHandler.remove();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0 && exam && timerRef.current) {
      clearInterval(timerRef.current);
      Alert.alert('Time Up!', 'Your exam time has ended. Submitting answers.', [
        { text: 'OK', onPress: handleSubmit },
      ]);
    }
  }, [timeLeft]);

  const startExam = async () => {
    try {
      const { data } = await api.post(`/exams/${examId}/start`);
      setExam(data.exam);
      setQuestions(data.questions);
      setAttemptId(data.attempt._id);
      setTimeLeft(data.exam.duration * 60);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to start exam');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    Alert.alert('Leave Exam?', 'Your progress will be lost.', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  const selectAnswer = (questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const toggleFlag = (questionId) => {
    setFlagged((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    const unanswered = questions.length - Object.keys(answers).length;
    if (unanswered > 0 && timeLeft > 0) {
      Alert.alert('Submit?', `${unanswered} unanswered question(s). Submit anyway?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: doSubmit },
      ]);
    } else {
      doSubmit();
    }
  };

  const doSubmit = async () => {
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const formattedAnswers = questions.map((q) => ({
        question: q._id,
        selectedOption: answers[q._id] !== undefined ? answers[q._id] : -1,
      }));
      const { data } = await api.post(`/exams/${examId}/submit`, { attemptId, answers: formattedAnswers });
      navigation.replace('Result', { result: data, examTitle: exam.title });
    } catch (error) {
      Alert.alert('Error', 'Failed to submit exam');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.navy} />
        <Text style={styles.loadingText}>Loading exam...</Text>
      </View>
    );
  }

  const q = questions[currentIndex];

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>{exam?.title}</Text>
        <Text style={[styles.timer, timeLeft < 60 && { color: COLORS.red }]}>{formatTime(timeLeft)}</Text>
      </View>

      {/* Question Counter */}
      <View style={styles.counterRow}>
        <Text style={styles.counterText}>Q {currentIndex + 1} / {questions.length}</Text>
      </View>

      {/* Topic Badge */}
      <View style={styles.topicBadge}>
        <Text style={styles.topicBadgeText}>{exam?.subject?.name || exam?.category?.name || exam?.examType}</Text>
      </View>

      {/* Question */}
      <ScrollView style={styles.questionScroll}>
        <Text style={styles.questionText}>{q.questionText}</Text>

        {q.options.map((option, index) => {
          const selected = answers[q._id] === index;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.optionCard, selected && styles.optionSelected]}
              onPress={() => selectAnswer(q._id, index)}
            >
              <View style={[styles.optionDot, selected && styles.optionDotFilled]} />
              <Text style={[styles.optionText, selected && { color: COLORS.text, fontWeight: '500' }]}>
                {option.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.flagBtn, flagged[q._id] && { borderColor: COLORS.orange, backgroundColor: COLORS.orangeLight }]}
          onPress={() => toggleFlag(q._id)}
        >
          <Text style={[styles.flagBtnText, flagged[q._id] && { color: COLORS.orange }]}>
            {flagged[q._id] ? 'Flagged' : 'Flag'}
          </Text>
        </TouchableOpacity>

        {currentIndex === questions.length - 1 ? (
          <TouchableOpacity style={[styles.nextBtn, { backgroundColor: COLORS.orange }]} onPress={handleSubmit} disabled={submitting}>
            <Text style={styles.nextBtnText}>{submitting ? 'Submitting...' : 'Submit'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
          >
            <Text style={styles.nextBtnText}>Next →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${((currentIndex + 1) / questions.length) * 100}%` }]} />
      </View>
      <Text style={styles.progressLabel}>{Object.keys(answers).length} answered</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 15, color: COLORS.textMuted },
  topBar: {
    backgroundColor: COLORS.navy, borderRadius: 10, padding: 12,
    marginHorizontal: 12, marginTop: 50, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  topBarTitle: { fontSize: 13, color: COLORS.navyBorder, flex: 1 },
  timer: { fontSize: 16, fontWeight: '700', color: COLORS.orange },
  counterRow: { paddingHorizontal: 16, paddingTop: 12 },
  counterText: { fontSize: 14, color: COLORS.textMuted },
  topicBadge: {
    backgroundColor: COLORS.navyBg, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4,
    alignSelf: 'flex-start', marginLeft: 16, marginTop: 6, marginBottom: 10,
  },
  topicBadgeText: { fontSize: 12, color: COLORS.navy, fontWeight: '600' },
  questionScroll: { flex: 1, paddingHorizontal: 16 },
  questionText: { fontSize: 16, fontWeight: '600', color: COLORS.text, lineHeight: 24, marginBottom: 16 },
  optionCard: {
    borderWidth: 0.5, borderColor: COLORS.inputBorder, borderRadius: 10,
    padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center',
    gap: 12, backgroundColor: COLORS.white,
  },
  optionSelected: { borderColor: COLORS.navy, backgroundColor: COLORS.navyBg },
  optionDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: '#ccc' },
  optionDotFilled: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  optionText: { flex: 1, fontSize: 15, color: COLORS.text, lineHeight: 22 },
  actionRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  flagBtn: {
    borderWidth: 0.5, borderColor: COLORS.navy, borderRadius: 8, flex: 1,
    height: 40, justifyContent: 'center', alignItems: 'center',
  },
  flagBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.navy },
  nextBtn: {
    backgroundColor: COLORS.navy, borderRadius: 8, flex: 2,
    height: 40, justifyContent: 'center', alignItems: 'center',
  },
  nextBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  progressBar: { height: 4, backgroundColor: '#e8e8e8', marginHorizontal: 16, borderRadius: 2 },
  progressFill: { height: 4, borderRadius: 2, backgroundColor: COLORS.navy },
  progressLabel: { fontSize: 11, color: COLORS.textLight, textAlign: 'right', paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
});

export default ExamScreen;
