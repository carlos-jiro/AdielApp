import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  Bell, 
  LayoutDashboard, 
  Music, 
  Calendar, 
  Youtube, 
  Users, 
  Settings,
  FileText,
  X 
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo, loading, songs } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (searchTerm.trim() === '') return [];
    return songs.filter(song => 
      song.title.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [searchTerm, songs]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value) setIsDropdownOpen(true);
  };

  const handleSelectSong = (songId: string) => {
    navigate(`/song/${songId}`);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const getPageConfig = () => {
    switch (location.pathname) {
      case '/': return { title: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-600' };
      case '/projects': return { title: 'Proyectos', icon: Music, color: 'text-violet-600' };
      case '/calendar': return { title: 'Calendario', icon: Calendar, color: 'text-orange-500' };
      case '/tutorials': return { title: 'Aprendiendo', icon: Youtube, color: 'text-red-600' };
      case '/members': return { title: 'Miembros', icon: Users, color: 'text-emerald-600' };
      case '/settings': return { title: 'Configuración', icon: Settings, color: 'text-slate-600' };
      default: return { title: 'Detalle', icon: FileText, color: 'text-slate-400' };
    }
  };

  const { title, icon: Icon, color } = getPageConfig();
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo?.full_name || 'Usuario')}&background=2dd4bf&color=fff`;

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 px-4 py-2 mt-6 gap-6 relative z-40">
      
      {/* --- TÍTULO --- */}
      <div className="flex items-center gap-3 shrink-0">
        <Icon 
            size={36} 
            className={`${color} transition-colors duration-300 drop-shadow-sm`} 
            strokeWidth={2.5} 
        />
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          {title}
        </h1>
      </div>

      {/* --- SECCIÓN DERECHA --- */}
      <div className="flex flex-col-reverse md:flex-row items-end md:items-center gap-6 w-full md:w-auto">
        
        {/* --- 🔍 BUSCADOR GLASS --- */}
        <div className="relative w-full md:w-80" ref={searchRef}>
            <div className="relative group">
                {/* INPUT GLASS: bg-white/40 + backdrop-blur-md */}
                <input 
                    type="text" 
                    placeholder="Buscar canto..." 
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => searchTerm && setIsDropdownOpen(true)}
                    className="w-full bg-white/40 backdrop-blur-md border border-white/60 text-slate-700 text-sm rounded-2xl pl-10 pr-4 py-2.5 
                               focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]/50 focus:bg-white/70 
                               placeholder:text-slate-500 transition-all shadow-sm group-hover:shadow-md"
                />
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#2dd4bf] transition-colors" />
                
                {searchTerm && (
                    <button 
                        onClick={() => { setSearchTerm(''); setIsDropdownOpen(false); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* --- RESULTADOS DROPDOWN GLASS --- */}
            {isDropdownOpen && searchTerm && (
                // CONTAINER GLASS: bg-white/70 + backdrop-blur-xl
                <div className="absolute top-full left-0 w-full mt-2 bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    {results.length > 0 ? (
                        <div className="py-2">
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4 py-2">Coincidencias</h3>
                            {results.map((song) => (
                                <div 
                                    key={song.id}
                                    onClick={() => handleSelectSong(song.id)}
                                    // HOVER GLASS: hover:bg-white/60
                                    className="px-4 py-3 hover:bg-white/60 cursor-pointer transition-colors flex items-center gap-3 group border-b border-white/20 last:border-0"
                                >
                                    <div className="p-2 bg-white/50 text-violet-500 rounded-lg group-hover:bg-[#2dd4bf] group-hover:text-white transition-colors shadow-sm">
                                        <Music size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700 group-hover:text-[#2dd4bf] transition-colors">{song.title}</p>
                                        <p className="text-xs text-slate-500">{song.author || 'Autor desconocido'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 text-center text-slate-500 text-sm font-medium">
                            No se encontraron cantos.
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* --- PERFIL --- */}
        <div className="flex items-center gap-6 self-end md:self-auto shrink-0">
            <button className="text-slate-400 hover:text-[#2dd4bf] transition-colors relative cursor-pointer">
                <Bell size={20} />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                <div className="hidden sm:block text-right">
                    {loading ? (
                    <div className="h-8 w-24 bg-slate-100 animate-pulse rounded"></div>
                    ) : (
                    <>
                        <p className="font-bold text-slate-800 text-sm leading-tight">
                        {userInfo?.full_name || 'Usuario'}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                        {userInfo?.group_role || 'Invitado'}
                        </p>
                    </>
                    )}
                </div>

                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md ring-1 ring-slate-100">
                    {loading ? (
                    <div className="w-full h-full bg-slate-200 animate-pulse" />
                    ) : (
                    <img 
                        src={userInfo?.avatar_url || defaultAvatar} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = defaultAvatar; }}
                    />
                    )}
                </div>
            </div>
        </div>

      </div>
    </header>
  );
};

export default Header;