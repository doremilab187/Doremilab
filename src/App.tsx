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

  return (
    <div id="dalcroze-app-root" className="min-h-screen bg-[#FFFDF1] text-[#472F92] font-sans antialiased pb-28 relative selection:bg-yellow-250 selection:text-neutral-900 flex flex-col justify-between overflow-x-hidden">
      
      {/* Decorative fluffy white cloud vectors for sweet kid theme */}
      <div className="absolute top-8 left-[10%] w-48 h-12 bg-white/70 rounded-full blur-md pointer-events-none opacity-60" />
      <div className="absolute top-20 right-[5%] w-60 h-16 bg-white/70 rounded-full blur-md pointer-events-none opacity-60" />
      <div className="absolute bottom-[25%] left-[-5%] w-72 h-20 bg-white/50 rounded-full blur-lg pointer-events-none opacity-50" />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-5 md:mt-10 relative z-10 flex-1 w-full flex flex-col justify-center">
        
        <AnimatePresence mode="wait">
          
          {/* 1. COMPLETED FAITHFUL MENU HOME SCREEN */}
          {currentView === 'home' && (
            <motion.div
              key="home-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ type: "spring", stiffness: 90, damping: 14 }}
              className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-4"
            >
              
              {/* LEFT BRANDING & GLASSY JELLY PIL BUTTONS SECTION - takes 7 cols on desktop */}
              <div className="md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left">
                
                {/* 1.1 Brand Logo "Do Re Mi Lab" Header on Top-Left */}
                <div className="flex items-center gap-2 mb-2 self-center md:self-start select-none">
                  <div className="relative flex items-center">
                    {/* Bouncy staff lines behind */}
                    <div className="absolute -top-3 left-0 right-0 h-8 flex flex-col justify-between opacity-35 pointer-events-none">
                      <div className="h-0.5 w-[160px] bg-[#472F92]" />
                      <div className="h-0.5 w-[160px] bg-[#472F92]" />
                      <div className="h-0.5 w-[160px] bg-[#472F92]" />
                    </div>
                    
                    {/* Rotated Hand-Drawn Letters */}
                    <span className="text-xl md:text-2xl font-black text-[#472F92] tracking-tighter rotate-[-6deg] hover:rotate-[6deg] transition-transform duration-300 drop-shadow-sm font-funny bg-yellow-200 border-2 border-[#472F92] px-2.5 py-0.5 rounded-xl block">
                      Do
                    </span>
                    <span className="text-xl md:text-2xl font-black text-[#FF4D94] tracking-tighter rotate-[8deg] hover:rotate-[-8deg] transition-transform duration-300 drop-shadow-sm font-funny bg-pink-100 border-2 border-[#FF4D94] px-2.5 py-0.5 rounded-xl -ml-1 block">
                      Re
                    </span>
                    <span className="text-xl md:text-2xl font-black text-[#1DD2C4] tracking-tighter rotate-[-10deg] hover:rotate-[10deg] transition-transform duration-300 drop-shadow-sm font-funny bg-cyan-100 border-2 border-[#1DD2C4] px-2.5 py-0.5 rounded-xl -ml-1 block">
                      mi
                    </span>
                    <span className="text-sm md:text-base font-black text-[#5A2EAC] tracking-tighter rotate-[5deg] hover:rotate-[-5deg] transition-transform duration-300 drop-shadow-sm font-funny bg-purple-200 border-2 border-[#5A2EAC] px-2 py-0.5 rounded-xl ml-2.5 block">
                      LAB
                    </span>
                  </div>
                </div>

                {/* 1.2 "BIENVENIDO" Header with perfect bubbly purple font */}
                <h1 className="text-4xl md:text-[52px] font-black tracking-tight text-[#472F92] uppercase leading-none select-none drop-shadow-[0_2px_0px_white] mb-8 font-funny">
                  BIENVENIDO
                </h1>

                {/* 1.3 THREE COPIED GLASSY BUBBLE JELLY PILL BUTTONS */}
                <div className="flex flex-col gap-5 w-full max-w-md px-2">
                  
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
                      <h3 className="font-black text-[25px] text-[#472F92] leading-none mb-1 font-funny tracking-wide">
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
                      <h3 className="font-black text-[25px] text-[#472F92] leading-none mb-1 font-funny tracking-wide">
                        Tutorial
                      </h3>
                      <p className="text-[#965EA5] text-xs font-semibold leading-tight font-sans">
                        Entrena tus sonidos • Trueno, viento, agua, sol y tierra.
                      </p>
                    </div>
                  </button>

                </div>

                {/* 1.4 Bottom Left Wood Ribbon "Elige una opción para comenzar" */}
                <div className="relative mt-8 select-none scale-95 md:scale-100 origin-left">
                  {/* Rustic Wood Grain SVG Wrapper */}
                  <div className="relative bg-[#F6DFA8] border-[3px] border-[#D3B678] text-[#7A5A18] font-sans font-black text-sm tracking-wide px-7 py-3 rounded-r-full rounded-l-md shadow-md flex items-center justify-between min-w-[290px] overflow-hidden pr-10">
                    
                    {/* Simulated split wood ending */}
                    <div className="absolute right-0 top-0 bottom-0 w-4 bg-[#FFFEF4] border-l-[3px] border-[#D3B678]" style={{ clipPath: "polygon(100% 0, 0 50%, 100% 100%, 100% 0)" }} />

                    {/* Cute purple flower design at the bottom-left corner */}
                    <div className="absolute -left-3 -bottom-3 w-10 h-10 flex items-center justify-center select-none scale-110">
                      {/* Petals */}
                      <div className="absolute w-5 h-5 rounded-full bg-[#8E5BF1] left-1 top-2" />
                      <div className="absolute w-5 h-5 rounded-full bg-[#8E5BF1] right-1 top-2" />
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

              </div>

              {/* RIGHT COL: WOODEN SIGN BOARD, BUNNY, GRASSY HILL - takes 5 cols on desktop */}
              <div className="md:col-span-5 flex flex-col items-center justify-center relative mt-6 md:mt-0 select-none">
                
                {/* 1.5 Climbing Vines with Leaves wrapping Hanging Wooden Board */}
                <div className="relative flex flex-col items-center">
                  
                  {/* Two Hanging Brown Ropes */}
                  <div className="flex justify-between w-40 h-12 pointer-events-none">
                    <div className="w-1 h-full bg-[#B29068] rounded-full shadow-inner" />
                    <div className="w-1 h-full bg-[#B29068] rounded-full shadow-inner" />
                  </div>

                  {/* Main Wood Plank "Do Re Mi Lab" with Green leaves climbing */}
                  <div className="relative -mt-1 bg-[#F6DFA8] border-[5px] border-[#CBA86B] rounded-[24px] px-8 py-3.5 shadow-xl max-w-sm text-center">
                    
                    {/* Specular highlight lines inside wood board */}
                    <div className="absolute inset-2 border border-dashed border-[#DFBD7C]/50 rounded-[16px] pointer-events-none" />

                    {/* Climbing Leaves wrapping Board Left & Right corners */}
                    <div className="absolute -left-4 -top-3 flex flex-col gap-1 pointer-events-none scale-105">
                      <span className="w-5 h-5 bg-[#8ED245] rounded-tl-full rounded-br-full border border-[#689B2B] shadow-sm rotate-12" />
                      <span className="w-4.5 h-4.5 bg-[#7CB73D] rounded-tr-full rounded-bl-full border border-[#568122] shadow-sm -rotate-45" />
                      <span className="w-3.5 h-3.5 bg-[#8ED245] rounded-tl-full rounded-br-full border border-[#689B2B] -ml-2" />
                    </div>
                    <div className="absolute -right-3 -bottom-2 flex flex-col gap-1 pointer-events-none scale-105">
                      <span className="w-4.5 h-4.5 bg-[#8ED245] rounded-tl-full rounded-br-full border border-[#689B2B] shadow-sm rotate-45" />
                      <span className="w-4 h-4 bg-[#6BAB32] rounded-tr-full rounded-bl-full border border-[#4E7F1F] shadow-sm -rotate-12" />
                    </div>

                    {/* Highly Polished Comic Font Text inside */}
                    <div className="flex flex-col items-center relative z-10">
                      
                      {/* Do Re mi String */}
                      <div className="flex items-center gap-1.5 font-funny font-black text-3xl md:text-4xl select-none leading-none">
                        <span className="text-[#513DF1] drop-shadow-[0_1.5px_0_white]">Do</span>
                        <span className="text-[#20CDC3] drop-shadow-[0_1.5px_0_white]">Re</span>
                        <span className="text-[pink] text-[#F32E90] drop-shadow-[0_1.5px_0_white]">mi</span>
                      </div>

                      {/* Lab String - Big block style */}
                      <div className="flex items-center justify-center gap-1 font-funny font-black text-5xl md:text-[64px] tracking-wide mt-1.5 leading-none select-none">
                        <span className="text-[#20CDC3] rotate-[-5deg] drop-shadow-[0_2px_0_white] uppercase hover:scale-115 transition-transform">L</span>
                        <span className="text-[#FF4D94] rotate-[6deg] drop-shadow-[0_2px_0_white] uppercase hover:scale-115 transition-transform -mx-1.5">a</span>
                        <span className="text-[#9C3FE6] rotate-[-4deg] drop-shadow-[0_2px_0_white] uppercase hover:scale-115 transition-transform">b</span>
                      </div>

                    </div>
                  </div>

                </div>

                {/* 1.6 Rotating Mascot (Bunny) standing on grassy hill */}
                <div className="relative mt-2 w-72 h-80 flex flex-col items-center justify-end">
                  
                  {/* Pink and blue musical notes flying around the bunny */}
                  <motion.div
                    animate={{ y: [0, -15, 0], rotate: [-5, 10, -5] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute left-6 top-8 text-[#FF4D94] font-black text-2xl select-none flex-shrink-0"
                  >
                    ♫
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, -10, 0], rotate: [12, -8, 12] }}
                    transition={{ repeat: Infinity, duration: 3, delay: 0.5, ease: "easeInOut" }}
                    className="absolute right-6 top-16 text-[#20CDC3] font-black text-xl select-none flex-shrink-0"
                  >
                    ♩
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, -18, 0], rotate: [-10, 8, -10] }}
                    transition={{ repeat: Infinity, duration: 5, delay: 1, ease: "easeInOut" }}
                    className="absolute right-10 bottom-24 text-yellow-500 font-black text-lg select-none flex-shrink-0"
                  >
                    ♪
                  </motion.div>

                  {/* Character Puppet element running soft quiet breathing cycle */}
                  <div className="absolute inset-0 flex items-center justify-center z-10 scale-[1.12]">
                    <AdaggioPuppet animationState="quiet" />
                  </div>

                  {/* 1.7 Grassy lawn hill at the base of Adaggio */}
                  <div className="w-[280px] h-32 bg-gradient-to-b from-[#A5E260] to-[#80CD35] rounded-full border-b-[4px] border-[#559419] shadow-lg flex flex-col items-center justify-start pt-1.5 relative overflow-hidden -mb-4 z-0">
                    {/* Shadow under bunny feet */}
                    <svg viewBox="0 0 280 128" className="absolute inset-0 w-full h-full pointer-events-none">
                      <ellipse cx="140" cy="24" rx="60" ry="7" fill="#205900" opacity="0.25" />
                    </svg>
                    
                    {/* Little cute comic grass blades */}
                    <div className="absolute left-8 top-4 flex gap-1 items-end opacity-75">
                      <span className="w-1.5 h-4.5 bg-[#FFF] bg-white rounded-t-full rotate-[-12deg]" />
                      <span className="w-1 h-3 bg-[#FFF] bg-white rounded-t-full rotate-[12deg]" />
                    </div>
                    <div className="absolute right-12 top-6 flex gap-1 items-end opacity-75">
                      <span className="w-1.5 h-3.5 bg-[#FFF] bg-white rounded-t-full rotate-[-5deg]" />
                    </div>

                    {/* Small pink flowers popping around */}
                    <div className="absolute left-[20%] bottom-4 flex items-center justify-center select-none scale-75">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#FF4D94]" />
                      <div className="w-2 h-2 rounded-full bg-yellow-300 absolute" />
                    </div>
                    <div className="absolute right-[18%] bottom-6 flex items-center justify-center select-none scale-75">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#FF4D94]" />
                      <div className="w-2 h-2 rounded-full bg-yellow-300 absolute" />
                    </div>

                  </div>

                </div>

                {/* 1.8 CONFIGURE GEAR BUTTON (Abre bitácora de facilitador!) */}
                <button
                  id="btn-facilitator-setup"
                  onClick={() => setCurrentView('facilitator')}
                  className="fixed bottom-4 right-4 md:right-8 z-45 bg-[#FCFBEB] p-4.5 rounded-[22px] border-[3px] border-[#CBA86B] text-[#5A2EAC] cursor-pointer hover:bg-white hover:scale-108 active:scale-92 transition-all shadow-xl flex items-center justify-center group"
                  title="Configuración de Facilitador & Alistamiento"
                >
                  <Settings className="w-7 h-7 text-[#5A2EAC] group-hover:rotate-45 transition-transform duration-500" />
                  <span className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse" />
                </button>

              </div>

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
                  className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-neutral-100 text-[#472F92] font-sans font-black text-xs uppercase cursor-pointer shadow-sm transition-colors"
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
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold font-sans text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer ${
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

              <h3 className="text-lg font-black font-sans uppercase tracking-wide text-amber-500 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Acerca de Do Re Mi Lab</span>
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
                  className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black font-sans text-xs uppercase cursor-pointer"
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
