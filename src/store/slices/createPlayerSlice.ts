import type { AppState, PlayerSlice } from '../types';
import type { StateCreator } from 'zustand';

export const createPlayerSlice: StateCreator<AppState, [], [], PlayerSlice> = (set, get) => ({
  activeTrack: null,
  isPlaying: false,
  queue: [],
  currentIndex: -1,

  playTrack: (track) => {
    const { activeTrack, isPlaying } = get();
    if (activeTrack?.url === track.url) {
      set({ isPlaying: !isPlaying });
    } else {
      set({ 
        activeTrack: track, 
        isPlaying: true, 
        queue: [track], 
        currentIndex: 0 
      });
    }
  },

  playQueue: (tracks, startIndex = 0) => {
    const trackToPlay = tracks[startIndex];
    if (!trackToPlay) return;
    const { activeTrack, isPlaying } = get();

    if (activeTrack?.url === trackToPlay.url) {
      set({ isPlaying: !isPlaying });
      return;
    }

    set({
      queue: tracks,
      currentIndex: startIndex,
      activeTrack: trackToPlay,
      isPlaying: true
    });
  },

  playNext: () => {
    const { queue, currentIndex } = get();
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      set({ 
        currentIndex: nextIndex, 
        activeTrack: queue[nextIndex], 
        isPlaying: true 
      });
    } else {
      set({ isPlaying: false });
    }
  },

  playPrevious: () => {
    const { queue, currentIndex } = get();
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      set({ 
        currentIndex: prevIndex, 
        activeTrack: queue[prevIndex], 
        isPlaying: true 
      });
    }
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  closePlayer: () => set({ activeTrack: null, isPlaying: false, queue: [], currentIndex: -1 }),
});