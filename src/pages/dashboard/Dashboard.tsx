import { Award, Star, Trophy, Bell, AlertCircle, Info } from 'lucide-react';
import UpcomingEvents from '../../components/UpcomingEvents';
import PerformanceStats from '../../components/PerformanceStats';

const Dashboard = () => {
  
  // Datos Falsos
  const notices = [
    { id: 1, title: 'Cambio de Uniforme', desc: 'Para el domingo usaremos el uniforme azul.', type: 'urgent' },
    { id: 2, title: 'Nuevos Cantos PDF', desc: 'Se han subido 3 partituras nuevas.', type: 'info' },
    { id: 3, title: 'Pago de Mensualidad', desc: 'Recordatorio: fecha límite el viernes.', type: 'warning' },
    { id: 4, title: 'Ensayo General', desc: 'Sábado a las 4pm puntual.', type: 'info' }, // Agregué uno para probar el scroll interno
  ];

  return (
    // CONTENEDOR PRINCIPAL
    // Ajuste de altura: 
    // - Mobile: 100vh - 11rem (aprox 176px para header colapsado + márgenes)
    // - Desktop: 100vh - 9rem (aprox 144px para header en línea + márgenes)
    <div className="w-full px-4  h-[calc(100vh-11rem)] md:h-[calc(100vh-9rem)] animate-in fade-in duration-700">
      
      {/* Estilos locales para scroll oculto pero funcional */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* GRID LAYOUT 
          - Mobile: flex-col con overflow-y-auto (el dashboard hace scroll por dentro si es necesario, no la pagina)
          - Desktop: grid fijo de 2x2 sin scroll
      */}
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-4 md:gap-6 overflow-y-auto md:overflow-hidden pr-1 pb-1">
        
        {/* CAJA 1: Próximos Eventos */}
        <div className="h-64 md:h-full w-full"> {/* Altura fija minima en movil */}
            <UpcomingEvents />
        </div>

        {/* CAJA 2: Estadísticas */}
        <div className="h-64 md:h-full w-full">
            <PerformanceStats />
        </div>

        {/* CAJA 3: Logros */}
        <div className="w-full h-64 md:h-full rounded-3xl glass p-5 md:p-6 overflow-hidden flex flex-col justify-between shadow-sm border border-white/40">
           <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2 shrink-0">
             <Award className="text-yellow-500" size={24} /> Mis Logros
           </h2>
           
           <div className="flex-1 flex flex-col justify-center gap-3 md:gap-4 mt-2">
             {/* Tarjeta de Nivel */}
             <div className="bg-linear-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden flex-1 flex flex-col justify-center group">
                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-all duration-500"></div>
                 
                 <div className="flex justify-between items-end relative z-10">
                   <div>
                     <p className="text-[10px] md:text-xs opacity-80 font-medium uppercase tracking-wider">Nivel Actual</p>
                     <h3 className="text-xl md:text-2xl font-bold leading-tight">Veterano</h3>
                   </div>
                   <Trophy className="text-yellow-300 drop-shadow-md transform group-hover:scale-110 transition-transform duration-300" size={28} />
                 </div>
                 
                 <div className="mt-3 md:mt-4 relative z-10">
                   <div className="flex justify-between text-[10px] md:text-xs mb-1 opacity-90 font-medium">
                      <span>XP: 2,400</span>
                      <span>Siguiente: Maestro</span>
                   </div>
                   <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 w-[75%] rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                   </div>
                 </div>
             </div>

             {/* Medallas Recientes */}
             <div className="flex gap-2 shrink-0 h-16 md:h-auto">
                 {[1,2,3].map((_, i) => (
                   <div key={i} className="flex-1 bg-white/40 hover:bg-white/60 transition-colors rounded-xl p-1 flex flex-col items-center justify-center border border-white/50 text-center gap-1 cursor-default">
                      <div className={`p-1 md:p-1.5 rounded-full ${i === 0 ? 'bg-orange-100 text-orange-500' : i===1 ? 'bg-blue-100 text-blue-500' : 'bg-pink-100 text-pink-500'}`}>
                         <Star size={12} fill="currentColor" className="md:w-3.5 md:h-3.5" />
                      </div>
                      <span className="text-[9px] md:text-[10px] font-bold text-slate-600 leading-tight">Voz Oro</span>
                   </div>
                 ))}
             </div>
           </div>
        </div>

        {/* CAJA 4: Avisos */}
        <div className="w-full h-64 md:h-full rounded-3xl glass p-5 md:p-6 overflow-hidden flex flex-col shadow-sm border border-white/40">
            <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-3 md:mb-4 flex items-center gap-2 shrink-0">
              <Bell className="text-rose-500" size={22} /> Avisos
            </h2>
            
            <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-2 md:gap-3 pr-1">
               {notices.map((notice) => (
                 <div key={notice.id} className={`relative p-3 md:p-4 rounded-2xl border bg-white/60 backdrop-blur-sm transition-all hover:scale-[1.01] hover:bg-white/80
                   ${notice.type === 'urgent' ? 'border-rose-200 shadow-rose-100/50' : 
                     notice.type === 'warning' ? 'border-amber-200 shadow-amber-100/50' : 
                     'border-blue-200 shadow-blue-100/50'} shadow-sm group`}>
                   
                   <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-all group-hover:w-1.5
                     ${notice.type === 'urgent' ? 'bg-rose-500' : 
                        notice.type === 'warning' ? 'bg-amber-400' : 'bg-blue-400'}`}>
                   </div>

                   <div className="pl-3">
                       <div className="flex justify-between items-start">
                          <h3 className="font-bold text-slate-800 text-xs md:text-sm line-clamp-1">{notice.title}</h3>
                          {notice.type === 'urgent' && <AlertCircle size={14} className="text-rose-500 shrink-0" />}
                          {notice.type === 'info' && <Info size={14} className="text-blue-500 shrink-0" />}
                       </div>
                       <p className="text-[10px] md:text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{notice.desc}</p>
                       <p className="text-[9px] text-slate-400 mt-1.5 font-medium text-right">Hace 2h</p>
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

// import { Award, Star, Trophy, Bell, AlertCircle, Info } from 'lucide-react';
// import UpcomingEvents from '../../components/UpcomingEvents';
// import PerformanceStats from '../../components/PerformanceStats'; // <--- Importamos

// const Dashboard = () => {
  
//   // Datos Falsos (Solo para Avisos, el resto ya es real)
//   const notices = [
//     { id: 1, title: 'Cambio de Uniforme', desc: 'Para el domingo usaremos el uniforme azul.', type: 'urgent' },
//     { id: 2, title: 'Nuevos Cantos PDF', desc: 'Se han subido 3 partituras nuevas al repertorio.', type: 'info' },
//     { id: 3, title: 'Pago de Mensualidad', desc: 'Recordatorio: fecha límite el viernes.', type: 'warning' },
//   ];

//   return (
//     // CONTENEDOR PRINCIPAL
//     <div className="w-full pl-4 pr-8 pb-4 h-[calc(100vh-12rem)] md:h-[calc(100vh-7rem)] animate-in fade-in duration-700">
      
//       {/* Estilos locales para scroll oculto */}
//       <style>{`
//         .hide-scrollbar::-webkit-scrollbar { display: none; }
//         .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//       `}</style>

//       {/* GRID LAYOUT */}
//       <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-6">
        
//         {/* CAJA 1: Próximos Eventos */}
//         <UpcomingEvents />

//         {/* CAJA 2: Estadísticas (AHORA MODULAR Y REAL) */}
//         <PerformanceStats />

//         {/* CAJA 3: Logros */}
//         <div className="w-full h-full rounded-3xl glass p-6 overflow-hidden flex flex-col">
//            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
//              <Award className="text-yellow-500" size={24} /> Mis Logros
//            </h2>
           
//            <div className="flex-1 flex flex-col justify-center gap-4">
//              {/* Tarjeta de Nivel */}
//              <div className="bg-linear-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
//                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
                 
//                  <div className="flex justify-between items-end relative z-10">
//                    <div>
//                      <p className="text-xs opacity-80 font-medium uppercase tracking-wider">Nivel Actual</p>
//                      <h3 className="text-2xl font-bold">Veterano Coral</h3>
//                    </div>
//                    <Trophy className="text-yellow-300 drop-shadow-md" size={32} />
//                  </div>
                 
//                  <div className="mt-4 relative z-10">
//                    <div className="flex justify-between text-xs mb-1 opacity-90">
//                       <span>XP: 2,400</span>
//                       <span>Siguiente: Maestro</span>
//                    </div>
//                    <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
//                       <div className="h-full bg-yellow-400 w-[75%] rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
//                    </div>
//                  </div>
//              </div>

//              {/* Medallas Recientes */}
//              <div className="flex gap-2">
//                  {[1,2,3].map((_, i) => (
//                    <div key={i} className="flex-1 bg-white/40 rounded-xl p-2 flex flex-col items-center justify-center border border-white/50 text-center gap-1">
//                       <div className={`p-1.5 rounded-full ${i === 0 ? 'bg-orange-100 text-orange-500' : i===1 ? 'bg-blue-100 text-blue-500' : 'bg-pink-100 text-pink-500'}`}>
//                          <Star size={14} fill="currentColor" />
//                       </div>
//                       <span className="text-[10px] font-bold text-slate-600 leading-tight">Voz de Oro</span>
//                    </div>
//                  ))}
//              </div>
//            </div>
//         </div>

//         {/* CAJA 4: Avisos */}
//         <div className="w-full h-full rounded-3xl glass p-6 overflow-hidden flex flex-col">
//             <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
//               <Bell className="text-rose-500" size={24} /> Avisos Importantes
//             </h2>
            
//             <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-3">
//                {notices.map((notice) => (
//                  <div key={notice.id} className={`relative p-4 rounded-2xl border bg-white/60 backdrop-blur-sm transition-transform hover:scale-[1.02]
//                    ${notice.type === 'urgent' ? 'border-rose-200 shadow-rose-100' : 
//                      notice.type === 'warning' ? 'border-amber-200 shadow-amber-100' : 
//                      'border-blue-200 shadow-blue-100'} shadow-sm`}>
                   
//                    <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full
//                      ${notice.type === 'urgent' ? 'bg-rose-500' : 
//                         notice.type === 'warning' ? 'bg-amber-400' : 'bg-blue-400'}`}>
//                    </div>

//                    <div className="pl-3">
//                        <div className="flex justify-between items-start">
//                           <h3 className="font-bold text-slate-800 text-sm">{notice.title}</h3>
//                           {notice.type === 'urgent' && <AlertCircle size={14} className="text-rose-500" />}
//                           {notice.type === 'info' && <Info size={14} className="text-blue-500" />}
//                        </div>
//                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notice.desc}</p>
//                        <p className="text-[10px] text-slate-400 mt-2 font-medium text-right">Hace 2 horas</p>
//                    </div>
//                  </div>
//                ))}
//             </div>
//         </div>

//       </div>

//     </div>
//   );
// };

// export default Dashboard;