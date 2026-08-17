/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChallengePreset } from '../types';

export const GAME_CHALLENGES: ChallengePreset[] = [
  {
    id: 'challenge_stability',
    title: 'Equilibrium Warden',
    category: 'Stability Management',
    difficulty: 'Easy',
    description: 'Stabilize the ecosystem! Maintain rabbit and fox populations within safe ecological corridors without letting either crash or explode.',
    objective: 'Keep Rabbits [25 - 180] and Foxes [10 - 70] for 90 days.',
    targetDays: 90,
    initialState: {
      rabbits: 90,
      foxes: 25,
      wolves: 0,
      params: {
        alpha: 0.85,
        beta: 0.020,
        gamma: 0.40,
        delta: 0.010,
        useLogistic: true,
        carryCapacityK: 250,
        useSeasonality: false,
        useWolves: false
      }
    },
    limits: {
      minR: 25,
      maxR: 180,
      minF: 10,
      maxF: 70
    },
    allowedEvents: ['disease', 'carrots', 'cull_rabbits', 'hunt_foxes']
  },
  {
    id: 'challenge_biodiversity',
    title: 'Apex Harmony (Tri-Trophic)',
    category: 'Biodiversity Balance',
    difficulty: 'Medium',
    description: 'Introduce apex wolves into the habitat. Manage predation pressure so that Rabbits, Foxes, and Wolves co-exist without any species dying out.',
    objective: 'Keep Rabbits (≥15), Foxes (≥8), and Wolves (≥5) alive for 120 days.',
    targetDays: 120,
    initialState: {
      rabbits: 130,
      foxes: 26,
      wolves: 8,
      params: {
        alpha: 0.95,
        beta: 0.015,
        gamma: 0.35,
        delta: 0.008,
        useLogistic: true,
        carryCapacityK: 300,
        useSeasonality: false,
        useWolves: true,
        wolfBeta: 0.012,
        wolfGamma: 0.26,
        wolfDelta: 0.005,
        wolfFoxCompetitionMu: 0.003
      }
    },
    limits: {
      minR: 15,
      minF: 8,
      minW: 5
    },
    allowedEvents: ['carrots', 'add_rabbits', 'add_foxes', 'add_wolves', 'hunt_wolves', 'hunt_foxes']
  },
  {
    id: 'challenge_winter',
    title: 'Boreal Winter Frost',
    category: 'Environmental Resilience',
    difficulty: 'Hard',
    description: 'Severe seasonal swings! Winter brings extreme food shortages (alpha drops to 0.15). Keep both prey and predators alive through the freeze.',
    objective: 'Survive 100 days through multiple winter freezes (Rabbits ≥ 8, Foxes ≥ 5).',
    targetDays: 100,
    initialState: {
      rabbits: 100,
      foxes: 24,
      wolves: 0,
      params: {
        alpha: 0.80,
        beta: 0.018,
        gamma: 0.38,
        delta: 0.009,
        useLogistic: true,
        carryCapacityK: 240,
        useSeasonality: true,
        seasonalityA: 0.60,
        seasonalityPeriod: 45,
        useWolves: false
      }
    },
    limits: {
      minR: 8,
      minF: 5
    },
    allowedEvents: ['winter_shock', 'carrots', 'cull_rabbits', 'hunt_foxes']
  },
  {
    id: 'challenge_plague',
    title: 'Myxomatosis Outbreak',
    category: 'Epidemiology Control',
    difficulty: 'Medium',
    description: 'Virulent pathogen strikes the prey population every 30 days! Counteract sudden population drops to prevent secondary predator starvation.',
    objective: 'Preserve ecosystem survival through recurrent plagues for 80 days.',
    targetDays: 80,
    initialState: {
      rabbits: 120,
      foxes: 28,
      wolves: 0,
      params: {
        alpha: 0.90,
        beta: 0.019,
        gamma: 0.38,
        delta: 0.010,
        useLogistic: true,
        carryCapacityK: 280,
        useSeasonality: false,
        useWolves: false
      }
    },
    limits: {
      minR: 12,
      minF: 6
    },
    allowedEvents: ['disease', 'carrots', 'add_rabbits', 'hunt_foxes']
  }
];
