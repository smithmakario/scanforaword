import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { Colors, Spacing, FontSizes } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import api from '../../src/services/api';

interface SearchResult {
  id: number;
  title: string;
  content: string;
  keyword: string;
  speaker?: string;
  duration?: string;
  is_bookmarked?: boolean;
}

interface TrendingKeyword {
  keyword: string;
  count: number;
}

export default function SearchScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [trending, setTrending] = useState<TrendingKeyword[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isFromDeepLink, setIsFromDeepLink] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());

  const toggleBookmark = async (item: SearchResult) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to bookmark messages', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/login') },
      ]);
      return;
    }

    try {
      await api.post(`/snippets/${item.id}/bookmark`);
      
      setBookmarkedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(item.id)) {
          newSet.delete(item.id);
        } else {
          newSet.add(item.id);
        }
        return newSet;
      });

      // Update the result's bookmark status
      setResults(prev => prev.map(r => 
        r.id === item.id ? { ...r, is_bookmarked: !r.is_bookmarked } : r
      ));
    } catch (error) {
      console.error('Bookmark error:', error);
      Alert.alert('Error', 'Failed to update bookmark');
    }
  };

  useEffect(() => {
    loadTrending();
    handleDeepLink();
  }, []);

  const handleDeepLink = useCallback(async () => {
    try {
      const initialURL = await Linking.getInitialURL();
      if (initialURL) {
        processURL(initialURL);
      }
    } catch (error) {
      console.error('Deep link error:', error);
    }

    const subscription = Linking.addEventListener('url', (event) => {
      processURL(event.url);
    });

    return () => subscription.remove();
  }, []);

  const processURL = (url: string) => {
    try {
      const parsed = Linking.parse(url);
      const q = parsed.queryParams?.q as string || parsed.queryParams?.keyword as string;
      
      if (q) {
        setQuery(q);
        setIsFromDeepLink(true);
        handleSearch(q);
      }
    } catch (error) {
      console.error('Error parsing URL:', error);
    }
  };

  const loadTrending = async () => {
    try {
      const response = await api.get('/search/trending');
      setTrending(response.data.data || []);
    } catch (error) {
      console.error('Failed to load trending:', error);
      setTrending([
        { keyword: 'Faith', count: 150 },
        { keyword: 'Peace', count: 120 },
        { keyword: 'Love', count: 98 },
        { keyword: 'Hope', count: 87 },
        { keyword: 'Joy', count: 75 },
      ]);
    } finally {
      setIsLoadingTrending(false);
    }
  };

  const handlePlayPress = (item: SearchResult) => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to play audio content',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/login') },
          { text: 'Register', onPress: () => router.push('/register') },
        ]
      );
      return;
    }
    
    router.push({
      pathname: '/player',
      params: {
        id: item.id.toString(),
        title: item.title,
        speaker: item.speaker || '',
        content: item.content,
        keyword: searchKeyword,
      }
    });
  };

  const handleSearch = async (keyword?: string) => {
    const searchTerm = keyword || query.trim();
    if (!searchTerm) return;

    if (!keyword) {
      setQuery(searchTerm);
    }
    setIsLoading(true);
    setHasSearched(true);
    setSearchKeyword(searchTerm);
    
    try {
      const response = await api.get('/search', {
        params: { keyword: searchTerm },
      });
      setResults(response.data.data || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrendingPress = (keyword: string) => {
    handleSearch(keyword);
  };

  const handleResultPress = (item: SearchResult) => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to listen to this message',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/login') },
          { text: 'Register', onPress: () => router.push('/register') },
        ]
      );
    }
  };

  const highlightKeyword = (text: string, keyword: string) => {
    if (!keyword) return text;
    
    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === keyword.toLowerCase() ? (
        <Text key={index} style={styles.highlightedKeyword}>{part}</Text>
      ) : (
        part
      )
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search keywords..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => handleSearch()}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : !hasSearched && trending.length > 0 ? (
          <View style={styles.trendingSection}>
            <Text style={styles.trendingTitle}>🔥 Trending Keywords</Text>
            <View style={styles.trendingPills}>
              {trending.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.trendingPill}
                  onPress={() => handleTrendingPress(item.keyword)}
                >
                  <Text style={styles.trendingPillText}>{item.keyword}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : results.length > 0 ? (
          <View style={styles.resultsContainer}>
            {isFromDeepLink && (
              <View style={styles.deepLinkBanner}>
                <Text style={styles.deepLinkText}>
                  🔗 Viewing shared content for "{searchKeyword}"
                </Text>
              </View>
            )}
            <Text style={styles.resultsCount}>
              {results.length} message{results.length !== 1 ? 's' : ''} found
            </Text>
            {results.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.resultCard}
                onPress={() => handleResultPress(item)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={styles.cardActions}>
                    {item.duration && (
                      <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>⏱️ {item.duration}</Text>
                      </View>
                    )}
                    <TouchableOpacity 
                      style={styles.bookmarkButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleBookmark(item);
                      }}
                    >
                      <Text style={styles.bookmarkIcon}>
                        {bookmarkedIds.has(item.id) || item.is_bookmarked ? '❤️' : '🤍'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {item.speaker && (
                  <Text style={styles.creatorName}>By {item.speaker}</Text>
                )}
                <Text style={styles.resultContent} numberOfLines={3}>
                  {highlightKeyword(item.content, searchKeyword)}
                </Text>
                <TouchableOpacity 
                  style={styles.playButton}
                  onPress={() => handlePlayPress(item)}
                >
                  <Text style={styles.playIcon}>▶</Text>
                  <Text style={styles.playText}>
                    {isAuthenticated ? 'Play Audio' : 'Login to Play'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        ) : hasSearched ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>
              No messages found for "{searchKeyword}"—try a different word.
            </Text>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptySubtext}>
              Search for keywords to find content
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    padding: Spacing.lg,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  trendingSection: {
    marginBottom: Spacing.lg,
  },
  trendingTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  trendingPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  trendingPill: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trendingPillText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    fontWeight: '500',
  },
  deepLinkBanner: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  deepLinkText: {
    fontSize: FontSizes.sm,
    color: Colors.success,
    textAlign: 'center',
    fontWeight: '500',
  },
  resultsContainer: {},
  resultsCount: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bookmarkButton: {
    padding: Spacing.xs,
  },
  bookmarkIcon: {
    fontSize: 20,
  },
  resultTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  durationBadge: {
    backgroundColor: Colors.inputBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  durationText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  creatorName: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  resultContent: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  highlightedKeyword: {
    backgroundColor: Colors.accent,
    color: Colors.text,
    fontWeight: 'bold',
    paddingHorizontal: 2,
    borderRadius: 2,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  playIcon: {
    fontSize: 16,
    color: Colors.primary,
    marginRight: Spacing.xs,
  },
  playText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: Spacing.lg,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptySubtext: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
});