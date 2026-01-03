import { 
  TrendingUp, 
  Users, 
  Music, 
  Award, 
  Star, 
  Trophy,
  Bell,
  AlertCircle,
  Info
} from 'lucide-react';
import UpcomingEvents from '../../components/UpcomingEvents'; // <--- Importamos el nuevo componente

const Dashboard = () => {
  
  // Datos Falsos (Solo para Avisos, los eventos ya vienen de DB)
  const notices = [
    { id: 1, title: 'Cambio de Uniforme', desc: 'Para el domingo usaremos el uniforme azul.', type: 'urgent' },
    { id: 2, title: 'Nuevos Cantos PDF', desc: 'Se han subido 3 partituras nuevas al repertorio.', type: 'info' },
    { id: 3, title: 'Pago de Mensualidad', desc: 'Recordatorio: fecha límite el viernes.', type: 'warning' },
  ];

  return (
    // CONTENEDOR PRINCIPAL
    <div className="w-full pl-4 pr-8 pb-4 h-[calc(100vh-12rem)] md:h-[calc(100vh-7rem)] animate-in fade-in duration-700">
      
      {/* Estilos locales para scroll oculto */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* GRID LAYOUT */}
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-6">
        
        {/* CAJA 1: Próximos Eventos (AHORA FUNCIONAL) */}
        <UpcomingEvents />

        {/* CAJA 2: Estadísticas */}
        <div className="w-full h-full rounded-3xl glass p-6 overflow-hidden flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="text-blue-500" size={24} /> Rendimiento
            </h2>
            
            <div className="flex-1 grid grid-cols-2 gap-4">
               {/* Stat Card 1 */}
               <div className="bg-white/50 rounded-2xl p-4 flex flex-col justify-between border border-white/60 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Users size={20}/></div>
                    <span className="text-xs font-bold text-green-500 bg-green-100 px-1.5 py-0.5 rounded">+12%</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-700">92%</h3>
                    <p className="text-xs text-slate-500 font-medium">Asistencia Mensual</p>
                  </div>
                  {/* Barra de progreso visual */}
                  <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-blue-500 w-[92%] rounded-full"></div>
                  </div>
               </div>

               {/* Stat Card 2 */}
               <div className="bg-white/50 rounded-2xl p-4 flex flex-col justify-between border border-white/60 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-violet-100 text-violet-600 rounded-lg"><Music size={20}/></div>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Total</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-700">145</h3>
                    <p className="text-xs text-slate-500 font-medium">Cantos Aprendidos</p>
                  </div>
                   <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-violet-500 w-[65%] rounded-full"></div>
                  </div>
               </div>
            </div>
        </div>

        {/* CAJA 3: Logros */}
        <div className="w-full h-full rounded-3xl glass p-6 overflow-hidden flex flex-col">
           <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
             <Award className="text-yellow-500" size={24} /> Mis Logros
           </h2>
           
           <div className="flex-1 flex flex-col justify-center gap-4">
             {/* Tarjeta de Nivel */}
             <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
                 {/* Efecto decorativo de fondo */}
                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
                 
                 <div className="flex justify-between items-end relative z-10">
                   <div>
                     <p className="text-xs opacity-80 font-medium uppercase tracking-wider">Nivel Actual</p>
                     <h3 className="text-2xl font-bold">Veterano Coral</h3>
                   </div>
                   <Trophy className="text-yellow-300 drop-shadow-md" size={32} />
                 </div>
                 
                 <div className="mt-4 relative z-10">
                   <div className="flex justify-between text-xs mb-1 opacity-90">
                      <span>XP: 2,400</span>
                      <span>Siguiente: Maestro</span>
                   </div>
                   <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 w-[75%] rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                   </div>
                 </div>
             </div>

             {/* Medallas Recientes */}
             <div className="flex gap-2">
                 {[1,2,3].map((_, i) => (
                   <div key={i} className="flex-1 bg-white/40 rounded-xl p-2 flex flex-col items-center justify-center border border-white/50 text-center gap-1">
                      <div className={`p-1.5 rounded-full ${i === 0 ? 'bg-orange-100 text-orange-500' : i===1 ? 'bg-blue-100 text-blue-500' : 'bg-pink-100 text-pink-500'}`}>
                         <Star size={14} fill="currentColor" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 leading-tight">Voz de Oro</span>
                   </div>
                 ))}
             </div>
           </div>
        </div>

        {/* CAJA 4: Avisos */}
        <div className="w-full h-full rounded-3xl glass p-6 overflow-hidden flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Bell className="text-rose-500" size={24} /> Avisos Importantes
            </h2>
            
            <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-3">
               {notices.map((notice) => (
                 <div key={notice.id} className={`relative p-4 rounded-2xl border bg-white/60 backdrop-blur-sm transition-transform hover:scale-[1.02]
                   ${notice.type === 'urgent' ? 'border-rose-200 shadow-rose-100' : 
                     notice.type === 'warning' ? 'border-amber-200 shadow-amber-100' : 
                     'border-blue-200 shadow-blue-100'} shadow-sm`}>
                   
                   {/* Indicador lateral de color */}
                   <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full
                     ${notice.type === 'urgent' ? 'bg-rose-500' : 
                        notice.type === 'warning' ? 'bg-amber-400' : 'bg-blue-400'}`}>
                   </div>

                   <div className="pl-3">
                       <div className="flex justify-between items-start">
                          <h3 className="font-bold text-slate-800 text-sm">{notice.title}</h3>
                          {notice.type === 'urgent' && <AlertCircle size={14} className="text-rose-500" />}
                          {notice.type === 'info' && <Info size={14} className="text-blue-500" />}
                       </div>
                       <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notice.desc}</p>
                       <p className="text-[10px] text-slate-400 mt-2 font-medium text-right">Hace 2 horas</p>
                   </div>
                 </div>
               ))}
            </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;