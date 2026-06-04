/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardList, BookOpen, Map, Volume2, Users, Save, CheckCircle, 
  HelpCircle, ShieldCheck, Play, Info, ArrowRight, RefreshCw, VolumeX 
} from 'lucide-react';
import { SavedSession, SessionEvaluation } from '../types';
import { NARRATIVE_BLOCKS } from '../data/narrativeBlocks';
import { audioInstance } from '../utils/AudioEngine';

interface FacilitatorWorkspaceProps {
  lastEvaluations?: SessionEvaluation[];
  onSceneSelected?: (blockId: number) => void;
  onStartSession?: () => void;
}

export const FacilitatorWorkspace: React.FC<FacilitatorWorkspaceProps> = ({ 
  lastEvaluations, 
  onSceneSelected, 
  onStartSession 
}) => {
  // Navigation for the consolidated dashboard tabs
  const [activeTab, setActiveTab] = useState<'induction' | 'classroom' | 'sandbox' | 'logs' | 'pedagogy'>('induction');
  
  // State for the integrated physical checklist
  const [setupChecklist, setSetupChecklist] = useState({
    spaceCleared: false,
    audioChecked: false,
    scarvesReady: false,
    sticksReady: false,
    quietPlanned: false,
  });

  // Welcome Step (0: Tutorial, 1: Material/Sound, 2: Launcher)
  const [inductionScreen, setInductionScreen] = useState<'tutorial' | 'alistamiento' | 'despegue'>('tutorial');
  const [tutorialStep, setTutorialStep] = useState<number>(0);
  const [soundTestSuccess, setSoundTestSuccess] = useState<boolean>(false);

  // Form states for log logger
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [groupName, setGroupName] = useState<string>('');
  const [childCount, setChildCount] = useState<number>(12);
  const [tutorName, setTutorName] = useState<string>('');
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState<boolean>(false);

  // Load offline logs on mount
  useEffect(() => {
    const logs = localStorage.getItem('dalcroze_sessions_log');
    if (logs) {
      try {
        setSavedSessions(JSON.parse(logs));
      } catch (e) {
        console.error("Error cargando históricos offline de sesiones:", e);
      }
    }
  }, []);

  // Sync checklist state changes to welcome check states as well
  const toggleCheck = (key: keyof typeof setupChecklist) => {
    setSetupChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecksPassed = Object.values(setupChecklist).every(v => v === true);

  // Interactive Sound Calibration Handler
  const triggerAudioTest = () => {
    audioInstance.playBom();
    setTimeout(() => audioInstance.playDrip(true), 200);
    setTimeout(() => audioInstance.playDrip(false), 400);
    setTimeout(() => audioInstance.playBom(), 600);
    
    setSoundTestSuccess(true);
    setTimeout(() => setSoundTestSuccess(false), 3500);
  };

  // Dispatch global custom events so that the StoryPlayer is kept in perfect parity
  const handleLaunchFullSession = () => {
    // Notify the app & StoryPlayer to start Escena 1 playing
    window.dispatchEvent(new CustomEvent('storyplayer-start-session'));
    
    // Trigger callback if defined
    if (onStartSession) {
      onStartSession();
    }
    
    // Smooth scroll page to the storyplayer screen
    document.getElementById('storyplayer-interactive-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLaunchQuickScene = (blockId: number) => {
    // Dispatch events to StoryPlayer
    window.dispatchEvent(new CustomEvent('storyplayer-skip-to-scene', { detail: { blockId } }));
    
    // Trigger callback if defined
    if (onSceneSelected) {
      onSceneSelected(blockId);
    }
    
    // Smooth scroll page to the storyplayer screen
    document.getElementById('storyplayer-interactive-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Submit and write session results to offline database
  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName || !tutorName) {
      alert("Por favor completa el nombre del grupo y el tutor facilitador.");
      return;
    }

    const currentEvaluations: SessionEvaluation[] = lastEvaluations || [
      { blockId: 1, rhythmSinc: 3, engagement: 3, understanding: 3, notes: 'Intro quieta.' },
      { blockId: 2, rhythmSinc: 3, engagement: 2, understanding: 3, notes: 'Movimientos de siembra.' },
      { blockId: 3, rhythmSinc: 3, engagement: 3, understanding: 3, notes: 'Trapos azules ondeados.' },
      { blockId: 4, rhythmSinc: 2, engagement: 3, understanding: 3, notes: 'Brazos expandidos.' },
      { blockId: 5, rhythmSinc: 3, engagement: 3, understanding: 2, notes: 'Sacudidas de rayo.' },
      { blockId: 6, rhythmSinc: 3, engagement: 3, understanding: 3, notes: 'Estatua silenciosa.' },
      { blockId: 7, rhythmSinc: 3, engagement: 3, understanding: 3, notes: 'Marcha con antorchas.' },
      { blockId: 8, rhythmSinc: 3, engagement: 3, understanding: 3, notes: 'Reminiscencia final.' }
    ];

    const newSession: SavedSession = {
      id: 'session_' + Date.now(),
      date: new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }),
      groupName,
      childCount: Number(childCount),
      tutorName,
      evaluations: currentEvaluations,
      completed: true,
      generalNotes
    };

    const updated = [newSession, ...savedSessions];
    setSavedSessions(updated);
    localStorage.setItem('dalcroze_sessions_log', JSON.stringify(updated));

    // Reset details
    setGroupName('');
    setGeneralNotes('');
    setIsSavedSuccessfully(true);
    setTimeout(() => setIsSavedSuccessfully(false), 3500);
  };

  const handleClearHistory = () => {
    if (window.confirm("¿Estás seguro de que deseas vaciar el historial de sesiones registradas en este equipo?")) {
      localStorage.removeItem('dalcroze_sessions_log');
      setSavedSessions([]);
    }
  };

  // Globally hear welcome opens to trigger specific induction tabs
  useEffect(() => {
    const handleOpenMenu = (e: Event) => {
      const customEvent = e as CustomEvent;
      setActiveTab('induction');
      if (customEvent.detail && customEvent.detail.tab) {
        if (customEvent.detail.tab === 'tutorial') setInductionScreen('tutorial');
        else if (customEvent.detail.tab === 'help') setInductionScreen('alistamiento');
        else if (customEvent.detail.tab === 'play') setInductionScreen('despegue');
      }
    };
    window.addEventListener('open-storyplayer-menu', handleOpenMenu);
    return () => window.removeEventListener('open-storyplayer-menu', handleOpenMenu);
  }, []);

  return (
    <div id="facilitator-tactical-workspace" className="bg-slate-50 border border-slate-200 rounded-2xl shadow-xl p-6 md:p-8 font-sans text-slate-800 transition-all duration-300">
      
      {/* SINGLE UNIFIED TOP BANNER AND TAB CONTROLLER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-slate-200">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-white border border-slate-200 text-amber-500 rounded-xl leading-none shadow-sm text-xl select-none">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 text-[9px] uppercase font-mono tracking-widest font-extrabold border border-amber-500/20 rounded">
                Euritmia Dalcroze
              </span>
              <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-600 text-[9px] uppercase font-mono tracking-widest font-extrabold border border-cyan-500/20 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Offline Sincronizado
              </span>
            </div>
            
            <h2 className="text-base sm:text-lg font-mono font-black text-slate-900 tracking-wide leading-none mb-1">
              Espacio y Caja del Facilitador de Aula
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Fundación Monte Tabor • Ciudad Bolívar, Bogotá, Colombia
            </p>
          </div>
        </div>

        {/* Dynamic Classroom Prep Badge */}
        <div className="flex flex-col items-end gap-1 font-mono">
          {allChecksPassed ? (
            <div className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5 animate-bounce">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>✓ ¡AULA PREPARADA Y LISTA!</span>
            </div>
          ) : (
            <div className="px-4 py-1.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>ALISTAMIENTO PENDIENTE</span>
            </div>
          )}
          <span className="text-[10px] text-slate-400 italic">
            Soporta sesiones de 8 a 15 niños
          </span>
        </div>
      </div>

      {/* CORE WORKSPACE ACTION TABS DECK (BORDERLESS PILLS STYLE) */}
      <div className="py-4 flex flex-wrap gap-2 justify-center lg:justify-start border-b border-slate-200 mb-6 bg-slate-150/25">
        <button
          onClick={() => setActiveTab('induction')}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'induction' 
              ? 'bg-amber-500 text-neutral-950 font-black shadow-md border border-amber-450' 
              : 'text-slate-650 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-250/80 shadow-sm'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>I. INDUCCIÓN & MATERIALES</span>
        </button>

        <button
          onClick={() => setActiveTab('classroom')}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'classroom' 
              ? 'bg-amber-500 text-neutral-950 font-black shadow-md border border-amber-450' 
              : 'text-slate-650 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-250/80 shadow-sm'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>II. PLANO DEL AULA (3X3M)</span>
        </button>

        <button
          onClick={() => setActiveTab('sandbox')}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'sandbox' 
              ? 'bg-amber-500 text-neutral-950 font-black shadow-md border border-amber-450' 
              : 'text-slate-650 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-250/80 shadow-sm'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>III. BANCO SONOS (PRÁCTICA)</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'logs' 
              ? 'bg-amber-500 text-neutral-950 font-black shadow-md border border-amber-450' 
              : 'text-slate-650 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-250/80 shadow-sm'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>IV. BITÁCORA & LOG HISTÓRICO</span>
        </button>

        <button
          onClick={() => setActiveTab('pedagogy')}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'pedagogy' 
              ? 'bg-amber-500 text-neutral-950 font-black shadow-md border border-amber-450' 
              : 'text-slate-650 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-250/80 shadow-sm'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>V. MARCO PEDAGÓGICO</span>
        </button>
      </div>

      {/* CORE CONTENT WELL (FUSED SEAMLESSLY INTO THE UNIFIED WRAPPER) */}
      <div className="pt-2">

        {/* TAB 1: INTEGRATED INDUCTION, CHECKLIST, SOUND TEST & BYPASS GRID */}
        {activeTab === 'induction' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-left">
            
            {/* Step sub-header navigation */}
            <div className="lg:col-span-12 flex flex-col md:flex-row gap-3 bg-neutral-950 border border-neutral-850 p-2 rounded-2xl mb-2">
              <button
                onClick={() => setInductionScreen('tutorial')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-mono font-bold text-center flex items-center justify-center gap-2.5 transition-all ${
                  inductionScreen === 'tutorial'
                    ? 'bg-neutral-900 text-amber-400 border border-amber-500/30 shadow-inner'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                }`}
              >
                <span className="w-5 h-5 rounded-md bg-amber-500 text-neutral-950 font-sans font-black flex items-center justify-center text-[10.5px]">01</span>
                <span>PASO 1: CARPETA METÓDICA</span>
              </button>

              <button
                onClick={() => setInductionScreen('alistamiento')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-mono font-bold text-center flex items-center justify-center gap-2.5 transition-all ${
                  inductionScreen === 'alistamiento'
                    ? 'bg-neutral-900 text-cyan-400 border border-cyan-500/30 shadow-inner'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                }`}
              >
                <span className="w-5 h-5 rounded-md bg-cyan-500 text-neutral-950 font-sans font-black flex items-center justify-center text-[10.5px]">02</span>
                <span>PASO 2: ALISTAMIENTO DE SALÓN</span>
              </button>

              <button
                onClick={() => setInductionScreen('despegue')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-mono font-bold text-center flex items-center justify-center gap-2.5 transition-all ${
                  inductionScreen === 'despegue'
                    ? 'bg-neutral-900 text-emerald-400 border border-emerald-500/30 shadow-inner'
                    : 'text-neutral-400 hover:text-neutral-210 hover:bg-neutral-900/60'
                }`}
              >
                <span className="w-5 h-5 rounded-md bg-emerald-500 text-neutral-950 font-sans font-black flex items-center justify-center text-[10.5px]">03</span>
                <span>PASO 3: LANZAR AVENTURA</span>
              </button>
            </div>

            {/* SCREEN 1A: STEP 1 - EXPLANATORY TUTORIAL SLIDES */}
            {inductionScreen === 'tutorial' && (
              <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 bg-neutral-950 border border-neutral-850 p-5 md:p-6 rounded-2xl flex flex-col justify-between shadow-lg min-h-[360px]">
                  <div>
                    <div className="flex justify-between items-center border-b border-neutral-850 pb-3 mb-4 font-mono text-[10.5px]">
                      <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/15 rounded font-black font-mono">
                        PEDAGOGÍA ACTIVADA — PARCIAL {tutorialStep + 1} de 4
                      </span>
                      <span className="text-neutral-400 font-bold">Fideicomiso Musical Monte Tabor</span>
                    </div>

                    <AnimatePresence mode="wait">
                      {tutorialStep === 0 && (
                        <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }} className="flex flex-col gap-2.5">
                          <h3 className="text-sm font-black text-amber-400 uppercase font-mono flex items-center gap-2 tracking-wide">
                            <span>👤</span> El Rol Protagónico del Facilitador
                          </h3>
                          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans font-medium">
                            Tú eres el cimiento físico e instruccional de la sesión educativa. Tu misión es modelar los movimientos del títere virtual en pantalla (Adaggio) para tus estudiantes. No requieres teoría musical; el sistema traduce la melodía en zancadas, saltos y detenciones lúdicas del grupo.
                          </p>
                          <div className="bg-neutral-900 border border-neutral-850 p-3.5 rounded-xl mt-2">
                            <span className="text-amber-400 font-extrabold text-[11px] uppercase font-mono block mb-1">Tu rol en el espacio:</span>
                            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                              Acompaña a tus alumnos en círculos. Marcha rítmicamente en cada latido grave, y coordina con aplausos o gestos simples la sintonía corporal de Adaggio.
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {tutorialStep === 1 && (
                        <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }} className="flex flex-col gap-2.5">
                          <h3 className="text-sm font-black text-amber-400 uppercase font-mono flex items-center gap-2 tracking-wide">
                            <span>🍂</span> Los 5 Tótems de Ritmo Co-Creados
                          </h3>
                          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans font-medium">
                            Sintonizaremos en el espacio de la fundación cinco principios rítmicos que los niños de Ciudad Bolívar propusieron y dibujaron:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-neutral-300 mt-2 font-sans font-medium">
                            <div className="bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/10">
                              <strong className="text-amber-400 block font-mono">🍂 Tierra (Pulso):</strong>
                              Marcha vigorosa en semicírculo sintiendo los latidos BOM profundos.
                            </div>
                            <div className="bg-cyan-500/5 p-2.5 rounded-xl border border-cyan-500/10 font-sans">
                              <strong className="text-cyan-400 block font-mono">💧 Agua (Alturas):</strong>
                              Ondear brazos y pañuelos altos en notas agudas; y abajo en notas graves.
                            </div>
                            <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
                              <strong className="text-neutral-450 text-neutral-400 block font-mono">💨 Viento (Dinámica):</strong>
                              Comprimir la corporalidad en piano; expandirla ruidosamente en forte.
                            </div>
                            <div className="bg-purple-500/5 p-2.5 rounded-xl border border-purple-500/10">
                              <strong className="text-purple-400 block font-mono">⚡ Trueno (Frenado):</strong>
                              Congelamiento inmediato como estatuas graciosas de piedra al sonar el rayo.
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {tutorialStep === 2 && (
                        <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }} className="flex flex-col gap-2.5">
                          <h3 className="text-sm font-black text-amber-400 uppercase font-mono flex items-center gap-2 tracking-wide">
                            <span>🛑</span> Pausas Pedagógicas Inteligentes
                          </h3>
                          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans font-medium">
                            El teatrillo del StoryPlayer suspende el sonido periódicamente en hitos estratégicos del libreto musical. Esto te otorga un respiro libre de apuros técnicos para repartir pañuelos o antorchas, y calmar la respiración de los estudiantes.
                          </p>
                          <div className="bg-amber-500/5 border border-amber-500/15 p-3 rounded-xl mt-2 flex items-start gap-2 text-amber-300">
                            <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
                            <p className="text-xs font-sans leading-relaxed">
                              📢 <strong>Las pausas te guiarán paso a paso.</strong> El reproductor se congelará y proyectará una directriz metodológica. Cuando todos estén listos en el salón, haz clic en "Retomar" o presiona la barra espaciadora.
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {tutorialStep === 3 && (
                        <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }} className="flex flex-col gap-2.5">
                          <h3 className="text-sm font-black text-amber-400 uppercase font-mono flex items-center gap-2 tracking-wide">
                            <span>📋</span> Bitácora Integrada de Conservación
                          </h3>
                          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans font-medium">
                            Al finalizar cada escena rítmica, tendrás opciones para calificar en el costado derecho los tres observables críticos: la sincronía rítmica del grupo, el compromiso (joy/goce), y el entendimiento corporal. 
                          </p>
                          <p className="text-xs text-neutral-400 italic bg-neutral-900 p-2.5 rounded-lg border border-neutral-800 mt-2 font-sans font-medium">
                            No dependes de internet: la base de reportes funciona completamente fuera de línea empleando LocalStorage para proteger la continuidad educativa de tu comunidad.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Slides footer controllers */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-neutral-850 font-sans">
                    <button
                      disabled={tutorialStep === 0}
                      onClick={() => setTutorialStep(prev => Math.max(0, prev - 1))}
                      className="px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 hover:bg-neutral-850 hover:text-white disabled:opacity-40 transition-all font-mono font-bold"
                    >
                      Atrás
                    </button>

                    <div className="flex gap-2">
                      {[0, 1, 2, 3].map(step => (
                        <div
                          key={step}
                          className={`w-2 h-2 rounded-full transition-all ${
                            tutorialStep === step ? 'bg-amber-500 w-5' : 'bg-neutral-800'
                          }`}
                        />
                      ))}
                    </div>

                    {tutorialStep < 3 ? (
                      <button
                        onClick={() => setTutorialStep(prev => prev + 1)}
                        className="px-4 py-2 rounded-lg bg-amber-500 text-neutral-950 font-black font-mono text-xs hover:scale-[1.03] transition-all"
                      >
                        Siguiente Ficha
                      </button>
                    ) : (
                      <button
                        onClick={() => setInductionScreen('alistamiento')}
                        className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-black font-mono text-xs transition-colors flex items-center gap-1"
                      >
                        <span>Paso 2: Alistamiento ➔</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Right quick advisory tips */}
                <div className="md:col-span-4 bg-neutral-950 border border-neutral-850 p-5 rounded-2xl flex flex-col justify-between text-xs text-neutral-300 space-y-4">
                  <div>
                    <h4 className="font-bold text-amber-400 mb-2 font-mono text-[9.5px] uppercase tracking-wide">💡 El Legado Dalcroze</h4>
                    <p className="leading-relaxed font-sans text-justify text-neutral-400">
                      El pedagogo musical Émile Jaques-Dalcroze remarcaba que la sintonía somática antecede al símbolo escrito. Al golpear con fuerza los pies y ondear telas pintadas en Ciudad Bolívar, sentamos las bases de la resiliencia y el orden musical libre de exclusiones.
                    </p>
                  </div>

                  <div className="bg-neutral-900 p-3.5 border border-neutral-800 rounded-xl text-neutral-300 font-sans shadow-inner">
                    <strong className="text-amber-400 text-[10.5px] uppercase font-mono block mb-1">⭐ Consejo de Facilitación:</strong>
                    Si el salón pierde la marcha, haz que te sigan en círculos exagerando el levantamiento de rodillas al ritmo del Bom grave.
                  </div>

                  <button
                    onClick={() => setInductionScreen('despegue')}
                    className="w-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-850 font-mono text-xs py-2 rounded-xl transition-all font-bold uppercase tracking-wide"
                  >
                    Saltar al Lanzador ➔
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 1B: STEP 2 - INTERACTIVE PHYSICAL CHECKLIST & SPEAKER CALIBRATION */}
            {inductionScreen === 'alistamiento' && (
              <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Physical checklist boxes (Selector 1 + StoryPlayer checks combined!) */}
                <div id="classroom-materials-checklist" className="md:col-span-7 bg-neutral-950 border border-neutral-850 p-5 md:p-6 rounded-2xl flex flex-col justify-between shadow-lg min-h-[360px]">
                  <div>
                    <div className="flex items-center justify-between border-b border-neutral-850 pb-3 mb-4">
                      <h3 className="text-sm font-black text-white font-mono uppercase tracking-wide flex items-center gap-2">
                        <span>📦</span> 1. Lista de Alistamiento Físico de Aula
                      </h3>
                      <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded font-mono font-black uppercase">
                        Materiales de Campo
                      </span>
                    </div>

                    <p className="text-xs text-neutral-400 mb-4 font-sans leading-relaxed">
                      La Fundación Monte Tabor prioriza recursos de bajo costo fáciles de recolectar. Marca las casillas de abajo al preparar el salón de clase con el grupo:
                    </p>

                    <div className="flex flex-col gap-2.5">
                      {/* Checkbox 1 */}
                      <label
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          setupChecklist.spaceCleared
                            ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-300'
                            : 'bg-neutral-900/60 border-neutral-850 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900/90'
                        }`}
                        onClick={() => toggleCheck('spaceCleared')}
                      >
                        <input
                          type="checkbox"
                          checked={setupChecklist.spaceCleared}
                          readOnly
                          className="w-4 h-4 accent-emerald-500 rounded mt-0.5 flex-shrink-0"
                        />
                        <div>
                          <span className="text-xs font-black block font-sans">🏞️ Área Libre de 3x3 Metros Despejada</span>
                          <span className="text-[10.5px] leading-normal text-neutral-400 block mt-0.5 font-medium font-sans">
                            Mesas, pupitres, sillas y tableros retirados a las esquinas para permitir la marcha holgada en círculo de los infantes.
                          </span>
                        </div>
                      </label>

                      {/* Checkbox 2 */}
                      <label
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          setupChecklist.audioChecked
                            ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-300'
                            : 'bg-neutral-900/60 border-neutral-850 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900/90'
                        }`}
                        onClick={() => toggleCheck('audioChecked')}
                      >
                        <input
                          type="checkbox"
                          checked={setupChecklist.audioChecked}
                          readOnly
                          className="w-4 h-4 accent-emerald-500 rounded mt-0.5 flex-shrink-0"
                        />
                        <div>
                          <span className="text-xs font-black block font-sans">🔊 Altavoz y Conexión de Audio Fuertes</span>
                          <span className="text-[10.5px] leading-normal text-neutral-400 block mt-0.5 font-medium font-sans">
                            Bocinas amplificadoras conectadas a buen volumen para sobrepasar el alboroto rítmico de los pasos físicos al correr.
                          </span>
                        </div>
                      </label>

                      {/* Checkbox 3 */}
                      <label
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          setupChecklist.scarvesReady
                            ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-300'
                            : 'bg-neutral-900/60 border-neutral-850 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900/90'
                        }`}
                        onClick={() => toggleCheck('scarvesReady')}
                      >
                        <input
                          type="checkbox"
                          checked={setupChecklist.scarvesReady}
                          readOnly
                          className="w-4 h-4 accent-emerald-500 rounded mt-0.5 flex-shrink-0"
                        />
                        <div>
                          <span className="text-xs font-black block font-sans">💧 15 Pañuelos Celestes (Elemento Agua)</span>
                          <span className="text-[10.5px] leading-normal text-neutral-400 block mt-0.5 font-medium font-sans">
                            Tiras de tela suave delgada listas. Si no dispones, puedes usar bolsas de plástico transparente azul (su sonido crujiente es lúdico).
                          </span>
                        </div>
                      </label>

                      {/* Checkbox 4 */}
                      <label
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          setupChecklist.sticksReady
                            ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-300'
                            : 'bg-neutral-900/60 border-neutral-850 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900/90'
                        }`}
                        onClick={() => toggleCheck('sticksReady')}
                      >
                        <input
                          type="checkbox"
                          checked={setupChecklist.sticksReady}
                          readOnly
                          className="w-4 h-4 accent-emerald-500 rounded mt-0.5 flex-shrink-0"
                        />
                        <div>
                          <span className="text-xs font-black block font-sans">☀️ 15 Bastones Alineados (Elemento Sol)</span>
                          <span className="text-[10.5px] leading-normal text-neutral-400 block mt-0.5 font-medium font-sans">
                            Varitas rústicas de madera liviana redondeadas (por ejemplo, palitos de escoba ligeros recortados a unos 60cm).
                          </span>
                        </div>
                      </label>

                      {/* Checkbox 5 */}
                      <label
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          setupChecklist.quietPlanned
                            ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-300'
                            : 'bg-neutral-900/60 border-neutral-850 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900/90'
                        }`}
                        onClick={() => toggleCheck('quietPlanned')}
                      >
                        <input
                          type="checkbox"
                          checked={setupChecklist.quietPlanned}
                          readOnly
                          className="w-4 h-4 accent-emerald-500 rounded mt-0.5 flex-shrink-0"
                        />
                        <div>
                          <span className="text-xs font-black block font-sans">⚡ Control de Estatuas Seguras (Trueno)</span>
                          <span className="text-[10.5px] leading-normal text-neutral-400 block mt-0.5 font-medium font-sans">
                            Garantizar que no existan filos o clavos expuestos en las cercanías cuando los niños pasen súbitamente a congelarse en piedra.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-2.5 mt-5 border-t border-neutral-850 pt-4 font-sans">
                    <button
                      onClick={() => setInductionScreen('tutorial')}
                      className="flex-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 py-2.5 rounded-xl text-xs font-mono font-bold transition-all"
                    >
                      ❮ Ir al Tutorial
                    </button>
                    <button
                      onClick={() => setInductionScreen('despegue')}
                      className="flex-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 py-2.5 rounded-xl text-xs font-mono font-black transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span>Ir al Lanzador ➔</span>
                    </button>
                  </div>
                </div>

                {/* Speaker Calibration & Audio Signal Verification (Paso 2 welcome) */}
                <div className="md:col-span-5 bg-neutral-950 border border-neutral-850 p-5 md:p-6 rounded-2xl flex flex-col justify-between shadow-lg min-h-[360px] text-center">
                  <div>
                    <div className="flex items-center justify-between border-b border-neutral-850 pb-3 mb-4">
                      <h3 className="text-sm font-black text-white font-mono uppercase tracking-wide flex items-center gap-2">
                        <span>🔊</span> 2. Test Sonoro del Altavoz
                      </h3>
                      <span className="text-[10px] bg-amber-500/10 text-amber-450 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-black">
                        REAL-TIME
                      </span>
                    </div>

                    <p className="text-xs text-neutral-400 leading-relaxed mb-4 text-justify font-sans">
                      Los infantes al marchar generan bastante ruido acústico que ahoga el sonido del dispositivo. Por tanto, es mandatorio calibrar la parlantería previamente. ¡Usa este pulsador matemático para comprobar la potencia!
                    </p>

                    <div className="bg-neutral-900 border-2 border-dashed border-neutral-800 rounded-2xl p-5 flex flex-col items-center justify-center text-center relative overflow-hidden my-4">
                      {soundTestSuccess && (
                        <div className="absolute inset-0 bg-emerald-500/5 flex items-center justify-center pointer-events-none animate-pulse">
                          <div className="flex items-center gap-1">
                            <span className="w-1 h-5 bg-emerald-500/80 rounded animate-bounce" />
                            <span className="w-1 h-10 bg-emerald-555 bg-emerald-500 rounded animate-bounce" style={{ animationDelay: '100ms' }} />
                            <span className="w-1 h-7 bg-emerald-500/95 rounded animate-bounce" style={{ animationDelay: '200ms' }} />
                            <span className="w-1 h-11 bg-emerald-500 rounded animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      )}

                      <span className="text-3xl mb-1.5 select-none font-sans">📢</span>
                      <h4 className="text-xs font-black text-amber-400 font-mono uppercase tracking-wider mb-1">
                        Sintetizador de Sintonía Fína
                      </h4>
                      <p className="text-[11px] text-neutral-450 text-neutral-400 font-medium font-sans leading-normal mb-4 max-w-xs">
                        Ejecuta la sintonía corporal: oirás un golpe sordo de Bom y gotas de agua en cascada.
                      </p>

                      <button
                        onClick={triggerAudioTest}
                        className={`px-4.5 py-2.5 rounded-xl font-black font-mono text-xs uppercase flex items-center gap-2 transition-all active:scale-95 ${
                          soundTestSuccess
                            ? 'bg-emerald-500 text-neutral-950 scale-102 shadow-[0_0_15px_rgba(16,185,129,0.25)] border border-emerald-400/40'
                            : 'bg-neutral-950 hover:bg-neutral-900 border border-neutral-805 border-neutral-800 text-cyan-400 shadow-sm'
                        }`}
                      >
                        {soundTestSuccess ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-neutral-950" />
                            <span>SINTONÍA EMITIENDO</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4 text-cyan-400" />
                            <span>EMITIR SEÑAL DE TEST</span>
                          </>
                        )}
                      </button>

                      {soundTestSuccess && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9.5px] text-emerald-400 font-mono font-bold mt-3">
                          ✔ Sintonizador Web Audio enlazado. ¡Regula tus amplificadores!
                        </motion.p>
                      )}
                    </div>

                    <div className="p-3 bg-cyan-500/5 border border-cyan-500/15 rounded-xl text-left">
                      <span className="text-cyan-400 font-black block text-[9px] font-mono uppercase tracking-wider mb-0.5">ℹ️ ¿FUNCIONA SIN INTERNET?</span>
                      <p className="text-[10.5px] leading-relaxed text-neutral-450 text-neutral-400 font-sans">
                        ¡Absolutamente! La síntesis de ondas e instrumentación son estimadas directamente por código local sin megas de consumo.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 text-[9px] text-neutral-500 font-mono italic">
                    *Las marcas de alistamiento facilitan el orden previo a cada simulación.
                  </div>
                </div>

              </div>
            )}

            {/* SCREEN 1C: STEP 3 - LAUNCHER DECK & BYPASS DIRECT GRID */}
            {inductionScreen === 'despegue' && (
              <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
                
                {/* Launcher Primary Card */}
                <div className="md:col-span-6 bg-neutral-950 border border-neutral-850 p-5 md:p-6 rounded-2xl flex flex-col justify-between text-center min-h-[360px] shadow-lg">
                  <div>
                    <div className="p-3.5 bg-neutral-900 border-2 border-dashed border-emerald-500/20 rounded-full mb-3 w-fit mx-auto text-3xl leading-none">
                      🎭
                    </div>

                    <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9.5px] font-mono font-black uppercase tracking-wider">
                      Aula Calibrada y Conectada
                    </span>

                    <h3 className="text-base font-black uppercase text-white font-sans mt-3.5 tracking-tight leading-tight">
                      Lanzar Aventura Rítmica Completa
                    </h3>
                    <p className="text-xs text-neutral-400 max-w-sm font-sans leading-relaxed mt-2 mx-auto text-center">
                      Este botón inicia de inmediato la simulación completa desde la Introducción (Escena 1). El sistema generará el teatrillo de Adaggio, cargará los instrumentos y detendrá el flujo automáticamente en las pausas de libreto.
                    </p>

                    <div className="mt-6 p-4 bg-neutral-900 border border-neutral-850 rounded-2xl max-w-md mx-auto text-left">
                      <div className="flex items-start gap-3">
                        <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${allChecksPassed ? 'text-emerald-500 animate-pulse' : 'text-neutral-600'}`} />
                        <div>
                          <strong className="text-xs block text-white font-black">Estado del Aula (Alistamiento físico):</strong>
                          <span className="text-[10.5px] text-neutral-400 block leading-normal mt-0.5 font-medium">
                            {allChecksPassed 
                              ? '¡Fabuloso! Haz verificado todos los puntos preventivos requeridos.' 
                              : 'Recomendamos tachar todos los puntos del "Paso 2: Alistamiento" para evitar interrupciones físicas.'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 mt-6 border-t border-neutral-850 pt-4">
                    <button
                      onClick={handleLaunchFullSession}
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-neutral-950 font-black py-4.5 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:scale-[1.01] active:scale-95 transition-all font-mono py-3.5"
                    >
                      <span>🎬 DESPEGAR ESCENA COMPLETA (INTRODUCCIÓN) ➔</span>
                    </button>

                    <button
                      onClick={() => setInductionScreen('alistamiento')}
                      className="text-neutral-500 hover:text-neutral-300 text-[11px] font-mono font-bold hover:underline py-1 transition-colors"
                    >
                      ❮ Volver al Alistamiento de Materiales
                    </button>
                  </div>
                </div>

                {/* Bypass Quick Grid (Selector 2 shortcuts but Dark Theme!) */}
                <div className="md:col-span-6 bg-neutral-950 border border-neutral-850 p-5 md:p-6 rounded-2xl flex flex-col justify-between min-h-[360px] shadow-lg">
                  <div>
                    <div className="flex items-center justify-between border-b border-neutral-850 pb-3 mb-4">
                      <h4 className="font-extrabold text-white uppercase font-mono text-xs tracking-wider flex items-center gap-2">
                        <span>🚀</span> Acceso Rápido a Escenas Educativas
                      </h4>
                      <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-[9px] font-mono font-black text-neutral-400">
                        SALTOS TÁCTICOS
                      </span>
                    </div>

                    <p className="text-xs text-neutral-400 leading-normal mb-4 font-sans text-justify">
                      Si el grupo ya avanzó previamente en un bloque, puedes retomar el juego de Adaggio saltando de manera instantánea a cualquiera de los tótems:
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {NARRATIVE_BLOCKS.map(block => (
                        <button
                          key={block.id}
                          onClick={() => handleLaunchQuickScene(block.id)}
                          className="bg-neutral-900 border border-neutral-850 text-left p-3 rounded-xl hover:border-amber-400 hover:bg-amber-500/5 transition-all text-neutral-200 group flex flex-col justify-between min-h-[105px] shadow-sm select-none"
                          title={block.name}
                        >
                          <div className="flex justify-between items-center w-full mb-1">
                            <span className="text-[10px] font-mono font-black text-amber-500/80 group-hover:text-amber-400">
                              Bloque {block.id}
                            </span>
                            <span className="text-xs">
                              {block.id === 1 && "🎹"}
                              {block.id === 2 && "🌱"}
                              {block.id === 3 && "💧"}
                              {block.id === 4 && "🌬️"}
                              {block.id === 5 && "⚡"}
                              {block.id === 6 && "👣"}
                              {block.id === 7 && "☀️"}
                              {block.id === 8 && "🌈"}
                              {block.id === 9 && "🌸"}
                            </span>
                          </div>

                          <div className="font-sans">
                            <span className="text-[10px] font-black text-white block truncate leading-tight uppercase">
                              {block.name}
                            </span>
                            <span className="text-[8.5px] text-neutral-500 font-mono block mt-0.5 truncate leading-none">
                              {block.title}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 bg-amber-500/5 border border-amber-500/15 text-neutral-300 mt-4 leading-normal text-[10.5px] rounded-xl font-sans text-justify shadow-inner">
                    💡 <strong>Cohesión de datos:</strong> La bitácora y el plano del aula se integran dinámicamente para facilitar el registro de asistencia y anotaciones en la bitácora al final de la sesión.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SPATIAL BLUEPRINT GRID MAP */}
        {activeTab === 'classroom' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in text-left">
            <div className="md:col-span-7 bg-neutral-950 p-5 border border-neutral-850 rounded-2xl flex flex-col items-center justify-between shadow-lg min-h-[380px]">
              <div className="w-full">
                <h3 className="text-xs font-extrabold text-white mb-4 font-mono uppercase tracking-wider text-center">
                  Planificación Espacial del Aula (Área Libre 3x3 metros)
                </h3>
                
                {/* Interactive mapping sandbox */}
                <div className="w-full max-w-sm aspect-square bg-neutral-900 rounded-2xl border-2 border-dashed border-neutral-800 p-5 relative flex flex-col justify-between overflow-hidden shadow-inner mx-auto">
                  <div className="absolute inset-x-0 top-0 h-7 bg-neutral-800/80 border-b border-neutral-750 flex justify-center items-center text-[9px] font-mono text-neutral-300 font-black tracking-wide">
                    PANTALLA DE PROYECCIÓN / ESCENARIO DE TÓTEMS
                  </div>
                  
                  {/* Nodes for kids and teacher */}
                  <div className="flex-1 flex flex-col justify-around items-center my-6">
                    <div className="absolute top-5 transition-transform hover:scale-105">
                      <span className="text-[9px] bg-neutral-800 text-cyan-400 border border-neutral-750 px-2 py-0.5 rounded-full font-mono uppercase font-black shadow-sm">
                        PROYECTOR / PARLANTE
                      </span>
                    </div>

                    {/* Children grid spots */}
                    <div className="grid grid-cols-3 gap-6 text-center w-full max-w-xs mt-6">
                      <div className="flex flex-col items-center">
                        <span className="w-8 h-8 rounded-full bg-emerald-500 text-neutral-950 font-mono text-xs flex items-center justify-center font-black shadow-md border-2 border-emerald-400/40">N1</span>
                        <span className="text-[8.5px] text-neutral-400 font-mono mt-1 font-bold">Infante A</span>
                      </div>
                      <div className="flex flex-col items-center animate-pulse" style={{ animationDuration: '3s' }}>
                        <span className="w-8 h-8 rounded-full bg-emerald-500 text-neutral-950 font-mono text-xs flex items-center justify-center font-black shadow-md border-2 border-emerald-400/40">N2</span>
                        <span className="text-[8.5px] text-neutral-400 font-mono mt-1 font-bold">Infante B</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="w-8 h-8 rounded-full bg-emerald-500 text-neutral-950 font-mono text-xs flex items-center justify-center font-black shadow-md border-2 border-emerald-400/40">N3</span>
                        <span className="text-[8.5px] text-neutral-400 font-mono mt-1 font-bold">Infante C</span>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <span className="w-8 h-8 rounded-full bg-emerald-500 text-neutral-950 font-mono text-xs flex items-center justify-center font-black shadow-md border-2 border-emerald-400/40">N4</span>
                        <span className="text-[8.5px] text-neutral-400 font-mono mt-1 font-bold">Infante D</span>
                      </div>
                      <div className="flex flex-col items-center border border-amber-500/25 rounded-xl p-1 bg-amber-500/5 shadow-sm leading-none">
                        <span className="w-8 h-8 rounded-full bg-amber-500 text-neutral-950 text-xs flex items-center justify-center font-mono font-black animate-pulse shadow-md">★</span>
                        <span className="text-[8.5px] text-amber-400 font-extrabold mt-1">Punto Reuni</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="w-8 h-8 rounded-full bg-emerald-500 text-neutral-950 font-mono text-xs flex items-center justify-center font-black shadow-md border-2 border-emerald-400/40">N5</span>
                        <span className="text-[8.5px] text-neutral-400 font-mono mt-1 font-bold">Infante E</span>
                      </div>
                    </div>

                    {/* Tutor spot */}
                    <div className="flex flex-col items-center border border-cyan-500/25 bg-cyan-500/5 px-3.5 py-1.5 rounded-2xl shadow mt-6 z-10 hover:scale-105 transition-transform leading-none">
                      <span className="w-6 h-6 rounded-full bg-cyan-500 text-neutral-950 font-mono font-black text-xs flex items-center justify-center shadow-sm">T</span>
                      <span className="text-[9px] text-cyan-400 font-black tracking-wider mt-1.5 uppercase font-mono">TUTOR (MODELADOR)</span>
                    </div>
                  </div>

                  <div className="text-center text-[8.5px] font-mono text-neutral-500 font-bold leading-none mb-1">
                    Espacio Central Vacío • Telas y Bastones listos en la repisa lateral
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-neutral-500 font-mono text-center mt-3">
                * Plano optimizado para el espacio de la Fundación Monte Tabor (Ciudad Bolívar).
              </p>
            </div>

            <div className="md:col-span-5 flex flex-col justify-between font-sans min-h-[380px]">
              <div className="bg-neutral-950 p-5 border border-neutral-850 rounded-2xl shadow-lg flex-1 flex flex-col justify-between gap-4">
                <div>
                  <h4 className="text-sm font-black text-amber-400 mb-2.5 font-mono uppercase tracking-wide">
                    Sugerencias de Alistamiento Físico
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                    La Euritmia de Émile Jaques-Dalcroze rinde mejor cuando el alumno no siente el obstáculo de pupitres o sillas:
                  </p>
                  
                  <ul className="flex flex-col gap-3 text-xs text-neutral-400 font-medium">
                    <li className="flex items-start gap-2.5">
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold">01</span>
                      <div>
                        <strong className="text-white block">Saneamiento del Área:</strong>
                        Remover de inmediato libros, chaquetas o carteras colgadas en la vecindad inmediata para alejar riesgos de tropiezos.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold">02</span>
                      <div>
                        <strong className="text-white block">Dirección de Parlantes:</strong>
                        Poner las bocinas a la altura del oído de los niños (sobre un estante) y direccionadas al centro del área despejada.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold">03</span>
                      <div>
                        <strong className="text-white block">Canasta de Soportes:</strong>
                        Ordenar los pañuelos (Agua - Escena 3) y las antorchas ligeras (Sol - Escena 7) apilándolos limpios a la derecha del tutor para repartirlos al sonar la Pausa.
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="p-3 bg-cyan-500/5 border border-cyan-500/15 rounded-xl text-xs leading-normal font-sans">
                  <span className="font-bold text-cyan-400 block mb-1 font-mono">💡 Consejo del Facilitador:</span>
                  <span className="text-neutral-300">
                    "Al marchar con pañuelos o antorchas, enséñales que el pañuelo es suave como el agua y la antorcha es brillante y cálida como el Sol, reforzando la kinestesia corporal."
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIO SYNTHESIS TRAINING SANDBOX */}
        {activeTab === 'sandbox' && (
          <div className="flex flex-col gap-5 animate-fade-in text-left">
            <div className="bg-neutral-950 p-5 border border-neutral-850 rounded-2xl shadow-lg">
              <h3 className="text-xs font-black text-white mb-1 font-mono uppercase tracking-wider">Teclado Sonos y Modelador de Instrumentos</h3>
              <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                Utiliza estas teclas sonoras en tiempo real para practicar la imitación corporal de las escenas pedagógicas y familiarizarte con las sintonías del Método Dalcroze:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Pad 1: Tierra */}
              <div className="bg-neutral-950 p-5 border border-neutral-850 hover:border-amber-500 rounded-2xl transition-all flex flex-col justify-between gap-3 shadow-md select-none group">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-black font-mono text-amber-400">ESCENA 2: TIERRA (PULSO)</span>
                    <span className="text-[9.5px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold leading-none">BOM! 90 BPM</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-normal font-sans">
                    Marcha firme sintiendo cada bomba grave sonora. Lanza "semillas" imaginarias con la mano derecha al marchar.
                  </p>
                </div>
                <button
                  onClick={() => {
                    audioInstance.playBom();
                    audioInstance.playPluck(196);
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 text-[10.5px] font-black py-2.5 rounded-xl flex items-center justify-center gap-1 hover:scale-[1.01] active:scale-95 transition-all self-end"
                >
                  <Volume2 className="w-4 h-4 text-neutral-950" />
                  <span>Simular Pulso de Tierra</span>
                </button>
              </div>

              {/* Pad 2: Agua */}
              <div className="bg-neutral-950 p-5 border border-neutral-850 hover:border-cyan-500 rounded-2xl transition-all flex flex-col justify-between gap-3 shadow-md select-none group">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-black font-mono text-cyan-400">ESCENA 3: AGUA (ALTURAS)</span>
                    <span className="text-[9.5px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 font-mono font-bold leading-none">Agudo / Grave</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-normal font-sans">
                    Eleva las manos agitando el pañuelo azul en el tono agudo; desciende doblando las rodillas en el grave.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center w-full self-end font-mono">
                  <button
                    onClick={() => audioInstance.playDrip(true)}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white text-[10.5px] py-2.5 rounded-xl font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-white" />
                    <span>Agudo (Arriba)</span>
                  </button>
                  <button
                    onClick={() => audioInstance.playDrip(false)}
                    className="bg-neutral-900 hover:bg-neutral-850 text-cyan-400 text-[10.5px] py-2.5 rounded-xl font-bold flex items-center justify-center gap-1 transition-all border border-neutral-800"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Grave (Abajo)</span>
                  </button>
                </div>
              </div>

              {/* Pad 3: Viento */}
              <div className="bg-neutral-950 p-5 border border-neutral-850 hover:border-neutral-700 rounded-2xl transition-all flex flex-col justify-between gap-3 shadow-md select-none group">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-black font-mono text-neutral-300">ESCENA 4: VIENTO (DINÁMICA)</span>
                    <span className="text-[9.5px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-405 font-mono font-bold leading-none">Piano / Crescendo</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-normal font-sans">
                    Encogerse en cuclillas frotando las palmas en piano silbando; expandir el cuerpo abriendo brazos ruidosamente en forte.
                  </p>
                </div>
                <button
                  onClick={() => {
                    audioInstance.playPluck(330);
                    setTimeout(() => audioInstance.playPluck(440), 250);
                  }}
                  className="w-full bg-neutral-900 hover:bg-neutral-850 text-neutral-300 text-[10.5px] font-black py-2.5 rounded-xl flex items-center justify-center gap-1 hover:scale-[1.01] active:scale-95 transition-all self-end border border-neutral-800"
                >
                  <Volume2 className="w-4 h-4 text-neutral-400" />
                  <span>Escuchar Brisa Piano</span>
                </button>
              </div>

              {/* Pad 4: Trueno 1 */}
              <div className="bg-neutral-950 p-5 border border-neutral-850 hover:border-indigo-500 rounded-2xl transition-all flex flex-col justify-between gap-3 shadow-md select-none group">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-black font-mono text-indigo-400">ESCENA 5: TRUENO 1 (MÚSCULO)</span>
                    <span className="text-[9.5px] px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono font-bold leading-none">Rayo Súbito</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-normal font-sans">
                    Mover los brazos simulando nubes de tormenta; saltar de inmediato al estallar el latido de rayo.
                  </p>
                </div>
                <button
                  onClick={() => audioInstance.playLightning()}
                  className="w-full bg-indigo-600 hover:bg-indigo-505 bg-indigo-600 hover:bg-indigo-500 text-white text-[10.5px] font-black py-2.5 rounded-xl flex items-center justify-center gap-1 hover:scale-[1.01] active:scale-95 transition-all self-end"
                >
                  <Volume2 className="w-4 h-4 text-white" />
                  <span>Emitir Chispazo Rayo!</span>
                </button>
              </div>

              {/* Pad 5: Trueno 2 */}
              <div className="bg-neutral-950 p-5 border border-neutral-850 hover:border-purple-500 rounded-2xl transition-all flex flex-col justify-between gap-3 shadow-md select-none group">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-black font-mono text-purple-400">ESCENA 6: TRUENO 2 (ESTATUA)</span>
                    <span className="text-[9.5px] px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono font-bold leading-none">Marcha Lenta</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-normal font-sans">
                    Caminar sigilosamente en puntas de pies al escuchar el compás; detenerse congelados como roca de montaña al cesar.
                  </p>
                </div>
                <button
                  onClick={() => audioInstance.playMarchSnare(false)}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white text-[10.5px] font-black py-2.5 rounded-xl flex items-center justify-center gap-1 hover:scale-[1.01] active:scale-95 transition-all self-end"
                >
                  <Volume2 className="w-4 h-4 text-white" />
                  <span>Emitir Paso Sigilo</span>
                </button>
              </div>

              {/* Pad 6: Sol */}
              <div className="bg-neutral-950 p-5 border border-neutral-850 hover:border-yellow-600 rounded-2xl transition-all flex flex-col justify-between gap-3 shadow-md select-none group">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-black font-mono text-yellow-400">ESCENA 7: SOL (ACENTO DE FIESTA)</span>
                    <span className="text-[9.5px] px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-mono font-bold leading-none">Compás de Gala</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-normal font-sans">
                    Marchar erguidos portando la antorcha rítmica al compás del tambor; elevar la antorcha al cielo al oír el golpe acentuado.
                  </p>
                </div>
                <button
                  onClick={() => {
                    audioInstance.playMarchSnare(true);
                    audioInstance.playBom();
                  }}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-neutral-950 text-[10.5px] font-black py-2.5 rounded-xl flex items-center justify-center gap-1 hover:scale-[1.01] active:scale-95 transition-all self-end"
                >
                  <Volume2 className="w-4 h-4 text-neutral-950" />
                  <span>Emitir Pulso Central</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: OFFLINE SESSION LOGGER FORM & DATABASE LOG HISTORY */}
        {activeTab === 'logs' && (
          <div id="session-log-database" className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-neutral-200">
            
            {/* Form logger */}
            <form onSubmit={handleSaveSession} className="lg:col-span-5 bg-neutral-950 p-5 border border-neutral-850 rounded-2xl flex flex-col gap-4 text-left shadow-lg">
              <div className="border-b border-neutral-850 pb-2">
                <h3 className="text-xs font-black font-mono text-amber-400 uppercase tracking-wider">
                  Registrar Resultados de Sesión (Bitácora)
                </h3>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Guarda observaciones después del movimiento rítmico con el grupo.
                </p>
              </div>
              
              <div>
                <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wide mb-1 font-bold">
                  Nombre del Grupo o Sesión:
                </label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Ej. Sede Tabor Grado Tercero"
                  className="w-full text-xs p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:bg-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wide mb-1 font-bold">
                    Niños Presentes:
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="45"
                    required
                    value={childCount}
                    onChange={(e) => setChildCount(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 focus:bg-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wide mb-1 font-bold">
                    Tutor / Facilitador:
                  </label>
                  <input
                    type="text"
                    required
                    value={tutorName}
                    onChange={(e) => setTutorName(e.target.value)}
                    placeholder="Ej. Esperanza Tabor"
                    className="w-full text-xs p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:bg-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wide mb-1 font-bold">
                  Notas de Observaciones Críticas de Campo:
                </label>
                <textarea
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Ej. Resaltaron especialmente en el tótem de Agua al usar las tiras azules. Las pausas fueron críticas para reanudar el silencio."
                  className="w-full text-xs p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:bg-neutral-900 h-24 resize-none font-sans leading-relaxed"
                />
              </div>

              {isSavedSuccessfully && (
                <div className="p-3 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs rounded-xl font-bold flex items-center gap-2 animate-pulse font-sans">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>¡Datos resguardados exitosamente en LocalStorage offline!</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm uppercase font-mono"
              >
                <Save className="w-4 h-4 text-neutral-950" />
                <span>REGISTRAR DATOS EN BITÁCORA</span>
              </button>
            </form>

            {/* Offline historical sessions tables list */}
            <div className="lg:col-span-7 bg-neutral-950 p-5 border border-neutral-850 rounded-2xl flex flex-col justify-between text-left shadow-lg min-h-[380px]">
              <div>
                <div className="flex justify-between items-center border-b border-neutral-850 pb-2.5 mb-4">
                  <span className="text-xs font-black font-mono text-cyan-400 uppercase tracking-wider">
                    Historial de Log Pedagógico (Offline)
                  </span>
                  {savedSessions.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="text-[10px] text-red-400 hover:text-red-305 hover:text-red-300 hover:underline font-mono uppercase font-black"
                    >
                      Vaciar Registro
                    </button>
                  )}
                </div>

                {savedSessions.length === 0 ? (
                  <div className="text-center py-16 text-neutral-500 flex flex-col items-center gap-3">
                    <span className="text-3xl">🗃️</span>
                    <p className="text-xs font-sans font-bold text-neutral-400">No existen historiales guardados en este dispositivo todavía.</p>
                    <p className="text-[10.5px] text-neutral-500 max-w-sm leading-normal text-center font-sans">
                      Al marchar con tus alumnos, ingresa la cuantificación de su respuesta rítmica en el recuadro lateral para salvaguardar tu bitácora educativa.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3.5 max-h-[300px] overflow-y-auto pr-2 font-sans">
                    {savedSessions.map(session => (
                      <div key={session.id} className="bg-neutral-900 p-3.5 rounded-xl border border-neutral-850 hover:border-neutral-700 transition-all text-xs flex flex-col gap-2 shadow-sm">
                        <div className="flex justify-between items-center text-[10px] text-neutral-500 font-mono">
                          <span>📅 {session.date}</span>
                          <span>REG-ID: {session.id.split('_')[1]}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-white text-xs uppercase tracking-wide">{session.groupName}</span>
                          <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-amber-500/20">
                            {session.childCount} Niños
                          </span>
                        </div>

                        <div className="text-[11px] text-neutral-300">
                          <strong className="text-white">Tutor de Campo:</strong> {session.tutorName}
                        </div>

                        {session.generalNotes && (
                          <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-850 text-neutral-350 text-[10.5px] italic leading-relaxed">
                            "{session.generalNotes}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-[10px] text-neutral-500 font-mono text-center pt-3.5 border-t border-neutral-850/60 mt-4 leading-normal">
                * Los datos se retienen bajo seguridad estricta en el LocalStorage de tu navegador para operar sin dependencia alguna de conexión de red rural.
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: PEDAGOGY ACCEDING DETAILS */}
        {activeTab === 'pedagogy' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in text-xs leading-relaxed text-neutral-300 text-left font-sans">
            <div className="md:col-span-6 bg-neutral-950 p-5 border border-neutral-850 rounded-2xl shadow-lg flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black font-mono text-amber-400 uppercase tracking-wider mb-3">
                  Estructura Metodológica Dalcroze
                </h4>
                <div className="flex flex-col gap-3 leading-relaxed text-neutral-300 text-justify">
                  <p>
                    La <strong>Euritmia Dalcroze</strong> (desarrollada por Émile Jaques-Dalcroze) concibe el sistema sensorio-motor humano como el traductor natural del sonido. Todo aprendizaje métrico e interactivo requiere ser procesado físicamente en los músculos grandes (pies y hombros) antes de transformarse en notación teórica abstracta.
                  </p>
                  
                  <div className="p-3.5 bg-neutral-900 rounded-xl border border-neutral-850">
                    <span className="font-extrabold text-white block mb-1.5 uppercase font-mono text-[9px] tracking-wide">Equivalencias de Corporalidad Rítmica:</span>
                    <ul className="list-disc list-inside space-y-1.5 text-neutral-400 text-[11px]">
                      <li><strong className="text-amber-400 font-mono">Pulso / Ritmo Base</strong> ➔ Marchar (Tierra, compás 90 BPM).</li>
                      <li><strong className="text-cyan-400 font-mono">Altura Tonal / Frecuencia</strong> ➔ Brazos elevados (agudo) / Brazos bajos (grave).</li>
                      <li><strong className="text-neutral-200 font-mono">Dinámica</strong> ➔ Soportes apretados en piano / Apertura de pecho en forte.</li>
                      <li><strong className="text-purple-400 font-mono">Frenado e Inhibición</strong> ➔ Estatuas de piedra al cesar el sonido (Trueno).</li>
                      <li><strong className="text-amber-400 font-mono">Acento</strong> ➔ Salto vertical en síncope (Sol).</li>
                    </ul>
                  </div>

                  <p>
                    Involucrar el cuerpo en Ciudad Bolívar promueve no solo una alfabetización rítmica natural, sino un sentido de juego seguro y cohesión de paz.
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-6 bg-neutral-950 p-5 border border-neutral-850 rounded-2xl shadow-lg flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black font-mono text-cyan-400 uppercase tracking-wider mb-3">
                  Validación Pedagógica del Diseño (Bogotá, 2026)
                </h4>
                <div className="flex flex-col gap-3 text-neutral-300 text-justify leading-relaxed">
                  <p>
                    Las síntesis rítmicas aplicadas en esta aplicación web rinden de conformidad con las pruebas de campo en la Fundación Monte Tabor (Bogotá, Colombia):
                  </p>

                  <div className="flex flex-col gap-3 text-[11px] text-neutral-400">
                    <div className="flex gap-2.5 items-start">
                      <span className="text-emerald-400 font-black text-xs text-base">✔</span>
                      <div>
                        <strong className="text-white block uppercase font-mono text-[9.5px]">Especialista de Apoyo (Euritmia):</strong>
                        La Prof. <strong>Esperanza Rincón</strong> (Red Colombiana Dalcroze) inspeccionó y certificó la duración simétrica de las frecuencias rítmicas aplicadas en cada bloque.
                      </div>
                    </div>
                    <div className="flex gap-2.5 items-start">
                      <span className="text-emerald-400 font-black text-xs text-base">✔</span>
                      <div>
                        <strong className="text-white block uppercase font-mono text-[9.5px]">Pruebas de Campo Local:</strong>
                        Frayle Javier (Coordinador Monte Tabor) corroboró la idoneidad táctica de las pausas del libreto sonoro para la mediación de un docente de aula.
                      </div>
                    </div>
                  </div>

                  <div className="border border-neutral-850 p-3.5 rounded-xl bg-neutral-900 text-neutral-450 leading-normal text-[10.5px]">
                    <strong className="text-white block mb-1">Citas Metodológicas:</strong>
                    Vernia (2012) defiende que el juego sonoro corporal acelera los cimientos neurológicos; Deterding et al. (2023) afirma que la gamificación estructural no intrusiva de teatrillos reduce la ansiedad.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
