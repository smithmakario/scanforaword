import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { authAPI } from '../../src/services/api';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const handleCreatorDashboard = () => {
    router.push('/creator');
  };

  const handleUpload = () => {
    router.push('/upload');
  };

  const handleCreatorRequest = async () => {
    Alert.alert(
      'Apply as Creator',
      'Would you like to apply to become a creator and share your_messages with listeners?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: async () => {
            setIsRequesting(true);
            try {
              const response = await authAPI.requestCreator();
              if (response.status === 'success') {
                Alert.alert(
                  'Request Submitted!',
                  'Your creator request is pending. You will be notified once approved.',
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert('Error', response.message || 'Failed to submit request');
              }
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to submit request');
            } finally {
              setIsRequesting(false);
            }
          },
        },
      ]
    );
  };

  const getCreatorButtonText = () => {
    if (isRequesting) return 'Submitting...';
    if (user?.role === 'creator') return 'Creator';
    return 'Apply as Creator';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {user?.role === 'creator' ? 'Creator' : 'Listener'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Settings</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>👤 Edit Profile</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>🔔 Notification Settings</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>🔒 Privacy Policy</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>📜 Terms of Service</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {user?.role === 'creator' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎤 Creator Studio</Text>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleCreatorDashboard}>
              <Text style={styles.menuText}>📊 Creator Dashboard</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleUpload}>
              <Text style={styles.menuText}>📤 Upload Content</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>📈 Analytics</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* For listeners who want to become creators */}
        {user?.role !== 'creator' && (
          <View style={styles.sectionCreator}>
            <Text style={styles.creatorTitle}>🎤 Become a Creator</Text>
            <Text style={styles.creatorDesc}>
              Share your messages and build your audience
            </Text>
            <TouchableOpacity 
              style={[styles.creatorButton, isRequesting && styles.creatorButtonDisabled]} 
              onPress={handleCreatorRequest}
              disabled={isRequesting}
            >
              {isRequesting ? (
                <ActivityIndicator size="small" color="#4A154B" />
              ) : (
                <Text style={styles.creatorButtonText}>{getCreatorButtonText()}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  name: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  email: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  roleBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    marginTop: Spacing.sm,
  },
  roleText: {
    color: Colors.text,
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuText: {
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  menuArrow: {
    fontSize: 20,
    color: Colors.textMuted,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.error,
  },
  logoutText: {
    color: Colors.error,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  sectionCreator: {
    backgroundColor: '#4A154B',
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  creatorTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  creatorDesc: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.md,
  },
  creatorButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  creatorButtonText: {
    color: '#4A154B',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: FontSizes.xs,
    marginTop: Spacing.lg,
  },
});