import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { useUpcomingEvents } from '../hooks/useUpcomingEvents';

const EventsWidget = () => {
  const { events, loading } = useUpcomingEvents();

  return (
    <div className="bg-white border border-line rounded-2xl shadow-sm p-5 md:p-6 flex flex-col h-full min-h-[340px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-ink flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-accent/10 text-accent">
            <Calendar size={18} />
          </span>
          Próximos eventos
        </h2>

        <Link
          to="/calendar"
          className="flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-2 transition-colors"
        >
          Ver todo
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-2.5">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
            <p className="text-sm">Cargando...</p>
          </div>
        ) : events.length === 0 ? (
          <p className="text-slate-400 text-sm text-center mt-10">No hay eventos próximos.</p>
        ) : (
          events.map((event) => {
            const dateObj = new Date(event.event_date);
            const isEventToday = isToday(dateObj);

            const dayNumber = format(dateObj, 'dd');
            const monthName = format(dateObj, 'MMM', { locale: es }).replace('.', '');
            const dayName = format(dateObj, 'EEE', { locale: es }).replace('.', '');
            const timeString = format(dateObj, 'h:mm a');

            return (
              <div
                key={event.id}
                className="border border-line rounded-xl p-3 flex items-center gap-4 hover:bg-canvas transition-colors group"
              >
                <div
                  className="flex flex-col items-center justify-center w-12 h-12 rounded-lg shrink-0 font-bold text-white transition-colors"
                  style={{ backgroundColor: event.color || '#f26b4a' }}
                >
                  <span className="text-[10px] uppercase opacity-90 leading-tight">
                    {isEventToday ? dayName : monthName}
                  </span>
                  <span className="text-base leading-none">{dayNumber}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-ink truncate text-sm group-hover:text-accent transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {timeString}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin size={12} /> {event.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export { EventsWidget };
