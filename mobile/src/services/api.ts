import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.18.17:8000/api';

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
    await AsyncStorage.removeItem('auth_token');
  },

  verifyCode: async (code: string) => {
    const response = await api.post('/verify', { code });
    return response.data;
  },

  resendCode: async () => {
    const response = await api.post('/resend-code');
    return response.data;
  },
};

export default api;