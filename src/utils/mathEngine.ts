/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GridAgent, Particle, Season, SimParameters, Species } from '../types';

export interface ODEState {
  rabbits: number;
  foxes: number;
  wolves: number;
}

export interface Derivatives {
  dR: number;
  dF: number;
  dW: number;
  alphaEffective: number;
}

/**
 * Calculates current season and time-dependent rabbit birth rate alpha(t)
 */
export function calculateSeasonality(
  t: number,
  baseAlpha: number,
  useSeasonality: boolean,
  amplitude: number,
  period: number
): { alphaT: number; season: Season; progress: number } {
  if (!useSeasonality || amplitude <= 0) {
    return { alphaT: baseAlpha, season: 'Spring', progress: 0 };
  }

  // Normalized phase [0, 1)
  const normalizedPhase = ((t % period) + period) % period / period;
  
  // Seasonal oscillation: alpha(t) = alpha0 * (1 + A * sin(2*pi*t/T))
  const wave = Math.sin(2 * Math.PI * normalizedPhase);
  const alphaT = Math.max(0.01, baseAlpha * (1 + amplitude * wave));

  let season: Season = 'Spring';
  if (normalizedPhase >= 0.25 && normalizedPhase < 0.5) {
    season = 'Summer';
  } else if (normalizedPhase >= 0.5 && normalizedPhase < 0.75) {
    season = 'Autumn';
  } else if (normalizedPhase >= 0.75 || normalizedPhase < 0.25) {
    // Winter is when wave is at minimum (e.g. around 0.75 phase)
    if (normalizedPhase >= 0.75) season = 'Winter';
  }

  return { alphaT, season, progress: normalizedPhase };
}

/**
 * Evaluates differential equations at state (R, F, W) at time t
 */
export function computeDerivatives(
  state: ODEState,
  t: number,
  params: SimParameters
): Derivatives {
  const { rabbits: R, foxes: F, wolves: W } = state;

  if (R <= 0 && F <= 0 && W <= 0) {
    return { dR: 0, dF: 0, dW: 0, alphaEffective: 0 };
  }

  const { alphaT } = calculateSeasonality(
    t,
    params.alpha,
    params.useSeasonality,
    params.seasonalityA,
    params.seasonalityPeriod
  );

  // 1. Prey (Rabbit) rate of change:
  // dR/dt = alpha(t) * R * (1 - R/K) - beta_F * R * F - beta_W * R * W - h_R * R
  let rabbitGrowth = alphaT * R;
  if (params.useLogistic && params.carryCapacityK > 0) {
    rabbitGrowth = alphaT * R * (1 - R / params.carryCapacityK);
  }

  const rabbitPredationFox = params.beta * R * F;
  const rabbitPredationWolf = params.useWolves ? params.wolfBeta * R * W : 0;
  const rabbitHarvest = params.harvestR * R;

  const dR = rabbitGrowth - rabbitPredationFox - rabbitPredationWolf - rabbitHarvest;

  // 2. Predator 1 (Fox) rate of change:
  // dF/dt = delta_F * R * F - gamma_F * F - h_F * F - (competition with wolves if wolves present)
  const foxReproduction = params.delta * R * F;
  const foxNaturalDeath = params.gamma * F;
  const foxHarvest = params.harvestF * F;
  const foxWolfCompetition = params.useWolves ? params.wolfFoxCompetitionMu * F * W : 0;

  const dF = foxReproduction - foxNaturalDeath - foxHarvest - foxWolfCompetition;

  // 3. Predator 2 (Wolf) rate of change:
  // dW/dt = delta_W * R * W - gamma_W * W - h_W * W - mu * F * W
  let dW = 0;
  if (params.useWolves && W > 0) {
    const wolfReproduction = params.wolfDelta * R * W;
    const wolfNaturalDeath = params.wolfGamma * W;
    const wolfHarvest = params.harvestW * W;
    dW = wolfReproduction - wolfNaturalDeath - wolfHarvest - foxWolfCompetition;
  }

  return {
    dR,
    dF,
    dW,
    alphaEffective: alphaT
  };
}

