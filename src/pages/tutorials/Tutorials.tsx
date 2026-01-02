import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient'; // Ajusta la ruta si es necesario
import { Plus, Trash2, Play, Youtube, X } from 'lucide-react';
import AddTutorialModal from '../../components/AddTutorialModal';

// Definimos el tipo de dato
interface Tutorial {
  id: string;
  title: string;
  video_url: string;
  category: string;
}

const Tutorials = () => {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null); // ID del video reproduciendo

  // --- FUNCIÓN PARA EXTRAER ID DE YOUTUBE ---
  // Soporta formatos: youtube.com/watch?v=ID, youtu.be/ID, etc.
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
      .order('created_at', { ascending: false }); // Ordenar por más recientes

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
    (async () => {
      await fetchTutorials();
    })();
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse">Cargando videos...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Youtube className="text-red-500" size={32} /> Aprendiendo
          </h1>
          <p className="text-slate-500">Video tutoriales para practicar en casa.</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="bg-slate-800 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-slate-700 transition-all"
        >
          <Plus size={20} /> Agregar Video
        </button>
      </div>

      {/* Grid de Videos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorials.map((video) => {
          const videoId = getYouTubeID(video.video_url);
          // URL de la miniatura de alta calidad de YouTube
          const thumbnailUrl = videoId 
            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` 
            : null;

          return (
            <div key={video.id} className="glass p-4 rounded-3xl group hover:shadow-xl transition-all border border-white/50">
              {/* Miniatura con botón de Play */}
              <div 
                className="relative aspect-video rounded-2xl overflow-hidden bg-slate-200 cursor-pointer mb-4 shadow-inner"
                onClick={() => videoId && setPlayingVideo(videoId)}
              >
                {thumbnailUrl ? (
                  <img src={thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Video no disponible</div>
                )}
                
                {/* Overlay oscuro al pasar el mouse */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-red-500 shadow-lg group-hover:scale-110 transition-transform">
                    <Play fill="currentColor" size={20} className="ml-1" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{video.category}</span>
                  <h3 className="font-bold text-slate-800 leading-tight mt-1 line-clamp-2">{video.title}</h3>
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

      {tutorials.length === 0 && (
        <div className="text-center p-20 glass rounded-3xl border-dashed border-2 border-slate-300">
          <p className="text-slate-400">No hay videos aún. ¡Agrega el primero!</p>
        </div>
      )}

      {/* Modal de Reproducción */}
      {playingVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-60 p-4 animate-in fade-in duration-200">
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

      {/* Modal para Agregar */}
      <AddTutorialModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onRefresh={fetchTutorials}
      />

    </div>
  );
};

export default Tutorials;