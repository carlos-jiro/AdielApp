import type { Project } from '../lib/types';
import { Music, MousePointerClick } from 'lucide-react';

interface Props {
  project: Project;
  onClick: () => void;
  isActive: boolean;
}

const ProjectCard = ({ project, onClick, isActive }: Props) => {
  return (
    <div 
      onClick={onClick}
      className={`
        glass h-full flex flex-col overflow-hidden 
        transition-all duration-300 cursor-pointer border-2
        rounded-2xl sm:rounded-3xl 
        ${isActive 
          ? 'bg-[#2dd4bf]/5 border-[#2dd4bf]' 
          : 'bg-white border-slate-100/50 hover:scale-[1.02] hover:shadow-md'
        }
      `}
    >
      {/* CAMBIO CLAVE 1: IMAGEN MÁS PEQUEÑA 
         Bajamos de h-28 a h-20 en móviles.
         Esto libera espacio vertical para el texto.
      */}
      <div className={`
        relative shrink-0 transition-colors 
        h-20 sm:h-28 
        ${isActive ? 'bg-[#2dd4bf]/20' : 'bg-[#2dd4bf]/10'}
      `}>
        {project.cover_url ? (
          <img 
            src={project.cover_url} 
            alt={project.name} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="flex items-center justify-center h-full text-[#2dd4bf]/50">
            <Music className="w-6 h-6 sm:w-9 sm:h-9" />
          </div>
        )}
      </div>

      {/* CAMBIO CLAVE 2: PADDING COMPACTO
         Usamos p-2.5 en vez de p-4 en móviles. 
         flex-1 asegura que este contenedor ocupe todo el espacio sobrante.
      */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 min-h-0">
        
        {/* TÍTULO */}
        <h3 className={`
            font-bold mb-1 leading-tight line-clamp-2 break-words
            text-xs sm:text-sm 
            ${isActive ? 'text-[#0d9488]' : 'text-slate-800'}
        `}>
            {project.name}
        </h3>
        
        {/* DESCRIPCIÓN */}
        <p className={`
            text-slate-400 leading-snug mb-2
            text-[10px] sm:text-xs
            /* line-clamp-2 corta el texto si es demasiado largo para que no se salga */
            line-clamp-2
        `}>
            {project.description || 'Sin descripción'}
        </p>
        
        {/* FOOTER (Ver cantos) */}
        {/* mt-auto empuja esto al final de la tarjeta */}
        <div className="mt-auto flex items-center gap-1 font-bold transition-colors text-slate-300 pt-1">
           {isActive ? (
             <span className="text-[#2dd4bf] text-[10px] sm:text-xs">Seleccionado</span>
           ) : (
             <div className="flex items-center gap-1 text-[10px] sm:text-xs">
                <MousePointerClick className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> 
                <span>Ver cantos</span>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;