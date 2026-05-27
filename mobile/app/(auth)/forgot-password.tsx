import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleResetPassword = async () => {
    setLocalError('');
    clearError();
    
    if (!email.trim()) {
      setLocalError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setLocalError('Please enter a valid email address');
      return;
    }

    const success = await forgotPassword(email.trim());
    if (success) {
      setEmailSent(true);
    }
  };

  if (emailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.successIconContainer}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            <Text style={styles.title}>Check Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent password reset instructions to{'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
          </View>

          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>Didn't receive the email?</Text>
            <Text style={styles.instructionsText}>
              {'\u2022'} Check your spam folder{'\n'}
              {'\u2022'} Verify the email address is correct{'\n'}
              {'\u2022'} Wait a few minutes and try again
            </Text>
          </View>

          <TouchableOpacity
            style={styles.resendButton}
            onPress={() => setEmailSent(false)}
          >
            <Text style={styles.resendText}>Resend Email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.backIcon}>{'<'}</Text>
            <Text style={styles.backText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.branding}>
          <Text style={styles.brandText}>SCAN FOR A WORD</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🔒</Text>
            </View>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              No worries! Enter your email address and we'll send you instructions to reset your password.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputContainer, (localError || error) ? styles.inputError : null]}>
                <Text style={styles.inputIcon}>✉</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setLocalError('');
                    clearError();
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {(localError || error) ? (
                <Text style={styles.errorText}>{localError || error}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Sending...' : 'Reset Password'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.backIcon}>{'<'}</Text>
            <Text style={styles.backText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.branding}>
          <Text style={styles.brandText}>SCAN FOR A WORD</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  icon: {
    fontSize: 36,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(67, 160, 71, 0.2)',
    borderWidth: 2,
    borderColor: '#43A047',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successIcon: {
    fontSize: 40,
    color: '#43A047',
  },
  title: {
    fontSize: FontSizes.headlineMd.fontSize,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.bodyMd.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
  emailHighlight: {
    color: Colors.primary,
    fontWeight: '600',
  },
  form: {
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSizes.labelMd.fontSize,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: Spacing.md,
  },
  inputError: {
    borderColor: Colors.error,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
    color: Colors.textMuted,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.bodyMd.fontSize,
    color: Colors.text,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSizes.labelSm.fontSize,
    marginTop: Spacing.xs,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.onPrimary,
    fontSize: FontSizes.bodyMd.fontSize,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  instructionsCard: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  instructionsTitle: {
    fontSize: FontSizes.labelMd.fontSize,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  instructionsText: {
    fontSize: FontSizes.labelMd.fontSize,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  resendButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  resendText: {
    color: Colors.primary,
    fontSize: FontSizes.bodyMd.fontSize,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  backIcon: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
  },
  backText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.labelMd.fontSize,
  },
  branding: {
    alignItems: 'center',
    paddingBottom: Spacing.lg,
  },
  brandText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: '0.2em',
  },
});