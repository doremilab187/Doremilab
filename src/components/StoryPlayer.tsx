/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, 
  BookOpen, Upload, Video, Award, ChevronLeft, ChevronRight, HelpCircle,
  Maximize2, Minimize2, Volume1
} from 'lucide-react';
import { NarrativeBlock, SessionEvaluation } from '../types';
import { NARRATIVE_BLOCKS } from '../data/narrativeBlocks';
import { audioInstance } from '../utils/AudioEngine';
import { AdaggioPuppet } from './AdaggioPuppet';

interface StoryPlayerProps {
  onSessionComplete?: (evaluations: SessionEvaluation[]) => void;
}

const BRIEF_PHRASES: Record<number, string> = {
  1: "El gran ritmo se ha dormido y el silencio rodea a Adaggio... ¡Prepárate para entrar!",
  2: "¡Camina con paso firme y siembra las semillas siguiendo el pulso de la tierra!",
  3: "Hagamos bailar los pañuelos azules: arriba en los agudos, abajo en los graves.",
  4: "Siente el viento soplar suave frente al pecho y ábrelo con gran fuerza.",
  5: "¡La tormenta eléctrica ha vuelto! Muévete como el viento y vibra con el rayo.",
  6: "Camina con sigilo en puntillas de pie. Si suena el trueno seco, ¡conviértete en estatua!",
  7: "¡Marchemos con orgullo alzando el bastón rústico al compás del sol naciente!",
  8: "¡El Sol ha despertado! Siente la calma y respira profundamente junto a Adaggio.",
  9: "¡Lo logramos! El gran ritmo vive y late dentro del corazón de cada uno de nosotros."
};

