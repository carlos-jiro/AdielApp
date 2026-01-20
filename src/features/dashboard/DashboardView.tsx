import { AchievementsWidget } from './components/AchievementsWidget';
import { NoticesWidget } from './components/NoticesWidget';
import { EventsWidget } from './components/EventsWidget';
import { StatsWidget } from './components/StatsWidget';

export const DashboardView = () => {
  return (
    <div className="w-full px-4 h-[calc(100vh-11rem)] md:h-[calc(100vh-9rem)] animate-in fade-in duration-700">
      
      {/* Tip Pro: Lo ideal es mover este estilo a tu index.css global con @layer utilities */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-4 md:gap-6 overflow-y-auto md:overflow-hidden pr-1 pb-1">

        <div className="h-64 md:h-full w-full">
            <EventsWidget />
        </div>

        <div className="h-64 md:h-full w-full">
            <StatsWidget />
        </div>

        <div className="h-64 md:h-full w-full">
            <AchievementsWidget />
        </div>

        <div className="h-64 md:h-full w-full">
            <NoticesWidget />
        </div>
        
      </div>
    </div>
  );
};