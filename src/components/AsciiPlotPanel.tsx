/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { HistoryPoint, PlotViewMode, SimParameters, TimelineEventMarker } from '../types';
import { renderAsciiTimeSeries } from '../utils/asciiRenderer';
import { calculateEquilibrium, computeDerivatives } from '../utils/mathEngine';
import { SoundEngine } from '../utils/soundSynthesizer';
import { VisualChart } from './VisualChart';
import { PhaseVectorField } from './PhaseVectorField';
import { CycleExplainer } from './CycleExplainer';
import { 
  AreaChart, 
  Compass, 
  Binary, 
  Terminal, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  Radio, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

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
  // ASCII View Backward Time Window state
  const [asciiEndDay, setAsciiEndDay] = useState<number | null>(null);

  const latestDay = history.length > 0 ? history[history.length - 1].day : 0;
  const isViewingPastAscii = asciiEndDay !== null && asciiEndDay < latestDay;

  // Window width in history samples for ASCII
  const asciiWidth = 46;
  const asciiSpanDays = 25; // Approx span represented by 46 points

  const effectiveEndDay = asciiEndDay !== null ? Math.min(latestDay, Math.max(asciiSpanDays, asciiEndDay)) : latestDay;
  const effectiveStartDay = Math.max(0, effectiveEndDay - asciiSpanDays);

  // Slice history for ASCII view
  const visibleAsciiPoints = useMemo(() => {
    if (history.length === 0) return [];
    if (asciiEndDay === null) {
      return history.slice(-asciiWidth);
    }
    const filtered = history.filter((pt) => pt.day <= effectiveEndDay);
    return filtered.slice(-asciiWidth);
  }, [history, asciiEndDay, effectiveEndDay]);

  // Events present in current visible ASCII slice (deduplicated by id)
  const visibleAsciiEvents = useMemo(() => {
    const seen = new Set<string>();
    const evs: TimelineEventMarker[] = [];
    visibleAsciiPoints.forEach((pt) => {
      if (pt.eventDetails && !seen.has(pt.eventDetails.id)) {
        seen.add(pt.eventDetails.id);
        evs.push(pt.eventDetails);
      }
    });
    return evs;
  }, [visibleAsciiPoints]);

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
          <div className="flex flex-col gap-2">
            {/* ASCII Timeline Horizontal Navigation Bar */}
            <div
              className={`px-2 py-1 rounded border flex flex-wrap items-center justify-between gap-2 text-[11px] transition-colors ${
                isViewingPastAscii
                  ? isLightMode
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-amber-950/40 border-amber-600/60 text-amber-300'
                  : isLightMode
                  ? 'bg-slate-50 border-slate-200 text-slate-700'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
              }`}
            >
              {/* Stepping controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    SoundEngine.playClick();
                    setAsciiEndDay(Math.min(latestDay, asciiSpanDays));
                  }}
                  disabled={effectiveStartDay === 0}
                  className={`p-1 rounded cursor-pointer border disabled:opacity-40 disabled:cursor-not-allowed transition ${
                    isLightMode ? 'bg-white hover:bg-slate-100 border-slate-200' : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700'
                  }`}
                  title="Jump to Start (Day 0)"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    SoundEngine.playClick();
                    const cur = asciiEndDay !== null ? asciiEndDay : latestDay;
                    setAsciiEndDay(Math.max(asciiSpanDays, cur - 10));
                  }}
                  disabled={effectiveStartDay === 0}
                  className={`px-1.5 py-0.5 rounded cursor-pointer border flex items-center gap-0.5 disabled:opacity-40 disabled:cursor-not-allowed transition text-[10px] ${
                    isLightMode ? 'bg-white hover:bg-slate-100 border-slate-200' : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700'
                  }`}
                  title="Step back 10 days"
                >
                  <ChevronLeft className="w-3 h-3" />
                  <span>-10d</span>
                </button>
                <button
                  onClick={() => {
                    SoundEngine.playClick();
                    if (asciiEndDay === null) return;
                    const next = asciiEndDay + 10;
                    if (next >= latestDay) setAsciiEndDay(null);
                    else setAsciiEndDay(next);
                  }}
                  disabled={!isViewingPastAscii}
                  className={`px-1.5 py-0.5 rounded cursor-pointer border flex items-center gap-0.5 disabled:opacity-40 disabled:cursor-not-allowed transition text-[10px] ${
                    isLightMode ? 'bg-white hover:bg-slate-100 border-slate-200' : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700'
                  }`}
                  title="Step forward 10 days"
                >
                  <span>+10d</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Scrubber slider */}
              <div className="flex-1 min-w-[120px] flex items-center gap-2">
                <span className="text-[10px] font-bold shrink-0">
                  Day {effectiveStartDay}
                </span>
                <input
                  type="range"
                  min={asciiSpanDays}
                  max={Math.max(asciiSpanDays, latestDay)}
                  step={1}
                  value={effectiveEndDay}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= latestDay) setAsciiEndDay(null);
                    else setAsciiEndDay(val);
                  }}
                  className="w-full accent-emerald-500 h-1.5 rounded bg-zinc-700 cursor-pointer"
                />
                <span className="text-[10px] font-bold shrink-0">
                  Day {effectiveEndDay}
                </span>
              </div>

              {/* Status & Live return */}
              <div className="flex items-center gap-1.5">
                {isViewingPastAscii ? (
                  <div className="flex items-center gap-1.5">
                    <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      <Clock className="w-3 h-3" />
                      PAST
                    </span>
                    <button
                      onClick={() => {
                        SoundEngine.playClick();
                        setAsciiEndDay(null);
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition flex items-center gap-1"
                    >
                      <Radio className="w-3 h-3 animate-pulse text-white" />
                      <span>Live</span>
                    </button>
                  </div>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                    LIVE
                  </span>
                )}
              </div>
            </div>

            {/* ASCII Time Series Graph */}
            <div
              className={`rounded border p-2 min-h-[220px] flex flex-col justify-center overflow-x-auto ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-black/90 border-zinc-900'
              }`}
            >
              <div className="font-mono text-[12px] sm:text-[13px] leading-relaxed text-zinc-300 whitespace-pre">
                {renderAsciiTimeSeries(
                  visibleAsciiPoints, 
                  asciiWidth, 
                  10, 
                  params.useWolves, 
                  isViewingPastAscii
                ).map((line, idx) => {
                  return (
                    <div key={idx} className="hover:text-emerald-400 transition-colors">
                      {line.split('').map((char, cIdx) => {
                        let color = isLightMode ? 'text-slate-400' : 'text-zinc-400';
                        if (char === 'r') color = isLightMode ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-bold';
                        else if (char === 'f') color = isLightMode ? 'text-orange-700 font-bold' : 'text-orange-400 font-bold';
                        else if (char === 'w') color = isLightMode ? 'text-rose-700 font-bold' : 'text-rose-400 font-bold';
                        else if (char === 'X' || char === 'Ж') color = 'text-amber-500 font-extrabold';
                        else if (char === '!' || char === '☣' || char === '❄' || char === '🥕' || char === '🦊' || char === '🐺' || char === '⚡' || char === '🎯' || char === '🏹' || char === '🌿') {
                          color = 'text-cyan-400 font-bold animate-pulse';
                        } else if (char === '┊') {
                          color = isLightMode ? 'text-cyan-300' : 'text-cyan-600/70';
                        } else if (char === '─' || char === '│' || char === '└') {
                          color = isLightMode ? 'text-slate-300' : 'text-zinc-700';
                        }
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

              {/* Event Markers in this ASCII window */}
              {visibleAsciiEvents.length > 0 && (
                <div className="mt-2 pt-1 border-t border-zinc-800/40 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-zinc-500 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-cyan-400" />
                    Events:
                  </span>
                  {visibleAsciiEvents.map((ev, idx) => (
                    <span
                      key={`ascii-ev-${ev.id}-${idx}`}
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1"
                      style={{
                        backgroundColor: isLightMode ? '#f8fafc' : '#18181b',
                        borderColor: ev.color,
                        color: ev.color,
                      }}
                    >
                      <span>{ev.icon}</span>
                      <span>Day {ev.day}: {ev.label}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Timeline Legend */}
              <div className="mt-2 pt-1 border-t border-zinc-800/40 flex flex-wrap items-center justify-between text-[11px] text-zinc-400 gap-1">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-emerald-500 font-bold">r = Rabbits</span>
                  <span className="text-orange-500 font-bold">f = Foxes</span>
                  {params.useWolves && <span className="text-rose-500 font-bold">w = Wolves</span>}
                  <span className="text-cyan-400 font-bold">⚡/! = Event Shocks</span>
                </div>
                <div className="text-zinc-500 text-[10px]">RK4 Time-Step Integrator</div>
              </div>
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
