import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert,
} from 'react-native';
import api from '../services/api';

const ExamCategoriesScreen = ({ route, navigation }) => {
  const { examType } = route.params;
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get(`/categories?examType=${examType}&isActive=true`);
      setCategories(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load categories');
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
        <Text style={styles.title}>
          {examType === 'practice' ? 'Practice Exam' : 'Mock Exam'}
        </Text>
        <Text style={styles.subtitle}>Select a category to begin</Text>
      </View>

      <View style={styles.list}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat._id}
            style={styles.categoryCard}
            onPress={() => navigation.navigate('ExamList', {
              examType,
              categoryId: cat._id,
              categoryName: cat.name,
            })}
          >
            <View style={[styles.iconContainer, {
              backgroundColor: examType === 'practice' ? '#d1fae5' : '#fef3c7'
            }]}>
              <Text style={styles.iconText}>{cat.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.categoryName}>{cat.name}</Text>
              {cat.description && (
                <Text style={styles.categoryDesc}>{cat.description}</Text>
              )}
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}

        {categories.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No categories available</Text>
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
  categoryCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, padding: 16, gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  iconContainer: {
    width: 48, height: 48, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  iconText: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  cardContent: { flex: 1 },
  categoryName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  categoryDesc: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  arrow: { fontSize: 18, color: '#9ca3af' },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#9ca3af' },
});

export default ExamCategoriesScreen;
