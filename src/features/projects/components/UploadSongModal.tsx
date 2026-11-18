import { useEffect, useState } from 'react';
import * as tus from 'tus-js-client';
import { supabase } from '../../../lib/supabaseClient';
import { AlertCircle, Check, FileAudio2, FileText, LoaderCircle, Music2, Save, Upload, X } from 'lucide-react';
import { ModalLayout } from '../../../components/ui/ModalLayout';
import type { SongAsset, SongAssetType } from '../../../lib/types';

interface SongDraft {
  id: string;
  title: string;
  author?: string | null;
  tone?: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  onRefresh: () => void | Promise<void>;
  existingSong?: SongDraft | null;
  existingAssets?: SongAsset[];
}

type UploadState = {
  status: 'uploading' | 'done' | 'error';
  progress: number;
  message?: string;
};

const AUDIO_ROLES: { type: SongAssetType; label: string; hint: string }[] = [
  { type: 'pista', label: 'Pista completa', hint: 'Acompañamiento o referencia general' },
  { type: 'soprano', label: 'Soprano', hint: 'Práctica por cuerda' },
  { type: 'contralto', label: 'Contralto', hint: 'Práctica por cuerda' },
  { type: 'tenor', label: 'Tenor', hint: 'Práctica por cuerda' },
  { type: 'baritono', label: 'Barítono', hint: 'Práctica por cuerda' },
  { type: 'bajo', label: 'Bajo', hint: 'Práctica por cuerda' },
];

const MAX_AUDIO_SIZE = 100 * 1024 * 1024;
const MAX_PDF_SIZE = 25 * 1024 * 1024;
const RESUMABLE_THRESHOLD = 6 * 1024 * 1024;

const formatBytes = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getStoragePath = (publicUrl: string) => {
  const marker = '/storage/v1/object/public/music_assets/';
  const markerIndex = publicUrl.indexOf(marker);
  if (markerIndex === -1) return null;

  try {
    return decodeURIComponent(publicUrl.slice(markerIndex + marker.length));
  } catch {
    return publicUrl.slice(markerIndex + marker.length);
  }
};

