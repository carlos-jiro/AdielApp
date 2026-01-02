import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Music, Calendar, Youtube, Settings, Building2, Users } from 'lucide-react';
import type { ComponentType } from 'react';
import { useAppStore } from '../lib/store';

// Componente NavItem (Sin cambios)
const NavItem = ({ to, icon: Icon, label }: { to: string, icon: ComponentType<{ size: number }>, label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
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

  return (
    <nav className="fixed top-0 left-0 h-[calc(100vh-2rem)] w-72 m-4 rounded-3xl glass flex flex-col p-6 gap-2 z-50 overflow-y-auto hide-scrollbar">
      
      {/* --- HEADER CENTRADO Y GRANDE --- */}
      <div className="flex flex-col items-center justify-center mb-8 w-full mt-4">
        
        {/* Contenedor del Logo (Grande y Centrado) */}
        <div className="w-28 h-28 rounded-3xl flex items-center justify-center text-white shadow-2xl shrink-0 overflow-hidden border-4 border-white/30 aspect-square">
          {loading ? (
            <div className="animate-pulse w-full h-full bg-white/30" />
          ) : groupInfo?.logo_url ? (
            <img src={groupInfo.logo_url} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <Building2 size={48} />
          )}
        </div>
        
        {/* Nombre del Grupo (Debajo y Centrado) */}
        <h1 className="text-xl font-bold tracking-tight text-slate-800 mt-4 text-center px-2 leading-tight">
          {loading ? 'Cargando...' : (groupInfo?.name || 'CoroPro')}
        </h1>
        
        {/* Subtítulo opcional (para decorar) */}
        {!loading && (
             <p className="text-xs text-slate-400 font-medium mt-1">Panel de Control</p>
        )}
      </div>
      
      {/* --- LINKS DE NAVEGACIÓN --- */}
      <div className="flex flex-col gap-2 flex-1">
        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/projects" icon={Music} label="Proyectos" />
        <NavItem to="/members" icon={Users} label="Miembros" />
        <NavItem to="/calendar" icon={Calendar} label="Calendario" />
        <NavItem to="/tutorials" icon={Youtube} label="Tutoriales" />
      </div>

      {/* --- FOOTER (SETTINGS) --- */}
      <div className="mt-auto border-t border-slate-200/50 pt-4">
        <NavItem to="/settings" icon={Settings} label="Ajustes" />
      </div>
    </nav>
  );
};

export default Navbar;