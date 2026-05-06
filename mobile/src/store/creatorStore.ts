import { create } from 'zustand';
import { creatorAPI } from '../services/api';

interface CreatorStats {
  uploads: number;
  listens: number;
  keyword_matches: number;
  peak_time: string;
  engagement: number;
}

interface CreatorMessage {
  id: number;
  title: string;
  description?: string;
  speaker?: string;
  content?: string;
  full_url?: string;
  duration?: string;
  status: string;
  created_at: string;
  keywords?: { id: number; name: string }[];
}

interface CreatorState {
  stats: CreatorStats | null;
  messages: CreatorMessage[];
  isLoading: boolean;
  error: string | null;
  
  fetchStats: () => Promise<void>;
  fetchMessages: () => Promise<void>;
  uploadMessage: (data: {
    title: string;
    description?: string;
    speaker?: string;
    full_url?: string;
    duration?: string;
    audio_base64?: string;
    image_base64?: string;
    keywords: string;
    content?: string;
  }) => Promise<boolean>;
  clearError: () => void;
}

export const useCreatorStore = create<CreatorState>((set) => ({
  stats: null,
  messages: [],
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await creatorAPI.getStats();
      if (response.status === 'success') {
        set({ stats: response.data, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to load creator stats.';
      set({ error: message, isLoading: false });
    }
  },

  fetchMessages: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await creatorAPI.getMessages();
      if (response.status === 'success') {
        set({ messages: response.data || [], isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to load messages.';
      set({ error: message, isLoading: false });
    }
  },

  uploadMessage: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await creatorAPI.uploadMessage(data);
      if (response.status === 'success') {
        set({ isLoading: false });
        return true;
      }
      set({ isLoading: false, error: response.message || 'Upload failed' });
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data?.error || 'Failed to upload message. Please try again.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));