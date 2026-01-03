import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { UserPlus, Shield, Users, ClipboardList, PieChart } from 'lucide-react';
import InviteMemberModal from '../../components/InviteMemberModal';

// Componentes Nuevos
import MemberProfileView from '../../components/MemberProfileView';
import AttendanceRegister from '../../components/AttendanceRegister';
import MyAttendanceView from '../../components/MyAttendanceView';

// --- INTERFACES ---
interface Profile {
  id: string;
  email: string;
  role: string;
  group_role: string;
  full_name: string;
  voice_part: string;
  avatar_url: string | null;
  created_at: string;
}

type LeftViewType = 'EMPTY' | 'PROFILE' | 'ATTENDANCE_ADMIN' | 'ATTENDANCE_PERSONAL';

const Members = () => {
  // --- ESTADOS ---
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados de Vista Dinámica
  const [currentView, setCurrentView] = useState<LeftViewType>('EMPTY');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setMyUserId(session.user.id);
        const { data: myProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (myProfile) {
          setIsAdmin(myProfile.role === 'admin');
        }
      }

      const { data: allProfiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(allProfiles || []);

    } catch (error) {
      console.error('Error cargando miembros:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleProfileClick = (id: string) => {
    setSelectedProfileId(id);
    setCurrentView('PROFILE');
  };

  const handleCloseLeftPanel = () => {
    setCurrentView('EMPTY');
    setSelectedProfileId(null);
  };

  return (
    // CONTENEDOR PRINCIPAL
    <div className="w-full pl-4 pr-8 pb-4 h-[calc(100vh-12rem)] md:h-[calc(100vh-7rem)] animate-in fade-in duration-700">
      
      {/* GRID LAYOUT (Invertido: Izquierda 4 cols, Derecha 8 cols) */}
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* --- CAJA DERECHA: LISTA DE MIEMBROS --- */}
        <div className="col-span-1 md:col-span-8 h-full rounded-3xl glass p-6 overflow-hidden flex flex-col gap-6 relative border-l-4 border-purple-500/20">
            
            {/* CABECERA */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">Directorio</h2>
                    <p className="text-sm text-slate-500 font-medium">Estructura oficial del grupo.</p>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Botón Mi Asistencia */}
                    <button 
                        onClick={() => setCurrentView('ATTENDANCE_PERSONAL')}
                        className={`px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm ${currentView === 'ATTENDANCE_PERSONAL' ? 'ring-2 ring-purple-500 border-transparent' : ''}`}
                    >
                        <PieChart size={18} className="text-purple-500" /> <span className="hidden sm:inline">Mi Asistencia</span>
                    </button>

                    {/* Botón Asistencias (ADMIN) */}
                    {isAdmin && (
                        <button 
                            onClick={() => setCurrentView('ATTENDANCE_ADMIN')}
                            className={`px-4 py-2.5 bg-[#2dd4bf]/10 text-[#0f766e] rounded-xl text-sm font-bold hover:bg-[#2dd4bf]/20 transition-colors flex items-center gap-2 ${currentView === 'ATTENDANCE_ADMIN' ? 'ring-2 ring-[#2dd4bf]' : ''}`}
                        >
                            <ClipboardList size={18} /> Asistencias
                        </button>
                    )}

                    {/* Botón Invitar (ADMIN) */}
                    {isAdmin && (
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md hover:bg-slate-700 transition-all cursor-pointer active:scale-95 text-sm"
                        >
                            <UserPlus size={18} /> <span className="hidden sm:inline">Invitar</span>
                        </button>
                    )} 
                </div>   
            </div>

            {/* TABLA CON SCROLL */}
            <div className="flex-1 overflow-auto rounded-2xl custom-scrollbar"> 
                <table className="w-full text-left border-collapse min-w-150 rounded-2xl overflow-hidden bg-none"> 
                    <thead className="sticky top-0 z-10 rounded-t-2xl overflow-hidden bg-none">
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold shadow-sm rounded-t-2xl">
                            <th className="px-6 py-4 rounded-tl-2xl">Miembro</th>
                            <th className="px-6 py-4">Voz</th>
                            <th className="px-6 py-4">Cargo</th>
                            <th className="px-6 py-4 text-center rounded-tr-2xl">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-400 text-lg">Cargando equipo...</td></tr>
                        ) : profiles.map((profile) => (
                            <tr 
                                key={profile.id} 
                                onClick={() => handleProfileClick(profile.id)}
                                className={`transition-colors cursor-pointer ${
                                    selectedProfileId === profile.id 
                                    ? 'bg-purple-50 hover:bg-purple-100' 
                                    : 'hover:bg-slate-50/50'
                                }`}
                            >
                                {/* Columna: Miembro */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-400 font-bold shrink-0 shadow-sm border border-white">
                                            {profile.avatar_url ? (
                                                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <span className="text-lg">{profile.full_name?.charAt(0) || '?'}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`font-bold text-base ${selectedProfileId === profile.id ? 'text-purple-700' : 'text-slate-700'}`}>
                                                {profile.full_name || 'Sin nombre'}
                                            </p>
                                            <p className="text-xs text-slate-400 truncate">{profile.email}</p>
                                        </div>
                                    </div>
                                </td>

                                {/* Columna: Voz */}
                                <td className="px-6 py-4">
                                    <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-lg font-medium whitespace-nowrap border border-slate-200">
                                        {profile.voice_part || '-'}
                                    </span>
                                </td>

                                {/* Columna: Cargo */}
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide whitespace-nowrap ${['Director', 'Secretario'].includes(profile.group_role) ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                        {profile.role === 'admin' && <Shield size={12} className="mb-0.5" />}
                                        {profile.group_role || 'Miembro'}
                                    </span>
                                </td>

                                {/* Columna: Estado */}
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#2dd4bf] shadow-sm"></span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* --- CAJA IZQUIERDA: CONTENEDOR DINÁMICO (3 Vistas) --- */}
        <div className="hidden md:block md:col-span-4 h-full">
            <div className={`w-full h-full rounded-3xl glass p-6 overflow-hidden relative transition-all duration-300 ${currentView === 'EMPTY' ? 'bg-slate-50/30' : 'bg-white/80'}`}>
                
                {/* 1. VISTA VACÍA */}
                {currentView === 'EMPTY' && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-6">
                        <Users size={48} className="mb-4 opacity-20" />
                        <h3 className="text-lg font-bold text-slate-500">Detalles del Miembro</h3>
                        <p className="text-sm">Selecciona a alguien de la lista o usa las herramientas de asistencia.</p>
                    </div>
                )}

                {/* 2. VISTA PERFIL */}
                {currentView === 'PROFILE' && selectedProfileId && (
                    <MemberProfileView userId={selectedProfileId} onClose={handleCloseLeftPanel} />
                )}

                {/* 3. VISTA ASISTENCIA ADMIN */}
                {currentView === 'ATTENDANCE_ADMIN' && (
                    <AttendanceRegister onClose={handleCloseLeftPanel} />
                )}

                {/* 4. VISTA MI ASISTENCIA */}
                {currentView === 'ATTENDANCE_PERSONAL' && myUserId && (
                    <MyAttendanceView userId={myUserId} onClose={handleCloseLeftPanel} />
                )}
            </div>
        </div>

      </div>

      <InviteMemberModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onInviteSuccess={fetchData} 
      />

    </div>
  );
};

export default Members;
