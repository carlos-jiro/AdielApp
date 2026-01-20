import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MapPin, Clock, AlignLeft, Calendar as CalIcon, User, FileEdit, Edit2, Trash2 } from 'lucide-react';
import { ModalLayout } from '@/components/ui/ModalLayout';
import { useEventDetails } from '../hooks/useEventDetails'; // Importamos nuestro hook
import { type ActivityEvent } from '../types';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: ActivityEvent | null;
  onEdit: () => void;
  onRefresh: () => void;
}

const EventDetailsModal = ({ isOpen, onClose, event, onEdit, onRefresh }: EventDetailsModalProps) => {
  const { isDeleting, handleDelete, getMemberName } = useEventDetails(event, onRefresh, onClose);

  if (!isOpen || !event) return null;

  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={onClose}
      title={event.title}
      themeColor={event.color}
      icon={<CalIcon size={24} />} 
      maxWidth="max-w-md"
    >
        <div className="space-y-4">
          
          {/* A. Fecha */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 hover:bg-white/80 transition-colors border border-white/40 shadow-sm">
            <div className="p-2 rounded-lg relative overflow-hidden" style={{ color: event.color }}>
              <div className="absolute inset-0 bg-current opacity-10"></div>
              <CalIcon size={20} className="relative z-10" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha</p>
              <p className="font-medium text-slate-700 capitalize">
                {format(event.start, "EEEE, d 'de' MMMM", { locale: es })}
              </p>
            </div>
          </div>

          {/* B. Horario */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 hover:bg-white/80 transition-colors border border-white/40 shadow-sm">
            <div className="p-2 rounded-lg relative overflow-hidden" style={{ color: event.color }}>
              <div className="absolute inset-0 bg-current opacity-10"></div>
              <Clock size={20} className="relative z-10" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Horario</p>
              <p className="font-medium text-slate-700">
                {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
              </p>
            </div>
          </div>

          {/* C. Ubicación (Condicional) */}
          {event.resource.location && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 hover:bg-white/80 transition-colors border border-white/40 shadow-sm">
              <div className="p-2 rounded-lg relative overflow-hidden" style={{ color: event.color }}>
                <div className="absolute inset-0 bg-current opacity-10"></div>
                <MapPin size={20} className="relative z-10" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ubicación</p>
                <p className="font-medium text-slate-700">{event.resource.location}</p>
              </div>
            </div>
          )}

          {/* D. Descripción (Condicional) */}
          {event.resource.description && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50 hover:bg-white/80 transition-colors border border-white/40 shadow-sm mt-2">
              <div className="p-2 rounded-lg relative overflow-hidden mt-0.5" style={{ color: event.color }}>
                  <div className="absolute inset-0 bg-current opacity-10"></div>
                  <AlignLeft size={20} className="relative z-10" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Descripción</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {event.resource.description}
                </p>
              </div>
            </div>
          )}

          {/* E. FOOTER: Auditoría + Acciones */}
          <div className="mt-6 pt-5 border-t border-slate-200/60 flex items-center justify-between gap-4">
            
            {/* Info de Usuario */}
            <div className="flex flex-col gap-1 min-w-0">
                {event.created_by && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium whitespace-nowrap">
                        <User size={12} className="opacity-70" />
                        <span className="text-slate-500">Creado por: <span className="text-slate-700 font-bold truncate">
                            {getMemberName(event.created_by).split(' ')[0]}
                        </span></span>
                    </div>
                )}
                 {event.updated_by && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium whitespace-nowrap">
                        <FileEdit size={12} className="opacity-70" />
                        <span>Editado por: <span className="text-slate-700 font-bold truncate">
                            {getMemberName(event.updated_by).split(' ')[0]}
                        </span></span>
                    </div>
                )}
            </div>

            {/* Botones */}
            <div className="flex items-center gap-2 shrink-0">
                <button 
                    onClick={onEdit}
                    className="p-2.5 rounded-xl bg-[#2dd4bf] text-white hover:bg-[#26bba8] shadow-md hover:shadow-lg transition-all active:scale-95 group"
                    title="Editar evento"
                >
                    <Edit2 size={18} strokeWidth={2.5} />
                </button>

                <button 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 group"
                    title="Eliminar evento"
                >
                    <Trash2 size={18} strokeWidth={2.5} className={isDeleting ? 'animate-pulse' : ''} />
                </button>
            </div>

          </div>
          
        </div>
    </ModalLayout>
  );
};

export default EventDetailsModal;