import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { ActivityEvent } from '../types';

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('activities').select('*');
      
      if (error) throw error;

      const formattedEvents: ActivityEvent[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        start: new Date(item.event_date),
        // Si no hay fecha fin, asumimos 1 hora después
        end: item.end_date ? new Date(item.end_date) : new Date(new Date(item.event_date).getTime() + 60*60*1000),
        color: item.color || '#2dd4bf',
        created_by: item.created_by,
        updated_by: item.updated_by,
        resource: { 
          location: item.location, 
          description: item.description 
        }
      }));

      setEvents(formattedEvents);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, refreshEvents: fetchEvents };
};