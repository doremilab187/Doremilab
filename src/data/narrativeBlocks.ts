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
    facilitatorCue: "Por favor, siéntense muy, muy quietos y escuchen el silencio antes de activar los tótems.",
    adaggioAnimationState: "quiet",
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
    adaggioAnimationState: "march_sowing",
    suggestedPausas: [],
    observables: [
      { id: "pulse_sync", label: "Sincronía con el Pulso", description: "¿Los niños marchan sincronizados con el latido regular?" }
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
    adaggioAnimationState: "march_sowing",
    suggestedPausas: [],
    observables: [
      { id: "accent_squat", label: "Reacción al Golpe Grave", description: "¿Se agachan coincidiendo con el golpe BOM de baja frecuencia?" }
    ],
    hexColors: ["#FF8C00", "#8B4513", "#6B8E23"]
  },
  {
    id: 4,
    name: "BLOQUE 4 — AGUA I",
    title: "Las primeras gotas de lluvia",
    durationStart: 120,
    durationEnd: 160,
    stateType: 'ACCIÓN',
    pedagogicalObjective: "Introducir ALTURAS TONALES (sonidos agudos).",
    rhythmicConcept: "Altura = notas agudas del xilófono",
    soundMovementEquivalency: "Mover el pañuelo azul en lo alto del cielo.",
    physicalMaterials: ["Pañuelo azul (1 por niñoID)"],
    instrumentProtagonist: "Xilófono agudo (gotas cristalinas)",
    narratorLines: "Caen gotas cristalinas del cielo. Hagamos bailar los pañuelos azules en lo más alto.",
    facilitatorCue: "Saquen sus pañuelos azules y levanten los brazos para simular la suave lluvia.",
    adaggioAnimationState: "fluid_raise_drop",
    suggestedPausas: [
      {
        time: 5,
        label: "PAUSA PAÑUELOS",
        text: "Distribución de pañuelos: El facilitador entrega un pañuelo azul a cada participante."
      }
    ],
    observables: [
      { id: "pitch_high", label: "Movimiento arriba", description: "¿Los niños levantan el pañuelo coordinando con notas agudas?" }
    ],
    hexColors: ["#87CEEB", "#40E0D0", "#F0F8FF"]
  },
  {
    id: 5,
    name: "BLOQUE 5 — AGUA II",
    title: "El río caudaloso",
    durationStart: 160,
    durationEnd: 200,
    stateType: 'ACCIÓN',
    pedagogicalObjective: "Contrastar agudos arriba y graves abajo.",
    rhythmicConcept: "Contrarios espaciales de altura (agudo/grave, alto/bajo)",
    soundMovementEquivalency: "Pañuelo arriba para agudos, pañuelo abajo para graves. Movimiento de vaivén.",
    physicalMaterials: ["Pañuelo azul"],
    instrumentProtagonist: "Xilófono y guitarra con notas fluctuantes",
    narratorLines: "Las gotas se unen en un río caudaloso. Arriba cuando suene agudo, y abajo si suena grave.",
    facilitatorCue: "Sigan la corriente del río haciendo ondas amplias con todo el cuerpo.",
    adaggioAnimationState: "fluid_raise_drop",
    suggestedPausas: [],
    observables: [
      { id: "pitch_discrimination", label: "Discriminación Agudo/Grave", description: "¿Siguen correctamente la indicación corporal agudo/grave?" }
    ],
    hexColors: ["#87CEEB", "#40E0D0", "#F0F8FF"]
  },
  {
    id: 6,
    name: "BLOQUE 6 — VIENTO I",
    title: "La brisa suave (Piano)",
    durationStart: 200,
    durationEnd: 240,
    stateType: 'ACCIÓN',
    pedagogicalObjective: "Introducir DINÁMICAS (sonoridad piano / movimiento contenido).",
    rhythmicConcept: "Dinámica = piano (movimiento pequeño, brazos frente al pecho)",
    soundMovementEquivalency: "Brazos juntos frente al pecho, simulando una pequeña brisa.",
    physicalMaterials: [],
    instrumentProtagonist: "Sintetizador suave y flauta",
    narratorLines: "Un viento sutil acaricia el bosque. Mantengamos las manos juntas frente al pecho.",
    facilitatorCue: "Movimientos pequeños y delicados como una suave brisa.",
    adaggioAnimationState: "expanding_arms",
    suggestedPausas: [],
    observables: [
      { id: "dynamic_piano", label: "Control de Movimiento Pequeño", description: "¿Los infantes logran mantener movimientos suaves y contenidos?" }
    ],
    hexColors: ["#FFFFFF", "#87CEEB", "#D3D3D3"]
  },
  {
    id: 7,
    name: "BLOQUE 7 — VIENTO II",
    title: "Las grandes ráfagas (Forte)",
    durationStart: 240,
    durationEnd: 280,
    stateType: 'ACCIÓN',
    pedagogicalObjective: "Expandir dinámicas (forte / movimiento amplio y respiración).",
    rhythmicConcept: "Dinámica = forte (brazos abiertos amplios)",
    soundMovementEquivalency: "Extender los brazos hacia afuera de par en par con respiraciones.",
    physicalMaterials: [],
    instrumentProtagonist: "Ráfagas crescendos y flauta con aire ascendente",
    narratorLines: "¡El viento sopla fuerte! Abre tus brazos en grande, ¡lo más amplio que puedas!",
    facilitatorCue: "Inhalemos llenando el pecho de aire y abramos los brazos con energía de viento.",
    adaggioAnimationState: "expanding_arms",
    suggestedPausas: [],
    observables: [
      { id: "dynamic_forte", label: "Apertura en Forte", description: "¿Los niños expanden sus movimientos proporcionalmente al volumen?" }
    ],
    hexColors: ["#FFFFFF", "#87CEEB", "#D3D3D3"]
  },
  {
    id: 8,
    name: "BLOQUE 8 — TRUENO I",
    title: "El retorno de la tormenta",
    durationStart: 280,
    durationEnd: 320,
    stateType: 'ACCIÓN_DIRECCIÓN',
    pedagogicalObjective: "Reaccionar a CONTRASTE SÚBITO (estallido ruidoso).",
    rhythmicConcept: "Contraste sorpresivo (flujo continuo vs. corte)",
    soundMovementEquivalency: "Moverse como el viento y detenerse/temblar ante el trueno.",
    physicalMaterials: [],
    instrumentProtagonist: "Percusión caótica y truenos",
    narratorLines: "El cielo se vuelve oscuro... ¡la tormenta regresa! Prepárate para el chispazo eléctrico.",
    facilitatorCue: "Sigan moviéndose pero muy alertas a la señal del trueno.",
    adaggioAnimationState: "shaking_electric",
    suggestedPausas: [],
    observables: [
      { id: "sudden_contrast", label: "Reacción al Trueno", description: "¿Detienen el movimiento de viento para reaccionar al trueno?" }
    ],
    hexColors: ["#4B0082", "#696969", "#7B68EE"]
  },
  {
    id: 9,
    name: "BLOQUE 9 — TRUENO II",
    title: "El rayo de luz",
    durationStart: 320,
    durationEnd: 360,
    stateType: 'ACCIÓN_DIRECCIÓN',
    pedagogicalObjective: "Interpolar ráfagas de movimientos rápidos de temblor.",
    rhythmicConcept: "Duración de reacción (vibración corta, 1 segundo)",
    soundMovementEquivalency: "Sacudida instantánea corporal simulando un cosquilleo eléctrico.",
    physicalMaterials: [],
    instrumentProtagonist: "Estrepitoso golpe agudo de rayo seco",
    narratorLines: "¡Bzzz! Un rayo nos sacude el cuerpo con un cosquilleo de luz durante un segundo.",
    facilitatorCue: "¡Tiemblen como gelatina por un segundo cuando suene el chispazo!",
    adaggioAnimationState: "shaking_electric",
    suggestedPausas: [],
    observables: [
      { id: "rapid_vibration", label: "Vibración Eléctrica", description: "¿Coordinan la sacudida corporal súbita con el sonido del rayo?" }
    ],
    hexColors: ["#4B0082", "#2F4F4F", "#000000"]
  },
  {
    id: 10,
    name: "BLOQUE 10 — TRUENO III",
    title: "El juego de las estatuas",
    durationStart: 360,
    durationEnd: 400,
    stateType: 'ACCIÓN_DIRECCIÓN',
    pedagogicalObjective: "Entrenar control de inhibición motriz y estatuas.",
    rhythmicConcept: "Inhibición / Congelamiento y silencio absoluto",
    soundMovementEquivalency: "Caminar sigiloso y congelamiento total de estatua por 3 segundos.",
    physicalMaterials: [],
    instrumentProtagonist: "Golpes pesados de percusión + silencios repentinos",
    narratorLines: "Caminemos en puntas de pie bajo la lluvia pesada... y si hay un trueno: ¡Estatuas de piedra!",
    facilitatorCue: "Nadie se mueve. ¡Seamos rocas firmes y silenciosas por un instante!",
    adaggioAnimationState: "congelado_estatua",
    suggestedPausas: [],
    observables: [
      { id: "inhib_control", label: "Estatua Perfecta", description: "¿Los niños logran congelar todo movimiento corporal en el silencio?" }
    ],
    hexColors: ["#4B0082", "#2F4F4F", "#000000"]
  },
  {
    id: 11,
    name: "BLOQUE 11 — SOL I",
    title: "La gran marcha de luz",
    durationStart: 400,
    durationEnd: 440,
    stateType: 'ACCIÓN',
    pedagogicalObjective: "Marchar a tempo ágil y saltar en los acentos métricos.",
    rhythmicConcept: "Tempo de marcha animado (110 BPM) + saltos en el acento",
    soundMovementEquivalency: "Marcha triunfal con elevación de rodillas sosteniendo bastones.",
    physicalMaterials: ["Bastones de madera ligeros (1 por niñoID)"],
    instrumentProtagonist: "Bombo acústico y trompetas",
    narratorLines: "Sujeten sus bastones mágicos y marchemos con orgullo. ¡Demos un salto alto en cada gran acento!",
    facilitatorCue: "Pala en mano o bastón arriba, marchemos con la cabeza alta.",
    adaggioAnimationState: "proud_march",
    suggestedPausas: [
      {
        time: 5,
        label: "PAUSA BASTONES",
        text: "Distribución de bastones: Repartir los bastones antes del llamado del sol con precauciones de seguridad."
      }
    ],
    observables: [
      { id: "marching_sync", label: "Coordinación de Marcha", description: "¿Sincronizan los pies con el bombo y saltan firmemente?" }
    ],
    hexColors: ["#FFD700", "#DAA520", "#FF4500"]
  },
  {
    id: 12,
    name: "BLOQUE 12 — SOL II",
    title: "El atardecer pausado",
    durationStart: 440,
    durationEnd: 480,
    stateType: 'ACCIÓN',
    pedagogicalObjective: "Experimentar RITARDANDO (desaceleración progresiva de la velocidad métrica).",
    rhythmicConcept: "Tempo ritardando (desaceleración rítmica)",
    soundMovementEquivalency: "Estilo encorvado de marcha cargando el bastón como si pesara mucho.",
    physicalMaterials: ["Bastones de madera"],
    instrumentProtagonist: "Metrónomo decreciente y percusión pesada",
    narratorLines: "La luz solar disminuye lentamente... el tempo se hace pesado. Camina con calma y pesadez.",
    facilitatorCue: "Sientan el peso en sus hombros, caminemos cada vez más despacio.",
    adaggioAnimationState: "heavy_march",
    suggestedPausas: [],
    observables: [
      { id: "ritardando_tracking", label: "Adaptación al Ritardando", description: "¿Los niños adaptan su velocidad de marcha al freno musical?" }
    ],
    hexColors: ["#FFD700", "#DAA520", "#FF4500"]
  },
  {
    id: 13,
    name: "BLOQUE 13 — FINAL I",
    title: "El ritmo rescatado",
    durationStart: 480,
    durationEnd: 520,
    stateType: 'CONCLUSIÓN',
    pedagogicalObjective: "Cerrar con síntesis armónica combinada.",
    rhythmicConcept: "Sincronía de grupo total",
    soundMovementEquivalency: "Soltar los bastones, mímica libre de tótems iluminados.",
    physicalMaterials: [],
    instrumentProtagonist: "Guitarra, metalófonos y percusiones en armonía",
    narratorLines: "¡El sol ha despertado del todo! Los tótems resplandecen. ¡El gran ritmo ha renacido!",
    facilitatorCue: "Soltemos los bastones con suavidad en el suelo y dancemos con los brazos libres.",
    adaggioAnimationState: "celebration_victory",
    suggestedPausas: [],
    observables: [
      { id: "climax_enthusiasm", label: "Danza Alegre", description: "¿Demuestran felicidad y disfrutan la fiesta musical?" }
    ],
    hexColors: ["#DAA520", "#32CD32", "#FF69B4"]
  },
  {
    id: 14,
    name: "BLOQUE 14 — FINAL II",
    title: "La celebración colectiva",
    durationStart: 520,
    durationEnd: 560,
    stateType: 'CONCLUSIÓN',
    pedagogicalObjective: "Compartir el logro grupal y abrazar el ritmo común.",
    rhythmicConcept: "Comunidad / Ritmo colectivo",
    soundMovementEquivalency: "Saltar, aplaudir y abrazar en ronda con los compañeros.",
    physicalMaterials: [],
    instrumentProtagonist: "Arpa, flauta y ritmos festivos luminosos",
    narratorLines: "¡Qué bella celebración! El ritmo vive y late fuerte dentro del corazón del teatrillo.",
    facilitatorCue: "Démonos un fuerte aplauso grupal rindiendo homenaje a nuestro gran esfuerzo.",
    adaggioAnimationState: "celebration_victory",
    suggestedPausas: [],
    observables: [
      { id: "social_empathy", label: "Abrazo Colectivo", description: "¿Aplauden y felicitan a sus compañeros por el logro?" }
    ],
    hexColors: ["#DAA520", "#32CD32", "#FF69B4"]
  },
  {
    id: 15,
    name: "BLOQUE 15 — FINAL III",
    title: "El latido de la paz",
    durationStart: 560,
    durationEnd: 600,
    stateType: 'CONCLUSIÓN',
    pedagogicalObjective: "Relajación final, vuelta a la calma.",
    rhythmicConcept: "Pulso cardiaco en reposo / respiración",
    soundMovementEquivalency: "Sentarse en semicírculo respirando hondo con Adaggio.",
    physicalMaterials: [],
    instrumentProtagonist: "Pad ambiental y arpa celestial lenta",
    narratorLines: "Recuerden guardianes: la mayor música rítmica es su sonrisa. ¡Gracias por esta gran danza de vida!",
    facilitatorCue: "Sentaos en el suelo respirando suavemente. Sientan su pulso calmado. Inhalar... Exhalar...",
    adaggioAnimationState: "bow",
    suggestedPausas: [],
    observables: [
      { id: "calm_regained", label: "Paz Recuperada", description: "¿Logran sintonizar un estado de relajación y respirar con Adaggio?" }
    ],
    hexColors: ["#FFD700", "#FF69B4", "#00FFFF"]
  }
];
