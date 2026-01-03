import { useState, useEffect, useCallback } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, type View, type ToolbarProps, type EventProps } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { es } from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '../../lib/supabaseClient';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react';
import AddEventModal from '../../components/AddEventModal';
import EventDetailsModal from '../../components/EventDetailsModal';

const locales = { 'es': es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// --- INTERFACES ---
interface ActivityEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  created_by?: string;
  updated_by?: string;
  resource: { location: string; description: string };
}

// --- COMPONENTE 1: TOOLBAR ---
const CustomToolbar = ({ label, onNavigate, onView, view }: ToolbarProps<ActivityEvent, object>) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
          <button onClick={() => onNavigate('PREV')} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-gray-600 transition-all"><ChevronLeft size={18} /></button>
          <button onClick={() => onNavigate('TODAY')} className="px-3 py-1 text-sm font-semibold text-gray-700 hover:text-black transition-colors">Hoy</button>
          <button onClick={() => onNavigate('NEXT')} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-gray-600 transition-all"><ChevronRight size={18} /></button>
        </div>
        <h2 className="text-xl font-bold text-gray-800 capitalize tracking-tight">{label}</h2>
      </div>
      <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
        <button onClick={() => onView('month')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}><CalendarIcon size={14} /> Mes</button>
        <button onClick={() => onView('agenda')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'agenda' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}><List size={14} /> Agenda</button>
      </div>
    </div>
  );
};

// --- COMPONENTE 2: EL CONTENIDO DEL EVENTO ---
const CustomEventContent = ({ event }: EventProps<ActivityEvent>) => {
  return (
    <div className="pl-3 pt-1 pb-1 pr-1 text-sm font-semibold truncate leading-tight">
      {event.title}
    </div>
  );
};

const CalendarPage = () => {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ActivityEvent | null>(null);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  // ✅ NUEVO: Estado para saber qué evento vamos a editar
  const [eventToEdit, setEventToEdit] = useState<ActivityEvent | null>(null);

  const fetchActivities = useCallback(async () => {
    const { data, error } = await supabase.from('activities').select('*');
    if (error) { console.error('Error fetching activities:', error); return; }
    
    const formattedEvents: ActivityEvent[] = (data || []).map(item => ({
      id: item.id,
      title: item.title,
      start: new Date(item.event_date),
      end: item.end_date ? new Date(item.end_date) : new Date(new Date(item.event_date).getTime() + 60*60*1000),
      color: item.color || '#2dd4bf', 
      created_by: item.created_by, 
      updated_by: item.updated_by,
      resource: { location: item.location, description: item.description }
    }));
    setEvents(formattedEvents);
  }, []);

  useEffect(() => {
    const loadActivities = async () => {
      fetchActivities();
    };
    loadActivities();
  }, [fetchActivities]);

  const eventStyleGetter = (event: ActivityEvent) => {
    return { 
      style: { 
        backgroundColor: event.color,
        borderRadius: '6px',
        color: 'white',
        border: '0px',
        display: 'block',
        padding: '2px 0px', 
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        margin: '2px 0px' 
      } 
    };
  };

  const handleSelectEvent = (event: ActivityEvent) => { setSelectedEvent(event); };

  // ✅ LOGICA DE EDICION
  
  // 1. Abrir modal para CREAR NUEVO (limpia cualquier edición pendiente)
  const handleOpenNewEvent = () => {
    setEventToEdit(null);
    setIsModalOpen(true);
  };

  // 2. Click en "Editar" desde el modal de detalles
  const handleEditClick = () => {
    if (selectedEvent) {
      setEventToEdit(selectedEvent); // Cargamos el evento en memoria
      setSelectedEvent(null);        // Cerramos la vista de detalles
      setIsModalOpen(true);          // Abrimos el formulario
    }
  };

  // 3. Cerrar el modal de formulario (limpia el estado de edición)
  const handleCloseAddModal = () => {
    setIsModalOpen(false);
    setEventToEdit(null);
  };

  return (
    <div className="w-full pl-4 pr-8 pb-4 h-[calc(100vh-12rem)] md:h-[calc(100vh-7rem)] animate-in fade-in duration-500">
      
      <style>{`
        .rbc-calendar { font-family: inherit; }
        .rbc-month-view { border: none; }
        .rbc-header { border-bottom: 1px solid #e5e7eb; padding: 12px 0; font-size: 0.75rem; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.05em; }
        .rbc-day-bg { border-left: 1px solid #e5e7eb; }
        .rbc-off-range-bg { background-color: transparent; }
        .rbc-off-range .rbc-button-link { color: #e5e7eb; }
        .rbc-date-cell { padding: 8px; font-size: 0.875rem; font-weight: 500; color: #1f2937; }
        .rbc-today { background-color: #f0fdfa; }
        .rbc-event { padding: 0 !important; }
        .rbc-row-segment { padding: 0 2px; }
      `}</style>

      <div className="relative w-full h-full bg-white/70 rounded-2xl shadow-sm border border-gray-200 p-6 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0"> 
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            views={['month', 'agenda']} 
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            culture='es'
            eventPropGetter={eventStyleGetter}
            components={{
              toolbar: CustomToolbar,
              event: CustomEventContent
            }}
            messages={{ noEventsInRange: "No hay eventos" }}
            onSelectEvent={handleSelectEvent}
          />
        </div>

        <button 
          onClick={handleOpenNewEvent} // ✅ Usamos la nueva función aquí
          className="absolute bottom-8 right-8 z-50 bg-teal-500 hover:bg-teal-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center group"
        >
          <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      <AddEventModal 
        isOpen={isModalOpen} 
        onClose={handleCloseAddModal} // ✅ Usamos la función de cierre correcta
        onRefresh={fetchActivities} 
        eventToEdit={eventToEdit}     // ✅ Pasamos el evento a editar
      />
      
      <EventDetailsModal 
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
        onEdit={handleEditClick} // ✅ Pasamos la acción de editar
        onRefresh={fetchActivities}      />
    </div>
  );
};

