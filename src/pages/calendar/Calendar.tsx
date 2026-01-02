/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, type View } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { es } from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '../../lib/supabaseClient';
import { Plus } from 'lucide-react';
import AddEventModal from '../../components/AddEventModal';
import EventDetailsModal from '../../components/EventDetailsModal';

// --- CONFIGURACIÓN DEL CALENDARIO ---
const locales = { 'es': es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

interface ActivityEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: { location: string; description: string };
}

const CalendarPage = () => {
  // --- ESTADOS ---
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ActivityEvent | null>(null);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  // --- LOGICA DE DATOS ---
  const fetchActivities = async () => {
    const { data, error } = await supabase.from('activities').select('*');
    if (error) { console.error('Error fetching activities:', error); return; }
    
    const formattedEvents: ActivityEvent[] = (data || []).map(item => ({
      id: item.id,
      title: item.title,
      start: new Date(item.event_date),
      end: item.end_date ? new Date(item.end_date) : new Date(new Date(item.event_date).getTime() + 60*60*1000),
      resource: { location: item.location, description: item.description }
    }));
    setEvents(formattedEvents);
  };

  useEffect(() => {
    const loadActivities = async () => {
      await fetchActivities();
    };
    loadActivities();
  }, []);

  const eventStyleGetter = (_event: ActivityEvent) => {
    return { 
      style: { backgroundColor: '#2dd4bf', borderRadius: '6px', opacity: 0.9, color: 'white', border: '0px', display: 'block', fontSize: '0.85em', fontWeight: '600' } 
    };
  };

  const handleSelectEvent = (event: ActivityEvent) => {
    setSelectedEvent(event);
  };

  return (
    // CONTENEDOR PRINCIPAL (Cálculo de altura exacto del layout)
    <div className="w-full pl-4 pr-8 pb-4 h-[calc(100vh-12rem)] md:h-[calc(100vh-7rem)] animate-in fade-in duration-500">
      
      {/* CONTENEDOR ÚNICO (UNIFICADO)
          - Eliminado el Grid.
          - Ocupa w-full h-full.
          - Mantiene el estilo "glass" y los bordes redondeados.
          - 'relative' necesario para posicionar el botón flotante dentro.
      */}
      <div className="relative w-full h-full rounded-3xl glass p-6 overflow-hidden flex flex-col">
        
        {/* TITULO (Opcional, para mantener consistencia visual) */}
        <div className="mb-4 flex justify-between items-center shrink-0">
           <h2 className="text-xl font-bold text-slate-800">Calendario de Actividades</h2>
           {/* Puedes poner filtros o controles de vista aquí si quisieras en el futuro */}
        </div>

        {/* CALENDARIO (Ocupa el espacio restante con flex-1) */}
        <div className="flex-1 min-h-0 text-slate-700"> 
          {/* min-h-0 es truco flexbox para que el scroll interno funcione bien */}
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}

            culture='es'
            eventPropGetter={eventStyleGetter}
            messages={{ next: "Sig >", previous: "< Ant", today: "Hoy", month: "Mes", week: "Semana", day: "Día", agenda: "Agenda", noEventsInRange: "No hay eventos" }}
            
            onSelectEvent={handleSelectEvent}
          />
        </div>

        {/* BOTÓN FLOTANTE (Posicionado dentro del contenedor glass) */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="absolute bottom-8 right-12 z-50 bg-[#2dd4bf] hover:bg-[#25b09f] text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 border-4 border-white/20"
        >
          <Plus size={24} />
        </button>

      </div>

      {/* MODALES */}
      <AddEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchActivities} 
      />

      <EventDetailsModal 
        isOpen={!!selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
        event={selectedEvent} 
      />
      
    </div>
  );
};

export default CalendarPage;

//--------------------------------------------


// const Projects = () => {
//   return (
//     // CONTENEDOR PRINCIPAL (Mantiene el cálculo de altura exacto que validamos)
//     <div className="w-full pl-4 pr-8 pb-4 h-[calc(100vh-12rem)] md:h-[calc(100vh-7rem)]">
      
//       {/* GRID LAYOUT: 
//           - Divide en 2 columnas iguales en pantallas medianas (md:grid-cols-2).
//           - En móvil será 1 columna.
//           - gap-6 crea el espacio entre las dos cajas. 
//           - h-full asegura que el grid ocupe toda la altura disponible del padre.
//       */}
//       <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-6">
        
//         {/* CAJA IZQUIERDA (Estilo Glass igual al Navbar) */}
//         <div className="w-full h-full rounded-3xl glass p-6 overflow-hidden flex flex-col">
//            <h2 className="text-xl font-bold text-slate-800 mb-4">Sección Izquierda</h2>
//            {/* Aquí tu contenido */}
//         </div>

//         {/* CAJA DERECHA (Estilo Glass igual al Navbar) */}
//         <div className="w-full h-full rounded-3xl glass p-6 overflow-hidden flex flex-col">
//             <h2 className="text-xl font-bold text-slate-800 mb-4">Sección Derecha</h2>
//             {/* Aquí tu contenido */}
//         </div>

//       </div>

//     </div>
//   );
// };

// export default Projects;