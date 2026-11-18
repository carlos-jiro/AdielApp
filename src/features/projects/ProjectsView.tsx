import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowDownAZ,
  ArrowDownUp,
  ArrowRight,
  AudioLines,
  FileText,
  FolderPlus,
  Headphones,
  ListMusic,
  LoaderCircle,
  Music2,
  Play,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../lib/supabaseClient';
import type { Project, Song, SongAsset, SongAssetType } from '../../lib/types';
import CreateProjectModal from './components/CreateProjectModal';
import UploadSongModal from './components/UploadSongModal';
import AddExistingSongModal from './components/AddExistingSongModal';
import { useProjects } from './hooks/useProjects';
import { useProjectSongs } from './hooks/useProjectSongs';

type ResourceFilter = 'all' | 'audio' | 'lyrics';
type SortField = 'title' | 'author' | 'tone';
type RepertoireTab = 'library' | 'collections';

const AUDIO_ORDER: SongAssetType[] = ['pista', 'soprano', 'contralto', 'tenor', 'baritono', 'bajo'];
const ROLE_LABELS: Record<SongAssetType, string> = {
  pista: 'Pista',
  soprano: 'Soprano',
  contralto: 'Contralto',
  tenor: 'Tenor',
  baritono: 'Barítono',
  bajo: 'Bajo',
  pdf: 'PDF',
};

const loadSongAssets = () => supabase
  .from('song_assets')
  .select('id, song_id, type, file_url, display_name');

const loadProjectSongCounts = async () => {
  const { data, error } = await supabase.from('project_songs').select('project_id');
  if (error) throw error;
  return (data || []).reduce<Record<string, number>>((counts, item) => {
    counts[item.project_id] = (counts[item.project_id] || 0) + 1;
    return counts;
  }, {});
};