export default CalendarPage;

// import { useState, useEffect, useCallback } from 'react';
// import { Calendar as BigCalendar, dateFnsLocalizer, type View, type ToolbarProps, type EventProps } from 'react-big-calendar';
// import { format } from 'date-fns/format';
// import { parse } from 'date-fns/parse';
// import { startOfWeek } from 'date-fns/startOfWeek';
// import { getDay } from 'date-fns/getDay';
// import { es } from 'date-fns/locale/es';
// import 'react-big-calendar/lib/css/react-big-calendar.css';
// import { supabase } from '../../lib/supabaseClient';
// import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react';
// import AddEventModal from '../../components/AddEventModal';
// import EventDetailsModal from '../../components/EventDetailsModal';

// const locales = { 'es': es };
// const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// // --- INTERFACES ---
// interface ActivityEvent {
//   id: string;
//   title: string;
//   start: Date;
//   end: Date;
//   color: string;
//   // ✅ CORRECCIÓN 1: Agregamos estos campos a la definición
//   created_by?: string;
//   updated_by?: string;
//   resource: { location: string; description: string };
// }

// // --- COMPONENTE 1: TOOLBAR ---
// const CustomToolbar = ({ label, onNavigate, onView, view }: ToolbarProps<ActivityEvent, object>) => {
//   return (
//     <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
//       <div className="flex items-center gap-4 w-full md:w-auto">
//         <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
//           <button onClick={() => onNavigate('PREV')} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-gray-600 transition-all"><ChevronLeft size={18} /></button>
//           <button onClick={() => onNavigate('TODAY')} className="px-3 py-1 text-sm font-semibold text-gray-700 hover:text-black transition-colors">Hoy</button>
//           <button onClick={() => onNavigate('NEXT')} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-gray-600 transition-all"><ChevronRight size={18} /></button>
//         </div>
//         <h2 className="text-xl font-bold text-gray-800 capitalize tracking-tight">{label}</h2>
//       </div>
//       <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
//         <button onClick={() => onView('month')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}><CalendarIcon size={14} /> Mes</button>
//         <button onClick={() => onView('agenda')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'agenda' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}><List size={14} /> Agenda</button>
//       </div>
//     </div>
//   );
// };

