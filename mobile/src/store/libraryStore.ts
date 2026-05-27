import { create } from 'zustand';
import { libraryAPI } from '../services/api';

interface Bookmark {
  id: number;
  snippet_id: number;
  user_id: number;
  created_at: string;
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

interface LibraryStatus {
  indexed_keywords: string[];
  summary: string;
}

interface LibraryState {
  bookmarks: Bookmark[];
  libraryStatus: LibraryStatus | null;
  isLoading: boolean;
  error: string | null;
  
  fetchBookmarks: () => Promise<void>;
  toggleBookmark: (snippetId: number) => Promise<boolean>;
  fetchStatus: () => Promise<void>;
  clearError: () => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  bookmarks: [],
  libraryStatus: null,
  isLoading: false,
  error: null,

  fetchBookmarks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await libraryAPI.getBookmarks();
      if (response.status === 'success') {
        set({ bookmarks: response.data || [], isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to load bookmarks.';
      set({ error: message, isLoading: false });
    }
  },

  toggleBookmark: async (snippetId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await libraryAPI.toggleBookmark(snippetId);
      if (response.status === 'success') {
        const { bookmarks } = get();
        const exists = bookmarks.some(b => b.snippet_id === snippetId);
        
        if (exists) {
          set({ 
            bookmarks: bookmarks.filter(b => b.snippet_id !== snippetId),
            isLoading: false 
          });
        } else {
          await get().fetchBookmarks();
        }
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to toggle bookmark.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  fetchStatus: async () => {
    try {
      const response = await libraryAPI.getStatus();
      if (response.status === 'success') {
        set({ libraryStatus: response.data });
      }
    } catch (error: any) {
      console.error('Failed to fetch library status:', error);
    }
  },

  clearError: () => set({ error: null }),
}));