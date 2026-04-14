import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { COLORS } from '../constants/theme';
import api from '../services/api';

const TopicBrowserScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories?isActive=true');
      setCategories(data);
    } catch (e) { Alert.alert('Error', 'Failed to load topics'); }
    finally { setLoading(false); }
  };

  const getProgressColor = (progress) => {
    if (progress >= 60) return COLORS.green;
    if (progress >= 30) return COLORS.blueText;
    if (progress > 0) return COLORS.orangeText;
    return COLORS.textMuted;
  };

  const getProgressBg = (progress) => {
    if (progress >= 60) return COLORS.greenBg;
    if (progress >= 30) return COLORS.blueBg;
    if (progress > 0) return COLORS.orangeLight;
    return '#f0f0f0';
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.navy} /></View>;
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>All topics</Text>
          <TouchableOpacity>
            <Text style={styles.searchLink}>Search</Text>
          </TouchableOpacity>
        </View>

        {categories.map((cat, index) => {
          const progress = Math.floor(Math.random() * 80); // Simulated progress
          return (
            <TouchableOpacity
              key={cat._id}
              style={[styles.topicCard, index >= categories.length - 1 && { opacity: 0.55 }]}
              onPress={() => navigation.navigate('SetList', { categoryId: cat._id, categoryName: cat.name })}
            >
              <View style={styles.topicHeader}>
                <Text style={styles.topicName}>{cat.name}</Text>
                <View style={[styles.badge, { backgroundColor: getProgressBg(progress) }]}>
                  <Text style={[styles.badgeText, { color: getProgressColor(progress) }]}>
                    {progress > 0 ? `${progress}%` : 'New'}
                  </Text>
                </View>
              </View>
              <Text style={styles.topicMeta}>{cat.description || 'Practice MCQs'}</Text>
              {progress > 0 && (
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {categories.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No topics available</Text>
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
  searchLink: { fontSize: 14, color: COLORS.navy, fontWeight: '600' },
  topicCard: {
    backgroundColor: COLORS.white, borderWidth: 0.5, borderColor: COLORS.border,
    borderRadius: 12, padding: 14, marginHorizontal: 16, marginBottom: 8,
  },
  topicHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topicName: { fontSize: 15, fontWeight: '600', color: COLORS.text, flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  topicMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  progressBar: { height: 4, backgroundColor: '#e8e8e8', borderRadius: 2, marginTop: 8 },
  progressFill: { height: 4, borderRadius: 2, backgroundColor: COLORS.navy },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 15, color: COLORS.textMuted },
});

export default TopicBrowserScreen;
