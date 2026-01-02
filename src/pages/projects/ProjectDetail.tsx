import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { Project, Song } from '../../lib/types';
import { ArrowLeft, Plus, Music as MusicIcon, ChevronRight, Unlink } from 'lucide-react';
import AddExistingSongModal from '../../components/AddExistingSongModal'; 

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal para agregar existente
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // --- 1. CARGA DE DATOS (Usando Tabla Pivote) ---
  async function fetchProjectData() {
    try {
      setLoading(true);
      
      // A. Datos del Proyecto
      const { data: projData, error: projError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projError) throw projError;
      setProject(projData);

      // B. Canciones vinculadas (Relación Muchos a Muchos)
      // Seleccionamos la tabla intermedia y hacemos JOIN con songs
      const { data: linkedSongsData, error: songsError } = await supabase
        .from('project_songs')
        .select(`
          song_id,
          songs:song_id (*)
        `)
        .eq('project_id', id);

      if (songsError) throw songsError;

      // Transformamos la data plana para que sea un array de Songs
      // Supabase devuelve: [{ songs: {id: 1, title: '...'} }, { songs: {id: 2...} }]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedSongs = linkedSongsData?.map((item: any) => item.songs) || [];
      
      // Ordenamos localmente por título (opcional)
      formattedSongs.sort((a: Song, b: Song) => a.title.localeCompare(b.title));
      
      setSongs(formattedSongs);

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) fetchProjectData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // --- 2. VINCULAR CANTO (Insertar en tabla pivote) ---
  const handleAddSongToProject = async (songId: string) => {
    try {
      const { error } = await supabase
        .from('project_songs')
        .insert({ project_id: id, song_id: songId });

      if (error) throw error;

      // Refrescamos la lista y cerramos modal
      fetchProjectData();
      // No cerramos el modal inmediatamente por si quiere agregar varias, 
      // pero actualizamos la lista 'songs' para que desaparezca del modal.
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert("Error al vincular: " + error.message);
    }
  };

  // --- 3. DESVINCULAR CANTO (Borrar de tabla pivote) ---
  const handleRemoveSongFromProject = async (songId: string) => {
    if (!window.confirm("¿Quitar este canto del proyecto? (El canto seguirá existiendo en el repertorio)")) return;

    try {
      const { error } = await supabase
        .from('project_songs')
        .delete()
        .match({ project_id: id, song_id: songId });

      if (error) throw error;

      // Actualización optimista local
      setSongs(prev => prev.filter(s => s.id !== songId));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert("Error al desvincular: " + error.message);
    }
  };

  if (loading) return <div className="p-20 text-center text-[#2dd4bf] animate-pulse">Cargando proyecto...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header y Navegación */}
      <Link to="/projects" className="flex items-center gap-2 text-slate-500 hover:text-[#2dd4bf] transition-colors mb-4 w-fit">
        <ArrowLeft size={20} /> Volver a Proyectos
      </Link>

      <div className="glass rounded-3xl p-8 mb-8 border-l-8 border-[#2dd4bf]">
        <h2 className="text-3xl font-bold text-slate-800">{project?.name}</h2>
        <p className="text-slate-500 mt-2">{project?.description}</p>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-slate-700">Lista de Cantos</h3>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#2dd4bf] text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-[#26bba8] transition-all cursor-pointer active:scale-95"
        >
          <Plus size={18} /> Asignar Canto
        </button>
      </div>
      
      {/* --- NUEVA TABLA (Estilo idéntico a Projects.tsx) --- */}
      <div className="glass rounded-3xl p-1 border border-slate-100 overflow-hidden shadow-sm">
        {songs.length === 0 ? (
          <div className="text-center p-16 border-dashed border-2 border-slate-300/50 m-4 rounded-2xl">
            <MusicIcon size={40} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">Este proyecto está vacío.</p>
            <button onClick={() => setIsAddModalOpen(true)} className="text-[#2dd4bf] font-bold hover:underline mt-2">
               Asignar cantos existentes
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-400 text-xs uppercase tracking-wider font-bold">
                  <th className="px-6 py-4 rounded-tl-2xl">Título</th>
                  <th className="px-6 py-4">Autor</th>
                  <th className="px-6 py-4 text-center">Tono</th>
                  <th className="px-6 py-4 text-right rounded-tr-2xl">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {songs.map((song) => (
                  <tr key={song.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Título Clicable */}
                    <td className="px-6 py-4 font-bold text-slate-700">
                      <Link to={`/song/${song.id}`} className="hover:text-[#2dd4bf] transition-colors flex items-center gap-2">
                        <MusicIcon size={16} className="text-slate-300" />
                        {song.title}
                      </Link>
                    </td>
                    
                    <td className="px-6 py-4 text-slate-500">
                      {song.author || '-'}
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold border border-slate-200">
                        {song.tone || 'N/A'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Ver Detalle */}
                        <Link 
                          to={`/song/${song.id}`} 
                          className="p-2 text-slate-300 hover:text-[#2dd4bf] hover:bg-[#2dd4bf]/10 rounded-full transition-all"
                          title="Ver partituras"
                        >
                          <ChevronRight size={20} />
                        </Link>
                        
                        {/* Desvincular (Unlink) */}
                        <button 
                          onClick={() => handleRemoveSongFromProject(song.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                          title="Quitar del proyecto"
                        >
                          {/* Usamos Unlink para denotar que no se borra, se desvincula */}
                          <Unlink size={18} /> 
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para Agregar Existentes */}
      <AddExistingSongModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        currentProjectSongs={songs}
        onAddSong={handleAddSongToProject}
      />

    </div>
  );
};

export default ProjectDetail;