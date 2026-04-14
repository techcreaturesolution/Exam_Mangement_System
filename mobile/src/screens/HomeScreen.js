import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';
import api from '../services/api';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories?isActive=true');
      setCategories(data.slice(0, 4));
    } catch (e) { /* ignore */ }
    finally { setLoading(false); }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi, {user?.name?.split(' ')[0]}!</Text>
            <Text style={styles.streak}>Streak: 0 days</Text>
          </View>
          <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('ProfileTab')}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </TouchableOpacity>
        </View>

        {/* Free Demo Banner */}
        <TouchableOpacity style={styles.demoBanner}>
          <Text style={styles.demoTitle}>Try free demo MCQs</Text>
          <Text style={styles.demoSub}>10 questions · no signup needed</Text>
          <View style={styles.demoBtn}>
            <Text style={styles.demoBtnText}>Start free →</Text>
          </View>
        </TouchableOpacity>

        {/* Featured Topics */}
        <Text style={styles.sectionLabel}>Featured topics</Text>
        {loading ? (
          <ActivityIndicator color={COLORS.navy} style={{ marginTop: 20 }} />
        ) : (
          categories.map((cat) => (
            <TouchableOpacity
              key={cat._id}
              style={styles.topicCard}
              onPress={() => navigation.navigate('PracticeTab', {
                screen: 'SetList',
                params: { categoryId: cat._id, categoryName: cat.name },
              })}
            >
              <View style={styles.topicHeader}>
                <Text style={styles.topicName}>{cat.name}</Text>
                <View style={styles.badgeNew}>
                  <Text style={styles.badgeNewText}>New</Text>
                </View>
              </View>
              <Text style={styles.topicMeta}>
                {cat.description || 'Practice questions available'}
              </Text>
            </TouchableOpacity>
          ))
        )}

        {categories.length === 0 && !loading && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No topics available yet</Text>
          </View>
        )}

        {/* Upgrade Banner */}
        <TouchableOpacity
          style={styles.upgradeBanner}
          onPress={() => navigation.navigate('Plans')}
        >
          <Text style={styles.upgradeTitle}>Unlock all topics</Text>
          <View style={styles.upgradeBtn}>
            <Text style={styles.upgradeBtnText}>Upgrade</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16,
  },
  greeting: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  streak: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  avatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.navy,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  demoBanner: {
    backgroundColor: COLORS.orange, borderRadius: 12, padding: 16,
    marginHorizontal: 16, marginBottom: 16,
  },
  demoTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  demoSub: { fontSize: 13, color: COLORS.orangePale, marginTop: 2, marginBottom: 10 },
  demoBtn: {
    backgroundColor: '#fff', borderRadius: 6, paddingHorizontal: 14, paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  demoBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.orange },
  sectionLabel: { fontSize: 13, color: COLORS.textMuted, marginHorizontal: 16, marginBottom: 8 },
  topicCard: {
    backgroundColor: COLORS.white, borderWidth: 0.5, borderColor: COLORS.border,
    borderRadius: 12, padding: 14, marginHorizontal: 16, marginBottom: 8,
  },
  topicHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topicName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  badgeNew: { backgroundColor: COLORS.blueBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeNewText: { fontSize: 11, fontWeight: '700', color: COLORS.blueText },
  topicMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  emptyCard: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 30,
    marginHorizontal: 16, alignItems: 'center',
  },
  emptyText: { fontSize: 14, color: COLORS.textMuted },
  upgradeBanner: {
    backgroundColor: COLORS.navyBg, borderRadius: 12, padding: 14,
    marginHorizontal: 16, marginTop: 8,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  upgradeTitle: { fontSize: 14, fontWeight: '700', color: COLORS.navy },
  upgradeBtn: { backgroundColor: COLORS.navy, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 5 },
  upgradeBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
});

export default HomeScreen;
