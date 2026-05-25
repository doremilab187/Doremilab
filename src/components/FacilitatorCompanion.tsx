/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Map, Volume2, Save, FileText, Sparkles, BookOpen, Users, HelpCircle, HardDrive, Layout, ChevronRight, ShieldCheck } from 'lucide-react';
import { SavedSession, SessionEvaluation } from '../types';
import { audioInstance } from '../utils/AudioEngine';

interface FacilitatorCompanionProps {
  lastEvaluations?: SessionEvaluation[];
  onLoadSession?: (session: SavedSession) => void;
}

export const FacilitatorCompanion: React.FC<FacilitatorCompanionProps> = ({ lastEvaluations }) => {
  const [activeTab, setActiveTab] = useState<'blueprint' | 'sandbox' | 'history' | 'pedagogy'>('blueprint');
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  
  // Form fields for new session log
  const [groupName, setGroupName] = useState<string>('');
  const [childCount, setChildCount] = useState<number>(12);
  const [tutorName, setTutorName] = useState<string>('');
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState<boolean>(false);

  // Load historical logs on mount
  useEffect(() => {
    const logs = localStorage.getItem('dalcroze_sessions_log');
    if (logs) {
      try {
        setSavedSessions(JSON.parse(logs));
      } catch (e) {
        console.error("Error cargando históricos:", e);
      }
    }
  }, []);

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName || !tutorName) {
      alert("Por favor completa el nombre del grupo y el tutor facilitador.");
      return;
    }

    // Capture standard evaluations from play context (or fill with defaults)
    const currentEvaluations: SessionEvaluation[] = lastEvaluations || [
      { blockId: 1, rhythmSinc: 3, engagement: 3, understanding: 3, notes: 'Intro quieta.' },
      { blockId: 2, rhythmSinc: 3, engagement: 3, understanding: 3, notes: 'Movimientos de siembra.' },
      { blockId: 3, rhythmSinc: 3, engagement: 3, understanding: 3, notes: 'Trapos azules ondeados.' },
      { blockId: 4, rhythmSinc: 3, engagement: 3, understanding: 3, notes: 'Brazos expandidos.' },
      { blockId: 5, rhythmSinc: 3, engagement: 3, understanding: 3, notes: 'Sacudidas de rayo.' },
      { blockId: 6, rhythmSinc: 3, engagement: 3, understanding: 3, notes: 'Estatua silenciosa.' },
      { blockId: 7, rhythmSinc: 3, engagement: 3, understanding: 3, notes: 'Marcha con palos.' },
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

    // Reset fields
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

  return (
    <div id="facilitator-tactical-companion" className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 md:p-6 shadow-xl text-white">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-base md:text-lg font-bold text-amber-500 font-sans tracking-tight">
            Caja de Herramientas para Facilitadores
          </h2>
          <p className="text-xs text-neutral-400 font-sans mt-0.5">
            Fundación Monte Tabor • Ciudad Bolívar, Bogotá, Colombia
          </p>
        </div>

        {/* COMPANION NAVIGATION BUTTONS */}
        <div className="flex flex-wrap gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-[11px] font-mono">
          <button
            onClick={() => setActiveTab('blueprint')}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              activeTab === 'blueprint' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Espacio 3x3m</span>
          </button>
          
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              activeTab === 'sandbox' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Banco Sonos</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              activeTab === 'history' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Historial</span>
          </button>

          <button
            onClick={() => setActiveTab('pedagogy')}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              activeTab === 'pedagogy' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Pedagogía</span>
          </button>
        </div>
      </div>

      {/* QUICK CHANNELS CATEGORIES FOR FACILITATORS */}
      <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-inner relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-lg shadow">
            📢
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono uppercase text-gray-200 tracking-wider">Categorías de Inducción del Audiovisual</h3>
            <p className="text-[11px] text-gray-400 leading-normal max-w-md mt-0.5">
              Utiliza estas opciones para lanzar directamente el manual guiado, el centro de soporte técnico offline, o la reproducción de escena deseada.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto relative z-10">
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-storyplayer-menu', { detail: { tab: 'tutorial' } }));
              document.getElementById('storyplayer-interactive-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex-1 md:flex-initial bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-amber-500 text-[11px] font-mono font-black py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all hover:scale-[1.03] active:scale-95"
          >
            <span>🗂️ TUTORIAL</span>
          </button>

          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-storyplayer-menu', { detail: { tab: 'help' } }));
              document.getElementById('storyplayer-interactive-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex-1 md:flex-initial bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-cyan-400 text-[11px] font-mono font-black py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all hover:scale-[1.03] active:scale-95"
          >
            <span>❓ AYUDA / SOPORTE</span>
          </button>

          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-storyplayer-menu', { detail: { tab: 'play' } }));
              document.getElementById('storyplayer-interactive-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex-1 md:flex-initial bg-amber-500 hover:bg-amber-400 text-neutral-950 text-[11px] font-mono font-black py-2 px-3.5 rounded-lg flex items-center justify-center gap-1.5 transition-all hover:scale-[1.03] active:scale-95 shadow shadow-amber-500/10 uppercase"
          >
            <span>🎬 REPRODUCIR</span>
          </button>
        </div>
      </div>

      {/* RENDERED TABS CONTENT */}

      {/* TAB 1: SPATIAL BLUEPRINT MAP */}
      {activeTab === 'blueprint' && (
        <div id="blueprint-panel" className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
          <div className="md:col-span-7 bg-neutral-950 p-4 border border-neutral-800 rounded-xl flex flex-col items-center">
            <h3 className="text-xs font-bold text-gray-300 mb-3 font-mono uppercase tracking-wider">Planificación del Salón (Área libre 3x3 metros)</h3>
            
            {/* Direct Vector Grid Map representing the classroom */}
            <div className="w-full max-w-sm aspect-square bg-neutral-900 rounded-lg border-2 border-dashed border-amber-500/30 p-4 relative flex flex-col justify-between overflow-hidden shadow-inner">
              <div className="absolute inset-x-0 top-0 h-6 bg-amber-950/20 border-b border-amber-900/30 flex justify-center items-center text-[9px] font-mono text-amber-500/80">
                PANTALLA PROYECTADA / GRUPO DE TÓTEMS
              </div>
              
              {/* Space layout nodes */}
              <div className="flex-1 flex flex-col justify-around items-center my-6">
                {/* Visualizer Projector Node */}
                <div className="absolute top-4 text-center">
                  <span className="text-[9px] bg-sky-950 text-cyan-300 border border-sky-800 px-1.5 py-0.5 rounded-full font-mono uppercase">Proyector</span>
                </div>

                {/* Kids distribution area */}
                <div className="grid grid-cols-3 gap-6 text-center w-full max-w-xs mt-4">
                  <div className="flex flex-col items-center">
                    <span className="w-7 h-7 rounded-full bg-emerald-600 border border-white text-white font-mono text-xs flex items-center justify-center font-bold">N</span>
                    <span className="text-[8px] text-gray-400 font-mono mt-1">Infante A</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="w-7 h-7 rounded-full bg-emerald-600 border border-white text-white font-mono text-xs flex items-center justify-center font-bold">N</span>
                    <span className="text-[8px] text-gray-400 font-mono mt-1">Infante B</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="w-7 h-7 rounded-full bg-emerald-600 border border-white text-white font-mono text-xs flex items-center justify-center font-bold">N</span>
                    <span className="text-[8px] text-gray-400 font-mono mt-1">Infante C</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <span className="w-7 h-7 rounded-full bg-emerald-600 border border-white text-white font-mono text-xs flex items-center justify-center font-bold">N</span>
                    <span className="text-[8px] text-gray-400 font-mono mt-1">Infante D</span>
                  </div>
                  <div className="flex flex-col items-center border border-amber-500/20 rounded p-1">
                    {/* Safe dynamic circle */}
                    <span className="w-7 h-7 rounded-full bg-amber-500 text-neutral-950 text-xs flex items-center justify-center font-mono font-black animate-scale">★</span>
                    <span className="text-[8.5px] text-amber-400 font-bold block leading-tight mt-1">Punto Seguro</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="w-7 h-7 rounded-full bg-emerald-600 border border-white text-white font-mono text-xs flex items-center justify-center font-bold">N</span>
                    <span className="text-[8px] text-gray-400 font-mono mt-1">Infante E</span>
                  </div>
                </div>

                {/* Facilitator role placement */}
                <div className="flex flex-col items-center border border-blue-900 bg-blue-950/25 px-2.5 py-1 rounded shadow-md mt-6 z-10">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center">T</span>
                  <span className="text-[9.5px] text-blue-300 font-bold tracking-wider mt-1 uppercase">Facilitador (Tutor)</span>
                  <p className="text-[8px] text-gray-400 leading-tight block text-center mt-0.5 max-w-[120px]">
                    Modeling lateral y de frente
                  </p>
                </div>
              </div>

              {/* Floor boundary lines */}
              <div className="absolute inset-x-2 bottom-2 text-center text-[8.5px] font-mono text-neutral-500">
                Paredes Libres / Zona despejada • Materiales listos a los lados
              </div>
            </div>
          </div>

          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-amber-500 mb-2 font-mono uppercase">Preparación Recomendada (Tabor)</h4>
              <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                El audiovisual está adaptado para ser coordinado por un facilitador local sin previa experiencia musical. Sigue estas recomendaciones prácticas de testeo:
              </p>
              
              <ul className="flex flex-col gap-3 text-xs text-gray-300">
                <li className="flex items-start gap-2.5">
                  <span className="bg-neutral-800 text-amber-500 rounded p-1 font-mono text-[9px] font-bold">01</span>
                  <div>
                    <strong className="text-neutral-100 block">Saneamiento del Espacio:</strong>
                    Muevan mesas y pupitres para asegurar el área central libre (mínimo 3x3 metros). Los niños se mueven mejor en círculo o semicírculo.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="bg-neutral-800 text-amber-500 rounded p-1 font-mono text-[9px] font-bold">02</span>
                  <div>
                    <strong className="text-neutral-100 block">Sintonización de Cajas Acústicas:</strong>
                    El volumen de la proyección debe ser de medio-alto. La voz del narrador debe rebasar sonoramente el bullicio natural del movimiento de pies de 12 niños.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="bg-neutral-800 text-amber-500 rounded p-1 font-mono text-[9px] font-bold">03</span>
                  <div>
                    <strong className="text-neutral-100 block">Cesta de Recursos Físicos:</strong>
                    Mantén a la mano 15 trapos/pañuelos azules ligeros (Bloque 3 - Agua) y 15 bastones rústicos de madera ligera sin astillas (Bloque 7 - Sol).
                  </div>
                </li>
              </ul>
            </div>

            <div className="mt-4 p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-xs leading-normal">
              <span className="font-bold text-indigo-400 block mb-1">💡 Tip de Sincronía Dalcroze:</span>
              "Si observas que los niños tienen dificultad de seguir el pulso de Tierra o Sol, marchar junto con ellos exagerando el levantamiento de las rodillas es la forma más rápida de sintonización corporal."
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE TRAINING SANDBOX */}
      {activeTab === 'sandbox' && (
        <div id="sandbox-panel" className="flex flex-col gap-5 animate-fade-in">
          <div>
            <h3 className="text-xs font-bold text-gray-300 mb-1.5 font-mono uppercase tracking-wider">Teclado de Sonoterapia y Práctica para el Facilitador</h3>
            <p className="text-xs text-neutral-400">
              Usa estos pulsadores sonoros para reproducir las síntesis rítmicas del audiovisual y familiarizarte con las directrices físicas del Método Dalcroze:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Play Earth deep thud */}
            <div className="bg-neutral-950 p-4 border border-neutral-800 hover:border-amber-600/50 rounded-xl transition-all flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold font-mono text-amber-500">TIERRA — Pulso</span>
                <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-900/40 text-amber-400 font-mono">BOM! 90 BPM</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-normal">
                Marcha firme golpeando fuerte en cada BOM profundo y lanza semillas rítmicamente.
              </p>
              <button
                onClick={() => {
                  audioInstance.playBom();
                  audioInstance.playPluck(196);
                }}
                className="w-full bg-amber-600 hover:bg-amber-500 text-neutral-950 text-[10.5px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 hover:scale-[1.03] active:scale-95 transition-all"
              >
                <Volume2 className="w-4 h-4" />
                <span>Simular Pulso Grave</span>
              </button>
            </div>

            {/* Play Water drip */}
            <div className="bg-neutral-950 p-4 border border-neutral-800 hover:border-cyan-600/50 rounded-xl transition-all flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold font-mono text-cyan-400">AGUA — Alturas</span>
                <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-900/40 text-cyan-400 font-mono">Agido / Grave</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-normal">
                Sube el pañuelo azul en el tono agudo metálico, bájalo en el grave.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => audioInstance.playDrip(true)}
                  className="bg-cyan-800 hover:bg-cyan-700 text-white text-[10px] py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Agudo (Arriba)</span>
                </button>
                <button
                  onClick={() => audioInstance.playDrip(false)}
                  className="bg-cyan-950 hover:bg-cyan-900 text-cyan-100 text-[10px] py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Grave (Abajo)</span>
                </button>
              </div>
            </div>

            {/* Play Wind breeze sweep */}
            <div className="bg-neutral-950 p-4 border border-neutral-800 hover:border-neutral-400 rounded-xl transition-all flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold font-mono text-neutral-200">VIENTO — Dinámica</span>
                <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-300 font-mono">Piano / Forte</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-normal">
                Sostén los brazos apretados contra el pecho en piano, y ábrelos de manera circular en crescendo.
              </p>
              <button
                onClick={() => {
                  audioInstance.playPluck(330);
                  setTimeout(() => {
                    audioInstance.playPluck(440);
                  }, 250);
                }}
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-gray-100 text-[10.5px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 hover:scale-[1.03] active:scale-95 transition-all"
              >
                <Volume2 className="w-4 h-4" />
                <span>Escuchar Brisa Piano</span>
              </button>
            </div>

            {/* Play Thunder shock */}
            <div className="bg-neutral-950 p-4 border border-neutral-800 hover:border-indigo-600/50 rounded-xl transition-all flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold font-mono text-indigo-400">TRUENO 1 — Contraste</span>
                <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-indigo-950/40 border border-indigo-900/40 text-indigo-400 font-mono">Rayo súbito</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-normal">
                Sigue el flujo de viento y sacude violentamente el cuerpo un segundo ante el chispazo eléctrico.
              </p>
              <button
                onClick={() => audioInstance.playLightning()}
                className="w-full bg-indigo-900 hover:bg-indigo-800 text-white text-[10.5px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 hover:scale-[1.03] active:scale-95 transition-all"
              >
                <Volume2 className="w-4 h-4" />
                <span>Detonación Rayo!</span>
              </button>
            </div>

            {/* Play Sigilo march */}
            <div className="bg-neutral-950 p-4 border border-neutral-800 hover:border-purple-600/50 rounded-xl transition-all flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold font-mono text-purple-400">TRUENO 2 — Sigilo</span>
                <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-purple-950/40 border border-purple-900/40 text-purple-400 font-mono">Marcha lenta</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-normal">
                Paso sigiloso en puntillas de pies siguiendo el pulso pesado de acero metálico.
              </p>
              <button
                onClick={() => {
                  audioInstance.playMarchSnare(false);
                }}
                className="w-full bg-purple-900 hover:bg-purple-800 text-white text-[10.5px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 hover:scale-[1.03] active:scale-95 transition-all"
              >
                <Volume2 className="w-4 h-4" />
                <span>Simular Paso Sigilo</span>
              </button>
            </div>

            {/* Play Sol accented military march */}
            <div className="bg-neutral-950 p-4 border border-neutral-800 hover:border-yellow-600/50 rounded-xl transition-all flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold font-mono text-yellow-500">SOL — Acento</span>
                <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-yellow-950/40 border border-yellow-900/40 text-yellow-400 font-mono">Compás 4/4</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-normal">
                Marcha orgullosa con bastón. En el pulso acentuado central, salta y golpea la tierra al caer.
              </p>
              <button
                onClick={() => {
                  audioInstance.playMarchSnare(true);
                  audioInstance.playBom();
                }}
                className="w-full bg-yellow-600 hover:bg-yellow-500 text-neutral-950 text-[10.5px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 hover:scale-[1.03] active:scale-95 transition-all"
              >
                <Volume2 className="w-4 h-4" />
                <span>Pulso Acentuado</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OFFLINE SESSION LOGGER DATABASE */}
      {activeTab === 'history' && (
        <div id="session-logger-history" className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Form logger to feed historical logs */}
          <form onSubmit={handleSaveSession} className="md:col-span-5 bg-neutral-950 p-4 border border-neutral-800 rounded-xl flex flex-col gap-3">
            <h3 className="text-xs font-bold font-mono text-amber-500 uppercase tracking-wider">Registrar Resultados de la Sesión</h3>
            
            <div>
              <label className="block text-[10.5px] font-mono text-gray-400 uppercase mb-1">Nombre del Grupo / Grado:</label>
              <input
                type="text"
                required
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Ej. Fundación Monte Tabor Grado 4"
                className="w-full text-xs p-2 rounded bg-neutral-900 border border-neutral-800 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10.5px] font-mono text-gray-400 uppercase mb-1">Niños Presentes:</label>
                <input
                  type="number"
                  min="2"
                  max="40"
                  required
                  value={childCount}
                  onChange={(e) => setChildCount(Number(e.target.value))}
                  className="w-full text-xs p-2 rounded bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-mono text-gray-400 uppercase mb-1">Nombre del Facilitador:</label>
                <input
                  type="text"
                  required
                  value={tutorName}
                  onChange={(e) => setTutorName(e.target.value)}
                  placeholder="Ej. Frayle Javier"
                  className="w-full text-xs p-2 rounded bg-neutral-900 border border-neutral-800 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10.5px] font-mono text-gray-400 uppercase mb-1">Notas Críticas Generales:</label>
              <textarea
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="Ej. Excelente recepción, las pausas permitieron calmar el salón en el Trueno. El uso de los palos de escoba fue ordenado."
                className="w-full text-xs p-2 rounded bg-neutral-900 border border-neutral-800 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 h-20 resize-none"
              />
            </div>

            {isSavedSuccessfully && (
              <div className="p-2 border border-emerald-900 bg-emerald-950/45 text-emerald-400 text-xs rounded font-medium flex items-center gap-1.5 animate-pulse">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Sesión guardada exitosamente en LocalStorage offline!</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow shadow-amber-500/10"
            >
              <Save className="w-4 h-4" />
              <span>REGISTRAR SESIÓN</span>
            </button>
          </form>

          {/* Render historical list of sessions mapped to logs */}
          <div className="md:col-span-7 bg-neutral-950/80 p-4 border border-neutral-800 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2 mb-3">
                <span className="text-xs font-bold font-mono text-gray-300 uppercase tracking-wider">Historial Escrito (Preservación Offline)</span>
                {savedSessions.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-[10px] text-red-400 hover:underline hover:text-red-300 font-mono uppercase"
                  >
                    Vaciar Historial
                  </button>
                )}
              </div>

              {savedSessions.length === 0 ? (
                <div className="text-center py-12 text-gray-500 flex flex-col items-center gap-2">
                  <span className="text-2xl">🗃️</span>
                  <p className="text-xs font-sans">No se han registrado sesiones en este dispositivo todavía.</p>
                  <p className="text-[10.5px] text-gray-600 max-w-xs leading-normal">
                    Al terminar la simulación del audiovisual interactivo, llena el formulario lateral para conservar tus observaciones.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[280px] overflow-y-auto pr-1">
                  {savedSessions.map(session => (
                    <div key={session.id} className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-all text-xs flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                        <span>{session.date}</span>
                        <span>ID: {session.id.split('_')[1]}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-amber-500 text-xs">{session.groupName}</span>
                        <span className="bg-neutral-800 px-1.5 py-0.5 rounded text-[10px] text-gray-300">
                          {session.childCount} niños presentas
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400">
                        <strong className="text-gray-300">Tutor:</strong> {session.tutorName}
                      </div>
                      {session.generalNotes && (
                        <p className="text-[11px] text-gray-300 italic bg-neutral-950 p-2 rounded border border-neutral-850/60 leading-normal">
                          "{session.generalNotes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-[10px] text-gray-500 font-mono text-center pt-3 border-t border-neutral-800/80 mt-4">
              * Los datos se guardan estrictamente bajo la tecnología LocalStorage de tu navegador. Útil para ambientes rurales sin conectividad.
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PEDAGOGICAL DALCROZE THEORETICAL FRAMEWORK */}
      {activeTab === 'pedagogy' && (
        <div id="pedagogical-theoretical-framework" className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in text-xs leading-relaxed">
          <div className="md:col-span-6 bg-neutral-950 p-4 border border-neutral-800 rounded-xl">
            <h4 className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider mb-3">La Estructura Metodológica Dalcroze</h4>
            <div className="flex flex-col gap-3 text-neutral-300">
              <p>
                La **Euritmia Dalcroze** concibe que el cuerpo es el primer instrumento musical que debe ser educado. El oído percibe las ondas, el sistema nervioso coordina la recepción, y la corporalidad se desplaza en el espacio traduciendo el sonido.
              </p>
              
              <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-850">
                <span className="font-bold text-gray-200 block mb-1">Las Equivalencias Fundamentadas:</span>
                <ul className="list-disc list-inside space-y-1 text-gray-400 text-[11px]">
                  <li><strong className="text-amber-500 font-mono">Altura Tonal</strong> → Arriba (agudo) de puntillas / Abajo (grave) tocando tierra.</li>
                  <li><strong className="text-amber-500 font-mono">Dinámica</strong> → Grado de extensión de brazos simétrica (Piano a Forte).</li>
                  <li><strong className="text-amber-500 font-mono">Tempo</strong> → Rapidez métrica de la zancada o marcha.</li>
                  <li><strong className="text-amber-500 font-mono">Acento</strong> → Salto vertical explosivo con descarga en piso.</li>
                  <li><strong className="text-amber-500 font-mono">Silencio</strong> → Estatua de piedra congelada.</li>
                </ul>
              </div>

              <p>
                Esta progresión (del pulso cimiento de Tierra, cruzando por alturas y dinámicas, hacia la integración en Sol) garantiza una internalización musical natural sin necesidad de que el niño aprenda solfeo teórico formal a temprana edad.
              </p>
            </div>
          </div>

          <div className="md:col-span-6 bg-neutral-950 p-4 border border-neutral-800 rounded-xl">
            <h4 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider mb-3">
              Validación y Origen de Campo (Bogotá, 2026)
            </h4>
            <div className="flex flex-col gap-3 text-neutral-300">
              <p>
                El diseño audiovisual de este teatrillo fue rigurosamente validado en el terreno de Ciudad Bolívar y formulado mediante la fase Kumar/Design Sprint:
              </p>

              <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-850 flex flex-col gap-2 text-[11px] text-gray-400">
                <div className="flex gap-2">
                  <span className="text-cyan-400">✔</span>
                  <p>
                    <strong className="text-gray-100 block">Especialista Pedagogía Musical:</strong>
                    Prof. **Esperanza Rincón** (Red Dalcroze de Colombia) validó la precisión de los tiempos y altura sonoras de los bloques.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="text-cyan-400">✔</span>
                  <p>
                    <strong className="text-gray-100 block">Usabilidad de Campo (Ciudad Bolívar):</strong>
                    Frayle Javier (Coordinador Monte Tabor) validó que los tutores consiguen coordinar la clase gracias a las pausas pedagógicas explícitas.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="text-cyan-400">✔</span>
                  <p>
                    <strong className="text-gray-100 block">Co-Creación de Escenarios:</strong>
                    Los 5 tótems (Tierra, Agua, Viento, Trueno, Sol) provienen de los bocetos de dibujos de los propios niños.
                  </p>
                </div>
              </div>

              <div className="border border-neutral-850 p-3 rounded bg-neutral-900/60 text-gray-400 leading-normal text-[11px]">
                <strong className="text-gray-200 block mb-1">Referentes Metodológicos:</strong>
                Vernia (2012) remarca que la imitación es un catalizador cognitivo; Deterding et al. (2023) ratifica que la narrativa activa intrínseca rinde mejor sin la penalidad artificial de puntos o clasificaciones.
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
