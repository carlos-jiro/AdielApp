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
    const loadEvents = async () => { await
    fetchTutorials();
    };
    loadEvents();
  }, []);

  const filteredTutorials = tutorials.filter(video => 
    selectedFilter === "Todos" ? true : video.category === selectedFilter
  );

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-400">Cargando videos...</div>;

  return (
    // CAMBIO 1: Padding lateral unificado en móvil (px-4) y específico en desktop (md:pl-4 md:pr-8)
    // Altura calculada ajustada para móvil
    <div className="relative w-full px-4 md:pl-4 md:pr-8 pb-4 h-[calc(100vh-8rem)] md:h-[calc(100vh-7rem)] animate-in fade-in duration-500">
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* AREA SCROLLABLE */}
      {/* CAMBIO 2: pb-32 en móvil para que el último video no quede tapado por el GlobalPlayer */}
      <div className="w-full h-full overflow-y-auto pr-0 md:pr-2 pb-32 md:pb-24 hide-scrollbar"> 
        
          {/* --- BARRA DE FILTROS (STICKY) --- */}
          <div className="sticky top-0 z-30 pb-4 pt-1">
            <div className="flex gap-2 md:gap-3 overflow-x-auto p-2 hide-scrollbar mask-fade-right"> 
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedFilter(cat)}
                  className={`px-4 py-2 md:px-5 md:py-2.5 rounded-2xl text-xs md:text-sm font-bold transition-all whitespace-nowrap backdrop-blur-md border border-white/40
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
          {/* CAMBIO 3: Grid responsive (1 col móvil, 2 col tablet, 3 col desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredTutorials.map((video) => {
              const videoId = getYouTubeID(video.video_url);
              const thumbnailUrl = videoId 
                ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` 
                : null;

              return (
                <div key={video.id} className="glass p-3 md:p-4 rounded-3xl group hover:shadow-xl transition-all border border-white/50">
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
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white/90 rounded-full flex items-center justify-center text-red-500 shadow-lg group-hover:scale-110 transition-transform">
                        <Play fill="currentColor" size={20} className="ml-1" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#2dd4bf] bg-teal-50 px-2 py-0.5 rounded-md uppercase tracking-wider border border-teal-100">
                        {video.category}
                      </span>
                      <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight mt-2 line-clamp-2">{video.title}</h3>
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
      {/* CAMBIO 4: Posición ajustada para móvil (bottom-24) para que no choque con el reproductor */}
      <button 
        onClick={() => setIsAddOpen(true)}
        className="absolute bottom-24 right-4 md:bottom-8 md:right-8 z-50 bg-[#2dd4bf] hover:bg-[#25b09f] text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 border-4 border-white/20"
      >
        <Plus size={24} />
      </button>

      {/* Modal Video */}
      {playingVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-100 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl relative aspect-video">
            <button 
              onClick={() => setPlayingVideo(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-white hover:text-black transition-all"
            >
              <X size={20} />
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