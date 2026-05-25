/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NarrativeBlock } from '../types';

export const NARRATIVE_BLOCKS: NarrativeBlock[] = [
  {
    id: 1,
    name: "BLOQUE 1 — INICIO",
    title: "El mundo olvidó el ritmo",
    durationStart: 0,
    durationEnd: 50,
    stateType: 'NARRATIVO',
    pedagogicalObjective: "Establecer contexto emocional, preparar escucha atenta.",
    rhythmicConcept: "Silencio activo (escucha consciente)",
    soundMovementEquivalency: "Silencio = quietud, preparación corporal",
    physicalMaterials: [],
    instrumentProtagonist: "Silencio absoluto → pad ambiental misterioso",
    narratorLines: "El mundo ha quedado sumido en un silencio extraño. Adaggio, el conejo del teatrillo, solía saltar al compás del viento, pero el ruido ensordecedor de los truenos lo ha distraído por completo. El gran ritmo se ha dormido...",
    facilitatorCue: "Por favor, siéntense o quédense de pie, pero muy, muy quietos. Escuchemos el silencio antes de activar los tótems.",
    adaggioAnimationState: "quiet",
    suggestedPausas: [],
    observables: [
      { id: "quietude", label: "Quietud inicial", description: "¿Los niños logran permanecer quietos y escuchar el silencio consciente?" }
    ],
    hexColors: ["#1e1e1e", "#2c2c2c", "#3d3d3d"]
  },
  {
    id: 2,
    name: "BLOQUE 2 — TIERRA",
    title: "La siembra y el ciclo día/noche",
    durationStart: 50,
    durationEnd: 120, // 2:00 = 120 seconds
    stateType: 'ACCIÓN',
    pedagogicalObjective: "Introducir PULSO CONSTANTE (latido regular de la música en compás de 4/4 a 90 BPM).",
    rhythmicConcept: "Pulso = BOM-BOM-BOM-BOM (4/4, 90 BPM constante)",
    soundMovementEquivalency: "Pulso constante = marcha rítmica con pisadas marcadas lanzando semillas con arco amplio. Agacharse e interactuar en el 'BOM!' grave.",
    physicalMaterials: [],
    instrumentProtagonist: "Guitarra acústica marcando el pulso + percusión profunda (bombo)",
    narratorLines: "¡Pónganse de pie! Imaginen un campo fértil bajo un sol que apenas despierta. Lancemos semillas al ritmo de la tierra... ¡Caminen con pisada alegre! Y cuando la percusión diga ¡BOM!, nos agachamos para tocar el suelo con las palmas. ¡De día y de noche, sembrando vida!",
    facilitatorCue: "Levántense, dense espacio entre ustedes sin tropezar.",
    adaggioAnimationState: "march_sowing",
    suggestedPausas: [
      {
        time: 15, // 0:50 + 15s = 1:05
        label: "PAUSA 1 (1:05)",
        text: "Verificación de espacio: El facilitador confirma que todos los niños están de pie y tienen espacio para marchar y simular el lanzamiento de semillas antes de que comience el ritmo."
      }
    ],
    observables: [
      { id: "pulse_sync", label: "Sincronía con el Pulso", description: "¿Los niños marchan sincronizados con el latido regular de la guitarra y el bombo?" },
      { id: "accent_squat", label: "Reacción al Golpe Grave", description: "¿Sincronizan el gesto de agacharse y tocar el suelo coincidiendo con el golpe BOM de baja frecuencia?" }
    ],
    hexColors: ["#FF8C00", "#8B4513", "#6B8E23"]
  },
  {
    id: 3,
    name: "BLOQUE 3 — AGUA",
    title: "Las gotas y el río",
    durationStart: 120, // 2:00
    durationEnd: 185, // 3:05 = 185 seconds
    stateType: 'ACCIÓN',
    pedagogicalObjective: "Introducir ALTURAS TONALES (discriminación entre sonidos agudos y graves).",
    rhythmicConcept: "Altura = agudo (arriba) vs. grave (abajo)",
    soundMovementEquivalency: "Sonidos agudos (notas altas de xilófono) = brazos arriba ondeando el pañuelo azul. Sonidos graves = brazos abajo.",
    physicalMaterials: ["Pañuelo o trapo azul ligero (1 por niño)"],
    instrumentProtagonist: "Gotas cristalinas (Xilófono/metalófono agudo) + guitarra de acompañamiento",
    narratorLines: "La tierra está lista, pero tiene sed. Miren al cielo: caen gotas cristalinas. Saquen sus pañuelos azules y hagámoslos bailar. Si las gotas suenan agudas, el pañuelo sube al cielo; si suenan graves, bajan. ¡Y miren, las gotas se convierten en un río caudaloso! ¡Hagamos ondas amplias como el vaivén del agua!",
    facilitatorCue: "Saquen su pañuelo azul y sujétenlo con una mano. ¿Todos listos?",
    adaggioAnimationState: "fluid_raise_drop",
    suggestedPausas: [
      {
        time: 18, // 2:00 + 18s = 2:18
        label: "PAUSA 2 (2:18)",
        text: "Distribución de Material: El facilitador se asegura de que cada infante cuente con su pañuelo o trapo azul antes de reanudar la acción musical."
      }
    ],
    observables: [
      { id: "pitch_discrimination", label: "Discriminación Agudo/Grave", description: "¿Los niños logran levantar el pañuelo ante sonidos agudos y bajarlo ante los graves?" },
      { id: "fluid_motion", label: "Movimiento de Vaivén", description: "¿Participan suavemente y coordinan el movimiento amplio de olas en la sección del río caudaloso?" }
    ],
    hexColors: ["#87CEEB", "#40E0D0", "#F0F8FF"]
  },
  {
    id: 4,
    name: "BLOQUE 4 — VIENTO",
    title: "El sonido del aire",
    durationStart: 185, // 3:05
    durationEnd: 240, // 4:00 = 240 seconds
    stateType: 'ACCIÓN',
    pedagogicalObjective: "Introducir DINÁMICAS (la intensidad de la sonoridad: piano vs. forte).",
    rhythmicConcept: "Dinámica = piano (movimiento pequeño, brazos frente al pecho) vs. forte (brazos abiertos amplios)",
    soundMovementEquivalency: "Música suave (piano) = brazos recogidos frente al pecho, movimiento contenido. Música intensa (forte) = brazos totalmente extendidos hacia afuera.",
    physicalMaterials: [],
    instrumentProtagonist: "Melodía aérea flotante (flauta/sintetizador) + ráfagas de viento y crescendo armónico",
    narratorLines: "El viento acaricia la tierra labrada y el río brillante. Sientan el flujo de las ráfagas. Junten los brazos frente a su pecho como una pequeña brisa... a medida que escuchen el viento crecer ruidosamente, abran sus brazos con fuerza, ¡lo más grande que puedan! ¡Sientan el pecho expandirse y respirar en grande!",
    facilitatorCue: "Guardemos o soltemos el pañuelo. Pongamos las manos frente al pecho, listos para abrir caminos como el viento.",
    adaggioAnimationState: "expanding_arms",
    suggestedPausas: [
      {
        time: 15, // 3:05 + 15s = 3:20
        label: "PAUSA 3 (3:20)",
        text: "Modelado Previo: El facilitador verifica que todos guarden los pañuelos y adopten la postura inicial con los brazos cruzados o recogidos frente al pecho."
      }
    ],
    observables: [
      { id: "dynamic_scaling", label: "Graduación de Dinámicas", description: "¿Los infantes regulan de manera proporcional la apertura de brazos según la amplitud y volumen del viento sonoro?" },
      { id: "posture_expansion", label: "Expansión del Pecho", description: "¿Se involucra el torso y el pecho en las respiraciones y aperturas amplias?" }
    ],
    hexColors: ["#FFFFFF", "#87CEEB", "#D3D3D3"]
  },
  {
    id: 5,
    name: "BLOQUE 5 — TRUENO PARTE 1",
    title: "El ruido que volvió",
    durationStart: 240, // 4:00
    durationEnd: 280, // 4:40 = 280 seconds
    stateType: 'ACCIÓN_DIRECCIÓN',
    pedagogicalObjective: "Introducir CONTRASTE SÚBITO (reacción de detención/congelamiento ante interrupciones de alta intensidad).",
    rhythmicConcept: "Contraste súbito = mantener movimiento base + vibrar por completo ante chispa eléctrica",
    soundMovementEquivalency: "Flujo continuo del viento soplado por los brazos + reacción de sacudida y vibración instantánea de 1 segundo coincidiendo con el chispazo agudo eléctrico.",
    physicalMaterials: [],
    instrumentProtagonist: "Percusión caótica + truenos fuertes + inesperados golpes agudos de rayo",
    narratorLines: "El cielo se vuelve oscuro de repente... morado... ¡la tormenta regresa! Mantengan sus brazos moviéndose como el viento temeroso, ¡pero cuidado! Si escuchan un chispazo muy agudo y chirriante, el rayo nos sacude el cuerpo con un cosquilleo eléctrico durante un segundo. ¡Bzzz! Y volvemos al viento inmediatamente.",
    facilitatorCue: "Manténganse de pie. Solo vibramos o temblamos cuando suene el relámpago agudo. ¡Estén muy atentos con sus oídos!",
    adaggioAnimationState: "shaking_electric",
    suggestedPausas: [],
    observables: [
      { id: "sudden_contrast", label: "Contraste Súbito", description: "¿Los niños reaccionan al estallido agudo interrumpiendo fluidamente su movimiento para temblar y congelarse?" },
      { id: "rapid_recovery", label: "Recuperación Rápida", description: "¿Regresan al flujo continuo del viento justo después de disiparse el sonido de la descarga?" }
    ],
    hexColors: ["#4B0082", "#696969", "#7B68EE"]
  },
  {
    id: 6,
    name: "BLOQUE 6 — TRUENO PARTE 2",
    title: "El ruido musical (Juego del sigilo)",
    durationStart: 280, // 4:40
    durationEnd: 325, // 5:25 = 325 seconds
    stateType: 'ACCIÓN_DIRECCIÓN',
    pedagogicalObjective: "Introducir PULSO OCULTO y CONGELAMIENTO SÚBITO (estatuas en silencio).",
    rhythmicConcept: "Pulso oculto (caminar sigiloso) + Congelamiento instantáneo ante el rayo seco (permanecer 2-3 seg inmóviles)",
    soundMovementEquivalency: "Percusión industrial pesada = caminar en puntillas levantando rodillas lenta y sigilosamente. Trueno o estruendo seco = convertirse en estatuas de piedra sin mover un solo músculo.",
    physicalMaterials: [],
    instrumentProtagonist: "Percusión metálica pesada (marcando compás) + estruendos de rayo repentinos",
    narratorLines: "El ruido se vuelve musical... pero es un ritmo pesado. Caminemos en puntillas del pie, muy sigilosos, como si cruzáramos la alcoba de un gigante. Sigan el golpe oculto. ¡Puntitas... puntitas...! ¡CUIDADO! Un estallido truena... ¡Estatuas! Nadie se mueve... mantengan la postura por dos, tres segundos... hasta que retorne el silencio sigiloso.",
    facilitatorCue: "Caminen lento en puntas de pies. Si suena el rayo: congelados como rocas. ¡Yo los vigilo a ver quién no pestañea!",
    adaggioAnimationState: "congelado_estatua",
    suggestedPausas: [
      {
        time: 10, // 4:40 + 10s = 4:50
        label: "PAUSA 4 (4:50)",
        text: "Ensayo de Estatua: Si el facilitador observa que más del 70% de la clase se distrae o sigue moviéndose durante los rayos, se realiza una pequeña práctica interactiva independiente del video antes de continuar."
      }
    ],
    observables: [
      { id: "stealth_pulse_walk", label: "Caminar en Sigilo", description: "¿Siguen la marcha en punta de pies siguiendo de forma constante e internalizada el paso métrico?" },
      { id: "stone_statue_freeze", label: "Congelamiento Absoluto", description: "¿Los niños logran detenerse y conservar total inmovilidad corporal durante los 2 y 3 segundos del estallido del rayo?" }
    ],
    hexColors: ["#4B0082", "#2F4F4F", "#000000"]
  },
  {
    id: 7,
    name: "BLOQUE 7 — LLAMADO AL SOL",
    title: "La marcha de la luz",
    durationStart: 325, // 5:25
    durationEnd: 405, // 6:45 = 405 seconds
    stateType: 'ACCIÓN',
    pedagogicalObjective: "Integrar conceptos previos: PULSO + ACENTOS rítmicos + VARIACIONES DE TEMPO (acelerando, ritardando).",
    rhythmicConcept: "Acentos = saltos verticales con caída firme. Tempo cambiante = rápido alegre a lento pesado.",
    soundMovementEquivalency: "Bombo de marcha = levantar rodillas con orgullo al andar. Salto enérgico coincidiendo con el acento cada 4 pulsos. Tempo de marcha pesado lento = caminar encorvados cargando el bastón en la espalda.",
    physicalMaterials: ["Bastón o palo de madera ligero sin astillas de 50-80 cm de longitud (1 por niño)"],
    instrumentProtagonist: "Bombo de marcha militar acústica y percusión brillante progresiva",
    narratorLines: "La tormenta ya se desvanece, es momento de llamar al Sol. Tomen sus bastones mágicos con firmeza con ambas manos. ¡Y marchen con la cabeza en alto! Uno, dos, uno, dos... Y cuando sientan la gran llamada de luz... ¡Damos un salto hacia el cielo y golpeamos el suelo sutilmente al caer! ¡Eso es! Pero miren, la luz viene despacio ahora... la música frena... bajen los hombros, carguen su bastón en la espalda... caminamos despacio y sintiendo el peso...",
    facilitatorCue: "Tomen sus bastones con ambas manos, mantengan la espalda recta para marchar como líderes.",
    adaggioAnimationState: "proud_march",
    suggestedPausas: [
      {
        time: 25, // 5:25 + 25s = 5:50
        label: "PAUSA 5 (5:50)",
        text: "Verificación de Seguridad de Bastones: El facilitador coordina que cada niño porte su palo de manera segura, evitando juegos bruscos, antes de iniciar la marcha activa."
      }
    ],
    observables: [
      { id: "accent_jump", label: "Coordinación de Saltos en Acentos", description: "¿Los niños saltan con fuerza de forma anticipada o coordinada sincronizándose con la señal del acento métrico cada 4 pulsos?" },
      { id: "tempo_tracking", label: "Transición de Tempos", description: "¿Los niños logran desacelerar sensiblemente su marcha y cambiar su actitud corporal hacia un paso pesado corporal cuando la música pasa de ágil (110 BPM) a lenta (60 BPM)?" }
    ],
    hexColors: ["#FFD700", "#DAA520", "#FF4500"]
  },
  {
    id: 8,
    name: "BLOQUE 8 — FINAL",
    title: "El ritmo recordado",
    durationStart: 405, // 6:45
    durationEnd: 455, // 7:35 = 455 seconds
    stateType: 'CONCLUSIÓN',
    pedagogicalObjective: "Cierre emocional, integración de conceptos y celebración colectiva.",
    rhythmicConcept: "Síntesis armónica (descanzo físico, retroalimentación mental y respiración)",
    soundMovementEquivalency: "Marcha triunfal → soltar el bastón → respiraciones lentas simétricas acompañando los brazos libres.",
    physicalMaterials: ["Bastones (se guardan hacia el final)"],
    instrumentProtagonist: "Fusión integradora (guitarra, metalófono, viento y tambores en armonía floreciente)",
    narratorLines: "¡El sol ha despertado! Miren los tótems brillar en armonía. ¡Saltemos de alegría! Hemos rescatado el ritmo, que no estaba perdido, sino guardado en el latido de nuestros propios corazones. Respiremos hondo... subiendo los brazos... soltando el aire lentamente. ¡Gracias por esta gran danza de vida!",
    facilitatorCue: "Suelten sus bastones en el suelo con suavidad. Respiremos hondo junto con Adaggio. Inhalen... Exhalen...",
    adaggioAnimationState: "bow",
    suggestedPausas: [],
    observables: [
      { id: "climax_joy", label: "Celebración y Clímax", description: "¿Los niños experimentan entusiasmo y júbilo sincronizado en la explosión musical?" },
      { id: "calm_respiration", label: "Relajación Final", description: "¿Adquieren con naturalidad el estado de paz, respirando coordinadamente al final?" }
    ],
    hexColors: ["#DAA520", "#32CD32", "#FF69B4"]
  }
];
