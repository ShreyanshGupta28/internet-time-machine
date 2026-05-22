import { create } from 'zustand'
import { Snapshot } from '@/types/domain'

interface TimelineState {
  snapshots: Snapshot[];
  currentIndex: number;
  isPlaying: boolean;
  setSnapshots: (snapshots: Snapshot[]) => void;
  setCurrentIndex: (index: number) => void;
  next: () => void;
  prev: () => void;
  togglePlay: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
}

export const useTimelineStore = create<TimelineState>((set) => ({
  snapshots: [],
  currentIndex: 0,
  isPlaying: false,
  setSnapshots: (snapshots) => set({ snapshots, currentIndex: 0, isPlaying: false }),
  setCurrentIndex: (index) => set((state) => {
    if (state.snapshots.length === 0) return { currentIndex: 0 };
    const clampedIndex = Math.max(0, Math.min(index, state.snapshots.length - 1));
    return { currentIndex: clampedIndex };
  }),
  next: () => set((state) => {
    if (state.snapshots.length === 0) return {};
    const nextIndex = (state.currentIndex + 1) % state.snapshots.length;
    return { currentIndex: nextIndex };
  }),
  prev: () => set((state) => {
    if (state.snapshots.length === 0) return {};
    const prevIndex = (state.currentIndex - 1 + state.snapshots.length) % state.snapshots.length;
    return { currentIndex: prevIndex };
  }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setIsPlaying: (isPlaying) => set({ isPlaying })
}))
export default useTimelineStore;
