/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface AdaggioPuppetProps {
  animationState: string;
  isElectrocuting?: boolean;
}

const stateToGifMap: Record<string, string> = {
  // Simplified 4-GIF configuration corrected to fix inverted states
  'saludando': './adaggio_gifs/saludando.gif',
  'hablando': './adaggio_gifs/hablando.gif',
  'marchando': './adaggio_gifs/marchando.gif',
  'celebrando': './adaggio_gifs/celebrando.gif',

  // Legacy presets for flawless backwards compatibility
  'quiet': './adaggio_gifs/saludando.gif', // fallback to greeting
  'listening': './adaggio_gifs/hablando.gif',
  'fluid_raise_drop': './adaggio_gifs/marchando.gif',
  'proud_march': './adaggio_gifs/marchando.gif',
  'heavy_march': './adaggio_gifs/marchando.gif',
  'accented_jump': './adaggio_gifs/celebrando.gif', // fallback to celebrating
  'march_sowing': './adaggio_gifs/marchando.gif',
  'celebration_victory': './adaggio_gifs/celebrando.gif', // fallback to celebrating
  'scared': './adaggio_gifs/hablando.gif',
  'shaking_electric': './adaggio_gifs/celebrando.gif',
  'congelado_estatua': './adaggio_gifs/saludando.gif',
  'bow': './adaggio_gifs/saludando.gif',
};

