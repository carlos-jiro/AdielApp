/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, type View } from 'react-big-calendar';
// ... (resto de imports de date-fns) ...
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { es } from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '../../lib/supabaseClient';
import { Plus } from 'lucide-react';
import AddEventModal from '../../components/AddEventModal';
// 1. IMPORTAR EL NUEVO MODAL
import EventDetailsModal from '../../components/EventDetailsModal'; 

// ... (configuración de localizer e interfaces igual que antes) ...
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
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 2. NUEVO ESTADO PARA EL EVENTO SELECCIONADO
  const [selectedEvent, setSelectedEvent] = useState<ActivityEvent | null>(null);

  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  const fetchActivities = async () => {
    // ... (Tu código de fetch existente, sin cambios) ...
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
    (async () => {
      await fetchActivities();
    })();
  }, []);

  const eventStyleGetter = (_event: ActivityEvent) => {
    // ... (Tu estilo existente) ...
    return { 
      style: { backgroundColor: '#2dd4bf', borderRadius: '4px', opacity: 0.9, color: 'white', border: '0px', display: 'block', fontSize: '0.85em' } 
    };
  };

  // 3. HANDLER PARA SELECCIONAR
  const handleSelectEvent = (event: ActivityEvent) => {
    setSelectedEvent(event);
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] flex flex-col overflow-hidden animate-in fade-in duration-500">
      
      <div className="glass p-4 rounded-xl shadow-sm border border-white/50 text-slate-700 flex-1 min-h-0 w-full">
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
          
          // 4. USAR EL NUEVO HANDLER
          onSelectEvent={handleSelectEvent}
        />
      </div>

      <button 
        onClick={() => setIsModalOpen(true)}
        className="absolute bottom-4 right-4 z-50 bg-slate-800 text-white p-4 rounded-full shadow-2xl hover:bg-slate-700 transition-all hover:scale-105 active:scale-95"
      >
        <Plus size={24} />
      </button>

      <AddEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchActivities} 
      />

      {/* 5. RENDERIZAR EL MODAL DE DETALLES */}
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