import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, SkipForward, Upload, AlertCircle } from 'lucide-react';

interface SoundLogoSplashProps {
  onComplete: () => void;
  autoPlayImmediately?: boolean;
  isFirstTime?: boolean;
  key?: string;
}

// Extend global type support
declare global {
  interface Window {
    __soundLogoBlobUrl?: string;
  }
}

export function SoundLogoSplash({ onComplete, autoPlayImmediately = false, isFirstTime = false }: SoundLogoSplashProps) {
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [videoSrc, setVideoSrc] = useState<string>(() => {
    return (window as any).__soundLogoBlobUrl || (isFirstTime ? '/sound-logo-2.mp4' : '/sound-logo.mp4');
  });
  const [loadError, setLoadError] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // If we already have a cached loaded video URL, bypass the lobby button and play it instantly.
    if (autoPlayImmediately || (window as any).__soundLogoBlobUrl) {
      setHasStarted(true);
    }
  }, [autoPlayImmediately]);

  useEffect(() => {
    if (hasStarted && videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn("Autoplay blocked or failed:", err);
      });
    }
  }, [hasStarted, videoSrc]);

  const handleStart = () => {
    setHasStarted(true);
  };

  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onComplete();
  };

  const handleVideoEnded = () => {
    onComplete();
  };

  const handleVideoError = () => {
    console.warn("Could not load video at source:", videoSrc);
    // If our primary path fails, attempt fallback paths before showing upload gate
    if (videoSrc === '/sound-logo-2.mp4') {
      setVideoSrc('./sound-logo-2.mp4');
    } else if (videoSrc === '/sound-logo.mp4') {
      setVideoSrc('./sound-logo.mp4');
    } else if (videoSrc === './sound-logo.mp4') {
      setVideoSrc('/soundlogo.mp4');
    } else {
      setLoadError(true);
    }
  };

  // Drag and Drop handlers for local mp4 file injection
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        const localUrl = URL.createObjectURL(file);
        (window as any).__soundLogoBlobUrl = localUrl;
        setVideoSrc(localUrl);
        setLoadError(false);
        setHasStarted(true);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const localUrl = URL.createObjectURL(file);
      (window as any).__soundLogoBlobUrl = localUrl;
      setVideoSrc(localUrl);
      setLoadError(false);
      setHasStarted(true);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#1C0F35] flex flex-col items-center justify-center overflow-hidden select-none"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* BACKGROUND GRAPHIC DRIFTERS */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#120924] via-[#1C0F35] to-[#2B184A] z-0" />
      
      <motion.div
        animate={{ x: [-50, 50], y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
        className="absolute top-10 left-10 w-[450px] h-44 bg-[#6C3483]/10 rounded-full blur-3xl z-0 pointer-events-none"
      />
      <motion.div
        animate={{ x: [50, -50], y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="absolute bottom-20 right-10 w-[500px] h-48 bg-[#9B59B6]/10 rounded-full blur-3xl z-0 pointer-events-none"
      />

      {/* TOP DECK - SKIP ACTION */}
      {hasStarted && !loadError && (
        <button
          onClick={handleSkip}
          className="absolute top-6 right-6 z-30 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/25 px-4 py-2 rounded-xl text-white font-bold text-xs uppercase tracking-wider backdrop-blur-md cursor-pointer transition-all hover:scale-105 active:scale-95"
        >
          <span>Saltar</span>
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      )}

      {/* RENDER VIEW ACCORDING TO STATE */}
      <AnimatePresence mode="wait">
        {loadError ? (
          // A. FILE MISSING FALLBACK: Gorgeous Drag-and-Drop Loader
          <motion.div
            key="file-missing-loader"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`relative z-20 text-center max-w-lg p-10 bg-[#FAF9F5] border-[6px] rounded-[36px] shadow-2xl flex flex-col items-center mx-4 transition-all duration-300 ${
              isDragging ? 'border-purple-500 bg-purple-50Scale' : 'border-[#472F92]'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-6 text-[#472F92]">
              <Upload className="w-8 h-8 animate-bounce" />
            </div>

            <h2 className="text-2xl font-black text-[#472F92] uppercase mb-2 tracking-tight font-funny">
              Añadir Sound Logo
            </h2>
            <p className="text-slate-600 text-sm font-semibold max-w-sm mb-6 leading-relaxed font-sans">
              No encontramos el archivo de video. Para cargarlo, <strong className="text-purple-700">arrastra y suelta el archivo aquí</strong>, o haz clic en el botón.
            </p>

            <label className="group relative bg-[#472F92] hover:bg-[#5C3DBA] border-[4px] border-[#372370] px-8 py-3.5 rounded-2xl shadow-md text-white font-black font-funny uppercase text-sm tracking-wider cursor-pointer inline-flex items-center gap-2 transform active:scale-95 transition-all">
              <input 
                type="file" 
                accept="video/*" 
                className="hidden" 
                onChange={handleFileSelect}
              />
              <span>Seleccionar video</span>
            </label>

            <button 
              onClick={handleSkip}
              className="mt-6 text-xs text-[#472F92] font-black hover:underline cursor-pointer flex items-center gap-1 opacity-75 font-funny"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Continuar temporalmente sin Sound Logo</span>
            </button>
          </motion.div>

        ) : !hasStarted ? (
          // B. INTRO CO-DESIGNED LANDING GATE (Plays sound on user click due to browser guidelines)
          <motion.div
            key="lobby-splash-gate"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-20 text-center max-w-md p-12 bg-white border-[6px] border-[#ffffff] rounded-[48px] shadow-2xl flex flex-col items-center mx-4"
          >
            {/* Specular layout details */}
            <div className="absolute inset-2 border-2 border-dashed border-[#DFBD7C]/60 rounded-[38px] pointer-events-none" />

            <div className="mb-12 relative z-10 flex justify-center items-center select-none">
              <img 
                src="/Logo%20do%20re%20mi%20lab.svg" 
                alt="Do Re Mi Lab Logo" 
                className="h-28 md:h-32 w-auto object-contain hover:scale-105 transition-transform duration-300 drop-shadow-md"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/logo%20doremi%20lab.png";
                }}
              />
            </div>

            <button
              onClick={handleStart}
              className="group relative w-24 h-24 bg-[#472f92] hover:bg-[#3b2779] border-[5px] border-[#ffffff] active:border-[#edf2f7] rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer overflow-hidden"
              aria-label="Play"
            >
              {/* Specular gloss glow */}
              <div className="absolute top-1 left-2 right-2 h-3 bg-white/25 rounded-full blur-[0.5px]" />
              <Play className="w-10 h-10 fill-white text-white ml-1.5 transform group-hover:scale-110 transition-transform" />
            </button>
          </motion.div>

        ) : (
          // C. THE REAL SOUND LOGO VIDEO RUNNING
          <motion.div
            key="sound-logo-playing-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 w-full h-full flex items-center justify-center p-4 md:p-12"
          >
            <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden border-[8px] border-[#472F92] shadow-2xl bg-black">
              <video
                ref={videoRef}
                src={videoSrc}
                className="w-full h-full object-cover"
                playsInline
                autoPlay
                onEnded={handleVideoEnded}
                onError={handleVideoError}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
