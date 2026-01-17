import { supabase } from '../../lib/supabaseClient';
import type { AppState, DataSlice } from '../types';
import type { StateCreator } from 'zustand';

export const createDataSlice: StateCreator<AppState, [], [], DataSlice> = (set) => ({
  loading: false,
  groupInfo: null,
  members: [],
  songs: [],

  setGroupInfo: (info) => set({ groupInfo: info }),

  fetchGroupInfo: async () => {
    try {
      const { data, error } = await supabase.from('group_info').select('name, logo_url').eq('id', 1).single();
      if (!error && data) set({ groupInfo: data });
    } catch (error) {
      console.error("Error fetching group info:", error);
    }
  },

  fetchMembers: async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('id, full_name');
      if (!error && data) set({ members: data });
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  },

  fetchSongs: async () => {
    try {
      const { data, error } = await supabase.from('songs').select('*').order('title', { ascending: true });
      if (!error && data) set({ songs: data });
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
  },
});