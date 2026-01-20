// src/App.tsx
// Libraries
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useAppStore } from './store/useAppStore';

// Pages
import Dashboard from './pages/dashboard';
//olds
import SongDetail from './pages/projects/SongDetail';
import Tutorials from './pages/tutorials/Tutorials';
import Projects from './pages/projects/Projects';
import Calendar from './pages/calendar/Calendar';
import Settings from './pages/settings/Settings';
import Members from './pages/memebers/Members';
import Navbar from './components/Navbar';
import Header from './components/Header';
import Login from './pages/login/Login';

// Components
import GlobalPlayer from './components/GlobalPlayer';

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
        <div className="flex h-screen overflow-hidden "> 
          <Navbar />
          <main className="flex-1 w-full ml-0 md:ml-80 transition-all duration-300 h-full overflow-y-auto">
            <Header />
            <div className="pb-24 md:pb-0">
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
      )}
    </Router>
  );
}

export default App;