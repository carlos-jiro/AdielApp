import { Bell, AlertCircle, Info } from 'lucide-react';

export const NoticesWidget = () => {
  // Datos encapsulados aquí, no ensucian la vista principal
  const notices = [
    { id: 1, title: 'Cambio de Uniforme', desc: 'Para el domingo usaremos el uniforme azul.', type: 'urgent' },
    { id: 2, title: 'Nuevos Cantos PDF', desc: 'Se han subido 3 partituras nuevas.', type: 'info' },
    { id: 3, title: 'Pago de Mensualidad', desc: 'Recordatorio: fecha límite el viernes.', type: 'warning' },
    { id: 4, title: 'Ensayo General', desc: 'Sábado a las 4pm puntual.', type: 'info' },
  ];

  return (
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
  );
};