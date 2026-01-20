// components/ui/ModalLayout.tsx
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode; // Icono dinámico para el header
  themeColor?: string; // Color principal para el branding del header
  children: React.ReactNode;
  maxWidth?: string; // Para controlar el ancho si alguna modal lo requiere
}

export const ModalLayout = ({
  isOpen,
  onClose,
  title,
  icon,
  themeColor = '#2dd4bf', // Color por defecto
  children,
  maxWidth = 'max-w-lg'
}: ModalLayoutProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // OPTIMIZACIÓN BIGTECH: Manejo de teclado (ESC) y Scroll Lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Bloquea el scroll del fondo
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset'; // Restaura el scroll
    };
  }, [isOpen, onClose]);

  // Cerrar al hacer click fuera del contenido (Backdrop click)
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-999 p-4 animate-in fade-in duration-200"
    >
      <div 
        ref={modalRef}
        className={`w-full ${maxWidth} glass rounded-3xl p-8 bg-white/80 relative shadow-2xl animate-in zoom-in-95 duration-200 border border-white/20 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden`}
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Botón de cerrar */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-slate-900/40 hover:text-slate-800 transition-colors z-10 p-1 hover:bg-black/5 rounded-full"
        >
          <X size={24} />
        </button>

        {/* Header Unificado */}
        <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-3">
          {icon && (
            <div 
              className="p-2.5 bg-white/70 rounded-xl transition-colors duration-300 shadow-sm border border-white/40"
              style={{ color: themeColor }}
            >
              {icon}
            </div>
          )}
          <span className="text-slate-700 tracking-tight">
            {title}
          </span>
        </h2>

        {/* Contenido Dinámico (Formularios, infos, etc) */}
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  );
};