import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HistoryItem } from '../types';

interface HistoryState {
  items: HistoryItem[];
  addItem: (item: HistoryItem) => void;
  removeItem: (id: string) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item) =>
        set((state) => ({
          items: [item, ...state.items.filter((i) => i.url !== item.url)].slice(0, 50),
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      clearHistory: () => set({ items: [] }),
    }),
    {
      name: 'mediastream_history',
    }
  )
);
