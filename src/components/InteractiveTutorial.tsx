/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Sparkles, Volume2, Activity, Play, Eye, Footprints, Info } from 'lucide-react';
import { audioInstance } from '../utils/AudioEngine';

interface InteractiveTutorialProps {
  onBackToHome: () => void;
}

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({ onBackToHome }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSoundPlaying, setIsSoundPlaying] = useState<boolean>(false);
  const [activeSubAction, setActiveSubAction] = useState<string | null>(null);

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
      id: "wind-dynamics",
      title: "3. Dinámicas del Viento",
      subtitle: "Forte (Abierto ⭕) — Piano (Cerrado •)",
      emoji: "🌬️",
      colorClass: "from-neutral-200/5 to-slate-400/20 text-slate-300 border-slate-500/30",
      accentBgClass: "bg-slate-300",
      description: "Abran los brazos ampliamente cuando la música sea fuerte, e inmovilícenlos frente al pecho cuando sea suave.",
      visualTip: "Consigna: ¡Crezcan y disminuyan su cuerpo como ráfagas de viento!",
      hasSound: true,
      soundType: "wind",
      actions: [
        { label: "🔊 Sonar Brisa Suave", type: "wind" }
      ]
    },
    {
      id: "thunder-stealth",
      title: "4. El Sigilo del Trueno",
      subtitle: "Marchar de puntillas 👣 ➔ ¡CONGELADO! 🛑",
      emoji: "⚡",
      colorClass: "from-purple-600/20 to-indigo-500/20 text-purple-400 border-purple-500/30",
      accentBgClass: "bg-purple-500",
      description: "Caminen despacio de puntillas en silencio rítmico. Al sonar el estruendo seco del rayo, quédense inmóviles como estatuas.",
      visualTip: "Consigna: ¡Congelados como rocas hasta que vuelva el silencio de puntitas!",
      hasSound: true,
      soundType: "lightning",
      actions: [
        { label: "⚡ ¡Lanzar Trueno Sorpresa!", type: "lightning" }
      ]
    },
    {
      id: "sun-accents",
      title: "5. Acentos del Sol",
      subtitle: "Marchar 1-2-3 ➔ ¡Gran Salto en 4! ☀️",
      emoji: "☀️",
      colorClass: "from-yellow-500/20 to-amber-400/20 text-yellow-400 border-yellow-400/30",
      accentBgClass: "bg-yellow-400",
      description: "Sigan la marcha alzando las rodillas con los bastones. En el cuarto pulso den un salto de luz enérgico con los brazos en alto.",
      visualTip: "Consigna: ¡Coordinen un compás alegre para encender tótems de luz solar!",
      hasSound: true,
      soundType: "accent",
      actions: [
        { label: "🔊 Probar Marcha Solar", type: "solar" }
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
      } else if (type === 'lightning') {
        audioInstance.playLightning();
        setActiveSubAction('lightning');
        setTimeout(() => setActiveSubAction(null), 1500);
      } else if (type === 'wind') {
        audioInstance.playWindGust(3.0);
        setActiveSubAction('wind');
        setTimeout(() => {
          setActiveSubAction(null), 3000;
        }, 3000);
      } else if (type === 'solar') {
        audioInstance.playSolarChime(true);
        setActiveSubAction('solar');
        setTimeout(() => setActiveSubAction(null), 850);
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
              currentStep === 1 ? 'from-sky-500' :
              currentStep === 2 ? 'from-slate-400' :
              currentStep === 3 ? 'from-purple-500' : 'from-yellow-400'
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
                  activeSubAction ? 'animate-bounce' : 'animate-pulse'
                }`}>
                  {currentData.emoji}
                </span>

                {/* Foot/Indicator cues */}
                <div className="flex flex-col gap-1">
                  <span className="text-neutral-400 text-[10px] font-mono uppercase tracking-widest font-black">
                    {currentData.subtitle}
                  </span>
                  <div className="flex items-center gap-1 justify-center">
                    <Activity className={`w-3 h-3 text-emerald-400 ${activeSubAction ? 'animate-spin' : ''}`} />
                    <span className="text-[11px] text-emerald-400 font-bold font-mono">
                      {activeSubAction ? 'Emitiendo Sonido...' : 'Listo para Sintonizar'}
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
            <h3 className="text-2xl font-black text-white leading-tight uppercase font-sans tracking-tight">
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
                (act.type === 'drip-grave' && activeSubAction === 'grave') ||
                (act.type === 'lightning' && activeSubAction === 'lightning') ||
                (act.type === 'wind' && activeSubAction === 'wind') ||
                (act.type === 'solar' && activeSubAction === 'solar');

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
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-sans text-xs font-black tracking-wide shadow transition-all active:scale-95 flex items-center gap-1 uppercase"
        >
          <span>{currentStep === tutorialSteps.length - 1 ? "¡Entendido!" : "Siguiente ▶"}</span>
        </button>

      </div>

    </div>
  );
};
