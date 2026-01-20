import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useState, useEffect } from 'react';
import type { ComponentType } from 'react';
// Icons
import { 
  LayoutDashboard, 
  Building2, 
  Calendar, 
  Settings, 
  Youtube, 
  Music, 
  Users, 
  Menu, 
  X 
} from 'lucide-react';

// --- NAVITEM ORIGINAL ---
const NavItem = ({ to, icon: Icon, label, onClick }: { to: string, icon: ComponentType<{ size: number }>, label: string, onClick?: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      onClick={onClick} 
      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
        isActive 
        ? 'bg-[#2dd4bf] text-white shadow-lg scale-105' 
        : 'text-slate-600 hover:bg-white/50'
      }`}
    >
      <Icon size={22} />
      <span className="font-medium">{label}</span>
    </Link>
  );
};

const Navbar = () => {
  const { groupInfo, loading } = useAppStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Bloquear el scroll del body cuando el menú está abierto
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileOpen]);

  // Helper para renderizar la info del grupo (Reutilizable)
  const renderGroupHeader = () => (
    <div className="flex flex-col items-center justify-center mb-8 w-full mt-4">
      <div className="w-28 h-28 rounded-3xl flex items-center justify-center text-white shadow-2xl shrink-0 overflow-hidden border-4 border-white/30 aspect-square">
        {loading ? (
          <div className="animate-pulse w-full h-full bg-white/30" />
        ) : groupInfo?.logo_url ? (
          <img src={groupInfo.logo_url} alt="Logo" className="w-full h-full object-cover" />
        ) : (
          <Building2 size={48} />
        )}
      </div>
      
      <h1 className="text-xl font-bold tracking-tight text-slate-800 mt-4 text-center px-2 leading-tight">
        {loading ? 'Cargando...' : (groupInfo?.name || 'CoroPro')}
      </h1>
      
      {!loading && (
         <p className="text-xs text-slate-400 font-medium mt-1">Panel de Control</p>
      )}
    </div>
  );

  return (
    <>
      {/* =================================================================
          1. VERSIÓN ESCRITORIO (ORIGINAL - INTACTA)
         ================================================================= */}
      <nav className="hidden lg:flex fixed top-0 left-0 h-[calc(100vh-2rem)] w-72 m-4 rounded-3xl glass flex-col p-6 gap-2 z-50 overflow-y-auto hide-scrollbar">
        {renderGroupHeader()}
        <div className="flex flex-col gap-2 flex-1">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/projects" icon={Music} label="Proyectos" />
          <NavItem to="/members" icon={Users} label="Miembros" />
          <NavItem to="/calendar" icon={Calendar} label="Calendario" />
          <NavItem to="/tutorials" icon={Youtube} label="Tutoriales" />
        </div>
        <div className="mt-auto border-t border-slate-200/50 pt-4">
          <NavItem to="/settings" icon={Settings} label="Ajustes" />
        </div>
      </nav>

      {/* =================================================================
          2. BOTÓN FLOTANTE (SOLO MÓVIL)
          - Se oculta suavemente (opacity-0) cuando el menú se abre para no estorbar
         ================================================================= */}
      <button 
          onClick={() => setIsMobileOpen(true)} 
          className={`lg:hidden fixed top-4 left-4 z-50 p-3 bg-white/90 backdrop-blur-sm shadow-lg rounded-xl text-slate-600 hover:text-[#2dd4bf] border border-slate-100 transition-all duration-300 ${
            isMobileOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
      >
          <Menu size={24} />
      </button>

      {/* =================================================================
          3. DRAWER / MENÚ LATERAL ANIMADO (SOLO MÓVIL)
          - Ya no usamos renderizado condicional ({isMobileOpen && ...})
          - Usamos clases CSS para moverlo y ocultarlo
         ================================================================= */}
      
      {/* CONTENEDOR PRINCIPAL DEL OVERLAY (Z-INDEX ALTO) */}
      <div className={`lg:hidden fixed inset-0 z-60 transition-visibility duration-300 ${isMobileOpen ? 'visible' : 'invisible'}`}>
            
          {/* A. FONDO OSCURO (BACKDROP) 
              - Opacity controla el fade in/out
          */}
          <div 
              className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
                  isMobileOpen ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={() => setIsMobileOpen(false)}
          />

          {/* B. BARRA LATERAL (SIDEBAR)
              - Translate controla el slide in/out
              - 'w-80': MÁS ANCHO (antes w-72)
          */}
          <div className={`absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col p-6 overflow-y-auto transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${
              isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
              
              {/* Botón Cerrar */}
              <button 
                  onClick={() => setIsMobileOpen(false)} 
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 transition-colors bg-slate-50 rounded-lg"
              >
                  <X size={20} />
              </button>

              {/* CONTENIDO DEL MENÚ */}
              {renderGroupHeader()}

              <div className="flex flex-col gap-2 flex-1">
                  <NavItem to="/" icon={LayoutDashboard} label="Dashboard" onClick={() => setIsMobileOpen(false)} />
                  <NavItem to="/projects" icon={Music} label="Proyectos" onClick={() => setIsMobileOpen(false)} />
                  <NavItem to="/members" icon={Users} label="Miembros" onClick={() => setIsMobileOpen(false)} />
                  <NavItem to="/calendar" icon={Calendar} label="Calendario" onClick={() => setIsMobileOpen(false)} />
                  <NavItem to="/tutorials" icon={Youtube} label="Tutoriales" onClick={() => setIsMobileOpen(false)} />
              </div>

              <div className="mt-8 border-t border-slate-100 pt-4 pb-8">
                  <NavItem to="/settings" icon={Settings} label="Ajustes" onClick={() => setIsMobileOpen(false)} />
              </div>
          </div>
      </div>
    </>
  );
};

export default Navbar;
