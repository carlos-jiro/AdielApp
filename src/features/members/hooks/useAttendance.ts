/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export function useAttendance() {
  const [activities, setActivities] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: activitiesData } = await supabase
        .from('activities')
        .select('id, title, event_date')
        .order('event_date', { ascending: false });

      setActivities(activitiesData || []);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .order('full_name');

      setMembers(profiles || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  const fetchAttendanceForActivity = async (activityId?: string) => {
    if (!activityId) return;
    setLoadingAttendance(true);
    try {
      const { data } = await supabase
        .from('attendance')
        .select('user_id, status')
        .eq('activity_id', activityId);

      const map: Record<string, boolean> = {};
      members.forEach((m) => (map[m.id] = false));
      data?.forEach((record: any) => {
        map[record.user_id] = record.status;
      });

      setAttendanceMap(map);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const toggle = (userId: string) => setAttendanceMap((p) => ({ ...p, [userId]: !p[userId] }));

  const save = async (activityId?: string) => {
    if (!activityId) throw new Error('activityId required');
    const updates = Object.entries(attendanceMap).map(([userId, status]) => ({
      activity_id: activityId,
      user_id: userId,
      status,
    }));

    const { error } = await supabase.from('attendance').upsert(updates, { onConflict: 'activity_id, user_id' });
    if (error) throw error;
    return true;
  };

  return {
    activities,
    members,
    attendanceMap,
    loading,
    loadingAttendance,
    error,
    fetchInitial,
    fetchAttendanceForActivity,
    toggle,
    save,
    setAttendanceMap,
    setMembers,
  } as const;
}
