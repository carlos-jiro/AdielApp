import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Music2, Award, Calendar, Loader2, X, Shield, Edit2, Save, XCircle } from 'lucide-react';
import { useAppStore } from '../lib/store';

interface Props {
  userId: string;
  onClose: () => void;
}

const GROUP_ROLES = ["Director", "Secretario", "Tesorera", "Coord. Eventos", "Miembro"];

const MemberProfileView = ({ userId, onClose }: Props) => {
  const fetchMembers = useAppStore((state) => state.fetchMembers);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para Edición
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Formulario temporal
  const [formData, setFormData] = useState({
    voice_part: '',
    group_role: ''
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data: myProfile } = await supabase
                .from('profiles')
                .select('role, group_role')
                .eq('id', session.user.id)
                .single();
            
            if (myProfile && (myProfile.role === 'admin' || ['Director', 'Secretario'].includes(myProfile.group_role))) {
                setIsAdmin(true);
            }
        }

        const { data: targetProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        setProfile(targetProfile);
        
        if (targetProfile) {
            setFormData({
                voice_part: targetProfile.voice_part || 'Soprano',
                group_role: targetProfile.group_role || 'Miembro'
            });
        }

      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (userId) fetchData();
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    try {
        let technicalRole = 'viewer'; 
        if (['Director', 'Secretario'].includes(formData.group_role)) technicalRole = 'admin';
        else technicalRole = 'editor';

        const { error } = await supabase
            .from('profiles')
            .update({
                voice_part: formData.voice_part,
                group_role: formData.group_role,
                role: technicalRole
            })
            .eq('id', userId);

        if (error) throw error;

        setProfile({ 
            ...profile, 
            voice_part: formData.voice_part, 
            group_role: formData.group_role,
            role: technicalRole 
        });
        
        setIsEditing(false);
        // Opcional: alert("Datos actualizados");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        alert("Error al actualizar: " + error.message);
    } finally {
        setSaving(false);
    }
    fetchMembers(); // Refrescar lista de miembros en el store global
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-[#2dd4bf]" size={32} /></div>;
  if (!profile) return <div className="text-center p-10 text-slate-400">Usuario no encontrado</div>;

  return (
    <>
      {/* Estilos para ocultar scrollbar pero permitir scroll */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>

      {/* Contenedor principal con h-full y overflow-hidden para que NO crezca más allá del padre */}
      <div className="h-full flex flex-col relative animate-in slide-in-from-left duration-300 overflow-hidden">
        
        {/* --- BOTONES FLOTANTES (Absolute) --- */}
        <div className="absolute top-0 right-0 z-20 flex gap-2">
            {isAdmin && !isEditing && (
              <button 
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-slate-500 hover:text-[#2dd4bf] bg-white/50 rounded-full hover:bg-white transition-all shadow-sm backdrop-blur-sm"
                  title="Editar Cargo y Voz"
              >
                  <Edit2 size={18} />
              </button>
            )}
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-white/50 rounded-full hover:bg-white transition-all shadow-sm backdrop-blur-sm">
              <X size={20} />
            </button>
        </div>

        {/* --- HEADER (Shrink-0 para que no se aplaste) --- */}
        <div className="flex flex-col items-center mb-4 mt-2 shrink-0">
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100 mb-2 relative group">
              {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-300">
                      {profile.full_name?.charAt(0)}
                  </div>
              )}
          </div>
          <h2 className="text-lg font-bold text-slate-800 text-center leading-tight px-4">{profile.full_name}</h2>
          <span className="text-xs text-slate-500 font-medium">{profile.email}</span>
          
          <div className="flex gap-2 mt-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${['Director', 'Secretario'].includes(profile.group_role) ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                  {profile.group_role}
              </span>
              {profile.role === 'admin' && (
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <Shield size={10} /> Admin
                  </span>
              )}
          </div>
        </div>

        {/* --- DETALLES SCROLEABLES (Flex-1 para ocupar espacio restante) --- */}
        {/* Usamos la clase 'no-scrollbar' que definimos arriba */}
        <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-2 space-y-3 min-h-0">
          
          {/* CAMPO VOZ */}
          <div className={`p-3 rounded-2xl border shadow-sm flex items-center gap-3 transition-all ${isEditing ? 'bg-purple-50 border-purple-200 ring-1 ring-purple-200' : 'bg-white/60 border-white/60'}`}>
              <div className="p-2 bg-purple-100 text-purple-600 rounded-xl shrink-0">
                  <Music2 size={18} />
              </div>
              <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Cuerda / Voz</p>
                  {isEditing ? (
                      <select 
                          value={formData.voice_part}
                          onChange={(e) => setFormData({...formData, voice_part: e.target.value})}
                          className="w-full bg-white border border-purple-200 text-slate-700 text-sm rounded-lg p-1.5 outline-none focus:ring-2 focus:ring-purple-500"
                      >
                          {['Soprano', 'Contralto', 'Tenor', 'Bajo'].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                  ) : (
                      <p className="text-slate-700 font-bold text-base truncate">{profile.voice_part || 'No asignado'}</p>
                  )}
              </div>
          </div>

          {/* CAMPO CARGO */}
          <div className={`p-3 rounded-2xl border shadow-sm flex items-center gap-3 transition-all ${isEditing ? 'bg-amber-50 border-amber-200 ring-1 ring-amber-200' : 'bg-white/60 border-white/60'}`}>
              <div className="p-2 bg-amber-100 text-amber-600 rounded-xl shrink-0">
                  <Award size={18} />
              </div>
              <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Cargo Oficial</p>
                  {isEditing ? (
                       <select 
                          value={formData.group_role}
                          onChange={(e) => setFormData({...formData, group_role: e.target.value})}
                          className="w-full bg-white border border-amber-200 text-slate-700 text-sm rounded-lg p-1.5 outline-none focus:ring-2 focus:ring-amber-500"
                      >
                          {GROUP_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                  ) : (
                      <p className="text-slate-700 font-bold text-sm truncate">{profile.group_role || 'Miembro'}</p>
                  )}
              </div>
          </div>

          {/* CAMPO FECHA */}
          <div className="bg-white/60 p-3 rounded-2xl border border-white/60 shadow-sm flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-xl shrink-0">
                  <Calendar size={18} />
              </div>
              <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Miembro desde</p>
                  <p className="text-slate-700 font-medium text-sm">
                      {new Date(profile.created_at).toLocaleDateString()}
                  </p>
              </div>
          </div>

        </div>

        {/* --- FOOTER DE EDICIÓN (Shrink-0 para que empuje el contenido hacia arriba) --- */}
        {isEditing && (
          <div className="mt-3 pt-3 border-t border-slate-200/50 flex gap-3 shrink-0 animate-in slide-in-from-bottom-2">
              <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-colors flex justify-center items-center gap-2 text-sm"
                  disabled={saving}
              >
                  <XCircle size={16} /> Cancelar
              </button>
              <button 
                  onClick={handleSave}
                  className="flex-1 py-2 rounded-xl bg-[#2dd4bf] text-white font-bold hover:bg-[#25b09f] transition-colors shadow-lg shadow-[#2dd4bf]/20 flex justify-center items-center gap-2 disabled:opacity-70 text-sm"
                  disabled={saving}
              >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Guardar</>}
              </button>
          </div>
        )}

      </div>
    </>
  );
};

export default MemberProfileView;