import { Bell, AlertCircle, Info, ArrowRight } from 'lucide-react';

export const NoticesWidget = () => {
  const notices = [
    { id: 1, title: 'Cambio de Uniforme', desc: 'Para el domingo usaremos el uniforme azul.', type: 'urgent' },
    { id: 2, title: 'Nuevos Cantos PDF', desc: 'Se han subido 3 partituras nuevas.', type: 'info' },
    { id: 3, title: 'Pago de Mensualidad', desc: 'Recordatorio: fecha límite el viernes.', type: 'warning' },
  ];

  return (
    <section className="music-panel rounded-[20px] p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="rounded-lg bg-amber-300/10 p-1.5 text-amber-200"><Bell size={16} /></span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200/45">Para el grupo</p>
            <h3 className="text-sm font-bold text-white">Avisos</h3>
          </div>
        </div>
        <button aria-label="Ver avisos" className="rounded-lg p-1.5 text-cyan-200/45 transition hover:bg-white/5 hover:text-white"><ArrowRight size={15} /></button>
      </div>

      <div className="space-y-2">
        {notices.map(notice => (
          <div key={notice.id} className="flex gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.035] p-2.5">
            <span className={`mt-0.5 shrink-0 ${notice.type === 'urgent' ? 'text-rose-300' : notice.type === 'warning' ? 'text-amber-300' : 'text-sky-300'}`}>
              {notice.type === 'urgent' ? <AlertCircle size={14} /> : <Info size={14} />}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-white/85">{notice.title}</p>
              <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-cyan-50/45">{notice.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
