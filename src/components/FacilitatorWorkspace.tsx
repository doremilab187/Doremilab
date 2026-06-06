/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Volume2, Eye, Compass, Sparkles } from 'lucide-react';
import { AdaggioPuppet } from './AdaggioPuppet';
import { audioInstance } from '../utils/AudioEngine';

interface FacilitatorWorkspaceProps {
  lastEvaluations?: any[];
  onSceneSelected?: (blockId: number) => void;
  onStartSession?: () => void;
}

export const FacilitatorWorkspace: React.FC<FacilitatorWorkspaceProps> = ({ 
  onSceneSelected, 
  onStartSession 
}) => {
  const [puppetState, setPuppetState] = useState<string>('saludando');

  const handlePuppetStateChange = (state: string) => {
    setPuppetState(state);
    
    // Play satisfying sound feedback when selecting states
    try {
      if (state === 'marchando') {
        audioInstance.playWoodblockStep();
        setTimeout(() => audioInstance.playWoodblockStep(), 150);
        setTimeout(() => audioInstance.playWoodblockStep(), 300);
      } else if (state === 'hablando') {
        audioInstance.playDrip(true);
        setTimeout(() => audioInstance.playDrip(false), 180);
      } else if (state === 'celebrando') {
        audioInstance.playDrip(true);
        setTimeout(() => audioInstance.playDrip(true), 120);
        setTimeout(() => audioInstance.playDrip(true), 240);
      } else {
        audioInstance.playBom();
      }
    } catch (_) {}
  };

  const playTestSound = (type: 'bom' | 'agudo' | 'grave') => {
    try {
      if (type === 'bom') {
        audioInstance.playBom();
      } else if (type === 'agudo') {
        audioInstance.playDrip(true);
      } else {
        audioInstance.playDrip(false);
      }
    } catch (_) {}
  };

  return (
    <div className="bg-[#FFFDF4] p-4 sm:p-6 md:p-8 rounded-3xl max-w-4xl mx-auto border-4 border-[#CBA86B]/30 select-none shadow-xl">
      
      {/* Visual Top Header of the manual */}
      <div className="relative rounded-2xl overflow-hidden mb-6 border-2 border-dashed border-[#BE82ED]/30 bg-[#FFFEEB] p-4 sm:p-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-funny font-black text-[#472F92] uppercase tracking-wide">
          Instrucciones para el profesor
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* INTERACTIVE ADAGGIO CAP (Left side: 5 cols) */}
        <div className="md:col-span-5 flex flex-col items-center justify-between bg-white border-[3px] border-[#BE82ED]/40 rounded-3xl p-5 shadow-sm">
          <div className="text-center w-full">
            <span className="bg-[#BE82ED]/15 text-[#8534C0] text-2xl font-funny font-black uppercase tracking-wider px-5 py-2.5 rounded-2xl shadow-sm inline-block">
              Adaggio
            </span>
          </div>

          {/* Centered Adaggio Frame with custom background */}
          <div className="relative w-full h-76 flex items-center justify-center bg-gradient-to-b from-purple-50/40 to-yellow-50/20 rounded-2xl overflow-hidden my-4">
            <div className="scale-[1.25] xs:scale-[1.3] transform origin-center flex items-center justify-center">
              <AdaggioPuppet animationState={puppetState} />
            </div>
          </div>

          {/* Quick simulation buttons to preview Adaggio (Corrected state bindings) */}
          <div className="w-full">
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'saludando', label: '👋 Saludar', color: 'hover:bg-amber-50 hover:text-amber-600 border-amber-200' },
                { id: 'hablando', label: '🗣️ Explicar', color: 'hover:bg-blue-50 hover:text-blue-600 border-blue-200' },
                { id: 'celebrando', label: '🎉 Celebrar', color: 'hover:bg-purple-50 hover:text-purple-600 border-purple-200' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => handlePuppetStateChange(btn.id)}
                  className={`py-2 px-1 text-[10px] font-black uppercase font-funny border-[2px] rounded-xl cursor-pointer transition-all active:scale-95 text-center ${
                    puppetState === btn.id 
                      ? 'bg-[#472F92] border-[#2E1A69] text-white shadow-md' 
                      : 'bg-slate-50 text-slate-700 ' + btn.color
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BASIC CHEATSHEET (Right side: 7 cols) */}
        <div className="md:col-span-7 flex flex-col justify-between gap-4">
          
          {/* Quick Banner Image of the App */}
          <div className="relative h-28 rounded-2xl overflow-hidden border-2 border-[#BE82ED]/25 group">
            <img 
              src="/Portada/Portada.png" 
              alt="Portada de Aventura Adaggio" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/75 via-neutral-900/20 to-transparent flex items-end p-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[#472F92]/90 px-2 py-0.5 rounded-md">
                Aventura Adaggio
              </span>
            </div>
          </div>

          {/* Section: Simple Lesson Play */}
          <div className="bg-[#FCFBEB]/50 border-2 border-amber-200/80 rounded-2xl p-4">
            <h2 className="text-xs font-black text-[#472F92] uppercase tracking-wider mb-2">
              ¿Cómo jugar el Método Dalcroze?
            </h2>
            <p className="text-[11px] font-semibold text-slate-700 leading-snug">
              Propón a los niños escuchar la música y que asignen movimientos libres del cuerpo a cada concepto musical: la altura (agudos o graves), la dinámica (sonidos fuertes e intensos o suaves y delicados), la velocidad o tempo (movimientos rápidos o lentos) y el silencio (pausa corporal).
            </p>
          </div>

          {/* Section: Validation via Observation */}
          <div className="bg-white border-2 border-purple-200/80 rounded-2xl p-4">
            <h2 className="text-xs font-black text-[#5C3DBA] uppercase tracking-wider mb-2">
              ¿Cómo validarlo con observación rápida?
            </h2>
            <div className="space-y-1.5 text-[10px] sm:text-[11px] font-bold text-slate-600">
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="text-emerald-500 text-xs">✔</span>
                <span><strong>Reacción:</strong> ¿Cambian su postura rápido al oír un cambio de sonido?</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="text-emerald-500 text-xs">✔</span>
                <span><strong>Dinámica y Tempo:</strong> ¿Diferencian corporalmente la velocidad (rápido/lento) y la intensidad (fuerte/suave)?</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="text-emerald-500 text-xs">✔</span>
                <span><strong>Expresión:</strong> ¿Muestran disfrute y se expresan libremente siguiendo las narraciones de Adaggio?</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* SPEAKER TEST BANNER */}
      <div className="mt-5 p-3.5 bg-[#FCFBEB] border-2 border-amber-200/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-amber-500" />
          <span className="text-[11px] font-black uppercase text-slate-700">Probar Audio del Aula</span>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-end w-full sm:w-auto">
          <button 
            onClick={() => playTestSound('bom')}
            className="flex-1 sm:flex-initial px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-[9px] rounded-lg uppercase border-b-2 border-amber-650 cursor-pointer active:scale-95 transition-all text-center"
          >
            🥁 Tambor (BOM)
          </button>
          <button 
            onClick={() => playTestSound('agudo')}
            className="flex-1 sm:flex-initial px-3 py-1.5 bg-blue-400 hover:bg-blue-300 text-white font-black text-[9px] rounded-lg uppercase border-b-2 border-blue-650 cursor-pointer active:scale-95 transition-all text-center"
          >
            🌊 Agudo
          </button>
          <button 
            onClick={() => playTestSound('grave')}
            className="flex-1 sm:flex-initial px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-[9px] rounded-lg uppercase border-b-2 border-amber-850 cursor-pointer active:scale-95 transition-all text-center"
          >
            ⛰️ Grave
          </button>
        </div>
      </div>

      {/* FINAL ACTION / LAUNCHER BUTTONS */}
      <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h3 className="font-funny font-black text-[#472F92] text-xs sm:text-sm uppercase tracking-wide">
            Entrar al Juego
          </h3>
          <p className="text-[10px] text-slate-500">¿Listos? Lanza la aventura interactiva completa o salta a una escena.</p>
        </div>

        <button
          onClick={onStartSession}
          className="w-full sm:w-auto px-6 py-3.5 bg-[#472F92] hover:bg-[#341b7e] border-2 border-[#200d5a] text-white font-funny text-sm font-black tracking-widest shadow-lg rounded-2xl cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 uppercase"
        >
          <Play className="w-4 h-4 fill-white" />
          ¡Comenzar Paseo de Aventura!
        </button>
      </div>

      {/* QUICK QUICK ESCENAS LINKS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-2">
        {[
          { id: 1, title: 'La Calma' },
          { id: 2, title: 'Tierra / Siembra' },
          { id: 3, title: 'Análisis de Agua' },
          { id: 4, title: 'Viento / Soplo' },
          { id: 5, title: 'Truenos Rápidos' },
          { id: 6, title: 'Pausa Estatua' },
          { id: 7, title: 'Fuego Marcha' },
          { id: 8, title: 'La Despedida' },
        ].map((sc) => (
          <button
            key={sc.id}
            onClick={() => onSceneSelected && onSceneSelected(sc.id)}
            className="bg-white hover:bg-slate-50 border border-slate-200 py-2 px-2 rounded-xl text-[10px] font-black text-slate-650 cursor-pointer transition-all active:scale-95 uppercase font-funny tracking-tight truncate shadow-sm hover:border-[#BE82ED]/60 flex items-center justify-center gap-1"
          >
            <span className="text-[9px] text-[#8534C0] font-mono">#{sc.id}</span>
            <span>{sc.title}</span>
          </button>
        ))}
      </div>

    </div>
  );
};
