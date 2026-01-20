import { supabase } from '@/lib/supabaseClient'; 
import { useEffect, useState } from 'react';
import type { Activity } from '../types'; 

export const useUpcomingEvents = () => {
  const [events, setEvents] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const todayISO = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
          .from('activities')
          .select('id, title, event_date, location, color')
          .gte('event_date', todayISO)
          .order('event_date', { ascending: true })
          .limit(5);

        if (error) throw error;

        if (data) {
          setEvents(data as Activity[]); 
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  return { events, loading };
};