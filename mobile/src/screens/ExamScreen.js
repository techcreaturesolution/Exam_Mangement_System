import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, BackHandler,
} from 'react-native';
import api from '../services/api';

const ExamScreen = ({ route, navigation }) => {
  const { examId } = route.params;
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
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
      Alert.alert('Time Up!', 'Your exam time has ended. Submitting your answers.', [
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
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to start exam');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    Alert.alert(
      'Leave Exam?',
      'Your progress will be lost if you leave now.',
      [
        { text: 'Stay', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  const selectAnswer = (questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const unanswered = questions.length - Object.keys(answers).length;
    if (unanswered > 0 && timeLeft > 0) {
      Alert.alert(
        'Submit Exam?',
        `You have ${unanswered} unanswered question(s). Are you sure you want to submit?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit', onPress: doSubmit },
        ]
      );
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

      const { data } = await api.post(`/exams/${examId}/submit`, {
        attemptId,
        answers: formattedAnswers,
      });

      navigation.replace('Result', { result: data, examTitle: exam.title });
    } catch (error) {
      Alert.alert('Error', 'Failed to submit exam');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading exam...</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <View style={styles.container}>
      {/* Timer Bar */}
      <View style={styles.timerBar}>
        <Text style={styles.examTitle}>{exam?.title}</Text>
        <View style={[styles.timer, timeLeft < 60 && styles.timerDanger]}>
          <Text style={[styles.timerText, timeLeft < 60 && styles.timerTextDanger]}>
            {formatTime(timeLeft)}
          </Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, {
          width: `${((Object.keys(answers).length) / questions.length) * 100}%`
        }]} />
      </View>

      {/* Question */}
      <ScrollView style={styles.questionContainer}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionNumber}>
            Question {currentIndex + 1} of {questions.length}
          </Text>
          <Text style={styles.marks}>{currentQuestion.marks} mark(s)</Text>
        </View>

        <Text style={styles.questionText}>{currentQuestion.questionText}</Text>

        <View style={styles.options}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionCard,
                answers[currentQuestion._id] === index && styles.optionSelected,
              ]}
              onPress={() => selectAnswer(currentQuestion._id, index)}
            >
              <View style={[
                styles.optionCircle,
                answers[currentQuestion._id] === index && styles.optionCircleSelected,
              ]}>
                <Text style={[
                  styles.optionLetter,
                  answers[currentQuestion._id] === index && styles.optionLetterSelected,
                ]}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text style={[
                styles.optionText,
                answers[currentQuestion._id] === index && styles.optionTextSelected,
              ]}>
                {option.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Question Navigation Dots */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dotsContainer}>
        {questions.map((q, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.dot,
              i === currentIndex && styles.dotActive,
              answers[q._id] !== undefined && styles.dotAnswered,
            ]}
            onPress={() => setCurrentIndex(i)}
          >
            <Text style={[
              styles.dotText,
              (i === currentIndex || answers[q._id] !== undefined) && styles.dotTextActive,
            ]}>
              {i + 1}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navButtons}>
        <TouchableOpacity
          style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
          onPress={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          <Text style={styles.navBtnText}>← Previous</Text>
        </TouchableOpacity>

        {currentIndex === questions.length - 1 ? (
          <TouchableOpacity
            style={[styles.navBtn, styles.submitBtn]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={[styles.navBtnText, styles.submitBtnText]}>
              {submitting ? 'Submitting...' : 'Submit Exam'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navBtn, styles.nextBtn]}
            onPress={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
          >
            <Text style={[styles.navBtnText, styles.nextBtnText]}>Next →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 16, color: '#6b7280' },
  timerBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, paddingTop: 50, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
  },
  examTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', flex: 1 },
  timer: { backgroundColor: '#f3f4f6', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  timerDanger: { backgroundColor: '#fee2e2' },
  timerText: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  timerTextDanger: { color: '#ef4444' },
  progressBar: { height: 4, backgroundColor: '#e5e7eb' },
  progressFill: { height: '100%', backgroundColor: '#10b981' },
  questionContainer: { flex: 1, padding: 20 },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  questionNumber: { fontSize: 14, fontWeight: '600', color: '#4f46e5' },
  marks: { fontSize: 13, color: '#6b7280' },
  questionText: { fontSize: 18, fontWeight: '500', color: '#1f2937', lineHeight: 26, marginBottom: 24 },
  options: { gap: 12 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, padding: 16, gap: 14,
    borderWidth: 2, borderColor: '#e5e7eb',
  },
  optionSelected: { borderColor: '#4f46e5', backgroundColor: '#eef2ff' },
  optionCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center',
  },
  optionCircleSelected: { backgroundColor: '#4f46e5' },
  optionLetter: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  optionLetterSelected: { color: '#fff' },
  optionText: { flex: 1, fontSize: 15, color: '#374151', lineHeight: 22 },
  optionTextSelected: { color: '#1f2937', fontWeight: '500' },
  dotsContainer: { maxHeight: 48, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff' },
  dot: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#e5e7eb',
    justifyContent: 'center', alignItems: 'center', marginHorizontal: 3,
  },
  dotActive: { backgroundColor: '#4f46e5' },
  dotAnswered: { backgroundColor: '#10b981' },
  dotText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  dotTextActive: { color: '#fff' },
  navButtons: {
    flexDirection: 'row', justifyContent: 'space-between', padding: 16,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb',
  },
  navBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, backgroundColor: '#f3f4f6' },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  nextBtn: { backgroundColor: '#4f46e5' },
  nextBtnText: { color: '#fff' },
  submitBtn: { backgroundColor: '#10b981' },
  submitBtnText: { color: '#fff' },
});

export default ExamScreen;
