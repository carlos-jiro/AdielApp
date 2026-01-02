import { useState } from 'react';
import { X, Mail, User, Music2, Send, Award } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSuccess?: () => void; 
}

// Mantenemos la misma lista que en Settings para consistencia
const GROUP_ROLES = [
  "Director",
  "Secretario",
  "Tesorera",
  "Coord. Eventos",
  "Miembro"
];

const InviteMemberModal = ({ isOpen, onClose, onInviteSuccess }: InviteMemberModalProps) => {
  const [loading, setLoading] = useState(false);
  
  // Ahora incluimos groupRole en el estado inicial
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    voicePart: 'Soprano',
    groupRole: 'Miembro' // Valor por defecto seguro
  });

  if (!isOpen) return null;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Enviamos también el 'groupRole' a la Edge Function
      const { error } = await supabase.functions.invoke('invite-user', {
        body: {
          email: formData.email,
          fullName: formData.fullName,
          voicePart: formData.voicePart,
          groupRole: formData.groupRole, 
          // NOTA: Tu Edge Function deberá leer 'groupRole' y decidir 
          // si asignar role='admin' (si es Director/Secretario) o 'viewer'
        }
      });

      if (error) throw error;

      alert(`Invitación enviada a ${formData.email} como ${formData.groupRole}`);
      
      if (onInviteSuccess) onInviteSuccess();
      
      onClose();
      // Limpiar formulario al cerrar
      setFormData({ email: '', fullName: '', voicePart: 'Soprano', groupRole: 'Miembro' });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Error al enviar invitación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative glass w-full max-w-md rounded-3xl p-8 shadow-2xl border border-white/50 animate-in zoom-in-95 bg-white/80">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Invitar Miembro</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-xl transition-colors">
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleInvite} className="space-y-4">
          
          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                type="email" 
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border-0 focus:ring-2 focus:ring-[#2dd4bf] text-slate-700 placeholder:text-slate-400 outline-none transition-all"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nombre Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                type="text" 
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border-0 focus:ring-2 focus:ring-[#2dd4bf] text-slate-700 outline-none transition-all"
                placeholder="Juan Pérez"
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
          </div>

          {/* Selector de Cargo (Nuevo) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Cargo Oficial</label>
            <div className="relative">
              <Award className="absolute left-3 top-3 text-amber-500" size={20} />
              <select 
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border-0 focus:ring-2 focus:ring-[#2dd4bf] text-slate-700 appearance-none cursor-pointer outline-none transition-all font-medium"
                value={formData.groupRole}
                onChange={e => setFormData({...formData, groupRole: e.target.value})}
              >
                {GROUP_ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Selector de Voz */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Cuerda / Voz</label>
            <div className="relative">
              <Music2 className="absolute left-3 top-3 text-[#2dd4bf]" size={20} />
              <select 
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border-0 focus:ring-2 focus:ring-[#2dd4bf] text-slate-700 appearance-none cursor-pointer outline-none transition-all"
                value={formData.voicePart}
                onChange={e => setFormData({...formData, voicePart: e.target.value})}
              >
                <option value="Soprano">Soprano</option>
                <option value="Contralto">Contralto</option>
                <option value="Tenor">Tenor</option>
                <option value="Barítono">Barítono</option>
                <option value="Bajo">Bajo</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#2dd4bf] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? 'Enviando...' : <><Send size={20} /> Enviar Invitación</>}
          </button>

        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;