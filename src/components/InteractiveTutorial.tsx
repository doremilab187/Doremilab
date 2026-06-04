/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Sparkles, Volume2, Activity, Play, Eye, Footprints, Info, Upload, Trash2, Pause, Music } from 'lucide-react';
import { audioInstance } from '../utils/AudioEngine';

interface InteractiveTutorialProps {
  onBackToHome: () => void;
}

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({ onBackToHome }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSoundPlaying, setIsSoundPlaying] = useState<boolean>(false);
  const [activeSubAction, setActiveSubAction] = useState<string | null>(null);

  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [customAudioName, setCustomAudioName] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>("3. Sonido Rítmico de Tu Aula");
  const [customDescription, setCustomDescription] = useState<string>("Sube un archivo de audio personalizado (.mp3, .wav, .m4a) para convertirlo en el tercer tramo de experimentación práctica.");
  const [customConsigna, setCustomConsigna] = useState<string>("¡Escucha con atención y haz que tus alumnos reaccionen corporalmente siguiendo el movimiento de tu sonido subido!");
  const [isCustomPlaying, setIsCustomPlaying] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const customAudioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    if (customAudioRef.current) {
      customAudioRef.current.pause();
      setIsCustomPlaying(false);
    }
    try {
      audioInstance.stop();
    } catch (e) {}
  }, [currentStep]);

  React.useEffect(() => {
    return () => {
      if (customAudioRef.current) {
        customAudioRef.current.pause();
      }
    };
  }, []);

  const handleAudioUpload = (file: File) => {
    if (customAudioRef.current) {
      customAudioRef.current.pause();
      customAudioRef.current = null;
    }
    const url = URL.createObjectURL(file);
    setCustomAudioUrl(url);
    setCustomAudioName(file.name);
    setIsCustomPlaying(false);
  };

  const toggleCustomAudio = () => {
    if (!customAudioUrl) return;
    
    try {
      audioInstance.stop();
    } catch (e) {}

    if (isCustomPlaying) {
      if (customAudioRef.current) {
        customAudioRef.current.pause();
      }
      setIsCustomPlaying(false);
    } else {
      if (!customAudioRef.current) {
        customAudioRef.current = new Audio(customAudioUrl);
        customAudioRef.current.onEnded = () => {
          setIsCustomPlaying(false);
        };
      }
      customAudioRef.current.play().then(() => {
        setIsCustomPlaying(true);
      }).catch(err => {
        console.error("Error playing custom audio:", err);
      });
    }
  };

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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/')) {
        handleAudioUpload(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAudioUpload(e.target.files[0]);
    }
  };

  const tutorialSteps = [
    {
      id: "earth-pulse",
      title: "1. El Pulso de la Tierra (90 BPM)",
      subtitle: "Marcha Constante",
      emoji: "👣",
      colorClass: "from-amber-600/20 to-orange-500/20 text-amber-500 border-amber-500/30",
      accentBgClass: "bg-amber-500",
      description: "Caminen con paso firme y regular. Un paso adelante con cada latido profundo del tambor.",
      visualTip: "Consigna: ¡Siente el ritmo en tus pies y camina como gigantes sembrando semillas!",
      hasSound: true,
      soundType: "pulse",
      actions: [
        { label: "Probar Latido (BOM!)", type: "bom" }
      ]
    },
    {
      id: "water-pitch",
      title: "2. Alturas del Agua",
      subtitle: "Agudo ARRIBA ⬆️ — Grave ABAJO ⬇️",
      emoji: "🧣",
      colorClass: "from-sky-600/20 to-cyan-500/20 text-sky-400 border-sky-500/30",
      accentBgClass: "bg-sky-500",
      description: "Mover los pañuelos azules arriba cuando suenen gotas agudas y abajo cuando suenen gotas graves.",
      visualTip: "Consigna: ¡Los pañuelos suben como vapor al cielo y caen como cascadas al lecho del río!",
      hasSound: true,
      soundType: "pitch",
      actions: [
        { label: "🔊 Sonido Agudo (Cielo ⬆️)", type: "drip-agudo" },
        { label: "🔊 Sonido Grave (Tierra ⬇️)", type: "drip-grave" }
      ]
    },
    {
      id: "custom-exercise",
      title: customTitle,
      subtitle: customAudioName ? `Fichero: ${customAudioName}` : "Arrastra o selecciona un Audio",
      emoji: isCustomPlaying ? "📻" : "🎵",
      colorClass: "from-purple-600/20 to-pink-500/20 text-purple-400 border-purple-500/30",
      accentBgClass: "bg-purple-500",
      description: customDescription,
      visualTip: customConsigna,
      hasSound: !!customAudioUrl,
      soundType: "custom",
      actions: []
    }
  ];

  const handleSoundTest = (type: string) => {
    try {
      audioInstance.stop();
      if (type === 'bom') {
        audioInstance.playBom();
        setActiveSubAction('bom');
        setTimeout(() => setActiveSubAction(null), 850);
      } else if (type === 'drip-agudo') {
        audioInstance.playDrip(true);
        setActiveSubAction('agudo');
        setTimeout(() => setActiveSubAction(null), 500);
      } else if (type === 'drip-grave') {
        audioInstance.playDrip(false);
        setActiveSubAction('grave');
        setTimeout(() => setActiveSubAction(null), 500);
      }
    } catch (e) {
      console.warn("Audio Context init error", e);
    }
  };

  const currentData = tutorialSteps[currentStep];

  return (
    <div id="tutorial-full-sensory-experience" className="bg-neutral-950 text-white rounded-3xl p-6 md:p-8 border border-neutral-800 shadow-2xl relative overflow-hidden min-h-[580px] flex flex-col justify-between">
      
      {/* Decorative ambient glowing grids */}
      <div className="absolute top-[-50px] right-[-50px] w-72 h-72 bg-purple-500/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-50px] w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top bar */}
      <div className="relative z-10 flex flex-wrap justify-between items-center border-b border-neutral-800 pb-4 gap-3">
        <div className="flex items-center gap-2.5">
          <button 
            id="back-home-tut-btn"
            onClick={onBackToHome}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 hover:text-white transition-all text-neutral-400 group active:scale-95"
            title="Volver al Menú de Inicio"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          </button>
          <div>
            <span className="text-[10px] font-mono uppercase bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2 py-0.5 rounded font-black tracking-widest block w-max">
              EXPERIENCIA PRÁCTICA
            </span>
            <h2 className="text-lg md:text-xl font-extrabold tracking-tight">Guía de Movimiento Dalcroze</h2>
          </div>
        </div>

        {/* Step indicator pills */}
        <div className="flex gap-1 bg-neutral-900 p-1.5 rounded-xl border border-neutral-850">
          {tutorialSteps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`w-3.5 h-3.5 rounded-full text-[8px] font-mono font-black flex items-center justify-center transition-all ${
                idx === currentStep 
                  ? 'bg-amber-500 text-neutral-950 scale-110' 
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-750'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Main card panel body */}
      <div className="relative z-10 my-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Visual Interactive Prompt (takes 5 cols) */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-3xl bg-neutral-900 border-2 border-neutral-800 flex flex-col justify-center items-center shadow-xl overflow-hidden p-6">
            
            {/* Animated card elements representation */}
            <div className={`absolute inset-0 bg-gradient-to-b opacity-[0.03] ${
              currentStep === 0 ? 'from-amber-500' :
              currentStep === 1 ? 'from-sky-500' : 'from-purple-500'
            }`} />
 
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex flex-col items-center justify-center text-center gap-4 relative z-10"
              >
                {/* Massive Animated Element Emoji */}
                <span className={`text-8xl leading-none block select-none drop-shadow-md ${
                  activeSubAction || isCustomPlaying ? 'animate-bounce' : 'animate-pulse'
                }`}>
                  {currentData.emoji}
                </span>
 
                {/* Foot/Indicator cues */}
                <div className="flex flex-col gap-1 max-w-[200px]">
                  <span className="text-neutral-400 text-[10px] font-mono uppercase tracking-widest font-black truncate block">
                    {currentData.subtitle}
                  </span>
                  <div className="flex items-center gap-1 justify-center">
                    <Activity className={`w-3 h-3 text-emerald-400 ${activeSubAction || isCustomPlaying ? 'animate-spin' : ''}`} />
                    <span className="text-[11px] text-emerald-400 font-bold font-mono">
                      {activeSubAction || isCustomPlaying ? 'Emitiendo Sonido...' : 'Listo para Sintonizar'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
 
          </div>
        </div>
 
        {/* Right Side: Clean Descriptive Guidelines + Interactive Action Triggers (takes 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          
          {currentStep === 2 ? (
            // CUSTOM STEP 3 BUILDER / CONTROLS WITH FILES SUPPORT
            <div className="flex flex-col gap-5">
              <div>
                <span className="text-[10px] font-mono uppercase bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2.5 py-1 rounded font-black tracking-widest block w-max mb-2 animate-pulse">
                  RECURSO DINÁMICO DE TU PROPIO RITMO
                </span>
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-neutral-400 font-mono font-bold uppercase tracking-wider block">Título del Ejercicio:</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 text-white font-funny text-lg font-black rounded-xl px-3.5 py-2.5 uppercase focus:border-purple-500 focus:outline-none transition-all"
                    placeholder="E.g., 3. Ritmo de las Maracas"
                  />
                </div>
                
                <div className="flex flex-col gap-2 mt-3">
                  <label className="text-xs text-neutral-400 font-mono font-bold uppercase tracking-wider block">Descripción del Movimiento:</label>
                  <textarea
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs rounded-xl px-3.5 py-2.5 focus:border-purple-500 focus:outline-none transition-all resize-none leading-relaxed"
                    placeholder="Sube un audio y describe qué deben hacer los niños con su cuerpo al escucharlo..."
                  />
                </div>
              </div>

              {/* UPLOADER / PLAYER BOX */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all min-h-[178px] ${
                  isDragging 
                    ? 'border-purple-500 bg-purple-500/5' 
                    : customAudioUrl 
                    ? 'border-emerald-500/40 bg-emerald-500/[0.02]' 
                    : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/40'
                }`}
              >
                {customAudioUrl ? (
                  <div className="flex flex-col items-center gap-3.5 w-full">
                    {/* Active Audio State */}
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
                      <Music className={`w-5 h-5 text-emerald-400 ${isCustomPlaying ? 'animate-bounce' : ''}`} />
                    </div>
                    
                    <div className="max-w-[85%]">
                      <p className="text-[10px] text-emerald-400 font-mono select-none uppercase font-black tracking-wider">Archivo de Audio Cargado</p>
                      <h4 className="text-sm font-bold text-white tracking-tight truncate max-w-xs mt-0.5">{customAudioName}</h4>
                    </div>

                    <div className="flex items-center gap-2.5 mt-1.5 w-full max-w-xs">
                      <button
                        onClick={toggleCustomAudio}
                        className={`flex-1 py-3 px-5 rounded-xl font-black font-sans text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          isCustomPlaying 
                            ? 'bg-amber-500 text-neutral-950 hover:bg-amber-400' 
                            : 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400'
                        }`}
                      >
                        {isCustomPlaying ? (
                          <>
                            <Pause className="w-4 h-4 fill-neutral-950 text-neutral-950" />
                            <span>Pausar Ritmo</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-neutral-950 text-neutral-950 animate-pulse" />
                            <span>Producir Audio</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          if (customAudioRef.current) {
                            customAudioRef.current.pause();
                            customAudioRef.current = null;
                          }
                          setCustomAudioUrl(null);
                          setCustomAudioName('');
                          setIsCustomPlaying(false);
                        }}
                        className="p-3 bg-neutral-900 border border-neutral-800 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all text-neutral-400 cursor-pointer rounded-xl"
                        title="Borrar y subir otro audio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-2.5 p-2 w-full">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <div className="w-11 h-11 rounded-full bg-neutral-850 flex items-center justify-center border border-neutral-800">
                      <Upload className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-200">
                        Sube tu audio rítmico personalizado
                      </p>
                      <p className="text-[10px] text-neutral-500 font-mono mt-1">
                        Sólta tu archivo aquí o haz clic para buscarlo (MP3, WAV, M4A)
                      </p>
                    </div>
                  </label>
                )}
              </div>

              {/* Custom Consigna Field */}
              <div className="bg-neutral-900 border border-neutral-850 p-3 rounded-xl flex flex-col gap-1.5">
                <span className="text-[10px] font-mono text-purple-400 font-black uppercase tracking-wider block">
                  Consigna o Frase Pedagógica (Para la clase):
                </span>
                <input
                  type="text"
                  value={customConsigna}
                  onChange={(e) => setCustomConsigna(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-neutral-800 text-neutral-200 text-xs px-1 py-1.5 focus:border-purple-500 focus:outline-none transition-all placeholder-neutral-600 font-medium"
                  placeholder="E.g., ¡Caminen libremente al sonar este sonido y quédense congelados si para!"
                />
              </div>
            </div>
          ) : (
            // STANDARD PRESETS STEPS 1 & 2
            <>
              <div>
                <h3 className="text-2xl font-black text-white leading-tight uppercase font-funny tracking-wide">
                  {currentData.title}
                </h3>
                <p className="text-neutral-300 text-sm md:text-base leading-relaxed mt-2.5 max-w-xl">
                  {currentData.description}
                </p>
              </div>

              {/* Practical Checklist instructions boxes */}
              <div className="bg-neutral-900 border border-neutral-800/80 p-4 rounded-xl flex items-start gap-3">
                <div className="bg-amber-500/15 text-amber-400 p-2 rounded-lg font-mono font-bold leading-none select-none text-xs">
                  💡
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-amber-500 font-mono tracking-wider">
                    Consejo de Aula para el Facilitador
                  </p>
                  <p className="text-neutral-300 text-xs mt-1 leading-relaxed font-sans font-medium">
                    {currentData.visualTip}
                  </p>
                </div>
              </div>

              {/* Tactile interaction button triggers */}
              <div className="flex flex-wrap gap-3">
                {currentData.actions.map((act, index) => {
                  const isSubActive = 
                    (act.type === 'bom' && activeSubAction === 'bom') ||
                    (act.type === 'drip-agudo' && activeSubAction === 'agudo') ||
                    (act.type === 'drip-grave' && activeSubAction === 'grave');

                  return (
                    <button
                      key={index}
                      onClick={() => handleSoundTest(act.type)}
                      className={`px-5 py-3.5 rounded-xl border font-bold text-xs tracking-wider uppercase font-mono flex items-center gap-2 transition-all active:scale-95 ${
                        isSubActive 
                          ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-md shadow-emerald-500/20' 
                          : 'bg-neutral-900 text-white border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <Volume2 className={`w-4 h-4 ${isSubActive ? 'animate-bounce' : ''}`} />
                      <span>{act.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

        </div>

      </div>

      {/* Footer controls */}
      <div className="relative z-10 flex justify-between items-center bg-neutral-900/60 p-3 rounded-2xl border border-neutral-850 mt-4">
        
        <button
          onClick={() => {
            audioInstance.stop();
            if (currentStep > 0) {
              setCurrentStep(prev => prev - 1);
            } else {
              onBackToHome();
            }
          }}
          className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 hover:text-white transition-all text-neutral-400 font-mono text-xs font-bold"
        >
          {currentStep === 0 ? "Salir" : "◀ Anterior"}
        </button>

        <span className="text-[10px] font-mono text-neutral-500 uppercase">
          Método Dalcroze • Ritmo, Cuerpo y Voz
        </span>

        <button
          onClick={() => {
            audioInstance.stop();
            if (currentStep < tutorialSteps.length - 1) {
              setCurrentStep(prev => prev + 1);
            } else {
              onBackToHome();
            }
          }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-funny text-[13px] font-black tracking-wide shadow transition-all active:scale-95 flex items-center gap-1 uppercase"
        >
          <span>{currentStep === tutorialSteps.length - 1 ? "¡Entendido!" : "Siguiente ▶"}</span>
        </button>

      </div>

    </div>
  );
};
