/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Sparkles, Volume2, Activity, Play, Eye, Footprints, Info, Upload, Trash2, Pause, Music, Award, Home, Smile } from 'lucide-react';
import { audioInstance } from '../utils/AudioEngine';
import { AdaggioPuppet } from './AdaggioPuppet';

interface InteractiveTutorialProps {
  onBackToHome: () => void;
}

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({ onBackToHome }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSoundPlaying, setIsSoundPlaying] = useState<boolean>(false);
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
        stepAudioRef.current.onEnded = () => {
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
      colorClass: "from-amber-600/20 to-orange-500/20 text-amber-500 border-amber-500/30",
      accentBgClass: "bg-amber-500",
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
      colorClass: "from-sky-600/20 to-cyan-500/20 text-sky-400 border-sky-500/30",
      accentBgClass: "bg-sky-500",
      description: "Escuchen con total atención la melodía. Los niños deberán reaccionar con su cuerpo: indicando hacia arriba con la mano o pañuelo si el sonido es agudo, o hacia abajo si el sonido es grave.",
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
      <div className="bg-neutral-950 text-white rounded-3xl p-6 md:p-10 border border-neutral-800 shadow-2xl relative overflow-hidden min-h-[580px] flex flex-col justify-between items-center text-center">
        {/* Lights / blobs */}
        <div className="absolute top-[-50px] right-[-50px] w-72 h-72 bg-purple-500/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-[-100px] left-[-50px] w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 w-full flex justify-between items-center border-b border-neutral-800 pb-4">
          <span className="text-[10px] font-mono uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded font-black tracking-widest block">
            Sesión de Alistamiento
          </span>
          <button 
            onClick={onBackToHome}
            className="text-xs text-neutral-400 hover:text-white transition-colors"
          >
            Regresar ✖
          </button>
        </div>

        <div className="relative z-10 my-auto flex flex-col items-center gap-6 max-w-lg">
          <div className="relative w-44 h-44 bg-neutral-900 border-2 border-[#CDA152]/40 rounded-full flex items-center justify-center p-2 shadow-2xl overflow-hidden group">
            {/* Glossy sheen */}
            <div className="absolute top-1 left-2 right-2 h-2.5 bg-white/20 rounded-full blur-[1px]" />
            <div className="scale-75 transform origin-center">
              <AdaggioPuppet animationState="saludando" />
            </div>
          </div>

          <div className="space-y-3.5">
            <h2 className="text-3xl font-black font-funny text-white uppercase tracking-wide leading-tight">
              ¡Hola Guardián del Ritmo! 👋
            </h2>
            <p className="text-neutral-300 text-sm md:text-base leading-relaxed font-sans max-w-md mx-auto">
              Te damos la bienvenida al rincón sensorial. Aquí entrenaremos juntos el oído y el cuerpo para sintonizarnos con la marcha musical y distinguir las alturas graves y agudas.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowStartScreen(false)}
          className="relative group w-full max-w-sm bg-gradient-to-r from-[#A3F1E3] to-[#46E4CF] hover:from-[#B4F7EC] hover:to-[#57EBD5] border-[4px] border-[#31C3AA] active:border-[#1F9F8B] px-8 py-4 rounded-[26px] shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-center flex items-center justify-center gap-3 cursor-pointer overflow-hidden select-none"
        >
          <div className="absolute top-0.5 left-2 right-2 h-2.5 bg-white/40 rounded-full blur-[0.5px]" />
          <Play className="w-5 h-5 fill-[#472F92] text-[#472F92] animate-pulse" />
          <span className="font-black text-lg text-[#472F92] font-funny tracking-wider uppercase">
            Comenzar Entrenamiento
          </span>
        </button>
      </div>
    );
  }

  if (isTransitioning) {
    return (
      <div className="bg-neutral-950 text-white rounded-3xl p-6 md:p-10 border border-neutral-800 shadow-2xl relative overflow-hidden min-h-[580px] flex flex-col justify-between items-center text-center">
        <div className="absolute top-[-50px] right-[-50px] w-72 h-72 bg-purple-500/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-[-100px] left-[-50px] w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full flex justify-between items-center border-b border-neutral-800 pb-4">
          <span className="text-[10px] font-mono uppercase bg-sky-500/10 border border-sky-500/20 text-sky-400 px-2.5 py-0.5 rounded font-black tracking-widest block">
            Siguiente Desafío ➔
          </span>
          <button 
            onClick={onBackToHome}
            className="text-xs text-neutral-400 hover:text-white transition-colors"
          >
            Salir ✖
          </button>
        </div>

        <div className="relative z-10 my-auto flex flex-col items-center gap-6 max-w-lg">
          <div className="relative w-44 h-44 bg-neutral-900 border-2 border-sky-500/40 rounded-full flex items-center justify-center p-2 shadow-2xl overflow-hidden">
            <div className="absolute top-1 left-2 right-2 h-2.5 bg-white/20 rounded-full blur-[1px]" />
            <div className="scale-75 transform origin-center">
              <AdaggioPuppet animationState="hablando" />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black font-funny text-white uppercase tracking-wide">
              ¡Marchaste con gran pulso! 👣
            </h2>
            <p className="text-neutral-300 text-sm md:text-base leading-relaxed font-sans max-w-md mx-auto">
              Adaggio está impresionado. Ahora, agudicemos el oído: vamos a aprender a reconocer velocidades acústicas y discriminar entre sonidos <strong>Agudos (Cielo)</strong> y sonidos <strong>Graves (Tierra)</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setCurrentStep(1);
            setIsTransitioning(false);
          }}
          className="relative group w-full max-w-sm bg-gradient-to-r from-[#E9CEFC] to-[#D598FB] hover:from-[#F0D9FF] hover:to-[#DEA7FE] border-[4px] border-[#BE82ED] active:border-[#A467D4] px-8 py-4 rounded-[26px] shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-center flex items-center justify-center gap-3 cursor-pointer overflow-hidden select-none"
        >
          <div className="absolute top-0.5 left-2 right-2 h-2.5 bg-white/40 rounded-full blur-[0.5px]" />
          <span className="font-black text-lg text-[#472F92] font-funny tracking-wider uppercase">
            ¡Siguiente Nivel! ➔
          </span>
        </button>
      </div>
    );
  }

  if (showFinalScreen) {
    return (
      <div className="bg-neutral-950 text-white rounded-3xl p-6 md:p-10 border border-neutral-800 shadow-2xl relative overflow-hidden min-h-[580px] flex flex-col justify-between items-center text-center">
        <div className="absolute top-[-50px] right-[-50px] w-72 h-72 bg-purple-500/15 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-[-100px] left-[-50px] w-96 h-96 bg-amber-500/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full flex justify-center pb-2">
          <div className="w-16 h-16 bg-amber-400/10 border border-amber-400/30 rounded-full flex items-center justify-center text-4xl shadow-md animate-bounce">
            🏆
          </div>
        </div>

        <div className="relative z-10 my-auto flex flex-col items-center gap-6 max-w-lg">
          <div className="relative w-44 h-44 bg-neutral-900 border-2 border-emerald-500/40 rounded-full flex items-center justify-center p-2 shadow-2xl overflow-hidden">
            <div className="absolute top-1 left-2 right-2 h-2.5 bg-white/20 rounded-full blur-[1px]" />
            <div className="scale-75 transform origin-center">
              <AdaggioPuppet animationState="celebrando" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-center">
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 px-3 py-1 rounded-full font-black tracking-widest uppercase block self-center">
                Entrenamiento Completado
              </span>
            </div>
            <h2 className="text-3xl font-black font-funny text-white uppercase tracking-wide leading-tight">
              ¡Felicidades, Maestro del Oído! 🎉
            </h2>
            <p className="text-neutral-300 text-sm md:text-base leading-relaxed font-sans max-w-md mx-auto">
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
            className="flex-1 py-3.5 rounded-2xl border border-neutral-805 hover:bg-neutral-900 text-neutral-300 font-bold font-sans text-xs uppercase transition-all cursor-pointer active:scale-95"
          >
            Repetir Tutorial ↺
          </button>
          
          <button
            onClick={onBackToHome}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-black font-funny text-xs tracking-wider uppercase py-3.5 rounded-2xl transition-all cursor-pointer active:scale-95 shadow-lg shadow-emerald-500/10"
          >
            Regresar al Inicio 🏠
          </button>
        </div>
      </div>
    );
  }

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
              currentStep === 0 ? 'from-amber-500' : 'from-sky-500'
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
                  activeSubAction || isStepAudioPlaying ? 'animate-bounce' : 'animate-pulse'
                }`}>
                  {currentData.emoji}
                </span>
 
                {/* Foot/Indicator cues */}
                <div className="flex flex-col gap-1 max-w-[200px]">
                  <span className="text-neutral-400 text-[10px] font-mono uppercase tracking-widest font-black truncate block">
                    {currentData.subtitle}
                  </span>
                  <div className="flex items-center gap-1 justify-center">
                    <Activity className={`w-3 h-3 text-emerald-400 ${activeSubAction || isStepAudioPlaying ? 'animate-spin' : ''}`} />
                    <span className="text-[11px] text-emerald-400 font-bold font-mono">
                      {activeSubAction || isStepAudioPlaying ? 'Emitiendo Sonido...' : 'Listo para Sintonizar'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
 
          </div>
        </div>
 
        {/* Right Side: Clean Descriptive Guidelines + Interactive Action Triggers (takes 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          <div>
            <h3 className="text-2xl font-black text-white leading-tight uppercase font-funny tracking-wide">
              {currentData.title}
            </h3>
            <p className="text-neutral-300 text-sm md:text-base leading-relaxed mt-2.5 max-w-xl">
              {currentData.description}
            </p>
          </div>

          {/* Tutorial MP3 Player Bar */}
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all ${
                isStepAudioPlaying 
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 animate-pulse' 
                  : 'bg-neutral-850 border-neutral-800 text-neutral-400'
              }`}>
                <Music className={`w-5 h-5 ${isStepAudioPlaying ? 'animate-bounce' : ''}`} />
              </div>
              <div>
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest font-black block">Audio Guía del Tramo</span>
                <span className="text-xs font-black text-white block mt-0.5 font-mono">
                  {currentStep === 0 ? "sonido1.mp3 (Marcha 4/4)" : "sonido2.mp3 (Agudos/Graves)"}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => toggleStepAudio(currentStep === 0 ? '/tutorial-music/sonido1.mp3' : '/tutorial-music/sonido2.mp3')}
              className={`w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
                isStepAudioPlaying
                  ? 'bg-amber-500 text-neutral-950 hover:bg-amber-400'
                  : 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400'
              }`}
            >
              {isStepAudioPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-neutral-950 text-neutral-950" />
                  <span>Pausar Música</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-neutral-950 text-neutral-950 animate-pulse" />
                  <span>Reproducir Música</span>
                </>
              )}
            </button>
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
          <div className="flex flex-col gap-2.5">
            <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest font-black">
              Sonidos Sintéticos de Prueba:
            </span>
            <div className="flex flex-wrap gap-2.5">
              {currentData.actions.map((act, index) => {
                const isSubActive = 
                  (act.type === 'bom' && activeSubAction === 'bom') ||
                  (act.type === 'drip-agudo' && activeSubAction === 'agudo') ||
                  (act.type === 'drip-grave' && activeSubAction === 'grave');

                return (
                  <button
                    key={index}
                    onClick={() => handleSoundTest(act.type)}
                    className={`px-4 py-2.5 rounded-lg border font-bold text-xs tracking-wider uppercase font-mono flex items-center gap-2 transition-all active:scale-95 cursor-pointer ${
                      isSubActive 
                        ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-md shadow-emerald-500/20' 
                        : 'bg-neutral-900 text-neutral-300 border-neutral-850 hover:bg-neutral-800 hover:border-neutral-750'
                    }`}
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isSubActive ? 'animate-bounce' : ''}`} />
                    <span>{act.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
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
              setIsTransitioning(true);
            } else {
              setShowFinalScreen(true);
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
