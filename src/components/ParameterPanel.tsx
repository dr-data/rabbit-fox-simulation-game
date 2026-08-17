/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SimParameters } from '../types';
import { PRESET_MODELS } from '../data/presets';
import { calculateEquilibrium } from '../utils/mathEngine';
import { SoundEngine } from '../utils/soundSynthesizer';
import { Sliders, Plus, Minus, CheckSquare, Square, Bookmark, RotateCcw, Scale, Zap, Info } from 'lucide-react';

interface ParameterPanelProps {
  params: SimParameters;
  selectedParamIndex: number;
  isLightMode?: boolean;
  onSelectParamIndex: (index: number) => void;
  onUpdateParam: <K extends keyof SimParameters>(key: K, value: SimParameters[K]) => void;
  onLoadPreset: (presetId: string) => void;
  onSetToEquilibrium?: () => void;
}

interface ParamDef {
  key: keyof SimParameters;
  label: string;
  symbol: string;
  min: number;
  max: number;
  step: number;
  category: 'core' | 'logistic' | 'season' | 'harvest' | 'wolves' | 'stochastic';
  description: string;
  defaultVal: number;
}

const PARAM_DEFS: ParamDef[] = [
  { key: 'alpha', label: 'Prey Birth Rate (Rabbits)', symbol: 'α', min: 0.1, max: 2.0, step: 0.05, category: 'core', description: 'Natural reproductive birth rate of rabbits in absence of foxes', defaultVal: 0.80 },
  { key: 'beta', label: 'Predation Attack Rate', symbol: 'β', min: 0.002, max: 0.08, step: 0.002, category: 'core', description: 'Fox hunting attack efficiency on rabbits', defaultVal: 0.020 },
  { key: 'gamma', label: 'Predator Death Rate', symbol: 'γ', min: 0.05, max: 1.2, step: 0.02, category: 'core', description: 'Fox natural starvation/mortality rate', defaultVal: 0.40 },
  { key: 'delta', label: 'Reproduction Conversion', symbol: 'δ', min: 0.001, max: 0.04, step: 0.001, category: 'core', description: 'Efficiency of turning consumed prey into new fox kits', defaultVal: 0.010 },
  { key: 'carryCapacityK', label: 'Carrying Capacity', symbol: 'K', min: 50, max: 600, step: 10, category: 'logistic', description: 'Maximum habitat food/space ceiling for rabbits', defaultVal: 300 },
  { key: 'seasonalityA', label: 'Seasonality Amplitude', symbol: 'A', min: 0.0, max: 0.9, step: 0.05, category: 'season', description: 'Seasonal fluctuation magnitude in rabbit birth rates', defaultVal: 0.45 },
  { key: 'seasonalityPeriod', label: 'Seasonal Period (Days)', symbol: 'T', min: 20, max: 180, step: 5, category: 'season', description: 'Duration of full 4-season climate year cycle', defaultVal: 60 },
  { key: 'harvestR', label: 'Cull Rabbits', symbol: 'h_R', min: 0.0, max: 0.4, step: 0.02, category: 'harvest', description: 'Continuous human culling rate on rabbits', defaultVal: 0.00 },
  { key: 'harvestF', label: 'Hunt Foxes', symbol: 'h_F', min: 0.0, max: 0.4, step: 0.02, category: 'harvest', description: 'Hunting/trapping mortality rate on foxes', defaultVal: 0.00 },
  { key: 'wolfBeta', label: 'Wolf Predation Rate', symbol: 'β_W', min: 0.002, max: 0.05, step: 0.002, category: 'wolves', description: 'Wolf hunting efficiency on rabbits', defaultVal: 0.015 },
  { key: 'wolfFoxCompetitionMu', label: 'Wolf-Fox Interference', symbol: 'μ', min: 0.0, max: 0.02, step: 0.001, category: 'wolves', description: 'Interspecific competition between wolves and foxes', defaultVal: 0.004 },
  { key: 'stochasticNoise', label: 'Environmental Shocks', symbol: 'σ', min: 0.0, max: 0.25, step: 0.01, category: 'stochastic', description: 'Random Brownian noise / weather fluctuations', defaultVal: 0.00 },
];

