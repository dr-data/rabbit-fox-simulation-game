/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PresetModel } from '../types';

export const PRESET_MODELS: PresetModel[] = [
  {
    id: 'classic_oscillations',
    name: '1. Classic Lotka-Volterra',
    tagline: 'Undamped Neutral Limit Cycles',
    description: 'Pure, timeless mathematical predator-prey oscillations. Closed-loop orbits with constant ecological conserved quantity (V(R,F) = delta*R - gamma*ln(R) + beta*F - alpha*ln(F)).',
    initial: {
      rabbits: 80,
      foxes: 25,
      wolves: 0
    },
    params: {
      alpha: 0.80,
      beta: 0.020,
      gamma: 0.40,
      delta: 0.010,
      useLogistic: false,
      carryCapacityK: 300,
      useSeasonality: false,
      seasonalityA: 0.00,
      seasonalityPeriod: 60,
      harvestR: 0.00,
      harvestF: 0.00,
      harvestW: 0.00,
      useWolves: false,
      wolfBeta: 0.015,
      wolfGamma: 0.30,
      wolfDelta: 0.006,
      wolfFoxCompetitionMu: 0.004,
      stochasticNoise: 0.00
    }
  },
  {
    id: 'stable_logistic',
    name: '2. Logistic Carrying Capacity (K)',
    tagline: 'Stable Spiral Attractor Equilibrium',
    description: 'Prey growth is bounded by finite vegetation / territory K = 240. Instead of continuous cycles, the system spirals inwards to a resilient, self-stabilizing steady state.',
    initial: {
      rabbits: 110,
      foxes: 15,
      wolves: 0
    },
    params: {
      alpha: 0.90,
      beta: 0.018,
      gamma: 0.36,
      delta: 0.008,
      useLogistic: true,
      carryCapacityK: 240,
      useSeasonality: false,
      seasonalityA: 0.00,
      seasonalityPeriod: 60,
      harvestR: 0.00,
      harvestF: 0.00,
      harvestW: 0.00,
      useWolves: false,
      wolfBeta: 0.015,
      wolfGamma: 0.30,
      wolfDelta: 0.006,
      wolfFoxCompetitionMu: 0.004,
      stochasticNoise: 0.00
    }
  },
  {
    id: 'multi_predator_competition',
    name: '3. Dual Predator Competition (Foxes + Wolves)',
    tagline: 'Tri-Trophic Food Web Dynamics',
    description: 'Wolves and foxes compete for rabbits while wolves exert interference competition (mu*F*W) on foxes. Watch how apex predator balance unfolds.',
    initial: {
      rabbits: 140,
      foxes: 30,
      wolves: 12
    },
    params: {
      alpha: 0.95,
      beta: 0.014,
      gamma: 0.38,
      delta: 0.007,
      useLogistic: true,
      carryCapacityK: 350,
      useSeasonality: false,
      seasonalityA: 0.00,
      seasonalityPeriod: 60,
      harvestR: 0.00,
      harvestF: 0.00,
      harvestW: 0.00,
      useWolves: true,
      wolfBeta: 0.012,
      wolfGamma: 0.28,
      wolfDelta: 0.005,
      wolfFoxCompetitionMu: 0.003,
      stochasticNoise: 0.02
    }
  },
  {
    id: 'seasonal_chaos',
    name: '4. Seasonal Environmental Forcing',
    tagline: 'Spring Booms & Harsh Winter Crashes',
    description: 'Rabbit birth rate alpha(t) fluctuates with yearly seasons (A = 0.45, Period = 75 days). Creates quasi-periodic and complex multi-frequency cycles.',
    initial: {
      rabbits: 90,
      foxes: 22,
      wolves: 0
    },
    params: {
      alpha: 0.75,
      beta: 0.018,
      gamma: 0.36,
      delta: 0.009,
      useLogistic: true,
      carryCapacityK: 280,
      useSeasonality: true,
      seasonalityA: 0.45,
      seasonalityPeriod: 75,
      harvestR: 0.00,
      harvestF: 0.00,
      harvestW: 0.00,
      useWolves: false,
      wolfBeta: 0.015,
      wolfGamma: 0.30,
      wolfDelta: 0.006,
      wolfFoxCompetitionMu: 0.004,
      stochasticNoise: 0.03
    }
  },
  {
    id: 'hudson_bay_hare_lynx',
    name: '5. Hudson Bay Company Historical Model',
    tagline: '10-Year Boreal Forest Cycles',
    description: 'Calibrated to the famous historical Canadian Lynx and Snowshoe Hare pelt data recorded between 1845 and 1935. Shows sharp rabbit peaks followed by lagged predator surges.',
    initial: {
      rabbits: 60,
      foxes: 18,
      wolves: 0
    },
    params: {
      alpha: 1.05,
      beta: 0.022,
      gamma: 0.50,
      delta: 0.012,
      useLogistic: false,
      carryCapacityK: 300,
      useSeasonality: false,
      seasonalityA: 0.00,
      seasonalityPeriod: 60,
      harvestR: 0.00,
      harvestF: 0.00,
      harvestW: 0.00,
      useWolves: false,
      wolfBeta: 0.015,
      wolfGamma: 0.30,
      wolfDelta: 0.006,
      wolfFoxCompetitionMu: 0.004,
      stochasticNoise: 0.04
    }
  }
];
