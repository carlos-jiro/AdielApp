import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Upload, Save, X } from 'lucide-react'; // Importamos X para el FileInput interno
import { ModalLayout } from './ui/ModalLayout'; // Asegúrate de importar tu Layout

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onRefresh: () => void;
  existingSong?: { id: string; title: string } | null;
}

const UploadSongModal = ({ isOpen, onClose, projectId, onRefresh, existingSong }: Props) => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    pista: null, soprano: null, contralto: null, tenor: null, baritono: null, bajo: null, pdf: null
  });

  useEffect(() => {
    if (isOpen) {
      if (existingSong) {
        setTitle(existingSong.title);
      } else {
        setTitle('');
        setFiles({ pista: null, soprano: null, contralto: null, tenor: null, baritono: null, bajo: null, pdf: null });
      }
    }
  }, [isOpen, existingSong]);

  const handleFileChange = (type: string, file: File | null) => {
    setFiles(prev => ({ ...prev, [type]: file }));
  };

  // --- Lógica de subida (Inalterada) ---
  const uploadFile = async (file: File, songId: string) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `songs/${songId}/${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('music_assets').upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (uploadError) throw new Error(`Error Storage: ${uploadError.message}`);
    const { data } = supabase.storage.from('music_assets').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sesión expirada. Loguéate de nuevo.");

      let currentSongId = existingSong?.id;

      if (!currentSongId) {
        // Crear
        const songData = { title, project_id: projectId ? projectId : null };
        const { data: newSong, error: createError } = await supabase
          .from('songs').insert([songData]).select().single();
        if (createError) throw createError;
        currentSongId = newSong.id;
      } else {
        // Editar
        const { error: updateError } = await supabase
          .from('songs').update({ title }).eq('id', currentSongId);
        if (updateError) throw updateError;
      }

      // Subir Assets
      const assetPromises = Object.entries(files).map(async ([type, file]) => {
        if (!file) return; 
        await supabase.from('song_assets').delete().match({ song_id: currentSongId, type });
        const url = await uploadFile(file, currentSongId!);
        const { error: assetError } = await supabase.from('song_assets').insert({
            song_id: currentSongId, type: type, file_url: url, display_name: `${type.toUpperCase()} - ${title}`
          });
        if (assetError) throw assetError;
      });

      await Promise.all(assetPromises);
      onRefresh(); onClose();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error:", error); alert(error.message || "Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  };

  // --- Componente FileInput (Con TUS estilos originales) ---
  const FileInput = ({ label, type, accept }: { label: string, type: string, accept: string }) => {
    const file = files[type];
    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</label>
        <div className="flex items-center gap-2 bg-white/70 p-2 rounded-xl border border-white/10 shadow-inner">
          <label className="bg-[#2dd4bf] text-white/85 text-[12px] font-black py-2 px-3 rounded-lg cursor-pointer hover:bg-[#26bba8] transition-all uppercase shrink-0 tracking-wider">
            {file ? 'Cambiar' : 'Elegir'}
            <input type="file" accept={accept} className="hidden" onChange={(e) => handleFileChange(type, e.target.files?.[0] || null)} />
          </label>
          <span className={`text-[11px] truncate flex-1 ${file ? 'text-slate-800 font-bold' : 'text-slate-800 italic'}`}>
            {file ? `✅ ${file.name}` : 'Mantener actual (o vacío)'}
          </span>
          {file && (
            <button type="button" onClick={() => handleFileChange(type, null)} className="p-1 text-red-500 hover:bg-red-50 rounded-md">
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    );
  };

  // --- RENDERIZADO CON LAYOUT ---
  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={onClose}
      title={existingSong ? 'Editar Materiales' : 'Cargar Nuevo Canto'}
      icon={existingSong ? <Save className="text-[#2dd4bf]" size={24} /> : <Upload className="text-[#2dd4bf]" size={24} />}
      themeColor="#2dd4bf"
      maxWidth="max-w-2xl" // Mantenemos el ancho grande
    >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Input Título (Con TUS estilos originales) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1 text-left">Título del Canto</label>
            <input 
              required className="w-full bg-white/70 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2dd4bf] outline-none"
              value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Aleluya Haendel"
            />
          </div>

          {/* Secciones de archivos */}
          <div className="space-y-4 text-left">
            <p className="font-bold text-sm text-slate-700 border-b pb-1">Audios (MP3)</p>
            <FileInput label="Pista General" type="pista" accept="audio/*"  />
            <FileInput label="Voz Soprano" type="soprano" accept="audio/*" />
            <FileInput label="Voz Contralto" type="contralto" accept="audio/*" />
          </div>

          <div className="space-y-4 text-left">
            <p className="font-bold text-sm text-slate-700 border-b pb-1">Audios (MP3)</p>
            <FileInput label="Voz Tenor" type="tenor" accept="audio/*" />
            <FileInput label="Voz Barítono" type="baritono" accept="audio/*" />
            <FileInput label="Voz Bajo" type="bajo" accept="audio/*" />
          </div>

          <div className="space-y-4 text-left md:col-span-2">
            <p className="font-bold text-sm text-slate-700 border-b pb-1">Otros Materiales</p>
            <FileInput label="Partitura / Letra (PDF)" type="pdf" accept=".pdf" />
          </div>

          {/* Botón Submit (Con TUS estilos originales) */}
          <button disabled={loading} type="submit" className="md:col-span-2 w-full bg-[#2dd4bf] text-white font-bold py-4 rounded-2xl hover:bg-[#26bba8] transition-all disabled:opacity-50 mt-4 shadow-md">
            {loading ? 'Guardando cambios...' : (existingSong ? 'Actualizar Canto' : 'Guardar Canto')}
          </button>
        </form>
    </ModalLayout>
  );
};

export default UploadSongModal;