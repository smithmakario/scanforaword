import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.18.6:8000/api';

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
    const response = await api.post('/register', data);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/login', { email, password });
    return response.data;
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