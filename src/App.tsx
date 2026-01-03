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

function App() {
  const fetchGroupInfo = useAppStore((state) => state.fetchGroupInfo);
  const fetchUserInfo = useAppStore((state) => state.fetchUserInfo);
  const fetchMembers = useAppStore((state) => state.fetchMembers);
  const fetchSongs = useAppStore((state) => state.fetchSongs); 
  // 1. Agregamos el selector para las estadísticas
  const fetchAttendanceStats = useAppStore((state) => state.fetchAttendanceStats);

  const [session, setSession] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Estas funciones son asíncronas, pero al lanzarlas aquí sin await,
    // corren en paralelo en "segundo plano" mientras la UI sigue su curso.
    fetchGroupInfo();
    fetchUserInfo();
    fetchMembers();
    fetchSongs(); 
    // 2. Intentamos cargar estadísticas al inicio (si ya hay sesión persistida)
    fetchAttendanceStats(); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // ... tu lógica de autenticación ...
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false); 
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Opcional: Si el usuario hace login, recargar datos por si acaso
      if(session) {
         fetchGroupInfo();
         fetchUserInfo();
         fetchSongs();
         // 3. Recargamos estadísticas al detectar cambio de sesión (Login exitoso)
         fetchAttendanceStats();
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ... resto del renderizado (sin cambios) ...
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
        <div className="flex min-h-screen">
          <Navbar />
          <main className="flex-1 ml-80">
            <Header />
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
          </main>
        </div>
      )}
    </Router>
  );
}

export default App;