import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react';
import type { ToolbarProps } from 'react-big-calendar';
import type { ActivityEvent } from '../types';

export const CalendarToolbar = ({ label, onNavigate, onView, view }: ToolbarProps<ActivityEvent, object>) => {
  return (
    <div className="flex justify-between items-center mb-6 gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
          <button onClick={() => onNavigate('PREV')} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-gray-600 transition-all">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => onNavigate('TODAY')} className="px-3 py-1 text-sm font-semibold text-gray-700 hover:text-black transition-colors">
            Hoy
          </button>
          <button onClick={() => onNavigate('NEXT')} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-gray-600 transition-all">
            <ChevronRight size={18} />
          </button>
        </div>
        <h2 className="text-xl font-bold text-gray-800 capitalize tracking-tight">{label}</h2>
      </div>
      
      <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
        <button onClick={() => onView('month')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
            <CalendarIcon size={14} /> Mes
        </button>
        <button onClick={() => onView('agenda')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'agenda' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
            <List size={14} /> Agenda
        </button>
      </div>
    </div>
  );
};