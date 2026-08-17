/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SimParameters } from '../types';
import { computeDerivatives } from '../utils/mathEngine';
import { Sprout, TrendingUp, TrendingDown, Skull, ArrowRight, CheckCircle2 } from 'lucide-react';

interface CycleExplainerProps {
  currentRabbits: number;
  currentFoxes: number;
  currentWolves: number;
  day: number;
  params: SimParameters;
  isLightMode?: boolean;
}

export const CycleExplainer: React.FC<CycleExplainerProps> = ({
  currentRabbits,
  currentFoxes,
  currentWolves,
  day,
  params,
  isLightMode = false,
}) => {
  const derivs = computeDerivatives(
    { rabbits: currentRabbits, foxes: currentFoxes, wolves: currentWolves },
    day,
    params
  );

  const dR = derivs.dR;
  const dF = derivs.dF;

  // Determine current active phase:
  // Phase 1: R growing (dR > 0), F falling or low (dF <= 0) => Prey Expansion
  // Phase 2: R still high/growing (dR >= 0 or slight dR < 0 but high R), F growing (dF > 0) => Predator Boom
  // Phase 3: R crashing (dR < 0), F still high (dF >= 0) => Prey Overhunted
  // Phase 4: R low, F starving (dF < 0, dR <= 0 or beginning to turn positive) => Predator Starvation
  let currentPhase = 1;
  if (dR >= 0 && dF <= 0) {
    currentPhase = 1;
  } else if (dR >= 0 && dF > 0) {
    currentPhase = 2;
  } else if (dR < 0 && dF >= 0) {
    currentPhase = 3;
  } else {
    currentPhase = 4;
  }

  const phases = [
    {
      step: 1,
      name: '1. Prey Population Boom',
      icon: '🌿',
      tag: 'dR > 0, dF ≤ 0',
      tagColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-700',
      title: 'Prey Expands Rapidly',
      desc: 'With few predators roaming the landscape, rabbits reproduce freely with abundant vegetation. Rabbit population surges upward exponentially.',
      activeColor: isLightMode
        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-emerald-100 ring-2 ring-emerald-400'
        : 'bg-emerald-950/80 border-emerald-400 text-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400',
    },
    {
      step: 2,
      name: '2. Predator Feeding Frenzy',
      icon: '🦊',
      tag: 'dR ≥ 0, dF > 0',
      tagColor: 'text-amber-400 bg-amber-950/60 border-amber-700',
      title: 'Predators Multiply',
      desc: 'Abundant prey makes hunting effortless. Well-fed foxes produce large litters, causing the predator population to skyrocket with a slight time lag.',
      activeColor: isLightMode
        ? 'bg-amber-50 border-amber-500 text-amber-950 shadow-amber-100 ring-2 ring-amber-400'
        : 'bg-amber-950/80 border-amber-400 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.3)] ring-1 ring-amber-400',
    },
    {
      step: 3,
      name: '3. Prey Population Crash',
      icon: '📉',
      tag: 'dR < 0, dF ≥ 0',
      tagColor: 'text-rose-400 bg-rose-950/60 border-rose-700',
      title: 'Overhunting Collapse',
      desc: 'Massive packs of foxes catch rabbits faster than they can reproduce (β·R·F exceeds α·R). Rabbit population plunges into a steep decline.',
      activeColor: isLightMode
        ? 'bg-rose-50 border-rose-500 text-rose-950 shadow-rose-100 ring-2 ring-rose-400'
        : 'bg-rose-950/80 border-rose-400 text-rose-100 shadow-[0_0_12px_rgba(239,68,68,0.3)] ring-1 ring-rose-400',
    },
    {
      step: 4,
      name: '4. Predator Starvation',
      icon: '⏳',
      tag: 'dR ≤ 0, dF < 0',
      tagColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-700',
      title: 'Predator Die-Off & Reset',
      desc: 'With rabbits scarce, foxes starve and cannot sustain their numbers (mortality γ·F dominates). As foxes die out, hunting pressure eases, resetting to Phase 1.',
      activeColor: isLightMode
        ? 'bg-cyan-50 border-cyan-500 text-cyan-950 shadow-cyan-100 ring-2 ring-cyan-400'
        : 'bg-cyan-950/80 border-cyan-400 text-cyan-100 shadow-[0_0_12px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400',
    },
  ];

  return (
    <div className="flex flex-col gap-2 font-mono select-none text-xs">
      {/* Live Active Phase Banner */}
      <div
        className={`p-2 rounded border flex items-center justify-between transition-colors ${
          isLightMode
            ? 'bg-slate-100 border-slate-300 text-slate-800'
            : 'bg-zinc-900/80 border-zinc-800 text-zinc-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{phases[currentPhase - 1].icon}</span>
          <div>
            <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">CURRENT STATE: </span>
            <span className="font-bold text-emerald-400">{phases[currentPhase - 1].name}</span>
          </div>
        </div>
        <div className="text-right text-[11px] space-x-2 font-mono">
          <span className={dR >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
            dR/dt: {dR >= 0 ? '+' : ''}{dR.toFixed(1)}/d
          </span>
          <span className={dF >= 0 ? 'text-orange-400 font-bold' : 'text-cyan-400 font-bold'}>
            dF/dt: {dF >= 0 ? '+' : ''}{dF.toFixed(1)}/d
          </span>
        </div>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {phases.map((p) => {
          const isActive = p.step === currentPhase;
          return (
            <div
              key={p.step}
              className={`p-2.5 rounded-md border transition-all duration-300 flex flex-col justify-between ${
                isActive
                  ? p.activeColor
                  : isLightMode
                  ? 'bg-white border-slate-200 text-slate-600 opacity-80'
                  : 'bg-zinc-950/80 border-zinc-900 text-zinc-400 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span>{p.icon}</span>
                    <span>{p.name}</span>
                  </div>
                  {isActive && (
                    <span className="flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500 text-white animate-pulse">
                      <CheckCircle2 className="w-3 h-3" /> ACTIVE
                    </span>
                  )}
                </div>
                <div className="text-[11px] leading-relaxed mb-2">{p.desc}</div>
              </div>

              <div className="pt-1.5 border-t border-zinc-700/30 flex items-center justify-between text-[10px] font-mono">
                <span className={`px-1 py-0.2 rounded border font-semibold ${p.tagColor}`}>{p.tag}</span>
                <span className="text-zinc-500">Phase {p.step} of 4</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
