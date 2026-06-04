/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, BookOpen, Volume2, VolumeX, HelpCircle, Home, Sparkles, Heart, Activity, Settings, Music, RefreshCw } from 'lucide-react';
import { StoryPlayer } from './components/StoryPlayer';
import { InteractiveTutorial } from './components/InteractiveTutorial';
import { FacilitatorWorkspace } from './components/FacilitatorWorkspace';
import { AdaggioPuppet } from './components/AdaggioPuppet';
import { SoundLogoSplash } from './components/SoundLogoSplash';
import { audioInstance } from './utils/AudioEngine';
import { SessionEvaluation } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'tutorial' | 'story' | 'facilitator'>('home');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [activeEvaluations, setActiveEvaluations] = useState<SessionEvaluation[] | undefined>(undefined);
  const [showInitialSplash, setShowInitialSplash] = useState<boolean>(true);
  const [viewLoadingOverlay, setViewLoadingOverlay] = useState<'story' | 'tutorial' | null>(null);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    try {
      audioInstance.setMute(nextMuted);
      audioInstance.setSoundEnabled(!nextMuted);
    } catch (_) {}
  };

  const handleSessionComplete = (evaluations: SessionEvaluation[]) => {
    setActiveEvaluations(evaluations);
    setCurrentView('home');
  };

  const handleGoHome = () => {
    try {
      audioInstance.stop();
    } catch (_) {}
    setCurrentView('home');
  };

  if (showInitialSplash) {
    return (
      <SoundLogoSplash
        onComplete={() => setShowInitialSplash(false)}
      />
    );
  }

  const isHome = currentView === 'home';

  return (
    <div 
      id="dalcroze-app-root" 
      className={`min-h-screen text-[#472F92] font-sans antialiased ${isHome ? 'pb-4' : 'pb-28'} relative selection:bg-yellow-250 selection:text-neutral-900 flex flex-col justify-between overflow-x-hidden transition-all duration-700 bg-cover bg-center bg-no-repeat`}
      style={{
        backgroundImage: isHome ? 'url("/Portada/Portada.png")' : 'none',
        backgroundColor: '#FFFDF1'
      }}
    >
      
      {/* Decorative fluffy white cloud vectors for sweet kid theme - only when not in home-view to keep cover clean */}
      {!isHome && (
        <>
          <div className="absolute top-8 left-[10%] w-48 h-12 bg-white/70 rounded-full blur-md pointer-events-none opacity-60" />
          <div className="absolute top-20 right-[5%] w-60 h-16 bg-white/70 rounded-full blur-md pointer-events-none opacity-60" />
          <div className="absolute bottom-[25%] left-[-5%] w-72 h-20 bg-white/50 rounded-full blur-lg pointer-events-none opacity-50" />
        </>
      )}

      {/* Main Content Area */}
      <main className={`max-w-7xl mx-auto px-4 md:px-8 relative z-10 flex-1 w-full flex flex-col justify-center ${isHome ? 'mt-0' : 'mt-5 md:mt-10'}`}>
        
        <AnimatePresence mode="wait">
          
          {/* 1. COMPLETED FAITHFUL MENU HOME SCREEN */}
          {currentView === 'home' && (
            <motion.div
              key="home-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ type: "spring", stiffness: 90, damping: 14 }}
              className="w-full flex flex-col items-center md:items-start md:pl-1 lg:pl-4 pt-10 md:pt-[270px] lg:pt-[320px] pb-4 max-w-7xl mx-auto relative z-10"
            >
              
              {/* 1.1 THREE COPIED GLASSY BUBBLE JELLY PILL BUTTONS */}
              <div className="flex flex-col gap-5 w-full max-w-md px-2 md:px-0 text-left">
                
                {/* Button A: Historia (Aqua/Mint Bubbly Styling) */}
                <button
                  id="btn-historia-play"
                  onClick={() => setViewLoadingOverlay('story')}
                  className="relative group bg-gradient-to-r from-[#A3F1E3] to-[#46E4CF] hover:from-[#B4F7EC] hover:to-[#57EBD5] border-[4px] border-[#31C3AA] active:border-[#1F9F8B] px-5 py-4 rounded-[26px] shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-left flex items-center gap-4 cursor-pointer overflow-hidden select-none"
                >
                  {/* Bubbly Gloss Highlight Reflection Overlay */}
                  <div className="absolute top-0.5 left-2 right-2 h-2.5 bg-white/40 rounded-full blur-[0.5px]" />
                  <div className="absolute top-1 right-3 w-4 h-4 bg-white/20 rounded-full blur-[1px]" />
                  
                  {/* Left Icon Panel: Specular purple clapperboard */}
                  <div className="w-14 h-14 rounded-2xl bg-[#7052E6] border-2 border-white flex flex-col items-center justify-center shadow-md relative overflow-hidden flex-shrink-0 group-hover:rotate-[-3deg] transition-transform">
                    {/* Clapper stripes topper */}
                    <div className="absolute top-0 left-0 right-0 h-4 bg-zinc-950 flex justify-between overflow-hidden">
                      <div className="h-full w-2 bg-white skew-x-12" />
                      <div className="h-full w-2 bg-white skew-x-12" />
                      <div className="h-full w-2 bg-white skew-x-12" />
                      <div className="h-full w-2 bg-white skew-x-12" />
                    </div>
                    {/* Play triangle inside clapperboard */}
                    <Play className="w-5 h-5 fill-white text-white mt-3 ml-0.5" />
                  </div>

                  {/* Button text */}
                  <div>
                    <h3 className="font-black text-[25px] text-[#472F92] leading-none mb-1 font-funny tracking-wide uppercase">
                      Historia
                    </h3>
                    <p className="text-[#309A87] text-xs font-semibold leading-tight font-sans">
                      Audioguía Animada • ¡Viaja y juega con Adaggio!
                    </p>
                  </div>
                </button>

                {/* Button B: Tutorial (Lilac/Lavender Bubbly Styling) */}
                <button
                  id="btn-tutorial-play"
                  onClick={() => setViewLoadingOverlay('tutorial')}
                  className="relative group bg-gradient-to-r from-[#E9CEFC] to-[#D598FB] hover:from-[#F0D9FF] hover:to-[#DEA7FE] border-[4px] border-[#BE82ED] active:border-[#A467D4] px-5 py-4 rounded-[26px] shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-left flex items-center gap-4 cursor-pointer overflow-hidden select-none"
                >
                  {/* Gloss Reflection Layer */}
                  <div className="absolute top-0.5 left-2 right-2 h-2.5 bg-white/45 rounded-full blur-[0.5px]" />
                  <div className="absolute top-1 right-3 w-4 h-4 bg-white/25 rounded-full blur-[1px]" />

                  {/* Icon: Purple graduation cap with gold tassel */}
                  <div className="w-14 h-14 rounded-2xl bg-[#7052E6] border-2 border-white flex items-center justify-center shadow-md flex-shrink-0 group-hover:rotate-3 transition-transform">
                    <div className="relative">
                      <BookOpen className="w-6 h-6 text-white" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-yellow-400 border border-white animate-ping" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-[25px] text-[#472F92] leading-none mb-1 font-funny tracking-wide uppercase">
                      Tutorial
                    </h3>
                    <p className="text-[#965EA5] text-xs font-semibold leading-tight font-sans">
                      Entrena tus sonidos • Trueno, viento, agua, sol y tierra.
                    </p>
                  </div>
                </button>

              </div>

              {/* 1.2 Bottom Left Wood Ribbon "Elige una opción para comenzar" */}
              <div className="relative mt-8 select-none self-center md:self-start">
                {/* Rustic Wood Grain SVG Wrapper */}
                <div className="relative bg-[#F6DFA8] border-[3px] border-[#D3B678] text-[#7A5A18] font-sans font-black text-sm tracking-wide px-7 py-3 rounded-full shadow-md flex items-center justify-center min-w-[290px] overflow-hidden">
                  
                  {/* Cute purple flower design at the bottom-left corner */}
                  <div className="absolute -left-3 -bottom-3 w-10 h-10 flex items-center justify-center select-none scale-110">
                    {/* Petals */}
                    <div className="absolute w-5 h-5 rounded-full bg-[#8E5BF1] left-1 top-2" />
                    <div className="absolute w-5 h-5 rounded-full bg-[#8E5BF1] right-1 top-2" />
                    <div className="absolute w-[#8E5BF1] left-2 bottom-1" />
                    <div className="absolute w-5 h-5 rounded-full bg-[#8E5BF1] left-2 bottom-1" />
                    <div className="absolute w-5 h-5 rounded-full bg-[#8E5BF1] right-2 bottom-1" />
                    <div className="absolute w-5 h-5 rounded-full bg-[#8E5BF1] bottom-3 left-3" />
                    {/* Green leaf wraps */}
                    <div className="absolute w-4 h-3 bg-[#8AD94E] rounded-full rotate-45 -left-1 bottom-0" />
                    <div className="absolute w-4 h-3 bg-[#8AD94E] rounded-full -rotate-45 -right-1 bottom-0" />
                    {/* Yellow center cap */}
                    <div className="absolute w-2.5 h-2.5 rounded-full bg-[#FFC927]" />
                  </div>

                  <span className="pl-3.5">
                    Elige una opción para comenzar
                  </span>
                </div>
              </div>

              {/* 1.3 FIXED SETTINGS/GEAR BUTTON FOR THE FACILITATOR AT BOTTOM RIGHT */}
              <button
                id="btn-facilitator-setup"
                onClick={() => setCurrentView('facilitator')}
                className="fixed bottom-4 right-4 md:right-8 z-45 bg-[#FCFBEB] p-4.5 rounded-[22px] border-[3px] border-[#CBA86B] text-[#5A2EAC] cursor-pointer hover:bg-white hover:scale-108 active:scale-92 transition-all shadow-xl flex items-center justify-center group"
                title="Configuración de Facilitador & Alistamiento"
              >
                <Settings className="w-7 h-7 text-[#5A2EAC] group-hover:rotate-45 transition-transform duration-500" />
                <span className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse" />
              </button>

            </motion.div>
          )}



          {/* 3. COCKPIT OF FACILITATOR / ALISTAMIENTO */}
          {currentView === 'facilitator' && (
            <motion.div
              key="facilitator-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-4xl mx-auto py-2"
            >
              {/* Header with quick close button */}
              <div className="flex justify-between items-center bg-[#A250F4] text-white px-5 py-3 rounded-t-2xl shadow-md border-b-[3px] border-[#7D32CA]">
                <span className="font-mono text-xs font-black tracking-widest uppercase">
                  ⚡ Espacio del Facilitador de Aula
                </span>
                <button
                  onClick={handleGoHome}
                  className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-neutral-100 text-[#472F92] font-funny font-black text-sm uppercase cursor-pointer shadow-sm transition-colors tracking-wide"
                >
                  Cerrar Cabina ✖
                </button>
              </div>

              {/* Render Facilitator Dashboard */}
              <div className="bg-white rounded-b-2xl shadow-xl overflow-hidden p-2 md:p-4">
                <FacilitatorWorkspace
                  lastEvaluations={activeEvaluations}
                  onSceneSelected={(id) => {
                    setCurrentView('story');
                  }}
                  onStartSession={() => {
                    setCurrentView('story');
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* 4. TUTORIAL SCREEN */}
          {currentView === 'tutorial' && (
            <motion.div
              key="tutorial-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-4xl mx-auto"
            >
              <InteractiveTutorial onBackToHome={handleGoHome} />
            </motion.div>
          )}

          {/* 5. STORY PLAYER SCREEN */}
          {currentView === 'story' && (
            <motion.div
              key="story-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 md:p-6"
            >
              <StoryPlayer onSessionComplete={handleSessionComplete} />
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* Global Interactive Bottom Footer Control Deck */}
      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-zinc-950/95 border border-zinc-800 text-white rounded-full px-6 py-3.5 shadow-2xl flex items-center gap-7 backdrop-blur-md">
        
        {/* volume button */}
        <button
          id="global-volume-button"
          onClick={handleToggleMute}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-all active:scale-90 hover:bg-zinc-900 cursor-pointer"
          title={isMuted ? "Activar sonido" : "Mudar sonido"}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
        </button>

        {/* separator */}
        <div className="w-px h-5 bg-zinc-800" />

        {/* Home button */}
        <button
          id="global-home-button"
          onClick={handleGoHome}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black font-funny text-sm uppercase tracking-wide transition-all disabled:opacity-50 cursor-pointer ${
            currentView === 'home' 
              ? 'text-amber-400 font-extrabold cursor-default pointer-events-none' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900 active:scale-95'
          }`}
          disabled={currentView === 'home'}
          title="Regresar al inicio"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Inicio</span>
        </button>

        {/* separator */}
        <div className="w-px h-5 bg-zinc-800" />

        {/* Help button */}
        <button
          id="global-help-button"
          onClick={() => setShowHelpModal(true)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-all active:scale-90 hover:bg-zinc-900 cursor-pointer"
          title="Ayuda de la aplicación"
        >
          <HelpCircle className="w-5 h-5 text-amber-500" />
        </button>

      </footer>

      {/* Help Modal Overlay */}
      <AnimatePresence>
        {showHelpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-white text-left overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

              <h3 className="text-lg font-black font-sans uppercase tracking-wide text-amber-500 flex items-center gap-1.5 flex-wrap">
                <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Acerca de</span>
                <img 
                  src="/Logo do re mi lab.svg" 
                  alt="Do Re Mi Lab" 
                  className="h-5 w-auto object-contain inline-block relative -top-[1px] ml-1 select-none"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/logo doremi lab.png";
                  }}
                />
              </h3>
              
              <div className="space-y-4 my-5 text-xs text-neutral-300 leading-relaxed font-sans">
                <p>
                  Esta plataforma interactiva está diseñada con base en la pedagogía musical de <strong className="text-white">Émile Jaques-Dalcroze</strong>. Propone que el ritmo no es un elemento puramente aritmético, sino corporal.
                </p>
                <div className="p-3 bg-neutral-950 rounded border border-neutral-850 space-y-2">
                  <span className="text-[10px] text-gray-500 block uppercase font-mono tracking-wider font-extrabold">Funcionamiento sugerido:</span>
                  <p>
                    1. <strong className="text-amber-400">Historia</strong> reproduce una guía sonora dividida en 9 escenas donde los niños deben moverse, saltar y congelarse imitando elementos naturales.
                  </p>
                  <p>
                    2. <strong className="text-amber-400">Tutorial</strong> permite ejercitar de manera individual y sensorial los sonidos del agua, sol, viento, tierra y trueno de forma totalmente práctica.
                  </p>
                </div>
                <div className="flex gap-1 items-center justify-center border-t border-neutral-850 pt-2 text-[10px] text-zinc-500 font-mono">
                  <span>Hecho con</span>
                  <Heart className="w-3 h-3 text-red-500 fill-current" />
                  <span>para la Fundación Monte Tabor</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black font-funny text-[13px] uppercase tracking-wide cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sound logo transitional loading screen overlay */}
      <AnimatePresence>
        {viewLoadingOverlay && (
          <SoundLogoSplash
            key="loading-sound-logo"
            autoPlayImmediately={true}
            onComplete={() => {
              setCurrentView(viewLoadingOverlay);
              setViewLoadingOverlay(null);
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
