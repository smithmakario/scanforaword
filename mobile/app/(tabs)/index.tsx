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
          <View>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
            <Text style={styles.greeting}>Hello, {user?.name || 'Beloved'}!</Text>
          </View>
        </View>

        {/* Daily Word Card */}
        <TouchableOpacity 
          style={styles.dailyWordCard}
          onPress={handleDailyWordPress}
        >
          <View style={styles.crossWatermark}>
            <Text style={styles.crossWatermarkText}>✝</Text>
          </View>
          
          <Text style={styles.dailyLabel}>📅 Today's Word</Text>
          
          <Text style={styles.dailyTitle}>
            {dailyWord?.title || 'Receive Your Daily Word'}
          </Text>
          
          <Text style={styles.dailySpeaker}>
            {dailyWord?.speaker || 'Tap to listen now'}
          </Text>
          
          <View style={styles.playButtonContainer}>
            <Text style={styles.playButtonBig}>▶</Text>
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
    backgroundColor: '#4A154B',
    borderRadius: 24,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderTopWidth: 4,
    borderTopColor: '#4A154B',
    alignItems: 'center',
    position: 'relative',
  },
  dailyLabel: {
    color: '#FFD700',
    fontSize: FontSizes.xs,
    fontWeight: '600',
    letterSpacing: 1,
    alignSelf: 'flex-start',
  },
  dailyTitle: {
    color: '#FFFFFF',
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  dailySpeaker: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
  },
  dailyLabel: {
    color: '#FFFFFF',
    fontSize: FontSizes.xs,
    fontWeight: '600',
    letterSpacing: 1,
    alignSelf: 'flex-start',
  },
  dailyTitle: {
    color: '#FFFFFF',
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  dailySpeaker: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
  },
  dailyDesc: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: FontSizes.sm,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
playButtonContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playButtonBig: {
    fontSize: 36,
    color: '#4A154B',
    marginLeft: 4,
  },
  playButtonBig: {
    fontSize: 36,
    color: '#4A154B',
    marginLeft: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  readButtonText: {
    color: '#4A154B',
    fontSize: FontSizes.md,
    fontWeight: '600',
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
    color: '#1A1A1A',
  },
  seeAllText: {
    fontSize: FontSizes.sm,
    color: '#4A154B',
  },
  categoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    backgroundColor: '#E8E8E8',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  categoryText: {
    color: '#1A1A1A',
    fontSize: FontSizes.sm,
  },
  trendingList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  trendingItem: {
    backgroundColor: '#E8E8E8',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  trendingText: {
    color: '#1A1A1A',
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
  },
});