export const ParameterPanel: React.FC<ParameterPanelProps> = ({
  params,
  selectedParamIndex,
  isLightMode = false,
  onSelectParamIndex,
  onUpdateParam,
  onLoadPreset,
  onSetToEquilibrium,
}) => {
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | 'core' | 'extensions' | 'wolves' | 'presets'>('all');
  const currentDef = PARAM_DEFS[selectedParamIndex] || PARAM_DEFS[0];
  const eq = calculateEquilibrium(params);

  const handleAdjust = (delta: number) => {
    SoundEngine.playClick();
    const def = PARAM_DEFS[selectedParamIndex];
    if (!def) return;
    const currentVal = params[def.key] as number;
    let newVal = Math.round((currentVal + delta) * 1000) / 1000;
    newVal = Math.max(def.min, Math.min(def.max, newVal));
    onUpdateParam(def.key, newVal as SimParameters[typeof def.key]);
  };

  const handleResetDef = (def: ParamDef) => {
    SoundEngine.playClick();
    onUpdateParam(def.key, def.defaultVal as SimParameters[typeof def.key]);
  };

  const filteredDefs = PARAM_DEFS.filter((d) => {
    if (activeCategoryTab === 'all') return true;
    if (activeCategoryTab === 'core') return d.category === 'core';
    if (activeCategoryTab === 'extensions') return d.category === 'logistic' || d.category === 'season' || d.category === 'stochastic';
    if (activeCategoryTab === 'wolves') return d.category === 'wolves' || d.category === 'harvest';
    return true;
  });

  return (
    <div
      className={`rounded-md p-2.5 flex flex-col font-mono text-xs select-none transition-colors border shadow-lg ${
        isLightMode
          ? 'bg-white border-slate-300 shadow-slate-200 text-slate-800'
          : 'bg-zinc-950 border-emerald-900/60 shadow-black/60 text-zinc-200'
      }`}
    >
      {/* Header with Preset Selector */}
      <div
        className={`flex flex-wrap items-center justify-between border-b pb-1.5 mb-2 gap-2 ${
          isLightMode ? 'border-slate-200' : 'border-emerald-900/40'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-emerald-500 font-bold tracking-wider flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5" />
            ┌─ PARAMETERS & DYNAMICS
          </span>
          <span className="text-zinc-600 hidden sm:inline">─────────┐</span>
        </div>

        {/* Quick Category Tabs */}
        <div className="flex items-center gap-1 text-[11px]">
          <button
            onClick={() => setActiveCategoryTab('all')}
            className={`px-1.5 py-0.5 rounded cursor-pointer transition ${
              activeCategoryTab === 'all'
                ? isLightMode
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-emerald-800 text-emerald-100 font-bold'
                : isLightMode
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveCategoryTab('core')}
            className={`px-1.5 py-0.5 rounded cursor-pointer transition ${
              activeCategoryTab === 'core'
                ? isLightMode
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-emerald-800 text-emerald-100 font-bold'
                : isLightMode
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Core (α,β,γ,δ)
          </button>
          <button
            onClick={() => setActiveCategoryTab('extensions')}
            className={`px-1.5 py-0.5 rounded cursor-pointer transition ${
              activeCategoryTab === 'extensions'
                ? isLightMode
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-emerald-800 text-emerald-100 font-bold'
                : isLightMode
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Seasons & K
          </button>
          <button
            onClick={() => setActiveCategoryTab('presets')}
            className={`px-1.5 py-0.5 rounded cursor-pointer transition ${
              activeCategoryTab === 'presets'
                ? isLightMode
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-amber-800 text-amber-100 font-bold'
                : isLightMode
                ? 'text-amber-700 hover:text-amber-900'
                : 'text-amber-400 hover:text-amber-200'
            }`}
          >
            Presets
          </button>
        </div>
      </div>

      {/* Preset Quick Carousel View */}
      {activeCategoryTab === 'presets' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-1 max-h-[220px] overflow-y-auto pr-1">
          {PRESET_MODELS.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                SoundEngine.playClick();
                onLoadPreset(p.id);
              }}
              className={`p-2 rounded border cursor-pointer transition-all hover:scale-[1.01] ${
                isLightMode
                  ? 'bg-slate-50 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50'
                  : 'bg-zinc-900/80 border-zinc-800 hover:border-emerald-500 hover:bg-emerald-950/40'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-xs text-emerald-500 mb-0.5">
                <span>{p.name}</span>
                <span className="text-[10px] text-zinc-500">R:{p.initial.rabbits} F:{p.initial.foxes}</span>
              </div>
              <div className="text-[11px] text-amber-500/90 font-semibold mb-1">{p.tagline}</div>
              <div className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">{p.description}</div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Extension Toggles Bar */}
          <div
            className={`flex flex-wrap items-center gap-2 mb-2 p-1.5 rounded border text-[11px] ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/60 border-zinc-800'
            }`}
          >
            <button
              onClick={() => {
                SoundEngine.playClick();
                onUpdateParam('useLogistic', !params.useLogistic);
              }}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition cursor-pointer border ${
                params.useLogistic
                  ? isLightMode
                    ? 'text-emerald-800 font-bold bg-emerald-100 border-emerald-300'
                    : 'text-emerald-300 font-bold bg-emerald-950/60 border-emerald-700'
                  : isLightMode
                  ? 'text-slate-500 border-transparent'
                  : 'text-zinc-500 border-transparent'
              }`}
            >
              {params.useLogistic ? <CheckSquare className="w-3 h-3 text-emerald-500" /> : <Square className="w-3 h-3" />}
              <span>Logistic (K)</span>
            </button>

            <button
              onClick={() => {
                SoundEngine.playClick();
                onUpdateParam('useSeasonality', !params.useSeasonality);
              }}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition cursor-pointer border ${
                params.useSeasonality
                  ? isLightMode
                    ? 'text-amber-800 font-bold bg-amber-100 border-amber-300'
                    : 'text-amber-300 font-bold bg-amber-950/60 border-amber-700'
                  : isLightMode
                  ? 'text-slate-500 border-transparent'
                  : 'text-zinc-500 border-transparent'
              }`}
            >
              {params.useSeasonality ? <CheckSquare className="w-3 h-3 text-amber-500" /> : <Square className="w-3 h-3" />}
              <span>Seasonality α(t)</span>
            </button>

            <button
              onClick={() => {
                SoundEngine.playClick();
                onUpdateParam('useWolves', !params.useWolves);
              }}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition cursor-pointer border ${
                params.useWolves
                  ? isLightMode
                    ? 'text-rose-800 font-bold bg-rose-100 border-rose-300'
                    : 'text-rose-300 font-bold bg-rose-950/60 border-rose-700'
                  : isLightMode
                  ? 'text-slate-500 border-transparent'
                  : 'text-zinc-500 border-transparent'
              }`}
            >
              {params.useWolves ? <CheckSquare className="w-3 h-3 text-rose-500" /> : <Square className="w-3 h-3" />}
              <span>Apex Wolves</span>
            </button>

            {onSetToEquilibrium && (
              <button
                onClick={() => {
                  SoundEngine.playClick();
                  onSetToEquilibrium();
                }}
                className={`ml-auto flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                  isLightMode
                    ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                    : 'bg-zinc-900 text-amber-300 border-amber-700/60 hover:bg-amber-950/50'
                }`}
                title="Lock populations to theoretical equilibrium point (R*, F*)"
              >
                <Scale className="w-3 h-3 text-amber-500" />
                <span>Auto-Balance</span>
              </button>
            )}
          </div>

          {/* Parameter List Grid with active cursor selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
            {filteredDefs.map((def) => {
              const originalIndex = PARAM_DEFS.findIndex((p) => p.key === def.key);
              const isSelected = selectedParamIndex === originalIndex;
              const val = params[def.key] as number;

              return (
                <div
                  key={def.key}
                  onClick={() => {
                    SoundEngine.playClick();
                    onSelectParamIndex(originalIndex);
                  }}
                  className={`p-1.5 rounded border transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? isLightMode
                        ? 'bg-emerald-50 border-emerald-500 text-slate-900 shadow-sm ring-1 ring-emerald-400'
                        : 'bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                      : isLightMode
                      ? 'bg-slate-50/80 border-slate-200 text-slate-700 hover:border-slate-300'
                      : 'bg-zinc-900/70 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className={`font-mono text-xs ${isSelected ? 'text-emerald-500 font-bold' : 'text-zinc-500'}`}>
                      {isSelected ? '►' : ' '}
                    </span>
                    <span className="font-bold text-emerald-500">{def.symbol}</span>
                    <span className="text-[11px] truncate">{def.label}:</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono font-bold text-xs">
                    <span className={isSelected ? 'text-emerald-600 font-bold' : isLightMode ? 'text-slate-800' : 'text-zinc-200'}>
                      {typeof val === 'number' ? (def.step < 0.01 ? val.toFixed(3) : val.toFixed(2)) : val}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Parameter Live Stepper & Slider Control Deck */}
          <div
            className={`mt-2 pt-2 border-t flex flex-wrap items-center justify-between gap-2 p-2 rounded ${
              isLightMode ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-black/60 border-zinc-900 text-zinc-200'
            }`}
          >
            <div className="flex-1 min-w-[140px]">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-emerald-500 font-bold">
                  {currentDef.symbol} — {currentDef.label}
                </span>
                <span className="text-zinc-500 font-mono">
                  {(params[currentDef.key] as number).toFixed(currentDef.step < 0.01 ? 3 : 2)}
                </span>
              </div>
              <input
                type="range"
                min={currentDef.min}
                max={currentDef.max}
                step={currentDef.step}
                value={params[currentDef.key] as number}
                onChange={(e) => {
                  onUpdateParam(currentDef.key, parseFloat(e.target.value) as SimParameters[typeof currentDef.key]);
                }}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Stepper Buttons & Reset to Default */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleAdjust(-currentDef.step)}
                className={`p-1.5 rounded border cursor-pointer active:scale-95 transition ${
                  isLightMode
                    ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-emerald-500'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-emerald-500'
                }`}
                title="Decrease parameter [-]"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleAdjust(currentDef.step)}
                className={`p-1.5 rounded border cursor-pointer active:scale-95 transition ${
                  isLightMode
                    ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-emerald-500'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-emerald-500'
                }`}
                title="Increase parameter [+]"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleResetDef(currentDef)}
                className={`p-1.5 rounded border cursor-pointer transition ${
                  isLightMode
                    ? 'bg-white border-slate-300 text-zinc-400 hover:text-emerald-600'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-emerald-400'
                }`}
                title="Reset this parameter to default"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Description Tooltip */}
      <div className={`text-[10px] mt-1 italic ${isLightMode ? 'text-slate-500' : 'text-zinc-500'}`}>
        {currentDef.description} (Press [←/→] to select, [+/-] to step value)
      </div>
    </div>
  );
};
