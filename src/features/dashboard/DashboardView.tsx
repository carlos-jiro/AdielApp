import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowRight, CalendarDays, Clock3, MapPin, Music2, Sparkles, UsersRound, Youtube } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAppStore } from '@/store/useAppStore';
import { useUpcomingEvents } from './hooks/useUpcomingEvents';
import { StatsWidget } from './components/StatsWidget';
import { NoticesWidget } from './components/NoticesWidget';

const coverStyles = [
  'from-cyan-400/90 to-teal-700',
  'from-cyan-400 to-blue-700',
  'from-teal-400 to-cyan-800',
  'from-cyan-400 to-blue-700',
  'from-teal-500 to-cyan-800',
];

export const DashboardView = () => {
  const { groupInfo, userInfo, songs } = useAppStore();
  const activeTrack = useAppStore(state => state.activeTrack);
  const { events, loading } = useUpcomingEvents();
  const nextEvent = events[0];
  const nextEvents = events.slice(nextEvent ? 1 : 0, 4);
  const firstName = userInfo?.full_name?.trim().split(/\s+/)[0] || 'bienvenido';
  const greeting = new Date().getHours() < 12 ? 'Buenos días' : new Date().getHours() < 19 ? 'Buenas tardes' : 'Buenas noches';
  const playerBottomSpace = activeTrack ? 'pb-28 md:pb-32' : 'pb-2';

  return (
    <div className={`h-full overflow-y-auto text-white ${playerBottomSpace}`}>
      <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-5 px-4 pb-4 md:px-7 xl:grid-cols-[minmax(0,1.7fr)_minmax(270px,0.78fr)]">
        <main className="flex min-w-0 flex-col gap-5">
          <section className="flex items-end justify-between gap-4 pb-1 pt-1">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200/65">Tu espacio musical</p>
              <h2 className="text-2xl font-bold tracking-tight text-white md:text-[30px]">{greeting}, {firstName}</h2>
              <p className="mt-1 text-sm text-cyan-50/55">Todo listo para hacer música juntos.</p>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-cyan-100/10 bg-white/[0.055] px-3 py-1.5 text-xs text-cyan-50/65 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.8)]" />
              {groupInfo?.name || 'Adiel'}
            </div>
          </section>

          {/* Evento destacado */}
          <section className="relative isolate min-h-[220px] overflow-hidden rounded-[22px] border border-cyan-100/15 bg-gradient-to-br from-[#126578] via-[#0c4653] to-[#082b33] p-5 shadow-[0_24px_60px_rgba(2,12,17,.32)] md:min-h-[242px] md:p-7">
            <div className="absolute -right-14 -top-28 -z-10 h-80 w-80 rounded-full border border-cyan-100/[0.08]" />
            <div className="absolute -right-3 -top-16 -z-10 h-64 w-64 rounded-full border border-cyan-100/[0.09]" />
            <div className="absolute right-12 top-10 -z-10 h-36 w-36 rounded-full bg-cyan-300/15 blur-3xl" />
            <div className="absolute bottom-0 right-0 -z-10 h-28 w-1/2 bg-gradient-to-t from-[#061d24]/60 to-transparent" />

            <div className="flex h-full min-h-[180px] flex-col justify-between md:min-h-[190px]">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-100/15 bg-black/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-cyan-50/75">
                  <Sparkles size={13} className="text-cyan-200" /> Próximo encuentro
                </span>
                <CalendarDays size={19} className="text-white/50" />
              </div>

              <div className="mt-6 max-w-[620px]">
                {loading ? (
                  <div className="h-8 w-2/3 animate-pulse rounded bg-white/10" />
                ) : nextEvent ? (
                  <>
                    <p className="mb-1 text-xs font-medium capitalize text-cyan-50/65">
                      {format(new Date(nextEvent.event_date), 'EEEE d MMMM', { locale: es })}
                      {isToday(new Date(nextEvent.event_date)) ? ' · Hoy' : ''}
                    </p>
                    <h3 className="text-2xl font-bold leading-tight tracking-tight text-white md:text-3xl">{nextEvent.title}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-cyan-50/60">
                      <span className="inline-flex items-center gap-1.5"><Clock3 size={13} />{format(new Date(nextEvent.event_date), 'h:mm a')}</span>
                      {nextEvent.location && <span className="inline-flex items-center gap-1.5"><MapPin size={13} />{nextEvent.location}</span>}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mb-1 text-xs font-medium text-cyan-50/65">El escenario está listo</p>
                    <h3 className="text-2xl font-bold leading-tight tracking-tight text-white md:text-3xl">Tu próximo ensayo empieza aquí.</h3>
                    <p className="mt-2 text-sm text-cyan-50/60">Organiza una fecha y reúne a tu grupo.</p>
                  </>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <Link to="/calendar" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#08313a] transition hover:bg-cyan-50">
                  <CalendarDays size={14} /> Ver calendario <ArrowRight size={14} />
                </Link>
                <div className="hidden items-end gap-1 sm:flex" aria-hidden="true">
                  {[18, 30, 22, 42, 27, 36, 15, 28, 44, 20, 32, 17].map((height, index) => (
                    <span key={index} className="w-1 rounded-full bg-cyan-100/35" style={{ height }} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Repertorio */}
          <section className="music-panel hidden overflow-hidden rounded-[20px] p-4 md:block md:p-5">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200/45">Biblioteca del grupo</p>
                <h3 className="mt-1 text-lg font-bold text-white">Repertorio</h3>
              </div>
              <Link to="/projects" className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-200/60 transition hover:text-white">
                Ver todo <ArrowRight size={14} />
              </Link>
            </div>

            {songs.length ? (
              <div>
                <div className="hidden grid-cols-[38px_minmax(0,1fr)_minmax(90px,.65fr)_56px] gap-3 px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-cyan-50/35 sm:grid">
                  <span>#</span><span>Canto</span><span>Autor</span><span className="text-right">Tono</span>
                </div>
                <div className="space-y-1">
                  {songs.slice(0, 5).map((song, index) => (
                    <Link key={song.id} to={`/song/${song.id}`} className="group grid grid-cols-[38px_minmax(0,1fr)_56px] items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/[0.07] sm:grid-cols-[38px_minmax(0,1fr)_minmax(90px,.65fr)_56px]">
                      <span className="relative flex h-8 w-8 items-center justify-center text-xs tabular-nums text-cyan-50/40">
                        <span className="group-hover:hidden">{String(index + 1).padStart(2, '0')}</span>
                        <ArrowRight size={13} className="hidden text-cyan-200 group-hover:block" />
                      </span>
                      <span className="flex min-w-0 items-center gap-3">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${coverStyles[index % coverStyles.length]} shadow-md shadow-black/15`}>
                          <Music2 size={15} className="text-white/90" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-semibold text-white/90 group-hover:text-white">{song.title}</span>
                          <span className="block truncate text-[11px] text-cyan-50/45 sm:hidden">{song.author || 'Autor desconocido'}</span>
                        </span>
                      </span>
                      <span className="hidden truncate text-xs text-cyan-50/50 sm:block">{song.author || '—'}</span>
                      <span className="text-right text-xs text-cyan-50/50">{song.tone || '—'}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center">
                <Music2 size={22} className="mx-auto text-cyan-200/40" />
                <p className="mt-2 text-sm font-medium text-white/75">Tu repertorio aparecerá aquí</p>
                <p className="mt-1 text-xs text-cyan-50/45">Agrega cantos para tenerlos a mano.</p>
                <Link to="/projects" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-cyan-200 hover:text-white">Ir a proyectos <ArrowRight size={13} /></Link>
              </div>
            )}
          </section>
        </main>

        <aside className="min-w-0 space-y-5">
          <section className="music-panel rounded-[20px] p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200/45">Ir a</p>
                <h3 className="mt-1 text-base font-bold text-white">Accesos rápidos</h3>
              </div>
              <ArrowDownRight size={17} className="text-cyan-200/45" />
            </div>
            <div className="grid grid-cols-3 divide-x divide-cyan-100/10 sm:hidden">
              <Link to="/projects" className="flex min-w-0 flex-col items-center justify-center gap-1.5 py-2 text-[10px] font-medium text-cyan-50/75">
                <Music2 size={17} className="text-cyan-200" />
                <span>Cantos</span>
              </Link>
              <Link to="/calendar" className="flex min-w-0 flex-col items-center justify-center gap-1.5 py-2 text-[10px] font-medium text-cyan-50/75">
                <CalendarDays size={17} className="text-cyan-200" />
                <span>Eventos</span>
              </Link>
              <Link to="/members" className="flex min-w-0 flex-col items-center justify-center gap-1.5 py-2 text-[10px] font-medium text-cyan-50/75">
                <UsersRound size={17} className="text-cyan-200" />
                <span>Miembros</span>
              </Link>
            </div>
            <div className="hidden flex-wrap gap-2 sm:flex">
              <Link to="/projects" className="inline-flex items-center gap-2 rounded-full border border-cyan-100/10 bg-white/[0.055] px-3 py-2 text-[11px] font-medium text-cyan-50/75 transition hover:border-cyan-300/30 hover:bg-cyan-400/10 hover:text-white"><Music2 size={13} className="text-cyan-200" /> Cantos</Link>
              <Link to="/calendar" className="inline-flex items-center gap-2 rounded-full border border-cyan-100/10 bg-white/[0.055] px-3 py-2 text-[11px] font-medium text-cyan-50/75 transition hover:border-cyan-300/30 hover:bg-cyan-400/10 hover:text-white"><CalendarDays size={13} className="text-cyan-200" /> Eventos</Link>
              <Link to="/members" className="inline-flex items-center gap-2 rounded-full border border-cyan-100/10 bg-white/[0.055] px-3 py-2 text-[11px] font-medium text-cyan-50/75 transition hover:border-cyan-300/30 hover:bg-cyan-400/10 hover:text-white"><UsersRound size={13} className="text-cyan-200" /> Miembros</Link>
              <Link to="/tutorials" className="inline-flex items-center gap-2 rounded-full border border-cyan-100/10 bg-white/[0.055] px-3 py-2 text-[11px] font-medium text-cyan-50/75 transition hover:border-cyan-300/30 hover:bg-cyan-400/10 hover:text-white"><Youtube size={13} className="text-cyan-200" /> Tutoriales</Link>
            </div>
          </section>

          <StatsWidget />

          <section className="music-panel rounded-[20px] p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200/45">Agenda</p>
                <h3 className="mt-1 text-base font-bold text-white">Próximos eventos</h3>
              </div>
              <Link to="/calendar" aria-label="Ver calendario" className="rounded-lg p-1.5 text-cyan-200/55 hover:bg-white/5 hover:text-white"><ArrowRight size={16} /></Link>
            </div>
            {loading ? (
              <div className="space-y-2"><div className="h-12 animate-pulse rounded-xl bg-white/[0.06]" /><div className="h-12 animate-pulse rounded-xl bg-white/[0.06]" /></div>
            ) : nextEvents.length ? (
              <div className="space-y-2">
                {nextEvents.map(event => (
                  <div key={event.id} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.035] p-2.5">
                    <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-cyan-400/15 text-cyan-50">
                      <span className="text-[8px] font-semibold uppercase text-cyan-100/65">{format(new Date(event.event_date), 'MMM', { locale: es }).replace('.', '')}</span>
                      <span className="text-sm font-bold leading-none">{format(new Date(event.event_date), 'dd')}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-white/85">{event.title}</p>
                      <p className="mt-0.5 truncate text-[10px] text-cyan-50/45">{format(new Date(event.event_date), 'EEE · h:mm a', { locale: es })}{event.location ? ` · ${event.location}` : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="rounded-xl bg-white/[0.035] px-3 py-4 text-center text-xs text-cyan-50/45">No hay más fechas próximas.</p>}
          </section>

          <NoticesWidget />
        </aside>
      </div>
    </div>
  );
};
