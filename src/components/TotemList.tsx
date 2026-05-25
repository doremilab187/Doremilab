/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

interface TotemListProps {
  activeBlockId: number;
}

export const TotemList: React.FC<TotemListProps> = ({ activeBlockId }) => {
  // Check if a specific totem is fully unlocked/turned-on
  // Tierra is unlocked on block 2, Agua 3, Viento 4, Trueno 5 & 6, Sol 7 & 8
  const isUnlocked = (totemType: 'tierra' | 'agua' | 'viento' | 'trueno' | 'sol') => {
    switch (totemType) {
      case 'tierra':
        return activeBlockId >= 2;
      case 'agua':
        return activeBlockId >= 3;
      case 'viento':
        return activeBlockId >= 4;
      case 'trueno':
        return activeBlockId >= 5;
      case 'sol':
        return activeBlockId >= 7;
      default:
        return false;
    }
  };

  return (
    <div id="totems-alignment-panel" className="absolute inset-0 flex justify-between px-4 md:px-12 items-end bottom-12 pointer-events-none z-0 opacity-40 md:opacity-85">
      {/* 1. TIERRA TOTEM */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-mono mb-1 text-amber-500 uppercase tracking-wider">Tierra</span>
        <motion.div
          animate={isUnlocked('tierra') ? { scale: [1, 1.02, 1], filter: "drop-shadow(0 0 12px rgba(255, 140, 0, 0.4))" } : {}}
          transition={{ repeat: Infinity, duration: 3 }}
          className="w-10 sm:w-14 h-44 sm:h-64 border-2 rounded bg-neutral-900 border-neutral-700 relative overflow-hidden flex flex-col justify-end"
        >
          {/* Stone-colored tiles stacking */}
          <div className="absolute inset-0 flex flex-col justify-between p-1">
            <div className={`h-[18%] rounded border ${isUnlocked('tierra') ? 'bg-amber-800/80 border-amber-600' : 'bg-neutral-800 border-neutral-700'}`} />
            <div className={`h-[18%] rounded border ${isUnlocked('tierra') ? 'bg-amber-700/80 border-amber-500' : 'bg-neutral-800 border-neutral-700'}`} />
            <div className={`h-[18%] rounded border ${isUnlocked('tierra') ? 'bg-emerald-800/80 border-emerald-600' : 'bg-neutral-800 border-neutral-700'}`} />
            <div className={`h-[18%] rounded border ${isUnlocked('tierra') ? 'bg-amber-900/80 border-amber-800' : 'bg-neutral-800 border-neutral-700'}`} />
          </div>
          {/* Engraving detail */}
          <svg className="absolute inset-0 w-full h-full p-2" viewBox="0 0 40 120" preserveAspectRatio="none">
            <path
              d="M 20 10 L 20 110 M 10 30 Q 20 20 30 30 M 10 60 Q 20 50 30 60 M 15 90 Q 20 80 25 90"
              fill="none"
              stroke={isUnlocked('tierra') ? '#FF8C00' : '#444'}
              strokeWidth="2.5"
            />
            {/* Seed icons falling */}
            <circle cx="20" cy="40" r="3" fill={isUnlocked('tierra') ? '#8B4513' : '#333'} />
            <circle cx="12" cy="75" r="3.5" fill={isUnlocked('tierra') ? '#6B8E23' : '#333'} />
            <circle cx="28" cy="75" r="3.5" fill={isUnlocked('tierra') ? '#6B8E23' : '#333'} />
          </svg>
          <div className={`h-4 w-full ${isUnlocked('tierra') ? 'bg-amber-600/60' : 'bg-neutral-700'}`} />
        </motion.div>
      </div>

      {/* 2. AGUA TOTEM */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-mono mb-1 text-cyan-400 uppercase tracking-wider">Agua</span>
        <motion.div
          animate={isUnlocked('agua') ? { scale: [1, 1.03, 1], filter: "drop-shadow(0 0 12px rgba(64, 224, 208, 0.45))" } : {}}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="w-10 sm:w-14 h-48 sm:h-72 border-2 rounded-t-full bg-neutral-900 border-neutral-700 relative overflow-hidden"
        >
          {/* Wave effect at bottom */}
          <motion.div
            animate={isUnlocked('agua') ? { y: [0, -10, 0] } : {}}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className={`absolute bottom-0 inset-x-0 h-[60%] ${isUnlocked('agua') ? 'bg-cyan-900/40' : 'bg-neutral-800/40'}`}
          />
          {/* Ondulated central vein */}
          <svg className="absolute inset-0 w-full h-full p-1" viewBox="0 0 40 150" preserveAspectRatio="none">
            <path
              d="M 20 15 Q 40 45 20 75 T 20 135"
              fill="none"
              stroke={isUnlocked('agua') ? '#40E0D0' : '#444'}
              strokeWidth="3.5"
            />
            {/* droplet icons inside */}
            <path d="M 20 30 Q 25 38 20 40 Q 15 38 20 30 Z" fill={isUnlocked('agua') ? '#00FFFF' : '#333'} />
            <path d="M 28 85 Q 33 93 28 95 Q 23 93 28 85 Z" fill={isUnlocked('agua') ? '#87CEEB' : '#333'} />
            <path d="M 12 110 Q 17 118 12 120 Q 7 118 12 110 Z" fill={isUnlocked('agua') ? '#87CEEB' : '#333'} />
          </svg>
        </motion.div>
      </div>

      {/* 3. VIENTO TOTEM */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-mono mb-1 text-neutral-200 uppercase tracking-wider">Viento</span>
        <motion.div
          animate={isUnlocked('viento') ? { scale: [1, 1.01, 1], filter: "drop-shadow(0 0 12px rgba(255, 255, 255, 0.35))" } : {}}
          transition={{ repeat: Infinity, duration: 5 }}
          className="w-10 sm:w-14 h-52 sm:h-80 border-2 rounded bg-neutral-900 border-neutral-700 relative overflow-hidden"
        >
          {/* Floating air streaks */}
          <motion.div
            animate={isUnlocked('viento') ? { y: [-20, 160], opacity: [0, 0.7, 0] } : {}}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="absolute left-4 top-0 w-1 h-12 bg-white/70 rounded-full"
          />
          <motion.div
            animate={isUnlocked('viento') ? { y: [-10, 180], opacity: [0, 0.5, 0] } : {}}
            transition={{ repeat: Infinity, duration: 3.2, delay: 1.5, ease: "linear" }}
            className="absolute right-3 top-0 w-[2px] h-16 bg-cyan-200/50 rounded-full"
          />
          {/* Ascending Spirals */}
          <svg className="absolute inset-0 w-full h-full p-2" viewBox="0 0 40 180" preserveAspectRatio="none">
            <path
              d="M 5 150 C 30 130 35 110 20 90 C 5 70 8 50 30 30"
              fill="none"
              stroke={isUnlocked('viento') ? '#FFFFFF' : '#444'}
              strokeWidth="2"
              strokeDasharray={isUnlocked('viento') ? '6 4' : 'none'}
            />
            {/* Delicate clouds symbols inside */}
            <path d="M 12 60 Q 16 54 22 56 Q 26 50 32 54 L 32 60 Z" fill={isUnlocked('viento') ? '#D3D3D3' : '#333'} opacity="0.8" />
            <path d="M 8 130 Q 12 124 18 126 Q 22 120 28 124 L 28 130 Z" fill={isUnlocked('viento') ? '#87CEEB' : '#333'} opacity="0.6" />
          </svg>
        </motion.div>
      </div>

      {/* 4. TRUENO TOTEM */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-mono mb-1 text-purple-400 uppercase tracking-wider">Trueno</span>
        <motion.div
          animate={isUnlocked('trueno') ? { scale: [1, 1.03, 1], filter: "drop-shadow(0 0 15px rgba(123, 104, 238, 0.5))" } : {}}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          className="w-10 sm:w-14 h-48 sm:h-72 border-2 rounded bg-neutral-900 border-neutral-700 relative overflow-hidden"
        >
          {/* Purple and static storm signals */}
          <motion.div
            animate={isUnlocked('trueno') ? { opacity: [0.1, 0.4, 0.1, 0.5, 0.1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className={`absolute inset-0 ${isUnlocked('trueno') ? 'bg-indigo-900/30' : 'bg-transparent'}`}
          />
          {/* Zigzag structures */}
          <svg className="absolute inset-0 w-full h-full p-1" viewBox="0 0 40 150" preserveAspectRatio="none">
            <polyline
              points="20,10 32,35 10,65 30,95 8,125 20,140"
              fill="none"
              stroke={isUnlocked('trueno') ? '#7B68EE' : '#444'}
              strokeWidth="4"
              strokeLinejoin="bevel"
            />
            {/* Crack lightning bolt symbol */}
            <polygon
              points="20,20 14,50 20,50 16,80 28,45 22,45"
              fill={isUnlocked('trueno') ? '#FFD700' : '#333'}
            />
          </svg>
        </motion.div>
      </div>

      {/* 5. SOL TOTEM */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-mono mb-1 text-yellow-400 uppercase tracking-wider">Sol</span>
        <motion.div
          animate={isUnlocked('sol') ? { scale: [1, 1.04, 1], filter: "drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))" } : {}}
          transition={{ repeat: Infinity, duration: 3.5 }}
          className="w-10 sm:w-14 h-44 sm:h-64 border-2 rounded-b-full bg-neutral-900 border-neutral-700 relative overflow-hidden"
        >
          {/* Radial golden background waves */}
          <div className={`absolute top-0 inset-x-0 h-[40%] rounded-b-full ${isUnlocked('sol') ? 'bg-amber-500/30' : 'bg-neutral-800'}`} />
          {/* Sun disc and golden rays */}
          <svg className="absolute inset-0 w-full h-full p-2" viewBox="0 0 40 120" preserveAspectRatio="none">
            <circle cx="20" cy="30" r="10" fill={isUnlocked('sol') ? '#FFD700' : '#444'} />
            {/* sunbeams */}
            <g stroke={isUnlocked('sol') ? '#DAA520' : '#333'} strokeWidth="1.5">
              <line x1="20" y1="12" x2="20" y2="18" />
              <line x1="20" y1="42" x2="20" y2="48" />
              <line x1="2" y1="30" x2="8" y2="30" />
              <line x1="32" y1="30" x2="38" y2="30" />
              <line x1="9" y1="19" x2="14" y2="24" />
              <line x1="26" y1="36" x2="31" y2="41" />
            </g>
            {/* Vertical column ray */}
            <path
              d="M 20 40 L 20 110 M 10 70 L 30 70 M 15 90 L 25 90"
              fill="none"
              stroke={isUnlocked('sol') ? '#FF4500' : '#444'}
              strokeWidth="2.5"
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
};
