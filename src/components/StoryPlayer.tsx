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
  const [showWelcomeScreen, setShowWelcomeScreen] = useState<boolean>(false);
  const [welcomeTab, setWelcomeTab] = useState<'tutorial' | 'help' | 'play'>('tutorial');
  const [tutorialStep, setTutorialStep] = useState<number>(0);

  // Scene transition modals & teacher panel collapsible states
  const [activeTransitionModal, setActiveTransitionModal] = useState<NarrativeBlock | null>(null);
  const [showTeacherPanel, setShowTeacherPanel] = useState<boolean>(false);

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

  // Visual dynamic particles representing physical cut-out elements
  const [particles, setParticles] = useState<{ id: number; char: string; x: number; y: number; scale: number }[]>([]);
  // Climax state when remaining time in block 8 is <= 15 seconds
  const [isFinalClimax, setIsFinalClimax] = useState<boolean>(false);

  const spawnParticles = (count = 15) => {
    let chars = ["🍃", "🌸", "🍁"];
    if (activeBlock.id === 2) {
      chars = ["🍃", "🌸", "🍁"]; // Tierra: Hojas verdes, flores naranjas
    } else if (activeBlock.id === 3) {
      chars = ["💧", "🫧", "🌊"]; // Agua: Gotas azules, burbujas
    } else if (activeBlock.id === 4) {
      chars = ["🪶", "☁️", "🌬️"]; // Viento: Plumas blancas, nubes pequeñas
    } else if (activeBlock.id === 5 || activeBlock.id === 6) {
      chars = ["✨", "⚡", "✦"]; // Trueno: Chispas moradas
    } else {
      chars = ["⭐", "☀️", "✦"]; // Sol/Default: Estrellas doradas, rayos amarillos
    }

    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      char: chars[Math.floor(Math.random() * chars.length)],
      x: 15 + Math.random() * 70, // random x between 15% and 85% of stage
      y: 80, // starts near Adaggio bottom positions
      scale: 0.7 + Math.random() * 0.8,
    }));

    setParticles(prev => [...prev, ...newParticles]);
    // Remove after animation completes
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 2800);
  };

  const getTeatrilloBackgroundStyle = () => {
    if (isFinalClimax) {
      return {
        background: "linear-gradient(135deg, #FF8C00 0%, #40E0D0 25%, #E1F6FF 50%, #7B68EE 75%, #FFD700 100%)",
        transition: "background 1s ease-in-out"
      };
    }
    switch (activeBlock.id) {
      case 1:
        // Bloque 1: Negro absoluto con vignette gris en bordes
        return {
          background: "radial-gradient(circle, #1a1a1a 0%, #000000 100%)",
          transition: "background 1s ease-in-out"
        };
      case 2:
        // Bloque 2: Tierra (Ocres, marrones cálidos, verdes musgo, naranjas apagados)
        return {
          background: "linear-gradient(to bottom, #755b40 0%, #304d1f 100%)",
          transition: "background 1s ease-in-out"
        };
      case 3:
        // Bloque 3: Agua (Azules turquesa, celestes, verdes agua)
        return {
          background: "linear-gradient(to bottom, #1E90FF 0%, #40E0D0 100%)",
          transition: "background 1s ease-in-out"
        };
      case 4:
        // Bloque 4: Viento (Blancos, grises perla, azules cielo claros, amarillos pálidos)
        return {
          background: "linear-gradient(to bottom, #E1F6FF 0%, #F5F5DC 100%)",
          transition: "background 1s ease-in-out"
        };
      case 5:
      case 6:
        // Bloque 5-6: Trueno (Grises tormenta, morados oscuros, azules noche)
        return {
          background: "linear-gradient(to bottom, #191970 0%, #4B0082 100%)",
          transition: "background 1s ease-in-out"
        };
      case 7:
        // Bloque 7: Sol (Amarillos cálidos, dorados, naranjas luminosos)
        return {
          background: "linear-gradient(to bottom, #FFD700 0%, #FF8C00 100%)",
          transition: "background 1s ease-in-out"
        };
      case 8:
        // Bloque 8: Final. Multi-color soft transition fusionando los 5 tótems (rainbow natural, no saturado)
        return {
          background: "linear-gradient(135deg, #FF8C00 0%, #40E0D0 25%, #E1F6FF 50%, #7B68EE 75%, #FFD700 100%)",
          transition: "background 1.5s ease-in-out"
        };
      default:
        return {
          background: "radial-gradient(circle at center, #26211e 0%, #0d0c0b 100%)",
          transition: "background 1s ease-in-out"
        };
    }
  };

  // Spacebar play/pause keydown listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is typing in notes/inputs, do not hijack Spacebar!
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (activePauseContent) {
          // Suggested pause is active: resume!
          setActivePauseContent(null);
          setIsPlaying(true);
        } else {
          setIsPlaying(prev => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePauseContent]);

  // Global event listener to summon this dashboard from any companion button
  useEffect(() => {
    const handleOpenMenu = (e: Event) => {
      // Smooth scroll to facilitator workspace below
      const element = document.getElementById('facilitator-tactical-workspace');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    };

    const handleStartSession = () => {
      setCurrentTime(0);
      setActiveBlock(NARRATIVE_BLOCKS[0]);
      setIsPlaying(true);
      setTriggeredPauses([]);
      audioInstance.stop();
      audioInstance.start(1, 0);
    };

    const handleSkipToScene = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.blockId) {
        const blockId = customEvent.detail.blockId;
        const block = NARRATIVE_BLOCKS.find(b => b.id === blockId);
        if (block) {
          setCurrentTime(block.durationStart);
          setActiveBlock(block);
          setTriggeredPauses(prev => prev.filter(p => p < block.durationStart));
          setIsPlaying(true);
          audioInstance.stop();
          audioInstance.start(block.id, 0);
        }
      }
    };

    window.addEventListener('open-storyplayer-menu', handleOpenMenu);
    window.addEventListener('storyplayer-start-session', handleStartSession);
    window.addEventListener('storyplayer-skip-to-scene', handleSkipToScene);

    return () => {
      window.removeEventListener('open-storyplayer-menu', handleOpenMenu);
      window.removeEventListener('storyplayer-start-session', handleStartSession);
      window.removeEventListener('storyplayer-skip-to-scene', handleSkipToScene);
    };
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
          const totalDuration = 505; // 8:25 minutes

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

  // Monitor climax state for the final 15 seconds of block 8 or 9
  useEffect(() => {
    if ((activeBlock.id === 8 || activeBlock.id === 9) && isPlaying) {
      const remaining = activeBlock.durationEnd - currentTime;
      if (remaining <= 15 && remaining > 0) {
        setIsFinalClimax(true);
        // Periodically spawn beautiful particles to create a beautiful final magical environment
        if (Math.random() < 0.2) {
          spawnParticles(4);
        }
      } else {
        setIsFinalClimax(false);
      }
    } else {
      setIsFinalClimax(false);
    }
  }, [currentTime, activeBlock, isPlaying]);

  // Trigger magical celebration effects on block completions
  useEffect(() => {
    if (congratulationsBlock) {
      spawnParticles(30);
      try {
        audioInstance.playDrip(true);
      } catch (e) {}
    }
  }, [congratulationsBlock]);

  const handleContinueNextBlock = () => {
    if (!congratulationsBlock) return;

    const nextBlockId = congratulationsBlock.id + 1;
    const nextBlock = NARRATIVE_BLOCKS.find(b => b.id === nextBlockId);

    if (nextBlock) {
      setCongratulationsBlock(null);
      setActiveBlock(nextBlock);
      setCurrentTime(nextBlock.durationStart);
      setIsPlaying(false);
      audioInstance.stop();
      setActiveTransitionModal(nextBlock);
    } else {
      // It was the last block
      setCongratulationsBlock(null);
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
      setIsPlaying(false);
      audioInstance.stop();
      setActiveTransitionModal(block);
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
    const newTime = percentage * 505; // 505 total seconds (8:25)

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

  const activePercent = (currentTime / 505) * 100;

  if (showWelcomeScreen) {
    // Funtionality completely fused into the single light-themed FacilitatorWorkspace dashboard
    return null;
  }

  const renderObsoleteWelcome = () => {
    const isSessionStarted = false;
    const triggerAudioTest = () => {};
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
                              {block.id === 9 && "🌸"}
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
  };

  return (
    <div id="dalcroze-storyplayer-main" className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-150/40 text-slate-800 rounded-xl overflow-hidden p-1 min-h-[580px]">
      
      {/* 9-BLOCKS COMPREHENSIVE ROADMAP (TOP BAR) */}
      <div id="narrative-blocks-flow-roadmap" className="lg:col-span-12 bg-white p-4 rounded-lg flex flex-wrap gap-2 justify-between items-center border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="text-amber-500 w-5 h-5 animate-pulse" />
          <h3 className="text-sm font-semibold tracking-wide text-slate-705 text-slate-700">Ruta de Euritmia (9 Bloques - 8:25 min)</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {NARRATIVE_BLOCKS.map(block => {
            const isActive = activeBlock.id === block.id;
            const isPassed = currentTime >= block.durationEnd;
            return (
              <button
                key={block.id}
                onClick={() => handleSkipToBlock(block.id)}
                style={block.id === 1 ? { backgroundColor: '#af7cec', borderColor: '#e2e8f0', color: '#ffffff' } : undefined}
                className={`px-2.5 py-1.5 text-xs rounded transition-all duration-300 font-medium flex items-center gap-1 border ${
                  isActive
                    ? 'bg-amber-500 text-neutral-950 border-amber-400 font-semibold shadow-md scale-105'
                    : isPassed
                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300 shadow-sm'
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

      {/* LEFT COLUMN: THE MOVEMENT STAGE i.e. THEATRILLO (Col-Span 12 - Fills primary viewport) */}
      <div id="interactive-theater-column" className="lg:col-span-12 flex flex-col gap-4">
        
        {/* PHYSICAL STAGE & CONTROLS UNIFIED UNDER A SINGLE CONTAINER */}
        <div
          id="teatrillo-marionette-stage-frame"
          className="w-full rounded-xl border-4 border-amber-950 overflow-hidden flex flex-col shadow-2xl bg-neutral-950 animate-fade-in"
        >
          {/* THEATRE VISUAL CANVAS / VIEWPORT */}
          <div
            id="theatre-visual-stage"
            className="relative aspect-video w-full overflow-hidden flex flex-col justify-between"
            style={{
              ...getTeatrilloBackgroundStyle(),
              boxShadow: "inset 0 0 85px rgba(0,0,0,0.92)"
            }}
          >
          {/* Cardboard/Paper noise texture overlay for apparent natural puppet theater craft depth */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.05] z-10" xmlns="http://www.w3.org/2000/svg">
            <filter id="paper-noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.25 0" />
              <feComposite operator="in" in2="SourceGraphic" />
            </filter>
            <rect width="100%" height="100%" filter="url(#paper-noise)" />
          </svg>

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

          {/* RENDER POETIC ELEVATION PARTICLES (MOMENTO 1 & MOMENTO 2) */}
          {particles.map(p => (
            <motion.div
              key={p.id}
              className="absolute text-2xl select-none z-20 pointer-events-none"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              initial={{ y: 0, opacity: 1, scale: p.scale }}
              animate={{ y: -180, opacity: 0, x: [0, (Math.random() > 0.5 ? 25 : -25)] }}
              transition={{ duration: 2.3, ease: "easeOut" }}
            >
              {p.char}
            </motion.div>
          ))}

          {/* CLIMAX TYPEWRITER OVERLAY END EVENT (MOMENTO 3) */}
          {isFinalClimax && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-black/55 z-40 flex flex-col justify-center items-center font-sans pointer-events-none"
            >
              <motion.h2 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="text-4xl font-extrabold text-[#FFD700] text-center tracking-tight drop-shadow-lg"
              >
                ¡El Ritmo Regresó!
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 1 }}
                className="text-base text-neutral-200 mt-2 font-bold drop-shadow-md text-center max-w-sm"
              >
                Gracias por ayudar a Adaggio
              </motion.p>
            </motion.div>
          )}

          {/* PARTE 4 - COMPONENTE 1: BARRA DE PROGRESO */}
          <div className="absolute top-12 left-6 z-30 flex gap-1.5">
            {[
              { id: 2, name: "Tierra", color: "#FF8C00", icon: "🌱" },
              { id: 3, name: "Agua", color: "#40E0D0", icon: "💧" },
              { id: 4, name: "Viento", color: "#E1F6FF", icon: "☁️" },
              { id: 5, name: "Trueno", color: "#7B68EE", icon: "⚡" },
              { id: 7, name: "Sol", color: "#FFD700", icon: "⭐" },
            ].map((totem) => {
              const activeId = activeBlock.id;
              let isActive = false;
              let isCompleted = false;

              if (totem.id === 2) {
                isActive = activeId === 2;
                isCompleted = activeId > 2;
              } else if (totem.id === 3) {
                isActive = activeId === 3;
                isCompleted = activeId > 3;
              } else if (totem.id === 4) {
                isActive = activeId === 4;
                isCompleted = activeId > 4;
              } else if (totem.id === 5) {
                isActive = activeId === 5 || activeId === 6;
                isCompleted = activeId > 6;
              } else if (totem.id === 7) {
                isActive = activeId === 7 || activeId === 8;
                isCompleted = activeId > 8 || (activeId === 8 && currentTime >= 450);
              }

              return (
                <motion.div
                  key={totem.id}
                  className={`relative w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs select-none shadow transition-all duration-300 border ${
                    isActive 
                      ? "border-white scale-110 shadow-lg" 
                      : isCompleted 
                      ? "opacity-60 border font-normal" 
                      : "opacity-30 border-dashed border-gray-600"
                  }`}
                  style={{
                    backgroundColor: isActive || isCompleted ? totem.color : "#1a1a1a",
                    borderColor: isActive ? "#ffffff" : isCompleted ? totem.color : "#696969",
                    color: isActive || isCompleted ? "#000000" : "#cccccc"
                  }}
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {isCompleted ? (
                    <span className="text-[11px] text-black font-black">✓</span>
                  ) : (
                    <span className="text-xs">{totem.icon}</span>
                  )}
                  {isActive && (
                    <span className="absolute left-1/2 -translate-x-1/2 top-10 bg-black/90 text-[7px] font-mono text-white px-1 py-0.5 rounded leading-none truncate whitespace-nowrap">
                      {totem.name}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* PARTE 4 - COMPONENTE 2: ÍCONO DE ESTADO */}
          {(() => {
            const isEscucha = activeBlock.stateType === 'NARRATIVO' || activeBlock.stateType === 'DESCANSO' || activeBlock.stateType === 'CONCLUSIÓN';
            return (
              <motion.div
                className={`absolute top-12 right-6 z-30 w-[52px] h-[52px] rounded-full border-[3px] border-white flex flex-col justify-center items-center shadow-lg cursor-pointer ${
                  isEscucha ? "bg-neutral-500" : "bg-emerald-600"
                }`}
                animate={{
                  scale: isPlaying ? [1, 1.04, 1] : 1,
                  rotate: isEscucha ? 0 : 360
                }}
                transition={{
                  scale: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
                  rotate: { type: "spring", stiffness: 70 }
                }}
                title={isEscucha ? "Momento de ESCUCHAR (Quietud)" : "Momento de ACCIÓN (Movimiento)"}
              >
                {isEscucha ? (
                  <span className="text-xl" title="Escucha Grupal">👂</span>
                ) : (
                  <span className="text-xl" title="Acción Física">🏃</span>
                )}
                <span className="text-[6px] uppercase font-bold text-white tracking-widest leading-none mt-0.5 font-sans">
                  {isEscucha ? "Escucha" : "Acción"}
                </span>
              </motion.div>
            );
          })()}

          {/* PARTE 4 - COMPONENTE 3: EQUIVALENCIA ACTIVA (FADE IN/OUT BASED ON ACCIÓN) */}
          <AnimatePresence>
            {(activeBlock.stateType === 'ACCIÓN' || activeBlock.stateType === 'ACCIÓN_DIRECCIÓN') && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 0.9, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute bottom-20 left-6 z-30 w-[200px] h-[72px] bg-white/95 text-black rounded-[10px] p-2 flex items-center justify-between border border-white shadow-xl"
              >
                {/* Sonido */}
                <div className="flex flex-col items-center justify-center w-[40%] text-center">
                  <span className="text-lg select-none">
                    {activeBlock.id === 2 && "🥁"}
                    {activeBlock.id === 3 && "🔔"}
                    {activeBlock.id === 4 && "🌬️"}
                    {activeBlock.id === 5 && "⚡"}
                    {activeBlock.id === 6 && "⚡"}
                    {activeBlock.id === 7 && "🎺"}
                  </span>
                  <span className="text-[8px] uppercase tracking-wide text-zinc-600 leading-none font-bold">
                    {activeBlock.id === 2 && "Bombo"}
                    {activeBlock.id === 3 && "Agudo"}
                    {activeBlock.id === 4 && "Silbido"}
                    {activeBlock.id === 5 && "Rayo"}
                    {activeBlock.id === 6 && "Rayo"}
                    {activeBlock.id === 7 && "Marcha"}
                  </span>
                </div>

                {/* Arrow */}
                <span className="text-zinc-500 font-extrabold text-xs w-[20%] text-center">➔</span>

                {/* Movimiento */}
                <div className="flex flex-col items-center justify-center w-[40%] text-center">
                  <span className="text-lg select-none animate-bounce">
                    {activeBlock.id === 2 && "👣"}
                    {activeBlock.id === 3 && "🙋"}
                    {activeBlock.id === 4 && "👐"}
                    {activeBlock.id === 5 && "🫨"}
                    {activeBlock.id === 6 && "🗿"}
                    {activeBlock.id === 7 && "🦘"}
                  </span>
                  <span className="text-[8px] uppercase tracking-wide text-zinc-600 leading-none font-bold">
                    {activeBlock.id === 2 && "Pisada"}
                    {activeBlock.id === 3 && "Brazo ↑"}
                    {activeBlock.id === 4 && "Brazos"}
                    {activeBlock.id === 5 && "Temblar"}
                    {activeBlock.id === 6 && "Estatua"}
                    {activeBlock.id === 7 && "Salto"}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* PARTE 4 - COMPONENTE 4: MENSAJE PARA EL FACILITADOR (FADE IN NEAR PAUSES) */}
          {(() => {
            const containsPauseNear = activeBlock.suggestedPausas.some(pausa => {
              const globalPValue = activeBlock.durationStart + pausa.time;
              return currentTime >= globalPValue - 4 && currentTime < globalPValue + 4;
            });

            if (!containsPauseNear) return null;

            let messageText = "⚠ PREPARACIÓN: Alistar el espacio de juego";
            if (activeBlock.id === 2) messageText = "⚠ PREPARACIÓN: Confirmar que todos estén de pie";
            else if (activeBlock.id === 3) messageText = "⚠ DISTRIBUIR: 1 Pañuelo azul por estudiante";
            else if (activeBlock.id === 4) messageText = "⚠ MOVIMIENTO: Brazos frente al pecho";
            else if (activeBlock.id === 6) messageText = "⚠ OBSERVACIÓN: ¿Se congelan rápidamente?";
            else if (activeBlock.id === 7) messageText = "⚠ SEGURIDAD: Sostener bastón con dos manos";

            return (
              <motion.div
                initial={{ y: 55, opacity: 0 }}
                animate={{ y: 0, opacity: 0.95 }}
                exit={{ y: 55, opacity: 0 }}
                className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 w-[410px] h-[50px] bg-[#FFC107] text-neutral-950 font-sans font-black text-xs uppercase rounded-lg border-t-2 border-b-2 border-black flex items-center px-4 gap-2 shadow-2xl"
              >
                <span className="text-lg">🖐️</span>
                <span className="text-center font-bold tracking-tight text-[10px] leading-snug flex-1">
                  {messageText}
                </span>
              </motion.div>
            );
          })()}

          {/* PARTE 4 - COMPONENTE 5: TEMPORIZADOR OPCIONAL */}
          {(() => {
            const blockRemaining = activeBlock.durationEnd - currentTime;
            const mins = Math.floor(blockRemaining / 60);
            const secs = Math.floor(blockRemaining % 60);
            const formattedTime = `${mins}:${secs.toString().padStart(2, '0')}`;
            
            let colorBg = "bg-neutral-800/80 border border-neutral-700 text-white";
            if (blockRemaining < 30) {
              colorBg = "bg-red-600/80 border border-red-500 text-white animate-pulse";
            } else if (blockRemaining < 60) {
              colorBg = "bg-yellow-500/80 border border-yellow-400 text-neutral-955";
            }

            return (
              <div className={`absolute bottom-20 right-6 z-30 w-11 h-11 rounded-full flex flex-col justify-center items-center shadow-lg backdrop-blur-sm text-[9.5px] font-mono font-black ${colorBg}`}>
                <span className="leading-none">{formattedTime}</span>
                <span className="text-[5.5px] uppercase font-bold tracking-widest leading-none mt-0.5 opacity-80">Rem</span>
              </div>
            );
          })()}

          {/* ACTIVE ADAGGIO PUPPET IN STAGE CENTER */}
          <div id="marionette-adaggio-centerfold" className="flex-1 flex justify-center items-end pb-4 relative z-10 mt-10">
            <AdaggioPuppet
              animationState={
                isFinalClimax 
                  ? "bow" 
                  : congratulationsBlock 
                  ? "bow" 
                  : activeBlock.adaggioAnimationState
              }
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
          <div id="theatre-digital-transcripts" className="bg-neutral-900/95 border-t border-neutral-800 p-3 min-h-[68px] flex flex-col justify-center items-center z-20 gap-1 backdrop-blur animate-fade-in">
            <p className="text-amber-500 text-[10.5px] font-bold uppercase tracking-widest font-mono">
              Narrador (Escucha Grupal)
            </p>
            <p className="text-gray-100 text-[13px] text-center font-sans tracking-wide leading-relaxed max-w-xl">
              "{activeBlock.narratorLines}"
            </p>
          </div>
        </div> {/* CLOSE THEATRE VISUAL CANVAS / VIEWPORT */}

        {/* TIMELINE CONTROLLER BAR & CONTROLS */}
        <div id="media-timeline-dashboard" className="bg-neutral-950 border-t border-neutral-800/80 p-4 flex flex-col gap-3">
          
          {/* Timeline and duration badges */}
          <div className="flex justify-between items-center text-xs font-mono text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">
              {activeBlock.name} — {activeBlock.title}
            </span>
            <span>8:25</span>
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
                style={{ left: `${(point / 505) * 100}%` }}
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
        </div> {/* CLOSE TIMELINE CONTROLLER BAR & CONTROLS */}

      </div> {/* CLOSE PHYSICAL STAGE & CONTROLS UNIFIED */}

    </div> {/* CLOSE INTERACTIVE THEATER COLUMN */}

    {/* COLLAPSIBLE ACCONT DOCENTE - BITÁCORA DOCENTE DE MONTE TABOR */}
    <div id="teacher-collapsible-accordion-wrapper" className="lg:col-span-12 w-full mt-4 mb-8">
      <button
        id="toggle-teacher-panel-acc"
        type="button"
        onClick={() => setShowTeacherPanel(prev => !prev)}
        className="w-full py-4 px-6 bg-white hover:bg-slate-50 border border-slate-300 rounded-2xl flex justify-between items-center text-slate-800 font-extrabold font-sans text-xs uppercase shadow-md transition-all focus:ring-2 focus:ring-amber-500 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4.5 h-4.5 text-amber-500" />
          <span>📊 {showTeacherPanel ? "Ocultar panel de bitácora y calificaciones" : "Ver Bitácora y Evaluaciones Docentes (Opcional)"}</span>
        </div>
        <span className="font-mono text-zinc-500 font-extrabold">{showTeacherPanel ? "▲" : "▼"}</span>
      </button>

      <AnimatePresence>
        {showTeacherPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-4"
          >
            <div id="mediation-companion-column" className="flex flex-col gap-4 w-full">
              
              {/* TAB CONTROLLER DECK FOR HIGH-PRECISION WIREFRAME CONSOLE */}
        <div className="flex flex-wrap gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setRightActiveTab('guide')}
            className={`flex-1 min-w-[70px] py-1.5 rounded-lg transition-all flex flex-col items-center justify-center gap-1 border border-transparent ${
              rightActiveTab === 'guide'
                ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400'
                : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50 border-transparent'
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
                : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50 border-transparent'
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
                : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50 border-transparent'
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
                : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50 border-transparent'
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
                : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50 border-transparent'
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
            <div id="cue-verbal-pulpit" className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col gap-3 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-yellow-500/10 to-transparent pointer-events-none" />
              
              <div className="flex items-center gap-2 text-left">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <h4 className="text-xs uppercase font-bold text-amber-600 font-mono tracking-wider">
                  Guía del Tutor (Ciudad Bolívar Context)
                </h4>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/65 text-left">
                <p className="text-[10px] font-mono text-slate-400 uppercase">Consigna verbal sugerida para vocear en el salón:</p>
                <p className="text-slate-700 text-xs mt-1.5 italic font-medium leading-relaxed">
                  "{activeBlock.narratorLines.split('.').slice(2).join('.') || activeBlock.narratorLines}"
                </p>
              </div>

              <div className="text-left">
                <p className="text-[10px] font-mono text-amber-600 uppercase font-black tracking-wider">Acción Física del Tutor/Facilitador:</p>
                <p className="text-slate-700 text-xs mt-1 leading-relaxed border-l-2 border-amber-600 pl-2.5">
                  💡 {activeBlock.facilitatorCue}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded border border-slate-200/60 text-left">
                <div>
                  <span className="text-[9.5px] font-mono text-slate-400 block">Objetivo Pedagógico:</span>
                  <span className="text-slate-600 font-sans">{activeBlock.pedagogicalObjective}</span>
                </div>
                <div>
                  <span className="text-[9.5px] font-mono text-slate-400 block">Concepto Dalcroze:</span>
                  <span className="text-slate-600 font-sans">{activeBlock.rhythmicConcept}</span>
                </div>
              </div>
            </div>

            {/* LIVE REAL-TIME OBSERVABLES SCENARIO */}
            <div id="observables-tracker-box" className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2.5 text-left">
                  <h4 className="text-xs font-bold text-slate-800 tracking-wider font-mono uppercase">
                    Observables del Bloque {activeBlock.id}
                  </h4>
                  <span className="text-[10px] text-slate-400">¿Qué observar en los niños?</span>
                </div>

                <div className="flex flex-col gap-2.5 text-left font-sans">
                  {activeBlock.observables.map(obs => {
                    const currentRating = evaluations.find(e => e.blockId === activeBlock.id)?.[obs.id === 'pulse_sync' || obs.id === 'pitch_discrimination' || obs.id === 'dynamic_scaling' || obs.id === 'sudden_contrast' || obs.id === 'stealth_pulse_walk' || obs.id === 'accent_jump' ? 'rhythmSinc' : 'understanding'] || 3;
                    
                    return (
                      <div key={obs.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-col gap-1 hover:border-slate-300 transition-all font-sans">
                        <div>
                          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                            <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
                            {obs.label}
                          </span>
                          <p className="text-[11px] text-slate-500 mt-1 pl-5 leading-normal font-sans">
                            {obs.description}
                          </p>
                        </div>

                        {/* Quick Evaluators scale */}
                        <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t border-slate-200 pl-5">
                          <span className="text-[9.5px] font-mono text-slate-400 uppercase">Logro del grupo:</span>
                          <div className="flex gap-1 font-sans">
                            {[
                              { val: 1, label: 'Bajo', color: 'hover:bg-red-50 hover:text-red-600', activeCol: 'bg-red-50 text-red-600 border-red-250' },
                              { val: 2, label: 'Medio', color: 'hover:bg-amber-50 hover:text-amber-600', activeCol: 'bg-amber-50 text-amber-600 border-amber-250' },
                              { val: 3, label: 'Excelente', color: 'hover:bg-emerald-50 hover:text-emerald-600', activeCol: 'bg-emerald-50 text-emerald-600 border-emerald-250' }
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
                                      : 'bg-white text-slate-400 border-slate-200 ' + rating.color
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
                  className="w-full text-xs p-2 rounded bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 h-14 resize-none font-sans"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CLASSROOM PREP LIST & SOUND SANDBOX TRIGGER BOARD */}
        {rightActiveTab === 'prep' && (
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col gap-4 shadow-sm flex-1">
            
            {/* SCENIC CHECKLIST INSIDE TAB */}
            <div className="text-left font-sans">
              <div className="flex items-center gap-1.5 mb-2 font-mono">
                <ClipboardList className="text-amber-550 w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold uppercase tracking-wide text-slate-750 text-slate-800">
                  Lista de Alistamiento Físico de Aula
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 mb-2 leading-relaxed font-sans">
                Marca estas verificaciones necesarias en el salón de la fundación antes o durante la reproducción:
              </p>

              <div className="grid grid-cols-2 gap-2">
                {/* Checkbox Scarves */}
                <div
                  onClick={() => setCheckedScarves(!checkedScarves)}
                  className={`p-2 rounded-lg border cursor-pointer select-none transition-all flex items-center gap-2 ${
                    checkedScarves ? 'bg-emerald-50 border-emerald-250 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center font-mono text-[9px] ${checkedScarves ? 'bg-emerald-500 text-white font-bold border-transparent' : 'border-slate-300'}`}>
                    {checkedScarves ? '✓' : ''}
                  </div>
                  <div className="truncate font-sans">
                    <span className="text-[10px] font-bold block leading-tight text-slate-700">15 Pañuelos</span>
                    <span className="text-[8.5px] text-slate-400 block leading-tight">Material Agua (Azules)</span>
                  </div>
                </div>

                {/* Checkbox Sticks */}
                <div
                  onClick={() => setCheckedSticks(!checkedSticks)}
                  className={`p-2 rounded-lg border cursor-pointer select-none transition-all flex items-center gap-2 ${
                    checkedSticks ? 'bg-emerald-50 border-emerald-250 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center font-mono text-[9px] ${checkedSticks ? 'bg-emerald-500 text-white font-bold border-transparent' : 'border-slate-300'}`}>
                    {checkedSticks ? '✓' : ''}
                  </div>
                  <div className="truncate font-sans">
                    <span className="text-[10px] font-bold block leading-tight text-slate-700">15 Bastones</span>
                    <span className="text-[8.5px] text-slate-400 block leading-tight">Material Sol (Bastón)</span>
                  </div>
                </div>

                {/* Checkbox Quiet */}
                <div
                  onClick={() => setCheckedQuiet(!checkedQuiet)}
                  className={`p-2 rounded-lg border cursor-pointer select-none transition-all flex items-center gap-2 col-span-2 ${
                    checkedQuiet ? 'bg-emerald-50 border-emerald-250 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center font-mono text-[9px] ${checkedQuiet ? 'bg-emerald-500 text-white font-bold border-transparent' : 'border-slate-300'}`}>
                    {checkedQuiet ? '✓' : ''}
                  </div>
                  <div className="font-sans font-sans">
                    <span className="text-[10px] font-bold block leading-tight text-slate-700">Espacio de 3x3 metros Libre</span>
                    <span className="text-[8.5px] text-slate-400 block leading-tight mt-0.5">Mover pupitres y sillas para despejar el centro</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SOUND TEST / SANDBOX CONTROLLERS inside Tab */}
            <div className="border-t border-slate-200 pt-3 flex flex-col gap-2 text-left font-sans">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-mono">
                  <Volume2 className="text-amber-500 w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wide text-slate-800">
                    Banco de Sonidos & Sonos Pruebas
                  </h4>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-mono border border-emerald-200 font-bold uppercase">Sintetizador OK</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal mb-1 font-sans">
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
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-start gap-0.5 text-left active:scale-[0.98] transition-all font-sans"
                >
                  <span className="text-[10px] font-bold text-amber-600 font-mono flex items-center gap-1 font-sans">🪘 Tierra • Grave</span>
                  <span className="text-[8.5px] text-slate-400">Pulsar BOM! rítmico pesado</span>
                </button>

                {/* Water Pitch sounds */}
                <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg flex flex-col gap-1 text-left font-sans">
                  <span className="text-[10px] font-bold text-cyan-600 font-mono">💧 Agua • Tonos</span>
                  <div className="grid grid-cols-2 gap-1.5 font-sans animate-none">
                    <button
                      type="button"
                      onClick={() => {
                        audioInstance.playDrip(true);
                        setSoundTestSuccess(true);
                      }}
                      className="bg-cyan-50 hover:bg-cyan-100 text-[9px] text-cyan-700 py-0.5 rounded font-mono font-bold text-center"
                    >
                      Agudo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        audioInstance.playDrip(false);
                        setSoundTestSuccess(true);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-[9px] text-slate-650 text-slate-600 py-0.5 rounded font-mono font-bold text-center"
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
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-start gap-0.5 text-left active:scale-[0.98] transition-all font-sans"
                >
                  <span className="text-[10px] font-bold text-slate-700 font-mono">💨 Viento • Dinámica</span>
                  <span className="text-[8.5px] text-slate-400">Arpegio Piano a Forte</span>
                </button>

                {/* Lightning Explosion */}
                <button
                  type="button"
                  onClick={() => {
                    audioInstance.playLightning();
                    setSoundTestSuccess(true);
                  }}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-start gap-0.5 text-left active:scale-[0.98] transition-all font-sans"
                >
                  <span className="text-[10px] font-bold text-indigo-600 font-mono">⚡ Trueno • Choque</span>
                  <span className="text-[8.5px] text-slate-400">Emisión de descarga súbita</span>
                </button>

                {/* Sun military march acento */}
                <button
                  type="button"
                  onClick={() => {
                    audioInstance.playMarchSnare(true);
                    audioInstance.playBom();
                    setSoundTestSuccess(true);
                  }}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-lg flex flex-col items-start gap-0.5 text-left active:scale-[0.98] transition-all col-span-2 font-sans"
                >
                  <span className="text-[10px] font-bold text-yellow-600 font-mono flex items-center justify-between w-full font-sans">
                    <span>☀️ Sol • Acento y Marcha 4/4</span>
                    <span className="text-[7.5px] text-slate-400 font-normal">Bastones</span>
                  </span>
                  <span className="text-[8.5px] text-slate-400">Pulso militar robusto ideal para saltar y percutir al caer</span>
                </button>
              </div>
            </div>

            {/* MANUAL GROUP CLASSROOM CELEBRATION BUTTON (SIN PUNTOS, SOLO ESFUERZO) */}
            <div className="border-t border-slate-200 pt-3 flex flex-col gap-2 text-left font-sans">
              <span className="text-[10px] font-mono font-bold text-slate-405 text-slate-400 uppercase tracking-widest block">Celebración de Participación Colectiva:</span>
              <button
                type="button"
                onClick={() => {
                  // Trigger magical elevation particles in theater
                  spawnParticles(25);
                  // Sound high quality chime water note
                  try {
                    audioInstance.playDrip(true);
                  } catch(e) {}
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-black px-4 py-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 uppercase font-mono text-xs"
              >
                <span>¡Celebrar Participación Grupal 🌸!</span>
                <span className="text-sm">(Sin Puntos, Solo Esfuerzo)</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: SPATIAL BLUEPRINT MAP 3X3 */}
        {rightActiveTab === 'map' && (
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col gap-4 shadow-sm flex-1">
            <div className="flex items-center gap-1.5 mb-1.5 text-left font-mono">
              <Map className="text-amber-550 w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Plano Geográfico de Aula</h4>
            </div>

            {/* Direct Vector schematic graph */}
            <div className="w-full aspect-video bg-slate-50 rounded-xl border border-slate-200 p-3 pt-4 original-aspect relative flex flex-col justify-between overflow-hidden shadow-inner font-sans">
              <div className="text-[8px] font-mono text-amber-650 text-center border-b border-slate-200 pb-1 uppercase tracking-wide font-sans">
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
                  <div className="flex flex-col items-center border border-amber-500/20 bg-amber-50 p-1 rounded font-sans">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-905 text-[10px] flex items-center justify-center font-bold font-mono">★</span>
                  </div>
                  <div className="flex flex-col items-center font-sans">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 border border-white text-white font-mono text-[9px] flex items-center justify-center font-bold">N3</span>
                  </div>
                </div>

                {/* Facilitator role */}
                <div className="flex flex-col items-center bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded leading-tight">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-mono font-bold text-[8.5px] flex items-center justify-center">T</span>
                  <span className="text-[7px] text-blue-600 font-bold uppercase mt-0.5 font-mono">Tutor</span>
                </div>
              </div>

              <div className="text-[8px] font-mono text-slate-400 text-center uppercase tracking-wider">
                Dimensiones mínimas: Área libre de 3x3 metros de diámetro
              </div>
            </div>

            <div className="flex flex-col gap-2.5 text-xs text-slate-600 leading-normal font-sans text-left">
              <div>
                <strong className="text-slate-800 text-[11px] block text-left">Disposición Recomendada de Alumnos:</strong>
                <p className="text-[10.5px] text-slate-500 mt-1">
                  Reúne a los niños en un semicírculo simétrico mirando la pantalla. El tutor se posiciona en un lateral o al frente como modelo rítmico para animar el levantamiento coordinado de talones y brazos.
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded text-[10px] text-amber-600 font-mono text-left">
                💡 <span className="font-bold text-slate-700 font-sans">Tip Dalcroze:</span> Si notas cansancio o dispersión del grupo durante la tormenta del Trueno, llévalos al Punto Seguro (★) para hacer respiraciones colectivas lentas.
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
          </motion.div>
        )}
      </AnimatePresence>

    </div> {/* CLOSE COLLAPSIBLE ACCONT DOCENTE */}

      {/* DETAILED PEDAGOGICAL SUGGESTED PAUSE FULLSCREEN MODAL OVERLAY */}
      <AnimatePresence>
        {activePauseContent && (() => {
          const details = (() => {
            switch (activeBlock.id) {
              case 2:
                return {
                  title: "PREPARACIÓN: BLOQUE TIERRA",
                  borderColor: "border-[#FF8C00]",
                  barColor: "#FF8C00",
                  iconEmoji: "🧍",
                  checks: [
                    "Confirmar que todos los niños estén de pie.",
                    "Dividirlos dejando suficiente espacio entre cada uno.",
                    "Verificar que puedan ver a Adaggio sin obstrucciones."
                  ],
                  iconLabel: "Siluetas de niños de pie en círculo amplio",
                  actionBtnText: "Todos listos ➔ ESPACIO"
                };
              case 3:
                return {
                  title: "PREPARACIÓN: BLOQUE AGUA",
                  borderColor: "border-[#40E0D0]",
                  barColor: "#40E0D0",
                  iconEmoji: "🧣",
                  checks: [
                    "Distribuir 1 pañuelo azul para cada niño.",
                    "Sugerir sostenerlo estirándolo suavemente.",
                    "Comprobar que todos los niños tengan su pañuelo listo."
                  ],
                  iconLabel: "Mano sosteniendo pañuelo azul ondulante",
                  actionBtnText: "Pañuelos listos ➔ ESPACIO"
                };
              case 4:
                return {
                  title: "PREPARACIÓN: BLOQUE VIENTO",
                  borderColor: "border-[#D1F1FF]",
                  barColor: "#E1F6FF",
                  iconEmoji: "👐",
                  checks: [
                    "Sugerir soltar temporalmente el pañuelo azul.",
                    "Demostrar la postura de brazos frente al pecho.",
                    "Incentivar la imitación de respiración rítmica."
                  ],
                  iconLabel: "Brazos de pie en posición inicial",
                  actionBtnText: "Postura adoptada ➔ ESPACIO"
                };
              case 6:
                return {
                  title: "AYUDA: CONGELAMIENTO",
                  borderColor: "border-[#7B68EE]",
                  barColor: "#7B68EE",
                  iconEmoji: "🗿",
                  checks: [
                    "Practicar el congelamiento estático antes de jugar.",
                    "Vocalizar: '¡Cuando diga RAYO, todos estatua!'",
                    "Mantenerse rígido y quieto por 3 segundos enteros.",
                    "¡Increíble! Continuemos ahora con el video."
                  ],
                  iconLabel: "Silueta rígida con estrellas de quietud",
                  actionBtnText: "Quietud Practicada ➔ ESPACIO"
                };
              case 7:
                return {
                  title: "PREPARACIÓN: BLOQUE SOL",
                  borderColor: "border-[#FFD700]",
                  barColor: "#FFD700",
                  iconEmoji: "🪵",
                  checks: [
                    "Distribuir 1 bastón o palo de madera simulada por niño.",
                    "Sostener el bastón con ambas manos rítmicamente.",
                    "Prevenir accidentes: recordar mantener distancia del de al lado.",
                    "Asegurar que todos los niños tengan su bastón listo."
                  ],
                  iconLabel: "Niño sosteniendo bastón vertical con ambas manos",
                  actionBtnText: "Bastones listos ➔ ESPACIO"
                };
              default:
                return {
                  title: "PAUSA PEDAGÓGICA REQUERIDA",
                  borderColor: "border-amber-500",
                  barColor: "#FFC107",
                  iconEmoji: "📋",
                  checks: [
                    "Enseña el movimiento exagerando alturas o dinámicas.",
                    "Asegura que todos los niños tengan el material listo."
                  ],
                  iconLabel: "Tutor orientando físicamente al grupo escolar",
                  actionBtnText: "Continuar ➔ ESPACIO"
                };
            }
          })();

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
            >
              {/* Central pulsing pause icon behind or above the message card */}
              <motion.div
                onClick={() => {
                  setActivePauseContent(null);
                  setIsPlaying(true);
                }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                className="w-14 h-14 bg-white text-black text-xl font-bold font-mono rounded-full flex items-center justify-center shadow-2xl mb-5 hover:scale-105 active:scale-95 transition-transform duration-150 cursor-pointer"
                title="Pulsar para reanudar"
              >
                ||
              </motion.div>

              <motion.div
                initial={{ scale: 0.93, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.93, y: 15 }}
                className="bg-white/95 text-neutral-900 shadow-2xl rounded-[15px] w-full max-w-[600px] p-6 relative border-t-8"
                style={{ borderTopColor: details.barColor }}
              >
                <div className="flex gap-4 items-start mb-4">
                  {/* Left-side visual illustration */}
                  <div className="flex flex-col items-center gap-1.5 w-24">
                    <div className="w-20 h-20 bg-neutral-100 rounded-full border border-neutral-200/50 flex items-center justify-center text-4xl select-none">
                      {details.iconEmoji}
                    </div>
                    {/* Explicative label underneath */}
                    <span className="text-[7.5px] font-mono text-neutral-400 uppercase text-center font-bold tracking-tight leading-normal">
                      {details.iconLabel}
                    </span>
                  </div>

                  {/* Right side instruction content */}
                  <div className="flex-1 text-left">
                    <h2 className="text-xl font-extrabold text-black font-sans leading-tight tracking-tight mb-2 uppercase">
                      {details.title}
                    </h2>

                    <p className="text-xs text-neutral-600 font-sans leading-normal mb-4 font-normal">
                      {activePauseContent}
                    </p>

                    {/* Core checklist criteria (wcag safe readable contrast) */}
                    <div className="mb-4 bg-neutral-50 p-3 rounded-lg border border-neutral-200 text-left flex flex-col gap-2">
                      <span className="text-[9.5px] font-mono font-bold text-neutral-400 uppercase tracking-widest block">Lista de Verificación de Aula:</span>
                      {details.checks.map((checkpoint, chkIdx) => (
                        <div key={chkIdx} className="text-xs text-neutral-705 flex items-start gap-1.5 leading-tight font-medium">
                          <span className="text-emerald-600 font-extrabold select-none">✓</span>
                          <span>{checkpoint}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Horizontal Divider */}
                <div className="border-t border-neutral-100 my-4" />

                {/* Footer and play action */}
                <div className="flex justify-between items-center bg-neutral-50 p-2.5 rounded-lg border border-neutral-200/50">
                  <span className="text-[9.5px] font-mono text-neutral-400 leading-none">
                    🔑 Control: Pulsar <strong>ESPACIO</strong> o botón ▶
                  </span>

                  <button
                    onClick={() => {
                      setActivePauseContent(null);
                      setIsPlaying(true);
                    }}
                    className="bg-neutral-900 border border-neutral-800 text-white hover:bg-black font-black font-sans text-xs uppercase px-5 py-2.5 rounded-lg shadow active:scale-95 transition-all tracking-wide"
                  >
                    {details.actionBtnText}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
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
                <div className="p-3 bg-emerald-500/15 rounded-full border border-emerald-500/35 animate-bounce">
                  <span className="text-3xl leading-none block select-none">
                    {congratulationsBlock.id >= 8 ? "🏆" : "🎉"}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-emerald-400 font-sans tracking-tight uppercase leading-snug">
                    {congratulationsBlock.id === 9 ? "¡Fin de la Experiencia con Adaggio! 🌸" :
                     congratulationsBlock.id === 8 ? "¡El Ritmo Universal ha regresado! 🌍" : `¡El Ritmo de la ${
                      congratulationsBlock.id === 1 ? "Escucha" :
                      congratulationsBlock.id === 2 ? "Tierra 🌾" :
                      congratulationsBlock.id === 3 ? "Agua 🌊" :
                      congratulationsBlock.id === 4 ? "Viento 🌬️" :
                      congratulationsBlock.id === 5 || congratulationsBlock.id === 6 ? "Quietud ⚡" :
                      "Sol ☀️"
                    } ha regresado!`}
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">
                    {congratulationsBlock.id === 9 ? "Logro Absoluto: ¡Mensaje motivador para los niños!" : "Felicidades: El ritmo del elemento ha regresado con éxito"}
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
                    {congratulationsBlock.id === 9 && "🌺"}
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-300 text-sm font-sans mb-1 uppercase tracking-wide">
                      {congratulationsBlock.name}
                    </h4>
                    <p className="text-xs text-neutral-400 italic mb-2">
                      “{congratulationsBlock.title}”
                    </p>
                    <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans mt-2 font-medium text-justify">
                      {congratulationsBlock.id === 1 && "¡Súper comienzo! Han despertado la magia de Adaggio y preparado el salón de euritmia con una escucha grandiosa."}
                      {congratulationsBlock.id === 2 && "¡Increíble esfuerzo! Conseguimos sintonizar los pies de todo el grupo con el pulso profundo de la tierra y sembrar al ritmo del BOM."}
                      {congratulationsBlock.id === 3 && "¡Qué fluidez! Los movimientos de pañuelos arriba y abajo sintieron el caudal del arroyo con una armonía maravillosa."}
                      {congratulationsBlock.id === 4 && "¡Magnífico! Controlaron su respiración expandiendo la energía corporal suavemente, de piano a forte, sintiendo el viento."}
                      {congratulationsBlock.id === 5 && "¡Excelente reacción! Lograron sintonizar la reacción ágil ante el rayo y la calma silenciosa del reposo."}
                      {congratulationsBlock.id === 6 && "¡Gran concentración grupal! Caminaron en puntillas de pies coordinados, dominando la marcha silenciosa del sigilo nocturno."}
                      {congratulationsBlock.id === 7 && "¡Insuperable energía colectiva! Alzaron los bastones rústicos de madera coordinando un compás alegre bajo el Sol radiante."}
                      {congratulationsBlock.id === 8 && "¡LO LOGRARON EN CIUDAD BOLÍVAR! Todos los tótems de la naturaleza brillan. Adaggio y la Fundación Monte Tabor brillan con alegría eurítmica pública, celebrando el puro esfuerzo grupal."}
                      {congratulationsBlock.id === 9 && "¡LOS CORAZONES BRILAN EN SINTONÍA! Adaggio les susurra una gran verdad: El gran ritmo no estaba dormido en el teatrillo, sino latiendo dentro de cada uno de ustedes. Con sus manos compartiendo amor, sus pies marchando firmes y su alegría compartida, ¡son los custodios de la música y la paz en su comunidad! ¡Felicitaciones pequeños valientes! 🌸"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bitácora reminder check inside the overlay */}
              <div className="mb-6 flex flex-col gap-2 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="text-[9.5px] font-mono text-gray-400 uppercase tracking-widest block font-bold">Bitácora para el Facilitador:</span>
                <p className="text-xs text-neutral-300 leading-relaxed font-sans font-medium">
                  {congratulationsBlock.id === 9 ? "Han alcanzado el fin de la ruta interactiva. Guarda la bitácora final en la tarjeta de registros." : "Tomen un respiro para celebrar la participación. Guardar las calificaciones cualitativas de logros y esfuerzo del grupo en la columna derecha antes de avanzar."}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleContinueNextBlock}
                  className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-neutral-950 font-black px-6 py-3 rounded-xl transition-all text-xs tracking-wider shadow-lg shadow-emerald-500/20 hover:scale-[1.03] active:scale-95 flex items-center gap-1.5 uppercase font-mono"
                >
                  <span>{congratulationsBlock.id === 9 ? "Completar Aventura 🌸" : "Iniciar Siguiente Bloque"}</span>
                  <span className="text-lg leading-none">➔</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TRANSITION SCENE PREPARATION AND RESET PAUSE MODAL */}
      <AnimatePresence>
        {activeTransitionModal && (() => {
          const details = (() => {
            switch (activeTransitionModal.id) {
              case 1:
                return {
                  title: "Inicio: Escucha Atenta",
                  materials: ["Solo tu mente y sintonía grupal"],
                  pauseTitle: "Preparar la Mente",
                  pauseText: "Respiren hondo y escuchen el silencio que nos rodea. El salón se calma...",
                  iconEmoji: "🎼",
                  color: "#af7cec"
                };
              case 2:
                return {
                  title: "Tierra: El Gran Pulso",
                  materials: ["Pies libres para marchar rítmicamente"],
                  pauseTitle: "Preparar las Piernas",
                  pauseText: "Muevan suavemente los hombros, rodillas y tobillos para prepararse para marchar.",
                  iconEmoji: "🌱",
                  color: "#6B8E23"
                };
              case 3:
                return {
                  title: "Agua: Gotas y Río Caudaloso",
                  materials: ["🧣 Un pañuelo o trapo azul ligero (1 por niño)"],
                  pauseTitle: "Preparar los Brazos",
                  pauseText: "Distribuyan los pañuelos azules. Ondeen los brazos altos como nubes antes de iniciar.",
                  iconEmoji: "💧",
                  color: "#40E0D0"
                };
              case 4:
                return {
                  title: "Viento: El Sonido del Aire",
                  materials: ["Solo tus brazos libres y tu respiración"],
                  pauseTitle: "Respiración Profunda",
                  pauseText: "Inhalen aire despacio sintiendo el tórax expandirse, luego exhalen vaciándolo.",
                  iconEmoji: "🌬️",
                  color: "#87CEEB"
                };
              case 5:
                return {
                  title: "Trueno Parte 1: El Rayo Eléctrico",
                  materials: ["Cuerpo libre y reacción rápida"],
                  pauseTitle: "Liberar Tensiones",
                  pauseText: "Sacudan todo el cuerpo vigorosamente para soltar miedos antes del trueno.",
                  iconEmoji: "⚡",
                  color: "#7B68EE"
                };
              case 6:
                return {
                  title: "Trueno Parte 2: El Juego del Sigilo",
                  materials: ["Cuerpo libre para caminar flotando"],
                  pauseTitle: "Equilibrio y Calma",
                  pauseText: "Sostengan el equilibrio en un solo pie por 5 segundos. ¡Listos para ser estatuas!",
                  iconEmoji: "👣",
                  color: "#4B0082"
                };
              case 7:
                return {
                  title: "Sol: La Marcha de la Luz",
                  materials: ["🥖 Un bastón o palo de madera ligero (1 por niño)"],
                  pauseTitle: "Verificación de Seguridad",
                  pauseText: "Asegúrense de que haya suficiente espacio entre niños. Sujeten el bastón firme con ambas manos.",
                  iconEmoji: "☀️",
                  color: "#FFD700"
                };
              case 8:
                return {
                  title: "Final de Acción: El Ritmo Encontrado",
                  materials: ["Cuerpo libre para celebrar"],
                  pauseTitle: "Regreso a la Calma",
                  pauseText: "Estiren los brazos amplios hacia el cielo y dejen caer los hombros relajados con alegría.",
                  iconEmoji: "🌍",
                  color: "#FF69B4"
                };
              case 9:
                return {
                  title: "Final: El Mensaje de Adaggio",
                  materials: ["Semicírculo de calidez grupal"],
                  pauseTitle: "Cerrar los Ojos",
                  pauseText: "Busquemos un asiento super cómodo en el suelo para escuchar el susurro final amoroso de Adaggio.",
                  iconEmoji: "🌺",
                  color: "#FF1493"
                };
              default:
                return {
                  title: "Siguiente Escena",
                  materials: ["Cuerpo libre"],
                  pauseTitle: "Tomar un Respiro",
                  pauseText: "Respiren hondo y disfruten la música.",
                  iconEmoji: "✨",
                  color: "#f59e0b"
                };
            }
          })();

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-neutral-900 border-2 rounded-3xl w-full max-w-xl p-6 md:p-8 shadow-2xl text-white overflow-hidden relative"
                style={{ borderColor: details.color }}
              >
                {/* Subtle light aura */}
                <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full blur-3xl opacity-20" style={{ backgroundColor: details.color }} />

                {/* Level Passed Banner / Next Scene */}
                <div className="mb-4 text-left">
                  <span className="px-3 py-1 bg-white/5 border text-[10px] font-mono font-bold tracking-widest uppercase rounded-full" style={{ color: details.color, borderColor: `${details.color}33` }}>
                    🚀 Siguiente Escena / Nivel
                  </span>
                  <h1 className="text-2xl md:text-3xl font-black mt-2 font-sans tracking-tight uppercase">
                    {details.title}
                  </h1>
                </div>

                <div className="space-y-5 my-6 text-left">
                  {/* 1. Physical Objects required checklist */}
                  <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                    <span className="text-[10.5px] uppercase font-mono font-black text-neutral-400 block">
                      🎒 Elementos rítmicos requeridos:
                    </span>
                    <div className="flex items-center gap-3 mt-2 text-sm font-semibold">
                      <span className="text-2xl leading-none">{details.iconEmoji}</span>
                      <span>{details.materials[0]}</span>
                    </div>
                  </div>

                  {/* 2. Active Pause Section */}
                  <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/15">
                    <span className="text-[10px] uppercase font-mono font-black text-amber-500 block">
                      🧘 Momento de descansar y preparar el cuerpo:
                    </span>
                    <h4 className="text-sm font-black text-amber-400 mt-1 uppercase font-sans">
                      {details.pauseTitle}
                    </h4>
                    <p className="text-xs text-neutral-300 leading-relaxed mt-1 font-medium font-sans">
                      {details.pauseText}
                    </p>
                  </div>
                </div>

                {/* Trigger Play button */}
                <div className="flex justify-end gap-3 mt-6 border-t border-neutral-850 pt-5">
                  <button
                    onClick={() => {
                      setActiveTransitionModal(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 transition-all font-mono text-xs font-semibold text-neutral-400"
                  >
                    Cerrar Vista
                  </button>
                  <button
                    id="start-scene-btn"
                    onClick={() => {
                      setActiveTransitionModal(null);
                      setIsPlaying(true);
                      audioInstance.stop();
                      audioInstance.start(activeTransitionModal.id, 0);
                    }}
                    style={{ backgroundColor: details.color }}
                    className="px-6 py-3 rounded-xl text-neutral-950 font-black font-sans text-xs tracking-wider shadow-lg uppercase transition-transform active:scale-95 hover:brightness-110 flex items-center gap-2"
                  >
                    <span>¡Comenzar Escena!</span>
                    <span className="text-lg font-bold">➔</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
};
