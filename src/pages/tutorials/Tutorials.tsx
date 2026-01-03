// import { useEffect, useState } from 'react';
// import { supabase } from '../../lib/supabaseClient'; 
// import { Plus, Trash2, Play, Youtube, MonitorPlay } from 'lucide-react';
// import AddTutorialModal from '../../components/AddTutorialModal';

// // Definimos el tipo de dato
// interface Tutorial {
//   id: string;
//   title: string;
//   video_url: string;
//   category: string;
//   description?: string; // Opcional si tienes descripción
// }

// const Tutorials = () => {
//   const [tutorials, setTutorials] = useState<Tutorial[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isAddOpen, setIsAddOpen] = useState(false);
//   const [selectedVideo, setSelectedVideo] = useState<Tutorial | null>(null); // Video seleccionado para la derecha

//   // --- FUNCIÓN PARA EXTRAER ID DE YOUTUBE ---
//   const getYouTubeID = (url: string) => {
//     const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
//     const match = url.match(regExp);
//     return (match && match[2].length === 11) ? match[2] : null;
//   };

//   const fetchTutorials = async () => {
//     setLoading(true);
//     const { data, error } = await supabase
//       .from('tutorials')
//       .select('*')
//       .order('created_at', { ascending: false });

//     if (error) console.error("Error cargando tutoriales:", error);
//     else {
//       setTutorials(data || []);
//       // Opcional: Seleccionar el primer video automáticamente si existe
//       // if (data && data.length > 0) setSelectedVideo(data[0]);
//     }
//     setLoading(false);
//   };

//   const deleteTutorial = async (e: React.MouseEvent, id: string) => {
//     e.stopPropagation(); // Evitar que seleccione el video al borrar
//     if (!confirm("¿Seguro que quieres eliminar este video?")) return;
    
//     const { error } = await supabase.from('tutorials').delete().eq('id', id);
//     if (error) alert("Error al eliminar");
//     else {
//       // Si el video borrado es el que se está viendo, limpiamos la selección
//       if (selectedVideo?.id === id) setSelectedVideo(null);
//       fetchTutorials();
//     }
//   };

//   useEffect(() => {
//     const loadTutorials = async () => {
//     fetchTutorials();
//     };
//     loadTutorials();
//   }, []);

//   return (
//     // CONTENEDOR PRINCIPAL (Layout exacto solicitado)
//     <div className="w-full pl-4 pr-8 pb-4 h-[calc(100vh-12rem)] md:h-[calc(100vh-7rem)] animate-in fade-in duration-500">
      
//       <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-6">
        
//         {/* --- CAJA IZQUIERDA: BIBLIOTECA DE VIDEOS --- */}
//         <div className="w-full h-full rounded-3xl glass p-6 overflow-hidden flex flex-col gap-6">
            
//             {/* Cabecera Izquierda */}
//             <div className="flex flex-row justify-between items-end shrink-0">
//                 <div>
//                     <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
//                         <Youtube className="text-red-500" size={32} /> Aprendiendo
//                     </h2>
//                     <p className="text-slate-500 mt-1 text-base">Videoteca del grupo.</p>
//                 </div>
//                 <button 
//                   onClick={() => setIsAddOpen(true)}
//                   className="bg-slate-800 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-slate-700 transition-all active:scale-95"
//                 >
//                   <Plus size={18} /> <span className="hidden xl:inline">Agregar</span>
//                 </button>
//             </div>

//             {/* Grid Scrollable */}
//             <div className="flex-1 overflow-y-auto pr-2">
//                 {loading ? (
//                     <div className="text-center p-10 text-slate-400">Cargando biblioteca...</div>
//                 ) : (
//                     <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
//                         {tutorials.map((video) => {
//                             const videoId = getYouTubeID(video.video_url);
//                             const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
//                             const isSelected = selectedVideo?.id === video.id;

