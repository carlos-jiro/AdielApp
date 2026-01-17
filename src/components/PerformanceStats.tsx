import { useAppStore } from '../store/useAppStore';
import { useEffect } from 'react';
// Icons
import { 
    TrendingUp, 
    Users, 
    Music,
} from 'lucide-react';

const PerformanceStats = () => {
  const stats = useAppStore(state => state.attendanceStats);
  const fetchStats = useAppStore(state => state.fetchAttendanceStats);
  const userInfo = useAppStore(state => state.userInfo);

  // Intentar recargar stats al montar si ya hay usuario, 
  // aunque el store lo intenta llamar automáticamente al login.
  useEffect(() => {
    if(userInfo) fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]);

  return (
    <div className="w-full h-full rounded-3xl glass p-6 overflow-hidden flex flex-col">
        <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-500" size={24} /> Rendimiento
        </h2>
        
        <div className="flex-1 grid grid-cols-2 gap-4">
            {/* Stat Card 1: Asistencia */}
            <div className="bg-white/50 rounded-2xl p-4 flex flex-col justify-between border border-white/60 shadow-sm transition-all hover:bg-white/60">
                <div className="flex justify-between items-start">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Users size={20}/></div>
                {/* Etiqueta de tendencia (Opcional, estática por ahora si trend es 0) */}
                <span className="text-xs font-bold text-green-500 bg-green-100 px-1.5 py-0.5 rounded">
                    Global
                </span>
                </div>
                <div>
                {/* AUMENTADO A text-5xl */}
                <h3 className="text-4xl md:text-5xl font-black text-slate-700 tracking-tight">{stats.percentage}%</h3>
                <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Asistencia Histórica</p>
                </div>
                {/* Barra de progreso visual */}
                <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${stats.percentage}%` }}
                ></div>
                </div>
            </div>

            {/* Stat Card 2: Repertorio */}
            <div className="bg-white/50 rounded-2xl p-4 flex flex-col justify-between border border-white/60 shadow-sm transition-all hover:bg-white/60">
                <div className="flex justify-between items-start">
                <div className="p-2 bg-violet-100 text-violet-600 rounded-lg"><Music size={20}/></div>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Total</span>
                </div>
                <div>
                {/* AUMENTADO A text-5xl */}
                <h3 className="text-4xl md:text-5xl font-black text-slate-700 tracking-tight">{stats.totalSongs}</h3>
                <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Cantos Disponibles</p>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                {/* Barra decorativa (ej. meta de 200 cantos) */}
                <div 
                    className="h-full bg-violet-500 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${Math.min((stats.totalSongs / 200) * 100, 100)}%` }}
                ></div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default PerformanceStats;