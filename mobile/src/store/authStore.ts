import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;
const LOCKOUT_KEY = 'login_lockout';
const FAILED_ATTEMPTS_KEY = 'failed_attempts';

interface User {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isVerified: boolean;
  error: string | null;
  isLocked: boolean;
  lockoutRemainingSeconds: number;
  
  initialize: () => Promise<void>;
  register: (data: {
    name: string;
    email?: string;
    phone_number?: string;
    password: string;
    role?: string;
  }) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  verifyCode: (code: string) => Promise<boolean>;
  resendCode: () => Promise<void>;
  clearError: () => void;
  checkLockout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  isVerified: false,
  error: null,
  isLocked: false,
  lockoutRemainingSeconds: 0,

  initialize: async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userStr = await AsyncStorage.getItem('auth_user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ token, user, isAuthenticated: true, isVerified: true });
      }
      
      await get().checkLockout();
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    }
  },

  checkLockout: async () => {
    try {
      const lockoutData = await AsyncStorage.getItem(LOCKOUT_KEY);
      if (lockoutData) {
        const { until } = JSON.parse(lockoutData);
        const remaining = Math.max(0, Math.floor((until - Date.now()) / 1000));
        
        if (remaining > 0) {
          set({ isLocked: true, lockoutRemainingSeconds: remaining });
          
          const interval = setInterval(() => {
            const newRemaining = Math.max(0, Math.floor((until - Date.now()) / 1000));
            if (newRemaining <= 0) {
              clearInterval(interval);
              set({ isLocked: false, lockoutRemainingSeconds: 0 });
              AsyncStorage.removeItem(LOCKOUT_KEY);
              AsyncStorage.removeItem(FAILED_ATTEMPTS_KEY);
            } else {
              set({ lockoutRemainingSeconds: newRemaining });
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error checking lockout:', error);
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register(data);
      
      if (response.status === 'success') {
        const { access_token, data: user } = response;
        
        await AsyncStorage.setItem('auth_token', access_token);
        await AsyncStorage.setItem('auth_user', JSON.stringify(user));
        
        set({
          token: access_token,
          user,
          isAuthenticated: true,
          isVerified: false,
          isLoading: false
        });
        
        return true;
      }
      
      set({ isLoading: false });
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || 
                      error.response?.data?.error || 
                      'Registration failed. Please try again.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  login: async (email, password) => {
    const { isLocked, checkLockout } = get();
    
    if (isLocked) {
      set({ error: 'Too many attempts. Try again in 15 minutes.' });
      return false;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      const response = await authAPI.login(email, password);
      
      if (response.status === 'success') {
        const { access_token, data: user } = response;
        
        await AsyncStorage.setItem('auth_token', access_token);
        await AsyncStorage.setItem('auth_user', JSON.stringify(user));
        
        await AsyncStorage.removeItem(FAILED_ATTEMPTS_KEY);
        
        set({
          token: access_token,
          user,
          isAuthenticated: true,
          isVerified: true,
          isLoading: false,
          error: null
        });
        
        return true;
      }
      
      set({ isLoading: false });
      return false;
    } catch (error: any) {
      try {
        const attemptsData = await AsyncStorage.getItem(FAILED_ATTEMPTS_KEY);
        let attempts = attemptsData ? JSON.parse(attemptsData) : { count: 0, email };
        
        if (attempts.email !== email) {
          attempts = { count: 0, email };
        }
        
        attempts.count += 1;
        await AsyncStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(attempts));
        
        if (attempts.count >= MAX_FAILED_ATTEMPTS) {
          const lockoutUntil = Date.now() + (LOCKOUT_DURATION_MINUTES * 60 * 1000);
          await AsyncStorage.setItem(LOCKOUT_KEY, JSON.stringify({ until: lockoutUntil }));
          
          set({
            error: 'Too many attempts. Try again in 15 minutes.',
            isLoading: false,
            isLocked: true,
            lockoutRemainingSeconds: LOCKOUT_DURATION_MINUTES * 60
          });
          
          await checkLockout();
          return false;
        }
      } catch (storageError) {
        console.error('Error updating failed attempts:', storageError);
      }
      
      const message = 'Email or password is incorrect';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('auth_user');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isVerified: false,
        error: null,
        isLocked: false,
        lockoutRemainingSeconds: 0
      });
    }
  },

  verifyCode: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.verifyCode(code);
      
      if (response.status === 'success') {
        set({ isVerified: true, isLoading: false });
        return true;
      }
      
      set({ isLoading: false });
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || 
                      'Invalid verification code.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  resendCode: async () => {
    try {
      await authAPI.resendCode();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to resend code.';
      set({ error: message });
    }
  },

  clearError: () => set({ error: null }),
}));