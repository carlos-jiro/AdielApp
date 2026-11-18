import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import {
  AlertCircle,
  ArrowLeft,
  ArrowDownToLine,
  FileText,
  LoaderCircle,
  Music2,
  Pause,
  Pencil,
  Play,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { useSongDetails } from './hooks/useSongDetails';
import UploadSongModal from './components/UploadSongModal';
import { supabase } from '../../lib/supabaseClient';
import type { Song, SongAsset, SongAssetType } from '../../lib/types';

const AUDIO_ORDER: SongAssetType[] = ['pista', 'soprano', 'contralto', 'tenor', 'baritono', 'bajo'];
const ASSET_LABELS: Record<SongAssetType, string> = {
  pista: 'Pista completa',
  soprano: 'Soprano',
  contralto: 'Contralto',
  tenor: 'Tenor',
  baritono: 'Barítono',
  bajo: 'Bajo',
  pdf: 'PDF anterior',
};

const getLyricsText = (song: Song) => {
  const lyrics = song.lyrics_json;
  if (lyrics && typeof lyrics === 'object' && typeof lyrics.text === 'string') return lyrics.text;
  return '';
};

const LyricsSection = ({ song, legacyPdf, onDeleteLegacyPdf, deletingLegacyPdf, className = '' }: {
  song: Song;
  legacyPdf?: SongAsset;
  onDeleteLegacyPdf: (id: string) => void;
  deletingLegacyPdf: boolean;
  className?: string;
}) => {
  const [lyricsText, setLyricsText] = useState(() => getLyricsText(song));
  const [draft, setDraft] = useState(() => getLyricsText(song));
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const saveLyrics = async () => {
    setSaving(true);
    setErrorMessage('');
    try {
      const { error } = await supabase
        .from('songs')
        .update({ lyrics_json: { text: draft.trimEnd() } })
        .eq('id', song.id);
      if (error) throw error;
      setLyricsText(draft.trimEnd());
      setIsEditing(false);
    } catch (error) {
      const databaseError = error as { code?: string; message?: string };
      const message = databaseError?.message || '';
      if (databaseError?.code === '42703' || databaseError?.code === 'PGRST204' || message.includes('lyrics_json')) {
        setErrorMessage('Falta aplicar la migración de lyrics_json en el proyecto Supabase de AdielApp. La letra no se perdió; vuelve a guardar cuando la columna esté creada.');
      } else {
        setErrorMessage(error instanceof Error ? error.message : 'No se pudo guardar la letra.');
      }
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => {
    setDraft(lyricsText);
    setErrorMessage('');
    setIsEditing(false);
  };

  return (
    <section className={`min-h-[320px] min-w-0 flex-col border-t border-cyan-100/[0.08] p-3 md:p-4 xl:min-h-0 xl:border-l xl:border-t-0 ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-cyan-100/[0.08] pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-cyan-100/10 bg-cyan-300/[0.06] text-cyan-200"><FileText size={16} /></span>
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-cyan-100/40">Contenido</p>
            <h2 className="truncate text-sm font-bold text-white">Letra</h2>
          </div>
        </div>
        {!isEditing ? (
          <button onClick={() => { setDraft(lyricsText); setIsEditing(true); }} className="inline-flex shrink-0 items-center gap-1.5 border border-cyan-100/10 px-2.5 py-1.5 text-[11px] font-semibold text-cyan-50/65 transition hover:bg-white/[0.05] hover:text-white">
            <Pencil size={13} /> {lyricsText ? 'Editar' : 'Escribir'}
          </button>
        ) : (
          <div className="flex shrink-0 items-center gap-1.5">
            <button onClick={cancelEditing} disabled={saving} className="inline-flex items-center gap-1 border border-cyan-100/10 px-2 py-1.5 text-[10px] font-semibold text-cyan-50/55 hover:text-white"><X size={13} /> Cancelar</button>
            <button onClick={() => void saveLyrics()} disabled={saving} className="inline-flex items-center gap-1 bg-cyan-300 px-2.5 py-1.5 text-[10px] font-bold text-[#06252b] hover:bg-cyan-200 disabled:opacity-50">
              {saving ? <LoaderCircle size={13} className="animate-spin" /> : <Save size={13} />} Guardar
            </button>
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col pt-3">
        {isEditing ? (
          <textarea
            autoFocus
            value={draft}
            onChange={event => setDraft(event.target.value)}
            placeholder={'Escribe o pega la letra aquí…\n\nPuedes separar versos y coros con líneas en blanco.'}
            aria-label="Letra del canto"
            className="min-h-[220px] w-full flex-1 resize-y border border-cyan-100/10 bg-[#082a33] p-3 text-sm leading-6 text-white outline-none placeholder:text-cyan-100/30 focus:border-cyan-300/35 focus:ring-2 focus:ring-cyan-400/10"
          />
        ) : lyricsText.trim() ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 text-center text-base font-semibold leading-8 text-cyan-50/90 md:px-8 md:text-lg md:leading-9">
            <pre className="mx-auto max-w-[58ch] whitespace-pre-wrap font-sans">{lyricsText}</pre>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
            <FileText size={22} className="text-cyan-100/25" />
            <p className="mt-2 text-xs font-semibold text-cyan-50/65">Todavía no hay letra</p>
            <p className="mt-1 max-w-[250px] text-[10px] leading-relaxed text-cyan-100/40">Guárdala como texto para que el coro pueda leerla aquí, sin descargar un PDF.</p>
            {!isEditing && <button onClick={() => setIsEditing(true)} className="mt-3 inline-flex items-center gap-1.5 border border-cyan-100/10 px-2.5 py-1.5 text-[10px] font-semibold text-cyan-100/70 hover:bg-white/5"><Pencil size={12} /> Escribir letra</button>}
          </div>
        )}

        {errorMessage && <p role="alert" className="mt-2 flex items-center gap-1.5 text-[10px] text-rose-200"><AlertCircle size={13} />{errorMessage}</p>}

        {legacyPdf && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-cyan-100/[0.08] pt-2.5">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-amber-100/70">PDF anterior conservado</p>
              <p className="max-w-[240px] truncate text-[10px] text-cyan-100/35">{legacyPdf.display_name || 'Archivo adjunto antiguo'}</p>
            </div>
            <div className="flex items-center gap-2">
              <a href={legacyPdf.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-100/65 hover:text-white"><ArrowDownToLine size={12} /> Abrir</a>
              <button onClick={() => onDeleteLegacyPdf(legacyPdf.id)} disabled={deletingLegacyPdf} className="border-l border-cyan-100/10 pl-2 text-[10px] text-rose-200/65 hover:text-rose-200 disabled:opacity-40">Eliminar</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const SongDetailView = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { song, assets, loading, refetch } = useSongDetails(id);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<'tracks' | 'lyrics'>('tracks');
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);
  const [deletingSong, setDeletingSong] = useState(false);

  const playQueue = useAppStore(state => state.playQueue);
  const activeTrack = useAppStore(state => state.activeTrack);
  const isPlaying = useAppStore(state => state.isPlaying);

  const legacyPdf = assets.find(asset => asset.type === 'pdf');
  const audioAssets = assets
    .filter(asset => asset.type !== 'pdf')
    .sort((a, b) => AUDIO_ORDER.indexOf(a.type) - AUDIO_ORDER.indexOf(b.type));

  const handlePlayAsset = (assetId: string) => {
    if (!song) return;
    const queueTracks = audioAssets.map(asset => ({
      id: asset.id,
      title: song.title,
      author: ASSET_LABELS[asset.type],
      url: asset.file_url,
    }));
    const startIndex = queueTracks.findIndex(track => track.id === assetId);
    if (startIndex !== -1) playQueue(queueTracks, startIndex);
  };

  const isThisPlaying = (url: string) => isPlaying && activeTrack?.url === url;

  const parseJsonSafe = async (response: Response) => {
    try {
      return await response.json();
    } catch {
      const text = await response.text().catch(() => '');
      return text ? { _text: text } : {};
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    const asset = assets.find(item => item.id === assetId);
    const confirmed = confirm(`¿Eliminar “${asset?.display_name || (asset ? ASSET_LABELS[asset.type] : 'este archivo')}”?`);
    if (!confirmed) return;

    try {
      setDeletingAssetId(assetId);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('No session token');

      const response = await fetch('/api/delete-song-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ assetId }),
      });
      const result = await parseJsonSafe(response);
      if (!response.ok) throw new Error(result?.error || result?.details || result?._text || 'Error eliminando archivo');
      await refetch();
    } catch (error) {
      alert('Error eliminando archivo: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setDeletingAssetId(null);
    }
  };

  const handleDeleteSong = async () => {
    if (!song) return;
    if (!confirm('¿Eliminar este canto completo? Se borrarán sus pistas y la letra guardada.')) return;

    try {
      setDeletingSong(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('No session token');

      const response = await fetch('/api/delete-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ songId: song.id }),
      });
      const result = await parseJsonSafe(response);
      if (!response.ok) throw new Error(result?.error || result?.details || result?._text || 'Error eliminando canto');
      navigate('/projects');
    } catch (error) {
      alert('Error eliminando canto: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setDeletingSong(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-cyan-200 animate-pulse">Cargando canto…</div>;
  if (!song) return <div className="mx-auto max-w-xl p-12 text-center text-cyan-50/60">No encontramos este canto. <Link to="/projects" className="ml-1 font-semibold text-cyan-200 hover:text-white">Volver al repertorio</Link></div>;

  return (
    <div className="flex h-full min-h-0 flex-col px-4 pb-0 md:px-7 md:pb-7">
      <section className="music-panel flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-cyan-100/[0.08] px-3 py-2.5 md:px-4">
          <Link to="/projects" className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-cyan-100/50 hover:text-cyan-100"><ArrowLeft size={14} /> Repertorio</Link>
          <div className="flex min-w-0 items-center gap-2 text-[11px] text-cyan-100/50">
            <span className="max-w-[55vw] truncate">{song.author || 'Autor no especificado'}</span>
            {song.tone && <><span className="text-cyan-100/25">·</span><span className="shrink-0">Tono {song.tone}</span></>}
          </div>
        </header>

        <nav aria-label="Secciones del canto" role="tablist" className="flex shrink-0 border-b border-cyan-100/[0.08] xl:hidden">
          <button role="tab" aria-selected={mobileSection === 'tracks'} onClick={() => setMobileSection('tracks')} className={`flex-1 border-b-2 px-3 py-2.5 text-xs font-semibold ${mobileSection === 'tracks' ? 'border-cyan-300 text-cyan-100' : 'border-transparent text-cyan-100/45'}`}>
            <Music2 size={14} className="mr-1.5 inline" /> Pistas
          </button>
          <button role="tab" aria-selected={mobileSection === 'lyrics'} onClick={() => setMobileSection('lyrics')} className={`flex-1 border-b-2 px-3 py-2.5 text-xs font-semibold ${mobileSection === 'lyrics' ? 'border-cyan-300 text-cyan-100' : 'border-transparent text-cyan-100/45'}`}>
            <FileText size={14} className="mr-1.5 inline" /> Letra
          </button>
        </nav>

        <div className="custom-scrollbar grid min-h-0 flex-1 grid-cols-1 overflow-y-auto xl:grid-cols-2 xl:overflow-hidden">
          <section className={`min-h-[320px] min-w-0 flex-col border-b border-cyan-100/[0.08] p-3 md:p-4 xl:min-h-0 xl:border-b-0 xl:border-r ${mobileSection === 'tracks' ? 'flex' : 'hidden xl:flex'}`}>
            <div className="mb-2 flex items-center justify-between gap-3 border-b border-cyan-100/[0.08] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center border border-cyan-100/10 bg-cyan-300/[0.06] text-cyan-200"><Music2 size={16} /></span>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-cyan-100/40">Material de ensayo</p>
                  <h2 className="text-sm font-bold text-white">Pistas</h2>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="mr-1 text-[10px] text-cyan-100/45">{audioAssets.length} {audioAssets.length === 1 ? 'pista' : 'pistas'}</span>
                <button onClick={() => setIsEditOpen(true)} className="inline-flex items-center gap-1 border border-cyan-100/10 px-2 py-1.5 text-[10px] font-semibold text-cyan-50/70 hover:bg-white/[0.05] hover:text-white"><Pencil size={12} /> Editar</button>
                <button onClick={handleDeleteSong} disabled={deletingSong} aria-label="Eliminar canto" title="Eliminar canto" className="border border-rose-300/15 p-1.5 text-rose-200/65 hover:bg-rose-400/10 hover:text-rose-200 disabled:opacity-40"><Trash2 size={13} /></button>
              </div>
            </div>

            {audioAssets.length ? (
              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="hidden grid-cols-[40px_minmax(100px,.7fr)_minmax(0,1.4fr)_90px] gap-2 border-b border-cyan-100/[0.07] px-2 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-cyan-100/35 sm:grid">
                  <span /> <span>Parte</span> <span>Archivo</span> <span className="text-right">Acciones</span>
                </div>
                {audioAssets.map((asset, index) => {
                  const playing = isThisPlaying(asset.file_url);
                  return (
                    <div key={asset.id} className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-2 border-b border-cyan-100/[0.06] px-1.5 py-2.5 last:border-0 sm:grid-cols-[40px_minmax(100px,.7fr)_minmax(0,1.4fr)_90px] sm:px-2">
                      <button onClick={() => handlePlayAsset(asset.id)} aria-label={`${playing ? 'Pausar' : 'Reproducir'} ${ASSET_LABELS[asset.type]}`} className={`flex h-8 w-8 items-center justify-center ${playing ? 'bg-cyan-300 text-[#06252b]' : 'border border-cyan-100/10 text-cyan-100/70 hover:bg-cyan-300/10 hover:text-cyan-100'}`}>
                        {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                      </button>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-semibold text-white/85">{ASSET_LABELS[asset.type]}</span>
                        {playing && <span className="text-[9px] font-medium text-cyan-200">Reproduciendo</span>}
                      </span>
                      <span className="hidden min-w-0 truncate text-[11px] text-cyan-100/45 sm:block">{asset.display_name || `Pista ${index + 1}`}</span>
                      <span className="flex items-center justify-end gap-1">
                        <a href={asset.file_url} download aria-label={`Descargar ${ASSET_LABELS[asset.type]}`} title="Descargar pista" className="p-2 text-cyan-100/45 hover:bg-white/[0.05] hover:text-cyan-100"><ArrowDownToLine size={14} /></a>
                        <button onClick={() => void handleDeleteAsset(asset.id)} disabled={deletingAssetId === asset.id || deletingSong} aria-label={`Eliminar ${ASSET_LABELS[asset.type]}`} title="Eliminar pista" className="p-2 text-rose-200/45 hover:bg-rose-400/10 hover:text-rose-200 disabled:opacity-40"><Trash2 size={13} /></button>
                      </span>
                      <span className="col-span-2 truncate text-[10px] text-cyan-100/35 sm:hidden">{asset.display_name || `Pista ${index + 1}`}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-h-40 flex-1 flex-col items-center justify-center px-4 py-8 text-center">
                <Music2 size={21} className="text-cyan-100/30" />
                <p className="mt-2 text-xs font-semibold text-cyan-50/65">No hay pistas cargadas</p>
                <button onClick={() => setIsEditOpen(true)} className="mt-2 text-[11px] font-semibold text-cyan-200 hover:text-white">Agregar pistas</button>
              </div>
            )}
          </section>

          <LyricsSection
            key={song.id}
            song={song}
            legacyPdf={legacyPdf}
            onDeleteLegacyPdf={handleDeleteAsset}
            deletingLegacyPdf={Boolean(legacyPdf && deletingAssetId === legacyPdf.id)}
            className={mobileSection === 'lyrics' ? 'flex' : 'hidden xl:flex'}
          />
        </div>
      </section>

      <UploadSongModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        projectId={song.project_id || undefined}
        onRefresh={refetch}
        existingSong={{ id: song.id, title: song.title, author: song.author, tone: song.tone }}
        existingAssets={assets}
      />
    </div>
  );
};

export default SongDetailView;
