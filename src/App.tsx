import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './lib/store';

// ... tus imports de páginas ...
import Login from './pages/login/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Projects from './pages/projects/Projects';
import SongDetail from './pages/projects/SongDetail';
import Calendar from './pages/calendar/Calendar';
import Tutorials from './pages/tutorials/Tutorials';
import ProjectDetail from './pages/projects/ProjectDetail';
import Navbar from './components/Navbar';
import Header from './components/Header';
import Settings from './pages/settings/Settings';
import Members from './pages/memebers/Members';

import GlobalPlayer from './components/GlobalPlayer';

function App() {
  const fetchGroupInfo = useAppStore((state) => state.fetchGroupInfo);
  const fetchUserInfo = useAppStore((state) => state.fetchUserInfo);
  const fetchMembers = useAppStore((state) => state.fetchMembers);
  const fetchSongs = useAppStore((state) => state.fetchSongs); 
  const fetchAttendanceStats = useAppStore((state) => state.fetchAttendanceStats);

  const [session, setSession] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroupInfo();
    fetchUserInfo();
    fetchMembers();
    fetchSongs(); 
    fetchAttendanceStats(); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false); 
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if(session) {
         fetchGroupInfo();
         fetchUserInfo();
         fetchSongs();
         fetchAttendanceStats();
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#2dd4bf] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {!session ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        // CAMBIO 1: 'h-screen' (fijo) y 'overflow-hidden'. 
        // Esto evita que la página entera haga scroll, forzando a que solo el contenido interno lo haga.
        <div className="flex h-screen overflow-hidden "> 
          
          <Navbar />
          
          {/* CAMBIO 2: 
              - 'w-full': Asegura que en móvil tome el 100% del ancho.
              - 'overflow-y-auto': Permite que el contenido general haga scroll si no es una página especial.
              - Quitamos 'pb-24' de aquí para manejarlo dinámicamente o dentro de las páginas.
          */}
          <main className="flex-1 w-full ml-0 md:ml-80 transition-all duration-300 h-full overflow-y-auto">
            <Header />
            
            {/* Contenedor de Rutas */}
            <div className="pb-24 md:pb-0"> {/* Espacio seguro para el player solo en móvil si hace falta */}
                <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/project/:id" element={<ProjectDetail />} />
                <Route path="/song/:id" element={<SongDetail />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/tutorials" element={<Tutorials />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/members" element={<Members />} />
                <Route path="/login" element={<Navigate to="/" />} />
                </Routes>
            </div>
          </main>

          {/* Player Global Flotante */}
          <GlobalPlayer />

        </div>
      )}
    </Router>
  );
}

export default App;