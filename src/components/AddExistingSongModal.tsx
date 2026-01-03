import { useState } from 'react';
import { useAppStore } from '../lib/store';
import { X, Plus, Search, Music, Disc } from 'lucide-react';
import type { Song } from '../lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentProjectSongs: Song[];
  onAddSong: (songId: string) => void;
}

const AddExistingSongModal = ({ isOpen, onClose, currentProjectSongs, onAddSong }: Props) => {
  const allSongs = useAppStore((state) => state.songs);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  // Filtramos: Que coincida con la búsqueda Y que no esté ya en el proyecto
  const availableSongs = allSongs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase());
    const isAlreadyInProject = currentProjectSongs.some(s => s.id === song.id);
    return matchesSearch && !isAlreadyInProject;
  });

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container (Estilo copiado de EventDetailsModal) */}
      <div className="relative glass w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-white/50 bg-white/80 flex flex-col max-h-[85vh]">
        
        {/* --- CABECERA --- */}
        <div className="flex justify-between items-start mb-6 gap-4 shrink-0">
          <div className="flex items-center gap-3">
            {/* Barra vertical de color (Estilo EventDetails) */}
            <div 
              className="w-1.5 h-8 rounded-full shrink-0 shadow-sm bg-[#2dd4bf]"
            ></div>
            <h3 className="text-2xl font-bold text-slate-800 leading-tight">
              Agregar del Repertorio
            </h3>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-all duration-200 hover:text-slate-900"
          >
            <X size={24} />
          </button>
        </div>

        {/* --- BUSCADOR (Estilizado para integrarse en el glassmorphism) --- */}
        <div className="relative mb-4 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-slate-400" size={18} />
            </div>
            <input 
                type="text" 
                placeholder="Buscar por título..." 
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/40 rounded-xl outline-none focus:ring-2 focus:ring-[#2dd4bf]/50 text-slate-700 placeholder-slate-400 transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
            />
        </div>

        {/* --- LISTA DE CANCIONES --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
          {availableSongs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
               <Disc size={32} className="opacity-20" />
               <p className="text-sm font-medium">No se encontraron cantos disponibles.</p>
            </div>
          ) : (
            availableSongs.map(song => (
              <div 
                key={song.id} 
                className="flex items-center justify-between p-3 rounded-xl bg-white/50 hover:bg-white/90 transition-all border border-white/40 shadow-sm group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {/* Icono con estilo de bloque (Copiado de los items del EventDetails) */}
                  <div className="p-2 rounded-lg relative overflow-hidden text-[#2dd4bf] shrink-0">
                    <div className="absolute inset-0 bg-current opacity-10"></div>
                    <Music size={20} className="relative z-10" />
                  </div>
                  
                  <div className="min-w-0">
                    <p className="font-bold text-slate-700 text-base truncate">{song.title}</p>
                    <p className="text-xs text-slate-500 font-medium truncate">
                        {song.author || 'Autor desconocido'}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => onAddSong(song.id)}
                  className="ml-3 bg-[#2dd4bf] hover:bg-[#25b09f] text-white p-2.5 rounded-xl transition-all shadow-md active:scale-95 shrink-0"
                  title="Agregar al proyecto"
                >
                  <Plus size={18} />
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