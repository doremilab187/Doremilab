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
  2: "¡Camina con paso firme y saluda a la Madre Tierra sintiendo su pulso constante!",
  3: "Sigue el compás alegre y lanza tus semillas imaginarias en cada fuerte golpe del bombo.",
  4: "Siente la lluvia suave y levanta los brazos para simular las sutiles gotas de lluvia.",
  5: "El Agua Fluida: Estira tus brazos arriba si escuchas agudo, y hacia el suelo si escuchas grave.",
  6: "Sigue el movimiento de las ondas y balancea suavemente tus brazos de lado a lado con fluidez.",
  7: "Viento: Siente el viento soplar suavemente frente a tu pecho, lento y contenido.",
  8: "Viento Fuerte: ¡El viento se intensifica! Abre tus brazos en grande de par en par.",
  9: "El retorno de la tormenta: La tempestad eléctrica regresa. ¡Muévete rápido y en alerta!",
  10: "¡Has logrado sobrevivir! Siente la energía limpia del rayo y baila con alegría.",
  11: "Caminemos sigilosamente a la velocidad rítmica de los truenos lejanos.",
  12: "¡La tormenta llega a su fin! Salta con energía y prepárate para celebrar el nuevo día.",
  13: "¡El Sol amanece radiante! Sostén tu antorcha de luz con orgullo marchando con energía.",
  14: "El atardecer pausado: Baja tu antorcha despacio y camina con calma bajo el Sol poniente.",
  15: "La celebración y el latido de la paz: ¡Bailen, abrácense y relájen su respiración en semicírculo!"
};

// Helper to resolve Google Drive and Dropbox direct streaming links
export const getDirectVideoUrl = (url: string): string => {
  const trimmed = url.trim();
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    let fileId = '';
    const matchD = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (matchD && matchD[1]) {
      fileId = matchD[1];
    } else {
      const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (matchId && matchId[1]) {
        fileId = matchId[1];
      }
    }
    if (fileId) {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  }
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace('?dl=0', '?raw=1').replace('&dl=0', '&raw=1');
  }
  return trimmed;
};

export const getTotemImageForBlock = (blockId: number): { src: string; name: string; description: string } | null => {
  if (blockId === 3) {
    return { 
      src: "/totems/totem_tierra.png", 
      name: "Tótem de la Tierra",
      description: "Bajo el suelo descansan miles de semillas esperando el momento de despertar. La Tierra las protege con paciencia y cuida cada brote que algún día se convertirá en flor, arbusto o árbol. Quienes ayudan a mantener su equilibrio aprenden que las cosas más valiosas crecen paso a paso."
    };
  }
  if (blockId === 6) {
    return { 
      src: "/totems/totem_agua.png", 
      name: "Tótem de la Lluvia",
      description: "Los mayores enseñan que cada gota de lluvia guarda una pequeña canción. Cuando miles de ellas caen juntas, llenan el mundo de sonidos brillantes que viajan entre las nubes, los ríos y la tierra. Para descubrir sus secretos, Adaggio deberá acompañar el viaje de las gotas y escuchar con atención su melodía."
    };
  }
  if (blockId === 8) {
    return { 
      src: "/totems/totem_viento.png", 
      name: "Tótem del Viento",
      description: "Dicen los mayores que el Viento guarda caminos invisibles entre las nubes y mensajes escondidos en el aire. Quienes desean encontrarlos deben aprender a escuchar con atención las señales que viajan por el cielo."
    };
  }
  if (blockId === 12) {
    return { 
      src: "/totems/totem_rayo.png", 
      name: "Tótem de la Tormenta",
      description: "Tras observar la tormenta con atención, Adaggio descubre que detrás del estruendo existe algo más. Entre los ecos, los relámpagos y los truenos se esconden señales que revelan un ritmo desconocido. Siguiendo sus huellas con cuidado, comienza a comprender el verdadero lenguaje de esta poderosa fuerza de la naturaleza."
    };
  }
  if (blockId === 14) {
    return { 
      src: "/totems/totem_sol.png", 
      name: "Tótem del Sol",
      description: "Desde tiempos remotos, una llama sagrada ilumina los caminos de quienes buscan la armonía. Su luz acompaña a los viajeros, les da fuerza para continuar y les recuerda que toda la naturaleza comparte un mismo ritmo. Con una antorcha en sus manos, Adaggio emprende el último tramo de su viaje siguiendo el resplandor del Sol."
    };
  }
  return null;
};

