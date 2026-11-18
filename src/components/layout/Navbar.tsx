import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import type { ComponentType } from 'react';
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  Settings,
  Youtube,
  Music2,
  UsersRound,
  X,
} from 'lucide-react';

interface NavbarProps {
  isMobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

const NavItem = ({
  to,
  icon: Icon,
  label,
  onClick,
}: {
  to: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  onClick?: () => void;
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all ${
        isActive
          ? 'bg-cyan-500/20 text-white shadow-[inset_0_0_0_1px_rgba(103,232,249,0.14)]'
          : 'text-cyan-50/55 hover:bg-white/[0.055] hover:text-white'
      }`}
    >
      {isActive && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-cyan-300" />}
      <Icon size={18} className={`shrink-0 transition-colors ${isActive ? 'text-cyan-200' : 'text-cyan-100/55 group-hover:text-cyan-50'}`} />
      <span>{label}</span>
    </Link>
  );
};

const Navbar = ({ isMobileOpen, onMobileOpenChange }: NavbarProps) => {
  const { groupInfo, loading } = useAppStore();

  const renderBrand = () => (
    <div className="flex items-center gap-3 px-2">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-cyan-400 to-teal-600 shadow-lg shadow-cyan-950/40">
        {loading ? (
          <div className="h-full w-full animate-pulse bg-white/20" />
        ) : groupInfo?.logo_url ? (
          <img src={groupInfo.logo_url} alt="Logo" className="h-full w-full object-cover" />
        ) : (
          <Building2 size={20} className="text-white" />
        )}
      </div>
      <div className="min-w-0">
        <h1 className="truncate text-[15px] font-bold leading-tight tracking-tight text-white">
          {loading ? 'Cargando…' : (groupInfo?.name || 'Adiel')}
        </h1>
        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-cyan-100/45">Music workspace</p>
      </div>
    </div>
  );

  const renderNav = (onNavigate?: () => void) => (
    <>
      <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/35">Espacio</p>
      <div className="flex flex-col gap-1">
        <NavItem to="/" icon={LayoutDashboard} label="Inicio" onClick={onNavigate} />
        <NavItem to="/projects" icon={Music2} label="Repertorio" onClick={onNavigate} />
        <NavItem to="/members" icon={UsersRound} label="Miembros" onClick={onNavigate} />
        <NavItem to="/calendar" icon={CalendarDays} label="Calendario" onClick={onNavigate} />
        <NavItem to="/tutorials" icon={Youtube} label="Tutoriales" onClick={onNavigate} />
      </div>
    </>
  );

  return (
    <>
      <nav className="fixed inset-y-0 left-0 z-50 hidden w-56 flex-col border-r border-cyan-100/[0.08] bg-[#09262e]/95 lg:flex">
        <div className="border-b border-white/[0.07] px-4 pb-5 pt-6">{renderBrand()}</div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          {renderNav()}
          <div className="mt-8 rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-100/40">Tu espacio</p>
            <p className="mt-1 text-xs leading-relaxed text-cyan-50/65">Ensayos, repertorio y comunidad en un solo lugar.</p>
          </div>
        </div>
        <div className="border-t border-white/[0.07] p-3">
          <NavItem to="/settings" icon={Settings} label="Ajustes" />
        </div>
      </nav>

      <div className={`fixed inset-0 z-[60] lg:hidden ${isMobileOpen ? 'visible' : 'invisible'}`}>
        <button
          aria-label="Cerrar menú"
          className={`absolute inset-0 bg-[#031217]/70 transition-opacity ${isMobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => onMobileOpenChange(false)}
        />
        <div className={`mobile-nav-drawer absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-cyan-100/10 bg-[#09262e] transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between border-b border-white/[0.07] px-4 pb-4 pt-4">
            {renderBrand()}
            <button onClick={() => onMobileOpenChange(false)} aria-label="Cerrar" className="p-2 text-cyan-50/60 hover:text-white">
              <X size={19} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-5">{renderNav(() => onMobileOpenChange(false))}</div>
          <div className="border-t border-white/[0.07] p-3">
            <NavItem to="/settings" icon={Settings} label="Ajustes" onClick={() => onMobileOpenChange(false)} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
