import { create } from 'zustand';
import { supabase } from './supabaseClient';
import type { Song } from './types'; // Asegúrate de que este archivo existe y tiene la interfaz Song

// --- Interfaces Locales ---

interface GroupInfo {
  name: string;
  logo_url: string | null;
}

interface UserInfo {
  full_name: string;
  avatar_url: string | null;
  group_role: string;
}

// NUEVA: Interfaz para la lista de miembros (para traducir ID -> Nombre)
interface MemberProfile {
  id: string;
  full_name: string;
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

  // --- NUEVO: Estado de Todos los Miembros (Directorio) ---
  // Se usa para saber quién creó o editó un evento
  members: MemberProfile[];
  fetchMembers: () => Promise<void>;

  // --- Estado de Cantos ---
  songs: Song[];
  fetchSongs: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  loading: false,

  // ------------------------------------------------------------------
  // 1. Lógica del Grupo (Logo, Nombre)
  // ------------------------------------------------------------------
  groupInfo: null,
  fetchGroupInfo: async () => {
    try {
      const { data, error } = await supabase
        .from('group_info')
        .select('name, logo_url')
        .eq('id', 1)
        .single();

      if (!error && data) {
        set({ groupInfo: data });
      }
    } catch (error) {
      console.error("Error fetching group info:", error);
    }
  },
  setGroupInfo: (info) => set({ groupInfo: info }),

  // ------------------------------------------------------------------
  // 2. Lógica del Usuario Actual (Sesión, Rol, Avatar)
  // ------------------------------------------------------------------
  userInfo: null,
  fetchUserInfo: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, group_role')
          .eq('id', session.user.id)
          .single();

        if (!error && data) {
          set({ userInfo: {
            full_name: data.full_name || 'Usuario',
            avatar_url: data.avatar_url,
            group_role: data.group_role || 'Miembro'
          }});
        }
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  },
  setUserInfo: (info) => set({ userInfo: info }),

  // ------------------------------------------------------------------
  // 3. NUEVO: Lógica de Miembros (Para cruzar datos ID -> Nombre)
  // ------------------------------------------------------------------
  members: [],
  fetchMembers: async () => {
    try {
      // Traemos solo lo necesario: ID y Nombre de todos los perfiles
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name'); 

      if (!error && data) {
        set({ members: data });
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  },

  // ------------------------------------------------------------------
  // 4. Lógica de Cantos (Repertorio)
  // ------------------------------------------------------------------
  songs: [],
  fetchSongs: async () => {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*') 
        .order('title', { ascending: true });

      if (error) throw error;
      
      if (data) {
        set({ songs: data });
      }
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
  }
}));

// import { create } from 'zustand';
// import { supabase } from './supabaseClient';
// import type { Song } from './types'; // <--- IMPORTANTE: Importamos la definición oficial

// // --- Interfaces Locales (Solo para lo que no esté en types.ts) ---
// interface GroupInfo {
//   name: string;
//   logo_url: string | null;
// }

// interface UserInfo {
//   full_name: string;
//   avatar_url: string | null;
//   group_role: string;
// }

// interface AppState {
//   // Estado del Grupo
//   groupInfo: GroupInfo | null;
//   fetchGroupInfo: () => Promise<void>;
//   setGroupInfo: (info: GroupInfo) => void;

//   // Estado del Usuario
//   userInfo: UserInfo | null;
//   fetchUserInfo: () => Promise<void>;
//   setUserInfo: (info: UserInfo) => void;

//   // Estado de Cantos
//   songs: Song[]; // Ahora usa la interfaz completa con order_index
//   fetchSongs: () => Promise<void>;

//   // Estado General
//   loading: boolean;
// }

// export const useAppStore = create<AppState>((set) => ({
//   loading: false,

//   // --- Lógica del Grupo ---
//   groupInfo: null,
//   fetchGroupInfo: async () => {
//     try {
//       const { data, error } = await supabase
//         .from('group_info')
//         .select('name, logo_url')
//         .eq('id', 1)
//         .single();

//       if (!error && data) {
//         set({ groupInfo: data });
//       }
//     } catch (error) {
//       console.error("Error fetching group info:", error);
//     }
//   },
//   setGroupInfo: (info) => set({ groupInfo: info }),

//   // --- Lógica del Usuario ---
//   userInfo: null,
//   fetchUserInfo: async () => {
//     try {
//       const { data: { session } } = await supabase.auth.getSession();
      
//       if (session) {
//         const { data, error } = await supabase
//           .from('profiles')
//           .select('full_name, avatar_url, group_role')
//           .eq('id', session.user.id)
//           .single();

//         if (!error && data) {
//           set({ userInfo: {
//             full_name: data.full_name || 'Usuario',
//             avatar_url: data.avatar_url,
//             group_role: data.group_role || 'Miembro'
//           }});
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching user info:", error);
//     }
//   },
//   setUserInfo: (info) => set({ userInfo: info }),

//   // --- Lógica de Cantos ---
//   songs: [],
//   fetchSongs: async () => {
//     try {
//       // Al usar select('*'), Supabase traerá 'order_index' automáticamente
//       // cumpliendo con la interfaz de types.ts
//       const { data, error } = await supabase
//         .from('songs')
//         .select('*') 
//         .order('title', { ascending: true });

//       if (error) throw error;
      
//       if (data) {
//         set({ songs: data });
//       }
//     } catch (error) {
//       console.error("Error fetching songs:", error);
//     }
//   }
// }));