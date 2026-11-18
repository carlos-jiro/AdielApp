import { TrendingUp, UsersRound, Music2 } from 'lucide-react';
import { useDashboardStats } from '../hooks/useDashboardStats';

const StatsWidget = () => {
  const { stats } = useDashboardStats();

  return (
    <section className="music-panel rounded-[20px] p-4 md:p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="rounded-lg bg-cyan-400/10 p-1.5 text-cyan-200"><TrendingUp size={16} /></span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200/45">Tu comunidad</p>
          <h3 className="text-sm font-bold text-white">Resumen</h3>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-end justify-between gap-2">
            <span className="flex items-center gap-2 text-xs text-cyan-50/65"><UsersRound size={14} className="text-cyan-200" /> Asistencia histórica</span>
            <span className="text-lg font-bold leading-none text-white">{stats.percentage}<span className="ml-0.5 text-xs text-cyan-50/45">%</span></span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-black/25">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-300 transition-all duration-700" style={{ width: `${stats.percentage}%` }} />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-end justify-between gap-2">
            <span className="flex items-center gap-2 text-xs text-cyan-50/65"><Music2 size={14} className="text-cyan-200" /> Cantos disponibles</span>
            <span className="text-lg font-bold leading-none text-white">{stats.totalSongs}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-black/25">
            <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-300 transition-all duration-700" style={{ width: `${Math.min((stats.totalSongs / 200) * 100, 100)}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export { StatsWidget };
