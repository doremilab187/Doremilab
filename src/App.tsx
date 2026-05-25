/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, MapPin, Sparkles, CheckCircle, WifiOff, Users, Music, HelpCircle, FileText, ClipboardList } from 'lucide-react';
import { StoryPlayer } from './components/StoryPlayer';
import { FacilitatorCompanion } from './components/FacilitatorCompanion';
import { SessionEvaluation } from './types';

export default function App() {
  const [activeEvaluations, setActiveEvaluations] = useState<SessionEvaluation[] | undefined>(undefined);
  const [sessionCompletedCount, setSessionCompletedCount] = useState<number>(0);
  
  // Quick pre-session checklist state
  const [setupChecklist, setSetupChecklist] = useState({
    spaceCleared: false,
    audioChecked: false,
    scarvesReady: false,
    sticksReady: false,
  });

  const handleSessionComplete = (evaluations: SessionEvaluation[]) => {
    setActiveEvaluations(evaluations);
    setSessionCompletedCount(prev => prev + 1);
    // Auto-scroll down to the facilitator companion tab
    const element = document.getElementById('facilitator-tactical-companion');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleCheck = (key: keyof typeof setupChecklist) => {
    setSetupChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecksPassed = Object.values(setupChecklist).every(v => v === true);

  return (
    <div id="dalcroze-app-root" className="min-h-screen bg-[#121110] text-[#EFECE8] font-sans antialiased pb-20 selection:bg-amber-500 selection:text-neutral-900">
      
      {/* GLORIOUS POLISHED HEADER WITH LOCALIZATION BACKGROUND */}
      <header className="relative border-b border-neutral-800 bg-[#161514] overflow-hidden py-8 px-4 md:px-8">
        {/* Abstract glowing solar light representing Totem Sol */}
        <div className="absolute top-[-100px] left-[35%] w-96 h-96 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-[-150px] right-[5%] w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          
          {/* Logo Title and Ciudad Bolívar Reference */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-500 rounded text-[10px] uppercase font-mono tracking-wider font-extrabold border border-amber-500/35">
                Euritmia Dalcroze
              </span>
              <div className="flex items-center gap-1 text-[10.5px] text-cyan-400 font-mono font-medium">
                <MapPin className="w-3.5 h-3.5" />
                <span>Bogotá - Fundación Monte Tabor</span>
              </div>
            </div>

            <h1 className="text-2xl md:text-3.5xl font-extrabold font-sans tracking-tight text-white leading-tight">
              Audiovisual Interactivo Dalcroze
            </h1>
            <p className="text-xs md:text-sm text-neutral-400 font-sans mt-1 max-w-xl leading-relaxed">
              Plataforma de facilitación rítmica y simulación musical para niños de 7-12 años en contextos de vulnerabilidad socioeconómica. Diseñada para educadores sin formación musical previa.
            </p>
          </div>

          {/* Offline Ready Flag & Validation references */}
          <div className="flex flex-col gap-2 items-end">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 flex items-center gap-2.5 shadow-md">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-emerald-400 font-bold block leading-none">
                  SINTETIZADOR OFFLINE
                </span>
                <span className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider block mt-0.5">
                  Reproducible sin internet
                </span>
              </div>
            </div>

            <span className="text-[10px] text-gray-500 italic font-mono">
              Soporte: 10-15 niños por sesión
            </span>
          </div>

        </div>
      </header>

      {/* CORE INTEGRATED COMPONENT BODY */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8 grid grid-cols-1 gap-8">
        
        {/* PRE-SESSION CLASSROOM CHECKLIST CARDS */}
        <section id="presession-verification-drawer" className="bg-[#181716] border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <ClipboardList className="text-amber-500 w-5 h-5" />
                <h2 className="text-sm font-bold tracking-wide uppercase font-mono text-gray-200">
                  Lista de Verificación Escénica (Paso Obligatorio)
                </h2>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Completa estos pasos físicos en el salón de la fundación antes de encender la simulación del audiovisual:
              </p>
            </div>
            
            {allChecksPassed ? (
              <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-xs font-bold font-mono animate-bounce flex items-center gap-1.5 shadow-md">
                <CheckCircle className="w-3.5 h-3.5" />
                ¡AULA LISTA PARA MOVERSE!
              </span>
            ) : (
              <span className="px-3 py-1 bg-amber-950/40 text-amber-500 border border-amber-900/40 rounded text-xs font-bold font-mono">
                Paso temporal pendiente
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Checkbox 1 */}
            <div
              onClick={() => toggleCheck('spaceCleared')}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 select-none ${
                setupChecklist.spaceCleared
                  ? 'bg-emerald-950/10 border-emerald-600/60 text-emerald-400 shadow-inner'
                  : 'bg-neutral-950 hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-gray-400'
              }`}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center font-bold font-mono text-xs ${
                setupChecklist.spaceCleared ? 'bg-emerald-600 border-emerald-500 text-neutral-950' : 'border-neutral-700'
              }`}>
                {setupChecklist.spaceCleared ? '✓' : ''}
              </div>
              <div>
                <strong className="text-xs block text-neutral-200">Espacio de 3x3 Despejado</strong>
                <span className="text-[10px] text-gray-400 leading-tight block mt-0.5">Retirar sillas y pupitres</span>
              </div>
            </div>

            {/* Checkbox 2 */}
            <div
              onClick={() => toggleCheck('audioChecked')}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 select-none ${
                setupChecklist.audioChecked
                  ? 'bg-emerald-950/10 border-emerald-600/60 text-emerald-400 shadow-inner'
                  : 'bg-neutral-950 hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-gray-400'
              }`}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center font-bold font-mono text-xs ${
                setupChecklist.audioChecked ? 'bg-emerald-600 border-emerald-500 text-neutral-950' : 'border-neutral-700'
              }`}>
                {setupChecklist.audioChecked ? '✓' : ''}
              </div>
              <div>
                <strong className="text-xs block text-neutral-200">Volumen y Bocinas</strong>
                <span className="text-[10px] text-gray-400 leading-tight block mt-0.5">Altavoces fuertes para el salón</span>
              </div>
            </div>

            {/* Checkbox 3 */}
            <div
              onClick={() => toggleCheck('scarvesReady')}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 select-none ${
                setupChecklist.scarvesReady
                  ? 'bg-emerald-950/10 border-emerald-600/60 text-emerald-400 shadow-inner'
                  : 'bg-neutral-950 hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-gray-400'
              }`}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center font-bold font-mono text-xs ${
                setupChecklist.scarvesReady ? 'bg-emerald-600 border-emerald-500 text-neutral-950' : 'border-neutral-700'
              }`}>
                {setupChecklist.scarvesReady ? '✓' : ''}
              </div>
              <div>
                <strong className="text-xs block text-neutral-200">15 Pañuelos Listos</strong>
                <span className="text-[10px] text-gray-400 leading-tight block mt-0.5">Telas azules (Material Agua)</span>
              </div>
            </div>

            {/* Checkbox 4 */}
            <div
              onClick={() => toggleCheck('sticksReady')}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 select-none ${
                setupChecklist.sticksReady
                  ? 'bg-emerald-950/10 border-emerald-600/60 text-emerald-400 shadow-inner'
                  : 'bg-neutral-950 hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-gray-400'
              }`}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center font-bold font-mono text-xs ${
                setupChecklist.sticksReady ? 'bg-emerald-600 border-emerald-500 text-neutral-950' : 'border-neutral-700'
              }`}>
                {setupChecklist.sticksReady ? '✓' : ''}
              </div>
              <div>
                <strong className="text-xs block text-neutral-200">15 Bastones Alineados</strong>
                <span className="text-[10px] text-gray-400 leading-tight block mt-0.5">Palos ligeros (Material Sol)</span>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE MEDIA PLATFORM */}
        <section id="storyplayer-interactive-section">
          <StoryPlayer onSessionComplete={handleSessionComplete} />
        </section>

        {/* COMPANION BOX AND SOUND SANDBOX */}
        <section id="facilitator-tactical-companion">
          <FacilitatorCompanion lastEvaluations={activeEvaluations} />
        </section>

        {/* METHODOLOGY VALIDATION FOOTER */}
        <footer className="mt-8 border-t border-neutral-800 pt-6 text-center text-xs text-gray-500 max-w-2xl mx-auto leading-relaxed font-sans">
          <p>
            Este audiovisual interactivo es el resultado consolidado del Sprint de Diseño para la **Fundación Monte Tabor** de Ciudad Bolívar, Bogotá, Colombia, en mayo de 2026. Al usar el movimiento corporal como vehículo y canal directo de aprendizaje musical, adaptamos el Método Dalcroze para promover la inclusión rítmica y el juego consciente libre en niños expuestos a factores socioeconómicos vulnerables.
          </p>
          <p className="mt-2.5 font-mono text-[10.5px] uppercase tracking-widest text-[#6B8E23] font-bold">
            Paz • Ritmo • Comunidad
          </p>
        </footer>

      </main>

    </div>
  );
}
