import React, { useState } from 'react';
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
import { Colors, Spacing, FontSizes } from '../../src/constants/theme';
import api from '../../src/services/api';

interface UploadProgress {
  percent: number;
  status: string;
}

export default function UploadScreen() {
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [audioFile, setAudioFile] = useState<any>(null);
  const [coverImage, setCoverImage] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!speaker.trim()) {
      newErrors.speaker = 'Speaker name is required';
    }

    if (!audioFile) {
      newErrors.audio = 'Please select an audio file';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectAudio = () => {
    // In a real app, this would use expo-document-picker or expo-image-picker
    // For now, simulate file selection
    setAudioFile({
      name: 'sample_audio.mp3',
      size: 15000000, // 15MB
    });
  };

  const handleSelectCover = () => {
    // In a real app, this would use expo-image-picker
    // For now, simulate image selection
    setCoverImage({
      name: 'cover_image.jpg',
    });
  };

  const handleUpload = async () => {
    if (!validateForm()) return;

    setIsUploading(true);
    setUploadProgress({ percent: 0, status: 'Preparing upload...' });

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev && prev.percent < 90) {
            return { ...prev, percent: prev.percent + 10 };
          }
          return prev;
        });
      }, 500);

      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 5000));

      clearInterval(progressInterval);

      // Make actual API call
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('speaker', speaker.trim());
      formData.append('full_url', 'https://example.com/audio.mp3');
      formData.append('duration', '3:45');

      await api.post('/creator/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadProgress({ percent: 100, status: 'Processing...' });

      Alert.alert(
        'Upload Successful!',
        'Your message is now being processed. It will become searchable once processing is complete.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert(
        'Upload failed',
        'Please check your connection and try again.'
      );
      setUploadProgress(null);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusMessage = (status: string, percent: number) => {
    if (percent < 30) return 'Uploading audio...';
    if (percent < 60) return 'Processing upload...';
    if (percent < 90) return 'Finalizing...';
    return 'Processing – AI Scan ' + Math.round(percent) + '%';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Upload Message</Text>
        <Text style={styles.subtitle}>Share audio with your listeners</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {isUploading && uploadProgress ? (
          <View style={styles.progressContainer}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressPercent}>{uploadProgress.percent}%</Text>
            </View>
            <Text style={styles.progressStatus}>
              {getStatusMessage(uploadProgress.status, uploadProgress.percent)}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${uploadProgress.percent}%` }]} 
              />
            </View>
          </View>
        ) : (
          <>
            {/* Audio File Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Audio File *</Text>
              <TouchableOpacity 
                style={[styles.fileSelector, errors.audio && styles.fileSelectorError]}
                onPress={handleSelectAudio}
              >
                {audioFile ? (
                  <View style={styles.selectedFile}>
                    <Text style={styles.fileIcon}>🎵</Text>
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileName}>{audioFile.name}</Text>
                      <Text style={styles.fileSize}>{formatFileSize(audioFile.size)}</Text>
                    </View>
                    <Text style={styles.changeText}>Change</Text>
                  </View>
                ) : (
                  <View style={styles.selectPrompt}>
                    <Text style={styles.selectIcon}>🎤</Text>
                    <Text style={styles.selectText}>Tap to select audio file</Text>
                    <Text style={styles.selectHint}>MP3, M4A, WAV (max 500 MB)</Text>
                  </View>
                )}
              </TouchableOpacity>
              {errors.audio && <Text style={styles.errorText}>{errors.audio}</Text>}
            </View>

            {/* Title */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Message Title *</Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                placeholder="Enter message title"
                placeholderTextColor={Colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />
              {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            </View>

            {/* Speaker */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Speaker Name *</Text>
              <TextInput
                style={[styles.input, errors.speaker && styles.inputError]}
                placeholder="Who is speaking?"
                placeholderTextColor={Colors.textMuted}
                value={speaker}
                onChangeText={setSpeaker}
              />
              {errors.speaker && <Text style={styles.errorText}>{errors.speaker}</Text>}
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add a description..."
                placeholderTextColor={Colors.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Cover Image */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cover Image (Optional)</Text>
              <TouchableOpacity 
                style={styles.fileSelector}
                onPress={handleSelectCover}
              >
                {coverImage ? (
                  <View style={styles.selectedFile}>
                    <Text style={styles.fileIcon}>🖼️</Text>
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileName}>{coverImage.name}</Text>
                    </View>
                    <Text style={styles.changeText}>Change</Text>
                  </View>
                ) : (
                  <View style={styles.selectPrompt}>
                    <Text style={styles.selectIcon}>📷</Text>
                    <Text style={styles.selectText}>Tap to select cover image</Text>
                    <Text style={styles.selectHint}>JPG, PNG (max 10 MB)</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Upload Button */}
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={handleUpload}
            >
              <Text style={styles.uploadButtonText}>Upload Message</Text>
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
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputError: {
    borderColor: Colors.error,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
  },
  fileSelector: {
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  fileSelectorError: {
    borderColor: Colors.error,
  },
  selectPrompt: {
    alignItems: 'center',
  },
  selectIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  selectText: {
    fontSize: FontSizes.md,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  selectHint: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
  },
  selectedFile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: FontSizes.md,
    color: Colors.text,
    fontWeight: '500',
  },
  fileSize: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
  },
  changeText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  progressPercent: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  progressStatus: {
    fontSize: FontSizes.md,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
});