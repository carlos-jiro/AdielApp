import { X, MapPin, Clock, AlignLeft, Calendar as CalIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActivityEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: { location: string; description: string };
}

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: ActivityEvent | null;
}

const EventDetailsModal = ({ isOpen, onClose, event }: EventDetailsModalProps) => {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      {/* Backdrop sutil */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Contenedor estilo Glass igual que el Navbar */}
      <div className="relative glass w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-white/50">
        
        {/* Cabecera */}
        <div className="flex justify-between items-start mb-6 gap-4">
          <div className="flex items-center gap-3">
             {/* Acento visual estilo Navbar */}
            <div className="w-1.5 h-8 bg-[#2dd4bf] rounded-full shrink-0"></div>
            <h3 className="text-2xl font-bold text-slate-800 leading-tight">
              {event.title}
            </h3>
          </div>
          
          {/* Botón Cerrar estilo NavItem */}
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-600 hover:bg-white/50 transition-all duration-200 hover:text-slate-900"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenido */}
        <div className="space-y-4">
          
          {/* Fecha */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/30 hover:bg-white/50 transition-colors border border-white/20">
            <div className="p-2 bg-[#2dd4bf]/10 rounded-lg text-[#2dd4bf]">
               <CalIcon size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</p>
              <p className="font-medium text-slate-700 capitalize">
                {format(event.start, "EEEE, d 'de' MMMM", { locale: es })}
              </p>
            </div>
          </div>

          {/* Horario */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/30 hover:bg-white/50 transition-colors border border-white/20">
            <div className="p-2 bg-[#2dd4bf]/10 rounded-lg text-[#2dd4bf]">
               <Clock size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Horario</p>
              <p className="font-medium text-slate-700">
                {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
              </p>
            </div>
          </div>

          {/* Ubicación (Renderizado condicional) */}
          {event.resource.location && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/30 hover:bg-white/50 transition-colors border border-white/20">
              <div className="p-2 bg-[#2dd4bf]/10 rounded-lg text-[#2dd4bf]">
                 <MapPin size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ubicación</p>
                <p className="font-medium text-slate-700">{event.resource.location}</p>
              </div>
            </div>
          )}

          {/* Descripción (Renderizado condicional) */}
          {event.resource.description && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/30 hover:bg-white/50 transition-colors border border-white/20 mt-2">
              <div className="p-2 bg-[#2dd4bf]/10 rounded-lg text-[#2dd4bf] mt-0.5">
                 <AlignLeft size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Descripción</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {event.resource.description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer opcional si quieres acciones extras */}
        <div className="mt-6 flex justify-end">
             {/* Puedes agregar botones de Editar/Borrar aquí en el futuro con el mismo estilo */}
        </div>
        
      </div>
    </div>
  );
};

export default EventDetailsModal;