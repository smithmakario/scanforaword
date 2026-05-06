import React, { useState, useEffect } from 'react';
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

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError, isLocked, lockoutRemainingSeconds } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isLocked) {
      const minutes = Math.floor(lockoutRemainingSeconds / 60);
      const seconds = lockoutRemainingSeconds % 60;
      setErrors({
        form: `Too many attempts. Try again in ${minutes}:${seconds.toString().padStart(2, '0')} minutes.`
      });
    } else {
      setErrors({});
    }
  }, [isLocked, lockoutRemainingSeconds]);

  useEffect(() => {
    if (error) {
      setErrors({ form: error });
    }
  }, [error]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    clearError();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    const success = await login(email.trim(), password);

    if (success) {
      router.replace('/(tabs)');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          <View style={styles.form}>
            {errors.form && (
              <View style={styles.lockoutBanner}>
                <Text style={styles.lockoutText}>{errors.form}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputContainer, errors.email ? styles.inputError : null]}>
                <Text style={styles.inputIcon}>✉</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLocked}
                />
              </View>
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <View style={[styles.inputContainer, errors.password ? styles.inputError : null]}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={Colors.textMuted}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                    }}
                    secureTextEntry={!showPassword}
                    editable={!isLocked}
                  />
                </View>
                <TouchableOpacity
                  style={styles.showPassword}
                  onPress={() => !isLocked && setShowPassword(!showPassword)}
                >
                  <Text style={[styles.showPasswordText, isLocked && styles.textDisabled]}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                (isLoading || isLocked) && styles.buttonDisabled
              ]}
              onPress={handleLogin}
              disabled={isLoading || isLocked}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Signing In...' : isLocked ? `Locked (${formatTime(lockoutRemainingSeconds)})` : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <View style={styles.registerLink}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.registerLinkText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSizes.headlineMd.fontSize,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.bodyMd.fontSize,
    color: Colors.textSecondary,
  },
  form: {},
  lockoutBanner: {
    backgroundColor: Colors.errorContainer,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  lockoutText: {
    color: Colors.error,
    fontSize: FontSizes.labelMd.fontSize,
    textAlign: 'center',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: Spacing.md,
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
    fontSize: 16,
    marginRight: Spacing.sm,
    color: Colors.textMuted,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.bodyMd.fontSize,
    color: Colors.text,
  },
  inputDisabled: {
    backgroundColor: Colors.surfaceContainerHighest,
    color: Colors.textMuted,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSizes.labelSm.fontSize,
    marginTop: Spacing.xs,
  },
  passwordContainer: {
    position: 'relative',
  },
  showPassword: {
    position: 'absolute',
    right: Spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  showPasswordText: {
    color: Colors.primary,
    fontSize: FontSizes.labelMd.fontSize,
    fontWeight: '600',
  },
  textDisabled: {
    color: Colors.textMuted,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: FontSizes.labelMd.fontSize,
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
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  registerText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.labelMd.fontSize,
  },
  registerLinkText: {
    color: Colors.primary,
    fontSize: FontSizes.labelMd.fontSize,
    fontWeight: '600',
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