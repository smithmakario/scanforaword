import { create } from 'zustand';
import { searchAPI } from '../services/api';

interface SearchResult {
  id: number;
  title: string;
  content: string;
  keyword: string;
  speaker?: string;
  duration?: string;
  full_url?: string;
}

interface SearchState {
  results: SearchResult[];
  trendingKeywords: string[];
  searchHistory: { id: number; keyword: string; created_at: string }[];
  isLoading: boolean;
  error: string | null;
  lastQuery: string | null;
  
  search: (identifier: string, keyword: string) => Promise<boolean>;
  fetchTrending: () => Promise<void>;
  fetchHistory: (identifier: string) => Promise<void>;
  visualScan: () => Promise<boolean>;
  clearResults: () => void;
  clearError: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  results: [],
  trendingKeywords: [],
  searchHistory: [],
  isLoading: false,
  error: null,
  lastQuery: null,

  search: async (identifier: string, keyword: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await searchAPI.search(identifier, keyword);
      if (response.status === 'success') {
        set({ 
          results: response.data || [], 
          lastQuery: keyword,
          isLoading: false 
        });
        return true;
      }
      set({ isLoading: false, error: 'Search failed' });
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Search failed. Please try again.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  fetchTrending: async () => {
    try {
      const response = await searchAPI.getTrending();
      if (response.status === 'success') {
        set({ trendingKeywords: response.data || [] });
      }
    } catch (error: any) {
      console.error('Failed to fetch trending:', error);
      set({ trendingKeywords: ['Faith', 'Hope', 'Love', 'Peace', 'Joy'] });
    }
  },

  fetchHistory: async (identifier: string) => {
    try {
      const response = await searchAPI.getHistory(identifier);
      if (response.status === 'success') {
        set({ searchHistory: response.data || [] });
      }
    } catch (error: any) {
      console.error('Failed to fetch search history:', error);
    }
  },

  visualScan: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await searchAPI.visualScan();
      if (response.status === 'success') {
        set({ 
          results: response.results || [],
          isLoading: false 
        });
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Visual scan failed.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  clearResults: () => set({ results: [], lastQuery: null }),
  clearError: () => set({ error: null }),
}));