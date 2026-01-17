import { supabase } from '../../lib/supabaseClient';
import type { AppState, UserSlice } from '../types';
import type { StateCreator } from 'zustand';

export const createUserSlice: StateCreator<AppState, [], [], UserSlice> = (set, get) => ({
  userInfo: null,
  attendanceStats: { percentage: 0, trend: 0, totalSongs: 0 },

  setUserInfo: (info) => set({ userInfo: info }),

  fetchUserInfo: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, group_role')
          .eq('id', session.user.id)
          .single();

        if (!error && data) {
          set({
            userInfo: {
              id: data.id,
              full_name: data.full_name || 'Usuario',
              avatar_url: data.avatar_url,
              group_role: data.group_role || 'Miembro',
            },
          });
          // Aquí llamamos a otra función del slice (o de otro slice si fuera necesario)
          get().fetchAttendanceStats();
        }
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  },

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
        set({ attendanceStats: { percentage: 0, trend: 0, totalSongs: songCount || 0 } });
        return;
      }

      const totalEventsRegistered = attendanceData.length;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalPresent = attendanceData.filter((r: any) => r.status === true).length;
      const percentage = totalEventsRegistered > 0 ? Math.round((totalPresent / totalEventsRegistered) * 100) : 0;

      set({ attendanceStats: { percentage, trend: 0, totalSongs: songCount || 0 } });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  },
});