// ==========================================
// CONFIGURACIÓN DE ENLACES EN LA NUBE (GLOBAL)
// ==========================================
// Copia y pega aquí tus enlaces de Google Drive o Dropbox para cada tramo (1 al 15).
// El sistema los convertirá automáticamente en enlaces directos de streaming para que se reproduzcan solos en cualquier lugar.
// Ej: "https://drive.google.com/file/d/1XyZ.../view" o "https://www.dropbox.com/s/.../video.mp4?dl=0"
export const PRESET_CLOUD_LINKS: Record<number, string> = {
  1: "https://www.dropbox.com/scl/fi/7i1sk88gmfyunvorzghid/tramo1.mp4?rlkey=3bdk19nlks0xsjgbmm7o3s7a6&st=1vcdnjza&dl=0",
  2: "https://www.dropbox.com/scl/fi/j6mb31b53a45vw1hbdwjt/tramo2.mp4?rlkey=nrr3pj8kraoyh74lc19ilq6te&st=mltyap3d&dl=0",
  3: "https://www.dropbox.com/scl/fi/rhzvx4b4hvtblrr8xqush/tramo3.mp4?rlkey=tahw6yxkiinz0u191hpo9kbj8&st=w595h31y&dl=0",
  4: "https://www.dropbox.com/scl/fi/z1qgxbgp5vz04rgb9n998/tramo4.mp4?rlkey=e3835ftz8k60tl4s4vjwmt2xa&st=0f9w6ytq&dl=0",
  5: "https://www.dropbox.com/scl/fi/dfrf5yy1qghgveg6drpmy/tramo5.mp4?rlkey=7rouxg8bwqa2sxqbj6pc2d0d3&st=vq2v5nzy&dl=0",
  6: "https://www.dropbox.com/scl/fi/5xagal7mssv8tw7x0mfz9/tramo6.mp4?rlkey=j5c69xkrq8r1fyptawdaew90n&st=fp83w5zb&dl=0",
  7: "https://www.dropbox.com/scl/fi/0pgyaiejb31dzdwn17pc6/tramo7.mp4?rlkey=i5d3c933ppdir4agyalkxr6sw&st=1at8h3k2&dl=0",
  8: "https://www.dropbox.com/scl/fi/ppehssofghrau45r8i6po/tramo8.mp4?rlkey=ombvf2xl520bbtj6fupedos0h&st=p738tzk7&dl=0",
  9: "https://www.dropbox.com/scl/fi/lyulzha622b2n7lseggb0/tramo9.mp4?rlkey=kp6r8k2v2gthgmv31mn652652&st=9qrfm7su&dl=0",
  10: "https://www.dropbox.com/scl/fi/ia1qotrrqoh8pbwb9ezzz/tramo10.mp4?rlkey=xapu1myuazzqw16mml88bku9c&st=15nfhqq7&dl=0",
  11: "https://www.dropbox.com/scl/fi/axss5mecg0m33ubzqaj2z/tramo11.mp4?rlkey=tytmtd9wgaj0cxgloita10tu6&st=56qlchyq&dl=0",
  12: "https://www.dropbox.com/scl/fi/88u3vtnezj3317xfwi7dy/tramo12.mp4?rlkey=trv4iivh10vhyepvglo1mz69f&st=n79876xb&dl=0",
  13: "https://www.dropbox.com/scl/fi/4hxdipih938mbf44c9g6m/tramo13.mp4?rlkey=nbknd2p5ia5awznw2b3r5ata6&st=d5uj5zov&dl=0",
  14: "https://www.dropbox.com/scl/fi/b1qrxdkz1ezp0llfpc58m/tramo14.mp4?rlkey=55chdo4v33ns9ovlstvv83miy&st=du3w3k5f&dl=0",
  15: "https://www.dropbox.com/scl/fi/cs00yh2oe91tb2x9kygso/tramo15.mp4?rlkey=iquprqtkgcx60at231lk5hnr4&st=3taln8qo&dl=0"
};

