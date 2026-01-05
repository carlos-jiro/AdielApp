import { create } from 'zustand';
import { supabase } from './supabaseClient';
import type { Song } from './types'; 

// --- Interfaces ---

interface GroupInfo {
  name: string;
  logo_url: string | null;
}

interface UserInfo {
  id: string; 
  full_name: string;
  avatar_url: string | null;
  group_role: string;
}

interface MemberProfile {
  id: string;
  full_name: string;
}

interface AttendanceStats {
  percentage: number;
  trend: number; 
  totalSongs: number; 
}

// Interfaz para el Reproductor
interface ActiveTrack {
  id: string;
  title: string;
  author: string;
  url: string; 
}

interface AppState {
  // --- Estado General ---
  loading: boolean;

  // --- Estado del Grupo ---
  groupInfo: GroupInfo | null;
  fetchGroupInfo: () => Promise<void>;
  setGroupInfo: (info: GroupInfo) => void;

  // --- Estado del Usuario ---
  userInfo: UserInfo | null;
  fetchUserInfo: () => Promise<void>;
  setUserInfo: (info: UserInfo) => void;

  // --- Estado de Miembros ---
  members: MemberProfile[];
  fetchMembers: () => Promise<void>;

  // --- Estado de Cantos ---
  songs: Song[];
  fetchSongs: () => Promise<void>;

  // --- Estadísticas ---
  attendanceStats: AttendanceStats;
  fetchAttendanceStats: () => Promise<void>;

  // --- REPRODUCTOR GLOBAL ---
  activeTrack: ActiveTrack | null;
  isPlaying: boolean;
  
  // Cola de Reproducción
  queue: ActiveTrack[];
  currentIndex: number;

  // Acciones del Reproductor
  playTrack: (track: ActiveTrack) => void; // Reproducir uno solo
  playQueue: (tracks: ActiveTrack[], startIndex?: number) => void; // Reproducir lista
  playNext: () => void;
  playPrevious: () => void;
  
  togglePlay: () => void;
  closePlayer: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  loading: false,

  // 1. Grupo
  groupInfo: null,
  fetchGroupInfo: async () => {
    try {
      const { data, error } = await supabase.from('group_info').select('name, logo_url').eq('id', 1).single();
      if (!error && data) set({ groupInfo: data });
    } catch (error) { console.error("Error fetching group info:", error); }
  },
  setGroupInfo: (info) => set({ groupInfo: info }),

  // 2. Usuario
  userInfo: null,
  fetchUserInfo: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase.from('profiles').select('id, full_name, avatar_url, group_role').eq('id', session.user.id).single();
        if (!error && data) {
          set({ userInfo: {
            id: data.id, 
            full_name: data.full_name || 'Usuario',
            avatar_url: data.avatar_url,
            group_role: data.group_role || 'Miembro'
          }});
          get().fetchAttendanceStats();
        }
      }
    } catch (error) { console.error("Error fetching user info:", error); }
  },
  setUserInfo: (info) => set({ userInfo: info }),

  // 3. Miembros
  members: [],
  fetchMembers: async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('id, full_name'); 
      if (!error && data) set({ members: data });
    } catch (error) { console.error("Error fetching members:", error); }
  },

  // 4. Cantos
  songs: [],
  fetchSongs: async () => {
    try {
      const { data, error } = await supabase.from('songs').select('*').order('title', { ascending: true });
      if (!error && data) set({ songs: data });
    } catch (error) { console.error("Error fetching songs:", error); }
  },

  // 5. Estadísticas
  attendanceStats: { percentage: 0, trend: 0, totalSongs: 0 },
  fetchAttendanceStats: async () => {
    const user = get().userInfo;
    if (!user) return;

    try {
      const { count: songCount } = await supabase.from('songs').select('*', { count: 'exact', head: true });
      const { data: attendanceData, error } = await supabase
        .from('attendance')
        .select(`status, activities (event_date)`)
        .eq('user_id', user.id);

      if (error) throw error;

      if (!attendanceData || attendanceData.length === 0) {
          set({ attendanceStats: { percentage: 0, trend: 0, totalSongs: songCount || 0 }});
          return;
      }

      const totalEventsRegistered = attendanceData.length;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalPresent = attendanceData.filter((r: any) => r.status === true).length;
      const percentage = totalEventsRegistered > 0 ? Math.round((totalPresent / totalEventsRegistered) * 100) : 0;

      set({ attendanceStats: { percentage, trend: 0, totalSongs: songCount || 0 }});
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  },

  // --- 6. LOGICA DEL REPRODUCTOR ---
  activeTrack: null,
  isPlaying: false,
  queue: [],
  currentIndex: -1,

  playTrack: (track) => {
    const current = get().activeTrack;
    if (current?.url === track.url) {
        set((state) => ({ isPlaying: !state.isPlaying }));
    } else {
        // Al reproducir uno solo, creamos una cola de 1 elemento
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

    const current = get().activeTrack;
    // Si es la misma canción, solo toggle play
    if (current?.url === trackToPlay.url) {
        set((state) => ({ isPlaying: !state.isPlaying }));
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
        // Fin de la lista
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
}));