/**
 * 4th-Order Runge-Kutta (RK4) numerical integrator for high precision and stability
 */
export function rk4Step(
  state: ODEState,
  t: number,
  dt: number,
  params: SimParameters
): ODEState {
  // Guard zero bounds
  const r0 = Math.max(0, state.rabbits);
  const f0 = Math.max(0, state.foxes);
  const w0 = params.useWolves ? Math.max(0, state.wolves) : 0;

  if (r0 <= 0.001 && f0 <= 0.001 && w0 <= 0.001) {
    return { rabbits: 0, foxes: 0, wolves: 0 };
  }

  // k1
  const k1 = computeDerivatives({ rabbits: r0, foxes: f0, wolves: w0 }, t, params);

  // k2
  const s2: ODEState = {
    rabbits: Math.max(0, r0 + 0.5 * dt * k1.dR),
    foxes: Math.max(0, f0 + 0.5 * dt * k1.dF),
    wolves: params.useWolves ? Math.max(0, w0 + 0.5 * dt * k1.dW) : 0,
  };
  const k2 = computeDerivatives(s2, t + 0.5 * dt, params);

  // k3
  const s3: ODEState = {
    rabbits: Math.max(0, r0 + 0.5 * dt * k2.dR),
    foxes: Math.max(0, f0 + 0.5 * dt * k2.dF),
    wolves: params.useWolves ? Math.max(0, w0 + 0.5 * dt * k2.dW) : 0,
  };
  const k3 = computeDerivatives(s3, t + 0.5 * dt, params);

  // k4
  const s4: ODEState = {
    rabbits: Math.max(0, r0 + dt * k3.dR),
    foxes: Math.max(0, f0 + dt * k3.dF),
    wolves: params.useWolves ? Math.max(0, w0 + dt * k3.dW) : 0,
  };
  const k4 = computeDerivatives(s4, t + dt, params);

  // Combine weighted slopes
  let nextR = r0 + (dt / 6) * (k1.dR + 2 * k2.dR + 2 * k3.dR + k4.dR);
  let nextF = f0 + (dt / 6) * (k1.dF + 2 * k2.dF + 2 * k3.dF + k4.dF);
  let nextW = w0 + (dt / 6) * (k1.dW + 2 * k2.dW + 2 * k3.dW + k4.dW);

  // Apply stochastic environmental noise if enabled
  if (params.stochasticNoise > 0) {
    const shockR = (Math.random() - 0.5) * 2 * params.stochasticNoise * Math.sqrt(Math.max(1, nextR)) * dt;
    const shockF = (Math.random() - 0.5) * 2 * params.stochasticNoise * Math.sqrt(Math.max(1, nextF)) * dt;
    nextR = Math.max(0, nextR + shockR);
    nextF = Math.max(0, nextF + shockF);
    if (params.useWolves) {
      const shockW = (Math.random() - 0.5) * 2 * params.stochasticNoise * Math.sqrt(Math.max(1, nextW)) * dt;
      nextW = Math.max(0, nextW + shockW);
    }
  }

  // Extinction threshold: if below 0.3 individuals, drop to 0
  if (nextR < 0.25) nextR = 0;
  if (nextF < 0.25) nextF = 0;
  if (nextW < 0.25) nextW = 0;

  return {
    rabbits: nextR,
    foxes: nextF,
    wolves: params.useWolves ? nextW : 0
  };
}

/**
 * Analytical Equilibrium Analysis for Rabbit-Fox system
 */
