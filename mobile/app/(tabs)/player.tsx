import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';

const { width } = Dimensions.get('window');

interface MessageDetail {
  id: number;
  title: string;
  content: string;
  speaker?: string;
  duration?: string;
  audio_url?: string;
  cover_image?: string;
}

export default function PlayerScreen() {
  const router = useRouter();
  const { id, title, speaker, content, keyword } = useLocalSearchParams();
  const { isAuthenticated } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(180);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const toggleBookmark = async () => {
    if (!isAuthenticated) return;
    setIsBookmarked(!isBookmarked);
  };

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const togglePlayPause = () => {
    if (isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= totalDuration) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    setIsPlaying(!isPlaying);
  };

  const skipForward = () => {
    const newTime = Math.min(currentTime + 10, totalDuration);
    setCurrentTime(newTime);
  };

  const skipBackward = () => {
    const newTime = Math.max(currentTime - 10, 0);
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  const handleClose = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      {/* Album Art Placeholder */}
      <View style={styles.albumContainer}>
        <View style={styles.albumArt}>
          <Text style={styles.crossIcon}>✝️</Text>
        </View>
      </View>

      {/* Title & Speaker */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {title || 'The Power of Faith'}
        </Text>
        <Text style={styles.speaker}>
          {speaker || 'Pastor John Smith'}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(totalDuration)}</Text>
        </View>
      </View>

      {/* Playback Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={skipBackward}>
          <Text style={styles.controlIcon}>⏪</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.playButton, isPlaying && styles.playButtonActive]} 
          onPress={togglePlayPause}
        >
          {isLoading ? (
            <ActivityIndicator color="#1a1a2e" />
          ) : (
            <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={skipForward}>
          <Text style={styles.controlIcon}>⏩</Text>
        </TouchableOpacity>
      </View>

      {/* Bookmark Button */}
      <TouchableOpacity style={styles.bookmarkButton} onPress={toggleBookmark}>
        <Text style={[styles.bookmarkIcon, isBookmarked && styles.bookmarkActive]}>
          {isBookmarked ? '🔖' : '🔖'}
        </Text>
        <Text style={styles.bookmarkText}>
          {isBookmarked ? 'Saved' : 'Save'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A154B',
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 20,
  },
  albumContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  albumArt: {
    width: width - 80,
    height: width - 80,
    backgroundColor: '#6B2D6B',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  crossIcon: {
    fontSize: 80,
  },
  infoContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  speaker: {
    fontSize: FontSizes.md,
    color: '#888',
  },
  progressContainer: {
    marginTop: 30,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    color: '#888',
    fontSize: FontSizes.xs,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 30,
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  controlButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 32,
    color: '#fff',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  playButtonActive: {
    backgroundColor: '#e0e0e0',
  },
  playIcon: {
    fontSize: 32,
    color: '#4A154B',
  },
  bookmarkButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  bookmarkIcon: {
    fontSize: 20,
    marginRight: 8,
    opacity: 0.6,
  },
  bookmarkActive: {
    opacity: 1,
  },
  bookmarkText: {
    color: '#888',
    fontSize: FontSizes.sm,
  },
});