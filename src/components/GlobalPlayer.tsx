import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../lib/store';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Volume1 } from 'lucide-react';

const GlobalPlayer = () => {
  const { 
    activeTrack, isPlaying, togglePlay, closePlayer,
    playNext, playPrevious, queue, currentIndex 
  } = useAppStore();
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // --- Estados Locales ---
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1); 
  const [isMuted, setIsMuted] = useState(false);

  // 1. Manejo del Audio
  useEffect(() => {
    if (!audioRef.current) return;

    if (activeTrack) {
        if (audioRef.current.src !== activeTrack.url) {
            audioRef.current.src = activeTrack.url;
        }

        if (isPlaying) {
            audioRef.current.play().catch(e => console.error("Error playback", e));
        } else {
            audioRef.current.pause();
        }
    } else {
        audioRef.current.pause();
    }
  }, [activeTrack, isPlaying]);

  // 2. Manejo del Volumen
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // 3. Eventos de Tiempo
  const handleTimeUpdate = () => {
    if (audioRef.current) {
        setProgress(audioRef.current.currentTime);
        if (!isNaN(audioRef.current.duration)) {
             setDuration(audioRef.current.duration);
        }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = Number(e.target.value);
      if (audioRef.current) {
          audioRef.current.currentTime = newTime;
          setProgress(newTime);
      }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVol = Number(e.target.value);
      setVolume(newVol);
      if(newVol > 0 && isMuted) setIsMuted(false);
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  };

  const getVolumeIcon = () => {
      if (isMuted || volume === 0) return <VolumeX size={20} />;
      if (volume < 0.5) return <Volume1 size={20} />;
      return <Volume2 size={20} />;
  };

  const hasNext = queue.length > 0 && currentIndex < queue.length - 1;
  const hasPrev = queue.length > 0 && currentIndex > 0;

  if (!activeTrack) return null;

  return (
    // CONTENEDOR PRINCIPAL
    // Mobile: bottom-2 left-2 right-2 (casi full width)
    // Desktop: bottom-4 centrado (width fijo)
    <div className="fixed bottom-2 left-2 right-2 md:bottom-4 md:w-187.5 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-500 ease-out">
        
      <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl md:rounded-3xl p-2 md:p-4 flex items-center justify-between gap-2 md:gap-4 ring-1 ring-black/5">
        
        <audio 
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onEnded={playNext}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        />

        {/* 1. INFO (Izquierda) */}
        {/* Usamos flex-1 min-w-0 para que el texto se corte (truncate) si falta espacio */}
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 max-w-[40%] md:max-w-[25%]">
           
           {/* Imagen: Más pequeña en móvil (w-10) */}
           <div className="w-10 h-10 md:w-12 md:h-12 bg-linear-to-br from-[#2dd4bf] to-teal-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
             <div className={`transition-all duration-700 ${isPlaying ? 'animate-[pulse_3s_infinite]' : ''}`}>
                <Play size={16} fill="white" className={`md:w-5 md:h-5 ${isPlaying ? "hidden" : "block"}`} />
                {/* Visualizer (solo desktop para no saturar) */}
                <div className={`hidden md:flex items-end gap-0.5 h-4 ${!isPlaying && 'hidden'}`}>
                    <div className="w-1 bg-white animate-bounce h-2"></div>
                    <div className="w-1 bg-white animate-[bounce_1.2s_infinite] h-4"></div>
                    <div className="w-1 bg-white animate-[bounce_0.8s_infinite] h-3"></div>
                </div>
                {/* Icono simple en móvil si está sonando */}
                <div className={`md:hidden ${!isPlaying && 'hidden'}`}>
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                </div>
             </div>
           </div>

           {/* Texto: Visible en móvil pero truncado */}
           <div className="overflow-hidden flex flex-col justify-center">
             <h4 className="font-bold text-slate-800 truncate text-xs md:text-sm leading-tight">{activeTrack.title}</h4>
             <p className="text-[10px] text-slate-500 truncate font-medium uppercase tracking-wider">{activeTrack.author}</p>
           </div>
        </div>

        {/* 2. CONTROLES (Centro) */}
        {/* En móvil toma el espacio restante, en desktop tiene max-width */}
        <div className="flex flex-col items-center justify-center flex-1 md:max-w-md">
           
           {/* Botones */}
           <div className="flex items-center gap-3 md:gap-4 mb-1">
              <button 
                onClick={playPrevious}
                disabled={!hasPrev}
                className={`transition-colors ${!hasPrev ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-slate-600'}`}
              >
                 <SkipBack size={16} className="md:w-4.5 md:h-4.5" />
              </button>
              
              <button 
                onClick={togglePlay}
                className="w-8 h-8 md:w-9 md:h-9 bg-slate-800 rounded-full flex items-center justify-center text-white hover:scale-105 hover:bg-black transition-all shadow-md active:scale-95"
              >
                {isPlaying ? <Pause size={14} fill="white" className="md:w-4 md:h-4" /> : <Play size={14} fill="white" className="ml-0.5 md:w-4 md:h-4" />}
              </button>
              
              <button 
                onClick={playNext}
                disabled={!hasNext}
                className={`transition-colors ${!hasNext ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-slate-600'}`}
              >
                 <SkipForward size={16} className="md:w-4.5 md:h-4.5" />
              </button>
           </div>
           
           {/* Barra de Progreso */}
           <div className="w-full flex items-center gap-2 text-[10px] text-slate-400 font-bold font-mono">
              {/* Ocultamos los números en móvil para ganar espacio */}
              <span className="hidden sm:block w-8 text-right">{formatTime(progress)}</span>
              
              <div className="group relative flex-1 h-3 flex items-center cursor-pointer">
                  <div className="absolute w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#2dd4bf] rounded-full" 
                        style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                      />
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max={duration || 100} 
                    value={progress}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
              </div>

              <span className="hidden sm:block w-8">{formatTime(duration)}</span>
           </div>
        </div>

        {/* 3. DERECHA (Volumen y Cerrar) */}
        <div className="flex items-center justify-end gap-2 md:gap-3 w-auto md:w-1/4 md:min-w-35">
           
           {/* Volumen: OCULTO EN MOBILE (hidden md:flex) */}
           <div className="hidden md:flex items-center gap-2 group">
              <button onClick={toggleMute} className="text-slate-400 hover:text-slate-700 transition-colors">
                 {getVolumeIcon()}
              </button>
              <div className="w-20 h-1 bg-slate-200 rounded-full relative overflow-hidden">
                 <div 
                    className="h-full bg-slate-400 rounded-full group-hover:bg-[#2dd4bf] transition-colors"
                    style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                 />
                 <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 />
              </div>
           </div>

           <div className="h-6 md:h-8 w-px bg-slate-200 hidden md:block mx-1"></div>

           <button 
             onClick={closePlayer}
             className="p-1.5 md:p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
           >
             <X size={18} className="md:w-5 md:h-5" />
           </button>
        </div>

      </div>
    </div>
  );
};

export default GlobalPlayer;