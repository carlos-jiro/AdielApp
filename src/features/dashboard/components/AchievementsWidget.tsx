import { Award, Trophy, Star } from 'lucide-react';

export const AchievementsWidget = () => {
  return (
    <div className="w-full h-64 md:h-full rounded-3xl glass p-5 md:p-6 overflow-hidden flex flex-col justify-between shadow-sm border border-white/40">
      <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2 shrink-0">
        <Award className="text-yellow-500" size={24} /> Mis Logros
      </h2>

      <div className="flex-1 flex flex-col justify-center gap-3 md:gap-4 mt-2">
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

        <div className="flex gap-2 shrink-0 h-16 md:h-auto">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="flex-1 bg-white/40 hover:bg-white/60 transition-colors rounded-xl p-1 flex flex-col items-center justify-center border border-white/50 text-center gap-1 cursor-default">
              <div className={`p-1 md:p-1.5 rounded-full ${i === 0 ? 'bg-orange-100 text-orange-500' : i === 1 ? 'bg-blue-100 text-blue-500' : 'bg-pink-100 text-pink-500'}`}>
                <Star size={12} fill="currentColor" className="md:w-3.5 md:h-3.5" />
              </div>
              <span className="text-[9px] md:text-[10px] font-bold text-slate-600 leading-tight">Voz Oro</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};