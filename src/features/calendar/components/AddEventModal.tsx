import { ModalLayout } from '@/components/ui/ModalLayout'; // Asegúrate de tener este componente
import { Edit3, Calendar as CalIcon, Save, Palette, Clock, ArrowRight, MapPin, AlignLeft, Check } from 'lucide-react';
import { useEventForm } from '../hooks/useEventForm';
import { PRESET_COLORS, type ActivityEvent } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  eventToEdit?: ActivityEvent | null;
}

const AddEventModal = ({ isOpen, onClose, onRefresh, eventToEdit }: Props) => {
  // 1. Delegamos toda la lógica al Hook
  const { 
    formData, 
    loading, 
    handleChange, 
    handleColorSelect, 
    handleSubmit 
  } = useEventForm(isOpen, () => { onRefresh(); onClose(); }, eventToEdit);

  // 2. Renderizado Limpio
  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={onClose}
      title={eventToEdit ? 'Editar Actividad' : 'Nueva Actividad'}
      themeColor={formData.color}
      icon={eventToEdit ? <Edit3 size={24} /> : <CalIcon size={24} />}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* A. Título */}
          <div className="space-y-3">
            <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Título del Evento</label>
                <input 
                  required 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange}
                  style={{ '--tw-ring-color': formData.color } as React.CSSProperties}
                  className="w-full mt-1 bg-white/40 border border-white/50 text-slate-800 placeholder:text-slate-400 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:bg-white/60 transition-all backdrop-blur-sm"
                  placeholder="Ej. Ensayo General" 
                />
            </div>

            {/* B. Selector de Color */}
            <div className="flex items-center gap-3 pl-1">
                <span className="text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1"><Palette size={10} /> Color:</span>
                <div className="flex gap-2">
                    {PRESET_COLORS.map((preset) => (
                        <button 
                          key={preset.hex} 
                          type="button" 
                          onClick={() => handleColorSelect(preset.hex)}
                          title={preset.label}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${formData.color === preset.hex ? 'scale-110 ring-2 ring-offset-1 ring-slate-300' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                          style={{ backgroundColor: preset.hex }}
                        >
                            {formData.color === preset.hex && <Check size={12} className="text-white" strokeWidth={4} />}
                        </button>
                    ))}
                </div>
            </div>
          </div>

          {/* C. Fechas (Grid) */}
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

          {/* D. Ubicación */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1 flex gap-1 items-center"><MapPin size={12}/> Ubicación</label>
            <input name="location" value={formData.location} onChange={handleChange} style={{ '--tw-ring-color': formData.color } as React.CSSProperties} className="w-full mt-1 bg-white/70 border border-white/50 text-slate-800 rounded-xl px-4 py-2 outline-none focus:ring-2 transition-all" placeholder="Ej. Auditorio Principal" />
          </div>

          {/* E. Detalles */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1 flex gap-1 items-center"><AlignLeft size={12}/> Detalles</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} style={{ '--tw-ring-color': formData.color } as React.CSSProperties} className="w-full mt-1 bg-white/70 border border-white/50 text-slate-800 rounded-xl px-4 py-2 outline-none focus:ring-2 transition-all resize-none" placeholder="Notas adicionales..." />
          </div>

          {/* F. Botón Submit */}
          <button disabled={loading} type="submit" style={{ backgroundColor: formData.color }} className="w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:brightness-110 active:scale-[0.98] flex justify-center items-center gap-2 mt-2">
            {loading ? 'Guardando...' : <><Save size={18} /> {eventToEdit ? 'Actualizar Evento' : 'Guardar Actividad'}</>}
          </button>
      </form>
    </ModalLayout>
  );
};

export default AddEventModal;