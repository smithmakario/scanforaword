import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import api from '../../src/services/api';

interface Category {
  id: number;
  name: string;
}

interface DailyWord {
  id: number;
  title: string;
  content: string;
  keyword: string;
  speaker?: string;
  duration?: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [dailyWord, setDailyWord] = useState<DailyWord | null>(null);
  const [trending, setTrending] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load categories
      const categoriesRes = await api.get('/categories');
      setCategories(categoriesRes.data.data || []);

      // Load daily word
      if (isAuthenticated && user?.email) {
        const dailyRes = await api.get('/daily-word', {
          params: { identifier: user.email },
        });
        setDailyWord(dailyRes.data.data);
      } else {
        // Default daily word for non-authenticated users
        setDailyWord({
          id: 0,
          title: 'Daily Inspiration',
          content: 'Start your day with positivity and hope. Every moment is a new beginning.',
          keyword: 'Inspiration',
        });
      }

      // Load trending
      const trendingRes = await api.get('/search/trending');
      const trendingData = trendingRes.data.data || [];
      setTrending(trendingData.map((t: any) => t.keyword || t));
    } catch (error) {
      console.error('Failed to load home data:', error);
      // Fallback defaults
      setTrending(['Faith', 'Hope', 'Love', 'Peace', 'Joy']);
      setDailyWord({
        id: 0,
        title: 'Daily Inspiration',
        content: 'Start your day with positivity and hope. Every moment is a new beginning.',
        keyword: 'Inspiration',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDailyWordPress = () => {
    if (dailyWord) {
      router.push({
        pathname: '/player',
        params: {
          id: dailyWord.id.toString(),
          title: dailyWord.title,
          speaker: dailyWord.speaker || '',
          content: dailyWord.content,
          keyword: dailyWord.keyword,
        }
      });
    }
  };

  const handleCategoryPress = () => {
    router.push('/categories');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user?.name || 'User'}!</Text>
          <Text style={styles.subtitle}>Here's your daily inspiration</Text>
        </View>

        {/* Daily Word Card */}
        <TouchableOpacity 
          style={styles.dailyWordCard}
          onPress={handleDailyWordPress}
        >
          <View style={styles.dailyHeader}>
            <Text style={styles.dailyLabel}>📅 Today's Word</Text>
            <TouchableOpacity onPress={handleCategoryPress}>
              <Text style={styles.settingsLink}>⚙️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.dailyTitle}>{dailyWord?.title || 'Daily Inspiration'}</Text>
          <Text style={styles.dailyDesc} numberOfLines={2}>
            {dailyWord?.content || 'Tap to listen to today\'s inspiring message...'}
          </Text>
          {dailyWord?.keyword && (
            <View style={styles.keywordBadge}>
              <Text style={styles.keywordText}>#{dailyWord.keyword}</Text>
            </View>
          )}
          <View style={styles.playHint}>
            <Text style={styles.playHintText}>▶ Tap to play</Text>
          </View>
        </TouchableOpacity>

        {/* Categories Section */}
        {isAuthenticated && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Categories</Text>
              <TouchableOpacity onPress={handleCategoryPress}>
                <Text style={styles.seeAllText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.categoriesList}>
              {categories.length > 0 ? (
                categories.slice(0, 4).map((cat) => (
                  <View key={cat.id} style={styles.categoryChip}>
                    <Text style={styles.categoryText}>{cat.name}</Text>
                  </View>
                ))
              ) : (
                <TouchableOpacity 
                  style={styles.addCategoryButton}
                  onPress={handleCategoryPress}
                >
                  <Text style={styles.addCategoryText}>+ Add Categories</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Trending Keywords */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Trending Keywords</Text>
          <View style={styles.trendingList}>
            {trending.length > 0 ? (
              trending.slice(0, 5).map((keyword, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.trendingItem}
                  onPress={() => router.push({ pathname: '/search', params: { q: keyword } })}
                >
                  <Text style={styles.trendingText}>#{keyword}</Text>
                </TouchableOpacity>
              ))
            ) : (
              ['Faith', 'Hope', 'Love', 'Peace', 'Joy'].map((keyword, index) => (
                <View key={index} style={styles.trendingItem}>
                  <Text style={styles.trendingText}>#{keyword}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Recent Searches placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          <Text style={styles.emptyText}>No recent searches yet</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  dailyWordCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  dailyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  dailyLabel: {
    color: Colors.accent,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  settingsLink: {
    fontSize: 20,
  },
  dailyTitle: {
    color: '#FFFFFF',
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  dailyDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FontSizes.sm,
    marginBottom: Spacing.sm,
  },
  keywordBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  keywordText: {
    color: Colors.accent,
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  playHint: {
    marginTop: Spacing.sm,
  },
  playHintText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: FontSizes.xs,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
  },
  categoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  categoryText: {
    color: Colors.primary,
    fontSize: FontSizes.sm,
  },
  addCategoryButton: {
    backgroundColor: Colors.inputBg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  addCategoryText: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
  },
  trendingList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  trendingItem: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trendingText: {
    color: Colors.primary,
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
  },
});