//                             return (
//                                 <div 
//                                     key={video.id} 
//                                     onClick={() => setSelectedVideo(video)}
//                                     className={`relative rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 border ${isSelected ? 'ring-4 ring-[#2dd4bf]/50 border-[#2dd4bf]' : 'border-slate-200 hover:border-[#2dd4bf]/50 hover:shadow-lg'}`}
//                                 >
//                                     {/* Miniatura */}
//                                     <div className="aspect-video bg-slate-200 relative">
//                                         {thumbnailUrl ? (
//                                             <img src={thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
//                                         ) : (
//                                             <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Sin imagen</div>
//                                         )}
//                                         {/* Overlay Play Icon */}
//                                         <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
//                                             <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${isSelected ? 'bg-[#2dd4bf] text-white' : 'bg-white/90 text-slate-800'}`}>
//                                                 <Play fill="currentColor" size={16} className="ml-1" />
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Info Corta */}
//                                     <div className="p-3 bg-white/60 backdrop-blur-sm">
//                                         <div className="flex justify-between items-start gap-2">
//                                             <div>
//                                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{video.category}</span>
//                                                 <h3 className={`font-bold text-sm leading-tight mt-0.5 line-clamp-1 ${isSelected ? 'text-[#25b09f]' : 'text-slate-700'}`}>
//                                                     {video.title}
//                                                 </h3>
//                                             </div>
//                                             <button 
//                                                 onClick={(e) => deleteTutorial(e, video.id)}
//                                                 className="text-slate-300 hover:text-red-500 transition-colors p-1"
//                                             >
//                                                 <Trash2 size={16} />
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                         {tutorials.length === 0 && (
//                              <div className="col-span-full text-center p-10 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400">
//                                 No hay videos. ¡Agrega el primero!
//                              </div>
//                         )}
//                     </div>
//                 )}
//             </div>
//         </div>

//         {/* --- CAJA DERECHA: REPRODUCTOR (CINEMA) --- */}
//         <div className="w-full h-full rounded-3xl glass p-6 overflow-hidden flex flex-col">
//             {selectedVideo ? (
//                 <>
//                     <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2 truncate">
//                         <MonitorPlay size={24} className="text-[#2dd4bf]" />
//                         Reproduciendo: <span className="text-slate-500 font-normal text-base truncate">{selectedVideo.title}</span>
//                     </h2>
                    
//                     {/* Contenedor del Video Responsivo */}
//                     <div className="w-full bg-black rounded-2xl overflow-hidden shadow-2xl shrink-0 aspect-video mb-4 ring-4 ring-slate-900/5">
//                         <iframe 
//                             width="100%" 
//                             height="100%" 
//                             src={`https://www.youtube.com/embed/${getYouTubeID(selectedVideo.video_url)}?autoplay=1`} 
//                             title={selectedVideo.title}
//                             frameBorder="0" 
//                             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
//                             allowFullScreen
//                         ></iframe>
//                     </div>

//                     {/* Detalles Extra (Scrollable si es mucho texto) */}
//                     <div className="flex-1 overflow-auto bg-white/40 rounded-2xl p-4 border border-white/50">
//                         <h3 className="font-bold text-lg text-slate-800">{selectedVideo.title}</h3>
//                         <span className="inline-block bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded-md font-bold mt-2 mb-2">
//                             {selectedVideo.category}
//                         </span>
//                         <p className="text-slate-600 text-sm leading-relaxed">
//                             {/* Aquí iría la descripción si existiera en la BD */}
//                             Este video te ayudará a practicar la pieza. Asegúrate de escuchar atentamente los matices y la pronunciación.
//                         </p>
//                     </div>
//                 </>
//             ) : (
//                 /* ESTADO VACÍO (Placeholder) */
//                 <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-4 border-2 border-dashed border-slate-200 rounded-2xl bg-white/20">
//                     <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-2">
//                         <Play size={40} className="text-slate-300 ml-2" />
//                     </div>
//                     <div className="text-center">
//                         <h3 className="text-lg font-bold text-slate-500">Listo para practicar</h3>
//                         <p className="text-sm">Selecciona un video de la izquierda para comenzar.</p>
//                     </div>
//                 </div>
//             )}
//         </div>

//       </div>

//       <AddTutorialModal 
//         isOpen={isAddOpen} 
//         onClose={() => setIsAddOpen(false)} 
//         onRefresh={fetchTutorials}
//       />

//     </div>
//   );
// };

// export default Tutorials;



import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient'; 
import { Plus, Trash2, Play, X } from 'lucide-react';
import AddTutorialModal from '../../components/AddTutorialModal';

// Definimos el tipo de dato
interface Tutorial {
  id: string;
  title: string;
  video_url: string;
  category: string;
}

const CATEGORIES = ["Todos", "Calentamiento", "Técnica Vocal", "Teoría Musical", "Repertorio"];

const Tutorials = () => {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  
  // Filtro seleccionado
  const [selectedFilter, setSelectedFilter] = useState("Todos");

  const getYouTubeID = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const fetchTutorials = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tutorials')
      .select('*')
      .order('created_at', { ascending: false }); 

    if (error) console.error("Error cargando tutoriales:", error);
    else setTutorials(data || []);
    setLoading(false);
  };

  const deleteTutorial = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este video?")) return;
    const { error } = await supabase.from('tutorials').delete().eq('id', id);
    if (error) alert("Error al eliminar");
    else fetchTutorials();
  };

  useEffect(() => {
    const loadTutorials = async () => {
    fetchTutorials();
    };
    loadTutorials();
  }, []);

  const filteredTutorials = tutorials.filter(video => 
    selectedFilter === "Todos" ? true : video.category === selectedFilter
  );

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-400">Cargando videos...</div>;

  return (
    <div className="relative w-full pl-4 pr-8 pb-4 h-[calc(100vh-12rem)] md:h-[calc(100vh-7rem)] animate-in fade-in duration-500">
      
      {/* ESTILOS CSS LOCALES PARA EL SCROLLBAR 
          Esto oculta la barra pero permite scrollear.
      */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        /* Si prefieres que se vea pero finita y bonita, usa esta clase en vez de 'hide-scrollbar' */
        .custom-thin-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-thin-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-thin-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(203, 213, 225, 0.4); /* slate-300 semi-transparent */
            border-radius: 20px;
        }
      `}</style>

      {/* AREA SCROLLABLE 
          Agregué la clase 'hide-scrollbar' aquí.
          Si prefieres ver una barra finita, cambia 'hide-scrollbar' por 'custom-thin-scrollbar'
      */}
      <div className="w-full h-full overflow-y-auto pr-2 pb-24 hide-scrollbar"> 
        
          {/* --- BARRA DE FILTROS (STICKY) --- */}
          <div className="sticky top-0 z-30 pb-4 pt-1">
            {/* CAMBIO AQUÍ: Cambié 'pb-2' por 'p-2' (padding en todos lados) 
                Esto da espacio interno para que la sombra y el scale-105 no se corten */}
            <div className="flex gap-3 overflow-x-auto p-2 hide-scrollbar mask-fade-right"> 
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedFilter(cat)}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap backdrop-blur-md border border-white/40
                    ${selectedFilter === cat
                      ? 'bg-[#2dd4bf] text-white shadow-lg scale-105'
                      : 'bg-white/30 text-slate-600 hover:bg-white/60 hover:scale-105'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Videos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutorials.map((video) => {
              const videoId = getYouTubeID(video.video_url);
              const thumbnailUrl = videoId 
                ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` 
                : null;

              return (
                <div key={video.id} className="glass p-4 rounded-3xl group hover:shadow-xl transition-all border border-white/50">
                  <div 
                    className="relative aspect-video rounded-2xl overflow-hidden bg-slate-200 cursor-pointer mb-4 shadow-inner"
                    onClick={() => videoId && setPlayingVideo(videoId)}
                  >
                    {thumbnailUrl ? (
                      <img src={thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Video no disponible</div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-red-500 shadow-lg group-hover:scale-110 transition-transform">
                        <Play fill="currentColor" size={20} className="ml-1" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#2dd4bf] bg-teal-50 px-2 py-0.5 rounded-md uppercase tracking-wider border border-teal-100">
                        {video.category}
                      </span>
                      <h3 className="font-bold text-slate-800 leading-tight mt-2 line-clamp-2">{video.title}</h3>
                    </div>
                    <button 
                      onClick={() => deleteTutorial(video.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      title="Eliminar video"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTutorials.length === 0 && (
            <div className="h-60 flex flex-col items-center justify-center text-center p-10 glass rounded-3xl border-dashed border-2 border-slate-300 mt-4">
              <p className="text-slate-500 font-bold">No se encontraron videos</p>
              <p className="text-slate-400 text-sm">Prueba con otra categoría o agrega uno nuevo.</p>
            </div>
          )}

      </div>

      {/* BOTÓN FLOTANTE */}
      <button 
        onClick={() => setIsAddOpen(true)}
        className="absolute bottom-8 right-12 z-50 bg-[#2dd4bf] hover:bg-[#25b09f] text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 border-4 border-white/20"
      >
        <Plus size={24} />
      </button>

      {/* Modales */}
      {playingVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-100 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl relative aspect-video">
            <button 
              onClick={() => setPlayingVideo(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-white hover:text-black transition-all"
            >
              <X size={24} />
            </button>
            <iframe 
              width="100%" 
              height="100%" 
              src={`https://www.youtube.com/embed/${playingVideo}?autoplay=1`} 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      <AddTutorialModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onRefresh={fetchTutorials}
      />

    </div>
  );
};

export default Tutorials;