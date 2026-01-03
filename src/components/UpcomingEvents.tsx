import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // 1. Importamos Link
import { supabase } from '../lib/supabaseClient'; 
import { Calendar, CheckCircle2, MapPin } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

interface Activity {
  id: string;
  title: string;
  event_date: string;
  location: string;
  color: string;
}

const UpcomingEvents = () => {
  const [events, setEvents] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      const todayISO = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('activities')
        .select('id, title, event_date, location, color')
        .gte('event_date', todayISO)
        .order('event_date', { ascending: true })
        .limit(5);

      if (!error && data) {
        setEvents(data);
      }
      setLoading(false);
    };

    fetchUpcomingEvents();
  }, []);

  return (
    <div className="w-full h-full rounded-3xl glass p-6 overflow-hidden flex flex-col relative group">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="text-[#2dd4bf]" size={24} /> Próximos Eventos
        </h2>
        
        {/* 2. Botón modificado con el estilo del Nav Activo */}
        <Link 
          to="/calendar" 
          className="flex items-center gap-2 px-4 py-1.5 rounded-xl transition-all duration-200 bg-[#2dd4bf] text-white shadow-md hover:scale-105 text-sm font-medium"
        >
          Ver más
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-3">
        {loading ? (
          <p className="text-slate-400 text-sm text-center mt-10">Cargando eventos...</p>
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
                className="bg-white/40 hover:bg-white/70 transition-all p-3 rounded-2xl flex items-center gap-4 border border-white/50 shadow-sm cursor-pointer group/item"
              >
                {/* Fecha Box con Color Dinámico */}
                <div 
                  className="flex flex-col items-center justify-center w-14 h-14 rounded-xl shrink-0 font-bold text-white shadow-md transition-colors"
                  style={{ backgroundColor: event.color || '#2dd4bf' }} 
                >
                  <span className="text-[10px] uppercase opacity-90">
                    {isEventToday ? dayName : monthName}
                  </span>
                  <span className="text-lg leading-none">
                    {dayNumber}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-700 truncate group-hover/item:text-[#2dd4bf] transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={12}/> {timeString}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin size={12}/> {event.location}
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

export default UpcomingEvents;