/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HistoryPoint, PlotViewMode, SimParameters } from '../types';
import { renderAsciiTimeSeries } from '../utils/asciiRenderer';
import { calculateEquilibrium, computeDerivatives } from '../utils/mathEngine';
import { SoundEngine } from '../utils/soundSynthesizer';
import { VisualChart } from './VisualChart';
import { PhaseVectorField } from './PhaseVectorField';
import { CycleExplainer } from './CycleExplainer';
import { AreaChart, Compass, Binary, Terminal, BookOpen, Layers } from 'lucide-react';

interface AsciiPlotPanelProps {
  history: HistoryPoint[];
  currentRabbits: number;
  currentFoxes: number;
  currentWolves: number;
  day: number;
  params: SimParameters;
  viewMode: PlotViewMode;
  isLightMode?: boolean;
  onSetViewMode: (mode: PlotViewMode) => void;
}

export const AsciiPlotPanel: React.FC<AsciiPlotPanelProps> = ({
  history,
  currentRabbits,
  currentFoxes,
  currentWolves,
  day,
  params,
  viewMode,
  isLightMode = false,
  onSetViewMode,
}) => {
  // Analytical equilibrium
  const eq = calculateEquilibrium(params);

  // Current live derivatives
  const derivs = computeDerivatives(
    { rabbits: currentRabbits, foxes: currentFoxes, wolves: currentWolves },
    day,
    params
  );

  return (
    <div
      className={`rounded-md p-2.5 flex flex-col font-mono text-xs select-none transition-colors border shadow-lg ${
        isLightMode
          ? 'bg-white border-slate-300 shadow-slate-200 text-slate-800'
          : 'bg-zinc-950 border-emerald-900/60 shadow-black/60 text-zinc-200'
      }`}
    >
      {/* Header and View Selector Tabs */}
      <div
        className={`flex flex-wrap items-center justify-between border-b pb-1.5 mb-2 gap-2 ${
          isLightMode ? 'border-slate-200' : 'border-emerald-900/40'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-emerald-500 font-bold tracking-wider">
            ┌─ DYNAMICS & VISUALIZERS
          </span>
          <span className="text-zinc-600 hidden sm:inline">───────────┐</span>
        </div>

        {/* View Tabs */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => {
              SoundEngine.playClick();
              onSetViewMode('visual_chart');
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition flex items-center gap-1 cursor-pointer border ${
              viewMode === 'visual_chart'
                ? isLightMode
                  ? 'bg-emerald-600 text-white font-bold border-emerald-700'
                  : 'bg-emerald-900/80 border-emerald-400 text-emerald-300 font-bold'
                : isLightMode
                ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Interactive High-Resolution Vector Chart [1]"
          >
            <AreaChart className="w-3 h-3" />
            <span>[1] Visual Chart</span>
          </button>

          <button
            onClick={() => {
              SoundEngine.playClick();
              onSetViewMode('phase_portrait');
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition flex items-center gap-1 cursor-pointer border ${
              viewMode === 'phase_portrait'
                ? isLightMode
                  ? 'bg-emerald-600 text-white font-bold border-emerald-700'
                  : 'bg-emerald-900/80 border-emerald-400 text-emerald-300 font-bold'
                : isLightMode
                ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="2D Vector Field & Phase Space Orbit [2]"
          >
            <Compass className="w-3 h-3" />
            <span>[2] Vector Field</span>
          </button>

          <button
            onClick={() => {
              SoundEngine.playClick();
              onSetViewMode('cycle_explainer');
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition flex items-center gap-1 cursor-pointer border ${
              viewMode === 'cycle_explainer'
                ? isLightMode
                  ? 'bg-emerald-600 text-white font-bold border-emerald-700'
                  : 'bg-emerald-900/80 border-emerald-400 text-emerald-300 font-bold'
                : isLightMode
                ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Intuitive 4-Phase Biological Cycle Explainer [3]"
          >
            <BookOpen className="w-3 h-3" />
            <span>[3] Cycle Guide</span>
          </button>

          <button
            onClick={() => {
              SoundEngine.playClick();
              onSetViewMode('timeseries');
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition flex items-center gap-1 cursor-pointer border ${
              viewMode === 'timeseries'
                ? isLightMode
                  ? 'bg-emerald-600 text-white font-bold border-emerald-700'
                  : 'bg-emerald-900/80 border-emerald-400 text-emerald-300 font-bold'
                : isLightMode
                ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Retro ASCII Scrolling Terminal Graph [4]"
          >
            <Terminal className="w-3 h-3" />
            <span>[4] ASCII</span>
          </button>

          <button
            onClick={() => {
              SoundEngine.playClick();
              onSetViewMode('math_inspector');
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition flex items-center gap-1 cursor-pointer border ${
              viewMode === 'math_inspector'
                ? isLightMode
                  ? 'bg-emerald-600 text-white font-bold border-emerald-700'
                  : 'bg-emerald-900/80 border-emerald-400 text-emerald-300 font-bold'
                : isLightMode
                ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Analytical ODE Math & Stability Inspector [5]"
          >
            <Binary className="w-3 h-3" />
            <span>[5] Math/ODE</span>
          </button>
        </div>
      </div>

      {/* Screen Content */}
      <div className="min-h-[220px]">
        {/* 1. VISUAL CHART MODE */}
        {viewMode === 'visual_chart' && (
          <VisualChart
            history={history}
            currentRabbits={currentRabbits}
            currentFoxes={currentFoxes}
            currentWolves={currentWolves}
            params={params}
            isLightMode={isLightMode}
          />
        )}

        {/* 2. VECTOR FIELD PHASE PORTRAIT */}
        {viewMode === 'phase_portrait' && (
          <PhaseVectorField
            history={history}
            currentRabbits={currentRabbits}
            currentFoxes={currentFoxes}
            params={params}
            isLightMode={isLightMode}
          />
        )}

        {/* 3. CYCLE EXPLAINER */}
        {viewMode === 'cycle_explainer' && (
          <CycleExplainer
            currentRabbits={currentRabbits}
            currentFoxes={currentFoxes}
            currentWolves={currentWolves}
            day={day}
            params={params}
            isLightMode={isLightMode}
          />
        )}

        {/* 4. ASCII TIME SERIES */}
        {viewMode === 'timeseries' && (
          <div
            className={`rounded border p-2 min-h-[220px] flex flex-col justify-center overflow-x-auto ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-black/90 border-zinc-900'
            }`}
          >
            <div className="font-mono text-[12px] sm:text-[13px] leading-relaxed text-zinc-300 whitespace-pre">
              {renderAsciiTimeSeries(history, 46, 10, params.useWolves).map((line, idx) => {
                return (
                  <div key={idx} className="hover:text-emerald-400 transition-colors">
                    {line.split('').map((char, cIdx) => {
                      let color = isLightMode ? 'text-slate-400' : 'text-zinc-400';
                      if (char === 'r') color = isLightMode ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-bold';
                      else if (char === 'f') color = isLightMode ? 'text-orange-700 font-bold' : 'text-orange-400 font-bold';
                      else if (char === 'w') color = isLightMode ? 'text-rose-700 font-bold' : 'text-rose-400 font-bold';
                      else if (char === 'X' || char === 'Ж') color = 'text-amber-500 font-extrabold';
                      else if (char === '!') color = 'text-cyan-500 font-bold animate-pulse';
                      else if (char === '─' || char === '│' || char === '└') color = isLightMode ? 'text-slate-300' : 'text-zinc-700';
                      return (
                        <span key={cIdx} className={color}>
                          {char}
                        </span>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            {/* Timeline Legend */}
            <div className="mt-2 pt-1 border-t border-zinc-800/40 flex items-center justify-between text-[11px] text-zinc-400">
              <div className="flex items-center gap-3">
                <span className="text-emerald-500 font-bold">r = Rabbits</span>
                <span className="text-orange-500 font-bold">f = Foxes</span>
                {params.useWolves && <span className="text-rose-500 font-bold">w = Wolves</span>}
                <span className="text-cyan-500">! = Event Shock</span>
              </div>
              <div className="text-zinc-500">RK4 Step Numerical Integrator</div>
            </div>
          </div>
        )}

        {/* 5. MATH & ODE INSPECTOR */}
        {viewMode === 'math_inspector' && (
          <div className="font-mono text-xs space-y-2 p-1 text-zinc-300">
            <div
              className={`p-2.5 rounded border space-y-1.5 ${
                isLightMode ? 'bg-emerald-50/50 border-emerald-200 text-slate-800' : 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
              }`}
            >
              <div className="text-emerald-500 font-bold text-xs flex items-center justify-between">
                <span>RABBITS (Prey ODE Rate):</span>
                <span className={derivs.dR >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  dR/dt = {derivs.dR >= 0 ? '+' : ''}{derivs.dR.toFixed(2)} / day
                </span>
              </div>
              <div className="text-[11px]">
                <code>dR/dt = </code>
                <span className="text-emerald-600 font-semibold">α(t)·R</span>
                {params.useLogistic && <span className="text-cyan-600 font-semibold">·(1 - R/K)</span>}
                <span className="text-orange-600 font-semibold"> - β_F·R·F</span>
                {params.useWolves && <span className="text-rose-600 font-semibold"> - β_W·R·W</span>}
                {params.harvestR > 0 && <span className="text-purple-600 font-semibold"> - h_R·R</span>}
              </div>
              <div className="text-[10px] text-zinc-500">
                Current terms: Births (+{(derivs.alphaEffective * currentRabbits * (params.useLogistic ? (1 - currentRabbits / params.carryCapacityK) : 1)).toFixed(1)}) 
                │ Predation (-{(params.beta * currentRabbits * currentFoxes).toFixed(1)})
              </div>
            </div>

            <div
              className={`p-2.5 rounded border space-y-1.5 ${
                isLightMode ? 'bg-orange-50/50 border-orange-200 text-slate-800' : 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
              }`}
            >
              <div className="text-orange-500 font-bold text-xs flex items-center justify-between">
                <span>FOXES (Predator 1 ODE Rate):</span>
                <span className={derivs.dF >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  dF/dt = {derivs.dF >= 0 ? '+' : ''}{derivs.dF.toFixed(2)} / day
                </span>
              </div>
              <div className="text-[11px]">
                <code>dF/dt = </code>
                <span className="text-emerald-600 font-semibold">δ_F·R·F</span>
                <span className="text-rose-600 font-semibold"> - γ_F·F</span>
                {params.useWolves && <span className="text-rose-700 font-semibold"> - μ·F·W</span>}
                {params.harvestF > 0 && <span className="text-purple-600 font-semibold"> - h_F·F</span>}
              </div>
              <div className="text-[10px] text-zinc-500">
                Current terms: Repro (+{(params.delta * currentRabbits * currentFoxes).toFixed(1)}) 
                │ Mortality (-{(params.gamma * currentFoxes).toFixed(1)})
              </div>
            </div>

            {params.useWolves && (
              <div
                className={`p-2.5 rounded border space-y-1.5 ${
                  isLightMode ? 'bg-rose-50/50 border-rose-200 text-slate-800' : 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
                }`}
              >
                <div className="text-rose-500 font-bold text-xs flex items-center justify-between">
                  <span>WOLVES (Apex Predator 2 ODE Rate):</span>
                  <span className={derivs.dW >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                    dW/dt = {derivs.dW >= 0 ? '+' : ''}{derivs.dW.toFixed(2)} / day
                  </span>
                </div>
                <div className="text-[11px]">
                  <code>dW/dt = </code>
                  <span className="text-emerald-600 font-semibold">δ_W·R·W</span>
                  <span className="text-rose-600 font-semibold"> - γ_W·W</span>
                  <span className="text-orange-600 font-semibold"> - μ·F·W</span>
                </div>
              </div>
            )}

            {/* Stability & Equilibrium summary */}
            <div
              className={`p-2 rounded border text-[11px] ${
                isLightMode ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-emerald-950/30 border-emerald-900/60 text-zinc-300'
              }`}
            >
              <span className="font-bold text-emerald-500">ECOLOGICAL EQUILIBRIUM: </span>
              <span>R* = {eq.rabbitEq}, F* = {eq.foxEq} │ </span>
              <span>{eq.description}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
