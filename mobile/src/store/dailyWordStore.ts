import { create } from 'zustand';
import { dailyWordAPI } from '../services/api';

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface DailyWord {
  id: number;
  scheduled_for: string;
  snippet?: {
    id: number;
    title: string;
    content: string;
    message?: {
      id: number;
      title: string;
      speaker: string;
      duration: string;
      full_url: string;
    };
  };
}

interface DailyWordState {
  categories: Category[];
  userPreferences: number[];
  todayWord: DailyWord | null;
  isLoading: boolean;
  error: string | null;
  
  fetchCategories: () => Promise<void>;
  setPreferences: (identifier: string, categories: number[]) => Promise<boolean>;
  fetchTodayWord: (identifier: string) => Promise<void>;
  clearError: () => void;
}

export const useDailyWordStore = create<DailyWordState>((set) => ({
  categories: [],
  userPreferences: [],
  todayWord: null,
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    try {
      const response = await dailyWordAPI.getCategories();
      if (response.status === 'success') {
        set({ categories: response.data || [] });
      }
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
    }
  },

  setPreferences: async (identifier: string, categories: number[]) => {
    set({ isLoading: true, error: null });
    try {
      const response = await dailyWordAPI.setPreferences(identifier, categories);
      if (response.status === 'success') {
        set({ userPreferences: categories, isLoading: false });
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to save preferences.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  fetchTodayWord: async (identifier: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await dailyWordAPI.getToday(identifier);
      if (response.status === 'success') {
        set({ todayWord: response.data, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to load daily word.';
      set({ error: message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));