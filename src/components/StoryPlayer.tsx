/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, AlertCircle, Sparkles, 
  CheckSquare, FastForward, Info, HelpCircle, ClipboardList, Users, 
  Save, BookOpen, Map, Layout, ShieldCheck 
} from 'lucide-react';
import { NarrativeBlock, SessionEvaluation, SavedSession } from '../types';
import { NARRATIVE_BLOCKS } from '../data/narrativeBlocks';
import { AdaggioPuppet } from './AdaggioPuppet';
import { TotemList } from './TotemList';
import { audioInstance } from '../utils/AudioEngine';

interface StoryPlayerProps {
  onSessionComplete?: (evaluations: SessionEvaluation[]) => void;
  savedSessionActive?: SavedSession;
}

export const StoryPlayer: React.FC<StoryPlayerProps> = ({ onSessionComplete, savedSessionActive }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSynthEnabled, setIsSynthEnabled] = useState<boolean>(true);
  const [activeBlock, setActiveBlock] = useState<NarrativeBlock>(NARRATIVE_BLOCKS[0]);
  const [playbackRate, setPlaybackRate] = useState<number>(1); // e.g. 1x or 2x for testing/skipping
  
  // Welcome and help panel state
  const [showWelcomeScreen, setShowWelcomeScreen] = useState<boolean>(true);
  const [welcomeTab, setWelcomeTab] = useState<'tutorial' | 'help' | 'play'>('tutorial');
  const [tutorialStep, setTutorialStep] = useState<number>(0);

  // Classroom preparation state
  const [checkedScarves, setCheckedScarves] = useState<boolean>(false);
  const [checkedSticks, setCheckedSticks] = useState<boolean>(false);
  const [checkedQuiet, setCheckedQuiet] = useState<boolean>(false);
  const [checkedSpeaker, setCheckedSpeaker] = useState<boolean>(false);
  const [soundTestSuccess, setSoundTestSuccess] = useState<boolean>(false);

  // Track triggered pauses so we pause only once per session
  const [triggeredPauses, setTriggeredPauses] = useState<number[]>([]);
  const [activePauseContent, setActivePauseContent] = useState<string | null>(null);
  const [congratulationsBlock, setCongratulationsBlock] = useState<NarrativeBlock | null>(null);

  // Global event listener to summon this dashboard from any companion button
  useEffect(() => {
    const handleOpenMenu = (e: Event) => {
      const customEvent = e as CustomEvent;
      setShowWelcomeScreen(true);
      if (customEvent.detail && customEvent.detail.tab) {
        setWelcomeTab(customEvent.detail.tab);
      }
      // Smooth scroll to player
      const element = document.getElementById('storyplayer-interactive-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    };
    window.addEventListener('open-storyplayer-menu', handleOpenMenu);
    return () => window.removeEventListener('open-storyplayer-menu', handleOpenMenu);
  }, []);
  
  // Visual effects overlays
  const [lightningFlash, setLightningFlash] = useState<boolean>(false);
  const [solarSparks, setSolarSparks] = useState<{ id: number; x: number; y: number }[]>([]);
  
  // Real-time facilitator feedback metrics
  const [evaluations, setEvaluations] = useState<SessionEvaluation[]>(
    NARRATIVE_BLOCKS.map(block => ({
      blockId: block.id,
      rhythmSinc: 3, // Defaults to High
      engagement: 3,
      understanding: 3,
      notes: ''
    }))
  );

  // Tab controller for the right column of the player (Consolidated Console)
  const [rightActiveTab, setRightActiveTab] = useState<'guide' | 'prep' | 'map' | 'bitacora' | 'pedagogy'>('guide');
  
  // Historical offline sessions database
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [groupName, setGroupName] = useState<string>('');
  const [childCount, setChildCount] = useState<number>(12);
  const [tutorName, setTutorName] = useState<string>('');
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState<boolean>(false);

  // Load historical sessions on mount
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

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName || !tutorName) {
      alert("Por favor completa el nombre del grupo y el tutor facilitador.");
      return;
    }

    const newSession: SavedSession = {
      id: 'session_' + Date.now(),
      date: new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }),
      groupName,
      childCount: Number(childCount),
      tutorName,
      evaluations: [...evaluations],
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
    setTimeout(() => setIsSavedSuccessfully(false), 3000);
  };

  const handleClearHistory = () => {
    if (window.confirm("¿Estás seguro de que deseas vaciar el historial de sesiones registradas en este equipo?")) {
      localStorage.removeItem('dalcroze_sessions_log');
      setSavedSessions([]);
    }
  };

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Initialize AudioEngine hooks on playback status changes
  useEffect(() => {
    if (isPlaying) {
      audioInstance.setSoundEnabled(isSynthEnabled);
      audioInstance.setMute(isMuted);
      const remainingSecondsInBlock = activeBlock.durationEnd - currentTime;
      audioInstance.start(activeBlock.id, remainingSecondsInBlock);
    } else {
      audioInstance.stop();
    }
    return () => audioInstance.stop();
  }, [isPlaying, activeBlock.id]);

  useEffect(() => {
    audioInstance.setMute(isMuted);
  }, [isMuted]);

  useEffect(() => {
    audioInstance.setSoundEnabled(isSynthEnabled);
  }, [isSynthEnabled]);

  // Main high-precision animation-frame timer for reproducible offline timings
  useEffect(() => {
    const handleTick = (now: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = now;
      }
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (isPlaying) {
        setCurrentTime(prev => {
          const nextTime = prev + delta * playbackRate;
          const totalDuration = 455; // 7:35 minutes

          if (nextTime >= totalDuration) {
            setIsPlaying(false);
            audioInstance.stop();
            setCongratulationsBlock(activeBlock);
            return totalDuration;
          }
          return nextTime;
        });
      }
      requestRef.current = requestAnimationFrame(handleTick);
    };

    requestRef.current = requestAnimationFrame(handleTick);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying, playbackRate, evaluations, activeBlock]);

  // Handle active block transitions based on current playing seconds
  useEffect(() => {
    if (congratulationsBlock !== null) return; // Freezes updates while congrats modal is active

    const block = NARRATIVE_BLOCKS.find(
      b => currentTime >= b.durationStart && currentTime < b.durationEnd
    ) || NARRATIVE_BLOCKS[NARRATIVE_BLOCKS.length - 1];
    
    if (block && block.id !== activeBlock.id) {
      if (isPlaying && currentTime >= activeBlock.durationEnd) {
        setIsPlaying(false);
        audioInstance.stop();
        setCurrentTime(activeBlock.durationEnd);
        setCongratulationsBlock(activeBlock);
      } else {
        setActiveBlock(block);
        if (isPlaying) {
          audioInstance.stop();
          audioInstance.start(block.id, 0);
        }
      }
    }

    // Check for Suggested Pause Triggers (e.g. Earth setup check, Scarf checklist, etc)
    const activeBlockElapsed = currentTime - block.durationStart;
    block.suggestedPausas.forEach(pausa => {
      const globalPauseTime = block.durationStart + pausa.time;
      // If we are within 0.5s of the pause time and have not triggered it yet
      if (Math.abs(currentTime - globalPauseTime) < 0.6 && !triggeredPauses.includes(globalPauseTime)) {
        setIsPlaying(false);
        setTriggeredPauses(prev => [...prev, globalPauseTime]);
        setActivePauseContent(pausa.text);
        audioInstance.stop();
      }
    });

    // Random lightning flash generation under Trueno blocks
    if ((block.id === 5 || block.id === 6) && isPlaying) {
      if (Math.random() < 0.04) {
        setLightningFlash(true);
        const timer = setTimeout(() => setLightningFlash(false), 220);
        return () => clearTimeout(timer);
      }
    }

    // Solar spark generation on block 7 acentos
    if (block.id === 7 && isPlaying) {
      // Periodic sparks aligned to beats
      const beatPercent = (currentTime - block.durationStart) % (60 / 110);
      if (beatPercent < 0.1 && Math.random() < 0.3) {
        const newSpark = {
          id: Math.random(),
          x: 20 + Math.random() * 60,
          y: 30 + Math.random() * 40
        };
        setSolarSparks(prev => [...prev, newSpark].slice(-15));
      }
    }
  }, [currentTime, activeBlock, triggeredPauses, isPlaying, congratulationsBlock]);

  const handleContinueNextBlock = () => {
    if (!congratulationsBlock) return;

    const nextBlockId = congratulationsBlock.id + 1;
    const nextBlock = NARRATIVE_BLOCKS.find(b => b.id === nextBlockId);

    if (nextBlock) {
      setCongratulationsBlock(null);
      setActiveBlock(nextBlock);
      setCurrentTime(nextBlock.durationStart);
      setIsPlaying(true);
      
      // Resume audio for next block
      audioInstance.stop();
      audioInstance.start(nextBlock.id, 0);
    } else {
      // It was the last block (block 8)
      setCongratulationsBlock(null);
      setRightActiveTab('bitacora');
      if (onSessionComplete) {
        onSessionComplete(evaluations);
      }
    }
  };

  const handlePauseToggle = () => {
    lastTimeRef.current = null;
    setIsPlaying(prev => !prev);
  };

  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
    setTriggeredPauses([]);
    setActiveBlock(NARRATIVE_BLOCKS[0]);
    audioInstance.stop();
  };

  const handleSkipToBlock = (blockId: number) => {
    const block = NARRATIVE_BLOCKS.find(b => b.id === blockId);
    if (block) {
      setCurrentTime(block.durationStart);
      setActiveBlock(block);
      setTriggeredPauses(prev => prev.filter(p => p < block.durationStart));
      if (isPlaying) {
        audioInstance.stop();
        audioInstance.start(block.id, 0);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleScoreChange = (blockId: number, field: 'rhythmSinc' | 'engagement' | 'understanding', value: number) => {
    setEvaluations(prev =>
      prev.map(e => (e.blockId === blockId ? { ...e, [field]: value } : e))
    );
  };

  const handlePointerScrub = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * 455; // 455 total seconds (7:35)

    setCurrentTime(newTime);

    // Sync active block to the new time
    const block = NARRATIVE_BLOCKS.find(
      b => newTime >= b.durationStart && newTime < b.durationEnd
    ) || NARRATIVE_BLOCKS[NARRATIVE_BLOCKS.length - 1];

    if (block) {
      if (block.id !== activeBlock.id) {
        setActiveBlock(block);
      }
      // Let's filter out triggered pauses that are after the newTime, so they can re-trigger if rewinding
      setTriggeredPauses(prev => prev.filter(p => p < newTime));
      
      if (isPlaying) {
        audioInstance.stop();
        const remainingSecondsInBlock = block.durationEnd - newTime;
        audioInstance.start(block.id, remainingSecondsInBlock);
      }
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    timelineRef.current?.setPointerCapture(e.pointerId);
    handlePointerScrub(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (timelineRef.current?.hasPointerCapture(e.pointerId)) {
      handlePointerScrub(e);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    timelineRef.current?.releasePointerCapture(e.pointerId);
  };

  const activePercent = (currentTime / 455) * 100;

  if (showWelcomeScreen) {
    const isSessionStarted = currentTime > 0;

    // Ritmica audio trigger check
    const triggerAudioTest = () => {
      // Plays deep Bom and a droplet sequence
      audioInstance.playBom();
      setTimeout(() => audioInstance.playDrip(true), 200);
      setTimeout(() => audioInstance.playDrip(false), 400);
      setTimeout(() => audioInstance.playBom(), 600);
      
      setSoundTestSuccess(true);
      setTimeout(() => setSoundTestSuccess(false), 3500);
    };

    return (
      <div id="dalcroze-storyplayer-welcome" className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 shadow-2xl flex flex-col justify-between text-white relative overflow-hidden min-h-[640px] w-full">
        {/* Glow ambient background elements representing Totem Sol & Agua */}
        <div className="absolute top-[-50px] left-[-30px] w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-30px] w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Main welcome titles */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-800 pb-4 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-500 rounded text-[9px] uppercase font-mono tracking-widest font-extrabold border border-amber-500/35">
                  Panel De Inducción Paso A Paso
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">• Facilitador Co-Creador Activo</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black font-sans text-white tracking-tight leading-tight">
                ¿Listo para despertar los Tótems del Ritmo?
              </h2>
            </div>
            
            <div className="text-right">
              <span className="text-xs text-neutral-400 font-sans block">Fundación Monte Tabor</span>
              <span className="text-[10px] text-zinc-500 font-mono">Ciudad Bolívar • Bogotá 2026</span>
            </div>
          </div>

          {/* DYNAMIC PROGRESS PROCESS STEPPER (THE 3 SCREENS INDICATOR) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 my-6 p-1.5 bg-neutral-900/60 border border-neutral-850 rounded-2xl">
            {/* Screen 1 Button */}
            <button
              onClick={() => { setWelcomeTab('tutorial'); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                welcomeTab === 'tutorial'
                  ? 'bg-amber-500 text-neutral-950 font-sans font-black shadow-lg shadow-amber-500/10'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-850/50'
              }`}
            >
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-black ${
                welcomeTab === 'tutorial' ? 'bg-neutral-950 text-amber-400' : 'bg-neutral-800 text-neutral-400'
              }`}>
                01
              </span>
              <div>
                <span className="text-[10.5px] font-sans uppercase font-black block tracking-wide">Paso 1: Guía Metódica</span>
                <span className="text-[9px] opacity-75 font-mono block">Rol & 5 Tótems Del Ritmo</span>
              </div>
            </button>

            {/* Screen 2 Button */}
            <button
              onClick={() => { setWelcomeTab('help'); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                welcomeTab === 'help'
                  ? 'bg-cyan-500 text-neutral-950 font-sans font-black shadow-lg shadow-cyan-500/10'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-850/50'
              }`}
            >
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-black ${
                welcomeTab === 'help' ? 'bg-neutral-950 text-cyan-400' : 'bg-neutral-800 text-neutral-400'
              }`}>
                02
              </span>
              <div>
                <span className="text-[10.5px] font-sans uppercase font-black block tracking-wide">Paso 2: Alistamiento</span>
                <span className="text-[9px] opacity-75 font-mono block">Aulas, Materiales & Altavoz</span>
              </div>
            </button>

            {/* Screen 3 Button */}
            <button
              onClick={() => { setWelcomeTab('play'); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                welcomeTab === 'play'
                  ? 'bg-emerald-500 text-neutral-950 font-sans font-black shadow-lg shadow-emerald-500/10'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-850/50'
              }`}
            >
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-black ${
                welcomeTab === 'play' ? 'bg-neutral-950 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
              }`}>
                03
              </span>
              <div>
                <span className="text-[10.5px] font-sans uppercase font-black block tracking-wide">Paso 3: Lanzador</span>
                <span className="text-[9px] opacity-75 font-mono block">Escoger Escena & Despegar</span>
              </div>
            </button>
          </div>

          {/* 3 DISTINCT INTUITIVE SCREENS CONTAINER */}
          <div className="flex-1 my-2">

            {/* SCREEN 1: METODOLOGIA Y TUTORIAL */}
            {welcomeTab === 'tutorial' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left explanation card with interactive carousel */}
                <div className="lg:col-span-8 flex flex-col justify-between bg-neutral-900 border border-neutral-850 rounded-2xl p-5 md:p-6 min-h-[350px]">
                  <div>
                    <div className="flex justify-between items-center border-b border-neutral-800 pb-3 mb-4">
                      <span className="text-[10px] font-mono uppercase bg-neutral-950 border border-neutral-850 px-2.5 py-1 rounded text-amber-500 font-bold">
                        Ficha Explicativa {tutorialStep + 1} de 4
                      </span>
                      <span className="text-[11px] text-neutral-500 font-mono">Pedagogía Activa Dalcroze</span>
                    </div>

                    {tutorialStep === 0 && (
                      <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-2.5">
                        <h3 className="text-sm font-black text-amber-400 uppercase font-mono tracking-wider flex items-center gap-2">
                          <span>👤</span> El Rol Protagónico del Facilitador
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                          Tú eres el cimiento físico e instruccional del aula. Tu papel es actuar como el puente entre el títere virtual (Adaggio) y tus estudiantes. No requieres teoría musical previa; el sistema traduce la melodía en movimientos lúdicos corporales del grupo.
                        </p>
                        <div className="bg-neutral-950 border border-neutral-850 p-3.5 rounded-xl mt-1">
                          <span className="text-amber-500 font-medium text-[11px] uppercase font-mono block mb-1">Misión Principal en el Aula:</span>
                          <p className="text-xs text-neutral-400 leading-normal font-sans">
                            Acompaña a tus alumnos en el espacio físico. Marcha con fuerza en cada latido sonoro, y dirige con gestos de apoyo las consignas de Adaggio.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {tutorialStep === 1 && (
                      <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-2.5">
                        <h3 className="text-sm font-black text-amber-400 uppercase font-mono tracking-wider flex items-center gap-2">
                          <span>🍂</span> Los 5 Tótems de Ritmo Co-Creados
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                          Sintonizaremos en el espacio físico de juego cinco principios rítmicos representados por tótems que dibujaron los niños de Ciudad Bolívar:
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-[10.5px] text-gray-400 mt-1 font-sans">
                          <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-850">
                            <strong className="text-amber-500 block font-mono">🍂 Tierra (Pulso)</strong>
                            Marcha intensa apoyando cada sutil BOM musical.
                          </div>
                          <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-850">
                            <strong className="text-cyan-400 block font-mono">💧 Agua (Alturas)</strong>
                            Brazos en alto en agudos; y abajo en sonidos graves.
                          </div>
                          <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-850">
                            <strong className="text-neutral-300 block font-mono">💨 Viento (Dinámica)</strong>
                            Acurrucarse en silencio piano; expandir en forte.
                          </div>
                          <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-850">
                            <strong className="text-violet-400 block font-mono">⚡ Trueno (Frenado)</strong>
                            Paso súbito a estatuas congeladas de piedra.
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {tutorialStep === 2 && (
                      <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-2.5">
                        <h3 className="text-sm font-black text-amber-400 uppercase font-mono tracking-wider flex items-center gap-2">
                          <span>🛑</span> Pausas Pedagógicas Inteligentes
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                          El reproductor incorpora pausas integradas de forma automática en hitos tácticos del libreto rítmico. Esto te otorga un tiempo libre de afanes para repartir herramientas físicas o guiar instrucciones pedagógicas de campo directas.
                        </p>
                        <div className="bg-neutral-950 border border-neutral-850 p-3 rounded-xl mt-1">
                          <p className="text-xs text-red-400 leading-relaxed font-mono">
                            📢 Las pausas te guiarán mediante tarjetas de validación rápida. El sistema suspende el sonido y te esperará hasta que hagas clic en "Retomar".
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {tutorialStep === 3 && (
                      <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-2.5">
                        <h3 className="text-sm font-black text-amber-400 uppercase font-mono tracking-wider flex items-center gap-2">
                          <span>📋</span> Bitácora Integrada de Aprendizaje
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                          Al terminar cada bloque secuencial de escena, se presentará instantáneamente una alerta de logro que te invita a ingresar tus apreciaciones en la columna derecha de puntuación (Sincronía, Concentración y Goce).
                        </p>
                        <p className="text-xs text-zinc-400 italic bg-neutral-950 p-2.5 rounded-lg border border-neutral-850 font-sans mt-1">
                          ¡No dependes de internet estable en el aula! Tus reportes y avances son gestionados fuera de línea para asegurar la continuidad pedagógica.
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Inner step dots & nav controller */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-neutral-800">
                    <button
                      disabled={tutorialStep === 0}
                      onClick={() => setTutorialStep(prev => Math.max(0, prev - 1))}
                      className="px-3.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-850 text-xs text-gray-400 hover:text-white disabled:opacity-40 transition-opacity"
                    >
                      Atrás
                    </button>

                    <div className="flex gap-2">
                      {[0, 1, 2, 3].map(step => (
                        <div
                          key={step}
                          className={`w-2 h-2 rounded-full transition-all ${
                            tutorialStep === step ? 'bg-amber-500 w-4' : 'bg-neutral-800'
                          }`}
                        />
                      ))}
                    </div>

                    {tutorialStep < 3 ? (
                      <button
                        onClick={() => setTutorialStep(prev => prev + 1)}
                        className="px-4 py-1.5 rounded-lg bg-amber-500 text-neutral-950 font-black font-sans text-xs hover:scale-[1.03] transition-all"
                      >
                        Siguiente Ficha
                      </button>
                    ) : (
                      <button
                        onClick={() => { setWelcomeTab('help'); }}
                        className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-black font-sans text-xs transition-colors py-1.5"
                      >
                        Paso 2: Alistamiento ➔
                      </button>
                    )}
                  </div>
                </div>

                {/* Right side helper summary */}
                <div className="lg:col-span-4 bg-neutral-900 border border-neutral-850 rounded-2xl p-5 flex flex-col justify-between text-xs text-gray-400 gap-4">
                  <div>
                    <h4 className="font-bold text-gray-200 mb-2.5 uppercase font-mono text-[9.5px] tracking-wide">💡 El Secreto de la Euritmia</h4>
                    <p className="leading-relaxed font-sans text-xs text-justify">
                      La euritmia activa del pedagogo Émile Jaques-Dalcroze integra el análisis rítmico musical ingresándolo directo en la memoria muscular de los pies antes de traducirla en notas abstractas. Es ideal para niños de primera infancia.
                    </p>
                  </div>

                  <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-850 text-neutral-300">
                    <strong className="text-amber-500 text-[10.5px] uppercase font-mono block mb-1">⭐ Tip Rápido:</strong>
                    Si detectas que el grupo pierde el orden, haz que sigan la percusión rítmica de tus manos mientras marchas en círculos.
                  </div>

                  <div className="border-t border-neutral-850 pt-3 flex flex-col gap-2">
                    <span className="text-[10px] text-neutral-500 font-mono">¿Quieres saltarte el tutorial guiado?</span>
                    <button
                      onClick={() => setWelcomeTab('play')}
                      className="w-full bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-amber-500 font-black font-mono text-xs py-2 rounded-xl transition-all uppercase tracking-wide"
                    >
                      Saltar directo al reproductor
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SCREEN 2: ALISTAMIENTO DE MATERIALES Y PRUEBA DE SONIDO */}
            {welcomeTab === 'help' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left card: Interactive Material Checklist */}
                <div className="lg:col-span-6 bg-neutral-900 border border-neutral-850 rounded-2xl p-5 md:p-6 flex flex-col justify-between min-h-[350px]">
                  <div>
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
                      <h3 className="text-sm font-black text-white font-mono uppercase tracking-wide flex items-center gap-2">
                        <span>📦</span> 1. Alistamiento de Materiales Físicos
                      </h3>
                      <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded font-mono font-bold">INTERACTIVO</span>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed mb-4 font-sans">
                      La Fundación Monte Tabor utiliza elementos cotidianos de bajo costo para activar los tótems. Marca las casillas de verificación para confirmar que todo está listo:
                    </p>

                    <div className="flex flex-col gap-3">
                      {/* Checkbox item 1 */}
                      <label
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          checkedScarves
                            ? 'bg-cyan-950/20 border-cyan-500/50 text-cyan-200'
                            : 'bg-neutral-950 border-neutral-850 text-gray-400 hover:border-neutral-700'
                        }`}
                        onClick={() => setCheckedScarves(!checkedScarves)}
                      >
                        <input
                          type="checkbox"
                          checked={checkedScarves}
                          readOnly
                          className="w-4 h-4 accent-cyan-500 rounded mt-0.5"
                        />
                        <div>
                          <span className="text-xs font-bold block text-gray-200 font-sans">💧 Pañuelos Celestes (Activan Elemento Agua)</span>
                          <span className="text-[11px] leading-normal text-neutral-400 block mt-0.5">
                            Necesitas 15 tiras de tela ligera azul celeste. Si no tienes telas, puedes recortar bolsitas de plástico celeste; el crujido aporta volumen a su escucha.
                          </span>
                        </div>
                      </label>

                      {/* Checkbox item 2 */}
                      <label
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          checkedSticks
                            ? 'bg-cyan-950/20 border-cyan-500/50 text-cyan-200'
                            : 'bg-neutral-950 border-neutral-850 text-gray-400 hover:border-neutral-700'
                        }`}
                        onClick={() => setCheckedSticks(!checkedSticks)}
                      >
                        <input
                          type="checkbox"
                          checked={checkedSticks}
                          readOnly
                          className="w-4 h-4 accent-cyan-500 rounded mt-0.5"
                        />
                        <div>
                          <span className="text-xs font-bold block text-gray-200 font-sans">☀️ Bastones de Sol (Activan Elemento Sol)</span>
                          <span className="text-[11px] leading-normal text-neutral-400 block mt-0.5">
                            Consigue 15 palitos redondos ligeros (unos 60cm de largo). Puedes reutilizar palos de escoba sencillos o tubos rígidos de cartón.
                          </span>
                        </div>
                      </label>

                      {/* Checkbox item 3 */}
                      <label
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          checkedQuiet
                            ? 'bg-cyan-950/20 border-cyan-500/50 text-cyan-200'
                            : 'bg-neutral-950 border-neutral-850 text-gray-400 hover:border-neutral-700'
                        }`}
                        onClick={() => setCheckedQuiet(!checkedQuiet)}
                      >
                        <input
                          type="checkbox"
                          checked={checkedQuiet}
                          readOnly
                          className="w-4 h-4 accent-cyan-500 rounded mt-0.5"
                        />
                        <div>
                          <span className="text-xs font-bold block text-gray-200 font-sans">⚡ Trueno y Concentración Silenciosa</span>
                          <span className="text-[11px] leading-normal text-neutral-400 block mt-0.5">
                            Sin recursos físicos en este. Asegura que el aula cuente con suficiente espacio despejado para que se frozen en estatuas graciosas.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 text-[10px] text-gray-500 font-mono italic">
                    *Tus confirmaciones de materiales se aplican solo a esta sesión educativa.
                  </div>
                </div>

                {/* Right card: Interactive Sound Calibration Panel */}
                <div className="lg:col-span-6 bg-neutral-900 border border-neutral-850 rounded-2xl p-5 md:p-6 flex flex-col justify-between min-h-[350px]">
                  <div>
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
                      <h3 className="text-sm font-black text-white font-mono uppercase tracking-wide flex items-center gap-2">
                        <span>🔊</span> 2. Calibración de Altavoz y Test de Sonido
                      </h3>
                      <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold">REAL-TIME</span>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed mb-4 font-sans">
                      Los alumnos van a marchar fuerte, generando bastante ruido de pasos. Por ello, es crucial verificar que los parlantes del aula suenen a buen volumen. ¡Pruébalo ahora mismo!
                    </p>

                    <div className="bg-neutral-950 rounded-2xl border border-neutral-850 p-4 flex flex-col items-center justify-center text-center relative overflow-hidden my-3">
                      {/* Interactive audio pulse animation */}
                      {soundTestSuccess && (
                        <div className="absolute inset-0 bg-emerald-500/5 flex items-center justify-center pointer-events-none animate-pulse">
                          {/* Animated speaker wave lines */}
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-6 bg-emerald-400/80 rounded animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-12 bg-emerald-400 rounded animate-bounce" style={{ animationDelay: '100ms' }} />
                            <span className="w-1.5 h-8 bg-emerald-400/90 rounded animate-bounce" style={{ animationDelay: '200ms' }} />
                            <span className="w-1.5 h-14 bg-emerald-400 rounded animate-bounce" style={{ animationDelay: '300ms' }} />
                            <span className="w-1.5 h-5 bg-emerald-500/80 rounded animate-bounce" style={{ animationDelay: '400ms' }} />
                          </div>
                        </div>
                      )}

                      <span className="text-2xl mb-1 select-none">📢</span>
                      <h4 className="text-xs font-bold text-gray-200 font-mono uppercase tracking-wide mb-1">
                        Sintetizador Sonos de Verificación
                      </h4>
                      <p className="text-[11px] text-gray-400 max-w-xs mb-3 font-sans leading-normal">
                        Haz clic en el botón de abajo. Deberías oír una sintonía profunda y luego gotas de agua.
                      </p>

                      <button
                        onClick={triggerAudioTest}
                        className={`px-4 py-2.5 rounded-xl font-black font-mono text-xs uppercase flex items-center gap-1.5 transition-all active:scale-95 ${
                          soundTestSuccess
                            ? 'bg-emerald-600 text-neutral-950 scale-105'
                            : 'bg-neutral-900 border border-neutral-800 text-cyan-400 hover:border-cyan-500/50'
                        }`}
                      >
                        <span>{soundTestSuccess ? '🔊 SINTONÍA CORRIENDO' : '🔊 DISPARAR TEST SÓNICO'}</span>
                      </button>

                      {soundTestSuccess && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-emerald-400 font-mono font-bold mt-2.5">
                          ✔ Señal de Web Audio sintetizada. ¡Ajusta el volumen de tus altavoces!
                        </motion.p>
                      )}
                    </div>

                    <div className="bg-cyan-950/15 border border-cyan-950/45 p-4 rounded-xl text-neutral-300">
                      <span className="text-cyan-400 font-bold block text-[10px] font-mono uppercase mb-0.5">💡 ¿Y si funciona sin conexión?</span>
                      <p className="text-[11px] leading-relaxed font-sans text-neutral-400">
                        Sí, el software realiza síntesis matemática por código directo en el navegador de tu dispositivo. No necesita que gastes megas en transmisión de audio pesada.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 mt-5 border-t border-neutral-805 pt-4">
                    <button
                      onClick={() => { setWelcomeTab('tutorial'); }}
                      className="flex-1 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-gray-300 py-2.5 rounded-xl font-mono text-xs transition-all font-bold"
                    >
                      ❮ Ir al Tutorial
                    </button>

                    <button
                      onClick={() => { setWelcomeTab('play'); }}
                      className="flex-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 py-2.5 rounded-xl font-black font-mono transition-all text-xs tracking-wider uppercase flex items-center justify-center gap-1 shadow-lg shadow-amber-500/10"
                    >
                      <span>Ir al Lanzador de Juego ➔</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SCREEN 3: LANZADOR DEL AUDIOVISUAL */}
            {welcomeTab === 'play' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left card: Direct Launch Control */}
                <div className="lg:col-span-6 bg-neutral-900 border border-neutral-850 rounded-2xl p-5 md:p-6 flex flex-col justify-between text-center min-h-[350px]">
                  <div>
                    <div className="p-3 bg-emerald-500/10 border-2 border-dashed border-emerald-500/30 rounded-full mb-4 w-fit mx-auto">
                      <span className="text-3xl leading-none block select-none">🎭</span>
                    </div>

                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                      Listo Para Despegar
                    </span>
                    
                    <h3 className="text-base font-black uppercase text-white font-sans mt-3 tracking-wide">
                      Reproducir Aventura Rítmica Completa
                    </h3>
                    <p className="text-xs text-neutral-400 max-w-sm mt-1.5 leading-relaxed font-sans mx-auto">
                      Con este botón, iniciaras desde la Introducción (Escena 1). El sistema desplegará las imágenes de Adaggio, activará la música en tiempo real y gestionará las pausas pedagógicas de forma automática.
                    </p>

                    <div className="mt-6 p-4 bg-neutral-950 rounded-2xl border border-neutral-850 max-w-sm mx-auto">
                      <label className="flex items-center gap-3 cursor-pointer select-none text-[11px] text-gray-300 text-left">
                        <input
                          type="checkbox"
                          checked={isSynthEnabled}
                          onChange={(e) => setIsSynthEnabled(e.target.checked)}
                          className="w-4 h-4 accent-emerald-500 rounded border-neutral-700 bg-neutral-900"
                        />
                        <div>
                          <span className="font-bold block text-gray-200">Sintetizador Web Audio API</span>
                          <span className="text-[10px] text-gray-400 leading-normal block">Recomendado para clases con parlantes y sin internet.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 mt-6 border-t border-neutral-805 pt-4">
                    <button
                      onClick={() => {
                        setShowWelcomeScreen(false);
                        setCurrentTime(0);
                        setActiveBlock(NARRATIVE_BLOCKS[0]);
                        setIsPlaying(true);
                      }}
                      className="w-full bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-neutral-950 font-black py-4.5 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15 hover:scale-[1.02] active:scale-95 transition-all font-mono"
                    >
                      <span className="text-sm">🎬</span>
                      <span>DESPEGAR AVENTURA COMPLETA (ESCENA 1)</span>
                    </button>
                    
                    <button
                      onClick={() => setWelcomeTab('help')}
                      className="text-gray-400 hover:text-white font-mono text-[11px] underline"
                    >
                      ❮ Volver al Alistamiento de Materiales
                    </button>
                  </div>
                </div>

                {/* Right card: Interactive Bypass Block Grid */}
                <div className="lg:col-span-6 bg-neutral-900 border border-neutral-850 rounded-2xl p-5 md:p-6 flex flex-col justify-between min-h-[350px]">
                  <div>
                    <div className="flex items-center justify-between border-b border-neutral-805 pb-3 mb-4">
                      <h4 className="font-black text-white uppercase font-mono text-xs tracking-wider flex items-center gap-1.5">
                        <span>🚀</span> Acceso Rápido a Escenas Específicas
                      </h4>
                      <span className="text-[9.5px] bg-neutral-950 border border-neutral-850 px-2 py-0.5 rounded text-neutral-400 font-mono font-bold">BYPASS</span>
                    </div>

                    <p className="text-xs text-neutral-400 leading-normal mb-3 font-sans">
                      ¿Ya jugaron con Adaggio anteriormente? Haz clic directo en cualquier cuadro para reanudar el audio y la animación desde esa escena pedagógica particular:
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {NARRATIVE_BLOCKS.map(block => (
                        <button
                          key={block.id}
                          onClick={() => {
                            setShowWelcomeScreen(false);
                            handleSkipToBlock(block.id);
                            setIsPlaying(true);
                          }}
                          className="bg-neutral-950 border border-neutral-850 text-left p-2.5 rounded-xl hover:border-amber-500 hover:bg-neutral-900 transition-all text-neutral-300 group flex flex-col justify-between"
                          title={block.name}
                        >
                          <div className="flex justify-between items-center w-full mb-1">
                            <span className="text-[10px] font-mono font-black text-amber-500 group-hover:text-amber-400">
                              Escena {block.id}
                            </span>
                            <span className="text-[11px] opacity-70">
                              {block.id === 1 && "🎼"}
                              {block.id === 2 && "🌱"}
                              {block.id === 3 && "💧"}
                              {block.id === 4 && "💨"}
                              {block.id === 5 && "⚡"}
                              {block.id === 6 && "👣"}
                              {block.id === 7 && "☀️"}
                              {block.id === 8 && "🌍"}
                            </span>
                          </div>
                          
                          <span className="text-[10px] font-extrabold text-gray-200 block truncate leading-tight font-sans">
                            {block.name}
                          </span>
                          
                          <span className="text-[8.5px] text-zinc-500 font-mono block mt-1 truncate">
                            {block.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850 text-neutral-400 mt-4 leading-relaxed text-[11px] font-sans">
                    💡 <strong>Conexión con la Caja Facilitadora:</strong> El mapa táctico y la bitácora que llenas se sincronizan automáticamente con el bloque activo que selecciones en este panel.
                  </div>
                </div>

              </motion.div>
            )}

          </div>

          {/* Stepper Wizard Footer panel */}
          <div className="text-[10.5px] text-gray-500 font-mono text-center pt-3 border-t border-neutral-850 flex flex-col sm:flex-row justify-between items-center relative z-10 mt-6 gap-2">
            <div>
              <span>Fundación Monte Tabor © 2026 — Bogotá, Colombia</span>
            </div>

            {isSessionStarted ? (
              <button
                onClick={() => setShowWelcomeScreen(false)}
                className="px-4 py-2 text-[11px] rounded bg-emerald-600 hover:bg-emerald-500 font-sans font-black text-neutral-950 flex items-center gap-1.5 transition-all uppercase tracking-wider shadow"
              >
                <span>Reanudar Bloque {activeBlock.id} en curso</span>
                <span>➔</span>
              </button>
            ) : (
              <div className="flex gap-2">
                {welcomeTab !== 'play' && (
                  <button
                    onClick={() => {
                      if (welcomeTab === 'tutorial') setWelcomeTab('help');
                      else if (welcomeTab === 'help') setWelcomeTab('play');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-850 text-gray-300 font-mono text-[10.5px] font-bold"
                  >
                    Siguiente Paso ➔
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div id="dalcroze-storyplayer-main" className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-neutral-900 text-white rounded-xl overflow-hidden p-1 min-h-[580px]">
      
      {/* 8-BLOCKS COMPREHENSIVE ROADMAP (TOP BAR) */}
      <div id="narrative-blocks-flow-roadmap" className="lg:col-span-12 bg-neutral-950 p-4 rounded-lg flex flex-wrap gap-2 justify-between items-center border border-neutral-800">
        <div className="flex items-center gap-2">
          <Sparkles className="text-amber-500 w-5 h-5 animate-pulse" />
          <h3 className="text-sm font-semibold tracking-wide text-neutral-300">Ruta de Euritmia (8 Bloques - 7:35 min)</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {NARRATIVE_BLOCKS.map(block => {
            const isActive = activeBlock.id === block.id;
            const isPassed = currentTime >= block.durationEnd;
            return (
              <button
                key={block.id}
                onClick={() => handleSkipToBlock(block.id)}
                className={`px-2.5 py-1.5 text-xs rounded transition-all duration-300 font-medium flex items-center gap-1 border ${
                  isActive
                    ? 'bg-amber-500 text-neutral-950 border-amber-400 font-semibold shadow-lg shadow-amber-500/15 scale-105'
                    : isPassed
                    ? 'bg-neutral-800/80 text-amber-500 border-neutral-700'
                    : 'bg-neutral-900 text-neutral-500 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <span className="opacity-80 font-bold">{block.id}</span>
                <span className="hidden sm:inline font-sans font-medium text-[10.5px]">
                  {block.name.split(' ')[2] || block.name.split('—')[1]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* LEFT COLUMN: THE MOVEMENT STAGE i.e. THEATRILLO (Col-Span 7) */}
      <div id="interactive-theater-column" className="lg:col-span-7 flex flex-col gap-4">
        
        {/* PHYSICAL STAGE */}
        <div
          id="teatrillo-marionette-stage-frame"
          className="relative aspect-video w-full rounded-xl border-4 border-amber-950 bg-neutral-950 overflow-hidden flex flex-col justify-between shadow-2xl"
          style={{
            backgroundImage: "radial-gradient(circle at center, #26211e 0%, #0d0c0b 100%)",
            boxShadow: "inset 0 0 80px rgba(0,0,0,0.9)"
          }}
        >
          {/* Lightning Storm Flash Overlay */}
          <div
            className={`absolute inset-0 z-40 bg-purple-700/60 pointer-events-none transition-opacity duration-75 mix-blend-color-dodge ${
              lightningFlash ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* BACKGROUND NATURAL TÓTEM COLUMNS */}
          <TotemList activeBlockId={activeBlock.id} />

          {/* VINTAGE RED VELVET CURTAINS */}
          <div className="absolute top-0 inset-x-0 h-10 flex justify-between z-10 pointer-events-none">
            {/* Left drape */}
            <div className="w-20 bg-red-800 rounded-br-2xl border-r-2 border-b-2 border-yellow-600 shadow-md transform -skew-x-6" />
            {/* Swag banner */}
            <div className="flex-1 bg-gradient-to-b from-red-900 to-red-800 h-6 border-b-2 border-yellow-600 relative">
              <div className="absolute bottom-1 inset-x-0 h-[1px] bg-yellow-500/50" />
              <div className="text-[9px] font-mono text-center text-yellow-300/80 pt-0.5 tracking-widest uppercase">Teatrillo Monte Tabor</div>
            </div>
            {/* Right drape */}
            <div className="w-20 bg-red-800 rounded-bl-2xl border-l-2 border-b-2 border-yellow-600 shadow-md transform skew-x-6" />
          </div>

          {/* DYNAMIC SCENERIC PARTICLES BASED ON ELEMENTS */}
          {isPlaying && activeBlock.id === 2 && ( // Tierra seed dots
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full w-2 h-2 bg-amber-500/40"
                  style={{ left: `${15 + i * 15}%`, top: '20%' }}
                  animate={{ y: [0, 180], x: [0, (i % 2 === 0 ? 30 : -30)], opacity: [0, 0.8, 0] }}
                  transition={{ repeat: Infinity, duration: 2.2, delay: i * 0.4 }}
                />
              ))}
            </div>
          )}

          {isPlaying && activeBlock.id === 3 && ( // Agua raindrop stream
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-[2px] h-6 bg-cyan-300/45 rounded-sm"
                  style={{ left: `${5 + i * 8}%`, top: '-5%' }}
                  animate={{ y: [0, 240], x: [0, -20] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1, ease: "linear" }}
                />
              ))}
            </div>
          )}

          {isPlaying && activeBlock.id === 4 && ( // Viento clouds
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-neutral-400/25 font-bold"
                  style={{ top: `${20 + i * 20}%`, left: '-20%' }}
                  animate={{ x: [-50, 480], opacity: [0, 0.4, 0.4, 0] }}
                  transition={{ repeat: Infinity, duration: 4.5, delay: i * 0.8, ease: "easeInOut" }}
                >
                  💨
                </motion.div>
              ))}
            </div>
          )}

          {solarSparks.map(spark => (
            <motion.div
              key={spark.id}
              className="absolute text-yellow-300 font-bold drop-shadow-lg text-lg select-none z-20 pointer-events-none"
              style={{ left: `${spark.x}%`, top: `${spark.y}%` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.4, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            >
              ✦
            </motion.div>
          ))}

          {/* ACTIVE ADAGGIO PUPPET IN STAGE CENTER */}
          <div id="marionette-adaggio-centerfold" className="flex-1 flex justify-center items-end pb-4 relative z-10 mt-10">
            <AdaggioPuppet
              animationState={activeBlock.adaggioAnimationState}
              isElectrocuting={activeBlock.id === 5 && isPlaying}
            />

            {/* BLOCK INSTRUMENT TAG */}
            <div className="absolute top-10 right-4 bg-neutral-950/80 border border-neutral-700/80 px-2.5 py-1 rounded text-[10.5px] font-mono text-amber-500/90 flex items-center gap-1.5 shadow backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>{activeBlock.instrumentProtagonist}</span>
            </div>

            {/* BLOCK STATE CHIP */}
            <div className={`absolute top-10 left-4 px-2 py-0.5 rounded text-[9.5px] font-bold shadow ${
              activeBlock.stateType === 'ACCIÓN' || activeBlock.stateType === 'ACCIÓN_DIRECCIÓN'
                ? 'bg-emerald-600 text-white'
                : activeBlock.stateType === 'DESCANSO'
                ? 'bg-amber-600 text-white'
                : 'bg-neutral-800 text-neutral-300'
            }`}>
              {activeBlock.stateType}
            </div>
          </div>

          {/* DIGITAL SUBTITLES / TRANSCRIPT OVERLAY */}
          <div id="theatre-digital-transcripts" className="bg-neutral-900/95 border-t border-neutral-800 p-3 min-h-[68px] flex flex-col justify-center items-center z-20 gap-1 backdrop-blur">
            <p className="text-amber-500 text-[10.5px] font-bold uppercase tracking-widest font-mono">
              Narrador (Escucha Grupal)
            </p>
            <p className="text-gray-100 text-xs sm:text-sm text-center font-sans tracking-wide leading-relaxed max-w-xl">
              "{activeBlock.narratorLines}"
            </p>
          </div>
        </div>

        {/* TIMELINE CONTROLLER BAR & CONTROLS */}
        <div id="media-timeline-dashboard" className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex flex-col gap-3 shadow-lg">
          
          {/* Timeline and duration badges */}
          <div className="flex justify-between items-center text-xs font-mono text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">
              {activeBlock.name} — {activeBlock.title}
            </span>
            <span>7:35</span>
          </div>

          {/* Scrub slider bar */}
          <div
            ref={timelineRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative h-3 w-full bg-neutral-800 rounded-full cursor-pointer touch-none select-none overflow-hidden shadow-inner flex items-center group/timeline transition-all hover:h-4"
          >
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-amber-600 to-yellow-400 pointer-events-none"
              style={{ width: `${activePercent}%` }}
            />
            
            {/* Visual thumb head slider feedback on hover */}
            <div 
              className="absolute w-3 h-3 bg-white rounded-full border border-amber-600 shadow scale-0 group-hover/timeline:scale-100 transition-transform pointer-events-none"
              style={{ left: `calc(${activePercent}% - 6px)` }}
            />

            {/* Markers for Suggested Pauses */}
            {NARRATIVE_BLOCKS.flatMap(b => b.suggestedPausas.map(p => b.durationStart + p.time)).map((point, idx) => (
              <div
                key={idx}
                className="absolute w-1.5 h-full bg-red-600 z-10 pointer-events-none"
                style={{ left: `${(point / 455) * 100}%` }}
                title="Pausa Pedagógica Sugerida"
              />
            ))}
          </div>

          {/* Control Actions buttons grid */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                title="Reiniciar reproducción"
                className="p-2 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-gray-300 transition-all hover:scale-105 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handlePauseToggle}
                className={`px-5 py-2 rounded font-bold text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 ${
                  isPlaying
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-amber-500 border border-amber-500/30'
                    : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black shadow-lg shadow-amber-500/10'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-amber-500" /> : <Play className="w-4 h-4 fill-neutral-900" />}
                <span>{isPlaying ? 'PAUSAR' : 'REPRODUCIR SIMULACIÓN'}</span>
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  audioInstance.stop();
                  setShowWelcomeScreen(true);
                  setWelcomeTab('tutorial');
                  setTutorialStep(0);
                }}
                className="px-3.5 py-2 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-gray-300 font-mono text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                title="Abrir Menú de Inducción, Tutorial y Soporte"
              >
                <span>📦</span>
                <span>MENÚ INDUCCIÓN</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Skip rates for developers/testers to evaluate blocks quickly */}
              <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded border border-neutral-800">
                <span className="text-[9px] font-mono text-gray-500 uppercase px-1">Test Speed:</span>
                <button
                  onClick={() => setPlaybackRate(1)}
                  className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${playbackRate === 1 ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-gray-400 hover:text-white'}`}
                >
                  1x
                </button>
                <button
                  onClick={() => setPlaybackRate(2.5)}
                  className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${playbackRate === 2.5 ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-gray-400 hover:text-white'}`}
                >
                  2.5x
                </button>
                <button
                  onClick={() => setPlaybackRate(5)}
                  className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${playbackRate === 5 ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-gray-400 hover:text-white'}`}
                >
                  5x
                </button>
              </div>

              {/* Mute and active Audio synthesis sliders */}
              <button
                onClick={() => setIsMuted(prev => !prev)}
                className={`p-2 rounded transition-all ${
                  isMuted ? 'bg-red-950 text-red-500 border border-red-900' : 'bg-neutral-900 text-gray-300 border border-neutral-800 hover:bg-neutral-800'
                }`}
                title="Muto de sonido"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <label className="flex items-center gap-1.5 text-xs text-neutral-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isSynthEnabled}
                  onChange={(e) => setIsSynthEnabled(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-900 text-amber-500 focus:ring-amber-500 w-3.5 h-3.5"
                />
                <span className="font-mono text-[10.5px]">Sintetizador Web Audio</span>
              </label>
            </div>
          </div>
        </div>

      </div>

      <div id="mediation-companion-column" className="lg:col-span-12 xl:col-span-5 flex flex-col gap-4 h-full">
        
        {/* TAB CONTROLLER DECK FOR HIGH-PRECISION WIREFRAME CONSOLE */}
        <div className="flex flex-wrap gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setRightActiveTab('guide')}
            className={`flex-1 min-w-[70px] py-1.5 rounded-lg transition-all flex flex-col items-center justify-center gap-1 border border-transparent ${
              rightActiveTab === 'guide'
                ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900 border-transparent'
            }`}
            title="Guía Pedagógica y Observables en Vivo"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span className="text-[9px]">Guía / Notas</span>
          </button>

          <button
            type="button"
            onClick={() => setRightActiveTab('prep')}
            className={`flex-1 min-w-[70px] py-1.5 rounded-lg transition-all flex flex-col items-center justify-center gap-1 border border-transparent ${
              rightActiveTab === 'prep'
                ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900 border-transparent'
            }`}
            title="Lista de Alistamiento Físico de Aula y Sonos Sandbox"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="text-[9px]">Alistamiento</span>
          </button>

          <button
            type="button"
            onClick={() => setRightActiveTab('map')}
            className={`flex-1 min-w-[70px] py-1.5 rounded-lg transition-all flex flex-col items-center justify-center gap-1 border border-transparent ${
              rightActiveTab === 'map'
                ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900 border-transparent'
            }`}
            title="Distribución Geográfica del Aula Metodológica 3x3"
          >
            <Map className="w-3.5 h-3.5" />
            <span className="text-[9px]">Plano Aula</span>
          </button>

          <button
            type="button"
            onClick={() => setRightActiveTab('bitacora')}
            className={`flex-1 min-w-[70px] py-1.5 rounded-lg transition-all flex flex-col items-center justify-center gap-1 border border-transparent ${
              rightActiveTab === 'bitacora'
                ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900 border-transparent'
            }`}
            title="Registro de Bitácora y Guardado de Historial en LocalStorage"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="text-[9px]">Bitácora</span>
          </button>

          <button
            type="button"
            onClick={() => setRightActiveTab('pedagogy')}
            className={`flex-1 min-w-[70px] py-1.5 rounded-lg transition-all flex flex-col items-center justify-center gap-1 border border-transparent ${
              rightActiveTab === 'pedagogy'
                ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900 border-transparent'
            }`}
            title="Soporte y Fundamentación Metodológica Dalcroze"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="text-[9px]">Soporte</span>
          </button>
        </div>

        {/* TAB 1: LIVE INSTRUCTION GUIDE & OBSERVATION MATRICES */}
        {rightActiveTab === 'guide' && (
          <div className="flex flex-col gap-4 flex-1">
            {/* ACTIVE PEDAGOGICAL CUE CARD CARD */}
            <div id="cue-verbal-pulpit" className="bg-neutral-950 border border-yellow-700/30 rounded-xl p-4 flex flex-col gap-3 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-yellow-500/10 to-transparent pointer-events-none" />
              
              <div className="flex items-center gap-2 text-left">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <h4 className="text-xs uppercase font-bold text-amber-400 font-mono tracking-wider">
                  Guía del Tutor (Ciudad Bolívar Context)
                </h4>
              </div>

              <div className="bg-neutral-900/60 p-3 rounded-lg border border-neutral-800/80 text-left">
                <p className="text-[10px] font-mono text-neutral-500 uppercase">Consigna verbal sugerida para vocear en el salón:</p>
                <p className="text-gray-200 text-xs mt-1.5 italic font-medium leading-relaxed">
                  "{activeBlock.narratorLines.split('.').slice(2).join('.') || activeBlock.narratorLines}"
                </p>
              </div>

              <div className="text-left">
                <p className="text-[10px] font-mono text-amber-500 uppercase font-black tracking-wider">Acción Física del Tutor/Facilitador:</p>
                <p className="text-gray-300 text-xs mt-1 leading-relaxed border-l-2 border-amber-600 pl-2.5">
                  💡 {activeBlock.facilitatorCue}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-neutral-900 p-2.5 rounded border border-neutral-800/60 text-left">
                <div>
                  <span className="text-[9.5px] font-mono text-gray-500 block">Objetivo Pedagógico:</span>
                  <span className="text-gray-300 font-sans">{activeBlock.pedagogicalObjective}</span>
                </div>
                <div>
                  <span className="text-[9.5px] font-mono text-gray-500 block">Concepto Dalcroze:</span>
                  <span className="text-gray-300 font-sans">{activeBlock.rhythmicConcept}</span>
                </div>
              </div>
            </div>

            {/* LIVE REAL-TIME OBSERVABLES SCENARIO */}
            <div id="observables-tracker-box" className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 shadow-lg flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2.5 text-left">
                  <h4 className="text-xs font-bold text-neutral-300 tracking-wider font-mono uppercase">
                    Observables del Bloque {activeBlock.id}
                  </h4>
                  <span className="text-[10px] text-gray-500">¿Qué observar en los niños?</span>
                </div>

                <div className="flex flex-col gap-2.5 text-left font-sans">
                  {activeBlock.observables.map(obs => {
                    const currentRating = evaluations.find(e => e.blockId === activeBlock.id)?.[obs.id === 'pulse_sync' || obs.id === 'pitch_discrimination' || obs.id === 'dynamic_scaling' || obs.id === 'sudden_contrast' || obs.id === 'stealth_pulse_walk' || obs.id === 'accent_jump' ? 'rhythmSinc' : 'understanding'] || 3;
                    
                    return (
                      <div key={obs.id} className="bg-neutral-900/40 p-2.5 rounded-lg border border-neutral-800/80 flex flex-col gap-1 hover:border-neutral-700/50 transition-all font-sans">
                        <div>
                          <span className="text-xs font-semibold text-gray-100 flex items-center gap-1.5">
                            <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
                            {obs.label}
                          </span>
                          <p className="text-[11px] text-gray-400 mt-1 pl-5 leading-normal font-sans">
                            {obs.description}
                          </p>
                        </div>

                        {/* Quick Evaluators scale */}
                        <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t border-neutral-800/40 pl-5">
                          <span className="text-[9.5px] font-mono text-gray-500 uppercase">Logro del grupo:</span>
                          <div className="flex gap-1 font-sans">
                            {[
                              { val: 1, label: 'Bajo', color: 'hover:bg-red-500/10 hover:text-red-400', activeCol: 'bg-red-950/80 text-red-400 border-red-900/50' },
                              { val: 2, label: 'Medio', color: 'hover:bg-amber-500/10 hover:text-amber-400', activeCol: 'bg-amber-950/80 text-amber-400 border-amber-900/50' },
                              { val: 3, label: 'Excelente', color: 'hover:bg-emerald-500/10 hover:text-emerald-400', activeCol: 'bg-emerald-950/80 text-emerald-400 border-emerald-900/50' }
                            ].map(rating => {
                              const isSel = currentRating === rating.val;
                              const field = obs.id === 'pulse_sync' || obs.id === 'pitch_discrimination' || obs.id === 'dynamic_scaling' || obs.id === 'sudden_contrast' || obs.id === 'stealth_pulse_walk' || obs.id === 'accent_jump' ? 'rhythmSinc' : 'understanding';
                              
                              return (
                                <button
                                  type="button"
                                  key={rating.val}
                                  onClick={() => handleScoreChange(activeBlock.id, field, rating.val)}
                                  className={`text-[9.5px] px-1.5 py-0.5 rounded transition-all border font-medium ${
                                    isSel
                                      ? rating.activeCol
                                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 ' + rating.color
                                  }`}
                                >
                                  {rating.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Helper Notes section */}
              <div className="mt-3 pt-3 border-t border-neutral-800/80 flex flex-col gap-1.5 text-left font-sans">
                <span className="text-[10px] font-mono text-neutral-450 uppercase">
                  Anotación del Tutor sobre este Bloque:
                </span>
                <textarea
                  value={evaluations.find(e => e.blockId === activeBlock.id)?.notes || ''}
                  onChange={(e) => {
                    const updatedVal = e.target.value;
                    setEvaluations(prev =>
                      prev.map(item => (item.blockId === activeBlock.id ? { ...item, notes: updatedVal } : item))
                    );
                  }}
                  placeholder="Ej. Sincronía ideal, se cansaron hacia el final, precisó pausas de agua, etc..."
                  className="w-full text-xs p-2 rounded bg-neutral-900 border border-neutral-800 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 h-14 resize-none font-sans"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CLASSROOM PREP LIST & SOUND SANDBOX TRIGGER BOARD */}
        {rightActiveTab === 'prep' && (
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 flex flex-col gap-4 shadow-lg flex-1">
            
            {/* SCENIC CHECKLIST INSIDE TAB */}
            <div className="text-left font-sans">
              <div className="flex items-center gap-1.5 mb-2 font-mono">
                <ClipboardList className="text-amber-500 w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wide text-gray-200">
                  Lista de Alistamiento Físico de Aula
                </h4>
              </div>
              <p className="text-[11px] text-gray-400 mb-2 leading-relaxed">
                Marca estas verificaciones necesarias en el salón de la fundación antes o durante la reproducción:
              </p>

              <div className="grid grid-cols-2 gap-2">
                {/* Checkbox Scarves */}
                <div
                  onClick={() => setCheckedScarves(!checkedScarves)}
                  className={`p-2 rounded-lg border cursor-pointer select-none transition-all flex items-center gap-2 ${
                    checkedScarves ? 'bg-emerald-950/20 border-emerald-600/50 text-emerald-400' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-850'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center font-mono text-[9px] ${checkedScarves ? 'bg-emerald-600 text-neutral-950 font-bold border-transparent' : 'border-neutral-700'}`}>
                    {checkedScarves ? '✓' : ''}
                  </div>
                  <div className="truncate font-sans">
                    <span className="text-[10px] font-semibold block leading-tight text-neutral-200">15 Pañuelos</span>
                    <span className="text-[8.5px] text-gray-500 block leading-tight">Material Agua (Azules)</span>
                  </div>
                </div>

                {/* Checkbox Sticks */}
                <div
                  onClick={() => setCheckedSticks(!checkedSticks)}
                  className={`p-2 rounded-lg border cursor-pointer select-none transition-all flex items-center gap-2 ${
                    checkedSticks ? 'bg-emerald-950/20 border-emerald-600/50 text-emerald-400' : 'bg-neutral-900 border-neutral-800 text-neutral-450 hover:bg-neutral-850'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center font-mono text-[9px] ${checkedSticks ? 'bg-emerald-600 text-neutral-950 font-bold border-transparent' : 'border-neutral-700'}`}>
                    {checkedSticks ? '✓' : ''}
                  </div>
                  <div className="truncate font-sans font-sans">
                    <span className="text-[10px] font-semibold block leading-tight text-neutral-200">15 Bastones</span>
                    <span className="text-[8.5px] text-gray-500 block leading-tight">Material Sol (Bastón)</span>
                  </div>
                </div>

                {/* Checkbox Quiet */}
                <div
                  onClick={() => setCheckedQuiet(!checkedQuiet)}
                  className={`p-2 rounded-lg border cursor-pointer select-none transition-all flex items-center gap-2 col-span-2 ${
                    checkedQuiet ? 'bg-emerald-950/20 border-emerald-600/50 text-emerald-400' : 'bg-neutral-900 border-neutral-800 text-neutral-450 hover:bg-neutral-850'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center font-mono text-[9px] ${checkedQuiet ? 'bg-emerald-600 text-neutral-950 font-bold border-transparent' : 'border-neutral-700'}`}>
                    {checkedQuiet ? '✓' : ''}
                  </div>
                  <div className="font-sans">
                    <span className="text-[10px] font-semibold block leading-tight text-neutral-100">Espacio de 3x3 metros Libre</span>
                    <span className="text-[8.5px] text-gray-400 block leading-tight mt-0.5">Mover pupitres y sillas para despejar el centro</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SOUND TEST / SANDBOX CONTROLLERS inside Tab */}
            <div className="border-t border-neutral-800/80 pt-3 flex flex-col gap-2 text-left font-sans">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-mono">
                  <Volume2 className="text-amber-500 w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wide text-gray-200">
                    Banco de Sonidos & Sonos Pruebas
                  </h4>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/45 text-emerald-400 font-mono border border-emerald-900/35 font-bold uppercase">Sintetizador OK</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-normal mb-1 font-sans">
                Prueba los timbres rítmicos correspondientes a los elementos de la euritmia antes de dar play:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
                {/* Earth Grave sound */}
                <button
                  type="button"
                  onClick={() => {
                    audioInstance.playBom();
                    audioInstance.playPluck(196);
                    setSoundTestSuccess(true);
                  }}
                  className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 p-2 rounded-lg flex flex-col items-start gap-0.5 text-left active:scale-[0.98] transition-transform"
                >
                  <span className="text-[10px] font-bold text-amber-500 font-mono flex items-center gap-1 font-sans">🪘 Tierra • Grave</span>
                  <span className="text-[8.5px] text-neutral-500">Pulsar BOM! rítmico pesado</span>
                </button>

                {/* Water Pitch sounds */}
                <div className="bg-neutral-900 border border-neutral-800 p-2 rounded-lg flex flex-col gap-1 text-left font-sans">
                  <span className="text-[10px] font-bold text-cyan-400 font-mono">💧 Agua • Tonos</span>
                  <div className="grid grid-cols-2 gap-1.5 font-sans">
                    <button
                      type="button"
                      onClick={() => {
                        audioInstance.playDrip(true);
                        setSoundTestSuccess(true);
                      }}
                      className="bg-cyan-950/60 hover:bg-cyan-900 text-[9px] text-cyan-200 py-0.5 rounded font-mono font-bold text-center"
                    >
                      Agudo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        audioInstance.playDrip(false);
                        setSoundTestSuccess(true);
                      }}
                      className="bg-neutral-950 hover:bg-neutral-905 text-[9px] text-gray-300 py-0.5 rounded font-mono font-bold text-center"
                    >
                      Grave
                    </button>
                  </div>
                </div>

                {/* Wind breeze sweep */}
                <button
                  type="button"
                  onClick={() => {
                    audioInstance.playPluck(330);
                    setTimeout(() => {
                      audioInstance.playPluck(440);
                    }, 220);
                    setSoundTestSuccess(true);
                  }}
                  className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 p-2 rounded-lg flex flex-col items-start gap-0.5 text-left active:scale-[0.98] transition-transform"
                >
                  <span className="text-[10px] font-bold text-neutral-200 font-mono">💨 Viento • Dinámica</span>
                  <span className="text-[8.5px] text-neutral-500">Arpegio Piano a Forte</span>
                </button>

                {/* Lightning Explosion */}
                <button
                  type="button"
                  onClick={() => {
                    audioInstance.playLightning();
                    setSoundTestSuccess(true);
                  }}
                  className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 p-2 rounded-lg flex flex-col items-start gap-0.5 text-left active:scale-[0.98] transition-transform"
                >
                  <span className="text-[10px] font-bold text-indigo-400 font-mono">⚡ Trueno • Choque</span>
                  <span className="text-[8.5px] text-neutral-500">Emisión de descarga súbita</span>
                </button>

                {/* Sun military march acento */}
                <button
                  type="button"
                  onClick={() => {
                    audioInstance.playMarchSnare(true);
                    audioInstance.playBom();
                    setSoundTestSuccess(true);
                  }}
                  className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 p-2 rounded-lg flex flex-col items-start gap-0.5 text-left active:scale-[0.98] transition-transform col-span-2 animation-pulse font-sans"
                >
                  <span className="text-[10px] font-bold text-yellow-500 font-mono flex items-center justify-between w-full font-mono">
                    <span>☀️ Sol • Acento y Marcha 4/4</span>
                    <span className="text-[7.5px] text-gray-500 font-normal">Bastones</span>
                  </span>
                  <span className="text-[8.5px] text-neutral-500">Pulso militar robusto ideal para saltar y percutir al caer</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SPATIAL BLUEPRINT MAP 3X3 */}
        {rightActiveTab === 'map' && (
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 flex flex-col gap-4 shadow-lg flex-1">
            <div className="flex items-center gap-1.5 mb-1.5 text-left font-mono">
              <Map className="text-amber-500 w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200">Plano Geográfico de Aula</h4>
            </div>

            {/* Direct Vector schematic graph */}
            <div className="w-full aspect-video bg-neutral-900/60 rounded-xl border border-neutral-800/80 p-3 pt-4 relative flex flex-col justify-between overflow-hidden shadow-inner font-sans">
              <div className="text-[8px] font-mono text-amber-500/80 text-center border-b border-neutral-800/40 pb-1 uppercase tracking-wide font-sans">
                PANTALLA AUDIOVISUAL MULTIMEDIA
              </div>
              
              <div className="flex justify-around items-center my-1 relative">
                {/* student dots and safe point star */}
                <div className="flex gap-3 items-center">
                  <div className="flex flex-col items-center">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 border border-white text-white font-mono text-[9px] flex items-center justify-center font-bold">N1</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 border border-white text-white font-mono text-[9px] flex items-center justify-center font-bold">N2</span>
                  </div>
                  <div className="flex flex-col items-center border border-amber-500/20 bg-amber-950/20 p-1 rounded font-sans">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 text-[10px] flex items-center justify-center font-bold font-mono">★</span>
                  </div>
                  <div className="flex flex-col items-center font-sans">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 border border-white text-white font-mono text-[9px] flex items-center justify-center font-bold">N3</span>
                  </div>
                </div>

                {/* Facilitator role */}
                <div className="flex flex-col items-center bg-blue-950/35 border border-blue-900/50 px-1.5 py-0.5 rounded leading-tight">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-mono font-bold text-[8.5px] flex items-center justify-center">T</span>
                  <span className="text-[7px] text-blue-300 font-bold uppercase mt-0.5 font-mono">Tutor</span>
                </div>
              </div>

              <div className="text-[8px] font-mono text-gray-500 text-center uppercase tracking-wider">
                Dimensiones mínimas: Área libre de 3x3 metros de diámetro
              </div>
            </div>

            <div className="flex flex-col gap-2.5 text-xs text-gray-300 leading-normal font-sans text-left">
              <div>
                <strong className="text-neutral-100 text-[11px] block text-left">Disposición Recomendada de Alumnos:</strong>
                <p className="text-[10.5px] text-neutral-450 mt-1">
                  Reúne a los niños en un semicírculo simétrico mirando la pantalla. El tutor se posiciona en un lateral o al frente como modelo rítmico para animar el levantamiento coordinado de talones y brazos.
                </p>
              </div>

              <div className="p-2.5 bg-neutral-900 border border-neutral-850/60 rounded text-[10px] text-amber-500 font-mono text-left">
                💡 <span className="font-bold text-gray-250 font-sans">Tip Dalcroze:</span> Si notas cansancio o dispersión del grupo durante la tormenta del Trueno, llévalos al Punto Seguro (★) para hacer respiraciones colectivas lentas.
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: OFFLINE LOGGER & COMPLETED HISTORIES DATABASE */}
        {rightActiveTab === 'bitacora' && (
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 flex flex-col gap-4 shadow-lg flex-1">
            
            {/* SAVING FORM */}
            <form onSubmit={handleSaveSession} className="flex flex-col gap-2.5 text-left font-sans">
              <div className="flex items-center gap-1.5 justify-between">
                <div className="flex items-center gap-1.5 font-mono font-bold">
                  <Users className="text-amber-500 w-4 h-4 animate-pulse" />
                  <h4 className="text-xs uppercase tracking-wider text-gray-200 font-mono">Registrar Bitácora</h4>
                </div>
                <span className="text-[9px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded uppercase font-mono border border-amber-500/30 font-bold">Offline</span>
              </div>
              
              <div className="text-[11px] text-gray-400 leading-normal">
                Escribe las observaciones correspondientes al grupo para conservarlas de manera local:
              </div>

              <div>
                <label className="block text-[8.5px] font-mono text-gray-500 uppercase mb-1">Nombre de Grupo / Grado:</label>
                <input
                  type="text"
                  required
                  value={groupName || ''}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Ej. Monte Tabor Grado 3 Primaria"
                  className="w-full text-xs p-1.5 rounded bg-neutral-900 border border-neutral-800 text-white placeholder-gray-650 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-left">
                <div>
                  <label className="block text-[8.5px] font-mono text-gray-500 uppercase mb-1 text-left">Niños de 7-12 años:</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={childCount}
                    onChange={(e) => setChildCount(Number(e.target.value))}
                    className="w-full text-xs p-1.5 bg-neutral-900 border border-neutral-800 text-white rounded focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[8.5px] font-mono text-gray-500 uppercase mb-1 text-left">Tutor de Turno:</label>
                  <input
                    type="text"
                    required
                    value={tutorName || ''}
                    onChange={(e) => setTutorName(e.target.value)}
                    placeholder="Ej. Frayle Javier"
                    className="w-full text-xs p-1.5 rounded bg-neutral-900 border border-neutral-800 text-white placeholder-gray-650 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[8.5px] font-mono text-gray-500 uppercase mb-1 text-left">Anotaciones y Logros:</label>
                <textarea
                  value={generalNotes || ''}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Ej. Hermosa euritmia de Tierra. Los pañuelos azules en el bloque de Agua despertaron mucha relajación grupal..."
                  className="w-full text-xs p-1.5 rounded bg-neutral-900 border border-neutral-800 text-white placeholder-gray-650 focus:outline-none focus:border-amber-500 h-14 resize-none font-sans"
                />
              </div>

              {isSavedSuccessfully && (
                <div className="text-[10px] p-2 bg-emerald-950/50 border border-emerald-900/60 text-emerald-400 font-mono rounded flex items-center gap-1 leading-normal font-sans text-left">
                  <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Bitácora guardada localmente de manera exitosa!</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-sans font-black text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow hover:scale-[1.025]"
              >
                <Save className="w-3.5 h-3.5" />
                <span>GUARDAR HISTORIAL</span>
              </button>
            </form>

            {/* LIST OF COMPLETED SESSIONS */}
            <div className="border-t border-neutral-800/80 pt-3 flex-1 flex flex-col justify-between text-left font-sans">
              <div>
                <div className="flex justify-between items-center mb-1.5 font-sans">
                  <span className="text-[9px] font-bold font-mono text-neutral-500 uppercase tracking-widest text-left">Registros de Campo</span>
                  {savedSessions.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="text-[9px] text-red-400 hover:underline hover:text-red-300 font-mono"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {savedSessions.length === 0 ? (
                  <div className="text-center py-3 text-neutral-500 text-[10px] font-sans">
                    📂 Sin registros de campo generados todavía.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-[130px] overflow-y-auto pr-1 text-left font-sans">
                    {savedSessions.map(sess => (
                      <div key={sess.id} className="bg-neutral-900 p-2 rounded border border-neutral-800 text-[10px] flex flex-col gap-0.5 leading-tight text-left">
                        <div className="flex justify-between items-center text-[8px] text-gray-500 font-mono">
                          <span>{sess.date}</span>
                          <span>ID: {sess.id.split('_')[1]}</span>
                        </div>
                        <div className="flex justify-between items-center font-sans">
                          <strong className="text-amber-500 truncate max-w-[120px] font-sans">{sess.groupName}</strong>
                          <span className="text-[8.5px] bg-neutral-800 px-1 py-0.5 rounded text-gray-400 font-mono font-mono">
                            {sess.childCount} niños
                          </span>
                        </div>
                        <p className="text-[9.5px] text-gray-300 font-sans line-clamp-2 italic">
                          "{sess.generalNotes || 'Sin anotación general.'}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: THEORY PEDAGOGICAL SUMMARY SCREEN */}
        {rightActiveTab === 'pedagogy' && (
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 flex flex-col gap-3 shadow-lg flex-1 overflow-y-auto max-h-[460px]">
            <div>
              <div className="flex items-center gap-1.5 mb-1 text-cyan-400 font-mono text-left font-sans">
                <BookOpen className="w-4 h-4 text-cyan-450" />
                <h4 className="text-xs font-bold uppercase tracking-wide text-gray-200 font-mono">
                  Respaldo Metodológico
                </h4>
              </div>
              <p className="text-[10.5px] text-gray-400 mb-2 leading-relaxed font-sans text-left">
                Abstracción reducida del Método Dalcroze fundamentado para Ciudad Bolívar, Bogotá, en mayo de 2026:
              </p>
            </div>

            <div className="flex flex-col gap-2.5 text-[11px] text-gray-350 leading-relaxed font-sans text-left">
              <p>
                La <strong className="text-amber-500 font-bold font-sans">Euritmia Colectiva</strong> enseña que la mente procesa el sonido auditivamente, pero la verdadera decodificación e interiorización musical del pulso y ritmo ocurre al moverse libremente en la corporalidad.
              </p>

              <div className="bg-neutral-900 p-2.5 border border-neutral-850 font-mono text-[9px] text-gray-400 space-y-1 rounded-lg">
                <span className="font-bold text-gray-200 block text-[9.5px] uppercase mb-1 font-sans font-sans">Equivalencias de Movimiento:</span>
                <div>🥁 <strong className="text-amber-500 font-mono">Pulso</strong>: Marcha rítmica de talones pesados.</div>
                <div>💧 <strong className="text-cyan-400 font-mono">Alturas</strong>: Subir de puntillas / Bajar agachándose.</div>
                <div>💨 <strong className="text-neutral-300 font-mono">Dinámicas</strong>: Apertura de brazos de Piano a Forte.</div>
                <div>☀️ <strong className="text-yellow-500 font-mono">Acentos</strong>: Saltos pliés en el suelo con bastón.</div>
              </div>

              <div className="border border-neutral-850 p-2 bg-neutral-900 text-[9px] text-gray-500 leading-normal font-sans">
                <p>
                  <strong className="text-neutral-300 block mb-0.5 font-sans">Diseño Sprint (Fundación Monte Tabor):</strong>
                  Estructurado con la educadora musical Esperanza Rincón y con co-creaciones metodológicas de los propios niños del barrio para asegurar pertinencia.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* DETAILED PEDAGOGICAL SUGGESTED PAUSE FULLSCREEN MODAL OVERLAY */}
      <AnimatePresence>
        {activePauseContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-neutral-900 border-2 border-amber-500 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative"
            >
              <div className="flex items-center gap-3.5 mb-4 border-b border-neutral-800 pb-3">
                <div className="p-3 bg-amber-500/10 rounded-full border border-amber-500/35">
                  <AlertCircle className="text-amber-500 w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-500 font-sans uppercase">
                    Pausa Pedagógica Sugerida (Euritmia)
                  </h3>
                  <p className="text-xs text-neutral-400 font-mono">Orientación para facilitar en el aula</p>
                </div>
              </div>

              {/* Informative description */}
              <div className="bg-amber-950/20 text-neutral-200 border border-amber-900/40 p-4 rounded-xl mb-6 leading-relaxed text-sm">
                <p className="font-sans">
                  {activePauseContent}
                </p>
              </div>

              {/* Facilitator reminders before resuming */}
              <div className="mb-6 flex flex-col gap-2 bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                <span className="text-[10px] font-mono text-gray-500 uppercase block">Lista de Cotejo Rápida:</span>
                <span className="text-xs text-gray-300 flex items-center gap-2">
                  <span className="text-amber-500">✓</span> Enseña el movimiento exagerando las alturas / dinámicas.
                </span>
                <span className="text-xs text-gray-300 flex items-center gap-2">
                  <span className="text-amber-500">✓</span> Asegura que todos los niños tengan el material listo.
                </span>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setActivePauseContent(null);
                    setIsPlaying(true);
                  }}
                  className="bg-gradient-to-r from-amber-600 to-yellow-500 text-neutral-950 font-black px-6 py-3 rounded-xl hover:from-amber-500 hover:to-yellow-400 transition-all text-xs tracking-wider shadow-lg shadow-amber-500/20 hover:scale-105"
                >
                  ¡ACOMPAÑAR A NUESTROS NIÑOS Y CONTINUAR!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
 
      {/* GLORIOUS GAME-LIKE CONGRATULATIONS MODAL */}
      <AnimatePresence>
        {congratulationsBlock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-neutral-900 border-2 border-emerald-500 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative overflow-hidden text-white"
            >
              {/* Background ambient light flare */}
              <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-3.5 mb-4 border-b border-neutral-800 pb-3">
                <div className="p-3 bg-emerald-500/15 rounded-full border border-emerald-500/35">
                  <span className="text-3xl leading-none block select-none">
                    {congratulationsBlock.id === 8 ? "🏆" : "🎉"}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-emerald-400 font-sans tracking-tight uppercase leading-snug">
                    ¡Felicidades, lo lograste!
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">
                    Escena Terminada Con Éxito — Bloque {congratulationsBlock.id}
                  </p>
                </div>
              </div>

              {/* Congratulatory message */}
              <div className="bg-emerald-950/25 text-neutral-200 border border-emerald-950/45 p-5 rounded-xl mb-6 relative z-10">
                <div className="flex items-start gap-3">
                  <div className="text-3.5xl leading-none select-none">
                    {congratulationsBlock.id === 1 && "🎼"}
                    {congratulationsBlock.id === 2 && "🌱"}
                    {congratulationsBlock.id === 3 && "💧"}
                    {congratulationsBlock.id === 4 && "💨"}
                    {congratulationsBlock.id === 5 && "⚡"}
                    {congratulationsBlock.id === 6 && "👣"}
                    {congratulationsBlock.id === 7 && "☀️"}
                    {congratulationsBlock.id === 8 && "🌍"}
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-300 text-sm font-sans mb-1 uppercase tracking-wide">
                      {congratulationsBlock.name}
                    </h4>
                    <p className="text-xs text-neutral-400 italic mb-2">
                      “{congratulationsBlock.title}”
                    </p>
                    <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans mt-2">
                      {congratulationsBlock.id === 1 && "¡Súper comienzo! Has despertado la magia de Adaggio y preparado el salón de euritmia con una escucha grandiosa."}
                      {congratulationsBlock.id === 2 && "¡Increíble! Lograron sintonizar sus pies con el pulso profundo de la tierra y sembrar al ritmo del BOM."}
                      {congratulationsBlock.id === 3 && "¡Qué fluidez! Los movimientos altos y bajos con los pañuelos azules sintonizaron el caudal del arroyo con precisión estelar."}
                      {congratulationsBlock.id === 4 && "¡Magnífico! Controlaron su postura y respiración expandiéndose suavemente de piano a forte como la brisa."}
                      {congratulationsBlock.id === 5 && "¡Espectacular control! Supieron reaccionar al rayo repentino y sincronizar la sacudida y la quietud."}
                      {congratulationsBlock.id === 6 && "¡Gran concentración! Caminaron en puntillas de pies y dominaron la marcha silenciosa del sigilo lunar."}
                      {congratulationsBlock.id === 7 && "¡Insuperable energía! Alzaron sus bastones rústicos de madera coordinando un compás alegre bajo el Sol radiante."}
                      {congratulationsBlock.id === 8 && "¡LO LOGRARON! Despertaron todos los tótems del ritmo. Adaggio y la Fundación Monte Tabor brillan con alegría eurítmica pública de Ciudad Bolívar."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Peer-review reminder check inside the overlay */}
              <div className="mb-6 flex flex-col gap-2 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="text-[9.5px] font-mono text-gray-400 uppercase tracking-widest block font-bold">Bitácora para el Facilitador:</span>
                <p className="text-xs text-neutral-305 leading-relaxed font-sans">
                  Toma un momento para guardar las calificaciones de <strong>logros del grupo</strong> y registrar tus anotaciones específicas de este bloque en la columna derecha antes de continuar.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleContinueNextBlock}
                  className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-neutral-950 font-black px-6 py-3 rounded-xl transition-all text-xs tracking-wider shadow-lg shadow-emerald-500/20 hover:scale-[1.03] active:scale-95 flex items-center gap-1.5 uppercase font-mono"
                >
                  <span>{congratulationsBlock.id === 8 ? "Completar Aventura" : "Iniciar Siguiente Bloque"}</span>
                  <span className="text-lg leading-none">➔</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
