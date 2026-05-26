/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Play } from 'lucide-react';
import { StoryPlayer } from './components/StoryPlayer';
import { FacilitatorWorkspace } from './components/FacilitatorWorkspace';
import { SessionEvaluation } from './types';

export default function App() {
  const [activeEvaluations, setActiveEvaluations] = useState<SessionEvaluation[] | undefined>(undefined);
  const [sessionCompletedCount, setSessionCompletedCount] = useState<number>(0);

  const handleSessionComplete = (evaluations: SessionEvaluation[]) => {
    setActiveEvaluations(evaluations);
    setSessionCompletedCount(prev => prev + 1);
    
    // Auto-scroll down to the facilitator workspace tab
    const element = document.getElementById('facilitator-tactical-workspace');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="dalcroze-app-root" className="min-h-screen bg-neutral-50 text-slate-800 font-sans antialiased pb-20 selection:bg-amber-500 selection:text-neutral-900">
      
      {/* CORE INTEGRATED COMPONENT BODY */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8">

        {/* SINGLE UNIFIED AND CONSOLIDATED INTERACTIVE PORTAL & WORKSPACE */}
        <div 
          id="dalcroze-unified-platform-dashboard" 
          className="bg-white border border-slate-200 rounded-3xl shadow-xl p-2 md:p-4 space-y-6 overflow-hidden"
        >
          {/* Subtle console status ribbon */}
          <div className="flex justify-between items-center px-4 pt-1 pb-3 border-b border-slate-100">
            <span className="text-[10.5px] font-mono tracking-widest text-[#B5E61D] bg-neutral-900 px-2 py-0.5 rounded font-bold uppercase animate-pulse">
              ● CONSOLA INTEGRADA METODO DALCROZE
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              FUNDACIÓN MONTE TABOR DE CIUDAD BOLÍVAR
            </span>
          </div>

          {/* UPPER DECK: INTERACTIVE MEDIA THEATRE */}
          <div className="rounded-2xl overflow-hidden bg-white border border-slate-200 p-1">
            <StoryPlayer onSessionComplete={handleSessionComplete} />
          </div>

          {/* DYNAMIC CONNECTOR STRIP */}
          <div className="flex items-center gap-4 py-1 px-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
            <span className="text-[11px] font-mono text-slate-500 font-bold uppercase tracking-widest text-center">
              ACOMPAÑAMIENTO TÁCTICO & SEGUIMIENTO
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          </div>

          {/* LOWER DECK: THE FACILITATOR WORKSPACE */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50/50">
            <FacilitatorWorkspace lastEvaluations={activeEvaluations} />
          </div>

        </div>



      </main>

    </div>
  );
}
