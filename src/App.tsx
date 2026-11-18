// src/App.tsx
// Libraries
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';

// Pages
import Dashboard from '@/pages/dashboard';
import Calendar from '@/pages/calendar';
import SongDetail from '@/pages/projects/SongDetail';
import Tutorials from '@/pages/tutorials/Tutorials';
import Projects from '@/pages/projects/Projects';
import Settings from '@/pages/settings/Settings';
import Members from '@/pages/members/Members';
import Login from '@/pages/login/Login';

// Components
import Navbar from '@/components/layout/Navbar';
import Header from '@/components/layout/Header';
import GlobalPlayer from '@/components/global/GlobalPlayer';

function AuthenticatedApp() {
  const location = useLocation();
  const isSongDetail = location.pathname.startsWith('/song/');
  const isDashboard = location.pathname === '/';
  const isSettings = location.pathname === '/settings';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.documentElement.style.overscrollBehavior;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none';
    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overscrollBehavior = previousOverscroll;
    };
  }, []);

  return (
    <div className="app-shell app-theme music-shell flex overflow-hidden">
      <Navbar isMobileOpen={isMobileMenuOpen} onMobileOpenChange={setIsMobileMenuOpen} />
      <main className="flex flex-col flex-1 w-full ml-0 lg:ml-56 transition-all duration-300 h-full overflow-hidden min-h-0">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <div className={`flex-1 min-h-0 overflow-hidden ${isSongDetail || isDashboard || isSettings || location.pathname === '/projects' ? 'pb-0' : 'pb-24 md:pb-0'}`}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/song/:id" element={<SongDetail />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/tutorials" element={<Tutorials />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/members" element={<Members />} />
            <Route path="/login" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
      <GlobalPlayer />
    </div>
  );
}

function App() {
  const fetchAttendanceStats = useAppStore((state) => state.fetchAttendanceStats);
  const fetchGroupInfo = useAppStore((state) => state.fetchGroupInfo);
  const fetchUserInfo = useAppStore((state) => state.fetchUserInfo);
  const fetchMembers = useAppStore((state) => state.fetchMembers);
  const fetchSongs = useAppStore((state) => state.fetchSongs); 

  const [session, setSession] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      
      // Load data if session exists
      if (session) {
        fetchGroupInfo();
        fetchUserInfo();
        fetchMembers();
        fetchSongs(); 
        fetchAttendanceStats();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if(session) {
        // Reload data when session changes
        fetchGroupInfo();
        fetchUserInfo();
        fetchSongs();
        fetchAttendanceStats();
      }
    });

    return () => subscription.unsubscribe();
  }, [
    fetchAttendanceStats,
    fetchGroupInfo, 
    fetchUserInfo, 
    fetchMembers, 
    fetchSongs, 
  ]);

  if (loading) {
    return (
      <div className="app-shell app-theme music-shell flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-300 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-cyan-100/70 font-medium animate-pulse">Cargando...</p>
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
        <AuthenticatedApp />
      )}
    </Router>
  );
}

export default App;
