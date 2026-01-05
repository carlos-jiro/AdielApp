import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAppStore } from '../../lib/store';
import type { Song, SongAsset } from '../../lib/types';
import { ArrowLeft, Music, FileText, Download, Play, Pause, Edit } from 'lucide-react';
import UploadSongModal from '../../components/UploadSongModal';

const SongDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  // --- STORE HOOKS ---
  const playQueue = useAppStore((state) => state.playQueue);
  const activeTrack = useAppStore((state) => state.activeTrack);
  const isPlaying = useAppStore((state) => state.isPlaying);

  // --- ESTADOS LOCALES ---
  const [song, setSong] = useState<Song | null>(null);
  const [assets, setAssets] = useState<SongAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  async function fetchSongData() {
    try {
      setLoading(true);
      const { data: songData, error: songError } = await supabase
        .from('songs').select('*').eq('id', id).single();
      if (songError) throw songError;

      const { data: assetsData, error: assetsError } = await supabase
        .from('song_assets').select('*').eq('song_id', id);
      if (assetsError) throw assetsError;

      setSong(songData);
      setAssets(assetsData || []);
    } catch (error) {
      console.error("Error cargando canto:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) fetchSongData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const pdfAsset = assets.find(a => a.type === 'pdf');
  const audioAssets = assets.filter(a => a.type !== 'pdf');

  // --- LÓGICA DE COLA DE REPRODUCCIÓN (MODIFICADA) ---
  const handlePlayAsset = (assetId: string) => {
    if (!song) return;

    // 1. Crear la playlist con todos los audios de este canto
    const queueTracks = audioAssets.map(asset => ({
        id: asset.id,
        // CAMBIO AQUÍ: 
        // Title = Nombre del Canto (ej. "Agnus Dei")
        title: song.title, 
        // Author = El TIPO de pista (ej. "Soprano", "Tenor", "Instrumental")
        // Si quieres que también salga el autor original puedes poner: `${asset.type} - ${song.author}`
        author: asset.type.toUpperCase(), 
        url: asset.file_url
    }));

    // 2. Encontrar cuál se clickeó para empezar ahí
    const startIndex = queueTracks.findIndex(t => t.id === assetId);

    // 3. Lanzar al store
    if (startIndex !== -1) {
        playQueue(queueTracks, startIndex);
    }
  };

  // Helper visual para saber si ESTE archivo específico está sonando
  // Comparamos URL y verificamos que esté en Play
  const isThisPlaying = (url: string) => {
      return isPlaying && activeTrack?.url === url;
  };

  if (loading) return <div className="p-20 text-center text-[#2dd4bf] animate-pulse">Cargando materiales...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20"> 
      
      <Link to={`/projects`} className="flex items-center gap-2 text-slate-500 hover:text-[#2dd4bf] transition-colors w-fit">
        <ArrowLeft size={20} /> <span>Volver al disco</span>
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-slate-800">{song?.title}</h1>
            <button 
              onClick={() => setIsEditOpen(true)}
              className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-[#2dd4bf] hover:text-white transition-all shadow-sm"
              title="Editar materiales del canto"
            >
              <Edit size={20} />
            </button>
          </div>
          <p className="text-[#2dd4bf] font-medium mt-1">Materiales de estudio y ensayo</p>
        </div>
        
        {pdfAsset && (
          <a href={pdfAsset.file_url} target="_blank" rel="noopener noreferrer" className="bg-slate-800 text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:bg-slate-700 transition-all shadow-lg">
            <FileText size={20} /> <span>Ver Partitura / Letra</span>
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: Audios */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-700 text-lg flex items-center gap-2">
            <Music className="text-[#2dd4bf]" /> Pistas de Audio
          </h3>
          
          {audioAssets.length > 0 ? (
            <div className="grid gap-4">
              {audioAssets.map((asset) => (
                <div key={asset.id} className={`
                    glass p-4 rounded-2xl flex items-center justify-between border shadow-sm transition-all
                    ${isThisPlaying(asset.file_url) ? 'border-[#2dd4bf] bg-[#2dd4bf]/5' : 'border-white/50 hover:shadow-md'}
                `}>
                  
                  <div className="flex items-center gap-4">
                    {/* BOTÓN PLAY CONECTADO A LA COLA */}
                    <button 
                        onClick={() => handlePlayAsset(asset.id)}
                        className={`
                            w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md
                            ${isThisPlaying(asset.file_url) 
                                ? 'bg-[#2dd4bf] text-white scale-105' 
                                : 'bg-white text-slate-700 hover:bg-[#2dd4bf] hover:text-white'
                            }
                        `}
                    >
                        {isThisPlaying(asset.file_url) ? (
                             <Pause size={20} fill="currentColor" />
                        ) : (
                             <Play size={20} fill="currentColor" className="ml-1" />
                        )}
                    </button>

                    <div className="flex flex-col">
                        {/* Nombre del archivo/tipo (ej. SOPRANO) */}
                        <span className="font-bold text-slate-700 uppercase text-sm tracking-wide">{asset.type}</span>
                        
                        {/* Indicador de "Reproduciendo..." */}
                        {isThisPlaying(asset.file_url) && (
                            <span className="text-xs text-[#2dd4bf] font-medium animate-pulse">Reproduciendo...</span>
                        )}
                    </div>
                  </div>

                  <a 
                    href={asset.file_url} 
                    download 
                    className="p-2 text-slate-400 hover:text-[#2dd4bf] hover:bg-[#2dd4bf]/10 rounded-full transition-colors" 
                    title="Descargar MP3"
                  >
                    <Download size={20} />
                  </a>

                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 glass rounded-2xl text-center text-slate-400 italic flex flex-col items-center gap-2">
               <p>No hay audios subidos.</p>
               <button onClick={() => setIsEditOpen(true)} className="text-[#2dd4bf] font-bold hover:underline">¡Sube uno ahora!</button>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: PDF */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <FileText size={32} />
            </div>
            <div>
              <p className="font-bold text-slate-700">Documento PDF</p>
              <p className="text-xs text-slate-500 mt-1">
                {pdfAsset ? 'Disponible para visualizar' : 'No disponible'}
              </p>
            </div>
            {pdfAsset ? (
              <a href={pdfAsset.file_url} target="_blank" className="block w-full py-2 bg-[#2dd4bf]/10 text-[#2dd4bf] font-bold rounded-lg hover:bg-[#2dd4bf] hover:text-white transition-all">
                Abrir Documento
              </a>
            ) : (
              <button 
                onClick={() => setIsEditOpen(true)}
                className="w-full py-2 bg-slate-100 text-slate-400 font-bold rounded-lg hover:bg-[#2dd4bf] hover:text-white transition-colors"
              >
                + Agregar PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {song && (
        <UploadSongModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          projectId={song.project_id} 
          onRefresh={fetchSongData}
          existingSong={{ id: song.id, title: song.title }} 
        />
      )}
    </div>
  );
};

export default SongDetail;