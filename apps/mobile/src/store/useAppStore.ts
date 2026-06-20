import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Difficulty } from '@/design/tokens';

export type SavedHighlight = { id: string; quote: string; article: string; topic: string; date: string };

type AppState = {
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  highlights: SavedHighlight[];
  addHighlight: (h: Omit<SavedHighlight, 'id' | 'date'>) => void;
};

let seq = 0;

// App state persisted to the device (replaces the prototype's localStorage).
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      onboarded: false,
      setOnboarded: (v) => set({ onboarded: v }),
      difficulty: 'Medium',
      setDifficulty: (d) => set({ difficulty: d }),
      highlights: [],
      addHighlight: (h) =>
        set((s) => ({
          highlights: [{ ...h, id: `u${seq++}_${s.highlights.length}`, date: 'Today' }, ...s.highlights],
        })),
    }),
    { name: 'lumina-app', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
