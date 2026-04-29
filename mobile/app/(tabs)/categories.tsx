import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import api from '../../src/services/api';

interface Category {
  id: number;
  name: string;
}

export default function CategoriesScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      const allCategories = response.data.data || [];
      setCategories(allCategories);

      // Load user's preferences if authenticated
      if (isAuthenticated && user?.email) {
        const prefsRes = await api.get('/library/status');
        // In real app, would get selected category IDs
        // For now, use empty set
        setSelectedIds(new Set());
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      // Fallback categories
      setCategories([
        { id: 1, name: 'Relationships' },
        { id: 2, name: 'Career' },
        { id: 3, name: 'Health' },
        { id: 4, name: 'Faith' },
        { id: 5, name: 'Family' },
        { id: 6, name: 'Finance' },
        { id: 7, name: 'Personal Growth' },
        { id: 8, name: 'Motivation' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (id: number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to save your preferences', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/login') },
      ]);
      return;
    }

    setIsSaving(true);
    try {
      await api.post('/preferences', {
        identifier: user?.email,
        categories: Array.from(selectedIds),
      });

      Alert.alert('Success', 'Your preferences have been saved!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Choose Categories</Text>
        <Text style={styles.subtitle}>
          Select the topics you want to receive daily inspiration on
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => {
            const isSelected = selectedIds.has(category.id);
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  isSelected && styles.categoryCardSelected,
                ]}
                onPress={() => toggleCategory(category.id)}
              >
                <View style={styles.categoryIcon}>
                  <Text style={styles.iconText}>{getCategoryEmoji(category.name)}</Text>
                </View>
                <Text style={[
                  styles.categoryName,
                  isSelected && styles.categoryNameSelected,
                ]}>
                  {category.name}
                </Text>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedIds.size === 0 && (
          <Text style={styles.hint}>
            Select at least one category to get personalized daily words
          </Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            isSaving && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={isSaving || selectedIds.size === 0}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : `Save ${selectedIds.size} Categories`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function getCategoryEmoji(name: string): string {
  const emojis: Record<string, string> = {
    'Relationships': '💕',
    'Career': '💼',
    'Health': '💪',
    'Faith': '🙏',
    'Family': '👨‍👩‍👧',
    'Finance': '💰',
    'Personal Growth': '🌱',
    'Motivation': '🔥',
  };
  return emojis[name] || '✨';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  backButton: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    marginBottom: Spacing.sm,
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
    paddingTop: 0,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    position: 'relative',
  },
  categoryCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F3E5F5',
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconText: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  categoryNameSelected: {
    color: Colors.primary,
  },
  checkmark: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  hint: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  footer: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});