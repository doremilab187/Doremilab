/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowLeft, ShieldCheck, Heart, Flame, Moon, Compass } from 'lucide-react';

interface AmuletsGalleryProps {
  onBackToHome: () => void;
}

interface Amulet {
  id: string;
  name: string;
  category: string;
  element: string;
  imageUrl: string;
  description: string;
  power: string;
  color: string;
  glowColor: string;
  icon: React.ReactNode;
}

export const AmuletsGallery: React.FC<AmuletsGalleryProps> = ({ onBackToHome }) => {
  const [selectedAmulet, setSelectedAmulet] = useState<Amulet | null>(null);

  const amulets: Amulet[] = [
    {
      id: 'tierra',
      name: 'Amuleto de Tierra',
      category: 'Tótem de la Estabilidad',
      element: 'Tierra',
      imageUrl: '/totems/totem_tierra.png',
      description: 'Representa la firmeza y el latido vital del suelo. Nos enseña a marchar de manera regular, sintiendo la gravedad y marcando el pulso constante de la música con pasos de fuerza.',
      power: 'Marchar con regularidad, estabilidad de cuerpo y fuerza en los pasos fuertes.',
      color: 'from-amber-600/30 to-rose-700/30 text-amber-300 border-amber-500/40',
      glowColor: 'rgba(217, 119, 6, 0.4)',
      icon: <Compass className="w-5 h-5 text-amber-400" />
    },
    {
      id: 'agua',
      name: 'Amuleto de Agua',
      category: 'Tótem de la Fluidez',
      element: 'Agua',
      imageUrl: '/totems/totem_agua.png',
      description: 'Simboliza las corrientes cantarinas y el movimiento continuo. Nos permite flexibilizar las articulaciones y reaccionar de manera fluida ante las notas agudas (cielo) y graves (suelo).',
      power: 'Discriminación de alturas sonoras, movimientos fluidos y adaptativos.',
      color: 'from-sky-600/30 to-teal-500/30 text-sky-300 border-sky-400/40',
      glowColor: 'rgba(56, 189, 248, 0.4)',
      icon: <Sparkles className="w-5 h-5 text-sky-400" />
    },
    {
      id: 'viento',
      name: 'Amuleto de Viento',
      category: 'Tótem de la Ligereza',
      element: 'Viento',
      imageUrl: '/totems/totem_viento.png',
      description: 'El guardián de las velocidades rítmicas. Sintoniza nuestros sentidos con las brisas suaves y lentas del adagio, o con los soplos rápidos y vertiginosos que nos aceleran el andar.',
      power: 'Reconocimiento de tempo (rápido/lento), caminatas en puntas de pie con total sigilo.',
      color: 'from-slate-600/30 to-blue-500/30 text-slate-200 border-slate-350/40',
      glowColor: 'rgba(226, 232, 240, 0.4)',
      icon: <Moon className="w-5 h-5 text-slate-300" />
    },
    {
      id: 'rayo',
      name: 'Amuleto de Rayo',
      category: 'Tótem de la Energía',
      element: 'Trueno / Tempestad',
      imageUrl: '/totems/totem_rayo.png',
      description: 'El talismán de la reacción eléctrica extrema. Encarna la tensión acumulada y la liberación explosiva directa, invitando a sacudidas rápidas y aceleración corporal total.',
      power: 'Descargas motrices instantáneas, sincronización con sacudidas e impulsos de alta energía.',
      color: 'from-purple-600/30 to-indigo-700/30 text-purple-300 border-purple-400/40',
      glowColor: 'rgba(192, 132, 252, 0.4)',
      icon: <Flame className="w-5 h-5 text-purple-400" />
    },
    {
      id: 'sol',
      name: 'Amuleto de Sol',
      category: 'Tótem de la Victoria',
      element: 'Fuego / Sol',
      imageUrl: '/totems/totem_sol.png',
      description: 'La máxima luz del laboratorio rítmico. Conmemora la victoria de los exploradores mediante gestos radiantes de apertura, respiración profunda y el canto triunfal final.',
      power: 'Expansión corporal libre, júbilo pleno, finalización de desafíos y relajación.',
      color: 'from-yellow-600/30 to-amber-500/30 text-yellow-300 border-yellow-400/40',
      glowColor: 'rgba(250, 204, 21, 0.4)',
      icon: <ShieldCheck className="w-5 h-5 text-yellow-400" />
    }
  ];

  return (
    <div className="bg-neutral-950 text-white rounded-3xl p-6 md:p-8 border border-neutral-800 shadow-2xl relative overflow-hidden min-h-[620px] flex flex-col justify-between">
      {/* Background Ambience Blobs */}
      <div className="absolute top-[-50px] right-[-50px] w-80 h-80 bg-amber-500/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-50px] w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Container */}
      <div className="relative z-10 w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-5 mb-6">
        <div>
          <span className="text-[10px] sm:text-[11px] font-mono uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-md font-black tracking-widest inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
            Santuario de Tótems Rítmicos
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-funny text-white uppercase tracking-wide mt-2">
            Galería de Amuletos
          </h2>
        </div>
        
        <button 
          onClick={onBackToHome}
          className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all font-mono text-xs font-bold leading-none select-none flex items-center gap-1.5 active:scale-95 cursor-pointer self-stretch sm:self-auto justify-center"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Regresar al Inicio</span>
        </button>
      </div>

      {/* Grid of Amulet Cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5 my-auto w-full">
        {amulets.map((amulet, index) => (
          <motion.div
            key={amulet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={() => setSelectedAmulet(amulet)}
            className={`cursor-pointer rounded-2xl bg-neutral-900/60 hover:bg-neutral-900 border-2 ${amulet.color} p-4 flex flex-col items-center justify-between text-center transition-all min-h-[310px] group overflow-hidden relative`}
            style={{
              boxShadow: `inset 0 0 15px rgba(255, 255, 255, 0.02)`
            }}
          >
            {/* Visual shine overlay */}
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-45 transform -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            
            {/* Category / Icon tag */}
            <div className="flex items-center justify-center gap-1 mb-2">
              {amulet.icon}
              <span className="text-[9px] font-mono uppercase font-black tracking-wider block opacity-75">{amulet.element}</span>
            </div>

            {/* Amulet Image frame */}
            <div className="w-36 h-36 rounded-full bg-neutral-950/80 border border-neutral-800/80 flex items-center justify-center p-3 relative shadow-inner overflow-hidden my-2">
              <div 
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl mix-blend-screen"
                style={{ backgroundColor: amulet.glowColor }}
              />
              <img
                src={amulet.imageUrl}
                alt={amulet.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?q=80&w=200&auto=format&fit=crop";
                }}
              />
            </div>

            {/* Title / Action */}
            <div className="mt-2 w-full">
              <h3 className="font-funny font-black text-sm uppercase text-white tracking-wide block truncate group-hover:text-amber-300 transition-colors">
                {amulet.name}
              </h3>
              <span className="text-[10px] font-medium font-sans text-neutral-400 block mt-0.5 truncate">
                {amulet.category}
              </span>
              <div className="mt-3.5 inline-flex items-center gap-1.5 bg-white/5 group-hover:bg-amber-400 group-hover:text-neutral-950 border border-white/10 rounded-lg px-2.5 py-1 text-[9px] font-mono uppercase font-extrabold tracking-wider transition-all">
                <span>Inspeccionar</span>
                <span className="group-hover:translate-x-0.5 transition-transform">➔</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Description Tip footer */}
      <div className="relative z-10 flex items-start gap-3.5 bg-neutral-900 border border-neutral-800/80 p-4.5 rounded-2xl mt-6">
        <div className="bg-amber-500/15 text-amber-400 p-2.5 rounded-xl font-mono font-bold leading-none select-none text-sm shadow-inner">
          ✨
        </div>
        <div>
          <p className="text-[10px] uppercase font-black text-amber-500 font-mono tracking-wider">
            Simbología e Integración Pedagógica
          </p>
          <p className="text-neutral-350 text-xs mt-1 leading-relaxed font-sans font-medium">
            Cada amuleto materializa un principio físico y musical del laboratorio. Representan los conceptos fundamentales que el facilitador incentiva en el movimiento corporal creador de los niños en cada tramo de la aventura de Ciudad Bolívar.
          </p>
        </div>
      </div>

      {/* Detailed Modal Overlay for full inspection */}
      <AnimatePresence>
        {selectedAmulet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAmulet(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.93, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-neutral-900 border-2 ${selectedAmulet.color} rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl text-white text-left overflow-hidden relative`}
              style={{
                boxShadow: `0 25px 50px -12px ${selectedAmulet.glowColor}`
              }}
            >
              {/* Star backdrop glow inside modal */}
              <div 
                className="absolute -top-[10%] -right-[10%] w-52 h-52 rounded-full blur-3xl opacity-40 pointer-events-none mix-blend-screen"
                style={{ backgroundColor: selectedAmulet.glowColor }}
              />

              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                {/* Visual Amulet Large frame */}
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-neutral-950 border border-neutral-850 flex items-center justify-center p-4 relative shadow-2xl flex-shrink-0 animate-pulse-slow">
                  <div 
                    className="absolute inset-[4px] rounded-full filter blur-xl mix-blend-screen opacity-50"
                    style={{ backgroundColor: selectedAmulet.glowColor }}
                  />
                  <img
                    src={selectedAmulet.imageUrl}
                    alt={selectedAmulet.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain relative z-10 drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?q=80&w=200&auto=format&fit=crop";
                    }}
                  />
                </div>

                {/* Text explanation content */}
                <div className="flex-1 space-y-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase bg-white/5 border border-white/10 text-amber-400 px-2.5 py-0.5 rounded font-black tracking-widest inline-block">
                      {selectedAmulet.category}
                    </span>
                    <h3 className="text-2xl font-black font-funny uppercase tracking-wide text-white mt-1.5">
                      {selectedAmulet.name}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                    {selectedAmulet.description}
                  </p>

                  <div className="p-3.5 bg-neutral-950/80 rounded-xl border border-neutral-850 space-y-1.5">
                    <span className="text-[9px] text-amber-500 uppercase font-mono tracking-widest font-black block">Fórmula de Poder Rítmico</span>
                    <div className="flex items-start gap-2 text-xs font-semibold leading-relaxed text-neutral-200">
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500 flex-shrink-0 mt-0.5" />
                      <p>{selectedAmulet.power}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal controls */}
              <div className="flex justify-end gap-3 mt-6 sm:mt-8 pt-4 border-t border-neutral-850">
                <button
                  onClick={() => setSelectedAmulet(null)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-black font-funny text-[13px] uppercase tracking-wider cursor-pointer transition-all active:scale-95 shadow-md"
                >
                  Cerrar Inspección
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
