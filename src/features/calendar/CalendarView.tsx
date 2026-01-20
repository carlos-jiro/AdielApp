import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Calendar as BigCalendar, type View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Feature Modules
import { useCalendarEvents } from './hooks/useCalendarEvents';
import { localizer, eventStyleGetter } from './utils/calendarConfig';
import { CustomEventContent } from './components/CustomEventContent';
import { CalendarToolbar } from './components/CalendarToolbar';
import { MobileEventList } from './components/MobileEventList';
import type { ActivityEvent } from './types';

// Modales (Asumo que ya los tienes en components/)
import AddEventModal from './components/AddEventModal';
import EventDetailsModal from './components/EventDetailsModal';

export const CalendarView = () => {
  // 1. Data Logic (Hook)
  const { events, refreshEvents } = useCalendarEvents();

  // 2. UI State
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // 3. Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ActivityEvent | null>(null);
  const [eventToEdit, setEventToEdit] = useState<ActivityEvent | null>(null);

  // Responsive Check
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handlers
  const handleMobileNavigate = (direction: 'PREV' | 'NEXT') => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + (direction === 'PREV' ? -1 : 1));
    setDate(newDate);
  };

  const handleOpenNewEvent = () => { 
    setEventToEdit(null); 
    setIsAddModalOpen(true); 
  };

  const handleEditEvent = () => { 
    if (selectedEvent) { 
      setEventToEdit(selectedEvent); 
      setSelectedEvent(null); 
      setIsAddModalOpen(true); 
    } 
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setEventToEdit(null);
  };

  return (
    <div className="w-full px-3 pb-4 md:pl-4 md:pr-8 h-[calc(100vh-8rem)] md:h-[calc(100vh-7rem)] animate-in fade-in duration-500">
      
      {/* Estilos Override para BigCalendar */}
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

      {/* --- CONTENEDOR PRINCIPAL --- */}
      <div className={`relative w-full h-full ${isMobile ? '' : 'bg-white/70 rounded-2xl shadow-sm border border-gray-200 p-6'} overflow-hidden flex flex-col`}>
        
        {/* VISTA ESCRITORIO */}
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
              components={{ toolbar: CalendarToolbar, event: CustomEventContent }}
              messages={{ noEventsInRange: "No hay eventos" }}
              onSelectEvent={setSelectedEvent}
            />
          </div>
        )}

        {/* VISTA MÓVIL */}
        {isMobile && (
            <MobileEventList 
                events={events} 
                onSelect={setSelectedEvent} 
                currentDate={date}
                onNavigate={handleMobileNavigate}
            />
        )}

        {/* FAB (Floating Action Button) */}
        <button 
          onClick={handleOpenNewEvent} 
          className="absolute bottom-6 right-4 md:bottom-8 md:right-8 z-50 bg-[#2dd4bf] hover:bg-teal-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* --- MODALES --- */}
      <AddEventModal 
        isOpen={isAddModalOpen} 
        onClose={handleCloseAddModal} 
        onRefresh={refreshEvents} 
        eventToEdit={eventToEdit} 
      />
      
      <EventDetailsModal 
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
        onEdit={handleEditEvent} 
        onRefresh={refreshEvents} 
      />
    </div>
  );
};