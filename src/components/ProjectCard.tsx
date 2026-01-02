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
        glass h-full flex flex-col rounded-3xl overflow-hidden 
        transition-all duration-300 cursor-pointer border-2
        ${isActive 
          ? 'bg-[#2dd4bf]/5 border-[#2dd4bf]' 
          : 'bg-white border-slate-100/50 hover:scale-[1.02] hover:shadow-md'
        }
      `}
    >
      {/* IMAGEN */}
      <div className={`h-28 relative shrink-0 transition-colors ${isActive ? 'bg-[#2dd4bf]/20' : 'bg-[#2dd4bf]/10'}`}>
        {project.cover_url ? (
          <img src={project.cover_url} alt={project.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-[#2dd4bf]/50">
            <Music size={36} />
          </div>
        )}
      </div>

      {/* CONTENIDO */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className={`text-sm font-bold mb-1 leading-tight line-clamp-2 ${isActive ? 'text-[#0d9488]' : 'text-slate-800'}`}>
            {project.name}
        </h3>
        
        <p className="text-slate-400 text-xs line-clamp-2 leading-snug mb-2">
            {project.description || 'Sin descripción'}
        </p>
        
        <div className="mt-auto flex items-center gap-1 text-xs font-bold transition-colors text-slate-300">
           {isActive ? <span className="text-[#2dd4bf]">Seleccionado</span> : <><MousePointerClick size={12} /> Ver cantos</>}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;