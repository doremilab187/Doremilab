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
      category: 'El Tótem de la Tierra',
      element: 'Tierra',
      imageUrl: './totems/totem_tierra.png',
      description: 'Bajo el suelo descansan miles de semillas esperando el momento de despertar. La Tierra las protege con paciencia y cuida cada brote que algún día se convertirá en flor, arbusto o árbol. Quienes ayudan a mantener su equilibrio aprenden que las cosas más valiosas crecen paso a paso.',
      power: 'Marchar con regularidad, estabilidad de cuerpo y fuerza en los pasos fuertes.',
      color: 'from-[#FFFDF9] to-[#FFFBF2] border-[#CDA152] hover:border-[#A67E33]',
      glowColor: 'rgba(217, 119, 6, 0.2)',
      icon: <Compass className="w-5 h-5 text-[#CDA152]" />
    },
    {
      id: 'agua',
      name: 'Amuleto de Agua',
      category: 'El Tótem del Agua',
      element: 'Agua',
      imageUrl: './totems/totem_agua.png',
      description: 'Los mayores enseñan que cada gota de lluvia guarda una pequeña canción. Cuando miles de ellas caen juntas, llenan el mundo de sonidos brillantes que viajan entre las nubes, los ríos y la tierra. Para descubrir sus secretos, Adaggio deberá acompañar el viaje de las gotas y escuchar con atención su melodía.',
      power: 'Discriminación de alturas sonoras, movimientos fluidos y adaptativos.',
      color: 'from-[#FAFDFB] to-[#F2FCF9] border-[#31C3AA] hover:border-[#1F9F8B]',
      glowColor: 'rgba(49, 195, 170, 0.2)',
      icon: <Sparkles className="w-5 h-5 text-[#31C3AA]" />
    },
    {
      id: 'viento',
      name: 'Amuleto de Viento',
      category: 'El Tótem del Viento',
      element: 'Viento',
      imageUrl: './totems/totem_viento.png',
      description: 'Dicen los mayores que el Viento guarda caminos invisibles entre las nubes y mensajes escondidos en el aire. Quienes desean encontrarlos deben aprender a escuchar con atención las señales que viajan por el cielo.',
      power: 'Reconocimiento de tempo (rápido/lento), caminatas en puntas de pie con total sigilo.',
      color: 'from-[#FDFEFF] to-[#F4F8FC] border-[#52ADED] hover:border-[#338BC4]',
      glowColor: 'rgba(82, 173, 237, 0.2)',
      icon: <Moon className="w-5 h-5 text-[#306CA5]" />
    },
    {
      id: 'rayo',
      name: 'Amuleto de Rayo',
      category: 'El Tótem del Rayo',
      element: 'Rayo',
      imageUrl: './totems/totem_rayo.png',
      description: 'Cuando la tormenta despierta, su estruendo puede cubrir los sonidos del mundo y volver inciertos los caminos. Muchos viajeros temen su fuerza, pues sus rugidos recorren montañas y valles sin previo aviso. Para seguir adelante, Adaggio deberá atravesar el ruido y aprender a escuchar más allá de él. Tras observar la tormenta con atención, descubre que detrás del estruendo existe algo más: relámpagos, truenos y ecos que revelan un ritmo desconocido.',
      power: 'Descargas motrices instantáneas, Sincronización con sacudidas e impulsos de alta energía.',
      color: 'from-[#FDFBFF] to-[#FAF6FF] border-[#BE82ED] hover:border-[#A467D4]',
      glowColor: 'rgba(190, 130, 237, 0.2)',
      icon: <Flame className="w-5 h-5 text-[#965EA5]" />
    },
    {
      id: 'sol',
      name: 'Amuleto de Sol',
      category: 'El Tótem del Sol',
      element: 'Sol',
      imageUrl: './totems/totem_sol.png',
      description: 'Desde tiempos remotos, una llama sagrada ilumina los caminos de quienes buscan la armonía. Su luz acompaña a los viajeros, les da fuerza para continuar y les recuerda que toda la naturaleza comparte un mismo ritmo. Con una antorcha en sus manos, Adaggio emprende el último tramo de su viaje siguiendo el resplandor del Sol.',
      power: 'Expansión corporal libre, júbilo pleno, finalización de desafíos y relajación.',
      color: 'from-[#FFFDF2] to-[#FFF9E6] border-[#FFC927] hover:border-[#DBA310]',
      glowColor: 'rgba(255, 201, 39, 0.2)',
      icon: <ShieldCheck className="w-5 h-5 text-[#FFC927]" />
    }
  ];

  return (
    <div className="bg-[#FFFDF1] text-[#472F92] rounded-[36px] p-6 md:p-8 border-[4px] border-[#CBA86B] shadow-2xl relative overflow-hidden min-h-[620px] flex flex-col justify-between selection:bg-yellow-250 selection:text-neutral-900">
      {/* Soft illustrated white cloud vectors or drift rings matching doremi lab */}
      <div className="absolute top-8 left-[10%] w-48 h-12 bg-white/70 rounded-full blur-md pointer-events-none opacity-60" />
      <div className="absolute top-20 right-[5%] w-60 h-16 bg-white/70 rounded-full blur-md pointer-events-none opacity-60" />
      <div className="absolute bottom-20 left-10 w-52 h-14 bg-white/50 rounded-full blur-lg pointer-events-none opacity-50" />

      {/* Header Container */}
      <div className="relative z-10 w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-purple-100 pb-5 mb-6">
        <div>
          <span className="text-[10px] sm:text-[11px] font-mono uppercase bg-[#F6DFA8]/90 border border-[#D3B678] text-[#7A5A18] px-3.5 py-1 rounded-full font-black tracking-widest inline-flex items-center gap-1 shadow-sm font-bold">
            <Sparkles className="w-3 h-3 text-amber-600 animate-spin" />
            Santuario de Tótems Rítmicos
          </span>
          <h2 className="text-3xl sm:text-4xl font-black font-funny text-[#472F92] uppercase tracking-wide mt-2">
            Galería de Amuletos
          </h2>
        </div>
        
        <button 
          onClick={onBackToHome}
          className="px-5 py-3 rounded-2xl bg-[#472F92] border-[3px] border-[#352079] text-white hover:bg-[#3d2780] hover:scale-105 active:scale-95 transition-all text-xs font-funny font-black uppercase tracking-wide flex items-center gap-1.5 cursor-pointer shadow-md self-stretch sm:self-auto justify-center select-none"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
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
            className={`cursor-pointer rounded-3xl bg-gradient-to-b ${amulet.color} border-[4px] p-5 flex flex-col items-center justify-between text-center transition-all min-h-[300px] group overflow-hidden shadow-lg hover:shadow-xl relative`}
          >
            {/* Gloss reflection layer */}
            <div className="absolute top-0.5 left-2 right-2 h-2.5 bg-white/45 rounded-full blur-[0.5px]" />
            
            {/* Clean top indicator icon */}
            <div className="flex items-center justify-center min-h-[28px]">
              {amulet.icon}
            </div>

            {/* Amulet Image frame */}
            <div className="w-36 h-36 flex items-center justify-center p-2 my-2 relative">
              <div 
                className="absolute inset-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl mix-blend-screen"
                style={{ backgroundColor: amulet.glowColor }}
              />
              <img
                src={amulet.imageUrl}
                alt={amulet.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain relative z-10 transition-transform duration-350 group-hover:scale-110 drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)]"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/logo doremi lab.png";
                }}
              />
            </div>

            {/* Title / Action */}
            <div className="mt-2 w-full">
              <h3 className="font-funny font-black text-[14px] sm:text-[15px] uppercase text-[#472F92] tracking-normal leading-tight block">
                {amulet.element}
              </h3>
              <div 
                className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-funny font-black uppercase text-[#472F92] tracking-wider rounded-xl transition-all border border-purple-200/50 group-hover:scale-105 active:scale-95 shadow-sm"
                style={{ backgroundColor: amulet.glowColor }}
              >
                <span>Ver más</span>
                <span className="group-hover:translate-x-0.5 transition-transform">➔</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detailed Modal Overlay for full inspection */}
      <AnimatePresence>
        {selectedAmulet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAmulet(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.93, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FFFDF1] border-[5px] rounded-[36px] w-full max-w-2xl p-6 sm:p-8 shadow-2xl text-[#472F92] overflow-hidden relative"
              style={{ 
                borderColor: selectedAmulet.id === 'tierra' ? '#CDA152' : selectedAmulet.id === 'agua' ? '#31C3AA' : selectedAmulet.id === 'viento' ? '#52ADED' : selectedAmulet.id === 'rayo' ? '#BE82ED' : '#FFC927' 
              }}
            >
              {/* Star backdrop glow inside modal */}
              <div 
                className="absolute -top-[10%] -right-[10%] w-52 h-52 rounded-full blur-3xl opacity-20 pointer-events-none mix-blend-multiply"
                style={{ backgroundColor: selectedAmulet.glowColor }}
              />

              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 relative z-10">
                {/* Visual Amulet Large frame with soft glow */}
                <div className="w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center p-1 relative flex-shrink-0 bg-white/40 rounded-3xl border-2 border-purple-100/50 shadow-inner">
                  <div 
                    className="absolute inset-6 rounded-full filter blur-3xl opacity-40 animate-pulse animate-pulse-slow"
                    style={{ backgroundColor: selectedAmulet.glowColor }}
                  />
                  <img
                    src={selectedAmulet.imageUrl}
                    alt={selectedAmulet.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain relative z-10 drop-shadow-[0_12px_24px_rgba(0,0,0,0.18)] scale-[1.35] hover:scale-[1.42] transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/logo doremi lab.png";
                    }}
                  />
                </div>

                {/* Text explanation content */}
                <div className="flex-1 space-y-4">
                  <div>
                    <span 
                      className="text-[10px] font-bold uppercase border px-2.5 py-0.5 rounded-full tracking-wider inline-block font-sans"
                      style={{ 
                        borderColor: selectedAmulet.id === 'tierra' ? '#CDA152' : selectedAmulet.id === 'agua' ? '#31C3AA' : selectedAmulet.id === 'viento' ? '#52ADED' : selectedAmulet.id === 'rayo' ? '#BE82ED' : '#FFC927',
                        color: selectedAmulet.id === 'tierra' ? '#7A5A18' : selectedAmulet.id === 'agua' ? '#309A87' : selectedAmulet.id === 'viento' ? '#306CA5' : selectedAmulet.id === 'rayo' ? '#965EA5' : '#7A5A18'
                      }}
                    >
                      {selectedAmulet.category}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black font-funny uppercase tracking-wide text-[#472F92] mt-1.5">
                      {selectedAmulet.name}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-[#472F92]/90 leading-relaxed font-sans font-semibold">
                    {selectedAmulet.description}
                  </p>

                  <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200/50 space-y-1.5 font-sans">
                    <span className="text-[10px] text-[#472F92] uppercase font-black tracking-widest block">Fórmula de Poder Rítmico</span>
                    <div className="flex items-start gap-2 text-xs font-bold leading-relaxed text-[#472F92]">
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500 flex-shrink-0 mt-0.5" />
                      <p>{selectedAmulet.power}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal controls */}
              <div className="flex justify-end gap-3 mt-6 sm:mt-8 pt-4 border-t border-purple-100 relative z-10">
                <button
                  onClick={() => setSelectedAmulet(null)}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#472F92] hover:bg-[#352079] text-white font-funny font-black text-[13px] uppercase tracking-wider cursor-pointer transition-all active:scale-95 shadow-md border-b-4 border-[#2b1766]"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
