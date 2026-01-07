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

  // --- LÓGICA DE COLA DE REPRODUCCIÓN ---
  const handlePlayAsset = (assetId: string) => {
    if (!song) return;

    const queueTracks = audioAssets.map(asset => ({
        id: asset.id,
        title: song.title, 
        author: asset.type.toUpperCase(), 
        url: asset.file_url
    }));

    const startIndex = queueTracks.findIndex(t => t.id === assetId);

    if (startIndex !== -1) {
        playQueue(queueTracks, startIndex);
    }
  };

  const isThisPlaying = (url: string) => {
      return isPlaying && activeTrack?.url === url;
  };

  if (loading) return <div className="p-20 text-center text-[#2dd4bf] animate-pulse">Cargando materiales...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-24 px-4 md:px-0"> 
      
      {/* Botón Volver */}
      <Link to={`/projects`} className="flex items-center gap-2 text-slate-500 hover:text-[#2dd4bf] transition-colors w-fit group">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
        <span className="font-medium text-sm md:text-base">Volver al disco</span>
      </Link>

      {/* ENCABEZADO: Título y Botón PDF (Solo Móvil) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div className="w-full md:w-auto">
          <div className="flex items-center justify-between md:justify-start gap-3">
            {/* Título */}
            <h1 className="text-2xl md:text-4xl font-bold text-slate-800 break-words line-clamp-2 leading-tight">
                {song?.title}
            </h1>
            
            <button 
              onClick={() => setIsEditOpen(true)}
              className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-[#2dd4bf] hover:text-white transition-all shadow-sm shrink-0"
              title="Editar materiales del canto"
            >
              <Edit size={20} />
            </button>
          </div>
          <p className="text-[#2dd4bf] text-sm md:text-base font-medium mt-1 md:mt-2">Materiales de estudio y ensayo</p>
        </div>
        
        {/* BOTÓN PDF VERDE Y SOLO MÓVIL (md:hidden) */}
        {pdfAsset && (
          <a 
            href={pdfAsset.file_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full md:hidden bg-[#2dd4bf] text-white px-6 py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-[#26bba8] transition-all shadow-lg active:scale-95"
          >
            <FileText size={20} /> <span className="font-bold">Ver Partitura / Letra</span>
          </a>
        )}
      </div>

      {/* LAYOUT PRINCIPAL: 1 col móvil -> 3 cols desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* COLUMNA IZQUIERDA: Audios (Ocupa 2 cols en desktop) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-700 text-lg flex items-center gap-2">
            <Music className="text-[#2dd4bf]" size={24} /> Pistas de Audio
          </h3>
          
          {audioAssets.length > 0 ? (
            <div className="grid gap-3 md:gap-4">
              {audioAssets.map((asset) => (
                <div key={asset.id} className={`
                    glass p-3 md:p-4 rounded-2xl flex items-center justify-between border shadow-sm transition-all
                    ${isThisPlaying(asset.file_url) ? 'border-[#2dd4bf] bg-[#2dd4bf]/5' : 'border-white/50 hover:shadow-md'}
                `}>
                  
                  <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                    {/* BOTÓN PLAY */}
                    <button 
                        onClick={() => handlePlayAsset(asset.id)}
                        className={`
                            shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all shadow-md
                            ${isThisPlaying(asset.file_url) 
                                ? 'bg-[#2dd4bf] text-white scale-105' 
                                : 'bg-white text-slate-700 hover:bg-[#2dd4bf] hover:text-white'
                            }
                        `}
                    >
                        {isThisPlaying(asset.file_url) ? (
                             <Pause size={18} fill="currentColor" className="md:w-5 md:h-5" />
                        ) : (
                             <Play size={18} fill="currentColor" className="ml-0.5 md:w-5 md:h-5" />
                        )}
                    </button>

                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-700 uppercase text-xs md:text-sm tracking-wide truncate">
                            {asset.type}
                        </span>
                        
                        {isThisPlaying(asset.file_url) && (
                            <span className="text-[10px] md:text-xs text-[#2dd4bf] font-medium animate-pulse truncate">
                                Reproduciendo...
                            </span>
                        )}
                    </div>
                  </div>

                  <a 
                    href={asset.file_url} 
                    download 
                    className="p-2 text-slate-400 hover:text-[#2dd4bf] hover:bg-[#2dd4bf]/10 rounded-full transition-colors shrink-0" 
                    title="Descargar MP3"
                  >
                    <Download size={20} className="md:w-5 md:h-5" />
                  </a>

                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 md:p-10 glass rounded-2xl text-center text-slate-400 italic flex flex-col items-center gap-2 border border-dashed border-slate-300">
               <p className="text-sm">No hay audios subidos.</p>
               <button onClick={() => setIsEditOpen(true)} className="text-[#2dd4bf] font-bold hover:underline text-sm">
                   ¡Sube uno ahora!
               </button>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: PDF (Visible en desktop y móvil, abajo en móvil) */}
        <div className="space-y-6">
          <div className="glass p-5 md:p-6 rounded-3xl text-center space-y-4 shadow-sm border border-white/50">
            <div className="w-14 h-14 md:w-16 md:h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <FileText size={28} className="md:w-8 md:h-8" />
            </div>
            <div>
              <p className="font-bold text-slate-700">Documento PDF</p>
              <p className="text-xs text-slate-500 mt-1">
                {pdfAsset ? 'Disponible para visualizar' : 'No disponible'}
              </p>
            </div>
            {pdfAsset ? (
              <a 
                href={pdfAsset.file_url} 
                target="_blank" 
                className="block w-full py-2.5 bg-[#2dd4bf]/10 text-[#2dd4bf] font-bold rounded-xl hover:bg-[#2dd4bf] hover:text-white transition-all text-sm md:text-base"
              >
                Abrir Documento
              </a>
            ) : (
              <button 
                onClick={() => setIsEditOpen(true)}
                className="w-full py-2.5 bg-slate-100 text-slate-400 font-bold rounded-xl hover:bg-[#2dd4bf] hover:text-white transition-colors text-sm md:text-base"
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