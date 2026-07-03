import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Difficulty, Focus } from '@/design/tokens';
import type { QuizQuestion, VocabItem, BranchOption } from '@lumina/shared';

export type SavedHighlight = { id: string; quote: string; article: string; topic: string; date: string };
export type DailyArticle = {
  date: string;
  topic: string;
  difficulty: Difficulty;
  title: string;
  body: string[];
  articleId?: string;
  note?: string; // provider note ("Personalized by Claude…") — the AI-content disclosure
  focus?: Focus;
  fieldId?: string;
  quiz?: QuizQuestion[];
  vocabulary?: VocabItem[];
  branches?: BranchOption[];
};

type AppState = {
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  fontSize: number;
  setFontSize: (n: number) => void;
  readWidth: number;
  setReadWidth: (n: number) => void;
  dailyArticle: DailyArticle | null;
  setDailyArticle: (a: DailyArticle) => void;
  nextTopic: string | null;
  setNextTopic: (t: string) => void;
  completedDate: string | null;
  setCompletedDate: (d: string) => void;
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
      fontSize: 18,
      setFontSize: (n) => set({ fontSize: n }),
      readWidth: 680,
      setReadWidth: (n) => set({ readWidth: n }),
      dailyArticle: null,
      setDailyArticle: (a) => set({ dailyArticle: a }),
      nextTopic: null,
      setNextTopic: (t) => set({ nextTopic: t }),
      completedDate: null,
      setCompletedDate: (d) => set({ completedDate: d }),
      highlights: [],
      addHighlight: (h) =>
        set((s) => ({
          highlights: [{ ...h, id: `u${seq++}_${s.highlights.length}`, date: 'Today' }, ...s.highlights],
        })),
    }),
    { name: 'lumina-app', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
