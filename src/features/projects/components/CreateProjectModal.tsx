import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const CreateProjectModal = ({ isOpen, onClose, onRefresh }: Props) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('projects')
        .insert([{ name: name.trim(), description: description.trim() }] );
      if (error) throw error;
      setName('');
      setDescription('');
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Error al guardar colección:', error);
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo crear la colección.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass w-full max-w-md rounded-3xl p-8 relative animate-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer">
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold mb-2 text-slate-800">Nueva colección</h2>
        <p className="mb-6 text-sm text-slate-500">Agrupa cantos para un ensayo, servicio o evento.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Nombre</label>
            <input 
              required
              className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#2dd4bf] outline-none transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Ensayo de Navidad"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Descripción <span className="font-normal text-slate-400">(opcional)</span></label>
            <textarea 
              className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#2dd4bf] outline-none transition-all h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="¿Para qué se usará esta colección?"
            />
          </div>
          {errorMessage && <p role="alert" className="rounded-lg border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">{errorMessage}</p>}
          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-[#2dd4bf] text-white font-bold py-3 rounded-xl shadow-lg shadow-[#2dd4bf]/30 hover:bg-[#26bba8] transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Creando...' : 'Crear colección'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
