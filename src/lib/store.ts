import { create } from 'zustand';
import { supabase } from './supabaseClient';
import type { Song } from './types'; 

// --- Interfaces Locales ---

interface GroupInfo {
  name: string;
  logo_url: string | null;
}

interface UserInfo {
  id: string; // <-- Agregamos ID aquí para usarlo en las queries
  full_name: string;
  avatar_url: string | null;
  group_role: string;
}

interface MemberProfile {
  id: string;
  full_name: string;
}

// Nueva interfaz para estadísticas
interface AttendanceStats {
  percentage: number;
  trend: number; // Diferencia con el mes anterior (positivo o negativo)
  totalSongs: number; // Total de cantos en la DB (dato simple)
}

interface AppState {
  // --- Estado General ---
  loading: boolean;

  // --- Estado del Grupo ---
  groupInfo: GroupInfo | null;
  fetchGroupInfo: () => Promise<void>;
  setGroupInfo: (info: GroupInfo) => void;

  // --- Estado del Usuario Logueado (Mi perfil) ---
  userInfo: UserInfo | null;
  fetchUserInfo: () => Promise<void>;
  setUserInfo: (info: UserInfo) => void;

  // --- Estado de Miembros ---
  members: MemberProfile[];
  fetchMembers: () => Promise<void>;

  // --- Estado de Cantos ---
  songs: Song[];
  fetchSongs: () => Promise<void>;

  // --- NUEVO: Estado de Estadísticas de Rendimiento ---
  attendanceStats: AttendanceStats;
  fetchAttendanceStats: () => Promise<void>;
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
            id: data.id, // Guardamos el ID
            full_name: data.full_name || 'Usuario',
            avatar_url: data.avatar_url,
            group_role: data.group_role || 'Miembro'
          }});
          // Una vez que tenemos el usuario, cargamos sus estadísticas
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

  // 5. NUEVO: Estadísticas de Rendimiento
  attendanceStats: { percentage: 0, trend: 0, totalSongs: 0 },
  fetchAttendanceStats: async () => {
    const user = get().userInfo;
    if (!user) return;

    try {
      // A. Obtener Total de Cantos (Dato fácil)
      const { count: songCount } = await supabase.from('songs').select('*', { count: 'exact', head: true });

      // B. Calcular Asistencia del Usuario
      // Traemos TODAS las asistencias del usuario donde status = true
      const { data: attendanceData, error } = await supabase
        .from('attendance')
        .select(`
            status,
            activities (event_date)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      if (!attendanceData || attendanceData.length === 0) {
          set({ attendanceStats: { percentage: 0, trend: 0, totalSongs: songCount || 0 }});
          return;
      }

      // Filtrar y calcular
      // 1. Total de eventos en los que se registró asistencia (presente o ausente)
      //    (Asumimos que si hay registro en 'attendance' es porque se tomó lista)
      const totalEventsRegistered = attendanceData.length;
      
      // 2. Total de asistencias (status = true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalPresent = attendanceData.filter((r: any) => r.status === true).length;

      // 3. Porcentaje Global
      const percentage = totalEventsRegistered > 0 
        ? Math.round((totalPresent / totalEventsRegistered) * 100) 
        : 0;

      // 4. Tendencia (Simulada por ahora o cálculo complejo de mes actual vs anterior)
      // Para simplificar y no hacer queries complejas de fechas ahora, dejaremos trend en 0 o random pequeño
      const trend = 0; 

      set({ attendanceStats: { 
        percentage, 
        trend, 
        totalSongs: songCount || 0 
      }});

    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }
}));