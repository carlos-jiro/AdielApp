import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, Calendar as CalIcon, MapPin, Clock, AlignLeft, Save } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const AddEventModal = ({ isOpen, onClose, onRefresh }: Props) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    start: '',
    end: '',
    location: '',
    description: ''
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Verificar sesión
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Debes iniciar sesión");

      // 2. Validación simple de fechas
      const startDate = new Date(formData.start);
      // Si no puso fecha fin, sumamos 1 hora por defecto
      const endDate = formData.end ? new Date(formData.end) : new Date(startDate.getTime() + 60 * 60 * 1000);

      if (endDate <= startDate) throw new Error("La fecha de fin debe ser después del inicio");

      // 3. Insertar en Supabase
      const { error } = await supabase.from('activities').insert({
        title: formData.title,
        event_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        location: formData.location,
        description: formData.description,
        // created_by: session.user.id  <-- Descomenta esto cuando quieras guardar el usuario
      });

      if (error) throw error;

      onRefresh();
      onClose();
      setFormData({ title: '', start: '', end: '', location: '', description: '' }); // Limpiar
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(error.message || "Error al guardar evento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="glass w-full max-w-lg rounded-3xl p-8 relative shadow-2xl animate-in zoom-in-95">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
          <CalIcon className="text-[#2dd4bf]" /> Nueva Actividad
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Título</label>
            <input required name="title" value={formData.title} onChange={handleChange}
              className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#2dd4bf]"
              placeholder="Ej. Ensayo General" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase flex gap-1"><Clock size={12}/> Inicio</label>
              <input required type="datetime-local" name="start" value={formData.start} onChange={handleChange}
                className="w-full bg-white/50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#2dd4bf]" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase flex gap-1"><Clock size={12}/> Fin (Opcional)</label>
              <input type="datetime-local" name="end" value={formData.end} onChange={handleChange}
                className="w-full bg-white/50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#2dd4bf]" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase flex gap-1"><MapPin size={12}/> Ubicación</label>
            <input name="location" value={formData.location} onChange={handleChange}
              className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#2dd4bf]"
              placeholder="Ej. Auditorio Principal" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase flex gap-1"><AlignLeft size={12}/> Descripción</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3}
              className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#2dd4bf]"
              placeholder="Detalles adicionales..." />
          </div>

          <button disabled={loading} type="submit" 
            className="w-full bg-[#2dd4bf] text-white font-bold py-3 rounded-xl hover:bg-[#26bba8] transition-all shadow-lg mt-2 flex justify-center items-center gap-2">
            {loading ? 'Guardando...' : <><Save size={18} /> Guardar Evento</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;