import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, Calendar as CalIcon, MapPin, Clock, AlignLeft, Save, ArrowRight, Palette, Check, Edit3 } from 'lucide-react';
import { format } from 'date-fns';

// 1. Necesitamos la interfaz del evento para tipar la prop
interface ActivityEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  resource: { location: string; description: string };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  eventToEdit?: ActivityEvent | null; // <--- NUEVA PROP
}

const PRESET_COLORS = [
  { hex: '#2dd4bf', label: 'Sistema' },
  { hex: '#ef4444', label: 'Urgente' },
  { hex: '#3b82f6', label: 'Trabajo' },
  { hex: '#f59e0b', label: 'Atención' },
  { hex: '#8b5cf6', label: 'Especial' }
];

const AddEventModal = ({ isOpen, onClose, onRefresh, eventToEdit }: Props) => {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    startDate: '', 
    startTime: '', 
    endDate: '',   
    endTime: '',   
    location: '',
    description: '',
    color: '#2dd4bf'
  });

  // 2. EFECTO: Detectar si estamos editando o creando
  useEffect(() => {
    if (isOpen) {
      if (eventToEdit) {
        // --- MODO EDICIÓN: Cargar datos ---
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
        // --- MODO CREACIÓN: Resetear formulario ---
        setFormData({
            title: '', startDate: '', startTime: '', endDate: '', endTime: '', location: '', description: '', color: '#2dd4bf'
        });
      }
    }
  }, [isOpen, eventToEdit]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleColorSelect = (color: string) => {
    setFormData({ ...formData, color });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) throw new Error("Debes iniciar sesión");

      // Construcción de fechas (Igual que antes)
      if (!formData.startDate || !formData.startTime) throw new Error("Fecha inicio requerida");
      
      const startDate = new Date(`${formData.startDate}T${formData.startTime}`);
      let endDate: Date;
      
      if (formData.endDate && formData.endTime) {
        endDate = new Date(`${formData.endDate}T${formData.endTime}`);
      } else if (!formData.endDate && formData.endTime) {
        endDate = new Date(`${formData.startDate}T${formData.endTime}`);
      } else {
        endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      }

      if (endDate <= startDate) throw new Error("La fecha fin debe ser mayor al inicio");

      // Objeto base de datos
      const eventPayload = {
        title: formData.title,
        event_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        location: formData.location,
        description: formData.description,
        color: formData.color,
        modified_by: session.user.id // Siempre actualizamos quién modificó
      };

      let error;

      if (eventToEdit) {
        // --- A. ACTUALIZAR REGISTRO EXISTENTE ---
        const { error: updateError } = await supabase
          .from('activities')
          .update(eventPayload)
          .eq('id', eventToEdit.id); // ¡Importante el ID!
        error = updateError;
      } else {
        // --- B. CREAR NUEVO REGISTRO ---
        const { error: insertError } = await supabase
          .from('activities')
          .insert({
            ...eventPayload,
            created_by: session.user.id // Solo al crear
          });
        error = insertError;
      }

      if (error) throw error;

      onRefresh();
      onClose(); 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(error.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-70 p-4 animate-in fade-in duration-200">
      
      <div className="w-full max-w-lg glass rounded-3xl p-8 bg-white/80 relative shadow-2xl animate-in zoom-in-95 duration-200 border border-white/20 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
        
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-900/40 hover:text-slate-800 transition-colors">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
          <div className="p-2 bg-white/70 rounded-xl transition-colors duration-300" style={{ color: formData.color }}>
             {/* Cambiamos el icono según el modo */}
             {eventToEdit ? <Edit3 size={24} /> : <CalIcon size={24} />}
          </div>
          {/* Cambiamos el título según el modo */}
          <span className="text-slate-700 ml-1">
            {eventToEdit ? 'Editar Actividad' : 'Nueva Actividad'}
          </span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
            {/* ... EL RESTO DEL FORMULARIO SIGUE EXACTAMENTE IGUAL ... */}
            {/* Solo pego los inputs para ahorrar espacio, usa el mismo JSX que ya tenías dentro del form */}
            
            <div className="space-y-3">
            <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Título del Evento</label>
                <input required name="title" value={formData.title} onChange={handleChange}
                style={{ '--tw-ring-color': formData.color } as React.CSSProperties}
                className="w-full mt-1 bg-white/40 border border-white/50 text-slate-800 placeholder:text-slate-400 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:bg-white/60 transition-all backdrop-blur-sm"
                placeholder="Ej. Ensayo General" />
            </div>

            <div className="flex items-center gap-3 pl-1">
                <span className="text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1"><Palette size={10} /> Color:</span>
                <div className="flex gap-2">
                    {PRESET_COLORS.map((preset) => (
                        <button key={preset.hex} type="button" onClick={() => handleColorSelect(preset.hex)}
                            title={preset.label}
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${formData.color === preset.hex ? 'scale-110 ring-2 ring-offset-1 ring-slate-300' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                            style={{ backgroundColor: preset.hex }}>
                            {formData.color === preset.hex && <Check size={12} className="text-white" strokeWidth={4} />}
                        </button>
                    ))}
                </div>
            </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider ml-1 flex gap-1 items-center" style={{ color: formData.color }}><Clock size={14}/> Inicia</label>
                <input required type="date" name="startDate" value={formData.startDate} onChange={handleChange} style={{ '--tw-ring-color': formData.color } as React.CSSProperties} className="w-full bg-white/70 border border-white/50 text-slate-700 rounded-xl px-3 py-2 outline-none focus:ring-2 text-sm" />
                <input required type="time" name="startTime" value={formData.startTime} onChange={handleChange} style={{ '--tw-ring-color': formData.color } as React.CSSProperties} className="w-full bg-white/70 border border-white/50 text-slate-700 rounded-xl px-3 py-2 outline-none focus:ring-2 text-sm" />
            </div>
            <div className="space-y-2 relative">
                <label className="text-xs font-bold text-slate-400 uppercase flex gap-1 items-center ml-1"><ArrowRight size={14}/> Termina (Opcional)</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} min={formData.startDate} className="w-full bg-white/70 border border-white/30 text-slate-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400 text-sm" />
                <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full bg-white/70 border border-white/30 text-slate-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400 text-sm" />
            </div>
            </div>

            <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1 flex gap-1 items-center"><MapPin size={12}/> Ubicación</label>
            <input name="location" value={formData.location} onChange={handleChange} style={{ '--tw-ring-color': formData.color } as React.CSSProperties} className="w-full mt-1 bg-white/70 border border-white/50 text-slate-800 rounded-xl px-4 py-2 outline-none focus:ring-2 transition-all" placeholder="Ej. Auditorio Principal" />
            </div>

            <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1 flex gap-1 items-center"><AlignLeft size={12}/> Detalles</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} style={{ '--tw-ring-color': formData.color } as React.CSSProperties} className="w-full mt-1 bg-white/70 border border-white/50 text-slate-800 rounded-xl px-4 py-2 outline-none focus:ring-2 transition-all resize-none" placeholder="Notas adicionales..." />
            </div>

            <button disabled={loading} type="submit" style={{ backgroundColor: formData.color }} className="w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:brightness-110 active:scale-[0.98] flex justify-center items-center gap-2 mt-2">
                {loading ? 'Guardando...' : <><Save size={18} /> {eventToEdit ? 'Actualizar Evento' : 'Guardar Actividad'}</>}
            </button>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;
