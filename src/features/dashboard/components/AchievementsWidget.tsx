import { Award, Trophy, Star } from 'lucide-react';

export const AchievementsWidget = () => {
  return (
    <div className="bg-white border border-line rounded-2xl shadow-sm p-5 md:p-6">
      <h2 className="text-base font-semibold text-ink flex items-center gap-2">
        <span className="p-1.5 rounded-lg bg-amber-50 text-amber-500">
          <Award size={18} />
        </span>
        Mis logros
      </h2>

      <div className="flex flex-col md:flex-row gap-4 mt-4">
        {/* Nivel actual */}
        <div className="flex-1 rounded-xl bg-ink text-white p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/50 font-medium">Nivel actual</p>
            <h3 className="text-xl md:text-2xl font-bold leading-tight">Veterano</h3>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block w-40">
              <div className="flex justify-between text-[10px] text-white/60 mb-1 font-medium">
                <span>XP 2,400</span>
                <span>Siguiente: Maestro</span>
              </div>
              <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
                <div className="h-full bg-accent w-[75%] rounded-full"></div>
              </div>
            </div>
            <Trophy size={30} className="text-amber-400 shrink-0" />
          </div>
        </div>

        {/* Insignias */}
        <div className="flex gap-2 md:w-1/3">
          {[1, 2, 3].map((_, i) => (
            <div
              key={i}
              className="flex-1 border border-line bg-canvas/60 rounded-xl p-2.5 flex flex-col items-center justify-center text-center gap-1"
            >
              <div className={`p-1.5 rounded-full ${i === 0 ? 'bg-orange-100 text-orange-500' : i === 1 ? 'bg-blue-100 text-blue-500' : 'bg-pink-100 text-pink-500'}`}>
                <Star size={14} fill="currentColor" />
              </div>
              <span className="text-[10px] font-semibold text-slate-600 leading-tight">Voz Oro</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
