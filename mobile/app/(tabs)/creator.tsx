import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes } from '../../src/constants/theme';
import api from '../../src/services/api';

interface Stats {
  uploads: number;
  listens: number;
  keyword_matches: number;
  peak_time: string;
  engagement: string;
}

interface Message {
  id: number;
  title: string;
  status: string;
  duration: string;
  listens_count: number;
}

export default function CreatorDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, messagesRes] = await Promise.all([
        api.get('/creator/stats'),
        api.get('/creator/messages'),
      ]);
      setStats(statsRes.data.data);
      setMessages(messagesRes.data.data || []);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Creator Dashboard</Text>
          <Text style={styles.subtitle}>Manage your content</Text>
        </View>

        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={() => router.push('/upload')}
        >
          <Text style={styles.uploadButtonIcon}>+</Text>
          <View style={styles.uploadButtonTextContainer}>
            <Text style={styles.uploadButtonText}>Upload New Message</Text>
            <Text style={styles.uploadButtonSubtext}>Share audio with listeners</Text>
          </View>
        </TouchableOpacity>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats?.uploads || 0}</Text>
                <Text style={styles.statLabel}>Uploads</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats?.listens || 0}</Text>
                <Text style={styles.statLabel}>Listens</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats?.keyword_matches || 0}</Text>
                <Text style={styles.statLabel}>Keywords</Text>
              </View>
            </View>

            <View style={styles.insightsCard}>
              <Text style={styles.insightsTitle}>📈 Insights</Text>
              <View style={styles.insightRow}>
                <Text style={styles.insightLabel}>Peak Time:</Text>
                <Text style={styles.insightValue}>{stats?.peak_time || 'N/A'}</Text>
              </View>
              <View style={styles.insightRow}>
                <Text style={styles.insightLabel}>Engagement:</Text>
                <Text style={styles.insightValue}>{stats?.engagement || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Uploads</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>

              {messages.length > 0 ? (
                messages.map((msg) => (
                  <View key={msg.id} style={styles.messageCard}>
                    <View style={styles.messageHeader}>
                      <Text style={styles.messageTitle}>{msg.title}</Text>
                      <View style={[
                        styles.statusBadge,
                        msg.status === 'processing' && styles.statusProcessing,
                        msg.status === 'published' && styles.statusPublished,
                      ]}>
                        <Text style={styles.statusText}>{msg.status}</Text>
                      </View>
                    </View>
                    <View style={styles.messageStats}>
                      <Text style={styles.messageStat}>⏱️ {msg.duration}</Text>
                      <Text style={styles.messageStat}>👂 {msg.listens_count} listens</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No uploads yet</Text>
              )}
            </View>

            <TouchableOpacity style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>+ Upload New Content</Text>
            </TouchableOpacity>
          </>
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
  content: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.lg,
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
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  uploadButtonIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    marginRight: Spacing.md,
    fontWeight: 'bold',
  },
  uploadButtonTextContainer: {
    flex: 1,
  },
  uploadButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  uploadButtonSubtext: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  insightsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  insightsTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  insightLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  insightValue: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    fontWeight: '500',
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
  seeAll: {
    color: Colors.primary,
    fontSize: FontSizes.sm,
  },
  messageCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  messageTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: Colors.inputBg,
  },
  statusProcessing: {
    backgroundColor: '#FFF3E0',
  },
  statusPublished: {
    backgroundColor: '#E8F5E9',
  },
  statusText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  messageStats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  messageStat: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
    textAlign: 'center',
    padding: Spacing.lg,
  },
  uploadButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});