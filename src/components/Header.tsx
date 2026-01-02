import { Search, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../lib/store'; // 👈 Importamos el store

const Header = () => {
  const location = useLocation();
  
  // 👇 Obtenemos datos del usuario desde el store global
  const { userInfo, loading } = useAppStore();

  // Mapeo de rutas a nombres de títulos
  const getTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/projects': return 'Proyectos';
      case '/calendar': return 'Calendario';
      case '/tutorials': return 'Aprendiendo';
      case '/members': return 'Miembros';
      case '/settings': return 'Configuración';
      default: return 'Detalle';
    }
  };

  // Generador de avatar por defecto (si no tiene foto)
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo?.full_name || 'Usuario')}&background=2dd4bf&color=fff`;

  return (
    <header className=" flex flex-col md:flex-row justify-between items-start md:items-center mb-8 px-4 py-2 mt-6 gap-4">
      {/* Título dinámico */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          {getTitle()}
        </h1>
      </div>

      {/* Sección Derecha */}
      <div className="flex items-center gap-6 self-end md:self-auto">
        <button className="text-slate-400 hover:text-[#2dd4bf] transition-colors cursor-pointer">
          <Search size={20} />
        </button>

        <button className="text-slate-400 hover:text-[#2dd4bf] transition-colors relative cursor-pointer">
          <Bell size={20} />
          {/* Notificación (punto rojo) */}
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Perfil del Usuario */}
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          
          {/* Texto (Nombre y Rol) */}
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

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md ring-1 ring-slate-100">
            {loading ? (
              <div className="w-full h-full bg-slate-200 animate-pulse" />
            ) : (
              <img 
                src={userInfo?.avatar_url || defaultAvatar} 
                alt="Avatar" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback si la imagen rompe
                  e.currentTarget.src = defaultAvatar;
                }}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;