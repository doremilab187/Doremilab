/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NarrativeBlock {
  id: number;
  name: string;
  title: string;
  durationStart: number; // in seconds
  durationEnd: number; // in seconds
  stateType: 'NARRATIVO' | 'DESCANSO' | 'ACCIÓN' | 'CONCLUSIÓN' | 'ACCIÓN_DIRECCIÓN'; // state type
  pedagogicalObjective: string;
  rhythmicConcept: string;
  soundMovementEquivalency: string;
  physicalMaterials: string[];
  instrumentProtagonist: string;
  narratorLines: string;
  facilitatorCue: string;
  adaggioAnimationState: 'saludando' | 'hablando' | 'marchando' | 'celebrando' | 'quiet' | 'listening' | 'scared' | 'march_sowing' | 'fluid_raise_drop' | 'expanding_arms' | 'shaking_electric' | 'sigilo_puntitas' | 'congelado_estatua' | 'proud_march' | 'accented_jump' | 'heavy_march' | 'celebration_victory' | 'calm_breathing' | 'bow';
  suggestedPausas: {
    time: number; // seconds from block start
    label: string;
    text: string;
  }[];
  observables: {
    id: string;
    label: string;
    description: string;
  }[];
  hexColors: string[];
}

export interface SessionEvaluation {
  blockId: number;
  rhythmSinc: number; // 1-3 rating
  engagement: number; // 1-3 rating
  understanding: number; // 1-3 rating
  notes: string;
}

export interface SavedSession {
  id: string;
  date: string;
  groupName: string;
  childCount: number;
  tutorName: string;
  evaluations: SessionEvaluation[];
  completed: boolean;
  generalNotes: string;
}
