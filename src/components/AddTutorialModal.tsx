import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, Youtube, Save } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const AddTutorialModal = ({ isOpen, onClose, onRefresh }: Props) => {
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [category, setCategory] = useState('Calentamiento'); // Valor por defecto
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Verificar sesión
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No hay sesión activa");

      // 2. Insertar en la tabla tutorials
      const { error } = await supabase
        .from('tutorials')
        .insert([{ 
          title, 
          video_url: videoUrl, 
          category 
        }]);

      if (error) throw error;

      onRefresh();
      onClose();
      // Limpiar formulario
      setTitle('');
      setVideoUrl('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(error.message || "Error al guardar el video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="glass w-full max-w-md rounded-3xl p-8 relative shadow-2xl animate-in zoom-in-95">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
          <Youtube className="text-red-500" /> Nuevo Video
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Título</label>
            <input 
              required
              className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-red-400"
              value={title} onChange={(e) => setTitle(e.target.value)} 
              placeholder="Ej. Ejercicios de respiración"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Link de YouTube</label>
            <input 
              required
              type="url"
              className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-red-400"
              value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} 
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Categoría</label>
            <select 
              className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-red-400"
              value={category} onChange={(e) => setCategory(e.target.value)}
            >
              <option>Calentamiento</option>
              <option>Técnica Vocal</option>
              <option>Teoría Musical</option>
              <option>Repertorio</option>
            </select>
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-all shadow-lg mt-2 flex justify-center items-center gap-2"
          >
            {loading ? 'Guardando...' : <><Save size={18} /> Guardar Video</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTutorialModal;