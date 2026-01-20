import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAppStore } from '@/store/useAppStore';
import type { ActivityEvent } from '../types';

export const useEventDetails = (
  event: ActivityEvent | null,
  onRefresh: () => void,
  onClose: () => void
) => {
  const members = useAppStore((state) => state.members);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Lógica para obtener nombres de forma segura
  const getMemberName = (uuid?: string) => {
    if (!uuid) return 'Usuario desconocido';
    const found = members.find((m) => m.id === uuid);
    return found ? found.full_name : 'Usuario desconocido';
  };

  // 2. Lógica de Eliminación
  const handleDelete = async () => {
    if (!event) return;
    
    // Usamos window.confirm por simplicidad, pero podrías usar un modal de confirmación custom
    if (!window.confirm("¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.")) {
      return;
    }

    setIsDeleting(true);

    try {
      const { error } = await supabase.from('activities').delete().eq('id', event.id);
      
      if (error) throw error;
      
      onRefresh(); // Recargamos el calendario
      onClose();   // Cerramos el modal
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar el evento: " + (error.message || 'Error desconocido'));
    } finally {
      setIsDeleting(false);
    }
  };

  return { 
    isDeleting, 
    handleDelete, 
    getMemberName 
  };
};