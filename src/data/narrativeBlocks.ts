/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NarrativeBlock } from '../types';

export const NARRATIVE_BLOCKS: NarrativeBlock[] = [
  {
    id: 1,
    name: "BLOQUE 1 — INICIO",
    title: "El despertar de Adaggio",
    durationStart: 0,
    durationEnd: 40,
    stateType: 'NARRATIVO',
    pedagogicalObjective: "Establecer contexto emocional, preparar escucha atenta.",
    rhythmicConcept: "Silencio activo (escucha consciente)",
    soundMovementEquivalency: "Silencio = quietud, preparación corporal",
    physicalMaterials: [],
    instrumentProtagonist: "Silencio absoluto → pad ambiental misterioso",
    narratorLines: "El gran teatro está en silencio. Adaggio despierta lentamente de un sueño profundo... ¡Prepárate para entrar en sintonía!",
    facilitatorCue: "Por favor, siéntense muy, muy quietos y escuchen el silencio antes de activar los amuletos.",
    adaggioAnimationState: "hablando",
    suggestedPausas: [],
    observables: [
      { id: "quietude", label: "Quietud inicial", description: "¿Los niños logran permanecer quietos y escuchar el silencio consciente?" }
    ],
    hexColors: ["#1e1e1e", "#2c2c2c", "#3d3d3d"]
  },
  {
    id: 2,
    name: "BLOQUE 2 — TIERRA I",
    title: "Saludos a la Tierra",
    durationStart: 40,
    durationEnd: 80,
    stateType: 'ACCIÓN',
    pedagogicalObjective: "Introducir PULSO CONSTANTE en compás de 4/4 a 90 BPM.",
    rhythmicConcept: "Pulso = BOM-BOM (4/4, 90 BPM constante)",
    soundMovementEquivalency: "Marcha rítmica con pisadas marcadas sintiendo el suelo.",
    physicalMaterials: [],
    instrumentProtagonist: "Percusión profunda (bombo)",
    narratorLines: "Siente el latido de la Madre Tierra. Levantémonos para marchar alegremente con pasos firmes.",
    facilitatorCue: "Levántense, dense espacio entre ustedes sin tropezar.",
    adaggioAnimationState: "hablando",
    suggestedPausas: [],
    observables: [
      { id: "pulse_sync", label: "Sincronía con el Pulso", description: "¿Los niños marchar sincronizados con el latido regular?" }
    ],
    hexColors: ["#FF8C00", "#8B4513", "#6B8E23"]
  },
  {
    id: 3,
    name: "BLOQUE 3 — TIERRA II",
    title: "La siembra del ritmo",
    durationStart: 80,
    durationEnd: 120,
    stateType: 'ACCIÓN',
    pedagogicalObjective: "Explorar ACENTOS pesados en el primer tiempo.",
    rhythmicConcept: "Acento en el primer pulso (BOM!)",
    soundMovementEquivalency: "Lanzar semillas imaginarias en el BOM de la percusión.",
    physicalMaterials: [],
    instrumentProtagonist: "Guitarra acústica marcando el pulso + bombo",
    narratorLines: "¡Lancemos semillas al compás de la siembra! Agáchate y toca el suelo en cada ¡BOM! fuerte.",
    facilitatorCue: "Simulemos lanzar una semilla con un arco grande del brazo cada vez que suene fuerte.",
    adaggioAnimationState: "hablando",
    suggestedPausas: [],
    observables: [
      { id: "accent_squat", label: "Reacción al Golpe Grave", description: "¿Se agachan coincidiendo con el golpe BOM de baja frecuencia?" }
    ],
    hexColors: ["#FF8C00", "#8B4513", "#6B8E23"]
  },
  {
    id: 4,
    name: "BLOQUE 4 — TRANSICIÓN",
    title: "Transición Tierra y Agua",
    durationStart: 120,
    durationEnd: 160,
    stateType: 'ACCIÓN_DIRECCIÓN',
    pedagogicalObjective: "Acompañar la transición corporal de pisadas terrestres a movimientos acuáticos suaves.",
    rhythmicConcept: "Transición de pulso y registro tonal",
    soundMovementEquivalency: "Danzar de puntillas acariciando el aire suavemente con las manos.",
    physicalMaterials: [],
    instrumentProtagonist: "Xilófono templado",
    narratorLines: "El suelo firme comienza a recibir las primeras gotas sutiles de lluvia. Sintamos este cambio y hagamos bailar de puntillas y agitando las manos en alto.",
    facilitatorCue: "Sintamos la lluvia suave y levantemos los brazos para simular las gotas sin elementos extra.",
    adaggioAnimationState: "hablando",
    suggestedPausas: [],
    observables: [
      { id: "transition_mvmt", label: "Fluidez en la Transición", description: "¿Logran cambiar de una marcha pesada a un movimiento liviano de puntillas?" }
    ],
    hexColors: ["#a5f3fc", "#06b6d4", "#0891b2"]
  },
  {
    id: 5,
    name: "BLOQUE 5 — AGUA I",
    title: "El Agua Fluida",
    durationStart: 160,
    durationEnd: 200,
    stateType: 'ACCIÓN',
    pedagogicalObjective: "Experimentar la fluidez corporal imitando las ondas del agua pura.",
    rhythmicConcept: "Fluidez corporal y registro de alturas",
    soundMovementEquivalency: "Brazos arriba para notas agudas, y brazos abajo para notas graves.",
    physicalMaterials: [],
    instrumentProtagonist: "Metalófono y ondas fluidas",
    narratorLines: "El agua pura nos rodea y nos invita a fluir. Estira tus brazos arriba si escuchas agudo, y hacia el suelo si escuchas grave.",
    facilitatorCue: "Sigan el movimiento suave de las aguas puras con todo el cuerpo, balanceando los brazos.",
    adaggioAnimationState: "hablando",
    suggestedPausas: [],
    observables: [
      { id: "water_flow", label: "Movimiento Ondulante", description: "¿Los niños expresan corporalmente la fluidez de las corrientes acuáticas?" }
    ],
    hexColors: ["#87CEEB", "#40E0D0", "#F0F8FF"]
  },
  {
    id: 6,
    name: "BLOQUE 6 — AGUA II",
    title: "Las Ondas del Agua",
    durationStart: 200,
    durationEnd: 240,
    stateType: 'ACCIÓN',
    pedagogicalObjective: "Lograr movimientos continuos y coordinados con mímica acuática ondulante.",
    rhythmicConcept: "Balanceo continuo rítmico",
    soundMovementEquivalency: "Mover los brazos de lado a lado simulando las olas del lago sagrado.",
    physicalMaterials: [],
    instrumentProtagonist: "Arpa celestial y oleaje místico",
    narratorLines: "Dancemos con las aguas en un vaivén suave e infinito. Balancea tus brazos de lado a lado sintiendo el fluir constante.",
    facilitatorCue: "Guiemos las manos dibujando ondas amplias frente al pecho, de manera continua.",
    adaggioAnimationState: "hablando",
    suggestedPausas: [],
    observables: [
      { id: "water_waves", label: "Vaivén de Olas", description: "¿Mantienen la continuidad rítmica sin interrumpir el movimiento?" }
    ],
    hexColors: ["#87CEEB", "#20B2AA", "#AFEEEE"]
  },
  {
    id: 7,
    name: "BLOQUE 7 — VIENTO I",
    title: "Viento",
    durationStart: 240,
    durationEnd: 280,
    stateType: 'ACCIÓN',
    pedagogicalObjective: "Introducir DINÁMICAS (sonoridad piano / movimiento contenido).",
    rhythmicConcept: "Dinámica = piano (movimiento pequeño, brazos frente al pecho)",
    soundMovementEquivalency: "Brazos juntos frente al pecho, simulando una pequeña brisa.",
    physicalMaterials: [],
    instrumentProtagonist: "Flauta dulce",
    narratorLines: "Un viento sutil acaricia el bosque a lo lejos. Mantengamos las manos juntas frente al pecho sintiendo esa caricia silenciosa.",
    facilitatorCue: "Movimientos pequeños y delicados como una misteriosa brisa flotante.",
    adaggioAnimationState: "hablando",
    suggestedPausas: [],
    observables: [
      { id: "dynamic_piano", label: "Control de Movimiento Pequeño", description: "¿Los infantes logran mantener movimientos suaves y contenidos?" }
    ],
    hexColors: ["#FFFFFF", "#87CEEB", "#D3D3D3"]
  },
  {
    id: 8,
    name: "BLOQUE 8 — VIENTO II",
    title: "Viento Fuerte",
    durationStart: 280,
    durationEnd: 320,
    stateType: 'ACCIÓN',
    pedagogicalObjective: "Expandir dinámicas (forte / movimiento amplio y respiración).",
    rhythmicConcept: "Dinámica = forte (brazos abiertos amplios)",
    soundMovementEquivalency: "Extender los brazos hacia afuera de par en par con respiraciones.",
    physicalMaterials: [],
    instrumentProtagonist: "Flauta y ráfagas crescendos",
    narratorLines: "¡El viento sopla fuerte! Abre tus brazos en grande, ¡lo más amplio que puedas!",
    facilitatorCue: "Inhalemos llenando el pecho de aire y abramos los brazos con energía de viento.",
    adaggioAnimationState: "hablando",
    suggestedPausas: [],
    observables: [
      { id: "dynamic_forte", label: "Apertura en Forte", description: "¿Los niños expanden sus movimientos proporcionalmente al volumen?" }
    ],
    hexColors: ["#FFFFFF", "#87CEEB", "#D3D3D3"]
  },
  {
    id: 9,
    name: "BLOQUE 9 — TRUENO I",
    title: "El retorno de la tormenta",
    durationStart: 320,
    durationEnd: 360,
    stateType: 'ACCIÓN_DIRECCIÓN',
    pedagogicalObjective: "Reaccionar a CONTRASTE SÚBITO (estallido ruidoso).",
    rhythmicConcept: "Contraste sorpresivo (flujo continuo vs. corte)",
    soundMovementEquivalency: "Moverse como el viento y detenerse/temblar ante el trueno.",
    physicalMaterials: [],
    instrumentProtagonist: "Percusión caótica y truenos",
    narratorLines: "El cielo se vuelve oscuro... ¡la tormenta regresa! Prepárate para el chispazo eléctrico de la tempestad.",
    facilitatorCue: "Sigan moviéndose pero muy alertas a la señal del trueno.",
    adaggioAnimationState: "hablando",
    suggestedPausas: [],
    observables: [
      { id: "sudden_contrast", label: "Reacción al Trueno", description: "¿Detienen el movimiento de viento para reaccionar al trueno?" }
    ],
    hexColors: ["#4B0082", "#696969", "#7B68EE"]
  },
  {
    id: 10,
    name: "BLOQUE 10 — TRUENO II",
    title: "Esquiva el trueno",
    durationStart: 360,
    durationEnd: 400,
    stateType: 'ACCIÓN_DIRECCIÓN',
    pedagogicalObjective: "Interpolar ráfagas de movimientos rápidos de temblor.",
    rhythmicConcept: "Duración de reacción (vibración corta, 1 segundo)",
    soundMovementEquivalency: "Sacudida instantánea corporal celebrando haber sobrevivido al estallido.",
    physicalMaterials: [],
    instrumentProtagonist: "Truenos secos y estrépito",
    narratorLines: "¡Bzzz! Un rayo ha caído cerca pero... ¡has logrado sobrevivir! Tu cuerpo tiembla divertido y con mucha energía.",
    facilitatorCue: "¡Tiembla alegremente un segundo sintiendo que logramos superar la tormenta!",
    adaggioAnimationState: "hablando",
    suggestedPausas: [],
    observables: [
      { id: "rapid_vibration", label: "Vibración Eléctrica", description: "¿Coordinan la sacudida corporal al saber que han sobrevivido?" }
    ],
    hexColors: ["#4B0082", "#2F4F4F", "#000000"]
  },
  {
    id: 11,
    name: "BLOQUE 11 — TRUENO III",
    title: "Paso de Sigilo",
    durationStart: 400,
    durationEnd: 440,
    stateType: 'ACCIÓN_DIRECCIÓN',
    pedagogicalObjective: "Entrenar control de inhibición motriz y desplazamientos sigilosos.",
    rhythmicConcept: "Caminata silenciosa y estatuas de piedra",
    soundMovementEquivalency: "Caminar sigilosamente con pasos leves a la velocidad rítmica de los truenos y congelarse.",
    physicalMaterials: [],
    instrumentProtagonist: "Silencios repentinos y chasquidos amortiguados",
    narratorLines: "Caminemos en puntas de pie muy sigilosamente, a la velocidad rítmica del trueno lejano... si hay un trueno fuerte: ¡congelados como estatuas de piedra!",
    facilitatorCue: "Sigilo absoluto. Nadie se mueve al oír la señal eléctrica.",
    adaggioAnimationState: "hablando",
    suggestedPausas: [],
    observables: [
      { id: "inhib_control", label: "Estatua Perfecta", description: "¿Los niños logran congelar todo movimiento corporal en el silencio?" }
    ],
    hexColors: ["#4B0082", "#2F4F4F", "#000000"]
  },
  {
    id: 12,
    name: "BLOQUE 12 — TRUENO IV",
    title: "La última tormenta",
    durationStart: 440,
    durationEnd: 480,
    stateType: 'ACCIÓN',
    pedagogicalObjective: "Consolidar el desarrollo rítmico de la tempestad liberando tensión motora.",
    rhythmicConcept: "Velocidad acelerada y respuesta auditiva",
    soundMovementEquivalency: "Saltos y movimientos veloces antes de que sople la calma.",
    physicalMaterials: [],
    instrumentProtagonist: "Percusiones tormentosas",
    narratorLines: "¡La tormenta llega a su fin con un último trueno colosal! Salta y libera la energía que llevas dentro.",
    facilitatorCue: "¡Hagamos el último gran salto del trueno y preparémonos para la llegada del Sol!",
    adaggioAnimationState: "hablando",
    suggestedPausas: [],
    observables: [
      { id: "storm_end", label: "Liberación motora", description: "¿Siguen la aceleración de la percusión para prepararse para la calma?" }
    ],
    hexColors: ["#4D1C5C", "#4B0082", "#130129"]
  },
  {
    id: 13,
    name: "BLOQUE 13 — SOL I",
    title: "La marcha de la antorcha",
    durationStart: 480,
    durationEnd: 520,
    stateType: 'ACCIÓN',
    pedagogicalObjective: "Marchar a tempo ágil sosteniendo una antorcha rítmica.",
    rhythmicConcept: "Tempo de marcha animado (110 BPM) + marcha rítmica con objeto",
    soundMovementEquivalency: "Marcha triunfal con elevación de rodillas sosteniendo una antorcha.",
    physicalMaterials: ["Antorcha ligera (idealmente de papel celofán naranja o mímica)"],
    instrumentProtagonist: "Bombo acústico brillante y vientos",
    narratorLines: "¡El Sol amanece radiante! Sujetemos nuestra antorcha mágica de luz y marchemos con orgullo levantando las rodillas.",
    facilitatorCue: "Alcen la antorcha brillante de par en par, caminemos iluminando el espacio.",
    adaggioAnimationState: "hablando",
    suggestedPausas: [
      {
        time: 5,
        label: "PAUSA ANTORCHAS",
        text: "Distribución de antorchas: Entregar las antorchas ligeras de juguete o preparar los brazos simulando sostener luz."
      }
    ],
    observables: [
      { id: "marching_torch", label: "Coordinación con Antorcha", description: "¿Sincronizan los pies y las manos alzando la antorcha con alegría?" }
    ],
    hexColors: ["#FFD700", "#DAA520", "#FF4500"]
  },
  {
    id: 14,
    name: "BLOQUE 14 — SOL II",
    title: "El atardecer pausado",
    durationStart: 520,
    durationEnd: 560,
    stateType: 'ACCIÓN',
    pedagogicalObjective: "Experimentar RITARDANDO (desaceleración progresiva) bajando las antorchas.",
    rhythmicConcept: "Tempo ritardando (desaceleración rítmica)",
    soundMovementEquivalency: "Caminar encorvado sosteniendo la antorcha baja a medida que se oculta el sol.",
    physicalMaterials: ["Antorchas de luz"],
    instrumentProtagonist: "Percusión y metrónomo decreciente",
    narratorLines: "La luz solar baja lentamente en el atardecer musical. Baja tu antorcha despacio y camina con pasos muy lentos y calmos.",
    facilitatorCue: "Inclinemos suavemente nuestra antorcha rítmica, sintiendo la calma del sol que se oculta.",
    adaggioAnimationState: "hablando",
    suggestedPausas: [],
    observables: [
      { id: "ritardando_tracking", label: "Adaptación al Ritardando", description: "¿Los niños adaptan su velocidad al freno musical?" }
    ],
    hexColors: ["#FFD700", "#DAA520", "#FF4500"]
  },
  {
    id: 15,
    name: "BLOQUE 15 — FINAL",
    title: "La celebración y el latido de la paz",
    durationStart: 560,
    durationEnd: 600,
    stateType: 'CONCLUSIÓN',
    pedagogicalObjective: "Compartir el logro grupal en un único festejo final y vuelta a la calma respiratoria.",
    rhythmicConcept: "Celebración colectiva, relajación y respiración",
    soundMovementEquivalency: "Bailar con los brazos libres compartiendo el gran pulso renacido, sentarse en semicírculo respirando hondo junto a Adaggio.",
    physicalMaterials: [],
    instrumentProtagonist: "Arpa festiva, flauta dulce, y arpa celestial lenta",
    narratorLines: "¡El gran ritmo ha renacido en nuestros corazones! Todos los elementos brillan. Dancemos juntos con total alegría y terminemos sentados en calma y paz, sintiendo la mayor de las músicas en nuestro interior.",
    facilitatorCue: "Démonos un abrazo, dancemos libres y luego sentémonos en semicírculo para sentir el latido relajado de nuestro corazón. Inhalamos... Exhalamos...",
    adaggioAnimationState: "hablando",
    suggestedPausas: [],
    observables: [
      { id: "calm_regained", label: "Paz y Unión", description: "¿Bailan alegremente en comunidad y luego sintonizan la relajación con calma?" }
    ],
    hexColors: ["#DAA520", "#32CD32", "#00FFFF"]
  }
];