const ProjectsView = () => {
  const allSongs = useAppStore(state => state.songs);
  const fetchSongs = useAppStore(state => state.fetchSongs);
  const playQueue = useAppStore(state => state.playQueue);
  const { projects, loadingProjects, fetchProjects, deleteProject } = useProjects();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: RepertoireTab = searchParams.get('view') === 'collections' ? 'collections' : 'library';
  const selectedProjectId = searchParams.get('project') || 'ALL';
  const setSelectedProjectId = (projectId: string | 'ALL') => {
    setSearchParams(projectId === 'ALL' ? {} : { project: projectId });
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceFilter, setResourceFilter] = useState<ResourceFilter>('all');
  const [sortField, setSortField] = useState<SortField>('title');
  const [ascending, setAscending] = useState(true);
  const [songAssets, setSongAssets] = useState<SongAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [projectSongCounts, setProjectSongCounts] = useState<Record<string, number>>({});
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSongModalOpen, setIsSongModalOpen] = useState(false);
  const [isAddExistingModalOpen, setIsAddExistingModalOpen] = useState(false);

  const selectedProject = selectedProjectId === 'ALL'
    ? 'ALL'
    : projects.find(project => project.id === selectedProjectId) || null;
  const { displayedSongs, loadingSongs, addSongToProject, removeSongFromProject } = useProjectSongs(selectedProject, allSongs);

  const changeTab = (tab: RepertoireTab) => {
    setSearchParams(tab === 'collections' ? { view: 'collections' } : {});
  };

  const fetchAssets = useCallback(async () => {
    try {
      const { data, error } = await loadSongAssets();
      if (error) throw error;
      setSongAssets((data || []) as SongAsset[]);
    } catch (error) {
      console.error('No se pudieron cargar los materiales del repertorio:', error);
      setSongAssets([]);
    } finally {
      setLoadingAssets(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const { data, error } = await loadSongAssets();
        if (error) throw error;
        if (active) setSongAssets((data || []) as SongAsset[]);
      } catch (error) {
        if (active) {
          console.error('No se pudieron cargar los materiales del repertorio:', error);
          setSongAssets([]);
        }
      } finally {
        if (active) setLoadingAssets(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  const refreshProjectSongCounts = useCallback(async () => {
    try {
      setProjectSongCounts(await loadProjectSongCounts());
    } catch (error) {
      console.error('No se pudieron cargar los conteos de colecciones:', error);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const counts = await loadProjectSongCounts();
        if (active) setProjectSongCounts(counts);
      } catch (error) {
        if (active) console.error('No se pudieron cargar los conteos de colecciones:', error);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  const assetsBySong = useMemo(() => {
    const map = new Map<string, SongAsset[]>();
    songAssets.forEach(asset => {
      map.set(asset.song_id, [...(map.get(asset.song_id) || []), asset]);
    });
    return map;
  }, [songAssets]);

  const visibleSongs = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase();
    const filtered = displayedSongs.filter(song => {
      const lyricsText = song.lyrics_json && typeof song.lyrics_json.text === 'string' ? song.lyrics_json.text : '';
      const searchableText = [song.title, song.author || '', song.tone || '', lyricsText].join(' ').toLocaleLowerCase();
      const matchesSearch = !query || searchableText.includes(query);
      const assets = assetsBySong.get(song.id) || [];
      const hasLyrics = Boolean(lyricsText.trim());
      const matchesResource = resourceFilter === 'all'
        || (resourceFilter === 'audio' && assets.some(asset => asset.type !== 'pdf'))
        || (resourceFilter === 'lyrics' && hasLyrics);
      return matchesSearch && matchesResource;
    });

    return filtered.sort((left, right) => {
      const leftValue = (left[sortField] || '').toLocaleLowerCase();
      const rightValue = (right[sortField] || '').toLocaleLowerCase();
      if (!leftValue && rightValue) return 1;
      if (leftValue && !rightValue) return -1;
      return leftValue.localeCompare(rightValue, 'es') * (ascending ? 1 : -1);
    });
  }, [assetsBySong, ascending, displayedSongs, resourceFilter, searchTerm, sortField]);

  const handleRefresh = async () => {
    setLoadingAssets(true);
    await Promise.all([fetchSongs(), fetchAssets(), fetchProjects(), refreshProjectSongCounts()]);
  };

  const handleRefreshProjects = async () => {
    await Promise.all([fetchProjects(), refreshProjectSongCounts()]);
  };

  const handleDeleteProject = async (project: Project, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!window.confirm(`¿Eliminar la colección “${project.name}”? Los cantos de la biblioteca no se borrarán.`)) return;

    try {
      await deleteProject(project.id);
      setProjectSongCounts(current => {
        const next = { ...current };
        delete next[project.id];
        return next;
      });
      if (selectedProjectId === project.id) setSelectedProjectId('ALL');
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No se pudo eliminar la colección.');
    }
  };

  const handleAddSongToProject = async (songId: string) => {
    if (!selectedProject || selectedProject === 'ALL') return;
    try {
      await addSongToProject(selectedProject.id, songId, allSongs);
      setProjectSongCounts(current => ({ ...current, [selectedProject.id]: (current[selectedProject.id] || 0) + 1 }));
      setIsAddExistingModalOpen(false);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No se pudo agregar el canto.');
    }
  };

  const handlePlaySong = (song: Song) => {
    const audioAssets = (assetsBySong.get(song.id) || [])
      .filter(asset => asset.type !== 'pdf')
      .sort((a, b) => AUDIO_ORDER.indexOf(a.type) - AUDIO_ORDER.indexOf(b.type));

    if (!audioAssets.length) return;
    playQueue(audioAssets.map(asset => ({
      id: asset.id,
      title: song.title,
      author: ROLE_LABELS[asset.type],
      url: asset.file_url,
    })));
  };

  const handleRemoveSongFromProject = async (songId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!selectedProject || selectedProject === 'ALL') return;
    if (!window.confirm('Quitar este canto de la colección? El canto y sus archivos seguirán en la biblioteca.')) return;
    try {
      await removeSongFromProject(selectedProject.id, songId);
      setProjectSongCounts(current => ({ ...current, [selectedProject.id]: Math.max(0, (current[selectedProject.id] || 0) - 1) }));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No se pudo quitar el canto.');
    }
  };

  const isLoading = loadingSongs || loadingAssets;

  return (
    <div className="flex h-full min-h-0 flex-col px-4 pb-0 md:px-7 md:pb-7">
      <section className="music-panel flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* En escritorio las vistas están en el navbar global; en móvil caben aquí en la misma fila de acciones. */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-cyan-100/[0.08] px-3 py-2 md:px-4">
          <nav aria-label="Vistas del repertorio" role="tablist" className="flex shrink-0 items-center gap-1">
            <button
              role="tab"
              aria-selected={activeTab === 'library'}
              onClick={() => changeTab('library')}
              className={`inline-flex items-center gap-1.5 border-b-2 px-2 py-2 text-[11px] font-semibold transition sm:px-2.5 sm:text-xs ${activeTab === 'library' ? 'border-cyan-300 text-cyan-100' : 'border-transparent text-cyan-100/45 hover:text-cyan-50'}`}
            >
              <Music2 size={14} /> Biblioteca
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'collections'}
              onClick={() => changeTab('collections')}
              className={`inline-flex items-center gap-1.5 border-b-2 px-2 py-2 text-[11px] font-semibold transition sm:px-2.5 sm:text-xs ${activeTab === 'collections' ? 'border-cyan-300 text-cyan-100' : 'border-transparent text-cyan-100/45 hover:text-cyan-50'}`}
            >
              <FolderPlus size={14} /> Colecciones
            </button>
          </nav>

          <div className="flex items-center gap-1.5">
            <span className="whitespace-nowrap border border-cyan-100/10 bg-white/[0.035] px-2.5 py-1.5 text-[10px] text-cyan-50/60 sm:text-[11px]">
              {activeTab === 'library'
                ? (isLoading ? '…' : `${visibleSongs.length} ${visibleSongs.length === 1 ? 'canto' : 'cantos'}`)
                : (loadingProjects ? '…' : `${projects.length} ${projects.length === 1 ? 'colección' : 'colecciones'}`)}
            </span>
            {activeTab === 'library' ? (
              <button onClick={() => setIsSongModalOpen(true)} className="inline-flex items-center gap-1 bg-cyan-400 px-2 py-1.5 text-[10px] font-bold text-[#06252b] transition hover:bg-cyan-300 sm:gap-1.5 sm:px-3 sm:py-2 sm:text-xs">
                <Plus size={14} /> Nuevo canto
              </button>
            ) : (
              <button onClick={() => setIsProjectModalOpen(true)} className="inline-flex items-center gap-1 border border-cyan-100/10 bg-white/[0.045] px-2 py-1.5 text-[10px] font-semibold text-cyan-50/80 transition hover:bg-white/[0.08] sm:gap-1.5 sm:px-3 sm:py-2 sm:text-xs">
                <Plus size={14} /> Nueva colección
              </button>
            )}
          </div>
        </div>

        {activeTab === 'library' ? (
          <>
            <div className="flex shrink-0 flex-col gap-2 border-b border-cyan-100/[0.08] p-3 md:p-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative min-w-0 flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-100/35" />
                <input value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Buscar por canto, autor o tono…" className="w-full rounded-xl border border-cyan-100/10 bg-[#082a33] py-2.5 pl-9 pr-9 text-xs text-white outline-none placeholder:text-cyan-100/30 focus:border-cyan-300/30 focus:ring-2 focus:ring-cyan-400/10" />
                {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cyan-100/35 hover:text-white" aria-label="Limpiar búsqueda"><X size={14} /></button>}
              </label>

              <div className="flex gap-2">
                <label className="flex min-w-0 items-center gap-2 rounded-xl border border-cyan-100/10 bg-[#082a33] px-3 text-cyan-100/45">
                  <SlidersHorizontal size={14} className="shrink-0" />
                  <select value={resourceFilter} onChange={event => setResourceFilter(event.target.value as ResourceFilter)} className="min-w-0 bg-transparent py-2.5 text-xs text-cyan-50/75 outline-none">
                    <option value="all">Todo el material</option>
                    <option value="audio">Con audio</option>
                    <option value="lyrics">Con letra</option>
                  </select>
                </label>
                <label className="flex min-w-0 items-center gap-2 rounded-xl border border-cyan-100/10 bg-[#082a33] px-3 text-cyan-100/45">
                  <ArrowDownAZ size={14} className="shrink-0" />
                  <select value={sortField} onChange={event => setSortField(event.target.value as SortField)} className="min-w-0 bg-transparent py-2.5 text-xs text-cyan-50/75 outline-none">
                    <option value="title">Título</option>
                    <option value="author">Autor</option>
                    <option value="tone">Tono</option>
                  </select>
                  <button type="button" onClick={() => setAscending(value => !value)} aria-label={ascending ? 'Orden ascendente' : 'Orden descendente'} className="border-l border-cyan-100/10 pl-2 text-cyan-100/45 hover:text-white">
                    <ArrowDownUp size={14} className={ascending ? '' : 'rotate-180'} />
                  </button>
                </label>
              </div>
            </div>

            {selectedProject !== 'ALL' && selectedProject && (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-cyan-200/10 bg-cyan-300/[0.06] px-3 py-2">
                <p className="min-w-0 truncate text-[11px] text-cyan-50/60">Mostrando los cantos de <span className="font-semibold text-cyan-100">{selectedProject.name}</span></p>
                <div className="flex shrink-0 items-center gap-2">
                  <button onClick={() => setSelectedProjectId('ALL')} className="text-[10px] font-semibold text-cyan-100/55 hover:text-white">Ver todos</button>
                  <button onClick={() => setIsAddExistingModalOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-300/15 px-2.5 py-1.5 text-[11px] font-semibold text-cyan-100 transition hover:bg-cyan-300/25"><Plus size={13} /> Agregar del catálogo</button>
                </div>
              </div>
            )}
            </div>

            {/* Listado de cantos */}
            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-2.5 md:p-4">
            {isLoading ? (
              <div className="flex h-48 flex-col items-center justify-center gap-3 text-cyan-100/45">
                <LoaderCircle size={24} className="animate-spin text-cyan-300" />
                <p className="text-xs">Cargando biblioteca…</p>
              </div>
            ) : visibleSongs.length ? (
              <>
                <div className="hidden grid-cols-[42px_minmax(0,1.5fr)_minmax(100px,.7fr)_minmax(120px,.85fr)_76px] gap-3 px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.17em] text-cyan-100/35 md:grid">
                  <span />
                  <span>Canto</span>
                  <span>Tono</span>
                  <span>Materiales</span>
                  <span className="text-right">Abrir</span>
                </div>
                <div className="space-y-1">
                  {visibleSongs.map((song, index) => {
                    const assets = assetsBySong.get(song.id) || [];
                    const audioCount = assets.filter(asset => asset.type !== 'pdf').length;
                    const voiceCount = assets.filter(asset => ['soprano', 'contralto', 'tenor', 'baritono', 'bajo'].includes(asset.type)).length;
                    const hasReferenceTrack = assets.some(asset => asset.type === 'pista');
                    const hasLyrics = Boolean(song.lyrics_json?.text?.trim());
                    const isInProject = selectedProject !== 'ALL';
                    const canPlay = audioCount > 0;

                    return (
                      <article key={song.id} className="group flex items-center gap-3 rounded-xl border border-transparent px-2.5 py-2.5 transition hover:border-cyan-100/[0.07] hover:bg-white/[0.045] md:grid md:grid-cols-[42px_minmax(0,1.5fr)_minmax(100px,.7fr)_minmax(120px,.85fr)_76px] md:gap-3 md:px-3">
                        <button onClick={() => handlePlaySong(song)} disabled={!canPlay} aria-label={canPlay ? `Reproducir ${song.title}` : `${song.title} no tiene audio`} className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${canPlay ? 'bg-cyan-300/10 text-cyan-200 hover:bg-cyan-300 hover:text-[#06252b]' : 'bg-white/[0.04] text-cyan-100/20'}`}>
                          {canPlay ? <Play size={14} fill="currentColor" className="ml-0.5" /> : <span className="text-[10px] tabular-nums">{index + 1}</span>}
                        </button>

                        <Link to={`/song/${song.id}`} className="flex min-w-0 flex-1 items-center gap-3 md:flex-none">
                          <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/30 to-teal-800/40 text-cyan-100/70 md:flex"><Music2 size={16} /></span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-white/90 transition group-hover:text-cyan-100">{song.title}</span>
                            <span className="mt-0.5 block truncate text-[11px] text-cyan-100/42">{song.author || 'Autor no especificado'}</span>
                          </span>
                        </Link>

                        <span className="hidden truncate text-xs text-cyan-100/55 md:block">{song.tone || '—'}</span>

                        <div className="hidden min-w-0 flex-wrap items-center gap-1.5 md:flex">
                          {hasReferenceTrack && <span className="inline-flex items-center gap-1 rounded-full bg-cyan-300/10 px-2 py-1 text-[10px] font-medium text-cyan-100/75"><AudioLines size={12} />Pista</span>}
                          {voiceCount > 0 && <span title={assets.filter(asset => ['soprano', 'contralto', 'tenor', 'baritono', 'bajo'].includes(asset.type)).map(asset => ROLE_LABELS[asset.type]).join(', ')} className="inline-flex items-center gap-1 rounded-full bg-teal-300/10 px-2 py-1 text-[10px] font-medium text-teal-100/75">Voces {voiceCount}/5</span>}
                          {hasLyrics && <span className="inline-flex items-center gap-1 rounded-full bg-sky-300/10 px-2 py-1 text-[10px] font-medium text-sky-100/75"><FileText size={11} />Letra</span>}
                          {!audioCount && !hasLyrics && <span className="text-[10px] text-cyan-100/30">Sin materiales</span>}
                        </div>

                        <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0 md:justify-end">
                          <span className="text-[10px] text-cyan-100/35 md:hidden">{song.tone || ''}</span>
                          {isInProject && (
                            <button onClick={event => handleRemoveSongFromProject(song.id, event)} aria-label={`Quitar ${song.title} de la colección`} title="Quitar de esta colección" className="rounded-lg p-2 text-cyan-100/30 opacity-0 transition hover:bg-rose-400/10 hover:text-rose-300 group-hover:opacity-100 focus:opacity-100">
                              <X size={15} />
                            </button>
                          )}
                          <Link to={`/song/${song.id}`} aria-label={`Abrir ${song.title}`} className="rounded-lg p-2 text-cyan-100/40 transition hover:bg-white/5 hover:text-cyan-100"><ArrowRight size={16} /></Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200/75"><Headphones size={24} /></div>
                <h4 className="mt-4 text-base font-bold text-white">{searchTerm || resourceFilter !== 'all' ? 'No encontramos cantos' : selectedProject === 'ALL' ? 'Tu biblioteca está vacía' : 'Esta colección está vacía'}</h4>
                <p className="mt-1 max-w-sm text-xs leading-relaxed text-cyan-100/45">
                  {searchTerm || resourceFilter !== 'all'
                    ? 'Prueba otra búsqueda o cambia el filtro de materiales.'
                    : selectedProject === 'ALL'
                      ? 'Sube tu primer canto. Después podrás organizarlo en una o varias colecciones.'
                      : 'Agrega cantos que ya estén en tu biblioteca; seguirán disponibles en el catálogo.'}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {selectedProject === 'ALL' ? (
                    <button onClick={() => setIsSongModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2 text-xs font-bold text-[#06252b] hover:bg-cyan-200"><Plus size={14} /> Cargar canto</button>
                  ) : (
                    <button onClick={() => setIsAddExistingModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2 text-xs font-bold text-[#06252b] hover:bg-cyan-200"><Plus size={14} /> Agregar del catálogo</button>
                  )}
                  {(searchTerm || resourceFilter !== 'all') && <button onClick={() => { setSearchTerm(''); setResourceFilter('all'); }} className="rounded-xl border border-cyan-100/10 px-4 py-2 text-xs font-semibold text-cyan-50/65 hover:bg-white/5">Limpiar filtros</button>}
                </div>
              </div>
            )}
            </div>
          </>
        ) : (
          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-3 md:px-4">
            {loadingProjects ? (
              <div className="space-y-2 py-3">{[0, 1, 2].map(item => <div key={item} className="h-14 animate-pulse bg-white/[0.04]" />)}</div>
            ) : projects.length ? (
              <>
                <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_110px_90px] gap-3 border-b border-cyan-100/[0.08] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-cyan-100/35 sm:grid">
                  <span>Nombre</span><span>Descripción</span><span>Cantos</span><span className="text-right">Acciones</span>
                </div>
                {projects.map(project => (
                  <div key={project.id} className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-cyan-100/[0.07] px-2 py-3 transition hover:bg-white/[0.025] sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_110px_90px] sm:px-3">
                    <button onClick={() => setSelectedProjectId(project.id)} className="flex min-w-0 items-center gap-3 text-left">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-cyan-100/10 bg-cyan-300/[0.06] text-cyan-200/70"><ListMusic size={16} /></span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-white/90 group-hover:text-cyan-100">{project.name}</span>
                        <span className="block truncate text-[11px] text-cyan-100/40 sm:hidden">{project.description || 'Sin descripción'}</span>
                      </span>
                    </button>
                    <span className="hidden truncate text-xs text-cyan-100/50 sm:block">{project.description || '—'}</span>
                    <span className="hidden text-xs text-cyan-100/55 sm:block">{projectSongCounts[project.id] || 0} {(projectSongCounts[project.id] || 0) === 1 ? 'canto' : 'cantos'}</span>
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-[10px] text-cyan-100/45 sm:hidden">{projectSongCounts[project.id] || 0} cantos</span>
                      <button onClick={() => setSelectedProjectId(project.id)} title="Abrir colección" aria-label={`Abrir colección ${project.name}`} className="p-2 text-cyan-100/45 transition hover:bg-cyan-300/10 hover:text-cyan-100"><ArrowRight size={15} /></button>
                      <button onClick={event => handleDeleteProject(project, event)} title="Eliminar colección" aria-label={`Eliminar colección ${project.name}`} className="p-2 text-cyan-100/30 transition hover:bg-rose-400/10 hover:text-rose-300"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
                <FolderPlus size={26} className="text-cyan-200/60" />
                <h3 className="mt-3 text-sm font-semibold text-white">Todavía no hay colecciones</h3>
                <p className="mt-1 text-xs text-cyan-100/45">Agrupa cantos de tu biblioteca por ensayo o evento.</p>
                <button onClick={() => setIsProjectModalOpen(true)} className="mt-4 inline-flex items-center gap-2 bg-cyan-300 px-3 py-2 text-xs font-bold text-[#06252b] hover:bg-cyan-200"><Plus size={14} /> Nueva colección</button>
              </div>
            )}
          </div>
        )}
      </section>

      <CreateProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} onRefresh={handleRefreshProjects} />
      <UploadSongModal
        isOpen={isSongModalOpen}
        onClose={() => setIsSongModalOpen(false)}
        projectId={selectedProject === 'ALL' ? undefined : selectedProject?.id}
        onRefresh={handleRefresh}
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

export default ProjectsView;