// // --- COMPONENTE 2: EL CONTENIDO DEL EVENTO ---
// const CustomEventContent = ({ event }: EventProps<ActivityEvent>) => {
//   return (
//     <div className="pl-3 pt-1 pb-1 pr-1 text-sm font-semibold truncate leading-tight">
//       {event.title}
//     </div>
//   );
// };

// const CalendarPage = () => {
//   const [events, setEvents] = useState<ActivityEvent[]>([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedEvent, setSelectedEvent] = useState<ActivityEvent | null>(null);
//   const [view, setView] = useState<View>('month');
//   const [date, setDate] = useState(new Date());

//   const fetchActivities = useCallback(async () => {
//     // Nota: select('*') trae created_by y updated_by si existen en la tabla
//     const { data, error } = await supabase.from('activities').select('*');
//     if (error) { console.error('Error fetching activities:', error); return; }
    
//     const formattedEvents: ActivityEvent[] = (data || []).map(item => ({
//       id: item.id,
//       title: item.title,
//       start: new Date(item.event_date),
//       end: item.end_date ? new Date(item.end_date) : new Date(new Date(item.event_date).getTime() + 60*60*1000),
//       color: item.color || '#2dd4bf', 
      
//       // ✅ CORRECCIÓN 2: Aquí es donde los estabas perdiendo. Ahora los pasamos:
//       created_by: item.created_by, 
//       updated_by: item.updated_by,

//       resource: { location: item.location, description: item.description }
//     }));
//     setEvents(formattedEvents);
//   }, []);


//   useEffect(() => {
//     const loadActivities = async () => {
//       fetchActivities();
//     };
//     loadActivities();
//   }, [fetchActivities]);

//   const eventStyleGetter = (event: ActivityEvent) => {
//     return { 
//       style: { 
//         backgroundColor: event.color,
//         borderRadius: '6px',
//         color: 'white',
//         border: '0px',
//         display: 'block',
//         padding: '2px 0px', 
//         boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
//         margin: '2px 0px' 
//       } 
//     };
//   };

//   const handleSelectEvent = (event: ActivityEvent) => { setSelectedEvent(event); };

//   return (
//     <div className="w-full pl-4 pr-8 pb-4 h-[calc(100vh-12rem)] md:h-[calc(100vh-7rem)] animate-in fade-in duration-500">
      
//       <style>{`
//         .rbc-calendar { font-family: inherit; }
//         .rbc-month-view { border: none; }
//         .rbc-header { border-bottom: 1px solid #e5e7eb; padding: 12px 0; font-size: 0.75rem; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.05em; }
//         .rbc-day-bg { border-left: 1px solid #e5e7eb; }
//         .rbc-off-range-bg { background-color: transparent; }
//         .rbc-off-range .rbc-button-link { color: #e5e7eb; }
//         .rbc-date-cell { padding: 8px; font-size: 0.875rem; font-weight: 500; color: #1f2937; }
//         .rbc-today { background-color: #f0fdfa; }
//         .rbc-event { padding: 0 !important; }
//         .rbc-row-segment { padding: 0 2px; }
//       `}</style>

//       <div className="relative w-full h-full bg-white/70 rounded-2xl shadow-sm border border-gray-200 p-6 overflow-hidden flex flex-col">
//         <div className="flex-1 min-h-0"> 
//           <BigCalendar
//             localizer={localizer}
//             events={events}
//             startAccessor="start"
//             endAccessor="end"
//             style={{ height: '100%' }}
//             views={['month', 'agenda']} 
//             view={view}
//             onView={setView}
//             date={date}
//             onNavigate={setDate}
//             culture='es'
//             eventPropGetter={eventStyleGetter}
//             components={{
//               toolbar: CustomToolbar,
//               event: CustomEventContent
//             }}
//             messages={{ noEventsInRange: "No hay eventos" }}
//             onSelectEvent={handleSelectEvent}
//           />
//         </div>

//         <button 
//           onClick={() => setIsModalOpen(true)}
//           className="absolute bottom-8 right-8 z-50 bg-teal-500 hover:bg-teal-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center group"
//         >
//           <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
//         </button>
//       </div>

//       <AddEventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={fetchActivities} />
//       <EventDetailsModal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} event={selectedEvent} />
//     </div>
//   );
// };

// export default CalendarPage;