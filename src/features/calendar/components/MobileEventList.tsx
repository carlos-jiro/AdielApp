import { format, isSameMonth, isSameYear } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import type { ActivityEvent } from '../types';

interface MobileEventListProps {
  events: ActivityEvent[];
  currentDate: Date;
  onSelect: (e: ActivityEvent) => void;
  onNavigate: (direction: 'PREV' | 'NEXT') => void;
}

export const MobileEventList = ({ events, onSelect, currentDate, onNavigate }: MobileEventListProps) => {
  // Lógica de filtrado visual se queda aquí, pertenece a la presentación móvil
  const filteredEvents = events.filter(e => 
    isSameMonth(e.start, currentDate) && isSameYear(e.start, currentDate)
  ).sort((a, b) => a.start.getTime() - b.start.getTime());

  return (
    <div className="flex flex-col h-full">
        {/* Header Móvil */}
        <div className="flex items-center justify-between mb-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-sm sticky top-0 z-10">
            <button onClick={() => onNavigate('PREV')} className="p-2 bg-white rounded-full text-slate-500 shadow-sm"><ChevronLeft size={20}/></button>
            <h2 className="text-lg font-bold text-slate-800 capitalize">
                {format(currentDate, 'MMMM yyyy', { locale: es })}
            </h2>
            <button onClick={() => onNavigate('NEXT')} className="p-2 bg-white rounded-full text-slate-500 shadow-sm"><ChevronRight size={20}/></button>
        </div>

        {/* Lista */}
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
                        <div className="flex flex-col items-center justify-center bg-teal-50 rounded-xl w-14 h-16 shrink-0 text-[#2dd4bf]">
                            <span className="text-[10px] font-black uppercase tracking-wider opacity-70">
                                {format(event.start, 'EEE', { locale: es })}
                            </span>
                            <span className="text-2xl font-bold leading-none">
                                {format(event.start, 'd')}
                            </span>
                        </div>
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