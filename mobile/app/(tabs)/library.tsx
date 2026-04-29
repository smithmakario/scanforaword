import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import api from '../../src/services/api';

interface Bookmark {
  id: number;
  title: string;
  content: string;
  keyword: string;
  speaker?: string;
  duration?: string;
}

export default function LibraryScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get('/bookmarks');
      setBookmarks(response.data.data || []);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBookmark = async (id: number) => {
    Alert.alert(
      'Remove Bookmark',
      'Are you sure you want to remove this from your library?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/snippets/${id}/bookmark`);
              setBookmarks(bookmarks.filter(b => b.id !== id));
            } catch (error) {
              console.error('Failed to remove bookmark:', error);
            }
          },
        },
      ]
    );
  };

  const handleItemPress = (item: Bookmark) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to play audio', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/login') },
      ]);
      return;
    }

    router.push({
      pathname: '/player',
      params: {
        id: item.id.toString(),
        title: item.title,
        speaker: item.speaker || '',
        content: item.content,
        keyword: item.keyword,
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Library</Text>
        <Text style={styles.subtitle}>{bookmarks.length} saved items</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : bookmarks.length > 0 ? (
          bookmarks.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.bookmarkCard}
              onPress={() => handleItemPress(item)}
            >
              <View style={styles.cardContent}>
                <View style={styles.thumbnail}>
                  <Text style={styles.thumbnailEmoji}>🎵</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.keyword}>#{item.keyword}</Text>
                  <Text style={styles.bookmarkTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {item.speaker && (
                    <Text style={styles.creatorName}>By {item.speaker}</Text>
                  )}
                  <View style={styles.cardFooter}>
                    {item.duration && (
                      <Text style={styles.duration}>⏱️ {item.duration}</Text>
                    )}
                    <TouchableOpacity 
                      onPress={(e) => {
                        e.stopPropagation();
                        handleRemoveBookmark(item.id);
                      }}
                    >
                      <Text style={styles.removeButton}>❤️ Saved</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyText}>Nothing saved yet</Text>
            <Text style={styles.emptySubtext}>
              Search for a word to get started
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
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
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
  bookmarkCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardContent: {
    flexDirection: 'row',
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  thumbnailEmoji: {
    fontSize: 30,
  },
  cardInfo: {
    flex: 1,
  },
  keyword: {
    color: Colors.primary,
    fontSize: FontSizes.xs,
    fontWeight: '600',
    marginBottom: 2,
  },
  bookmarkTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  creatorName: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duration: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  removeButton: {
    fontSize: FontSizes.xs,
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
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});