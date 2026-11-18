import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Search, Bell, LayoutDashboard, Music, Calendar, Youtube, Users, Settings, FileText, Menu, X } from 'lucide-react';

const Header = ({ onMenuClick, isMobileMenuOpen }: { onMenuClick: () => void; isMobileMenuOpen: boolean }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo, loading, songs } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const isDashboard = location.pathname === '/';
  const isProjectsPage = location.pathname === '/projects';

  const results = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const query = searchTerm.trim().toLocaleLowerCase();
    return songs.filter(song => [song.title, song.author || '', song.tone || ''].join(' ').toLocaleLowerCase().includes(query)).slice(0, 5);
  }, [searchTerm, songs]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageConfig = () => {
    if (location.pathname.startsWith('/song/')) {
      const songId = decodeURIComponent(location.pathname.split('/')[2] || '');
      return { title: songs.find(song => song.id === songId)?.title || 'Canto', icon: Music };
    }

    switch (location.pathname) {
      case '/': return { title: 'Inicio', icon: LayoutDashboard };
      case '/projects': return { title: 'Repertorio', icon: Music };
      case '/calendar': return { title: 'Calendario', icon: Calendar };
      case '/tutorials': return { title: 'Tutoriales', icon: Youtube };
      case '/members': return { title: 'Miembros', icon: Users };
      case '/settings': return { title: 'Configuración', icon: Settings };
      default: return { title: 'Repertorio', icon: FileText };
    }
  };

  const { title, icon: Icon } = getPageConfig();
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo?.full_name || 'Usuario')}&background=8b5cf6&color=fff`;

  return (
    <header className={`app-header relative ${isMobileMenuOpen ? 'z-40' : 'z-[70]'} flex shrink-0 flex-wrap items-center justify-between gap-x-3 px-4 pb-4 pt-3 md:flex-nowrap md:px-7 md:pt-5 ${isDashboard ? 'text-white' : 'text-ink'}`}>
      <button onClick={onMenuClick} aria-label="Abrir menú" className="order-0 flex h-9 w-9 shrink-0 items-center justify-center border border-cyan-100/10 bg-[#0d3039] text-cyan-50 lg:hidden">
        <Menu size={19} />
      </button>
      <div className="order-1 flex min-w-0 flex-1 items-center gap-2.5 md:flex-none">
        <Icon className={`h-6 w-6 md:h-7 md:w-7 ${isDashboard ? 'text-cyan-200' : 'text-accent'}`} strokeWidth={2.2} />
        <h1 title={title} className={`max-w-[55vw] truncate text-xl font-bold tracking-tight md:max-w-[min(48vw,560px)] md:text-2xl ${isDashboard ? 'text-white' : 'text-ink'}`}>{title}</h1>
      </div>

      <div className={`${isProjectsPage ? 'hidden' : 'hidden md:flex'} order-3 mt-4 w-full md:order-2 md:mx-auto md:mt-0 md:w-auto`}>
        <div className="relative w-full md:w-80" ref={searchRef}>
          <div className="group relative">
            <input
              type="text"
              placeholder="Buscar canto, autor o tono..."
              value={searchTerm}
              onChange={(event) => { setSearchTerm(event.target.value); setIsDropdownOpen(Boolean(event.target.value)); }}
              onFocus={() => searchTerm && setIsDropdownOpen(true)}
              className={`w-full rounded-xl border py-2.5 pl-10 pr-9 text-sm outline-none transition-all focus:ring-2 ${isDashboard
                ? 'border-cyan-100/10 bg-white/[0.07] text-white placeholder:text-cyan-50/35 focus:border-cyan-300/40 focus:ring-cyan-400/25'
                : 'border-line bg-white text-ink placeholder:text-slate-400 focus:border-accent focus:ring-accent/30'}`}
            />
            <Search size={18} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${isDashboard ? 'text-cyan-50/40 group-focus-within:text-cyan-200' : 'text-slate-400 group-focus-within:text-accent'}`} />
            {searchTerm && (
              <button onClick={() => { setSearchTerm(''); setIsDropdownOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            )}
          </div>

          {isDropdownOpen && searchTerm && (
            <div className={`absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border shadow-xl ${isDashboard ? 'border-cyan-100/10 bg-[#10404a]' : 'border-line bg-white'}`}>
              {results.length ? (
                <div className="py-1">
                  <p className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider ${isDashboard ? 'text-cyan-50/40' : 'text-slate-400'}`}>Coincidencias</p>
                  {results.map(song => (
                    <button key={song.id} onClick={() => { navigate(`/song/${song.id}`); setSearchTerm(''); setIsDropdownOpen(false); }} className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${isDashboard ? 'hover:bg-white/[0.06]' : 'hover:bg-canvas'}`}>
                      <span className={`rounded-lg p-2 ${isDashboard ? 'bg-white/[0.07] text-cyan-200' : 'bg-canvas text-slate-500'}`}><Music size={16} /></span>
                      <span className="min-w-0">
                        <span className={`block truncate text-sm font-semibold ${isDashboard ? 'text-white' : 'text-ink'}`}>{song.title}</span>
                        <span className={`block truncate text-xs ${isDashboard ? 'text-cyan-50/45' : 'text-slate-500'}`}>{song.author || 'Autor desconocido'}</span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : <p className={`p-6 text-center text-sm ${isDashboard ? 'text-cyan-50/55' : 'text-slate-500'}`}>No se encontraron cantos.</p>}
            </div>
          )}
        </div>
      </div>

      <div className="order-2 ml-auto flex shrink-0 items-center gap-4 md:order-3 md:ml-0">
        <button aria-label="Notificaciones" className={`relative hidden transition-colors md:block ${isDashboard ? 'text-cyan-50/55 hover:text-cyan-200' : 'text-slate-400 hover:text-accent'}`}>
          <Bell size={19} />
          <span className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ${isDashboard ? 'bg-cyan-300 ring-2 ring-[#0a2a34]' : 'bg-accent ring-2 ring-canvas'}`} />
        </button>
        <div className={`flex items-center gap-3 md:border-l md:pl-4 ${isDashboard ? 'border-cyan-100/10' : 'border-line'}`}>
          <div className="hidden text-right sm:block">
            {loading ? <div className={`h-8 w-24 animate-pulse rounded ${isDashboard ? 'bg-white/10' : 'bg-slate-100'}`} /> : <>
              <p className={`text-sm font-semibold leading-tight ${isDashboard ? 'text-white' : 'text-ink'}`}>{userInfo?.full_name || 'Usuario'}</p>
              <p className={`text-xs font-medium ${isDashboard ? 'text-cyan-50/45' : 'text-slate-500'}`}>{userInfo?.group_role || 'Invitado'}</p>
            </>}
          </div>
          <div className={`h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ${isDashboard ? 'ring-cyan-100/20' : 'ring-line'}`}>
            {loading ? <div className={`h-full w-full animate-pulse ${isDashboard ? 'bg-white/10' : 'bg-slate-200'}`} /> : <img src={userInfo?.avatar_url || defaultAvatar} alt="Avatar" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.src = defaultAvatar; }} />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
