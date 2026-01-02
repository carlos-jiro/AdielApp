import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { UserPlus, Shield } from 'lucide-react';
import InviteMemberModal from '../../components/InviteMemberModal';

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

const Members = () => {
  // --- ESTADOS ---
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // 1. Verificar si soy admin (para mostrar botón invitar)
        const { data: myProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (myProfile) {
          setIsAdmin(myProfile.role === 'admin');
        }
      }

      // 2. Obtener Lista de Miembros
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

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-6xl mx-auto p-6">
      
      {/* --- CABECERA Y BOTÓN INVITAR --- */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Organigrama</h1>
          <p className="text-slate-500 mt-1">Estructura oficial del grupo.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center gap-2 bg-[#2dd4bf] hover:bg-[#25b09f] text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition-all active:scale-95"
          >
            <UserPlus size={20} /> Invitar
          </button>
        )}
      </div>
      
      {/* --- TABLA DE MIEMBROS --- */}
      <div className="glass rounded-3xl p-6 overflow-hidden border border-slate-100">
        <div className="overflow-x-auto rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Miembro</th>
                <th className="px-6 py-4">Voz</th>
                <th className="px-6 py-4">Cargo</th>
                <th className="px-6 py-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400">Cargando...</td></tr>
              ) : profiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-400 font-bold shrink-0">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <span>{profile.full_name?.charAt(0) || '?'}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">{profile.full_name || 'Sin nombre'}</p>
                        <p className="text-xs text-slate-400">{profile.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-lg font-medium">
                      {profile.voice_part || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${['Director', 'Secretario'].includes(profile.group_role) ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                      {profile.role === 'admin' && <Shield size={10} className="mb-0.5" />}
                      {profile.group_role || 'Miembro'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#2dd4bf] shadow-sm"></span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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