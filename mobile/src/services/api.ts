import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://phplaravel-1549859-6393770.cloudwaysapps.com/api';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      AsyncStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (data: {
    name: string;
    email?: string;
    phone_number?: string;
    password: string;
    role?: string;
  }) => {
    try {
      const response = await api.post('/register', data);
      console.log('Register response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('Register error:', error.response?.data || error.message);
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/login', { email, password });
      console.log('Login response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/logout');
      console.log('Logout response:', response.data);
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('auth_user');
      return response.data;
    } catch (error: any) {
      console.log('Logout error:', error.response?.data || error.message);
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('auth_user');
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/user');
      console.log('Profile response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('Profile error:', error.response?.data || error.message);
      throw error;
    }
  },

  verifyCode: async (code: string) => {
    try {
      const response = await api.post('/verify', { code });
      console.log('Verify response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('Verify error:', error.response?.data || error.message);
      throw error;
    }
  },

  resendCode: async () => {
    try {
      const response = await api.post('/resend-code');
      console.log('Resend code response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('Resend code error:', error.response?.data || error.message);
      throw error;
    }
  },

  requestCreator: async () => {
    try {
      const response = await api.post('/creator/request');
      console.log('Creator request response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('Creator request error:', error.response?.data || error.message);
      throw error;
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/forgot-password', { email });
      console.log('Forgot password response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('Forgot password error:', error.response?.data || error.message);
      throw error;
    }
  },

  resetPassword: async (data: { email: string; code: string; password: string }) => {
    try {
      const response = await api.post('/reset-password', data);
      console.log('Reset password response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('Reset password error:', error.response?.data || error.message);
      throw error;
    }
  },

  socialLogin: async (data: { provider: string; email?: string; name?: string }) => {
    try {
      const response = await api.post('/login/social', data);
      console.log('Social login response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('Social login error:', error.response?.data || error.message);
      throw error;
    }
  },
};

export const searchAPI = {
  search: async (identifier: string, keyword: string) => {
    try {
      const response = await api.get('/search', {
        params: { identifier, keyword },
      });
      console.log('Search response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('Search error:', error.response?.data || error.message);
      throw error;
    }
  },

  getTrending: async () => {
    try {
      const response = await api.get('/search/trending');
      console.log('Trending response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('Trending error:', error.response?.data || error.message);
      throw error;
    }
  },

  getHistory: async (identifier: string) => {
    try {
      const response = await api.get('/search/history', {
        params: { identifier },
      });
      console.log('Search history response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('Search history error:', error.response?.data || error.message);
      throw error;
    }
  },

  visualScan: async () => {
    try {
      const response = await api.post('/search/visual');
      console.log('Visual scan response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('Visual scan error:', error.response?.data || error.message);
      throw error;
    }
  },
};

export const creatorAPI = {
  getStats: async () => {
    try {
      const response = await api.get('/creator/stats');
      console.log('Creator stats response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('Creator stats error:', error.response?.data || error.message);
      throw error;
    }
  },

  getMessages: async () => {
    try {
      const response = await api.get('/creator/messages');
      console.log('Creator messages response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('Creator messages error:', error.response?.data || error.message);
      throw error;
    }
  },

  uploadMessage: async (data: {
    title: string;
    description?: string;
    speaker?: string;
    full_url?: string;
    duration?: string;
    audio_base64?: string;
    image_base64?: string;
    keywords: string;
    content?: string;
  }) => {
    try {
      const response = await api.post('/creator/upload', data);
      console.log('Upload message response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('Upload message error:', error.response?.data || error.message);
      throw error;
    }
  },
};

export const libraryAPI = {
  getBookmarks: async () => {
    try {
      const response = await api.get('/bookmarks');
      console.log('Bookmarks response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('Bookmarks error:', error.response?.data || error.message);
      throw error;
    }
  },

  toggleBookmark: async (snippetId: number) => {
    try {
      const response = await api.post(`/snippets/${snippetId}/bookmark`);
      console.log('Toggle bookmark response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('Toggle bookmark error:', error.response?.data || error.message);
      throw error;
    }
  },

  getStatus: async () => {
    try {
      const response = await api.get('/library/status');
      console.log('Library status response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('Library status error:', error.response?.data || error.message);
      throw error;
    }
  },
};

export const dailyWordAPI = {
  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      console.log('Categories response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('Categories error:', error.response?.data || error.message);
      throw error;
    }
  },

  setPreferences: async (identifier: string, categories: number[]) => {
    try {
      const response = await api.post('/preferences', { identifier, categories });
      console.log('Set preferences response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('Set preferences error:', error.response?.data || error.message);
      throw error;
    }
  },

  getToday: async (identifier: string) => {
    try {
      const response = await api.get('/daily-word', {
        params: { identifier },
      });
      console.log('Daily word response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('Daily word error:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default api;