export const StoryPlayer: React.FC<StoryPlayerProps> = ({ onSessionComplete }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showPuppet, setShowPuppet] = useState<boolean>(true);
  const [isSynthEnabled, setIsSynthEnabled] = useState<boolean>(true);
  const [activeBlock, setActiveBlock] = useState<NarrativeBlock>(NARRATIVE_BLOCKS[0]);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  
  // Video loader state
  // Mapping of blockId to loaded video object URL strings
  const [videoUrls, setVideoUrls] = useState<{ [blockId: number]: string }>({});
  const [videoNames, setVideoNames] = useState<{ [blockId: number]: string }>({});
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Modals and transitions
  const [activeTransitionModal, setActiveTransitionModal] = useState<NarrativeBlock | null>(null);
  const [congratulationsBlock, setCongratulationsBlock] = useState<NarrativeBlock | null>(null);
  const [triggeredPauses, setTriggeredPauses] = useState<number[]>([]);
  const [activePauseContent, setActivePauseContent] = useState<string | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const theaterFrameRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Load sample sound logo and configure default video paths for the 9 sections
  useEffect(() => {
    const defaultUrls: { [blockId: number]: string } = {};
    const defaultNames: { [blockId: number]: string } = {};
    
    // We expect files to be located in the "/audiovisual historia principal/" directory
    // with filenames like "tramo1.mp4", "tramo2.mp4", etc.
    for (let i = 1; i <= 9; i++) {
      defaultUrls[i] = `/audiovisual historia principal/tramo${i}.mp4`;
      defaultNames[i] = `tramo${i}.mp4 (Carpeta Principal)`;
    }
    
    // Default fallback for first tramo is sound-logo.mp4 as demo if nothing else is uploaded
    defaultUrls[1] = '/sound-logo.mp4';
    defaultNames[1] = 'sound-logo.mp4 (Demo Principal)';

    setVideoUrls(prev => ({
      ...defaultUrls,
      ...prev
    }));
    setVideoNames(prev => ({
      ...defaultNames,
      ...prev
    }));
  }, []);

  // Sync Synth and Mute values with the audio engine
  useEffect(() => {
    audioInstance.setSoundEnabled(isSynthEnabled);
    audioInstance.setMute(isMuted);
  }, [isSynthEnabled, isMuted]);

  // Synchronize audio engine state when block or play status changes
  useEffect(() => {
    if (isPlaying) {
      const remainingSecondsInBlock = activeBlock.durationEnd - currentTime;
      audioInstance.start(activeBlock.id, remainingSecondsInBlock);
    } else {
      audioInstance.stop();
    }
    return () => audioInstance.stop();
  }, [isPlaying, activeBlock.id]);

  // High-precision animation frame timer to sync state progression
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
          const totalDuration = 505; // 8:25 min total

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
  }, [isPlaying, playbackRate, activeBlock]);

  // Track block boundaries and trigger pause helpers
  useEffect(() => {
    if (congratulationsBlock !== null) return;

    const currentBlock = NARRATIVE_BLOCKS.find(
      b => currentTime >= b.durationStart && currentTime < b.durationEnd
    ) || NARRATIVE_BLOCKS[NARRATIVE_BLOCKS.length - 1];

    if (currentBlock && currentBlock.id !== activeBlock.id) {
      if (isPlaying && currentTime >= activeBlock.durationEnd) {
        setIsPlaying(false);
        audioInstance.stop();
        setCurrentTime(activeBlock.durationEnd);
        setCongratulationsBlock(activeBlock);
      } else {
        setActiveBlock(currentBlock);
        if (isPlaying) {
          audioInstance.stop();
          audioInstance.start(currentBlock.id, 0);
        }
      }
    }

    // Check pre-populated pause triggers
    const activeBlockElapsed = currentTime - currentBlock.durationStart;
    currentBlock.suggestedPausas.forEach(pausa => {
      const globalPauseTime = currentBlock.durationStart + pausa.time;
      if (Math.abs(currentTime - globalPauseTime) < 0.6 && !triggeredPauses.includes(globalPauseTime)) {
        setIsPlaying(false);
        setTriggeredPauses(prev => [...prev, globalPauseTime]);
        setActivePauseContent(pausa.text);
        audioInstance.stop();
      }
    });

  }, [currentTime, activeBlock, triggeredPauses, isPlaying, congratulationsBlock]);

  // Control video tag playback in sync with state
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, activeBlock.id, videoUrls[activeBlock.id]]);

  // Sync video current time to the elapsed time within the block
  useEffect(() => {
    if (videoRef.current && !isPlaying) {
      const elapsedInBlock = currentTime - activeBlock.durationStart;
      // Guard against infinite sync loops or setting negative sizes
      if (Math.abs(videoRef.current.currentTime - elapsedInBlock) > 1.5) {
        videoRef.current.currentTime = Math.max(0, elapsedInBlock);
      }
    }
  }, [currentTime, activeBlock, isPlaying]);

  // Sync volume state to the video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted, activeBlock.id, videoUrls[activeBlock.id]]);

  // Listen for native Fullscreen API changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!theaterFrameRef.current) return;
    if (!document.fullscreenElement) {
      theaterFrameRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.warn("Error entering fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleNextBlock = () => {
    const nextId = activeBlock.id + 1;
    const nextBlock = NARRATIVE_BLOCKS.find(b => b.id === nextId);
    if (nextBlock) {
      handleSkipToBlock(nextId);
    }
  };

  const handlePrevBlock = () => {
    const prevId = activeBlock.id - 1;
    const prevBlock = NARRATIVE_BLOCKS.find(b => b.id === prevId);
    if (prevBlock) {
      handleSkipToBlock(prevId);
    }
  };

  // File loading methods
  const handleLoadFile = (file: File, blockId: number) => {
    try {
      const objectUrl = URL.createObjectURL(file);
      setVideoUrls(prev => ({ ...prev, [blockId]: objectUrl }));
      setVideoNames(prev => ({ ...prev, [blockId]: file.name }));
    } catch (e) {
      console.error('Error loading local video file:', e);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent, blockId: number) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        handleLoadFile(file, blockId);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, blockId: number) => {
    if (e.target.files && e.target.files.length > 0) {
      handleLoadFile(e.target.files[0], blockId);
    }
  };

  // Load sample demo video instantly for the active block
  const handleLoadDemoVideo = (blockId: number) => {
    setVideoUrls(prev => ({ ...prev, [blockId]: '/sound-logo.mp4' }));
    setVideoNames(prev => ({ ...prev, [blockId]: 'sound-logo.mp4 (Demo Principal)' }));
  };

  const handleRemoveVideo = (blockId: number) => {
    setVideoUrls(prev => {
      const copy = { ...prev };
      delete copy[blockId];
      return copy;
    });
    setVideoNames(prev => {
      const copy = { ...prev };
      delete copy[blockId];
      return copy;
    });
  };

  // Navigations
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
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
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
      setCongratulationsBlock(null);
      if (onSessionComplete) {
        onSessionComplete([]);
      }
    }
  };

  const handlePointerScrub = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * 505;

    setCurrentTime(newTime);
    const block = NARRATIVE_BLOCKS.find(
      b => newTime >= b.durationStart && newTime < b.durationEnd
    ) || NARRATIVE_BLOCKS[NARRATIVE_BLOCKS.length - 1];

    if (block) {
      if (block.id !== activeBlock.id) {
        setActiveBlock(block);
      }
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

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const activePercent = (currentTime / 505) * 100;
  const currentBlockVideoUrl = videoUrls[activeBlock.id];

  // Element styles of active element for the timeline color background
  const getAccentColor = (id: number) => {
    switch (id) {
      case 1: return '#472F92'; // Inicio
      case 2: return '#FF8C00'; // Tierra
      case 3: return '#40E0D0'; // Agua
      case 4: return '#87CEEB'; // Viento
      case 5:
      case 6: return '#7B68EE'; // Trueno/Estatua
      case 7: return '#FFD700'; // Sol
      default: return '#1DD2C4';
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full bg-slate-50/40 text-slate-800 rounded-2xl p-1 md:p-3">
      
      {/* NARRATIVE BLOCKS TIMELINE PROGRESS HEADERS */}
      <div id="narrative-blocks-flow-roadmap" className="w-full bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-wrap gap-2.5 justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="text-[#472F92] w-5 h-5 animate-pulse" />
          <h3 className="text-sm font-black font-sans text-slate-800 uppercase tracking-wide">
            Ruta Escénica de Euritmia (9 Bloques — 8:25 min)
          </h3>
        </div>
        
        <div className="flex flex-wrap gap-1.5">
          {NARRATIVE_BLOCKS.map(block => {
            const isActive = activeBlock.id === block.id;
            const isPassed = currentTime >= block.durationEnd;
            const blockNameShort = block.name.split(' ')[2] || block.name.split('—')[1];
            
            return (
              <button
                key={block.id}
                onClick={() => handleSkipToBlock(block.id)}
                className={`px-3 py-1.5 text-xs rounded-xl transition-all duration-300 font-bold flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-[#472F92] text-white border-[#472F92] shadow-md scale-105'
                    : isPassed
                    ? 'bg-purple-50 text-[#472F92] border-purple-100'
                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <span className="text-[10px] font-black">{block.id}</span>
                <span className="hidden sm:inline font-sans text-[10.5px]">
                  {blockNameShort}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DETAILED MOVEMENT STAGE & VIDEO PLAYER PANEL */}
      <div id="interactive-theater-column" className="flex flex-col gap-4">
        
        <div 
          ref={theaterFrameRef}
          id="teatrillo-marionette-stage-frame"
          className="w-full rounded-2xl border-[5px] border-amber-950 overflow-hidden flex flex-col shadow-2xl bg-neutral-950 relative"
        >
          {/* THEATRE AUDIOVISUAL CANVAS */}
          <div
            id="theatre-visual-stage"
            className="relative w-full aspect-video bg-neutral-950 flex flex-col items-center justify-center overflow-hidden border-b border-neutral-900"
          >
            {currentBlockVideoUrl ? (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  src={currentBlockVideoUrl}
                  className="w-full h-full object-contain"
                  loop
                  muted={isMuted}
                  playsInline
                />
                
                {/* Floating Top Indicator of Loaded Video Source */}
                <div className="absolute top-3 left-3 right-3 z-20 flex justify-between items-center pointer-events-none">
                  <span className="bg-black/90 border border-white/10 text-white font-mono text-[9px] px-2 py-1 rounded-lg backdrop-blur-md flex items-center gap-1 pointer-events-auto">
                    <Video className="w-3 h-3 text-emerald-400" />
                    <span className="truncate max-w-[120px]">{videoNames[activeBlock.id]}</span>
                  </span>
                  
                  <button
                    onClick={() => handleRemoveVideo(activeBlock.id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-black text-[9px] px-2 py-1 rounded shadow pointer-events-auto transition-colors cursor-pointer"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ) : (
              /* Drag and Drop Load Placeholder Panel */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, activeBlock.id)}
                className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center transition-all ${
                  isDragging ? 'bg-[#472F92]/20 border-4 border-dashed border-[#472F92]' : 'bg-neutral-900'
                }`}
                style={{
                  backgroundImage: `radial-gradient(circle at center, rgba(${activeBlock.id * 20}, 40, ${activeBlock.id * 30}, 0.1) 0%, #151515 100%)`
                }}
              >
                <div className="w-11 h-11 rounded-2xl border border-white/10 flex items-center justify-center text-xl shadow mb-2 select-none">
                  📹
                </div>

                <h5 className="text-white text-xs font-black font-sans uppercase tracking-tight mb-1">
                  Cargar Video de la Clase (Tramo {activeBlock.id})
                </h5>
                
                <p className="text-neutral-400 text-[10.5px] max-w-[240px] px-2 mb-3.5 font-sans leading-relaxed">
                  Arrastra o sube la grabación del tramo de la sesión musical, o reproduce el demo.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 items-center relative z-20">
                  <label className="bg-[#472F92] hover:bg-[#5C3DBA] border border-[#372370] text-white font-black font-sans text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-lg cursor-pointer shadow active:scale-95 flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Elegir Video</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileInputChange(e, activeBlock.id)}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => handleLoadDemoVideo(activeBlock.id)}
                    className="bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-zinc-300 font-bold font-sans text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors"
                  >
                    Cargar Demo
                  </button>
                </div>
              </div>
            )}

            {/* ADAGGIO ANIMATED PUPPET INTERACTIVE OVERLAY */}
            <AnimatePresence>
              {showPuppet && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  className="absolute bottom-4 left-4 z-20 w-24 h-24 sm:w-28 sm:h-28 bg-neutral-950/85 border-2 border-[#CDA152] rounded-2xl flex flex-col items-center justify-center shadow-2xl p-1 pointer-events-auto"
                >
                  <div className="absolute top-1 left-1.5 bg-amber-400/20 text-amber-300 font-mono text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">
                    🐰 Adaggio
                  </div>
                  <div className="scale-[0.55] sm:scale-[0.65] transform origin-center my-auto">
                    <AdaggioPuppet animationState={isPlaying ? activeBlock.adaggioAnimationState : 'quiet'} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FLOATING INSTRUMENT TAG ON TOP RIGHT OF VIDEO */}
            <div className="absolute top-3 right-3 z-10">
              <span className="bg-black/80 backdrop-blur-sm border border-neutral-800 px-2 py-0.5 rounded text-[9px] font-mono text-amber-500 font-semibold shadow">
                🎵 {activeBlock.instrumentProtagonist.split('→')[0]}
              </span>
            </div>

            {/* BOTTOM RIGHT STATE CHIP */}
            <div className="absolute bottom-3 right-3 z-10">
              <span className={`px-2 py-0.5 rounded text-[9px] font-black shadow tracking-wider uppercase ${
                activeBlock.stateType === 'ACCIÓN' || activeBlock.stateType === 'ACCIÓN_DIRECCIÓN'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}>
                {activeBlock.stateType}
              </span>
            </div>
          </div>

          {/* ACTIVE NARRATOR BRIEF SUBTITLE BANNER */}
          <div id="theatre-digital-transcripts" className="bg-neutral-950 border-t border-neutral-900 p-4 min-h-[76px] flex flex-col justify-center items-center z-10 gap-1 select-none">
            <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest font-mono">
              Narración Audiovisual (Tramo {activeBlock.id} / 9)
            </p>
            <p className="text-base md:text-lg text-amber-100 text-center font-sans tracking-wide leading-relaxed max-w-2xl px-2 font-semibold">
              "{BRIEF_PHRASES[activeBlock.id] || activeBlock.narratorLines}"
            </p>
          </div>
        </div>

        {/* MEDIA TIMELINE & CONTROLS DASHBOARD */}
        <div id="media-timeline-dashboard" className="bg-neutral-950 rounded-2xl p-4 flex flex-col gap-3.5 shadow-2xl border border-neutral-900">
          
          <div className="flex justify-between items-center text-xs font-mono text-gray-400">
            <span className="font-bold">{formatTime(currentTime)}</span>
            <span className="text-[10.5px] uppercase font-black tracking-widest text-[#1DD2C4]">
              {activeBlock.name} — {activeBlock.title}
            </span>
            <span className="text-gray-500">8:25</span>
          </div>

          {/* Sizing Slider timeline */}
          <div
            ref={timelineRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative h-2.5 w-full bg-neutral-800 rounded-full cursor-pointer touch-none select-none overflow-hidden hover:h-3.5 transition-all flex items-center group"
          >
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all"
              style={{ 
                width: `${activePercent}%`,
                background: `linear-gradient(to right, #472F92, ${getAccentColor(activeBlock.id)})`
              }}
            />
            <div 
              className="absolute w-3 h-3 bg-white rounded-full border-2 border-[#472F92] shadow scale-0 group-hover:scale-100 transition-transform pointer-events-none"
              style={{ left: `calc(${activePercent}% - 6px)` }}
            />

            {/* Red Markers for Suggested Pauses */}
            {NARRATIVE_BLOCKS.flatMap(b => b.suggestedPausas.map(p => b.durationStart + p.time)).map((point, idx) => (
              <div
                key={idx}
                className="absolute w-1.5 h-full bg-red-600/90 z-20 pointer-events-none"
                style={{ left: `${(point / 505) * 100}%` }}
                title="Pausa de Alistamiento Sugerida"
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                title="Reiniciar reproducción"
                className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-gray-300 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* NEXT / PREV / PLAY TRAMO BLOCK NAVIGATION CONTROLS */}
              <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
                <button
                  onClick={handlePrevBlock}
                  disabled={activeBlock.id === 1}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-all cursor-pointer"
                  title="Tramo Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={handlePauseToggle}
                  className={`px-5 py-2 rounded-lg font-black text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                    isPlaying
                      ? 'bg-neutral-800 hover:bg-neutral-700 text-amber-500 border border-amber-500/20'
                      : 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow shadow-amber-400/10'
                  }`}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 fill-amber-500" /> : <Play className="w-3.5 h-3.5 fill-neutral-900" />}
                  <span>{isPlaying ? 'PAUSAR' : 'PRODUCIR RITMO'}</span>
                </button>

                <button
                  onClick={handleNextBlock}
                  disabled={activeBlock.id === 9}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-all cursor-pointer"
                  title="Siguiente Tramo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Skip rates panel */}
              <div className="flex items-center gap-1 bg-neutral-900 p-1.5 rounded-xl border border-neutral-800">
                <span className="text-[9px] font-mono text-gray-500 uppercase px-1.5">Acelerar:</span>
                {[1, 2.5, 5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setPlaybackRate(rate)}
                    className={`px-2 py-0.5 text-[9.5px] font-mono rounded-lg transition-colors cursor-pointer ${
                      playbackRate === rate ? 'bg-amber-400 text-neutral-950 font-black' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Show/Hide Adaggio Puppet Overlay */}
              <button
                onClick={() => setShowPuppet(prev => !prev)}
                className={`px-3 py-2 rounded-xl transition-all cursor-pointer text-xs font-bold leading-none flex items-center gap-1.5 border ${
                  showPuppet ? 'bg-[#472F92] text-white border-[#472F92] shadow-md scale-105' : 'bg-neutral-900 text-gray-400 border border-neutral-800 hover:bg-neutral-850'
                }`}
                title="Mostrar/Ocultar acompañante Adaggio"
              >
                <span>🐰</span>
                <span className="hidden sm:inline font-sans">{showPuppet ? 'Adaggio visible' : 'Adaggio oculto'}</span>
              </button>

              {/* Dynamic Interactive Volume slider */}
              <div className="flex items-center gap-2 bg-neutral-900 p-1 px-2.5 rounded-xl border border-neutral-800">
                <button
                  onClick={() => setIsMuted(prev => !prev)}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    isMuted ? 'text-red-400' : 'text-gray-400 hover:text-white animate-pulse'
                  }`}
                  title="Silenciar / Activar"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : volume < 0.35 ? <Volume1 className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const nextVol = parseFloat(e.target.value);
                    setVolume(nextVol);
                    if (nextVol > 0 && isMuted) {
                      setIsMuted(false);
                    }
                  }}
                  className="w-16 sm:w-20 md:w-24 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-amber-400 outline-none"
                  title="Regulador de Volumen"
                />
              </div>

              {/* Fullscreen control screen button */}
              <button
                onClick={toggleFullscreen}
                className={`p-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-gray-300 transition-all hover:scale-105 active:scale-95 cursor-pointer`}
                title={isFullscreen ? "Regresar" : "Pantalla Completa"}
              >
                {isFullscreen ? <Minimize2 className="w-4.5 h-4.5" /> : <Maximize2 className="w-4.5 h-4.5" />}
              </button>

              <label className="flex items-center gap-1.5 text-xs text-neutral-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isSynthEnabled}
                  onChange={(e) => setIsSynthEnabled(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-900 text-amber-400 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="font-mono text-[10.5px]">Sintetizador Web</span>
              </label>
            </div>
          </div>
        </div>

      </div>



      {/* PAUSE / RE-ALISTAMIENTO POPUP SCREEN CONTROLLER */}
      <AnimatePresence>
        {activePauseContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white text-neutral-900 rounded-3xl w-full max-w-[540px] p-6 shadow-2xl relative overflow-hidden"
              style={{ borderTop: `8px solid ${getAccentColor(activeBlock.id)}` }}
            >
              <div className="flex gap-4 items-start mb-4">
                <div 
                  className="w-14 h-14 rounded-full border border-neutral-200 flex items-center justify-center text-3xl select-none"
                  style={{ backgroundColor: `${getAccentColor(activeBlock.id)}1A` }}
                >
                  ⏳
                </div>

                <div className="flex-1 text-left">
                  <h2 className="text-lg font-black text-black font-sans uppercase leading-tight tracking-tight mb-1.5">
                    Alerta de Alistamiento: Bloque {activeBlock.id}
                  </h2>
                  <p className="text-xs text-neutral-500 font-mono tracking-wider font-bold mb-3 uppercase">
                    Pausa Pedagógica Sugerida
                  </p>

                  <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs font-medium text-slate-800 leading-relaxed italic mb-4">
                    "{activePauseContent}"
                  </div>

                  <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                    💡 Aproveche estos momentos para confirmar el alistamiento físico de materiales y despejar el centro de juego.
                  </p>
                </div>
              </div>

              <div className="border-t border-neutral-100 p-2.5 flex justify-end">
                <button
                  onClick={() => {
                    setActivePauseContent(null);
                    setIsPlaying(true);
                  }}
                  className="bg-neutral-905 bg-black text-white hover:opacity-90 font-black font-sans text-xs uppercase px-5 py-2.5 rounded-xl shadow active:scale-95 transition-all"
                >
                  Entendido, Continuar ➔
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONGRATULATIONS / NEXT BLOCK BANNER POPUP */}
      <AnimatePresence>
        {congratulationsBlock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-neutral-900 border-2 border-emerald-500 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative overflow-hidden text-white text-left"
            >
              <div className="flex items-center gap-3.5 mb-4 border-b border-neutral-800 pb-3">
                <div className="p-3 bg-emerald-500/15 rounded-full border border-emerald-500/35">
                  <span className="text-3xl leading-none block select-none">🏆</span>
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-black text-emerald-400 font-sans tracking-tight uppercase leading-snug">
                    {congratulationsBlock.id === 9 ? "¡Fin de la experiencia con Adaggio! 🌸" : `¡El Ritmo de la ${
                      congratulationsBlock.id === 1 ? "Escucha" :
                      congratulationsBlock.id === 2 ? "Tierra" :
                      congratulationsBlock.id === 3 ? "Agua" :
                      congratulationsBlock.id === 4 ? "Viento" :
                      congratulationsBlock.id === 5 || congratulationsBlock.id === 6 ? "Quietud" :
                      "Sol"
                    } ha regresado!`}
                  </h3>
                  <p className="text-[9px] text-neutral-400 font-mono uppercase tracking-wider">
                    Felicidades: Bloque {congratulationsBlock.id} completado con éxito
                  </p>
                </div>
              </div>

              <div className="bg-emerald-950/20 text-neutral-200 border border-emerald-800/35 p-5 rounded-xl mb-5">
                <h4 className="font-bold text-emerald-300 text-sm font-sans mb-1 uppercase tracking-wide">
                  {congratulationsBlock.name}
                </h4>
                <p className="text-xs text-neutral-400 italic mb-3">
                  “{congratulationsBlock.title}”
                </p>
                
                <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans font-medium">
                  {congratulationsBlock.id === 1 && "¡Súper comienzo! Han despertado la magia de Adaggio y preparado el salón de euritmia con una escucha grandiosa."}
                  {congratulationsBlock.id === 2 && "¡Increíble esfuerzo! Conseguimos sintonizar los pies de todo el grupo con el pulso profundo de la tierra y sembrar al ritmo de la música."}
                  {congratulationsBlock.id === 3 && "¡Qué fluidez! Los movimientos de pañuelos arriba y abajo sintieron el caudal del arroyo con una armonía maravillosa."}
                  {congratulationsBlock.id === 4 && "¡Magnífico! Controlaron su respiración expandiendo la energía corporal suavemente, de piano a forte, sintiendo el viento."}
                  {congratulationsBlock.id === 5 && "¡Excelente reacción! Lograron sintonizar la reacción ágil ante el rayo y la calma silenciosa del reposo."}
                  {congratulationsBlock.id === 6 && "¡Gran concentración grupal! Caminaron en puntillas de pies coordinados, dominando la marcha silenciosa del sigilo nocturno."}
                  {congratulationsBlock.id === 7 && "¡Insuperable energía colectiva! Alzaron los bastones rústicos de madera coordinando un compás alegre bajo el Sol radiante."}
                  {congratulationsBlock.id === 8 && "¡LO LOGRARON EN CIUDAD BOLÍVAR! Todos los tótems de la naturaleza brillan. Adaggio y la Fundación Monte Tabor brillan con alegría eurítmica, celebrando la participación grupal."}
                  {congratulationsBlock.id === 9 && "¡LOS CORAZONES BRILAN EN SINTONÍA! Adaggio les susurra una gran verdad: El gran ritmo no estaba dormido en el teatrillo, sino latiendo dentro de cada uno de ustedes. ¡Enhorabuena guardianes!"}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleContinueNextBlock}
                  className="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black px-6 py-3 rounded-xl transition-all text-xs tracking-wider uppercase font-mono shadow-md flex items-center gap-1.5"
                >
                  <span>{congratulationsBlock.id === 9 ? "Completar Ruta 🌸" : "Iniciar Siguiente Bloque"}</span>
                  <span className="text-base leading-none">➔</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TRANSITION MODAL OVERLAY */}
      <AnimatePresence>
        {activeTransitionModal && (() => {
          const is9 = activeTransitionModal.id === 9;
          
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-neutral-900 border-2 rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl text-white relative text-left"
                style={{ borderColor: getAccentColor(activeTransitionModal.id) }}
              >
                <div className="mb-4">
                  <span 
                    className="px-3 py-1 bg-white/5 border text-[9px] font-mono font-bold tracking-widest uppercase rounded-full" 
                    style={{ color: getAccentColor(activeTransitionModal.id), borderColor: `${getAccentColor(activeTransitionModal.id)}33` }}
                  >
                    🚀 Siguiente Escena / Nivel
                  </span>
                  
                  <h1 className="text-2xl font-black mt-3 font-sans tracking-tight uppercase text-white">
                    {activeTransitionModal.title}
                  </h1>
                </div>

                <div className="space-y-4 my-5">
                  <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                    <span className="text-[10px] uppercase font-mono font-bold text-neutral-400 block tracking-wider">
                      🎒 Elementos requeridos:
                    </span>
                    <p className="text-sm font-semibold mt-1.5 flex items-center gap-2">
                      <span>🎬</span>
                      <span>{activeTransitionModal.physicalMaterials[0] || "Solo cuerpo libre y sintonía grupal"}</span>
                    </p>
                  </div>

                  <div className="bg-amber-400/5 p-4 rounded-xl border border-amber-400/10">
                    <span className="text-[9.5px] uppercase font-mono font-black text-amber-500 block tracking-wider">
                      🧘 Preparación corporal activa:
                    </span>
                    <p className="text-xs text-neutral-200 leading-relaxed mt-1 font-medium italic">
                      "{activeTransitionModal.facilitatorCue}"
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 border-t border-neutral-850 pt-4">
                  <button
                    onClick={() => setActiveTransitionModal(null)}
                    className="px-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 transition-all font-mono text-xs font-semibold text-neutral-400 cursor-pointer"
                  >
                    Volver
                  </button>
                  <button
                    id="start-scene-btn"
                    onClick={() => {
                      setActiveTransitionModal(null);
                      setIsPlaying(true);
                      audioInstance.stop();
                      audioInstance.start(activeTransitionModal.id, 0);
                    }}
                    style={{ backgroundColor: getAccentColor(activeTransitionModal.id) }}
                    className="px-5 py-3 rounded-xl text-neutral-955 font-black font-sans text-xs tracking-wider shadow-lg uppercase transition-transform active:scale-95 hover:brightness-110 flex items-center gap-2 cursor-pointer"
                  >
                    <span>¡Comenzar Escena!</span>
                    <span className="text-base leading-none">➔</span>
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
