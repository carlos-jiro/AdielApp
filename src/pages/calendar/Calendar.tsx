import { useState, useEffect, useCallback } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, type View, type ToolbarProps, type EventProps } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { isSameMonth } from 'date-fns/isSameMonth';
import { isSameYear } from 'date-fns/isSameYear';
import { es } from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '../../lib/supabaseClient';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, MapPin, Clock } from 'lucide-react';
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

// --- 1. TOOLBAR (Solo Desktop) ---
const CustomToolbar = ({ label, onNavigate, onView, view }: ToolbarProps<ActivityEvent, object>) => {
  return (
    <div className="flex justify-between items-center mb-6 gap-4">
      <div className="flex items-center gap-4">
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

// --- 2. CONTENIDO EVENTO (Desktop) ---
const CustomEventContent = ({ event }: EventProps<ActivityEvent>) => (
  <div className="pl-3 pt-1 pb-1 pr-1 text-sm font-semibold truncate leading-tight">
    {event.title}
  </div>
);

// --- 3. NUEVO: VISTA MÓVIL (Lista de Tarjetas) ---
const MobileEventList = ({ events, onSelect, currentDate, onNavigate }: { 
    events: ActivityEvent[], 
    onSelect: (e: ActivityEvent) => void,
    currentDate: Date,
    onNavigate: (direction: 'PREV' | 'NEXT') => void
}) => {
    // Filtrar eventos del mes seleccionado
    const filteredEvents = events.filter(e => 
        isSameMonth(e.start, currentDate) && isSameYear(e.start, currentDate)
    );
    
    // Ordenar por fecha
    filteredEvents.sort((a, b) => a.start.getTime() - b.start.getTime());

    return (
        <div className="flex flex-col h-full">
            {/* Header Móvil Simple */}
            <div className="flex items-center justify-between mb-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-sm sticky top-0 z-10">
                <button onClick={() => onNavigate('PREV')} className="p-2 bg-white rounded-full text-slate-500 shadow-sm"><ChevronLeft size={20}/></button>
                <h2 className="text-lg font-bold text-slate-800 capitalize">
                    {format(currentDate, 'MMMM yyyy', { locale: es })}
                </h2>
                <button onClick={() => onNavigate('NEXT')} className="p-2 bg-white rounded-full text-slate-500 shadow-sm"><ChevronRight size={20}/></button>
            </div>

            {/* Lista Scrollable */}
            <div className="flex-1 overflow-y-auto px-1 pb-20 space-y-3 custom-scrollbar">
                {filteredEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
                        <CalendarIcon size={32} className="opacity-20" />
                        <p>No hay eventos este mes</p>
                    </div>
                ) : (
                    filteredEvents.map(event => (
                        <div 
                            key={event.id} 
                            onClick={() => onSelect(event)}
                            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 active:scale-[0.98] transition-transform"
                        >
                            {/* Caja Fecha */}
                            <div className="flex flex-col items-center justify-center bg-teal-50 rounded-xl w-14 h-16 shrink-0 text-[#2dd4bf]">
                                <span className="text-[10px] font-black uppercase tracking-wider opacity-70">
                                    {format(event.start, 'EEE', { locale: es })}
                                </span>
                                <span className="text-2xl font-bold leading-none">
                                    {format(event.start, 'd')}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                                <h3 className="font-bold text-slate-700 leading-tight truncate">{event.title}</h3>
                                
                                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                    <div className="flex items-center gap-1">
                                        <Clock size={12} className="text-[#2dd4bf]" />
                                        <span>{format(event.start, 'h:mm a')}</span>
                                    </div>
                                    {event.resource.location && (
                                        <div className="flex items-center gap-1 truncate max-w-30">
                                            <MapPin size={12} className="text-[#2dd4bf]" />
                                            <span className="truncate">{event.resource.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const CalendarPage = () => {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ActivityEvent | null>(null);
  
  // Estado
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [eventToEdit, setEventToEdit] = useState<ActivityEvent | null>(null);
  
  // Detectar móvil
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    const loadEvents = async () => {
      await fetchActivities(); 
    };
    loadEvents();
  }, [fetchActivities]);

  const eventStyleGetter = (event: ActivityEvent) => ({
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
  });

  // Navegación para móvil
  const handleMobileNavigate = (direction: 'PREV' | 'NEXT') => {
      const newDate = new Date(date);
      if (direction === 'PREV') newDate.setMonth(newDate.getMonth() - 1);
      else newDate.setMonth(newDate.getMonth() + 1);
      setDate(newDate);
  };

  const handleOpenNewEvent = () => { setEventToEdit(null); setIsModalOpen(true); };
  const handleEditClick = () => { if (selectedEvent) { setEventToEdit(selectedEvent); setSelectedEvent(null); setIsModalOpen(true); } };
  const handleCloseAddModal = () => { setIsModalOpen(false); setEventToEdit(null); };

  return (
    <div className="w-full px-3 pb-4 md:pl-4 md:pr-8 h-[calc(100vh-8rem)] md:h-[calc(100vh-7rem)] animate-in fade-in duration-500">
      
      <style>{`
        .rbc-calendar { font-family: inherit; }
        .rbc-month-view { border: none; }
        .rbc-header { border-bottom: 1px solid #e5e7eb; padding: 12px 0; font-size: 0.75rem; font-weight: 600; color: #374151; text-transform: uppercase; }
        .rbc-day-bg { border-left: 1px solid #e5e7eb; }
        .rbc-off-range-bg { background-color: transparent; }
        .rbc-date-cell { padding: 8px; font-size: 0.875rem; font-weight: 500; color: #1f2937; }
        .rbc-today { background-color: #f0fdfa; }
        .rbc-event { padding: 0 !important; }
        .rbc-row-segment { padding: 0 2px; }
      `}</style>

      {/* CONTENEDOR PRINCIPAL */}
      <div className={`relative w-full h-full ${isMobile ? '' : 'bg-white/70 rounded-2xl shadow-sm border border-gray-200 p-6'} overflow-hidden flex flex-col`}>
        
        {/* VISTA ESCRITORIO: Big Calendar */}
        {!isMobile && (
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
              components={{ toolbar: CustomToolbar, event: CustomEventContent }}
              messages={{ noEventsInRange: "No hay eventos" }}
              onSelectEvent={setSelectedEvent}
            />
          </div>
        )}

        {/* VISTA MÓVIL: Lista Personalizada */}
        {isMobile && (
            <MobileEventList 
                events={events} 
                onSelect={setSelectedEvent} 
                currentDate={date}
                onNavigate={handleMobileNavigate}
            />
        )}

        {/* Botón Flotante */}
        <button 
          onClick={handleOpenNewEvent} 
          className="absolute bottom-6 right-4 md:bottom-8 md:right-8 z-50 bg-[#2dd4bf] hover:bg-teal-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center"
        >
          <Plus size={24} />
        </button>
      </div>

      <AddEventModal 
        isOpen={isModalOpen} 
        onClose={handleCloseAddModal} 
        onRefresh={fetchActivities} 
        eventToEdit={eventToEdit} 
      />
      
      <EventDetailsModal 
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
        onEdit={handleEditClick} 
        onRefresh={fetchActivities} 
      />
    </div>
  );
};

export default CalendarPage;