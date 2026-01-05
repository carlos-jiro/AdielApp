import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAppStore } from '../../lib/store'; 
import { Link } from 'react-router-dom';
import type { Project, Song } from '../../lib/types'; 
import ProjectCard from '../../components/ProjectCard';
import CreateProjectModal from '../../components/CreateProjectModal';
import UploadSongModal from '../../components/UploadSongModal';
import AddExistingSongModal from '../../components/AddExistingSongModal'; 
import { Plus, Music, ChevronRight, Trash2, LayoutGrid, Layers, Loader2 } from 'lucide-react';

const Projects = () => {
  // --- ESTADOS GLOBALES ---
  const allSongs = useAppStore((state) => state.songs);
  const fetchSongs = useAppStore((state) => state.fetchSongs);

  // --- ESTADOS LOCALES ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  
  // Lógica de Selección
  const [selectedProject, setSelectedProject] = useState<Project | 'ALL'>('ALL');
  const [displayedSongs, setDisplayedSongs] = useState<Song[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(false);

  // Modales
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSongModalOpen, setIsSongModalOpen] = useState(false); 
  const [isAddExistingModalOpen, setIsAddExistingModalOpen] = useState(false);

  // 1. Cargar Proyectos
  async function fetchProjects() {
    try {
      setLoadingProjects(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error cargando proyectos:', error);
    } finally {
      setLoadingProjects(false);
    }
  }

  // 2. Efecto: Actualizar la tabla cuando cambia la selección
  useEffect(() => {
    const updateTable = async () => {
      setDisplayedSongs([]); 
      setLoadingSongs(true);

      if (selectedProject === 'ALL') {
        setDisplayedSongs(allSongs);
        setLoadingSongs(false);
      } else {
        try {
          const { data, error } = await supabase
            .from('project_songs')
            .select(`
              song_id,
              songs:song_id (*)
            `)
            .eq('project_id', selectedProject.id);

          if (error) throw error;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const songsFromProject = data?.map((item: any) => item.songs) || [];
          songsFromProject.sort((a: Song, b: Song) => a.title.localeCompare(b.title));
          
          setDisplayedSongs(songsFromProject);
        } catch (error) {
          console.error("Error fetching project songs:", error);
          setDisplayedSongs([]);
        } finally {
          setLoadingSongs(false);
        }
      }
    };

    updateTable();
  }, [selectedProject, allSongs]);

  useEffect(() => {
    fetchProjects();
  }, []);

  // --- MANEJADORES DE ACCIONES ---

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("¿Seguro que quieres eliminar este proyecto?")) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      if (error) throw error;
      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      if (selectedProject !== 'ALL' && selectedProject.id === projectId) {
        setSelectedProject('ALL');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert("Error al borrar: " + error.message);
    }
  };

  const handleAddButtonClick = () => {
    if (selectedProject === 'ALL') {
      setIsSongModalOpen(true);
    } else {
      setIsAddExistingModalOpen(true);
    }
  };

  const handleAddSongToProject = async (songId: string) => {
    if (selectedProject === 'ALL') return;

    try {
      const { error } = await supabase
        .from('project_songs')
        .insert({
          project_id: selectedProject.id,
          song_id: songId
        });

      if (error) throw error;

      const songToAdd = allSongs.find(s => s.id === songId);
      if (songToAdd) {
        setDisplayedSongs(prev => {
          const newList = [...prev, songToAdd];
          return newList.sort((a, b) => a.title.localeCompare(b.title));
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error agregando canto:', error);
      alert('Error al agregar el canto: ' + error.message);
    }
  };

  // --- NUEVA LÓGICA: ELIMINAR CANTO DEL PROYECTO ---
  const handleRemoveSongFromProject = async (songId: string, e: React.MouseEvent) => {
    // 1. IMPORTANTE: Evitar que el click se propague al Link (que abriría el canto)
    e.preventDefault(); 
    e.stopPropagation();

    if (selectedProject === 'ALL') return; // Seguridad extra

    // 2. Confirmación visual rápida
    if(!window.confirm("¿Quitar este canto del proyecto?")) return;

    try {
        // 3. Borrar de la tabla intermedia
        const { error } = await supabase
            .from('project_songs')
            .delete()
            .eq('project_id', selectedProject.id)
            .eq('song_id', songId);

        if (error) throw error;

        // 4. Actualizar estado local (quitarlo de la lista visualmente)
        setDisplayedSongs(prev => prev.filter(s => s.id !== songId));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Error removing song:", error);
        alert("No se pudo quitar el canto: " + error.message);
    }
  };

  return (
    <div className="w-full pl-4 pr-8 pb-4 h-[calc(100vh-12rem)] md:h-[calc(100vh-7rem)]">
      
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* --- CAJA IZQUIERDA: PROYECTOS --- */}
        <div className="w-full h-full rounded-3xl glass p-6 overflow-hidden flex flex-col">
            
            <div className="shrink-0 flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-purple-100 rounded-xl text-purple-600 shadow-sm">
                    <LayoutGrid size={24} /> 
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">Mis Proyectos</h2>
                    <p className="text-sm text-slate-500 font-medium">Selecciona para filtrar</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="grid grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4 pb-2">
                    
                    {/* CARD FIJA "REPERTORIO MAESTRO" */}
                    <div 
                       onClick={() => setSelectedProject('ALL')}
                       className={`aspect-3/3 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 p-4 cursor-pointer transition-all group
                          ${selectedProject === 'ALL' 
                            ? 'border-[#2dd4bf] bg-[#2dd4bf]/5' 
                            : 'border-slate-200 bg-slate-50 hover:border-[#2dd4bf]/50'
                          }
                        `}
                    >
                        <div className={`
                          w-14 h-14 rounded-full flex items-center justify-center transition-colors
                          ${selectedProject === 'ALL' ? 'bg-[#2dd4bf] text-white' : 'bg-white text-slate-400 group-hover:text-[#2dd4bf]'}
                        `}>
                           <Layers size={28} />
                        </div>
                        <div className="text-center">
                          <span className={`font-bold block ${selectedProject === 'ALL' ? 'text-[#0d9488]' : 'text-slate-500'}`}>
                            Todos los Cantos
                          </span>
                          <span className="text-[10px] text-slate-400">Vista General</span>
                        </div>
                    </div>

                    {/* LISTA DE PROYECTOS */}
                    {loadingProjects ? (
                        [1,2].map(i => <div key={i} className="aspect-3/3 bg-slate-200/50 animate-pulse rounded-3xl"></div>)
                    ) : (
                        projects.map((project) => (
                            <div key={project.id} className="aspect-3/3 relative group/card">
                                <button 
                                    onClick={(e) => handleDeleteProject(project.id, e)}
                                    className="absolute top-3 right-3 z-20 p-2 bg-white/90 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full backdrop-blur-sm transition-opacity opacity-0 group-hover/card:opacity-100 shadow-sm"
                                    title="Eliminar proyecto"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <div className="h-full w-full">
                                    <ProjectCard 
                                      project={project} 
                                      isActive={selectedProject !== 'ALL' && selectedProject.id === project.id}
                                      onClick={() => setSelectedProject(project)}
                                    />
                                </div>
                            </div>
                        ))
                    )}

                    {/* CARD "CREAR NUEVO" */}
                    <div 
                        onClick={() => setIsProjectModalOpen(true)}
                        className="aspect-3/3 rounded-3xl border-2 border-dashed border-slate-300/70 flex flex-col items-center justify-center gap-3 text-slate-400 cursor-pointer hover:border-[#2dd4bf] hover:text-[#2dd4bf] hover:bg-white/40 transition-all group"
                    >
                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-[#2dd4bf]/10 transition-colors">
                            <Plus size={28} />
                        </div>
                        <span className="font-bold text-base">Crear Nuevo</span>
                    </div>
                </div>
            </div>
        </div>

        {/* --- CAJA DERECHA: TABLA DINÁMICA --- */}
        <div className="w-full h-full rounded-3xl glass p-6 overflow-hidden flex flex-col relative border-l-4 border-[#2dd4bf]/20">
            
            {/* Header Dinámico */}
            <div className="shrink-0 flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#2dd4bf]/10 rounded-xl text-[#2dd4bf] shadow-sm">
                        <Music size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-tight line-clamp-1">
                          {selectedProject === 'ALL' ? 'Repertorio Maestro' : selectedProject.name}
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">
                          {selectedProject === 'ALL' ? 'Todos los cantos disponibles' : 'Cantos en este proyecto'}
                        </p>
                    </div>
                </div>
                
                <button 
                    onClick={handleAddButtonClick}
                    className="bg-[#2dd4bf] text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md hover:bg-[#26bba8] transition-all cursor-pointer active:scale-95 text-sm"
                >
                    <Plus size={18} /> 
                    <span className="hidden sm:inline">
                        {selectedProject === 'ALL' ? 'Subir Nuevo' : 'Agregar Canto'}
                    </span>
                </button>
            </div>

            {/* Contenido (Tabla) */}
            <div className="flex-1 overflow-hidden flex flex-col rounded-2xl shadow-inner relative">
                
                {loadingSongs && (
                  <div className="absolute inset-0 backdrop-blur-sm z-20 flex items-center justify-center">
                    <Loader2 className="animate-spin text-[#2dd4bf]" size={32} />
                  </div>
                )}

                {displayedSongs.length === 0 && !loadingSongs ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400">
                        <Music size={40} className="opacity-30" />
                        <p className="text-base font-medium">
                          {selectedProject === 'ALL' ? 'Tu biblioteca está vacía' : 'Este proyecto no tiene cantos asignados'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        <div className="flex flex-col gap-3">
                            {displayedSongs.map((song) => (
                                <Link key={song.id} to={`/song/${song.id}`} className="bg-white/40 rounded-2xl p-4 hover:bg-white/60 transition-colors group cursor-pointer border border-white/60 shadow-sm relative pr-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <span className="text-base font-bold text-slate-700 hover:text-[#2dd4bf] transition-colors block truncate">
                                                {song.title}
                                            </span>
                                            <p className="text-sm text-slate-600 font-medium hidden sm:block">
                                                {song.author || '-'}
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 ml-4">
                                            
                                            
                                            {/* BOTÓN ELIMINAR (Solo visible si NO estamos en ALL) */}
                                            {selectedProject !== 'ALL' && (
                                                <button 
                                                    onClick={(e) => handleRemoveSongFromProject(song.id, e)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all z-10"
                                                    title="Quitar del proyecto"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            )}

                                            <div className="inline-flex p-2 text-slate-400 hover:text-[#2dd4bf] hover:bg-[#2dd4bf]/10 rounded-full transition-all">
                                                <ChevronRight size={20} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

      </div>

      <CreateProjectModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
        onRefresh={fetchProjects} 
      />
      
      <UploadSongModal 
        isOpen={isSongModalOpen} 
        onClose={() => setIsSongModalOpen(false)}
        projectId="" 
        onRefresh={fetchSongs} 
      />

      <AddExistingSongModal 
        isOpen={isAddExistingModalOpen}
        onClose={() => setIsAddExistingModalOpen(false)}
        currentProjectSongs={displayedSongs}
        onAddSong={handleAddSongToProject}
      />

    </div>
  );
};

export default Projects;