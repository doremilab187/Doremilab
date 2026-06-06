/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Sparkles, Activity, Play, Pause, Music } from 'lucide-react';
import { audioInstance } from '../utils/AudioEngine';
import { AdaggioPuppet } from './AdaggioPuppet';

interface InteractiveTutorialProps {
  onBackToHome: () => void;
}

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({ onBackToHome }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [activeSubAction, setActiveSubAction] = useState<string | null>(null);

  const [isStepAudioPlaying, setIsStepAudioPlaying] = useState<boolean>(false);
  const stepAudioRef = React.useRef<HTMLAudioElement | null>(null);

  const [showStartScreen, setShowStartScreen] = useState<boolean>(true);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [showFinalScreen, setShowFinalScreen] = useState<boolean>(false);

  const toggleStepAudio = (src: string) => {
    try {
      audioInstance.stop();
    } catch (e) {}

    if (isStepAudioPlaying) {
      if (stepAudioRef.current) {
        stepAudioRef.current.pause();
      }
      setIsStepAudioPlaying(false);
    } else {
      if (!stepAudioRef.current || stepAudioRef.current.src !== window.location.origin + src) {
        if (stepAudioRef.current) {
          stepAudioRef.current.pause();
        }
        stepAudioRef.current = new Audio(src);
        stepAudioRef.current.onended = () => {
          setIsStepAudioPlaying(false);
        };
      }
      stepAudioRef.current.play().then(() => {
        setIsStepAudioPlaying(true);
      }).catch(err => {
        console.error("Error playing step audio:", err);
      });
    }
  };

  const tutorialSteps = [
    {
      id: "earth-pulse",
      title: "1. Marcha y Acentuación (Compás 4/4)",
      subtitle: "sonido1.mp3 — Marchar y Acentuar los Fuertes",
      emoji: "👣",
      colorClass: "from-[#FFFDF9] to-[#FFFBF2] border-[#CDA152] text-[#7A5A18]",
      accentBgClass: "bg-[#CDA152]",
      description: "Marchen con paso firme y regular siguiendo el ritmo de la música. Cuando escuchen que el sonido de la marcha se hace más fuerte, acentúen también el paso marcando el golpe con energía (siguiendo el compás de 4/4).",
      visualTip: "Consigna: ¡Mantén una marcha regular al compás y da un golpe enérgico al suelo sincronizado con cada fuerte del ritmo!",
      hasSound: true,
      soundType: "pulse",
      actions: [
        { label: "Probar Latido (BOM!)", type: "bom" }
      ]
    },
    {
      id: "water-pitch",
      title: "2. Reconocimiento de Agudos y Graves",
      subtitle: "sonido2.mp3 — Indica si es Agudo o Grave",
      emoji: "🌈",
      colorClass: "from-[#FAFDFB] to-[#F2FCF9] border-[#31C3AA] text-[#309A87]",
      accentBgClass: "bg-[#31C3AA]",
      description: "Los niños escucharán atentamente la melodía. En una primera escucha, identificarán los sonidos agudos y graves presentes en ella. Luego, en una segunda escucha, representarán la altura de los sonidos con movimientos de sus manos: las levantarán cuando escuchen sonidos agudos y las bajarán cuando escuchen sonidos graves.",
      visualTip: "Consigna: ¡Sintoniza bien tus oídos e indica de inmediato si percibes sonidos agudos o graves!",
      hasSound: true,
      soundType: "pitch",
      actions: [
        { label: "🔊 Sonido Agudo (Cielo ⬆️)", type: "drip-agudo" },
        { label: "🔊 Sonido Grave (Tierra ⬇️)", type: "drip-grave" }
      ]
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

  if (showStartScreen) {
    return (
      <div className="bg-[#FFFDF1] text-[#472F92] rounded-[36px] p-6 md:p-10 border-[4px] border-[#31C3AA] shadow-2xl relative overflow-hidden min-h-[580px] flex flex-col justify-between items-center text-center selection:bg-cyan-100 selection:text-neutral-900">
        {/* Soft floating clouds backgrounds */}
        <div className="absolute top-8 left-[10%] w-48 h-12 bg-white/70 rounded-full blur-md pointer-events-none opacity-60" />
        <div className="absolute top-20 right-[5%] w-60 h-16 bg-white/70 rounded-full blur-md pointer-events-none opacity-60" />
        
        <div className="relative z-10 w-full flex justify-between items-center border-b-2 border-purple-100 pb-4">
          <span className="text-[10px] font-mono uppercase bg-[#31C3AA]/15 border border-[#31C3AA]/30 text-[#309A87] px-3 py-1 rounded-full font-black tracking-widest block font-bold shadow-sm">
            Sesión de Alistamiento
          </span>
          <button 
            onClick={onBackToHome}
            className="px-3.5 py-1.5 rounded-xl border border-purple-200 text-xs text-[#472F92] font-funny font-black uppercase hover:bg-purple-50 active:scale-95 transition-all cursor-pointer"
          >
            Regresar ✕
          </button>
        </div>

        <div className="relative z-10 my-auto flex flex-col items-center gap-6 max-w-lg">
          <div className="relative w-44 h-44 flex items-center justify-center p-2 select-none">
            <div className="scale-75 transform origin-center relative z-10">
              <AdaggioPuppet animationState="saludando" />
            </div>
          </div>

          <div className="space-y-3.5">
            <h2 className="text-3xl font-black font-funny text-[#472F92] uppercase tracking-wide leading-tight">
              Alistamiento de Euritmia
            </h2>
            <p className="text-[#6853a4] text-xs sm:text-sm leading-relaxed font-sans max-w-lg mx-auto font-semibold text-center">
              Bienvenidos a la Guía Interactiva del Facilitador. Antes de iniciar los relatos en Ciudad Bolívar con tus estudiantes, te guiaremos de forma interactiva en la estimulación de los dos movimientos rítmicos clave. Aprenderemos a marcar acentos con la marcha y a discriminar con tus manos las alturas sonoras.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowStartScreen(false)}
          className="relative group w-full max-w-sm bg-[#472F92] hover:bg-[#3c2583] border-[4px] border-[#31C3AA] active:border-[#1F9F8B] px-8 py-4 rounded-[26px] shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-center flex items-center justify-center gap-3 cursor-pointer overflow-hidden select-none text-white"
        >
          <div className="absolute top-0.5 left-2 right-2 h-2.5 bg-white/30 rounded-full blur-[0.5px]" />
          <Play className="w-5 h-5 fill-white text-white animate-pulse" />
          <span className="font-black text-lg font-funny tracking-wider uppercase">
            Comenzar Entrenamiento
          </span>
        </button>
      </div>
    );
  }

  if (isTransitioning) {
    return (
      <div className="bg-[#FFFDF1] text-[#472F92] rounded-[36px] p-6 md:p-10 border-[4px] border-[#BE82ED] shadow-2xl relative overflow-hidden min-h-[580px] flex flex-col justify-between items-center text-center selection:bg-purple-100 selection:text-neutral-900">
        <div className="absolute top-8 left-[10%] w-48 h-12 bg-white/70 rounded-full blur-md pointer-events-none opacity-60" />
        <div className="absolute top-20 right-[5%] w-60 h-16 bg-white/70 rounded-full blur-md pointer-events-none opacity-60" />

        <div className="relative z-10 w-full flex justify-between items-center border-b-2 border-purple-100 pb-4">
          <span className="text-[10px] font-mono uppercase bg-[#BE82ED]/15 border border-[#BE82ED]/30 text-[#965EA5] px-3 py-1 rounded-full font-black tracking-widest block font-bold shadow-sm">
            Siguiente Desafío ➔
          </span>
          <button 
            onClick={onBackToHome}
            className="px-3.5 py-1.5 rounded-xl border border-purple-200 text-xs text-[#472F92] font-funny font-black uppercase hover:bg-purple-50 active:scale-95 transition-all cursor-pointer"
          >
            Salir ✕
          </button>
        </div>

        <div className="relative z-10 my-auto flex flex-col items-center gap-6 max-w-lg">
          <div className="relative w-44 h-44 flex items-center justify-center p-2 select-none">
            <div className="scale-75 transform origin-center relative z-10">
              <AdaggioPuppet animationState="hablando" />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-black font-funny text-[#472F92] uppercase tracking-wide leading-tight">
              ¡Marchaste con gran pulso!
            </h2>
            <p className="text-[#6853a4] text-xs sm:text-sm leading-relaxed font-sans max-w-md mx-auto font-semibold">
              Adaggio está impresionado. Ahora, agudicemos el oído: vamos a aprender a reconocer velocidades acústicas y discriminar entre sonidos <strong>Agudos (Cielo)</strong> y sonidos <strong>Graves (Tierra)</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setCurrentStep(1);
            setIsTransitioning(false);
          }}
          className="relative group w-full max-w-sm bg-[#472F92] hover:bg-[#3c2583] border-[4px] border-[#BE82ED] px-8 py-4 rounded-[26px] shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-center flex items-center justify-center cursor-pointer overflow-hidden select-none text-white"
        >
          <div className="absolute top-0.5 left-2 right-2 h-2.5 bg-white/30 rounded-full blur-[0.5px]" />
          <span className="font-black text-lg font-funny tracking-wider uppercase">
            ¡Siguiente Nivel! ➔
          </span>
        </button>
      </div>
    );
  }

  if (showFinalScreen) {
    return (
      <div className="bg-[#FFFDF1] text-[#472F92] rounded-[36px] p-6 md:p-10 border-[4px] border-[#FFC927] shadow-2xl relative overflow-hidden min-h-[580px] flex flex-col justify-between items-center text-center selection:bg-amber-100 selection:text-neutral-900">
        <div className="absolute top-8 left-[10%] w-48 h-12 bg-white/70 rounded-full blur-md pointer-events-none opacity-60" />
        <div className="absolute top-20 right-[5%] w-60 h-16 bg-white/70 rounded-full blur-md pointer-events-none opacity-60" />

        <div className="relative z-10 w-full flex justify-center pb-2">
          <div className="w-16 h-16 bg-[#FFC927]/10 border border-[#FFC927]/30 rounded-full flex items-center justify-center shadow-md animate-bounce">
            <Sparkles className="w-8 h-8 text-[#FFC927]" />
          </div>
        </div>

        <div className="relative z-10 my-auto flex flex-col items-center gap-6 max-w-lg">
          <div className="relative w-44 h-44 flex items-center justify-center p-2 select-none">
            <div className="scale-75 transform origin-center relative z-10">
              <AdaggioPuppet animationState="celebrando" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-center">
              <span className="text-[10px] bg-emerald-50 border border-emerald-250 text-emerald-600 px-3.5 py-1 rounded-full font-black tracking-widest uppercase block self-center font-bold shadow-sm">
                Entrenamiento Completado
              </span>
            </div>
            <h2 className="text-3xl font-black font-funny text-[#472F92] uppercase tracking-wide leading-tight">
              ¡Excelente, Maestro del Oído!
            </h2>
            <p className="text-[#6853a4] text-xs sm:text-sm leading-relaxed font-sans max-w-md mx-auto font-semibold">
              Has dominado los ejercicios de Euritmia Dalcroze con Adaggio perfectamente. Ahora estás preparado para guiar y motivar el movimiento corporal de tus estudiantes en la historia principal.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3.5 w-full max-w-md mt-4 relative z-10">
          <button
            onClick={() => {
              setShowStartScreen(true);
              setIsTransitioning(false);
              setShowFinalScreen(false);
              setCurrentStep(0);
            }}
            className="flex-1 py-3.5 rounded-2xl bg-white border-[3px] border-[#472F92] text-[#472F92] hover:bg-purple-50 text-xs font-funny font-black uppercase tracking-wide cursor-pointer transition-all active:scale-95 shadow-md"
          >
            Repetir Guía ↺
          </button>
          
          <button
            onClick={onBackToHome}
            className="flex-1 bg-[#472F92] hover:bg-[#3c2583] text-white font-black font-funny text-xs tracking-wider uppercase py-3.5 rounded-2xl transition-all cursor-pointer active:scale-95 shadow-lg border-[3px] border-[#372370]"
          >
            Regresar al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="tutorial-full-sensory-experience" className="bg-[#FFFDF1] text-[#472F92] rounded-[36px] p-6 md:p-8 border-[4px] border-[#31C3AA] shadow-2xl relative overflow-hidden min-h-[580px] flex flex-col justify-between selection:bg-cyan-100 selection:text-neutral-900">
      
      {/* Decorative ambient illustrated soft clouds */}
      <div className="absolute top-8 left-[10%] w-48 h-12 bg-white/70 rounded-full blur-md pointer-events-none opacity-60" />
      <div className="absolute top-20 right-[5%] w-60 h-16 bg-white/70 rounded-full blur-md pointer-events-none opacity-60" />
      <div className="absolute bottom-20 left-10 w-52 h-14 bg-white/50 rounded-full blur-lg pointer-events-none opacity-50" />

      {/* Top bar */}
      <div className="relative z-10 flex flex-wrap justify-between items-center border-b-2 border-purple-100 pb-4 gap-3">
        <div className="flex items-center gap-2.5">
          <button 
            id="back-home-tut-btn"
            onClick={onBackToHome}
            className="p-2.5 rounded-xl bg-[#FCFBEB] border-2 border-purple-100 hover:bg-white hover:text-[#472F92] transition-all text-[#6853a4] group active:scale-95 shadow-sm"
            title="Volver al Menú de Inicio"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          </button>
          <div>
            <span className="text-[10px] font-mono uppercase bg-amber-500/10 border border-amber-500/20 text-[#CDA152] px-2 py-0.5 rounded font-black tracking-widest block w-max font-bold">
              EXPERIENCIA PRÁCTICA
            </span>
            <h2 className="text-xl md:text-2xl font-black font-funny uppercase tracking-wide text-[#472F92]">Guía de Movimiento Dalcroze</h2>
          </div>
        </div>

        {/* Step indicator pills */}
        <div className="flex gap-1.5 bg-[#FAF6FF] p-1.5 rounded-xl border border-purple-100 shadow-sm">
          {tutorialSteps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`w-7 h-7 rounded-full text-xs font-funny font-black flex items-center justify-center transition-all ${
                idx === currentStep 
                  ? 'bg-[#31C3AA] text-white scale-110 shadow-sm' 
                  : 'bg-[#FCFBEB] text-[#472F92] border border-slate-200 hover:bg-white'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Main card panel body */}
      <div className="relative z-10 my-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Visual Interactive Prompt */}
        <div className="lg:col-span-5 flex justify-center">
          <div className={`relative w-64 h-64 md:w-72 md:h-72 rounded-3xl bg-gradient-to-b ${currentData.colorClass} border-[4px] flex flex-col justify-center items-center shadow-xl overflow-hidden p-6`}>
            
            <div className="absolute top-0.5 left-2 right-2 h-2.5 bg-white/45 rounded-full blur-[0.5px]" />
 
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex flex-col items-center justify-center text-center gap-4 relative z-10"
              >
                {/* Responsive Visualizer with cute indicators */}
                <div className="relative w-52 h-44 flex flex-col items-center justify-center select-none overflow-visible">
                  {currentStep === 0 ? (
                    // Step 1: Marcha (Only Footprints)
                    <motion.span 
                      animate={{ 
                        y: [0, -15, 0],
                        rotate: [-8, 8, -8]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 0.8,
                        ease: "easeInOut"
                      }}
                      className="text-8xl drop-shadow-md select-none block filter saturate-[1.2]"
                    >
                      👣
                    </motion.span>
                  ) : (
                    // Step 2: Pitch (Adaggio Puppet)
                    <div className="scale-[0.8] transform origin-center select-none flex items-center justify-center">
                      <AdaggioPuppet animationState="hablando" />
                    </div>
                  )}
                </div>
 
                {/* Foot/Indicator cues */}
                <div className="flex flex-col gap-1 max-w-[200px]">
                  <span className="text-[#6853a4] text-[10.5px] font-bold uppercase tracking-wider font-sans block truncate">
                    {currentData.subtitle}
                  </span>
                  <div className="flex items-center gap-1 justify-center mt-1">
                    <Activity className={`w-4.5 h-4.5 text-emerald-500 ${activeSubAction || isStepAudioPlaying ? 'animate-spin' : ''}`} />
                    <span className="text-xs text-emerald-600 font-extrabold font-mono">
                      {activeSubAction || isStepAudioPlaying ? 'Emitiendo Sonido...' : 'Listo para Sintonizar'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
 
          </div>
        </div>
 
        {/* Right Side: Descriptive Guidelines & Interactive Triggers */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#472F92] leading-tight uppercase font-funny tracking-wide">
              {currentData.title}
            </h3>
            <p className="text-[#6853a4] text-xs sm:text-sm md:text-base leading-relaxed mt-2.5 max-w-xl font-semibold">
              {currentData.description}
            </p>
          </div>

          {/* Tutorial MP3 Player Bar */}
          <div className="bg-[#FCFBEB] border-2 border-purple-100 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border-2 transition-all ${
                isStepAudioPlaying 
                  ? 'bg-[#31C3AA]/15 border-[#31C3AA]/50 text-[#309A87] animate-pulse' 
                  : 'bg-[#FCFBEB] border-purple-100 text-[#6853a4]'
              }`}>
                <Music className={`w-5 h-5 ${isStepAudioPlaying ? 'animate-bounce' : ''}`} />
              </div>
              <div>
                <span className="text-[9px] font-mono text-[#6853a4] uppercase tracking-widest font-black block">Audio Guía del Tramo</span>
                <span className="text-xs font-black text-[#472F92] block mt-0.5 font-mono">
                  {currentStep === 0 ? "sonido1.mp3 (Marcha 4/4)" : "sonido2.mp3 (Agudos/Graves)"}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => toggleStepAudio(currentStep === 0 ? '/tutorial-music/sonido1.mp3' : '/tutorial-music/sonido2.mp3')}
              className={`w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-funny font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md select-none border-b-4 ${
                isStepAudioPlaying
                  ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-700'
                  : 'bg-[#472F92] hover:bg-[#3c2583] text-white border-[#27155a]'
              }`}
            >
              {isStepAudioPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-white stroke-white" />
                  <span>Pausar Música</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white stroke-white animate-pulse" />
                  <span>Sintonizar Música</span>
                </>
              )}
            </button>
          </div>

          {/* Practical Checklist instructions boxes */}
          <div className="bg-[#FFFEEF] border border-amber-200/50 p-4 rounded-2xl flex items-start gap-3 shadow-md relative overflow-hidden">
            <div className="absolute top-0.5 left-2 right-2 h-2.5 bg-white/30 rounded-full blur-[0.5px]" />
            <div className="bg-amber-400/15 text-[#CDA152] p-2 rounded-xl font-mono font-bold leading-none select-none text-base shadow-sm">
              💡
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-amber-600 font-sans tracking-wide">
                Consejo de Aula para el Facilitador
              </p>
              <p className="text-[#6853a4] text-xs font-semibold mt-1 leading-relaxed font-sans">
                {currentData.visualTip}
              </p>
            </div>
          </div>
        </div>
 
      </div>

      {/* Footer controls */}
      <div className="relative z-10 flex justify-between items-center bg-[#FAF6FF] p-3 rounded-2xl border border-purple-100/50 mt-4 shadow-sm">
        
        <button
          onClick={() => {
            audioInstance.stop();
            if (currentStep > 0) {
              setCurrentStep(prev => prev - 1);
            } else {
              onBackToHome();
            }
          }}
          className="px-4 py-2.5 rounded-xl bg-[#FCFBEB] border border-slate-200 hover:bg-white text-slate-505 font-funny text-xs font-black uppercase tracking-wide cursor-pointer transition-colors"
        >
          {currentStep === 0 ? "Salir" : "◀ Anterior"}
        </button>

        <button
          onClick={() => {
            audioInstance.stop();
            if (currentStep < tutorialSteps.length - 1) {
              setIsTransitioning(true);
            } else {
              setShowFinalScreen(true);
            }
          }}
          className="px-5 py-2.5 rounded-xl bg-[#472F92] hover:bg-[#3d2780] border-[3px] border-[#321c6e] text-white font-funny text-[13px] font-black tracking-wide shadow-md transition-all active:scale-95 flex items-center gap-1.5 uppercase cursor-pointer"
        >
          <span>{currentStep === tutorialSteps.length - 1 ? "¡Entendido!" : "Siguiente ▶"}</span>
        </button>

      </div>

    </div>
  );
};