export function calculateEquilibrium(params: SimParameters): {
  rabbitEq: number;
  foxEq: number;
  stabilityType: string;
  description: string;
} {
  if (params.delta <= 0 || params.beta <= 0) {
    return { rabbitEq: 0, foxEq: 0, stabilityType: 'Undefined', description: 'Invalid predation rates' };
  }

  // Fox Isocline: dF/dt = 0 => R* = (gamma + harvestF) / delta
  const rabbitEq = (params.gamma + params.harvestF) / params.delta;

  // Rabbit Isocline: dR/dt = 0
  let foxEq = 0;
  if (params.useLogistic && params.carryCapacityK > 0) {
    // F* = (alpha * (1 - R*/K) - harvestR) / beta
    if (rabbitEq < params.carryCapacityK) {
      foxEq = (params.alpha * (1 - rabbitEq / params.carryCapacityK) - params.harvestR) / params.beta;
    } else {
      foxEq = 0; // Prey carrying capacity too low to sustain predators
    }
  } else {
    // Classic: F* = (alpha - harvestR) / beta
    foxEq = (params.alpha - params.harvestR) / params.beta;
  }

  foxEq = Math.max(0, foxEq);

  // Stability classification
  let stabilityType = 'Center (Neutral Orbit)';
  let description = 'Continuous, closed-loop periodic oscillations (constant energy).';

  if (params.useLogistic) {
    if (rabbitEq >= params.carryCapacityK) {
      stabilityType = 'Predator Extinction Point';
      description = 'Carrying capacity K is too small to support a viable predator population.';
    } else {
      stabilityType = 'Stable Focus (Attractor)';
      description = 'Populations spiral inward toward a steady, resilient equilibrium point.';
    }
  }

  return {
    rabbitEq: Math.round(rabbitEq * 10) / 10,
    foxEq: Math.round(foxEq * 10) / 10,
    stabilityType,
    description
  };
}

/**
 * Spatial Grid Agent Sync and Simulation
 */
