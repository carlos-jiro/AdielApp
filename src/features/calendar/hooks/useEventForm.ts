import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';
import type { ActivityEvent, EventFormData } from '../types';

const INITIAL_STATE: EventFormData = {
  title: '', startDate: '', startTime: '', endDate: '', endTime: '', 
  location: '', description: '', color: '#2dd4bf'
};

export const useEventForm = (
  isOpen: boolean, 
  onSuccess: () => void, 
  eventToEdit?: ActivityEvent | null
) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EventFormData>(INITIAL_STATE);

  // 1. Efecto para Cargar/Resetear datos
  useEffect(() => {
    if (!isOpen) return;

    if (eventToEdit) {
      setFormData({
        title: eventToEdit.title,
        startDate: format(eventToEdit.start, 'yyyy-MM-dd'),
        startTime: format(eventToEdit.start, 'HH:mm'),
        endDate: format(eventToEdit.end, 'yyyy-MM-dd'),
        endTime: format(eventToEdit.end, 'HH:mm'),
        location: eventToEdit.resource.location || '',
        description: eventToEdit.resource.description || '',
        color: eventToEdit.color || '#2dd4bf'
      });
    } else {
      setFormData(INITIAL_STATE);
    }
  }, [isOpen, eventToEdit]);

  // 2. Handlers de UI
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
  };

  // 3. Lógica de Negocio (Submit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) throw new Error("Debes iniciar sesión");
      if (!formData.startDate || !formData.startTime) throw new Error("Fecha inicio requerida");

      // Construcción de fechas ISO
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      let endDateTime: Date;

      if (formData.endDate && formData.endTime) {
        endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      } else {
        // Default: 1 hora después
        endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
      }

      if (endDateTime <= startDateTime) throw new Error("La fecha fin debe ser mayor al inicio");

      const payload = {
        title: formData.title,
        event_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        location: formData.location,
        description: formData.description,
        color: formData.color,
        modified_by: session.user.id
      };

      if (eventToEdit) {
        const { error } = await supabase.from('activities').update(payload).eq('id', eventToEdit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('activities').insert({ ...payload, created_by: session.user.id });
        if (error) throw error;
      }

      onSuccess(); // Notificamos al padre para que refresque y cierre
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(error.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return { formData, loading, handleChange, handleColorSelect, handleSubmit };
};