export const AdaggioPuppet: React.FC<AdaggioPuppetProps> = ({ animationState, isElectrocuting }) => {
  const [gifFailed, setGifFailed] = useState<boolean>(false);

  // Reset error state when the animation state changes so we try the new GIF
  useEffect(() => {
    setGifFailed(false);
  }, [animationState]);

  const gifPath = stateToGifMap[animationState] || './adaggio_gifs/hablando.gif';
  const isCoreUserGif = ['saludando', 'hablando', 'marchando', 'celebrando'].includes(animationState);

  if (!gifFailed || isCoreUserGif) {
    return (
      <div 
        id="adaggio-puppet-container-gif" 
        className="relative flex justify-center items-center w-64 h-80 bg-transparent select-none overflow-hidden animate-fade-in"
      >
        <img
          src={gifPath}
          alt={`Adaggio - ${animationState}`}
          className="w-full h-full object-contain max-h-[320px]"
          onError={() => {
            if (!isCoreUserGif) {
              console.log(`Fallback: No se encontró el GIF en "${gifPath}". Mostrando títere procedural SVG.`);
              setGifFailed(true);
            } else {
              console.log(`Core GIF en "${gifPath}" no cargó inmediatamente, se mantiene intentar cargarlo del servidor.`);
            }
          }}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Derive details based on states
  const renderAccessory = () => {
    switch (animationState) {
      case 'fluid_raise_drop':
        // Blue Scarf (Pañuelo de agua) in paw
        return (
          <motion.g
            animate={{
              y: [0, -40, 0, 20, 0],
              rotate: [0, 45, -20, 25, 0],
              scaleY: [1, 1.3, 0.8, 1.2, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut",
            }}
          >
            {/* Scarf path */}
            <path
              d="M 50 145 C 10 160, -20 120, -50 160 C -10 180, 20 180, 50 145 Z"
              fill="#00BFFF"
              opacity="0.85"
              stroke="#008B8B"
              strokeWidth="2"
            />
            {/* Waves detail */}
            <path
              d="M 40 150 Q 10 155 -10 145 T -40 160"
              fill="none"
              stroke="#E0FFFF"
              strokeWidth="1.5"
            />
          </motion.g>
        );

      case 'proud_march':
      case 'accented_jump':
      case 'heavy_march':
      case 'celebration_victory':
      case 'marchando':
      case 'celebrando':
        // Wooden Stick (Bastón de madera ligero)
        const isHeavy = animationState === 'heavy_march';
        return (
          <motion.g
            animate={
              isHeavy
                ? { rotate: [95, 100, 95], y: [15, 18, 15] }
                : { rotate: [-10, 10, -10], y: [-5, 5, -5] }
            }
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            }}
            style={{ originX: '50px', originY: '140px' }}
          >
            {/* Wood Stick */}
            <rect
              x={isHeavy ? "-10" : "25"}
              y={isHeavy ? "80" : "75"}
              width="100"
              height="8"
              rx="4"
              fill="#CD853F"
              stroke="#8B4513"
              strokeWidth="2"
              transform={isHeavy ? "rotate(85, 40, 100)" : "rotate(-30, 45, 100)"}
            />
            {/* Knot grains on bastón */}
            <circle cx={isHeavy ? "35" : "60"} cy={isHeavy ? "110" : "80"} r="1.5" fill="#8B4513" />
            <circle cx={isHeavy ? "38" : "80"} cy={isHeavy ? "120" : "70"} r="1" fill="#8B4513" />
          </motion.g>
        );

      case 'march_sowing':
        // Scattering small seed particles or carrying seed satchel
        return (
          <g>
            {/* Seed pouch */}
            <path d="M 30 140 Q 45 155 60 140 Z" fill="#D2B48C" stroke="#8B4513" strokeWidth="2" />
            <motion.circle
              cx="55"
              cy="135"
              r="3"
              fill="#E9DCC9"
              animate={{ x: [0, 40, 60], y: [0, -10, 30], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeOut" }}
            />
            <motion.circle
              cx="55"
              cy="135"
              r="2"
              fill="#FFD700"
              animate={{ x: [0, 30, 50], y: [-5, -15, 20], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: 0.3, ease: "easeOut" }}
            />
          </g>
        );

      default:
        return null;
    }
  };

  // Define ear movement based on active state (Ears are 1.5x head ratio, highly expressive!)
  const getEarsConfig = () => {
    switch (animationState) {
      case 'quiet':
      case 'saludando':
        return {
          leftRotate: -15,
          rightRotate: 15,
          leftY: 0,
          rightY: 0,
          earScaleY: 0.95,
        };
      case 'listening':
      case 'hablando':
        // erected ears vibrating slightly
        return {
          leftRotate: -5,
          rightRotate: 5,
          leftY: -10,
          rightY: -10,
          earScaleY: 1.15,
          animateLeft: { rotate: [-5, -2, -5], y: [-10, -12, -10] },
          animateRight: { rotate: [5, 2, 5], y: [-10, -12, -10] },
        };
      case 'scared':
      case 'shaking_electric':
        // crouching down, ears folded covering or scared
        return {
          leftRotate: -80,
          rightRotate: 80,
          leftY: 15,
          rightY: 15,
          earScaleY: 0.75,
          animateLeft: { x: [-2, 2, -2], y: [13, 17, 13] },
          animateRight: { x: [2, -2, 2], y: [13, 17, 13] },
        };
      case 'congelado_estatua':
        // rigid and dry ears
        return { leftRotate: -35, rightRotate: 35, leftY: -5, rightY: -5, earScaleY: 1.0 };
      case 'heavy_march':
        // exhausted back ears
        return { leftRotate: -45, rightRotate: -25, leftY: 8, rightY: 10, earScaleY: 0.85 };
      case 'celebration_victory':
      case 'bow':
      case 'celebrando':
        // happy ears or dipping downwards for bow
        return {
          leftRotate: animationState === 'bow' ? -90 : -35,
          rightRotate: animationState === 'bow' ? 90 : 35,
          leftY: animationState === 'bow' ? 25 : -15,
          rightY: animationState === 'bow' ? 25 : -15,
          earScaleY: animationState === 'bow' ? 0.85 : 1.1,
        };
      default:
        // basic march / movement ears bobbing
        return {
          leftRotate: -20,
          rightRotate: 20,
          leftY: -5,
          rightY: -5,
          earScaleY: 1.0,
          animateLeft: { rotate: [-20, -10, -20] },
          animateRight: { rotate: [20, 10, 20] },
        };
    }
  };

  const ears = getEarsConfig();

  // Basic puppet body bobbing frequency
  const getBodyBobbingY = () => {
    if (animationState === 'congelado_estatua') return 0;
    if (animationState === 'quiet' || animationState === 'saludando') return [0, 4, 0];
    if (animationState === 'listening' || animationState === 'hablando') return [0, 2, 0];
    if (animationState === 'scared') return [15, 18, 15];
    if (animationState === 'shaking_electric') return [0, -8, 8, -4, 4, 0];
    if (isElectrocuting) return [1, -5, 5, -3, 3, 0];
    
    // Quick paced cycles for marching
    if (animationState === 'march_sowing' || animationState === 'proud_march' || animationState === 'marchando') {
      return [0, -12, 0, -12, 0];
    }
    if (animationState === 'heavy_march') {
      return [10, 14, 10, 14, 10];
    }
    if (animationState === 'fluid_raise_drop') {
      return [0, -6, 2, -6, 0];
    }
    return [0, -5, 0];
  };

  const getFacialExpression = () => {
    switch (animationState) {
      case 'scared':
      case 'shaking_electric':
        return (
          // Scared eyes (wide circles) and distressed mouth
          <g id="face-scared">
            <ellipse cx="85" cy="115" rx="8" ry="8" fill="#FFFFFF" stroke="#333" strokeWidth="2" />
            <circle cx="85" cy="115" r="4" fill="#000000" />
            <ellipse cx="115" cy="115" rx="8" ry="8" fill="#FFFFFF" stroke="#333" strokeWidth="2" />
            <circle cx="115" cy="115" r="4" fill="#000000" />
            {/* trembling mouth */}
            <path d="M 92 135 Q 100 128 108 135" fill="none" stroke="#000" strokeWidth="2" />
            {/* sweat drop */}
            <path d="M 75 105 Q 73 115 75 120" fill="none" stroke="#00BFFF" strokeWidth="1.5" />
          </g>
        );
      case 'congelado_estatua':
        return (
          // Locked stone expression
          <g id="face-statue">
            <line x1="80" y1="115" x2="90" y2="115" stroke="#333" strokeWidth="3" strokeLinecap="round" />
            <line x1="110" y1="115" x2="120" y2="115" stroke="#333" strokeWidth="3" strokeLinecap="round" />
            <line x1="92" y1="132" x2="108" y2="132" stroke="#333" strokeWidth="2.5" />
          </g>
        );
      case 'listening':
      case 'hablando':
        return (
          // Concentrating eyes, curious smile
          <g id="face-listening">
            <ellipse cx="85" cy="115" rx="6" ry="7" fill="#FFFFFF" stroke="#333" strokeWidth="2" />
            <circle cx="87" cy="114" r="3" fill="#000000" />
            <ellipse cx="115" cy="115" rx="6" ry="7" fill="#FFFFFF" stroke="#333" strokeWidth="2" />
            <circle cx="113" cy="114" r="3" fill="#000000" />
            <path d="M 94 130 Q 100 135 106 130" fill="none" stroke="#000" strokeWidth="2" />
          </g>
        );
      case 'heavy_march':
        return (
          // Tired eyes slanted downwards
          <g id="face-tired">
            <path d="M 80 112 Q 85 118 90 115" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
            <path d="M 110 112 Q 115 118 120 115" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
            <path d="M 94 134 Q 100 137 106 134" fill="none" stroke="#000" strokeWidth="1.5" />
          </g>
        );
      case 'march_sowing':
      case 'proud_march':
      case 'celebration_victory':
      case 'marchando':
      case 'celebrando':
        return (
          // Happy smiling eyes and joyful open mouth
          <g id="face-happy">
            <path d="M 78 116 Q 85 106 91 116" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
            <path d="M 109 116 Q 115 106 122 116" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
            {/* Open smile */}
            <path d="M 91 127 Q 100 142 109 127 Z" fill="#FFB6C1" stroke="#333" strokeWidth="2" />
          </g>
        );
      default: // default quiet / breathing
        return (
          // Calm closed content eyes
          <g id="face-calm">
            <path d="M 78 116 Q 85 120 91 116" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 109 116 Q 115 120 122 116" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 94 130 Q 100 134 106 130" fill="none" stroke="#333" strokeWidth="2" />
          </g>
        );
    }
  };

  const shakeAnimation = {
    x: isElectrocuting || animationState === 'shaking_electric' ? [-4, 4, -4, 4, -2, 2, 0] : [0],
    rotate: isElectrocuting || animationState === 'shaking_electric' ? [-2, 2, -2, 2, 0] : [0],
  };

  return (
    <div id="adaggio-puppet-container" className="relative flex justify-center items-center w-64 h-80 bg-transparent select-none">
      <motion.svg
        viewBox="0 0 200 240"
        className="w-full h-full drop-shadow-xl"
        animate={{
          y: getBodyBobbingY(),
          ...shakeAnimation,
        }}
        transition={{
          repeat: animationState === 'congelado_estatua' ? 0 : Infinity,
          duration: animationState === 'march_sowing' || animationState === 'proud_march' || animationState === 'marchando' ? 0.65 : 2.5,
          ease: "easeInOut",
        }}
      >
        {/* Flat Theater Shadows */}
        <ellipse cx="100" cy="225" rx="65" ry="12" fill="#000000" opacity="0.18" />

        {/* --- LEGS & PINS (Cute legs with purple diamond-pattern pants) --- */}
        <g id="puppet-legs">
          {/* Left Leg */}
          <motion.g
            animate={
              animationState === 'march_sowing' || animationState === 'proud_march' || animationState === 'marchando'
                ? { rotate: [-20, 20, -20] }
                : animationState === 'heavy_march'
                ? { rotate: [-10, 5, -10] }
                : { rotate: 0 }
            }
            transition={{ repeat: Infinity, duration: 0.65, ease: "linear" }}
            style={{ originX: '75px', originY: '190px' }}
          >
            {/* Thigh / Pants part (Purple diamond trousers) */}
            <path d="M 62 180 L 88 180 L 84 198 L 60 198 Z" fill="#9C3FE6" stroke="#4B127E" strokeWidth="2" />
            <path d="M 62 180 L 84 198 M 88 180 L 60 198" stroke="#FFE954" strokeWidth="1" opacity="0.6" />
            
            {/* White Bunny Foot */}
            <path d="M 68 195 Q 60 215 50 220 L 74 222 L 78 195 Z" fill="#FFFFFF" stroke="#472F92" strokeWidth="2" />
            
            {/* Soft pink toes detail */}
            <circle cx="56" cy="216" r="2.5" fill="#FFAEC9" />
            <circle cx="63" cy="218" r="2.5" fill="#FFAEC9" />
            <circle cx="70" cy="218" r="2.5" fill="#FFAEC9" />

            {/* Joint rivet */}
            <circle cx="75" cy="190" r="3.5" fill="#FFA64D" stroke="#472F92" strokeWidth="1.5" />
          </motion.g>

          {/* Right Leg */}
          <motion.g
            animate={
              animationState === 'march_sowing' || animationState === 'proud_march' || animationState === 'marchando'
                ? { rotate: [20, -20, 20] }
                : animationState === 'heavy_march'
                ? { rotate: [5, -10, 5] }
                : { rotate: 0 }
            }
            transition={{ repeat: Infinity, duration: 0.65, ease: "linear" }}
            style={{ originX: '125px', originY: '190px' }}
          >
            {/* Thigh / Pants part (Purple diamond trousers) */}
            <path d="M 112 180 L 138 180 L 140 198 L 116 198 Z" fill="#9C3FE6" stroke="#4B127E" strokeWidth="2" />
            <path d="M 112 180 L 140 198 M 138 180 L 116 198" stroke="#FFE954" strokeWidth="1" opacity="0.6" />

            {/* White Bunny Foot */}
            <path d="M 122 195 Q 130 215 140 220 L 116 222 L 122 195 Z" fill="#FFFFFF" stroke="#472F92" strokeWidth="2" />
            
            {/* Soft pink toes */}
            <circle cx="124" cy="218" r="2.5" fill="#FFAEC9" />
            <circle cx="131" cy="218" r="2.5" fill="#FFAEC9" />
            <circle cx="138" cy="216" r="2.5" fill="#FFAEC9" />

            {/* Joint rivet */}
            <circle cx="125" cy="190" r="3.5" fill="#FFA64D" stroke="#472F92" strokeWidth="1.5" />
          </motion.g>
        </g>

        {/* --- TORSO & CONDUCTOR BLUE COAT & BOWTIE --- */}
        <g id="puppet-torso">
          {/* Fluffy tail (white) */}
          <circle cx="48" cy="172" r="14" fill="#FFFFFF" stroke="#472F92" strokeWidth="2" />
          <circle cx="44" cy="168" r="7" fill="#FFFFFF" />

          {/* Main torso (fluffy white base) */}
          <rect x="65" y="130" width="70" height="60" rx="20" fill="#FFFFFF" stroke="#472F92" strokeWidth="2" />

          {/* Elegant Royal Blue Conductor Coat */}
          <path
            d="M 65 142 C 65 128 135 128 135 142 L 135 182 L 110 192 L 90 192 L 65 182 Z"
            fill="#1E56FE"
            stroke="#0B30AA"
            strokeWidth="2.5"
          />

          {/* Coat Collar & Trim fold lines */}
          <path d="M 90 135 L 100 155 L 110 135" fill="none" stroke="#FFE954" strokeWidth="2" />
          <line x1="100" y1="155" x2="100" y2="192" stroke="#FFE954" strokeWidth="2" />

          {/* Large Gold Conductor Button (Gold Medal/Pendant as in the image!) */}
          <circle cx="100" cy="164" r="8" fill="#FFC82B" stroke="#B87D00" strokeWidth="1.5" />
          <circle cx="100" cy="164" r="5" fill="#FFE066" />
          
          {/* Cute Orange Bowtie (La pajarita naranja) under the chin */}
          <path d="M 86 130 L 100 137 L 114 130 L 110 144 L 100 137 L 90 144 Z" fill="#FF8C00" stroke="#B34F00" strokeWidth="2" />
          <circle cx="100" cy="137" r="4.5" fill="#FFA64D" stroke="#B34F00" strokeWidth="1.5" />
        </g>

        {/* Accessories Layer */}
        {renderAccessory()}

        {/* --- FRONT WHITE FOREPAWS / ARMS --- */}
        <g id="puppet-arms">
          {/* Left Arm */}
          <motion.g
            animate={
              animationState === 'expanding_arms'
                ? { rotate: [-15, -75, -15], scaleX: [1, 1.1, 1] }
                : animationState === 'fluid_raise_drop'
                ? { rotate: [-40, -10, -45], y: [-15, 10, -15] }
                : animationState === 'quiet' || animationState === 'listening'
                ? { rotate: [0, 10, 0] }
                : { rotate: [-10, 15, -10] }
            }
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            style={{ originX: '70px', originY: '145px' }}
          >
            {/* Upper arm jacket sleeve */}
            <path d="M 70 140 Q 42 140 38 148 L 48 158 Q 58 148 70 148 Z" fill="#1E56FE" stroke="#0B30AA" strokeWidth="2" />
            
            {/* White fluffy hand paw protruding */}
            <circle cx="34" cy="150" r="10" fill="#FFFFFF" stroke="#472F92" strokeWidth="2" />
            <path d="M 30 146 Q 24 150 30 154" stroke="#472F92" strokeWidth="1.5" strokeLinecap="round" />

            {/* Joint brass rivet */}
            <circle cx="70" cy="144" r="3" fill="#FFE954" />
          </motion.g>

          {/* Right Arm */}
          <motion.g
            animate={
              animationState === 'expanding_arms'
                ? { rotate: [15, 75, 15], scaleX: [1, 1.1, 1] }
                : animationState === 'fluid_raise_drop'
                ? { rotate: [40, 10, 40], y: [-15, 10, -15] }
                : animationState === 'quiet' || animationState === 'listening'
                ? { rotate: [0, -10, 0] }
                : { rotate: [10, -15, 10] }
            }
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            style={{ originX: '130px', originY: '145px' }}
          >
            {/* Upper arm jacket sleeve */}
            <path d="M 130 140 Q 158 140 162 148 L 152 158 Q 142 148 130 148 Z" fill="#1E56FE" stroke="#0B30AA" strokeWidth="2" />
            
            {/* White fluffy hand paw */}
            <circle cx="166" cy="150" r="10" fill="#FFFFFF" stroke="#472F92" strokeWidth="2" />
            <path d="M 170 146 Q 176 150 170 154" stroke="#472F92" strokeWidth="1.5" strokeLinecap="round" />

            {/* Joint brass rivet */}
            <circle cx="130" cy="144" r="3" fill="#FFE954" />
          </motion.g>
        </g>

        {/* --- EARS (Expressive fluffy white ears with pink inside) --- */}
        <g id="puppet-ears">
          {/* Left Ear */}
          <motion.g
            style={{ originX: '85px', originY: '95px' }}
            animate={
              ears.animateLeft || {
                rotate: ears.leftRotate,
                y: ears.leftY,
                scaleY: ears.earScaleY,
              }
            }
            transition={{ duration: 0.3 }}
          >
            {/* Outer White Ear */}
            <path
              d="M 75 95 C 65 30, 80 0, 90 0 C 98 0, 100 30, 90 95 Z"
              fill="#FFFFFF"
              stroke="#472F92"
              strokeWidth="2.5"
            />
            {/* Inner Pink Ear */}
            <path
              d="M 78 90 C 73 40, 82 10, 88 10 C 92 10, 94 40, 88 90 Z"
              fill="#FFAEC9"
            />
            {/* Rivet Joint */}
            <circle cx="85" cy="95" r="3.5" fill="#FFE954" stroke="#472F92" strokeWidth="1.5" />
          </motion.g>

          {/* Right Ear */}
          <motion.g
            style={{ originX: '115px', originY: '95px' }}
            animate={
              ears.animateRight || {
                rotate: ears.rightRotate,
                y: ears.rightY,
                scaleY: ears.earScaleY,
              }
            }
            transition={{ duration: 0.3 }}
          >
            {/* Outer White Ear */}
            <path
              d="M 110 95 C 100 30, 102 0, 110 0 C 120 0, 135 30, 125 95 Z"
              fill="#FFFFFF"
              stroke="#472F92"
              strokeWidth="2.5"
            />
            {/* Inner Pink Ear */}
            <path
              d="M 112 90 C 106 40, 108 10, 112 10 C 118 10, 127 40, 122 90 Z"
              fill="#FFAEC9"
            />
            {/* Rivet Joint */}
            <circle cx="115" cy="95" r="3.5" fill="#FFE954" stroke="#472F92" strokeWidth="1.5" />
          </motion.g>
        </g>

        {/* --- HEAD, CUTE MASCOT FACE & BLUE CEOMETRIC TALL HAT --- */}
        <g id="puppet-head">
          {/* Main White Fluffy Head */}
          <ellipse cx="100" cy="118" rx="35" ry="28" fill="#FFFFFF" stroke="#472F92" strokeWidth="2.5" />
          
          {/* Cute pink rosy cheeks */}
          <ellipse cx="73" cy="126" rx="6" ry="4" fill="#FFAEC9" opacity="0.8" />
          <ellipse cx="127" cy="126" rx="6" ry="4" fill="#FFAEC9" opacity="0.8" />

          {/* Expression Layer */}
          {getFacialExpression()}

          {/* Iconic Deep Purple Round-Rimmed Glasses (Gafas circulares de Adaggio) */}
          <g id="purple-glasses">
            {/* Left rim */}
            <circle cx="81" cy="116" r="14" fill="none" stroke="#5A2EAC" strokeWidth="3" />
            {/* Right rim */}
            <circle cx="119" cy="116" r="14" fill="none" stroke="#5A2EAC" strokeWidth="3" />
            {/* Connecting bridge */}
            <path d="M 95 116 Q 100 113 105 116" fill="none" stroke="#5A2EAC" strokeWidth="3.5" strokeLinecap="round" />
            {/* Temples on side */}
            <path d="M 67 116 Q 60 112 58 110" fill="none" stroke="#5A2EAC" strokeWidth="3" />
            <path d="M 133 116 Q 140 112 142 110" fill="none" stroke="#5A2EAC" strokeWidth="3" />
          </g>

          {/* Nose & Mouth detailing */}
          <polygon points="98,124 102,124 100,127" fill="#FF4D94" />
          <path d="M 98 128 L 100 131 L 102 128" fill="none" stroke="#472F92" strokeWidth="1.5" />

          {/* Whiskers */}
          <path d="M 66 128 L 52 125 M 66 132 L 50 133" stroke="#472F92" strokeWidth="1.2" />
          <path d="M 134 128 L 148 125 M 134 132 L 150 133" stroke="#472F92" strokeWidth="1.2" />

          {/* --- GLORIOUS TALL GEOMETRIC BLUE CONductor Hat --- */}
          <g id="tall-conductor-hat" transform="translate(0, 0)">
            {/* Hat Base Backside */}
            <path d="M 82 94 L 118 94 L 114 74 L 86 74 Z" fill="#1591C6" stroke="#0B30AA" strokeWidth="2" />
            
            {/* Hat Cap / Top Lid */}
            <ellipse cx="100" cy="74" rx="14" ry="4" fill="#0FCAB2" stroke="#0B30AA" strokeWidth="1.5" />
            
            {/* Yellow / Navy Geometric Zig-Zag Trim */}
            <polygon points="86,76 91,84 97,76 103,84 109,76 114,84 114,93 86,93" fill="#FFA64D" stroke="#0B30AA" strokeWidth="1.5" />
            <polyline points="86,85 91,78 97,85 103,78 109,85 114,78" fill="none" stroke="#1E56FE" strokeWidth="2.5" />
          </g>
        </g>
      </motion.svg>
    </div>
  );
};
