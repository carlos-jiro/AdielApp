import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAppStore } from '../../lib/store'; 
import { Link } from 'react-router-dom';
import type { Project, Song } from '../../lib/types'; 
import ProjectCard from '../../components/ProjectCard';
import CreateProjectModal from '../../components/CreateProjectModal';
import UploadSongModal from '../../components/UploadSongModal';
import AddExistingSongModal from '../../components/AddExistingSongModal'; 
// Agregamos ArrowLeft para el botón de regresar en móvil
import { Plus, Music, ChevronRight, Trash2, LayoutGrid, Layers, Loader2, ArrowLeft } from 'lucide-react';

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

  // --- NUEVO ESTADO: VISTA MÓVIL ---
  // 'LIST' = Viendo lista de proyectos
  // 'DETAIL' = Viendo la tabla de canciones de un proyecto
  const [mobileView, setMobileView] = useState<'LIST' | 'DETAIL'>('LIST');

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

  // Función auxiliar para seleccionar proyecto y cambiar vista en móvil
  const handleSelectProject = (project: Project | 'ALL') => {
    setSelectedProject(project);
    setMobileView('DETAIL'); // En móvil, nos manda a la vista de detalle
  };

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
      const { error } = await supabase.from('project_songs').insert({
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

  const handleRemoveSongFromProject = async (songId: string, e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (selectedProject === 'ALL') return; 
    if(!window.confirm("¿Quitar este canto del proyecto?")) return;

    try {
        const { error } = await supabase
            .from('project_songs')
            .delete()
            .eq('project_id', selectedProject.id)
            .eq('song_id', songId);

        if (error) throw error;
        setDisplayedSongs(prev => prev.filter(s => s.id !== songId));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Error removing song:", error);
        alert("No se pudo quitar el canto: " + error.message);
    }
  };

  return (
    // Ajuste de altura para móviles vs desktop
    <div className="w-full pl-4 pr-4 md:pr-8 pb-4 h-[calc(100vh-8rem)] md:h-[calc(100vh-7rem)]">
      
      <div className="w-full h-full md:grid md:grid-cols-2 gap-6">
        
        {/* --- CAJA IZQUIERDA: PROYECTOS --- 
            Lógica de visualización:
            - En Desktop (md): Siempre visible (flex).
            - En Móvil: Solo visible si mobileView es 'LIST'. Si es 'DETAIL' se oculta (hidden).
        */}
        <div className={`
            w-full h-full rounded-3xl glass p-4 md:p-6 overflow-hidden flex-col
            ${mobileView === 'DETAIL' ? 'hidden md:flex' : 'flex'}
        `}>
            
            <div className="shrink-0 flex items-center gap-3 mb-4 md:mb-6">
                <div className="p-2.5 bg-purple-100 rounded-xl text-purple-600 shadow-sm">
                    <LayoutGrid size={24} /> 
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">Mis Proyectos</h2>
                    <p className="text-sm text-slate-500 font-medium">Selecciona para filtrar</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                {/* CONTENEDOR DE LA LISTA 
                   - En móvil: flex-col (lista vertical simple)
                   - En Desktop: grid (cuadrícula de cards)
                */}
                <div className="flex flex-col md:grid md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-3 md:gap-4 pb-2">
                    
                

                    {/* 2. CARD "REPERTORIO MAESTRO" */}
                    <div 
                       onClick={() => handleSelectProject('ALL')}
                       className={`
                          cursor-pointer transition-all group rounded-2xl
                          /* Móvil: Lista */
                          flex items-center p-3 gap-3 border h-20 w-full
                          /* Desktop: Card Cuadrada */
                          md:flex-col md:justify-center md:aspect-3/3 md:h-auto md:border-2 md:p-4
                          ${selectedProject === 'ALL' 
                            ? 'border-[#2dd4bf] bg-[#2dd4bf]/5' 
                            : 'border-slate-200 bg-slate-50 hover:border-[#2dd4bf]/50'
                          }
                       `}
                    >
                        <div className={`
                          rounded-full flex items-center justify-center transition-colors shrink-0
                          w-10 h-10 md:w-14 md:h-14
                          ${selectedProject === 'ALL' ? 'bg-[#2dd4bf] text-white' : 'bg-white text-slate-400 group-hover:text-[#2dd4bf]'}
                        `}>
                           <Layers size={20} className="md:w-7 md:h-7" />
                        </div>
                        <div className="flex flex-col md:items-center md:text-center">
                          <span className={`font-bold text-sm md:text-base ${selectedProject === 'ALL' ? 'text-[#0d9488]' : 'text-slate-500'}`}>
                            Todos los Cantos
                          </span>
                          <span className="text-[10px] text-slate-400">Vista General</span>
                        </div>
                        {/* Flecha solo en móvil para indicar navegación */}
                        <ChevronRight className="ml-auto text-slate-300 md:hidden" size={20} />
                    </div>

                    {/* 3. LISTA DE PROYECTOS DINÁMICA */}
                    {loadingProjects ? (
                        [1,2].map(i => <div key={i} className="h-20 md:aspect-3/3 bg-slate-200/50 animate-pulse rounded-2xl md:rounded-3xl"></div>)
                    ) : (
                        projects.map((project) => (
                            <div key={project.id} className="relative group/card w-full">
                                
                                {/* --- VERSIÓN MÓVIL (LISTA) --- */}
                                <div 
                                    onClick={() => handleSelectProject(project)}
                                    className={`
                                        md:hidden flex items-center gap-3 p-3 rounded-2xl border bg-white cursor-pointer h-20
                                        ${selectedProject !== 'ALL' && selectedProject.id === project.id ? 'border-[#2dd4bf] bg-[#2dd4bf]/5' : 'border-slate-100'}
                                    `}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0 overflow-hidden">
                                        {project.cover_url ? (
                                            <img src={project.cover_url} alt="" className="w-full h-full object-cover"/>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300"><Music size={20}/></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-700 truncate text-sm">{project.name}</h3>
                                        <p className="text-xs text-slate-400 truncate">{project.description || 'Sin descripción'}</p>
                                    </div>
                                    <ChevronRight className="text-slate-300" size={20} />
                                </div>

                                {/* --- VERSIÓN DESKTOP (CARD ORIGINAL) --- */}
                                <div className="hidden md:block h-full w-full">
                                     <button 
                                        onClick={(e) => handleDeleteProject(project.id, e)}
                                        className="absolute top-3 right-3 z-20 p-2 bg-white/90 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full backdrop-blur-sm transition-opacity opacity-0 group-hover/card:opacity-100 shadow-sm"
                                        title="Eliminar proyecto"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <ProjectCard 
                                      project={project} 
                                      isActive={selectedProject !== 'ALL' && selectedProject.id === project.id}
                                      onClick={() => handleSelectProject(project)}
                                    />
                                </div>
                            </div>
                        ))
                    )}

                    {/* 1. CARD "CREAR NUEVO" */}
                    {/* Diseño diferente para móvil (botón largo) vs desktop (cuadro) */}
                    <div 
                        onClick={() => setIsProjectModalOpen(true)}
                        className="
                           cursor-pointer border-2 border-dashed border-slate-300/70 bg-slate-100/50
                           hover:border-[#2dd4bf] hover:text-[#2dd4bf] hover:bg-white/40 transition-all group
                           rounded-2xl flex items-center justify-center gap-3 text-slate-400
                           /* Móvil: altura fija, estilo lista */
                           h-16 w-full 
                           /* Desktop: relación de aspecto cuadrada */
                           md:h-auto md:aspect-3/3 md:flex-col
                        "
                    >
                        <div className="w-8 h-8 md:w-14 md:h-14 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-[#2dd4bf]/10 transition-colors">
                            <Plus size={20} className="md:w-7 md:h-7" />
                        </div>
                        <span className="font-bold text-sm md:text-base">Crear Nuevo</span>
                    </div>
                </div>
            </div>
        </div>

        {/* --- CAJA DERECHA: TABLA DINÁMICA --- 
            Lógica de visualización:
            - En Desktop (md): Siempre visible (flex).
            - En Móvil: Solo visible si mobileView es 'DETAIL'.
        */}
        <div className={`
            w-full h-full rounded-3xl glass p-4 md:p-6 overflow-hidden flex-col relative border-l-0 md:border-l-4 md:border-[#2dd4bf]/20
            ${mobileView === 'LIST' ? 'hidden md:flex' : 'flex'}
        `}>
            
            {/* Header Dinámico */}
            <div className="shrink-0 flex items-center justify-between mb-4 md:mb-6 gap-2">
                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                    
                    {/* BOTÓN ATRÁS (SOLO MÓVIL) */}
                    <button 
                        onClick={() => setMobileView('LIST')}
                        className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full"
                    >
                        <ArrowLeft size={24} />
                    </button>

                    <div className="p-2 md:p-2.5 bg-[#2dd4bf]/10 rounded-xl text-[#2dd4bf] shadow-sm shrink-0">
                        <Music size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight leading-tight truncate">
                          {selectedProject === 'ALL' ? 'Repertorio Maestro' : selectedProject.name}
                        </h2>
                        <p className="text-xs md:text-sm text-slate-500 font-medium truncate">
                          {selectedProject === 'ALL' ? 'Todos los cantos' : 'Cantos del proyecto'}
                        </p>
                    </div>
                </div>
                
                <button 
                    onClick={handleAddButtonClick}
                    className="bg-[#2dd4bf] text-white px-3 py-2 md:px-4 md:py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md hover:bg-[#26bba8] transition-all cursor-pointer active:scale-95 text-xs md:text-sm shrink-0"
                >
                    <Plus size={16} className="md:w-4.5" /> 
                    <span className="hidden sm:inline">
                        {selectedProject === 'ALL' ? 'Subir Nuevo' : 'Agregar Canto'}
                    </span>
                    <span className="sm:hidden">Agregar</span>
                </button>
            </div>

            {/* Contenido (Tabla) */}
            <div className="flex-1 overflow-hidden flex flex-col rounded-2xl shadow-inner relative bg-white/30 md:bg-transparent">
                
                {loadingSongs && (
                  <div className="absolute inset-0 backdrop-blur-sm z-20 flex items-center justify-center">
                    <Loader2 className="animate-spin text-[#2dd4bf]" size={32} />
                  </div>
                )}

                {displayedSongs.length === 0 && !loadingSongs ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400 p-4 text-center">
                        <Music size={40} className="opacity-30" />
                        <p className="text-sm md:text-base font-medium">
                          {selectedProject === 'ALL' ? 'Tu biblioteca está vacía' : 'Este proyecto no tiene cantos asignados'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        <div className="flex flex-col gap-2 md:gap-3 p-1">
                            {displayedSongs.map((song) => (
                                <Link key={song.id} to={`/song/${song.id}`} className="bg-white/60 md:bg-white/40 rounded-xl md:rounded-2xl p-3 md:p-4 hover:bg-white/80 transition-colors group cursor-pointer border border-white/60 shadow-sm relative pr-2 md:pr-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm md:text-base font-bold text-slate-700 hover:text-[#2dd4bf] transition-colors block truncate">
                                                {song.title}
                                            </span>
                                            <p className="text-xs md:text-sm text-slate-600 font-medium truncate">
                                                {song.author || '-'}
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 md:gap-3 ml-2">
                                            {selectedProject !== 'ALL' && (
                                                <button 
                                                    onClick={(e) => handleRemoveSongFromProject(song.id, e)}
                                                    className="p-1.5 md:p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all z-10"
                                                >
                                                    <Trash2 size={18} className="md:w-5 md:h-5" />
                                                </button>
                                            )}

                                            <div className="inline-flex p-1 md:p-2 text-slate-400 hover:text-[#2dd4bf] hover:bg-[#2dd4bf]/10 rounded-full transition-all">
                                                <ChevronRight size={18} className="md:w-5 md:h-5" />
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