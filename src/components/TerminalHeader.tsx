/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ColorTheme, GameMode, Season } from '../types';
import { SoundEngine } from '../utils/soundSynthesizer';
import {
  Volume2,
  VolumeX,
  Tv,
  HelpCircle,
  Trophy,
  RefreshCw,
  Play,
  Pause,
  FastForward,
  Sun,
  Moon,
  StepForward,
  Sparkles,
} from 'lucide-react';

interface TerminalHeaderProps {
  day: number;
  timeSpeed: number;
  isPaused: boolean;
  gameMode: GameMode;
  season: Season;
  alphaEffective: number;
  rabbits: number;
  foxes: number;
  wolves: number;
  useWolves: boolean;
  crtEnabled: boolean;
  isMuted: boolean;
  theme: ColorTheme;
  fps: number;
  isLightMode: boolean;
  onTogglePause: () => void;
  onStepForward: () => void;
  onCycleSpeed: () => void;
  onReset: () => void;
  onToggleCrt: () => void;
  onToggleMute: () => void;
  onChangeTheme: (theme: ColorTheme) => void;
  onToggleLightDark: () => void;
  onOpenChallenges: () => void;
  onOpenMathHelp: () => void;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  day,
  timeSpeed,
  isPaused,
  gameMode,
  season,
  alphaEffective,
  rabbits,
  foxes,
  wolves,
  useWolves,
  crtEnabled,
  isMuted,
  theme,
  fps,
  isLightMode,
  onTogglePause,
  onStepForward,
  onCycleSpeed,
  onReset,
  onToggleCrt,
  onToggleMute,
  onChangeTheme,
  onToggleLightDark,
  onOpenChallenges,
  onOpenMathHelp,
}) => {
  const getSeasonIcon = () => {
    switch (season) {
      case 'Spring':
        return '🌸';
      case 'Summer':
        return '☀️';
      case 'Autumn':
        return '🍂';
      case 'Winter':
        return '❄️';
    }
  };

  const getSeasonColor = () => {
    switch (season) {
      case 'Spring':
        return isLightMode ? 'text-emerald-700 bg-emerald-100 border-emerald-300' : 'text-emerald-400 bg-zinc-900/80 border-zinc-800';
      case 'Summer':
        return isLightMode ? 'text-amber-700 bg-amber-100 border-amber-300' : 'text-amber-400 bg-zinc-900/80 border-zinc-800';
      case 'Autumn':
        return isLightMode ? 'text-orange-700 bg-orange-100 border-orange-300' : 'text-orange-400 bg-zinc-900/80 border-zinc-800';
      case 'Winter':
        return isLightMode ? 'text-sky-700 bg-sky-100 border-sky-300' : 'text-cyan-300 bg-zinc-900/80 border-zinc-800';
    }
  };

  return (
    <header
      className={`border-b px-3 py-2 text-xs md:text-sm select-none transition-colors ${
        isLightMode
          ? 'bg-white/95 border-slate-300 text-slate-800 shadow-xs'
          : 'bg-black/90 border-emerald-900/60 text-zinc-200'
      }`}
    >
      {/* Top Banner Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`font-bold tracking-wider text-sm md:text-base ${
              isLightMode ? 'text-emerald-700' : 'text-emerald-400 glow-green'
            }`}
          >
            LOTKA–VOLTERRA // ECOSYSTEM SIM
          </span>
          <span className="text-zinc-400 hidden sm:inline">│</span>
          <button
            onClick={onOpenChallenges}
            className={`px-2 py-0.5 rounded text-xs font-mono font-semibold transition flex items-center gap-1.5 cursor-pointer border ${
              gameMode === 'challenge'
                ? isLightMode
                  ? 'bg-amber-100 text-amber-900 border-amber-400 font-bold'
                  : 'bg-amber-950/80 text-amber-300 border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                : isLightMode
                ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40 hover:bg-emerald-900/60'
            }`}
            title="Switch Game Mode (Sandbox / Challenge Trials)"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>MODE: {gameMode.toUpperCase()}</span>
          </button>
        </div>

        {/* Status Metrics & Quick Action Buttons */}
        <div className="flex items-center gap-1.5 md:gap-3 font-mono text-xs">
          {/* Day Counter */}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded border ${
              isLightMode ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-zinc-900/80 border-zinc-800 text-zinc-300'
            }`}
          >
            <span className="text-zinc-500 font-medium">DAY</span>
            <span className="font-bold text-emerald-500">{Math.floor(day)}</span>
          </div>

          {/* Season Badge */}
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded border ${getSeasonColor()}`}>
            <span>{getSeasonIcon()}</span>
            <span className="font-semibold">{season.toUpperCase()}</span>
            <span className="text-[10px] text-zinc-500 font-mono">(α: {alphaEffective.toFixed(2)})</span>
          </div>

          {/* FPS */}
          <div
            className={`hidden lg:flex items-center gap-1 px-2 py-0.5 rounded border text-zinc-500 ${
              isLightMode ? 'bg-slate-100 border-slate-300' : 'bg-zinc-900/80 border-zinc-800'
            }`}
          >
            <span>FPS:</span>
            <span className="text-emerald-500 font-bold">{fps}</span>
          </div>

          {/* 1-Click Light / Dark Mode Toggle */}
          <button
            onClick={() => {
              SoundEngine.playClick();
              onToggleLightDark();
            }}
            className={`p-1 rounded border transition cursor-pointer flex items-center gap-1 px-1.5 ${
              isLightMode
                ? 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200'
                : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-amber-400'
            }`}
            title="Toggle Light / Dark Mode"
          >
            {isLightMode ? <Sun className="w-3.5 h-3.5 text-amber-600" /> : <Moon className="w-3.5 h-3.5 text-cyan-300" />}
            <span className="text-[11px] font-bold hidden sm:inline">{isLightMode ? 'Light' : 'Dark'}</span>
          </button>

          {/* Theme Selector Dropdown */}
          <select
            value={theme}
            onChange={(e) => {
              SoundEngine.playClick();
              onChangeTheme(e.target.value as ColorTheme);
            }}
            className={`border px-1.5 py-0.5 rounded text-xs font-mono cursor-pointer focus:outline-none ${
              isLightMode
                ? 'bg-white text-slate-800 border-slate-300 hover:border-emerald-500'
                : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-emerald-500'
            }`}
            title="Visual Color Palette"
          >
            <option value="light-lab">☀️ Light Academic Lab</option>
            <option value="light-paper">📜 Field Biology Paper</option>
            <option value="phosphor-green">🟢 Phosphor Green CRT</option>
            <option value="amber-crt">🟠 Amber CRT Terminal</option>
            <option value="cyber-neon">🟣 Cyberpunk Neon</option>
            <option value="arctic-ice">🔵 Arctic Ice Polar</option>
            <option value="matrix-dark">⬛ Matrix Obsidian</option>
          </select>

          {/* CRT scanlines toggle (only in dark themes) */}
          {!isLightMode && (
            <button
              onClick={() => {
                SoundEngine.playClick();
                onToggleCrt();
              }}
              className={`p-1 rounded border transition cursor-pointer ${
                crtEnabled
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
              title="Toggle CRT Scanlines & Screen Vignette"
            >
              <Tv className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Audio toggle */}
          <button
            onClick={() => {
              SoundEngine.playClick();
              onToggleMute();
            }}
            className={`p-1 rounded border transition cursor-pointer ${
              !isMuted
                ? isLightMode
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                  : 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                : isLightMode
                ? 'bg-slate-100 border-slate-300 text-slate-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
            title="Toggle 8-Bit Synthesizer Audio"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Math Help */}
          <button
            onClick={() => {
              SoundEngine.playClick();
              onOpenMathHelp();
            }}
            className={`px-2 py-0.5 rounded border flex items-center gap-1 cursor-pointer transition ${
              isLightMode
                ? 'bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100'
                : 'bg-zinc-900 border-zinc-700 text-cyan-400 hover:bg-zinc-800'
            }`}
            title="Open Mathematical Biology & Theory Compendium [H]"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">MATH [H]</span>
          </button>
        </div>
      </div>

      {/* Secondary Bar: Live Population Counters & Sim Controls */}
      <div
        className={`mt-1.5 pt-1.5 border-t flex flex-wrap items-center justify-between gap-2 ${
          isLightMode ? 'border-slate-200' : 'border-zinc-900'
        }`}
      >
        {/* Populations */}
        <div className="flex items-center gap-2 sm:gap-4 font-mono text-xs">
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded border ${
              isLightMode ? 'bg-emerald-50 border-emerald-200' : 'bg-zinc-900/60 border-zinc-800'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-[0_0_6px_#10b981]" />
            <span className="text-zinc-500 font-medium">🐰 RABBITS:</span>
            <span className="font-bold text-emerald-600 text-sm">{Math.round(rabbits)}</span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded border ${
              isLightMode ? 'bg-orange-50 border-orange-200' : 'bg-zinc-900/60 border-zinc-800'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block shadow-[0_0_6px_#f97316]" />
            <span className="text-zinc-500 font-medium">🦊 FOXES:</span>
            <span className="font-bold text-orange-600 text-sm">{Math.round(foxes)}</span>
          </div>

          {useWolves && (
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded border ${
                isLightMode ? 'bg-rose-50 border-rose-200' : 'bg-zinc-900/60 border-zinc-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shadow-[0_0_6px_#ef4444]" />
              <span className="text-zinc-500 font-medium">🐺 WOLVES:</span>
              <span className="font-bold text-rose-600 text-sm">{Math.round(wolves)}</span>
            </div>
          )}
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1.5">
          {/* Pause / Resume */}
          <button
            onClick={() => {
              SoundEngine.playClick();
              onTogglePause();
            }}
            className={`px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition border ${
              isPaused
                ? isLightMode
                  ? 'bg-amber-100 text-amber-900 border-amber-400 hover:bg-amber-200'
                  : 'bg-amber-600/30 text-amber-300 border-amber-500 hover:bg-amber-600/50'
                : isLightMode
                ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                : 'bg-emerald-900/60 text-emerald-300 border-emerald-600 hover:bg-emerald-800/60'
            }`}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            <span>{isPaused ? 'RESUME [SPACE]' : 'PAUSE [SPACE]'}</span>
          </button>

          {/* Step 1 Day Forward */}
          {isPaused && (
            <button
              onClick={() => {
                SoundEngine.playClick();
                onStepForward();
              }}
              className={`px-2 py-1 rounded text-xs font-mono border flex items-center gap-1 cursor-pointer transition ${
                isLightMode
                  ? 'bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100'
                  : 'bg-zinc-900 border-zinc-700 text-cyan-400 hover:bg-zinc-800'
              }`}
              title="Step forward simulation by 1 day"
            >
              <StepForward className="w-3 h-3 text-cyan-500" />
              <span>Step +1d</span>
            </button>
          )}

          {/* Speed Cycle */}
          <button
            onClick={() => {
              SoundEngine.playClick();
              onCycleSpeed();
            }}
            className={`px-2 py-1 rounded text-xs font-mono border flex items-center gap-1 cursor-pointer transition ${
              isLightMode
                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
            }`}
            title="Cycle simulation speed (0.5x -> 1x -> 2x -> 5x)"
          >
            <FastForward className="w-3 h-3 text-cyan-500" />
            <span>{timeSpeed}x SPEED [S]</span>
          </button>

          {/* Reset */}
          <button
            onClick={() => {
              SoundEngine.playClick();
              onReset();
            }}
            className={`px-2 py-1 rounded text-xs font-mono border flex items-center gap-1 cursor-pointer transition ${
              isLightMode
                ? 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100'
                : 'bg-zinc-900 border-zinc-700 text-rose-400 hover:bg-rose-950/40 hover:border-rose-600'
            }`}
            title="Reset simulation to initial conditions [R]"
          >
            <RefreshCw className="w-3 h-3" />
            <span>RESET [R]</span>
          </button>
        </div>
      </div>
    </header>
  );
};
