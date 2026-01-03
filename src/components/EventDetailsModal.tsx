import { useState } from 'react';
import { X, MapPin, Clock, AlignLeft, Calendar as CalIcon, User, FileEdit, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAppStore } from '../lib/store';
import { supabase } from '../lib/supabaseClient'; // Asegúrate de importar supabase

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

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: ActivityEvent | null;
  onEdit: () => void;
  onRefresh: () => void; // ✅ NUEVA PROP: Necesaria para recargar el calendario al borrar
}

const EventDetailsModal = ({ isOpen, onClose, event, onEdit, onRefresh }: EventDetailsModalProps) => {
  const members = useAppStore((state) => state.members);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !event) return null;

  const getMemberName = (uuid?: string) => {
    if (!uuid) return null;
    const found = members.find((m) => m.id === uuid);
    return found ? found.full_name : 'Usuario desconocido';
  };

  // --- LÓGICA DE ELIMINAR ---
  const handleDelete = async () => {
    // 1. Confirmación simple
    if (!window.confirm("¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.")) {
      return;
    }

    setIsDeleting(true);

    try {
      // 2. Borrado en Supabase
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', event.id);

      if (error) throw error;

      // 3. Éxito
      onRefresh(); // Recargamos el calendario
      onClose();   // Cerramos el modal

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar el evento: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full glass max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-white/50 bg-white/80">
        
        {/* --- CABECERA --- */}
        <div className="flex justify-between items-start mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-1.5 h-8 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: event.color }} 
            ></div>
            <h3 className="text-2xl font-bold text-slate-800 leading-tight">
              {event.title}
            </h3>
          </div>
          
          <div className="flex gap-2">
            
            {/* ✅ BOTÓN ELIMINAR */}
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
              title="Eliminar evento"
            >
              <Trash2 size={20} className={`group-hover:scale-110 transition-transform ${isDeleting ? 'animate-pulse' : ''}`} />
            </button>

            {/* BOTÓN EDITAR */}
            <button 
              onClick={onEdit}
              className="p-2 rounded-xl text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
              title="Editar evento"
            >
              <Edit2 size={20} className="group-hover:scale-110 transition-transform" />
            </button>

            {/* BOTÓN CERRAR */}
            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-all duration-200 hover:text-slate-900"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* --- CONTENIDO PRINCIPAL --- */}
        <div className="space-y-4">
          
          {/* Fecha */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 hover:bg-white/80 transition-colors border border-white/40 shadow-sm">
            <div 
              className="p-2 rounded-lg relative overflow-hidden"
              style={{ color: event.color }}
            >
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

          {/* Horario */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 hover:bg-white/80 transition-colors border border-white/40 shadow-sm">
            <div 
              className="p-2 rounded-lg relative overflow-hidden"
              style={{ color: event.color }}
            >
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

          {/* Ubicación */}
          {event.resource.location && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 hover:bg-white/80 transition-colors border border-white/40 shadow-sm">
              <div 
                className="p-2 rounded-lg relative overflow-hidden"
                style={{ color: event.color }}
              >
                <div className="absolute inset-0 bg-current opacity-10"></div>
                <MapPin size={20} className="relative z-10" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ubicación</p>
                <p className="font-medium text-slate-700">{event.resource.location}</p>
              </div>
            </div>
          )}

          {/* Descripción */}
          {event.resource.description && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50 hover:bg-white/80 transition-colors border border-white/40 shadow-sm mt-2">
              <div 
                className="p-2 rounded-lg relative overflow-hidden mt-0.5"
                style={{ color: event.color }}
              >
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
        </div>

        {/* --- FOOTER: Auditoría --- */}
        <div className="mt-8 pt-4 border-t border-slate-200/60 flex flex-col gap-2">
            
            {event.created_by && (
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                    <User size={14} className="opacity-70" />
                    <span>Creado por: <span className="text-slate-600 font-semibold">
                        {getMemberName(event.created_by)}
                    </span></span>
                </div>
            )}

            {event.updated_by && (
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                    <FileEdit size={14} className="opacity-70" />
                    <span>Última edición: <span className="text-slate-600 font-semibold">
                        {getMemberName(event.updated_by)}
                    </span></span>
                </div>
            )}
        </div>
        
      </div>
    </div>
  );
};

export default EventDetailsModal;

// //import { useAppStore } from '../lib/store';

// import { X, MapPin, Clock, AlignLeft, Calendar as CalIcon, User, FileEdit } from 'lucide-react';
// import { format } from 'date-fns';
// import { es } from 'date-fns/locale';
// import { useAppStore } from '../lib/store';

// interface ActivityEvent {
//   id: string;
//   title: string;
//   start: Date;
//   end: Date;
//   color: string;
//   created_by?: string;
//   updated_by?: string;
//   resource: { location: string; description: string };
// }

// interface EventDetailsModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   event: ActivityEvent | null;
// }

// const EventDetailsModal = ({ isOpen, onClose, event }: EventDetailsModalProps) => {
//   const members = useAppStore((state) => state.members);

//   if (!isOpen || !event) return null;

//   // --- 🕵️‍♂️ ZONA DE DEBUGEO ---
//   console.group("🔍 DEBUG MODAL EVENTOS");
//   console.log("1. Evento recibido completo:", event);
//   console.log("2. UUID del creador (created_by):", event.created_by);
//   console.log("3. Lista de miembros en el Store:", members);
//   console.groupEnd();
//   // ---------------------------

//   const getMemberName = (uuid?: string, label?: string) => {
//     if (!uuid) return null;
    
//     // Log específico de la búsqueda
//     const found = members.find((m) => m.id === uuid);
//     console.log(`🔎 Buscando [${label}] ID: ${uuid} -> Encontrado:`, found);

//     return found ? found.full_name : 'Usuario desconocido (ID no hallado)';
//   };

//   return (
//     <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
//       <div 
//         className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" 
//         onClick={onClose}
//       />

//       <div className="relative glass w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-white/50 bg-white/80">
        
//         {/* Cabecera */}
//         <div className="flex justify-between items-start mb-6 gap-4">
//           <div className="flex items-center gap-3">
//             <div 
//               className="w-1.5 h-8 rounded-full shrink-0 shadow-sm"
//               style={{ backgroundColor: event.color }} 
//             ></div>
//             <h3 className="text-2xl font-bold text-slate-800 leading-tight">
//               {event.title}
//             </h3>
//           </div>
          
//           <button 
//             onClick={onClose}
//             className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-all duration-200 hover:text-slate-900"
//           >
//             <X size={24} />
//           </button>
//         </div>

//         {/* Contenido Principal */}
//         <div className="space-y-4">
          
//           {/* Fecha */}
//           <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 hover:bg-white/80 transition-colors border border-white/40 shadow-sm">
//             <div 
//               className="p-2 rounded-lg relative overflow-hidden"
//               style={{ color: event.color }}
//             >
//               <div className="absolute inset-0 bg-current opacity-10"></div>
//               <CalIcon size={20} className="relative z-10" />
//             </div>
//             <div>
//               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha</p>
//               <p className="font-medium text-slate-700 capitalize">
//                 {format(event.start, "EEEE, d 'de' MMMM", { locale: es })}
//               </p>
//             </div>
//           </div>

//           {/* Horario */}
//           <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 hover:bg-white/80 transition-colors border border-white/40 shadow-sm">
//             <div 
//               className="p-2 rounded-lg relative overflow-hidden"
//               style={{ color: event.color }}
//             >
//               <div className="absolute inset-0 bg-current opacity-10"></div>
//               <Clock size={20} className="relative z-10" />
//             </div>
//             <div>
//               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Horario</p>
//               <p className="font-medium text-slate-700">
//                 {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
//               </p>
//             </div>
//           </div>

//           {/* Ubicación */}
//           {event.resource.location && (
//             <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 hover:bg-white/80 transition-colors border border-white/40 shadow-sm">
//               <div 
//                 className="p-2 rounded-lg relative overflow-hidden"
//                 style={{ color: event.color }}
//               >
//                 <div className="absolute inset-0 bg-current opacity-10"></div>
//                 <MapPin size={20} className="relative z-10" />
//               </div>
//               <div>
//                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ubicación</p>
//                 <p className="font-medium text-slate-700">{event.resource.location}</p>
//               </div>
//             </div>
//           )}

//           {/* Descripción */}
//           {event.resource.description && (
//             <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50 hover:bg-white/80 transition-colors border border-white/40 shadow-sm mt-2">
//               <div 
//                 className="p-2 rounded-lg relative overflow-hidden mt-0.5"
//                 style={{ color: event.color }}
//               >
//                  <div className="absolute inset-0 bg-current opacity-10"></div>
//                  <AlignLeft size={20} className="relative z-10" />
//               </div>
//               <div>
//                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Descripción</p>
//                 <p className="text-sm text-slate-600 leading-relaxed">
//                   {event.resource.description}
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* --- FOOTER: Auditoría --- */}
//         <div className="mt-8 pt-4 border-t border-slate-200/60 flex flex-col gap-2">
            
//             {event.created_by && (
//                 <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
//                     <User size={14} className="opacity-70" />
//                     <span>Creado por: <span className="text-slate-600 font-semibold">
//                         {getMemberName(event.created_by, 'Creador')}
//                     </span></span>
//                 </div>
//             )}

//             {event.updated_by && (
//                 <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
//                     <FileEdit size={14} className="opacity-70" />
//                     <span>Última edición: <span className="text-slate-600 font-semibold">
//                         {getMemberName(event.updated_by, 'Editor')}
//                     </span></span>
//                 </div>
//             )}
//         </div>
        
//       </div>
//     </div>
//   );
// };

// export default EventDetailsModal;