export function updateSpatialGrid(
  agents: GridAgent[],
  targetCounts: { rabbits: number; foxes: number; wolves: number },
  width: number,
  height: number,
  onEvent?: (type: 'birth' | 'predation' | 'wolf', x: number, y: number) => void
): { nextAgents: GridAgent[]; newParticles: Particle[] } {
  const newParticles: Particle[] = [];
  const nextAgents: GridAgent[] = [];

  // Group current agents by type
  const rabbits = agents.filter(a => a.type === 'rabbit');
  const foxes = agents.filter(a => a.type === 'fox');
  const wolves = agents.filter(a => a.type === 'wolf');

  // Scale target count to fit grid capacity (max ~150 visible agents on a 42x20 grid)
  const maxGridCapacity = width * height * 0.35;
  const totalTarget = targetCounts.rabbits + targetCounts.foxes + targetCounts.wolves;
  const scale = totalTarget > maxGridCapacity ? maxGridCapacity / totalTarget : 1;

  const targetR = Math.min(Math.round(targetCounts.rabbits * scale), width * height);
  const targetF = Math.min(Math.round(targetCounts.foxes * scale), width * height);
  const targetW = Math.min(Math.round(targetCounts.wolves * scale), width * height);

  // Helper for random coords
  const randomCoord = () => ({
    x: Math.floor(Math.random() * width),
    y: Math.floor(Math.random() * height)
  });

  // Adjust rabbits
  const currentRabbits = [...rabbits];
  if (currentRabbits.length < targetR) {
    const diff = targetR - currentRabbits.length;
    for (let i = 0; i < Math.min(diff, 6); i++) {
      const pos = randomCoord();
      currentRabbits.push({
        id: `r-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type: 'rabbit',
        x: pos.x,
        y: pos.y,
        energy: 100,
        age: 0,
        state: 'idle',
        birthTick: Date.now()
      });
      // Birth effect
      newParticles.push({
        id: `p-${Date.now()}-${Math.random()}`,
        x: pos.x,
        y: pos.y,
        char: '+',
        color: '#4ade80',
        life: 5,
        maxLife: 5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2,
        type: 'birth'
      });
      if (onEvent) onEvent('birth', pos.x, pos.y);
    }
  } else if (currentRabbits.length > targetR) {
    const diff = currentRabbits.length - targetR;
    currentRabbits.splice(0, Math.min(diff, 6));
  }

  // Adjust foxes
  const currentFoxes = [...foxes];
  if (currentFoxes.length < targetF) {
    const diff = targetF - currentFoxes.length;
    for (let i = 0; i < Math.min(diff, 4); i++) {
      const pos = randomCoord();
      currentFoxes.push({
        id: `f-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type: 'fox',
        x: pos.x,
        y: pos.y,
        energy: 120,
        age: 0,
        state: 'hunting',
        birthTick: Date.now()
      });
      newParticles.push({
        id: `p-${Date.now()}-${Math.random()}`,
        x: pos.x,
        y: pos.y,
        char: '✦',
        color: '#fb923c',
        life: 6,
        maxLife: 6,
        vx: 0,
        vy: -0.2,
        type: 'birth'
      });
    }
  } else if (currentFoxes.length > targetF) {
    const diff = currentFoxes.length - targetF;
    currentFoxes.splice(0, Math.min(diff, 4));
  }

  // Adjust wolves
  const currentWolves = [...wolves];
  if (currentWolves.length < targetW) {
    const diff = targetW - currentWolves.length;
    for (let i = 0; i < Math.min(diff, 3); i++) {
      const pos = randomCoord();
      currentWolves.push({
        id: `w-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type: 'wolf',
        x: pos.x,
        y: pos.y,
        energy: 150,
        age: 0,
        state: 'hunting',
        birthTick: Date.now()
      });
      newParticles.push({
        id: `p-${Date.now()}-${Math.random()}`,
        x: pos.x,
        y: pos.y,
        char: '▲',
        color: '#f87171',
        life: 8,
        maxLife: 8,
        vx: 0,
        vy: -0.2,
        type: 'spawn_ring'
      });
      if (onEvent) onEvent('wolf', pos.x, pos.y);
    }
  } else if (currentWolves.length > targetW) {
    const diff = currentWolves.length - targetW;
    currentWolves.splice(0, Math.min(diff, 3));
  }

  // Step 2: Agent movement and interactions
  const allAgents = [...currentRabbits, ...currentFoxes, ...currentWolves];
  const occupied = new Set<string>();

  for (const agent of allAgents) {
    let dx = (Math.random() > 0.5 ? 1 : -1) * (Math.random() > 0.4 ? 1 : 0);
    let dy = (Math.random() > 0.5 ? 1 : -1) * (Math.random() > 0.4 ? 1 : 0);

    // If fox, step towards closest rabbit
    if (agent.type === 'fox' && currentRabbits.length > 0) {
      let closestR: GridAgent | null = null;
      let minDst = 999;
      for (const r of currentRabbits) {
        const d = Math.abs(r.x - agent.x) + Math.abs(r.y - agent.y);
        if (d < minDst) {
          minDst = d;
          closestR = r;
        }
      }
      if (closestR && minDst <= 5) {
        dx = Math.sign(closestR.x - agent.x);
        dy = Math.sign(closestR.y - agent.y);

        // Predation strike if on adjacent cell
        if (minDst <= 1) {
          newParticles.push({
            id: `splatter-${Date.now()}-${Math.random()}`,
            x: closestR.x,
            y: closestR.y,
            char: Math.random() > 0.5 ? 'x' : '💥',
            color: '#ef4444',
            life: 6,
            maxLife: 6,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            type: 'splatter'
          });
          if (onEvent) onEvent('predation', closestR.x, closestR.y);
        }
      }
    }

    // If rabbit, flee from close fox or wolf
    if (agent.type === 'rabbit') {
      const predators = [...currentFoxes, ...currentWolves];
      for (const p of predators) {
        const d = Math.abs(p.x - agent.x) + Math.abs(p.y - agent.y);
        if (d <= 3) {
          dx = -Math.sign(p.x - agent.x);
          dy = -Math.sign(p.y - agent.y);
          break;
        }
      }
    }

    // Keep in bounds
    let newX = Math.max(0, Math.min(width - 1, agent.x + dx));
    let newY = Math.max(0, Math.min(height - 1, agent.y + dy));

    const key = `${newX},${newY}`;
    if (occupied.has(key)) {
      // Cell already full, stay in place or jitter
      newX = agent.x;
      newY = agent.y;
    }
    occupied.add(`${newX},${newY}`);

    nextAgents.push({
      ...agent,
      x: newX,
      y: newY,
      age: agent.age + 1
    });
  }

  return { nextAgents, newParticles };
}