export const StoryPlayer: React.FC<StoryPlayerProps> = ({ onSessionComplete }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showPuppet, setShowPuppet] = useState<boolean>(false);
  const [isSynthEnabled, setIsSynthEnabled] = useState<boolean>(false);
  const [activeBlock, setActiveBlock] = useState<NarrativeBlock>(NARRATIVE_BLOCKS[0]);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isMobileTheaterExpanded, setIsMobileTheaterExpanded] = useState<boolean>(false);
  const [isMobileCinemaMode, setIsMobileCinemaMode] = useState<boolean>(false);
  
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
  const [showStartScreen, setShowStartScreen] = useState<boolean>(true);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const theaterFrameRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const currentBlockVideoUrl = videoUrls[activeBlock.id];
  const isGoogleDrive = !!(currentBlockVideoUrl && (
    currentBlockVideoUrl.includes('drive.google.com') ||
    currentBlockVideoUrl.includes('/file/d/') ||
    currentBlockVideoUrl.includes('docs.google.com')
  ));

  // Load sample sound logo and configure default video paths for the 15 sections
  useEffect(() => {
    const defaultUrls: { [blockId: number]: string } = {};
    const defaultNames: { [blockId: number]: string } = {};
    
    // We expect files to be located in the "/audiovisual historia principal/" directory
    // with filenames like "tramo1.mp4", "tramo2.mp4", etc.
    for (let i = 1; i <= 15; i++) {
      if (PRESET_CLOUD_LINKS[i] && PRESET_CLOUD_LINKS[i].trim() !== '') {
        defaultUrls[i] = getDirectVideoUrl(PRESET_CLOUD_LINKS[i]);
        defaultNames[i] = `Enlace Nube Tramo ${i}`;
      } else {
        defaultUrls[i] = `/audiovisual historia principal/tramo${i}.mp4`;
        defaultNames[i] = `tramo${i}.mp4 (Carpeta Principal)`;
      }
    }
    
    // Default fallback for first tramo is sound-logo.mp4 as demo if nothing else is preset or uploaded
    if (!PRESET_CLOUD_LINKS[1] || PRESET_CLOUD_LINKS[1].trim() === '') {
      defaultUrls[1] = '/sound-logo.mp4';
      defaultNames[1] = 'sound-logo.mp4 (Demo Principal)';
    }

    let storedUrls: Record<number, string> = {};
    let storedNames: Record<number, string> = {};
    try {
      const u = localStorage.getItem('dalcroze_video_urls');
      const n = localStorage.getItem('dalcroze_video_names');
      if (u) storedUrls = JSON.parse(u);
      if (n) storedNames = JSON.parse(n);
    } catch (e) {
      console.warn("Could not parse loaded links:", e);
    }

    // Convert legacy export=download links to the correct preview URLs
    Object.keys(storedUrls).forEach(k => {
      const key = Number(k);
      const url = storedUrls[key];
      if (url && (url.includes('docs.google.com/uc') || url.includes('export=download'))) {
        const fileIdMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (fileIdMatch && fileIdMatch[1]) {
          storedUrls[key] = `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
        }
      }
    });

    // Overlay stored values only if we didn't specify a preset in code for that tramo
    const finalUrls = { ...defaultUrls };
    const finalNames = { ...defaultNames };
    
    Object.keys(storedUrls).forEach(k => {
      const key = Number(k);
      const stored = storedUrls[key];
      // Only keep stored if it is a custom uploaded blob, or if there is no code preset
      if (stored && (stored.startsWith('blob:') || !PRESET_CLOUD_LINKS[key] || PRESET_CLOUD_LINKS[key].trim() === '')) {
        finalUrls[key] = stored;
        finalNames[key] = storedNames[key] || `Video Tramo ${key}`;
      }
    });

    setVideoUrls(finalUrls);
    setVideoNames(finalNames);
  }, []);

  // Save persistent URLs and names to localStorage whenever they change
  useEffect(() => {
    try {
      const persistentUrls: { [blockId: number]: string } = {};
      const persistentNames: { [blockId: number]: string } = {};
      let hasCustom = false;

      Object.keys(videoUrls).forEach(k => {
        const key = Number(k);
        const url = videoUrls[key];
        // We only save actual cloud/web links; exclude local file blob URLs and original local defaults
        if (url && !url.startsWith('blob:') && !url.startsWith('/audiovisual') && url !== '/sound-logo.mp4') {
          persistentUrls[key] = url;
          persistentNames[key] = videoNames[key] || `Video Tramo ${key}`;
          hasCustom = true;
        }
      });

      // Update localStorage
      if (hasCustom) {
        localStorage.setItem('dalcroze_video_urls', JSON.stringify(persistentUrls));
        localStorage.setItem('dalcroze_video_names', JSON.stringify(persistentNames));
      }
    } catch (e) {
      console.warn("Could not save video links to localStorage:", e);
    }
  }, [videoUrls, videoNames]);

  // Sync Synth and Mute values with the audio engine
  useEffect(() => {
    audioInstance.setSoundEnabled(isSynthEnabled);
    audioInstance.setMute(isMuted);
  }, [isSynthEnabled, isMuted]);

  // Synchronize audio engine state when block or play status changes
  useEffect(() => {
    if (!isPlaying) {
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
        if (videoRef.current && currentBlockVideoUrl && !isGoogleDrive) {
          // If a custom video is loaded, let the video's own progress determine the current time!
          const vidCurrent = videoRef.current.currentTime;
          const vidDuration = videoRef.current.duration;
          if (vidDuration && vidDuration > 0) {
            const ratio = vidCurrent / vidDuration;
            const mappedTime = activeBlock.durationStart + ratio * (activeBlock.durationEnd - activeBlock.durationStart);
            const isEnded = videoRef.current.ended || vidCurrent >= vidDuration;
            if (isEnded) {
              setCurrentTime(activeBlock.durationEnd);
            } else {
              // Clamp it so it doesn't cross durationEnd prematurely
              const maxAllowed = activeBlock.durationEnd - 0.15;
              setCurrentTime(Math.min(maxAllowed, Math.max(activeBlock.durationStart, mappedTime)));
            }
          }
        } else {
          // Standard timeline progression when no custom video is loaded or it is Google Drive
          setCurrentTime(prev => {
            const nextTime = prev + delta * playbackRate;
            const totalDuration = NARRATIVE_BLOCKS[NARRATIVE_BLOCKS.length - 1].durationEnd; // 600 seconds total

            if (nextTime >= totalDuration) {
              setIsPlaying(false);
              audioInstance.stop();
              setCongratulationsBlock(activeBlock);
              return totalDuration;
            }
            return nextTime;
          });
        }
      }
      requestRef.current = requestAnimationFrame(handleTick);
    };

    requestRef.current = requestAnimationFrame(handleTick);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying, playbackRate, activeBlock, currentBlockVideoUrl, isGoogleDrive]);

  const handleBlockCompletion = (completedBlockId: number) => {
    setIsPlaying(false);
    audioInstance.stop();
    const completedBlock = NARRATIVE_BLOCKS.find(b => b.id === completedBlockId);
    if (completedBlock) {
      setActiveTransitionModal(completedBlock);
    }
  };

  // Track block boundaries and trigger pause helpers
  useEffect(() => {
    if (congratulationsBlock !== null) return;

    // If any video is loaded (built-in, custom, cloud or Google Drive),
    // we do NOT want the automatic 40-second timeline transition to force close the video!
    // The video plays to its actual completion, and then the native onEnded event transitions.
    if (currentBlockVideoUrl) {
      return;
    }

    const currentBlock = NARRATIVE_BLOCKS.find(
      b => currentTime >= b.durationStart && currentTime < b.durationEnd
    ) || NARRATIVE_BLOCKS[NARRATIVE_BLOCKS.length - 1];

    if (currentBlock && currentBlock.id !== activeBlock.id) {
      if (isPlaying && currentTime >= activeBlock.durationEnd) {
        handleBlockCompletion(activeBlock.id);
      } else {
        setActiveBlock(currentBlock);
        if (isPlaying) {
          audioInstance.stop();
        }
      }
    }

    // Suggested pauses disabled for peaceful video streaming since all instruction details are already in the custom video file
    /*
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
    */

  }, [currentTime, activeBlock, triggeredPauses, isPlaying, congratulationsBlock, currentBlockVideoUrl, isGoogleDrive]);

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
    // Show the transition modal of the current block so they see its text narrative,
    // and can click 'Continuar' to advance to the next block automatically.
    handleBlockCompletion(activeBlock.id);
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
      setIsPlaying(true);
      audioInstance.stop();
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

  const handleContinueToNext = (completedBlock: NarrativeBlock) => {
    setActiveTransitionModal(null);
    const nextBlock = NARRATIVE_BLOCKS.find(b => b.id === completedBlock.id + 1);
    if (nextBlock) {
      setActiveBlock(nextBlock);
      setCurrentTime(nextBlock.durationStart);
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    } else {
      setCongratulationsBlock(completedBlock);
    }
  };

  const handlePointerScrub = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const maxDuration = NARRATIVE_BLOCKS[NARRATIVE_BLOCKS.length - 1].durationEnd;
    const newTime = percentage * maxDuration;

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

  const maxSesDuration = NARRATIVE_BLOCKS[NARRATIVE_BLOCKS.length - 1].durationEnd;
  const activePercent = (currentTime / maxSesDuration) * 100;

  // Element styles of active element for the timeline color background
  const getAccentColor = (id: number) => {
    if (id === 1) return '#472F92'; // Inicio
    if (id === 2 || id === 3) return '#FF8C00'; // Tierra
    if (id === 4 || id === 5) return '#40E0D0'; // Agua
    if (id === 6 || id === 7) return '#87CEEB'; // Viento
    if (id >= 8 && id <= 10) return '#7B68EE'; // Trueno / Estatuas
    if (id === 11 || id === 12) return '#FFD700'; // Sol
    return '#1DD2C4'; // Final / Celebraciones
  };

  if (showStartScreen) {
    return (
      <div className="bg-[#FFFDF1] rounded-3xl p-6 md:p-10 border-[4px] border-[#31C3AA] shadow-2xl relative overflow-hidden min-h-[580px] flex flex-col justify-between items-center text-center">
        {/* Decorative fluffy white cloud vectors */}
        <div className="absolute top-8 left-[10%] w-48 h-12 bg-white/70 rounded-full blur-md pointer-events-none opacity-60" />
        <div className="absolute top-20 right-[5%] w-60 h-16 bg-white/70 rounded-full blur-md pointer-events-none opacity-60" />
        
        <div className="relative z-10 w-full flex justify-end items-center pb-4 border-b border-purple-100">
          <button 
            onClick={() => {
              if (onSessionComplete) onSessionComplete([]);
            }}
            className="text-xs text-[#472F92] font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            Regresar al Inicio
          </button>
        </div>

        <div className="relative z-10 my-auto flex flex-col items-center gap-6 max-w-lg">
          <div className="relative w-44 h-44 flex items-center justify-center p-2 select-none">
            <div className="scale-75 transform origin-center">
              <AdaggioPuppet animationState="saludando" />
            </div>
          </div>

          <div className="space-y-3.5">
            <h2 className="text-3xl font-black font-funny text-[#472F92] uppercase tracking-wide leading-tight">
              Adaggio, el Viajero de los Ritmos
            </h2>
            <p className="text-[#6853a4] text-xs sm:text-sm leading-relaxed font-sans max-w-lg mx-auto font-medium font-semibold text-center">
              Adaggio es un joven conejo viajero conocido por sus extraordinarias capacidades para escuchar. Mientras otros oyen solamente sonidos, él puede percibir los ritmos ocultos que viven en la naturaleza: el movimiento de las nubes, el susurro de las hojas y el latido de la tierra bajo sus patas. Guiado por su curiosidad y su amor por la música, recorre caminos y paisajes aprendiendo de cada encuentro. Su mayor don no es la fuerza ni la magia, sino la capacidad de escuchar, comprender y conectar aquello que parece estar separado.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowStartScreen(false)}
          className="relative group w-full max-w-sm bg-[#472F92] hover:bg-[#3d2780] border-[4px] border-[#31C3AA] active:border-[#1F9F8B] px-8 py-4 rounded-[26px] shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-center flex items-center justify-center gap-3 cursor-pointer overflow-hidden select-none text-white font-black"
        >
          <div className="absolute top-0.5 left-2 right-2 h-2.5 bg-white/30 rounded-full blur-[0.5px]" />
          <Play className="w-5 h-5 fill-white text-white animate-pulse" />
          <span className="font-black text-lg font-funny tracking-wider uppercase">
            Iniciar Relato Rítmico
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 w-full bg-slate-50/40 text-slate-800 rounded-2xl p-1 md:p-3">
      
      {/* NARRATIVE BLOCKS TIMELINE PROGRESS HEADERS */}
      <div id="narrative-blocks-flow-roadmap" className="w-full bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-wrap gap-2.5 justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="text-[#472F92] w-5 h-5 animate-pulse" />
          <h3 className="text-sm font-black font-funny text-slate-800 uppercase tracking-wide">
            Ruta Escénica de Euritmia (15 Bloques — 10:00 min)
          </h3>
        </div>
        
        <div className="flex flex-wrap gap-1.5">
          {NARRATIVE_BLOCKS.map(block => {
            const isActive = activeBlock.id === block.id;
            const isPassed = currentTime >= block.durationEnd;
            const splitName = block.name.split(' ');
            const blockNameShort = splitName[2] ? `${splitName[2]} ${splitName[3] || ''}` : block.name.split('—')[1] || block.name;
            
            return (
              <button
                key={block.id}
                onClick={() => handleSkipToBlock(block.id)}
                className={`px-2.5 py-1.5 text-xs rounded-xl transition-all duration-300 font-bold flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-[#472F92] text-white border-[#472F92] shadow-md scale-105'
                    : isPassed
                    ? 'bg-purple-50 text-[#472F92] border-purple-100'
                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <span className="text-[10px] font-black">{block.id}</span>
                <span className="hidden sm:inline font-funny text-[11px] tracking-wide">
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
          className="w-full rounded-2xl border-2 sm:border-[5px] border-amber-950 overflow-hidden flex flex-col shadow-2xl bg-neutral-950 relative"
        >
          {/* THEATRE AUDIOVISUAL CANVAS */}
          <div
            id="theatre-visual-stage"
            className={`relative w-full transition-all duration-300 bg-neutral-950 flex flex-col items-center justify-center overflow-hidden ${
              isMobileTheaterExpanded 
                ? 'aspect-[3/4] xs:aspect-[4/3] sm:aspect-video min-h-[460px] xs:min-h-[500px] sm:min-h-0' 
                : 'aspect-[4/3] xs:aspect-[16/10] sm:aspect-video'
            }`}
          >
            {currentBlockVideoUrl ? (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black">
                {isGoogleDrive ? (
                  <iframe
                    src={currentBlockVideoUrl}
                    className="w-full h-full absolute inset-0 border-0 bg-black"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    title={`Video Tramo ${activeBlock.id}`}
                  />
                ) : (
                  <video
                    ref={videoRef}
                    src={currentBlockVideoUrl}
                    className="w-full h-full object-contain"
                    muted={isMuted}
                    playsInline
                    controls
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => handleBlockCompletion(activeBlock.id)}
                  />
                )}
                
                {/* Floating Top Indicator of Loaded Video Source */}
                <div className="absolute top-3 left-3 right-3 z-20 flex justify-between items-center pointer-events-none">
                  {/* Left Side: Cinema Mode Button (with only an icon as requested) */}
                  <button
                    onClick={() => setIsMobileCinemaMode(true)}
                    className="bg-black/90 hover:bg-neutral-850 border border-white/15 text-amber-400 p-2 rounded-xl backdrop-blur-md hover:scale-105 active:scale-95 transition-all pointer-events-auto flex items-center justify-center shadow-lg cursor-pointer"
                    title="Modo Cine (Pantalla Completa)"
                  >
                    <span className="text-sm select-none">🎬</span>
                  </button>
                  
                  <div className="flex gap-2 pointer-events-auto">
                    <button
                      onClick={() => handleRemoveVideo(activeBlock.id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-black text-[9px] px-2 py-1 rounded shadow pointer-events-auto transition-colors cursor-pointer"
                    >
                      Quitar
                    </button>
                  </div>
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
                  <label className="bg-[#472F92] hover:bg-[#5C3DBA] border border-[#372370] text-white font-black font-funny text-[11px] uppercase tracking-wide px-3.5 py-1.5 rounded-lg cursor-pointer shadow active:scale-95 flex items-center gap-1">
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
                    className="bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-zinc-300 font-black font-funny text-[11px] uppercase tracking-wide px-3.5 py-1.5 rounded-lg cursor-pointer transition-all active:scale-95"
                  >
                    Cargar Demo
                  </button>
                </div>

                <div className="w-full max-w-xs mt-3 relative z-20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-[1px] bg-neutral-800 flex-1"></div>
                    <span className="text-[8px] font-mono font-bold text-neutral-500 uppercase tracking-widest">O con Enlace Nube</span>
                    <div className="h-[1px] bg-neutral-800 flex-1"></div>
                  </div>
                  <div className="flex gap-1.5 bg-neutral-950/80 p-1 border border-neutral-800 rounded-lg">
                    <input
                      type="text"
                      placeholder="Pegar URL .mp4 (Google Drive, Dropbox, S3...)"
                      className="bg-transparent border-0 text-[10px] text-white placeholder-neutral-500 px-2 py-1 outline-none w-full"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.currentTarget;
                          const val = target.value.trim();
                          if (val) {
                            const parsedUrl = getDirectVideoUrl(val);
                            setVideoUrls(prev => ({ ...prev, [activeBlock.id]: parsedUrl }));
                            setVideoNames(prev => ({ ...prev, [activeBlock.id]: val.split('/').pop() || `URL Tramo ${activeBlock.id}` }));
                            target.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        const val = input.value.trim();
                        if (val) {
                          const parsedUrl = getDirectVideoUrl(val);
                          setVideoUrls(prev => ({ ...prev, [activeBlock.id]: parsedUrl }));
                          setVideoNames(prev => ({ ...prev, [activeBlock.id]: val.split('/').pop() || `URL Tramo ${activeBlock.id}` }));
                          input.value = '';
                        }
                      }}
                      className="bg-[#472F92] hover:bg-[#5C3DBA] text-white text-[9px] px-2.5 py-1 rounded font-bold uppercase transition-colors cursor-pointer select-none"
                    >
                      Cargar
                    </button>
                  </div>
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
                  className="absolute bottom-4 left-4 z-20 w-24 h-24 sm:w-28 sm:h-28 bg-neutral-950/85 border-2 border-[#CDA152] rounded-2xl flex items-center justify-center shadow-2xl p-0.5 pointer-events-auto"
                >
                  <div className="scale-[0.55] sm:scale-[0.65] transform origin-center my-auto">
                    <AdaggioPuppet animationState={isPlaying ? activeBlock.adaggioAnimationState : 'quiet'} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* MEDIA TIMELINE & CONTROLS DASHBOARD */}
        {!isGoogleDrive && (
          <div id="media-timeline-dashboard" className="bg-neutral-950 rounded-2xl p-4 flex flex-col gap-3.5 shadow-2xl border border-neutral-900">
            
            <div className="flex justify-between items-center text-xs font-mono text-gray-400">
              <span className="font-bold">{formatTime(currentTime)}</span>
              <span className="text-[10.5px] uppercase font-black tracking-widest text-[#1DD2C4]">
                {activeBlock.name} — {activeBlock.title}
              </span>
              <span className="text-gray-500">{formatTime(maxSesDuration)}</span>
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
                  style={{ left: `${(point / maxSesDuration) * 100}%` }}
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
                    className={`px-5 py-2 rounded-lg font-black flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                      isPlaying
                        ? 'bg-[#472F92]/20 hover:bg-[#472F92]/30 text-white border border-[#472F92]/40'
                        : 'bg-[#472F92] hover:bg-[#352079] text-white shadow shadow-[#472F92]/10'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white stroke-white" /> : <Play className="w-3.5 h-3.5 fill-white stroke-white animate-pulse" />}
                    <span className="font-funny text-[13px] tracking-wide">{isPlaying ? 'PAUSAR' : 'PRODUCIR RITMO'}</span>
                  </button>

                  <button
                    onClick={handleNextBlock}
                    disabled={activeBlock.id === 15}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-all cursor-pointer"
                    title="Siguiente Tramo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Dynamic Interactive Volume slider */}
                <div className="flex items-center gap-2 bg-neutral-900 p-1 px-2.5 rounded-xl border border-neutral-800">
                  <button
                    onClick={() => setIsMuted(prev => !prev)}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      isMuted ? 'text-red-400' : 'text-gray-400 hover:text-white'
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
                    className="w-16 sm:w-20 md:w-24 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#472F92] outline-none"
                    title="Regulador de Volumen"
                  />
                </div>

                {/* Mobile Cinema Mode Button */}
                <button
                  onClick={() => setIsMobileCinemaMode(true)}
                  className="sm:hidden p-2 rounded-xl bg-[#472F92] hover:bg-[#352079] text-white transition-all hover:scale-105 active:scale-95 cursor-pointer font-black flex items-center justify-center text-sm"
                  title="Modo Cine Pantalla Completa"
                >
                  <span>🎬</span>
                </button>

                {/* Desktop Native Fullscreen Button */}
                <button
                  onClick={toggleFullscreen}
                  className="hidden sm:block p-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-gray-300 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  title={isFullscreen ? "Regresar" : "Pantalla Completa"}
                >
                  {isFullscreen ? <Minimize2 className="w-4.5 h-4.5" /> : <Maximize2 className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BOTÓN DE VALIDACIÓN DIRECTO BAJO EL REPRODUCTOR */}
        {currentBlockVideoUrl && (
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white border border-slate-200/80 p-4 rounded-2xl shadow-md mt-1 animate-fadeIn w-full">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#472F92]/40 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#472F92]"></span>
              </span>
              <span className="text-xs font-bold font-sans">
                {isGoogleDrive ? "Video en reproducción desde la nube (Drive)" : "Video interactivo cargado"}
              </span>
            </div>
            
            <button
              onClick={() => handleBlockCompletion(activeBlock.id)}
              className="w-full sm:w-auto bg-[#472F92] hover:bg-[#3d2780] active:scale-95 text-white font-black font-sans text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-lg shadow-[#472F92]/10 border-b-2 border-[#2b1766] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Validar este video y pasar a las indicaciones"
            >
              <Award className="w-3.5 h-3.5 text-purple-100" />
              <span>Validar</span>
            </button>
          </div>
        )}

      </div>

      {/* PANTALLA TRANSICIÓN SUITE (SIENTE EL SIGUIENTE RITMO) */}
      <AnimatePresence>
        {activeTransitionModal && (() => {
          const phrase = BRIEF_PHRASES[activeTransitionModal.id] || activeTransitionModal.narratorLines;
          const accentColor = getAccentColor(activeTransitionModal.id);
          const iconMap: Record<number, string> = {
            1: "🐰", // Adaggio
            2: "🪵", // Tierra I
            3: "🌱", // Tierra II
            4: "🩵", // Transición
            5: "🌊", // Agua I
            6: "💧", // Agua II
            7: "🍃", // Viento I
            8: "💨", // Viento II
            9: "⚡", // Trueno I
            10: "💥", // Trueno II
            11: "🗿", // Trueno III
            12: "🌧️", // Trueno IV
            13: "☀️", // Sol I
            14: "🌅", // Sol II
            15: "🎉" // Celebración y Calma
          };
          const currentProgressPercent = ((activeTransitionModal.id - 1) / 15) * 100;
          const totem = getTotemImageForBlock(activeTransitionModal.id);

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/90 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                transition={{ type: "spring", damping: 20 }}
                className="bg-white text-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl border-4 relative overflow-hidden flex flex-col gap-6"
                style={{ borderColor: accentColor }}
              >
                {/* Decorative background visual accent */}
                <div 
                  className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
                  style={{ backgroundColor: accentColor }}
                />

                {/* Top tracker */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-black tracking-widest text-slate-400 uppercase font-mono">
                    <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg font-black font-sans text-[10px] uppercase">¡Tramo {activeTransitionModal.id} Completado!</span>
                    <span style={{ color: accentColor }} className="font-bold">Tramo {activeTransitionModal.id} de 15</span>
                  </div>
                  {/* Small progress index bar */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden font-mono">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${currentProgressPercent}%`,
                        backgroundColor: accentColor 
                      }} 
                    />
                  </div>
                </div>

                {/* Main Content Info */}
                <div className="text-center flex flex-col items-center gap-4 mt-2">
                  {totem ? (
                    /* HERO AMULET PRESENTATION (When totem is collected) */
                    <div className="flex flex-col items-center w-full gap-4">
                      {/* Sub-label */}
                      <span className="text-[10px] sm:text-xs font-black font-mono text-amber-500 uppercase tracking-widest animate-pulse block">
                        ✨ ¡Recogiste un Amuleto Escénico! ✨
                      </span>
                      
                      {/* Big Hero Amulet Image */}
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
                        className="relative w-48 h-48 flex items-center justify-center p-2"
                      >
                        {/* Shimmer/glow effects in back */}
                        <div 
                          className="absolute inset-4 rounded-full opacity-50 blur-3xl pointer-events-none animate-pulse"
                          style={{ backgroundColor: accentColor || 'rgba(242, 175, 41, 0.4)' }}
                        />
                        
                        <motion.img 
                          src={totem.src} 
                          alt={totem.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain relative z-10 drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)] select-none"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        />
                      </motion.div>

                      {/* Collection Heading */}
                      <div className="flex flex-col gap-1">
                        <h2 className="text-2xl sm:text-3xl font-black font-funny text-amber-600 uppercase tracking-wide leading-tight px-5">
                          ¡Recogiste el {totem.name}!
                        </h2>
                      </div>
                    </div>
                  ) : (
                    /* STANDARD TRAMO WITH ADAGGIO (When no totem is collected) */
                    <div className="flex flex-col items-center w-full gap-4">
                      {/* Adaggio Puppet (Always constant in standard tramos but with dynamic states) */}
                      <div className="relative w-48 h-48 flex items-center justify-center p-2">
                        <div 
                          className="absolute inset-4 rounded-full opacity-40 blur-3xl pointer-events-none animate-pulse"
                          style={{ backgroundColor: accentColor || 'rgba(59, 130, 246, 0.4)' }}
                        />
                        <div className="scale-75 transform origin-center relative z-10 drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)]">
                          <AdaggioPuppet animationState={activeTransitionModal.adaggioAnimationState || 'hablando'} />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <h2 className="text-2xl sm:text-3xl font-black font-funny uppercase tracking-wide text-slate-800">
                          {activeTransitionModal.title}
                        </h2>
                      </div>
                    </div>
                  )}

                  {/* VERY SHORT INDIVIDUAL PHRASE */}
                  <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl w-full relative mt-1">
                    <span className="absolute -top-3 left-6 px-2 bg-white border border-slate-150 text-[9px] font-black uppercase text-slate-400 rounded-full tracking-wider font-mono">
                      Instrucción del Tramo
                    </span>
                    <p className="text-base sm:text-lg text-center font-sans tracking-tight leading-relaxed text-slate-700 font-bold italic">
                      "{phrase}"
                    </p>
                  </div>
                </div>

                {/* Action button to proceed automatically */}
                <button
                  id="btn-transition-continue"
                  onClick={() => handleContinueToNext(activeTransitionModal)}
                  style={{ backgroundColor: accentColor }}
                  className="w-full py-4 rounded-2xl text-white font-black font-funny text-lg tracking-wider hover:brightness-110 active:scale-95 shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-white stroke-white" />
                  <span className="uppercase text-sm sm:text-base">
                    {activeTransitionModal.id < 15 
                      ? `CONTINUAR AL TRAMO ${activeTransitionModal.id + 1} ➔` 
                      : 'FINALIZAR CLASE ➔'}
                  </span>
                </button>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* FINAL CONGRATULATIONS COMPLETED SCREEN */}
      <AnimatePresence>
        {congratulationsBlock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-white text-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl border-4 border-[#1DD2C4] relative text-center flex flex-col items-center gap-6"
            >
              <div className="flex items-center gap-4 justify-center">
                <div className="w-16 h-16 bg-[#1DD2C4]/10 border border-[#1DD2C4]/30 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  <Sparkles className="w-8 h-8 text-[#1DD2C4]" />
                </div>
                {/* Adaggio Puppet */}
                <div className="relative w-36 h-36 flex items-center justify-center p-2 select-none">
                  <div className="scale-[0.65] transform origin-center">
                    <AdaggioPuppet animationState="celebrando" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-black tracking-widest uppercase self-center w-max">
                  Clase Completada
                </span>
                <h2 className="text-2xl sm:text-3xl font-black font-funny mt-3 uppercase tracking-wide text-slate-800">
                  ¡FELICITACIONES!
                </h2>
                <p className="text-xs text-slate-400 font-sans mt-1">
                  Has completado todo el viaje y la historia. ¡Buen trabajo!
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl w-full font-sans text-sm leading-relaxed text-slate-600">
                Los niños han experimentado el pulso, acentos, matices, tormentas, brisas, relámpagos, estatuas, sol rítmico y calma respiratoria con total alegría.
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
                <button
                  onClick={() => {
                    setCongratulationsBlock(null);
                    handleReset();
                  }}
                  className="flex-1 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold font-sans text-[13px] transition-all cursor-pointer active:scale-95"
                >
                  Volver a Empezar ↺
                </button>
                <button
                  onClick={() => {
                    setCongratulationsBlock(null);
                    if (onSessionComplete) {
                      onSessionComplete([]);
                    }
                  }}
                  className="flex-1 bg-[#1DD2C4] hover:bg-[#15BCB0] text-neutral-950 font-black font-funny text-sm tracking-wider py-3.5 rounded-xl transition-all cursor-pointer active:scale-95 shadow shadow-[#1DD2C4]/20"
                >
                  Finalizar Clase ➔
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODO CINE / PANTALLA COMPLETA EXCLUSIVO MÓVIL (No afecta a la vista de escritorio) */}
      <AnimatePresence>
        {isMobileCinemaMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="fixed inset-0 z-50 bg-neutral-950 flex flex-col justify-between"
          >
            {/* Header del Modo Cine */}
            <div className="bg-neutral-900/90 border-b border-neutral-800 text-white px-4 py-3 flex items-center justify-between backdrop-blur-md">
              <div className="flex flex-col gap-0.5 truncate max-w-[70%]">
                <span className="text-[9px] font-mono text-amber-400 font-black uppercase tracking-widest">
                  TRAMO {activeBlock.id} DE 15 • MODO CINE
                </span>
                <span className="text-xs font-bold truncate text-gray-200">
                  {activeBlock.name.split('—')[1] || activeBlock.name} — {activeBlock.title}
                </span>
              </div>
              
              <button
                onClick={() => setIsMobileCinemaMode(false)}
                className="bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-gray-200 font-bold text-xs uppercase px-3 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                Cerrar ✕
              </button>
            </div>

            {/* Canvas de Video en Alta Visibilidad */}
            <div className="flex-1 w-full bg-black flex items-center justify-center relative overflow-hidden">
              {currentBlockVideoUrl ? (
                <>
                  {isGoogleDrive ? (
                    <iframe
                      src={currentBlockVideoUrl}
                      className="w-full h-full absolute inset-0 border-0 bg-black"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      title={`Cinema Video Tramo ${activeBlock.id}`}
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      src={currentBlockVideoUrl}
                      className="w-full h-full object-contain"
                      muted={isMuted}
                      playsInline
                      controls
                      autoPlay={isPlaying}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => {
                        setIsMobileCinemaMode(false);
                        handleBlockCompletion(activeBlock.id);
                      }}
                    />
                  )}
                  


                  {/* Marioneta de Adaggio Sincronizada */}
                  {showPuppet && (
                    <div className="absolute bottom-4 left-4 z-40 w-16 h-16 xs:w-20 xs:h-20 bg-neutral-950/80 border border-amber-400/30 rounded-xl flex items-center justify-center p-0.5 pointer-events-none shadow-xl transform scale-90 xs:scale-100 origin-bottom-left">
                      <div className="scale-[0.45] xs:scale-[0.5] transform origin-center">
                        <AdaggioPuppet animationState={isPlaying ? activeBlock.adaggioAnimationState : 'quiet'} />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-6 flex flex-col items-center gap-3">
                  <span className="text-4xl text-neutral-600">📹</span>
                  <p className="text-neutral-400 font-sans text-xs">No hay un video guardado para este tramo rítmico.</p>
                  <button
                    onClick={() => {
                      setIsMobileCinemaMode(false);
                      handleLoadDemoVideo(activeBlock.id);
                    }}
                    className="bg-[#472F92] hover:bg-[#5C3DBA] text-white text-[11px] uppercase font-black px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-md"
                  >
                    Activar Video Demo
                  </button>
                </div>
              )}
            </div>

            {/* Controles para Pantallas Táctil / Dedos en Móvil */}
            <div className="bg-neutral-900 border-t border-neutral-800 px-4 py-3.5 flex flex-col gap-3">
              {/* Progreso del Relato */}
              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                <span className="font-bold">{formatTime(currentTime)}</span>
                <span className="text-amber-400 tracking-wider">TRAMO ACÚSTICO: {activeBlock.id} / 15</span>
                <span className="text-zinc-500">{formatTime(maxSesDuration)}</span>
              </div>

              {/* Slider de progreso táctil cómodo */}
              <div
                onClick={(e) => {
                  if (timelineRef.current) {
                    const rect = timelineRef.current.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const nextTime = (clickX / rect.width) * maxSesDuration;
                    setCurrentTime(parseFloat(Math.max(0, Math.min(maxSesDuration, nextTime)).toFixed(2)));
                  }
                }}
                className="relative h-2.5 w-full bg-neutral-800 rounded-full cursor-pointer touch-none flex items-center"
              >
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-purple-600 to-[#1DD2C4]"
                  style={{ width: `${activePercent}%` }}
                />
                <div 
                  className="absolute w-3.5 h-3.5 bg-white rounded-full border-2 border-purple-600 shadow"
                  style={{ left: `calc(${activePercent}% - 7px)` }}
                />
              </div>

              {/* Botonera de reproducción rápida tactil */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevBlock}
                    disabled={activeBlock.id === 1}
                    className="p-3 rounded-xl text-gray-200 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 cursor-pointer"
                    title="Tramo Anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handlePauseToggle}
                    className={`px-5 py-3 rounded-xl flex items-center gap-2 transition-all active:scale-95 text-neutral-950 font-black cursor-pointer ${
                      isPlaying ? 'bg-neutral-800 border border-neutral-700 text-amber-400' : 'bg-amber-400 hover:bg-amber-350 shadow'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-amber-400 stroke-amber-400" /> : <Play className="w-4 h-4 fill-neutral-950" />}
                    <span className="font-funny text-xs tracking-wider uppercase">{isPlaying ? 'PAUSA' : 'REPRODUCIR'}</span>
                  </button>

                  <button
                    onClick={handleNextBlock}
                    disabled={activeBlock.id === 15}
                    className="p-3 rounded-xl text-gray-200 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 cursor-pointer"
                    title="Siguiente Tramo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Botón de validación limpio y cómodo */}
                  {currentBlockVideoUrl && (
                    <button
                      onClick={() => {
                        setIsMobileCinemaMode(false);
                        handleBlockCompletion(activeBlock.id);
                      }}
                      className="px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black font-sans text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
                      title="Validar video e ir al siguiente"
                    >
                      <Award className="w-3.5 h-3.5 text-emerald-100 animate-pulse" />
                      <span>Validar</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Botón Silenciador Táctil */}
                  <button
                    onClick={() => setIsMuted(prev => !prev)}
                    className={`p-3 rounded-xl bg-neutral-800 border border-neutral-700 transition-all active:scale-95 cursor-pointer ${
                      isMuted ? 'text-red-400' : 'text-gray-300'
                    }`}
                    title="Silenciar"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>

                  {/* Recordatorio de orientación horizontal */}
                  <div className="hidden xs:flex items-center gap-1.5 text-[9.5px] font-black tracking-wide text-amber-400 bg-neutral-950/80 border border-neutral-800 px-3 py-2.5 rounded-xl">
                    <span>🔄 Gira pantalla para ver más grande</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