const UploadSongModal = ({ isOpen, onClose, projectId, onRefresh, existingSong, existingAssets = [] }: Props) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [tone, setTone] = useState('');
  const [draftSongId, setDraftSongId] = useState<string | null>(null);
  const [files, setFiles] = useState<Partial<Record<SongAssetType, File>>>({});
  const [activeAssets, setActiveAssets] = useState<SongAsset[]>([]);
  const [uploadStates, setUploadStates] = useState<Partial<Record<SongAssetType, UploadState>>>({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setFormError('');
    setUploadStates({});
    setFiles({});

    if (existingSong) {
      setTitle(existingSong.title || '');
      setAuthor(existingSong.author || '');
      setTone(existingSong.tone || '');
      setDraftSongId(existingSong.id);
      setActiveAssets(existingAssets);
      return;
    }

    if (!draftSongId) {
      setTitle('');
      setAuthor('');
      setTone('');
      setActiveAssets([]);
    }
    // Keep an incomplete new song draft if a large file needs to be retried.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, existingSong?.id]);

  const getFileError = (type: SongAssetType, file: File) => {
    if (!file.size) return 'El archivo está vacío.';

    if (type === 'pdf') {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) return 'Selecciona un documento PDF.';
      if (file.size > MAX_PDF_SIZE) return 'El PDF supera el límite de 25 MB.';
      return '';
    }

    const audioExtensions = /\.(mp3|wav|m4a|aac|ogg|flac)$/i;
    if (!file.type.startsWith('audio/') && !audioExtensions.test(file.name)) {
      return 'Usa un archivo de audio MP3, WAV, M4A, AAC, OGG o FLAC.';
    }
    if (file.size > MAX_AUDIO_SIZE) return 'El audio supera el límite de 100 MB.';
    return '';
  };

  const chooseFile = (type: SongAssetType, file?: File) => {
    if (!file) return;
    const error = getFileError(type, file);
    if (error) {
      setFormError(error);
      return;
    }

    setFormError('');
    setFiles(current => ({ ...current, [type]: file }));
    setUploadStates(current => ({ ...current, [type]: undefined }));
  };

  const uploadLargeFile = async (file: File, path: string, accessToken: string, onProgress: (value: number) => void) => {
    const projectUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL;
    const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;
    if (!projectUrl || !apiKey) throw new Error('Faltan las variables de conexión de Supabase.');

    const endpointUrl = new URL(projectUrl);
    if (endpointUrl.hostname.endsWith('.supabase.co')) {
      endpointUrl.hostname = endpointUrl.hostname.replace(/\.supabase\.co$/, '.storage.supabase.co');
    }

    await new Promise<void>((resolve, reject) => {
      const upload = new tus.Upload(file, {
        endpoint: `${endpointUrl.origin}/storage/v1/upload/resumable`,
        retryDelays: [0, 1000, 3000, 5000, 10000],
        headers: {
          authorization: `Bearer ${accessToken}`,
          apikey: apiKey,
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        chunkSize: RESUMABLE_THRESHOLD,
        metadata: {
          bucketName: 'music_assets',
          objectName: path,
          contentType: file.type || (path.endsWith('.pdf') ? 'application/pdf' : 'audio/mpeg'),
          cacheControl: '3600',
        },
        onError: reject,
        onProgress: (uploaded, total) => onProgress(Math.round((uploaded / total) * 100)),
        onSuccess: () => resolve(),
      });

      upload.findPreviousUploads()
        .then(previousUploads => {
          if (previousUploads.length) upload.resumeFromPreviousUpload(previousUploads[0]);
          upload.start();
        })
        .catch(reject);
    });
  };

  const uploadFile = async (file: File, songId: string, type: SongAssetType, accessToken: string, onProgress: (value: number) => void) => {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const path = `songs/${songId}/${type}/${crypto.randomUUID()}.${extension}`;
    const contentType = file.type || (extension === 'pdf' ? 'application/pdf' : 'audio/mpeg');

    if (file.size > RESUMABLE_THRESHOLD) {
      await uploadLargeFile(file, path, accessToken, onProgress);
    } else {
      const { error } = await supabase.storage
        .from('music_assets')
        .upload(path, file, { cacheControl: '3600', contentType, upsert: false });
      if (error) throw error;
      onProgress(100);
    }

    const { data } = supabase.storage.from('music_assets').getPublicUrl(path);
    return { path, publicUrl: data.publicUrl };
  };

  const saveSong = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setFormError('Escribe el título del canto.');
      return;
    }

    setLoading(true);
    setFormError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('La sesión expiró. Inicia sesión de nuevo.');

      let songId = existingSong?.id || draftSongId;
      if (!songId) {
        const { data, error } = await supabase
          .from('songs')
          .insert({
            title: cleanTitle,
            author: author.trim(),
            tone: tone.trim(),
            project_id: projectId || null,
          })
          .select('id')
          .single();
        if (error) throw error;
        songId = data.id;
        setDraftSongId(songId);
      } else {
        const { error } = await supabase
          .from('songs')
          .update({ title: cleanTitle, author: author.trim(), tone: tone.trim() })
          .eq('id', songId);
        if (error) throw error;
      }

      if (!songId) throw new Error('No se pudo identificar el canto guardado.');
      const savedSongId = songId;

      if (projectId) {
        const { data: existingLink, error: lookupError } = await supabase
          .from('project_songs')
          .select('song_id')
          .eq('project_id', projectId)
          .eq('song_id', savedSongId)
          .maybeSingle();
        if (lookupError) throw lookupError;
        if (!existingLink) {
          const { error: linkError } = await supabase.from('project_songs').insert({ project_id: projectId, song_id: savedSongId });
          if (linkError) throw linkError;
        }
      }

      const selectedFiles = Object.entries(files) as [SongAssetType, File][];
      let failedUploads = 0;

      for (const [type, file] of selectedFiles) {
        setUploadStates(current => ({ ...current, [type]: { status: 'uploading', progress: 0 } }));
        let uploadedPath: string | null = null;

        try {
          const uploaded = await uploadFile(file, savedSongId, type, session.access_token, progress => {
            setUploadStates(current => ({ ...current, [type]: { status: 'uploading', progress } }));
          });
          uploadedPath = uploaded.path;

          const previousAsset = activeAssets.find(asset => asset.type === type);
          const assetPayload = {
            song_id: savedSongId,
            type,
            file_url: uploaded.publicUrl,
            display_name: file.name,
          };

          const result = previousAsset
            ? await supabase.from('song_assets').update(assetPayload).eq('id', previousAsset.id).select().single()
            : await supabase.from('song_assets').insert(assetPayload).select().single();

          if (result.error) throw result.error;
          const savedAsset = result.data as SongAsset;
          setActiveAssets(current => [...current.filter(asset => asset.id !== savedAsset.id && asset.type !== type), savedAsset]);

          if (previousAsset) {
            const oldPath = getStoragePath(previousAsset.file_url);
            if (oldPath) {
              const { error: removeError } = await supabase.storage.from('music_assets').remove([oldPath]);
              if (removeError) console.warn('El archivo anterior quedó en Storage para limpieza posterior:', removeError.message);
            }
          }

          setUploadStates(current => ({ ...current, [type]: { status: 'done', progress: 100 } }));
          setFiles(current => ({ ...current, [type]: undefined }));
        } catch (error) {
          failedUploads += 1;
          if (uploadedPath) {
            await supabase.storage.from('music_assets').remove([uploadedPath]).catch(() => undefined);
          }
          setUploadStates(current => ({
            ...current,
            [type]: { status: 'error', progress: 0, message: error instanceof Error ? error.message : 'No se pudo subir el archivo.' },
          }));
        }
      }

      await onRefresh();
      if (failedUploads) {
        setFormError(`${failedUploads} archivo(s) no se pudieron subir. El canto quedó guardado; puedes reintentar sin perder lo demás.`);
        return;
      }

      setDraftSongId(null);
      setTitle('');
      setAuthor('');
      setTone('');
      setFiles({});
      setUploadStates({});
      onClose();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo guardar el canto.');
    } finally {
      setLoading(false);
    }
  };

  const renderFileRole = (type: SongAssetType, label: string, hint: string, accept: string) => {
    const selectedFile = files[type];
    const currentAsset = activeAssets.find(asset => asset.type === type);
    const state = uploadStates[type];

    return (
      <div
        key={type}
        onDragOver={event => event.preventDefault()}
        onDrop={event => { event.preventDefault(); chooseFile(type, event.dataTransfer.files[0]); }}
        className="rounded-2xl border border-cyan-100/10 bg-[#082a33]/70 p-3.5 transition-colors hover:border-cyan-300/25"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-cyan-400/10 p-2.5 text-cyan-200">
            {type === 'pdf' ? <FileText size={18} /> : <FileAudio2 size={18} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-cyan-50">{label}</p>
            <p className="mt-0.5 text-[11px] text-cyan-100/45">{hint}</p>
            {selectedFile ? (
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-xs text-white/80">{selectedFile.name} <span className="text-cyan-100/40">· {formatBytes(selectedFile.size)}</span></p>
                {!loading && <button type="button" onClick={() => setFiles(current => ({ ...current, [type]: undefined }))} className="shrink-0 rounded-lg p-1 text-cyan-100/45 hover:bg-white/5 hover:text-white" aria-label={`Quitar archivo de ${label}`}><X size={14} /></button>}
              </div>
            ) : currentAsset ? (
              <p className="mt-2 truncate text-xs text-emerald-200/80"><Check size={12} className="mr-1 inline" />{currentAsset.display_name || 'Archivo cargado'}</p>
            ) : (
              <p className="mt-2 text-xs text-cyan-100/35">Sin archivo</p>
            )}
            {state?.status === 'uploading' && (
              <div className="mt-2.5">
                <div className="mb-1 flex justify-between text-[10px] text-cyan-100/55"><span>Subiendo…</span><span>{state.progress}%</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${state.progress}%` }} /></div>
              </div>
            )}
            {state?.status === 'done' && <p className="mt-2 text-[11px] text-emerald-200">Listo</p>}
            {state?.status === 'error' && <p className="mt-2 text-[11px] text-rose-300">{state.message}</p>}
          </div>
          <label className="relative shrink-0 cursor-pointer rounded-lg border border-cyan-100/10 px-2.5 py-1.5 text-[11px] font-semibold text-cyan-100/75 transition hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-white">
            {selectedFile || currentAsset ? 'Reemplazar' : 'Elegir'}
            <input type="file" accept={accept} className="sr-only" disabled={loading} onChange={event => { chooseFile(type, event.target.files?.[0]); event.currentTarget.value = ''; }} />
          </label>
        </div>
      </div>
    );
  };

  const handleClose = () => {
    if (!loading) onClose();
  };

  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={handleClose}
      title={existingSong ? 'Editar canto' : draftSongId ? 'Completar canto' : 'Nuevo canto'}
      icon={existingSong ? <Save className="text-cyan-300" size={22} /> : <Upload className="text-cyan-300" size={22} />}
      themeColor="#22c7d8"
      maxWidth="max-w-3xl"
    >
      <form onSubmit={saveSong} className="space-y-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1.5fr)_minmax(130px,.7fr)]">
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-100/65">Título <span className="text-cyan-300">*</span></span>
            <input required maxLength={180} value={title} onChange={event => setTitle(event.target.value)} placeholder="Ej. Grande es tu fidelidad" className="w-full rounded-xl border border-cyan-100/10 bg-[#082a33] px-4 py-3 text-sm text-white outline-none placeholder:text-cyan-100/30 focus:border-cyan-300/35 focus:ring-2 focus:ring-cyan-400/20" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-100/65">Tono</span>
            <input maxLength={20} value={tone} onChange={event => setTone(event.target.value)} placeholder="Ej. Sol mayor" className="w-full rounded-xl border border-cyan-100/10 bg-[#082a33] px-4 py-3 text-sm text-white outline-none placeholder:text-cyan-100/30 focus:border-cyan-300/35 focus:ring-2 focus:ring-cyan-400/20" />
          </label>
          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-100/65">Autor / compositor</span>
            <input maxLength={160} value={author} onChange={event => setAuthor(event.target.value)} placeholder="Nombre del autor" className="w-full rounded-xl border border-cyan-100/10 bg-[#082a33] px-4 py-3 text-sm text-white outline-none placeholder:text-cyan-100/30 focus:border-cyan-300/35 focus:ring-2 focus:ring-cyan-400/20" />
          </label>
        </section>

        <section>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white">Pistas de audio</h3>
              <p className="mt-1 text-xs text-cyan-100/45">La letra se escribe como texto en el detalle del canto. Aquí administras las pistas.</p>
            </div>
            <p className="text-[10px] text-cyan-100/35">Audio hasta 100 MB</p>
          </div>

          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
            {AUDIO_ROLES.map(role => renderFileRole(role.type, role.label, role.hint, 'audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac'))}
          </div>
          <p className="mt-2 text-[10px] text-cyan-100/35">Suelta un archivo sobre su categoría o usa “Elegir”.</p>
        </section>

        {formError && (
          <div role="alert" className="flex gap-2 rounded-xl border border-rose-300/20 bg-rose-400/10 px-3.5 py-3 text-xs text-rose-100/90">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-300" />
            <span>{formError}</span>
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-cyan-100/10 pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={handleClose} disabled={loading} className="rounded-xl border border-cyan-100/10 px-4 py-2.5 text-sm font-semibold text-cyan-50/70 transition hover:bg-white/5 hover:text-white disabled:opacity-40">Cerrar</button>
          <button disabled={loading} type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-bold text-[#06252b] transition hover:bg-cyan-300 disabled:cursor-wait disabled:opacity-60">
            {loading ? <><LoaderCircle size={16} className="animate-spin" /> Guardando…</> : <><Music2 size={16} /> {existingSong || draftSongId ? 'Guardar cambios' : 'Guardar canto'}</>}
          </button>
        </div>
      </form>
    </ModalLayout>
  );
};

export default UploadSongModal;
