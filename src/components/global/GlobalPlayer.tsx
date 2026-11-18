import { X, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Volume1 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';

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
    <div className="global-player-safe-bottom fixed left-2 right-2 md:w-187.5 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-500 ease-out">
        
      <div className="bg-[#0b3039] border border-cyan-100/15 shadow-2xl shadow-black/30 rounded-2xl p-2 md:p-3.5 flex items-center justify-between gap-2 md:gap-4 text-cyan-50">
        
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
           <div className="w-10 h-10 md:w-12 md:h-12 bg-linear-to-br from-cyan-400 to-teal-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
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
              <h4 className="font-semibold text-white truncate text-xs md:text-sm leading-tight">{activeTrack.title}</h4>
              <p className="text-[10px] text-cyan-100/55 truncate font-medium uppercase tracking-wider">{activeTrack.author}</p>
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
                 className={`transition-colors ${!hasPrev ? 'text-cyan-100/20 cursor-not-allowed' : 'text-cyan-100/60 hover:text-white'}`}
              >
                 <SkipBack size={16} className="md:w-4.5 md:h-4.5" />
              </button>
              
              <button 
                onClick={togglePlay}
                 className="w-8 h-8 md:w-9 md:h-9 bg-white rounded-full flex items-center justify-center text-cyan-950 hover:scale-105 hover:bg-cyan-50 transition-all shadow-md active:scale-95"
              >
                {isPlaying ? <Pause size={14} fill="white" className="md:w-4 md:h-4" /> : <Play size={14} fill="white" className="ml-0.5 md:w-4 md:h-4" />}
              </button>
              
              <button 
                onClick={playNext}
                disabled={!hasNext}
                 className={`transition-colors ${!hasNext ? 'text-cyan-100/20 cursor-not-allowed' : 'text-cyan-100/60 hover:text-white'}`}
              >
                 <SkipForward size={16} className="md:w-4.5 md:h-4.5" />
              </button>
           </div>
           
           {/* Barra de Progreso */}
            <div className="w-full flex items-center gap-2 text-[10px] text-cyan-100/45 font-bold font-mono">
              {/* Ocultamos los números en móvil para ganar espacio */}
              <span className="hidden sm:block w-8 text-right">{formatTime(progress)}</span>
              
              <div className="group relative flex-1 h-3 flex items-center cursor-pointer">
                   <div className="absolute w-full h-1 bg-white/15 rounded-full overflow-hidden">
                      <div 
                         className="h-full bg-cyan-300 rounded-full"
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
               <button onClick={toggleMute} className="text-cyan-100/55 hover:text-white transition-colors">
                 {getVolumeIcon()}
              </button>
               <div className="w-20 h-1 bg-white/15 rounded-full relative overflow-hidden">
                 <div 
                     className="h-full bg-cyan-100/55 rounded-full group-hover:bg-cyan-300 transition-colors"
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

            <div className="h-6 md:h-8 w-px bg-white/10 hidden md:block mx-1"></div>

           <button 
             onClick={closePlayer}
              className="p-1.5 md:p-2 text-cyan-100/45 hover:text-rose-300 hover:bg-rose-400/10 rounded-xl transition-all"
           >
             <X size={18} className="md:w-5 md:h-5" />
           </button>
        </div>

      </div>
    </div>
  );
};

export default GlobalPlayer;
