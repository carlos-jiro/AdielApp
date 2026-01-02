import { useState } from 'react';
import { useAppStore } from '../lib/store';
import { X, Plus, Search, Music } from 'lucide-react';
import type { Song } from '../lib/types'; // O tu interfaz de Song

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentProjectSongs: Song[]; // Para no mostrar las que ya están agregadas
  onAddSong: (songId: string) => void;
}

const AddExistingSongModal = ({ isOpen, onClose, currentProjectSongs, onAddSong }: Props) => {
  const allSongs = useAppStore((state) => state.songs);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  // 1. Filtramos: Que coincida con la búsqueda Y que no esté ya en el proyecto
  const availableSongs = allSongs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase());
    const isAlreadyInProject = currentProjectSongs.some(s => s.id === song.id);
    return matchesSearch && !isAlreadyInProject;
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="glass w-full max-w-lg rounded-3xl p-6 shadow-2xl flex flex-col max-h-[80vh]">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Plus className="text-[#2dd4bf]" /> Agregar del Repertorio
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* Buscador */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar canto..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#2dd4bf]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Lista de Canciones */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {availableSongs.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>No se encontraron cantos disponibles.</p>
            </div>
          ) : (
            availableSongs.map(song => (
              <div key={song.id} className="flex items-center justify-between p-3 hover:bg-white/60 rounded-xl border border-transparent hover:border-slate-100 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                    <Music size={14} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-sm">{song.title}</p>
                    <p className="text-xs text-slate-400">{song.author || 'Autor desconocido'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onAddSong(song.id)}
                  className="bg-[#2dd4bf] hover:bg-[#25b09f] text-white p-2 rounded-lg transition-colors shadow-sm"
                >
                  <Plus size={16} />
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default AddExistingSongModal;