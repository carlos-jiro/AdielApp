import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Calendar, Save, CheckCircle2, Loader2, X, Search, ChevronDown } from 'lucide-react';

interface Props {
  onClose: () => void;
}

interface Activity {
  id: string;
  title: string;
  event_date: string;
}

const AttendanceRegister = ({ onClose }: Props) => {
  // Estados para Actividades
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  
  // Estados de Miembros y Asistencia
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [members, setMembers] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>({});
  
  // Estados de UI
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Cargar la lista de Actividades y Miembros al inicio
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingActivities(true);

      // A. Cargar Actividades (Ordenadas por fecha descendente)
      const { data: activitiesData } = await supabase
        .from('activities')
        .select('id, title, event_date')
        .order('event_date', { ascending: false });
      
      setActivities(activitiesData || []);
      
      // Seleccionar la primera actividad por defecto si existe
      if (activitiesData && activitiesData.length > 0) {
        setSelectedActivityId(activitiesData[0].id);
      }

      // B. Cargar Miembros (Perfiles)
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .order('full_name');
      
      setMembers(profilesData || []);
      setLoadingActivities(false);
    };

    fetchInitialData();
  }, []);

  // 2. Cargar Asistencias cuando cambia la Actividad seleccionada
  useEffect(() => {
    if (!selectedActivityId) return;

    const fetchAttendanceForActivity = async () => {
      setLoadingAttendance(true);

      const { data } = await supabase
        .from('attendance')
        .select('user_id, status')
        .eq('activity_id', selectedActivityId);

      // Resetear mapa a false
      const map: Record<string, boolean> = {};
      members.forEach(m => map[m.id] = false);

      // Llenar con datos de la DB
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data?.forEach((record: any) => {
        map[record.user_id] = record.status;
      });

      setAttendanceMap(map);
      setLoadingAttendance(false);
    };

    if (members.length > 0) {
        fetchAttendanceForActivity();
    }
  }, [selectedActivityId, members]);

  // --- HANDLERS ---

  const toggleAttendance = (userId: string) => {
    setAttendanceMap(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleSave = async () => {
    if (!selectedActivityId) return alert("Selecciona una actividad primero");
    setSaving(true);
    
    // Preparamos array para upsert
    const updates = Object.entries(attendanceMap).map(([userId, isPresent]) => ({
      activity_id: selectedActivityId,
      user_id: userId,
      status: isPresent
    }));

    // Upsert usando la llave compuesta (activity_id, user_id)
    const { error } = await supabase
      .from('attendance')
      .upsert(updates, { onConflict: 'activity_id, user_id' });

    if (error) {
        alert('Error al guardar: ' + error.message);
    } else {
        alert('Asistencia guardada correctamente');
        onClose();
    }
    setSaving(false);
  };

  const filteredMembers = members.filter(m => 
    m.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col animate-in slide-in-from-left duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="text-[#2dd4bf]" /> Asistencias
            </h2>
            <p className="text-xs text-slate-500 font-medium">Selecciona un evento para calificar</p>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
      </div>

      {/* SELECTOR DE ACTIVIDAD (Reemplaza al input date) */}
      <div className="mb-4 bg-white/60 p-3 rounded-xl border border-slate-200 shadow-sm">
        <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Seleccionar Actividad</label>
        <div className="relative">
            <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
            <select 
                value={selectedActivityId} 
                onChange={(e) => setSelectedActivityId(e.target.value)}
                disabled={loadingActivities}
                className="w-full pl-10 pr-8 py-2.5 rounded-lg bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-[#2dd4bf] text-slate-700 font-medium appearance-none cursor-pointer truncate"
            >
                {loadingActivities ? (
                    <option>Cargando eventos...</option>
                ) : activities.length === 0 ? (
                    <option value="">No hay actividades creadas</option>
                ) : (
                    activities.map(activity => (
                        <option key={activity.id} value={activity.id}>
                            {/* Formato: FECHA - TITULO */}
                            {new Date(activity.event_date).toLocaleDateString()} — {activity.title}
                        </option>
                    ))
                )}
            </select>
            <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Buscador Rápido de Miembros */}
      <div className="relative mb-2 shrink-0">
         <Search className="absolute left-3 top-3 text-slate-400" size={16} />
         <input 
            type="text" 
            placeholder="Buscar miembro..." 
            className="w-full pl-9 pr-3 py-2 bg-white/40 border-b border-slate-200 outline-none text-sm focus:bg-white/60 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
         />
      </div>

      {/* LISTA DE MIEMBROS */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2 mb-4">
        {loadingActivities || loadingAttendance ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400">
                <Loader2 className="animate-spin text-[#2dd4bf]" />
                <span className="text-xs">Cargando lista...</span>
            </div>
        ) : filteredMembers.length === 0 ? (
            <p className="text-center text-slate-400 py-4">No se encontraron miembros.</p>
        ) : (
            filteredMembers.map(member => (
                <div 
                    key={member.id} 
                    onClick={() => toggleAttendance(member.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all select-none ${
                        attendanceMap[member.id] 
                        ? 'bg-[#2dd4bf]/10 border-[#2dd4bf] shadow-sm' 
                        : 'bg-white/40 border-transparent hover:bg-white/80'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${attendanceMap[member.id] ? 'bg-[#2dd4bf] text-white' : 'bg-slate-200 text-slate-500'}`}>
                            {member.avatar_url ? (
                                <img src={member.avatar_url} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                member.full_name?.charAt(0)
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className={`font-medium text-sm truncate ${attendanceMap[member.id] ? 'text-slate-800' : 'text-slate-500'}`}>
                                {member.full_name}
                            </p>
                        </div>
                    </div>
                    
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                        attendanceMap[member.id] 
                        ? 'bg-[#2dd4bf] border-[#2dd4bf]' 
                        : 'border-slate-300 bg-white'
                    }`}>
                        {attendanceMap[member.id] && <CheckCircle2 className="text-white" size={16} />}
                    </div>
                </div>
            ))
        )}
      </div>

      {/* Footer Save */}
      <button 
        onClick={handleSave} 
        disabled={saving || !selectedActivityId}
        className="w-full bg-[#2dd4bf] text-white font-bold py-3 rounded-xl hover:bg-[#26bba8] transition-all flex justify-center items-center gap-2 shadow-lg shadow-[#2dd4bf]/20 active:scale-95 disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed"
      >
        {saving ? 'Guardando...' : <><Save size={18} /> Guardar Registro</>}
      </button>
    </div>
  );
};

export default AttendanceRegister;