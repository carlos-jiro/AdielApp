import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Calendar, PieChart, Check, X as XIcon, X, TrendingUp, Music } from 'lucide-react';

interface Props {
  userId: string;
  onClose: () => void;
}

const MyAttendanceView = ({ userId, onClose }: Props) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({ present: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyLogs = async () => {
      setLoading(true);
      
      // Hacemos JOIN con la tabla activities para obtener el titulo y la fecha
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          status,
          activities (
            title,
            event_date,
            color
          )
        `)
        .eq('user_id', userId)
        // Como la fecha está en la tabla relacionada, ordenamos en el cliente o con lógica avanzada
        // Para simplificar, obtenemos todo y ordenamos en JS
        .limit(50); 

      if (error) {
        console.error("Error fetching logs", error);
      }
      
      if (data) {
        // Formatear datos para la vista
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedLogs = data.map((item: any) => ({
            status: item.status,
            title: item.activities?.title || 'Evento eliminado',
            date: item.activities?.event_date,
            color: item.activities?.color
        }));

        // Ordenar por fecha (Más reciente primero)
        formattedLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setLogs(formattedLogs);

        const presentCount = formattedLogs.filter(l => l.status === true).length;
        setStats({ present: presentCount, total: formattedLogs.length });
      }
      setLoading(false);
    };
    if(userId) fetchMyLogs();
  }, [userId]);

  const percentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

  return (
    <div className="h-full flex flex-col animate-in slide-in-from-left duration-300">
       <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="text-purple-500" /> Mi Historial
            </h2>
            <p className="text-xs text-slate-500 font-medium">Tu rendimiento reciente</p>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
      </div>

      {/* Stats Card */}
      <div className="bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/20 mb-6 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="relative z-10 flex items-end justify-between">
            <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Porcentaje de Asistencia</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-bold">{percentage}%</h3>
                    <span className="text-sm opacity-80 font-medium">en {stats.total} eventos</span>
                </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <PieChart size={24} className="text-white" />
            </div>
        </div>
      </div>

      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pl-1">Actividad Reciente</h3>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
        {loading ? (
             <div className="text-center py-4 text-slate-400">Cargando historial...</div>
        ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400 bg-white/30 rounded-2xl border border-dashed border-slate-300">
                <Calendar size={32} className="opacity-30 mb-2" />
                <p>Aún no tienes registros.</p>
            </div>
        ) : logs.map((log, index) => {
            const isPresent = log.status === true;
            return (
                <div key={index} className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-white/60 shadow-sm hover:bg-white transition-colors group">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`p-2.5 rounded-xl shrink-0 ${isPresent ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                            <Music size={18} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-slate-800 font-bold text-sm truncate leading-tight">{log.title}</p>
                            <span className="text-xs text-slate-500 font-medium">
                                {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                            </span>
                        </div>
                    </div>
                    {isPresent ? (
                        <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100/50 px-2.5 py-1 rounded-lg border border-emerald-100">
                            <Check size={12} />
                        </span>
                    ) : (
                        <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                            <XIcon size={12} />
                        </span>
                    )}
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default MyAttendanceView;