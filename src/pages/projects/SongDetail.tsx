import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import type { Song, SongAsset } from '../../lib/types';
import { ArrowLeft, Music, FileText, Download, PlayCircle, Edit } from 'lucide-react';
import UploadSongModal from '../../components/UploadSongModal'; // <--- 1. Importar Modal

const SongDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [song, setSong] = useState<Song | null>(null);
  const [assets, setAssets] = useState<SongAsset[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 2. Estado para el modal de edición
  const [isEditOpen, setIsEditOpen] = useState(false);

  async function fetchSongData() {
    try {
      setLoading(true);
      // Traer Canto
      const { data: songData, error: songError } = await supabase
        .from('songs').select('*').eq('id', id).single();
      if (songError) throw songError;

      // Traer Archivos
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

  if (loading) return <div className="p-20 text-center text-[#2dd4bf] animate-pulse">Cargando materiales...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Link to={`/projects`} className="flex items-center gap-2 text-slate-500 hover:text-[#2dd4bf] transition-colors w-fit">
        <ArrowLeft size={20} /> <span>Volver al disco</span>
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-slate-800">{song?.title}</h1>
            {/* 3. Botón de Editar */}
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
                <div key={asset.id} className="glass p-4 rounded-2xl flex flex-col gap-3 border border-white/50 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2dd4bf]/20 flex items-center justify-center text-[#2dd4bf]">
                        <PlayCircle size={18} />
                      </div>
                      <span className="font-bold text-slate-700 uppercase text-sm tracking-wide">{asset.type}</span>
                    </div>
                    <a href={asset.file_url} download className="text-slate-400 hover:text-[#2dd4bf]" title="Descargar MP3">
                      <Download size={18} />
                    </a>
                  </div>
                  <audio controls className="w-full h-8 accent-[#2dd4bf]">
                    <source src={asset.file_url} type="audio/mpeg" />
                    Tu navegador no soporta el elemento de audio.
                  </audio>
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

      {/* 4. Renderizar el Modal en Modo Edición */}
      {song && (
        <UploadSongModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          projectId={song.project_id} // Necesario aunque no creemos uno nuevo
          onRefresh={fetchSongData}   // Recargar datos al guardar
          existingSong={{ id: song.id, title: song.title }} // PASAMOS LOS DATOS ACTUALES
        />
      )}
    </div>
  );
};

export default SongDetail;

