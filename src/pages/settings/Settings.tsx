/* eslint-disable @typescript-eslint/no-explicit-any */
//src/pages/settings/Settings.tsx
// Utils
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { compressImage } from '../../lib/imageUtils';
import { useAppStore } from '../../store/useAppStore'; 
// Icons
import { 
  Building2, 
  KeyRound, 
  FileText, 
  Calendar, 
  Loader2, 
  Camera, 
  Music2, 
  Award, 
  Lock, 
  Save, 
  User, 
  BellRing,
  CheckCircle2,
  Smartphone,
} from 'lucide-react';

// --- INTERFACES ---
interface GroupInfo {
  name: string;
  description: string;
  founded_at: string;
  logo_url: string | null;
}

const GROUP_ROLES = ["Director", "Secretario", "Tesorera", "Coord. Eventos", "Miembro"];

const base64UrlToUint8Array = (value: string) => {
  const padding = '='.repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const decoded = window.atob(base64);
  const bytes = new Uint8Array(decoded.length);
  for (let index = 0; index < decoded.length; index += 1) bytes[index] = decoded.charCodeAt(index);
  return bytes;
};

const Settings = () => {
  // --- ESTADOS ---
  const setGlobalGroupInfo = useAppStore((state) => state.setGroupInfo); 
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [myUserId, setMyUserId] = useState<string | null>(null);

  // Estado Mi Perfil
  const [myFormData, setMyFormData] = useState({
    full_name: '',
    voice_part: 'Soprano',
    group_role: 'Miembro',
    avatar_url: '' as string | null
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Estado Info Grupo
  const [groupInfo, setGroupInfo] = useState<GroupInfo>({
    name: '',
    description: '',
    founded_at: '',
    logo_url: null
  });
  const [savingGroup, setSavingGroup] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // --- NUEVO ESTADO: CONTRASEÑA ---
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Push notifications are enabled by the user, per browser/device.
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushNeedsHomeScreen, setPushNeedsHomeScreen] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushMessage, setPushMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Referencias Inputs Archivos
  const fileInputRef = useRef<HTMLInputElement>(null); 
  const logoInputRef = useRef<HTMLInputElement>(null); 

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const checkPushSupport = async () => {
      const iosDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent)
        || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const standalone = window.matchMedia('(display-mode: standalone)').matches
        || (navigator as Navigator & { standalone?: boolean }).standalone === true;
      const needsHomeScreen = iosDevice && !standalone;
      const supported = window.isSecureContext
        && 'serviceWorker' in navigator
        && 'PushManager' in window
        && 'Notification' in window;

      if (!isMounted) return;
      setPushSupported(supported);
      setPushNeedsHomeScreen(needsHomeScreen);
      if (!supported) return;

      setPushPermission(Notification.permission);
      if (Notification.permission !== 'granted') return;

      try {
        const registration = await navigator.serviceWorker.getRegistration('/');
        const subscription = await registration?.pushManager.getSubscription();
        if (isMounted) setPushEnabled(Boolean(subscription));
      } catch {
        if (isMounted) setPushEnabled(false);
      }
    };

    void checkPushSupport();
    return () => { isMounted = false; };
  }, []);

  const handleEnablePush = async () => {
    setPushMessage(null);
    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

    if (!pushSupported) {
      setPushMessage({ type: 'error', text: 'Este navegador no permite notificaciones push. Actualiza Safari/Chrome y usa HTTPS.' });
      return;
    }
    if (pushNeedsHomeScreen) {
      setPushMessage({ type: 'info', text: 'En iPhone/iPad, primero usa Compartir → Añadir a pantalla de inicio y abre Adiel desde su icono.' });
      return;
    }
    if (!vapidPublicKey) {
      setPushMessage({ type: 'error', text: 'Falta configurar VITE_VAPID_PUBLIC_KEY para esta instalación.' });
      return;
    }

    setPushBusy(true);
    try {
      // Must be called directly from this user gesture, especially on iOS.
      const permission = Notification.permission === 'default'
        ? await Notification.requestPermission()
        : Notification.permission;
      setPushPermission(permission);
      if (permission !== 'granted') {
        throw new Error(permission === 'denied'
          ? 'Las notificaciones están bloqueadas. Permítelas en los ajustes del navegador o de iOS.'
          : 'No se concedió permiso para mostrar notificaciones.');
      }

      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64UrlToUint8Array(vapidPublicKey) as BufferSource,
        });
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Tu sesión expiró. Inicia sesión de nuevo.');
      const { error: saveError } = await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        subscription: subscription.toJSON(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,endpoint' });
      if (saveError) throw saveError;

      setPushEnabled(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No se pudo recuperar la sesión para enviar la prueba.');

      const response = await fetch('/api/push-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.error || 'Se activaron las notificaciones, pero no se pudo enviar la prueba.');
      setPushMessage({ type: 'success', text: '¡Listo! Enviamos una notificación de prueba a este dispositivo.' });
    } catch (error) {
      setPushMessage({ type: 'error', text: error instanceof Error ? error.message : 'No se pudo activar el envío de notificaciones.' });
    } finally {
      setPushBusy(false);
    }
  };

  const handleDisablePush = async () => {
    setPushBusy(true);
    setPushMessage(null);
    try {
      const registration = await navigator.serviceWorker.getRegistration('/');
      const subscription = await registration?.pushManager.getSubscription();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Inicia sesión de nuevo para administrar este dispositivo.');

      if (subscription) {
        const { error } = await supabase.from('push_subscriptions')
          .delete()
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint);
        if (error) throw error;
        await subscription.unsubscribe();
      }

      setPushEnabled(false);
      setPushMessage({ type: 'info', text: 'Las notificaciones quedaron desactivadas en este dispositivo.' });
    } catch (error) {
      setPushMessage({ type: 'error', text: error instanceof Error ? error.message : 'No se pudo desactivar este dispositivo.' });
    } finally {
      setPushBusy(false);
    }
  };

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      setMyUserId(session.user.id);

      // 1. Obtener Mi Perfil y verificar Admin
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      let currentUserIsAdmin = false;
      if (myProfile) {
        currentUserIsAdmin = myProfile.role === 'admin';
        setIsAdmin(currentUserIsAdmin);
        setMyFormData({
          full_name: myProfile.full_name || '',
          voice_part: myProfile.voice_part || 'Soprano',
          group_role: myProfile.group_role || 'Miembro',
          avatar_url: myProfile.avatar_url || null
        });
      }

      // 2. Obtener Info del Grupo
      const { data: groupData } = await supabase
        .from('group_info')
        .select('*')
        .eq('id', 1) 
        .single();
      
      if (groupData) {
        setGroupInfo({
          name: groupData.name || '',
          description: groupData.description || '',
          founded_at: groupData.founded_at || '',
          logo_url: groupData.logo_url || null
        });
      }

    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  // --- LOGICA IMAGEN USUARIO ---
  const handleAvatarClick = () => fileInputRef.current?.click();
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !myUserId) return;
    const originalFile = event.target.files[0];
    setUploadingAvatar(true);
    try {
      const optimizedFile = await compressImage(originalFile);
      const fileName = `${myUserId}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, optimizedFile, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const { error: dbError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', myUserId);
      if (dbError) throw dbError;
      setMyFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      fetchData(); 
    } catch (error: any) { alert(error.message); } 
    finally { setUploadingAvatar(false); }
  };

  // --- LOGICA LOGO GRUPO ---
  const handleLogoClick = () => {
    if (isAdmin) logoInputRef.current?.click(); 
  };

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    setUploadingLogo(true);

    try {
      const file = event.target.files[0];
      const optimizedFile = await compressImage(file);
      const fileName = `group/logo_${Date.now()}.jpg`; 

      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, optimizedFile, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('group_info').update({ logo_url: publicUrl }).eq('id', 1);
      if (dbError) throw dbError;

      setGroupInfo(prev => ({ ...prev, logo_url: publicUrl }));
      setGlobalGroupInfo({ name: groupInfo.name, logo_url: publicUrl });

    } catch (error: any) {
      alert('Error logo: ' + error.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  // --- LOGICA ACTUALIZAR INFO ---
  const handleUpdateGroupInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setSavingGroup(true);
    try {
      const { error } = await supabase.from('group_info').update({
          name: groupInfo.name,
          description: groupInfo.description,
          founded_at: groupInfo.founded_at
        }).eq('id', 1);
      if (error) throw error;
      setGlobalGroupInfo({ name: groupInfo.name, logo_url: groupInfo.logo_url });
      alert('Información del grupo actualizada');
    } catch (error: any) { alert('Error: ' + error.message); } 
    finally { setSavingGroup(false); }
  };

  const handleUpdateMyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myUserId) return;
    setSavingProfile(true);
    try {
      let technicalRole = 'viewer'; 
      if (['Director', 'Secretario'].includes(myFormData.group_role)) technicalRole = 'admin';
      else technicalRole = 'editor';
      const { error } = await supabase.from('profiles').update({
          full_name: myFormData.full_name,
          voice_part: myFormData.voice_part,
          group_role: myFormData.group_role,
          role: technicalRole
        }).eq('id', myUserId);
      if (error) throw error;
      alert(`¡Perfil actualizado!`);
      fetchData(); 
    } catch (error: any) { alert(error.message); } 
    finally { setSavingProfile(false); }
  };

  // --- LOGICA ACTUALIZAR CONTRASEÑA ---
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setUpdatingPassword(true);

    try {
      // Supabase permite actualizar la contraseña del usuario logueado así:
      const { error } = await supabase.auth.updateUser({ 
        password: passwordForm.newPassword 
      });

      if (error) throw error;

      alert("¡Contraseña actualizada! Ahora puedes iniciar sesión con tu email y esta contraseña.");
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      
    } catch (error: any) {
      alert("Error al actualizar contraseña: " + error.message);
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="mx-auto h-full min-h-0 max-w-6xl space-y-6 overflow-y-auto px-4 pb-0 pt-4 custom-scrollbar animate-in fade-in duration-700 md:space-y-8 md:p-6">
      
      {/* --- SECCIÓN 0: IDENTIDAD DEL GRUPO --- */}
      <div className="glass rounded-3xl p-8 border border-white/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
            <Building2 size={24} />
          </div>
          <div>
              <h2 className="text-2xl font-bold text-slate-800">Identidad del Coro</h2>
              <p className="text-slate-500 text-sm">Información pública de la agrupación</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
           {/* LOGO GRUPO */}
           <div className="flex flex-col items-center gap-3 mx-auto md:mx-0">
            <div 
              onClick={handleLogoClick}
              className={`relative w-40 h-40 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-slate-100 flex items-center justify-center transition-transform 
                ${isAdmin ? 'cursor-pointer hover:scale-105 group' : 'cursor-default'}`}
            >
              <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />

              {uploadingLogo ? (
                <Loader2 className="animate-spin text-blue-500" size={40} />
              ) : groupInfo.logo_url ? (
                <img src={groupInfo.logo_url} alt="Logo Grupo" className="w-full h-full object-cover" />
              ) : (
                <Building2 size={40} className="text-slate-300" />
              )}

              {isAdmin && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={24} />
                </div>
              )}
            </div>
            {isAdmin && <p className="text-xs text-slate-400 font-medium">Cambiar Logo</p>}
          </div>

          {/* FORMULARIO GRUPO */}
          <form onSubmit={handleUpdateGroupInfo} className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nombre del Coro</label>
              <input 
                type="text" 
                value={groupInfo.name}
                disabled={!isAdmin}
                onChange={(e) => setGroupInfo({...groupInfo, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-70"
                placeholder="Ej. Coro Polifónico..."
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Descripción / Lema</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <textarea 
                  rows={2}
                  value={groupInfo.description}
                  disabled={!isAdmin}
                  onChange={(e) => setGroupInfo({...groupInfo, description: e.target.value})}
                  className="w-full pl-10 px-4 py-3 rounded-xl bg-white/60 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none disabled:opacity-70"
                  placeholder="Una breve descripción..."
                />
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase ml-1">Fecha de Fundación</label>
               <div className="relative">
                 <Calendar className="absolute left-3 top-3.5 text-slate-400" size={18} />
                 <input 
                   type="date"
                   value={groupInfo.founded_at}
                   disabled={!isAdmin}
                   onChange={(e) => setGroupInfo({...groupInfo, founded_at: e.target.value})}
                   className="w-full pl-10 px-4 py-3 rounded-xl bg-white/60 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-70"
                 />
               </div>
            </div>

            {isAdmin && (
              <div className="md:col-span-2 flex justify-end mt-2">
                <button 
                  type="submit" 
                  disabled={savingGroup}
                  className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {savingGroup ? 'Guardando...' : <><Save size={18} /> Guardar Info Grupo</>}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* --- SECCIÓN 1: MI PERFIL --- */}
      <div className="glass rounded-3xl p-8 border border-white/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-purple-100 rounded-2xl text-purple-600">
            <User size={24} />
          </div>
          <div>
              <h2 className="text-2xl font-bold text-slate-800">Mi Perfil</h2>
              <p className="text-slate-500 text-sm">Gestiona tu foto y datos personales</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar Usuario */}
          <div className="flex flex-col items-center gap-3 mx-auto md:mx-0">
            <div onClick={handleAvatarClick} className="relative w-32 h-32 rounded-full border-4 border-white shadow-xl cursor-pointer group overflow-hidden bg-slate-100 flex items-center justify-center transition-transform hover:scale-105">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              {uploadingAvatar ? <Loader2 className="animate-spin text-[#2dd4bf]" size={32} /> : myFormData.avatar_url ? <img src={myFormData.avatar_url} className="w-full h-full object-cover" alt="avatar" /> : <span className="text-4xl font-bold text-slate-300">{myFormData.full_name?.charAt(0)}</span>}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="text-white" size={24} /></div>
            </div>
            <p className="text-xs text-slate-400 font-medium">Click para cambiar</p>
          </div>
          
          {/* Form Usuario */}
          <form onSubmit={handleUpdateMyProfile} className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
             <div className="space-y-2 md:col-span-2">
               <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nombre Completo</label>
               <input type="text" value={myFormData.full_name} onChange={(e) => setMyFormData({...myFormData, full_name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/60 border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none" />
             </div>
             
             {/* CAMPO VOZ (SOLO ADMIN) */}
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                 Voz {!isAdmin && <span className="text-slate-400 font-normal ml-1">(Solo Admin)</span>}
               </label>
               <div className="relative">
                 <Music2 className="absolute left-3 top-3.5 text-slate-400" size={18} />
                 <select 
                    value={myFormData.voice_part} 
                    disabled={!isAdmin} 
                    onChange={(e) => setMyFormData({...myFormData, voice_part: e.target.value})} 
                    className={`w-full pl-10 px-4 py-3 rounded-xl bg-white/60 border border-slate-200 outline-none appearance-none transition-all 
                      ${isAdmin 
                        ? 'cursor-pointer focus:ring-2 focus:ring-purple-500' 
                        : 'opacity-70 cursor-not-allowed text-slate-500 bg-slate-50'
                      }`}
                  >
                   {['Soprano', 'Contralto', 'Tenor', 'Bajo'].map(v => <option key={v} value={v}>{v}</option>)}
                 </select>
               </div>
             </div>

             {/* CAMPO CARGO (SOLO ADMIN) */}
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                 Cargo Oficial {!isAdmin && <span className="text-slate-400 font-normal ml-1">(Solo Admin)</span>}
               </label>
               <div className="relative">
                 <Award className="absolute left-3 top-3.5 text-amber-500" size={18} />
                 <select 
                    value={myFormData.group_role} 
                    disabled={!isAdmin} 
                    onChange={(e) => setMyFormData({...myFormData, group_role: e.target.value})} 
                    className={`w-full pl-10 px-4 py-3 rounded-xl bg-white/60 border border-slate-200 outline-none appearance-none transition-all 
                      ${isAdmin 
                        ? 'cursor-pointer focus:ring-2 focus:ring-purple-500' 
                        : 'opacity-70 cursor-not-allowed text-slate-500 bg-slate-50'
                      }`}
                  >
                   {GROUP_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                 </select>
               </div>
             </div>

             <div className="md:col-span-2 flex justify-end mt-2">
               <button type="submit" disabled={savingProfile} className="bg-slate-800 text-white font-bold py-3 px-8 rounded-xl hover:bg-slate-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                 {savingProfile ? 'Guardando...' : <><Save size={18} /> Guardar Cambios</>}
               </button>
             </div>
          </form>
        </div>
      </div>

      {/* --- SECCIÓN 2: SEGURIDAD (NUEVA) --- */}
      <div className="glass rounded-3xl p-8 border border-white/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
            <Lock size={24} />
          </div>
          <div>
              <h2 className="text-2xl font-bold text-slate-800">Seguridad</h2>
              <p className="text-slate-500 text-sm">Configura tu acceso con contraseña</p>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="max-w-md space-y-4">
          <p className="text-slate-600 text-sm mb-4">
            Si te registraste con el enlace o quieres cambiar tu clave actual, ingresa una nueva contraseña aquí.
          </p>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nueva Contraseña</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input 
                type="password" 
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-10 px-4 py-3 rounded-xl bg-white/60 border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Confirmar Contraseña</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input 
                type="password" 
                placeholder="Repite la contraseña"
                className="w-full pl-10 px-4 py-3 rounded-xl bg-white/60 border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={updatingPassword}
              className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 w-full md:w-auto"
            >
              {updatingPassword ? 'Actualizando...' : <><Save size={18} /> Actualizar Contraseña</>}
            </button>
          </div>
        </form>
      </div>

      {/* --- SECCIÓN 3: NOTIFICACIONES PUSH --- */}
      <div className="glass rounded-3xl p-8 border border-white/50 relative overflow-hidden">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="shrink-0 border border-cyan-200/10 bg-cyan-300/[0.08] p-3 text-cyan-200">
              {pushEnabled ? <CheckCircle2 size={22} /> : <BellRing size={22} />}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white">Notificaciones</h2>
              <p className="mt-1 max-w-xl text-sm text-cyan-50/55">
                Recibe avisos del coro en este dispositivo. La prueba confirma que la suscripción push está funcionando.
              </p>
              {pushEnabled && <p className="mt-2 text-xs font-semibold text-emerald-200">Activas en este dispositivo</p>}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
            <button
              onClick={() => void handleEnablePush()}
              disabled={pushBusy || !pushSupported || pushNeedsHomeScreen || pushPermission === 'denied'}
              className="inline-flex items-center justify-center gap-2 bg-cyan-300 px-4 py-2.5 text-xs font-bold text-[#06252b] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
            >
              {pushBusy ? <Loader2 size={16} className="animate-spin" /> : pushEnabled ? <BellRing size={16} /> : <BellRing size={16} />}
              {pushBusy ? 'Enviando…' : pushEnabled ? 'Enviar prueba' : 'Permitir y enviar prueba'}
            </button>
            {pushEnabled && (
              <button onClick={() => void handleDisablePush()} disabled={pushBusy} className="border border-cyan-100/10 px-3 py-2.5 text-xs font-semibold text-cyan-50/65 hover:bg-white/[0.05] hover:text-white disabled:opacity-40">
                Desactivar aquí
              </button>
            )}
          </div>
        </div>

        {pushNeedsHomeScreen && (
          <div className="mt-4 flex items-start gap-2 border border-cyan-100/10 bg-white/[0.025] p-3 text-xs leading-relaxed text-cyan-50/65">
            <Smartphone size={16} className="mt-0.5 shrink-0 text-cyan-200" />
            <span>En iPhone/iPad, agrega Adiel a la pantalla de inicio desde Safari (Compartir → Añadir a pantalla de inicio), ábrelo desde el icono y vuelve aquí para activar las notificaciones. Requiere iOS/iPadOS 16.4 o posterior.</span>
          </div>
        )}
        {!pushSupported && !pushNeedsHomeScreen && (
          <p className="mt-4 border border-amber-200/10 bg-amber-300/[0.06] p-3 text-xs text-amber-100/70">Este navegador no ofrece Push API en este contexto. Usa HTTPS y un navegador compatible.</p>
        )}
        {pushPermission === 'denied' && (
          <p className="mt-4 border border-amber-200/10 bg-amber-300/[0.06] p-3 text-xs text-amber-100/70">El permiso está bloqueado. Cambia la autorización de notificaciones en la configuración del navegador o del sistema.</p>
        )}
        {pushMessage && (
          <p role="status" className={`mt-4 border p-3 text-xs ${pushMessage.type === 'success' ? 'border-emerald-200/15 bg-emerald-300/[0.06] text-emerald-100/80' : pushMessage.type === 'error' ? 'border-rose-200/15 bg-rose-300/[0.06] text-rose-100/80' : 'border-cyan-100/10 bg-white/[0.025] text-cyan-50/65'}`}>
            {pushMessage.text}
          </p>
        )}
      </div>

      {/* --- SECCIÓN 3: APARIENCIA --- */}
      <div className="glass rounded-3xl p-8 border border-white/50 relative overflow-hidden">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-full shrink-0 items-end gap-1 overflow-hidden rounded-2xl border border-cyan-100/10 bg-gradient-to-br from-[#071d25] via-[#0b5362] to-[#22c7d8] p-3 sm:w-48">
            {[18, 31, 22, 39, 26, 44, 30, 19, 36, 24, 42, 17].map((height, index) => (
              <span key={index} className="w-2 rounded-full bg-cyan-50/65" style={{ height }} />
            ))}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Apariencia</h2>
            <p className="mt-1 text-sm font-semibold text-cyan-300">Tema cian profundo</p>
            <p className="mt-1 max-w-xl text-sm text-slate-500">La aplicación usa una paleta oscura cian, con superficies profundas y acentos aqua para mantener una experiencia uniforme.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Settings;
