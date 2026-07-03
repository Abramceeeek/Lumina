import { create } from 'zustand';

// Tiny transient-banner store for surfacing background failures (e.g. a cloud
// write that couldn't reach Supabase) that would otherwise fail silently. Data
// modules call `useBanner.getState().show(msg)` from outside React; the AppBanner
// component renders and auto-clears it.
type BannerState = {
  message: string | null;
  show: (message: string) => void;
  clear: () => void;
};

export const useBanner = create<BannerState>((set) => ({
  message: null,
  show: (message) => set({ message }),
  clear: () => set({ message: null }),
}));
