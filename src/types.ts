/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Species = 'rabbit' | 'fox' | 'wolf';

export interface SimParameters {
  // Classic Lotka-Volterra params
  alpha: number;        // Rabbit natural birth/growth rate (e.g. 0.70)
  beta: number;         // Rabbit predation rate by foxes (e.g. 0.015)
  gamma: number;        // Fox natural death rate (e.g. 0.35)
  delta: number;        // Fox reproduction efficiency (e.g. 0.008)

  // Extensions
  useLogistic: boolean;
  carryCapacityK: number; // Rabbit carrying capacity K (e.g. 250)

  useSeasonality: boolean;
  seasonalityA: number;   // Amplitude A (0.0 to 0.8)
  seasonalityPeriod: number; // Period in days (e.g. 80)

  harvestR: number;       // Rabbit harvesting/culling rate
  harvestF: number;       // Fox hunting rate
  harvestW: number;       // Wolf hunting rate

  useWolves: boolean;
  wolfBeta: number;       // Wolf predation on rabbits
  wolfGamma: number;      // Wolf natural death rate
  wolfDelta: number;      // Wolf reproduction efficiency
  wolfFoxCompetitionMu: number; // Interspecific competition between wolves & foxes

  stochasticNoise: number; // Stochastic shock amplitude (0.0 to 0.4)
}

export interface GridAgent {
  id: string;
  type: Species;
  x: number;
  y: number;
  energy: number;
  age: number;
  state: 'idle' | 'hunting' | 'fleeing' | 'eating' | 'mating';
  birthTick: number;
}

export type ParticleType = 'splatter' | 'birth' | 'snow' | 'disease' | 'fire' | 'spawn_ring' | 'carrots';

export interface Particle {
  id: string;
  x: number;
  y: number;
  char: string;
  color: string;
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
  type: ParticleType;
}

export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export type EventMarkerType = 
  | 'disease' 
  | 'disease_relieved' 
  | 'winter_shock' 
  | 'carrots' 
  | 'add_foxes' 
  | 'add_wolves' 
  | 'cull_rabbits' 
  | 'hunt_foxes' 
  | 'hunt_predators'
  | 'apex_predator'
  | 'predator_trap'
  | 'bio_vaccine'
  | 'custom_tool'
  | 'relief'
  | 'random_shock';

export interface TimelineEventMarker {
  id: string;
  type: EventMarkerType;
  label: string;
  icon: string;
  color: string;
  day: number;
  t: number;
  description: string;
  isRelief?: boolean;
}

export interface HistoryPoint {
  t: number;
  day: number;
  rabbits: number;
  foxes: number;
  wolves: number;
  alphaT: number;
  season: Season;
  eventMarker?: string;
  eventDetails?: TimelineEventMarker;
}

export interface SimEvent {
  id: string;
  day: number;
  timeStr: string;
  message: string;
  type: 'info' | 'birth' | 'predation' | 'alert' | 'danger' | 'success' | 'event';
}

export type GameMode = 'sandbox' | 'challenge';

export interface ChallengePreset {
  id: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  objective: string;
  targetDays: number;
  initialState: {
    rabbits: number;
    foxes: number;
    wolves: number;
    params: Partial<SimParameters>;
  };
  limits: {
    minR?: number;
    maxR?: number;
    minF?: number;
    maxF?: number;
    minW?: number;
    maxW?: number;
  };
  allowedEvents: string[];
}

export interface PresetModel {
  id: string;
  name: string;
  tagline: string;
  description: string;
  initial: {
    rabbits: number;
    foxes: number;
    wolves: number;
  };
  params: SimParameters;
}

export type ColorTheme = 
  | 'phosphor-green' 
  | 'amber-crt' 
  | 'cyber-neon' 
  | 'arctic-ice' 
  | 'matrix-dark' 
  | 'light-lab' 
  | 'light-paper';

export type PlotViewMode = 'visual_chart' | 'phase_portrait' | 'cycle_explainer' | 'timeseries' | 'math_inspector';

export type GridRenderMode = 'graphic' | 'ascii';

export type ParticleDensity = 'high' | 'medium' | 'low';

export type ToolActionType =
  | 'spawn_agent'
  | 'feed_prey'
  | 'hunt_predators'
  | 'apex_predator'
  | 'predator_trap'
  | 'bio_vaccine'
  | 'custom_cull'
  | 'custom_boost';

export interface EcosystemTool {
  id: string;
  name: string;
  emoji: string;
  category: 'spawn' | 'predator_control' | 'prey_support' | 'environment';
  description: string;
  actionType: ToolActionType;
  targetSpecies: 'predators' | 'foxes' | 'wolves' | 'rabbits' | 'all' | 'disease';
  potency: number;
  radius?: number;
  color: string;
  enabled: boolean;
  isBuiltin?: boolean;
}

export interface UISettings {
  defaultTheme: ColorTheme;
  defaultViewMode: PlotViewMode;
  defaultGridRenderMode: GridRenderMode;
  defaultTimeSpeed: number;
  crtEnabled: boolean;
  soundEnabled: boolean;
  showFpsCounter: boolean;
  particleDensity: ParticleDensity;
  autoSaveOnChange: boolean;
  tools: EcosystemTool[];
  defaultSelectedToolId?: string;
}
