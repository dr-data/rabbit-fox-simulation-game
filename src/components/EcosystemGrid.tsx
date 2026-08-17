/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EcosystemTool, GridAgent, GridRenderMode, Particle, Season, Species } from '../types';
import { SoundEngine } from '../utils/soundSynthesizer';
import { Sparkles, Skull, Crosshair, Grid, Monitor, Eye, Wrench, Settings } from 'lucide-react';

interface EcosystemGridProps {
  agents: GridAgent[];
  particles: Particle[];
  season: Season;
  gridWidth?: number;
  gridHeight?: number;
  rabbits: number;
  foxes: number;
  wolves: number;
  hasDisease: boolean;
  isLightMode?: boolean;
  renderMode: GridRenderMode;
  onChangeRenderMode: (mode: GridRenderMode) => void;
  tools?: EcosystemTool[];
  selectedToolId?: string;
  onSelectToolId?: (id: string) => void;
  onTriggerTool?: (tool: EcosystemTool, x: number, y: number) => void;
  onOpenSettings?: () => void;
  onSpawnAgent?: (type: Species, x: number, y: number) => void;
  onDropCarrots?: (x: number, y: number) => void;
}

export const EcosystemGrid: React.FC<EcosystemGridProps> = ({
  agents,
  particles,
  season,
  gridWidth = 42,
  gridHeight = 18,
  rabbits,
  foxes,
  wolves,
  hasDisease,
  isLightMode = false,
  renderMode,
  onChangeRenderMode,
  tools = [],
  selectedToolId,
  onSelectToolId,
  onTriggerTool,
  onOpenSettings,
  onSpawnAgent,
  onDropCarrots,
}) => {
  // Local fallback tool selection if not externally controlled
  const [localToolId, setLocalToolId] = useState<string>('tool-rabbit');
  const activeToolId = selectedToolId || localToolId;

  // Filter enabled tools (or default fallback)
  const enabledTools = tools.filter((t) => t.enabled);
  const activeTool = tools.find((t) => t.id === activeToolId) || enabledTools[0] || {
    id: 'tool-rabbit',
    name: 'Rabbit',
    emoji: '🐰',
    category: 'spawn',
    description: 'Spawn rabbits',
    actionType: 'spawn_agent',
    targetSpecies: 'rabbits',
    potency: 4,
    color: '#10b981',
    enabled: true,
  };

  const handleSelectTool = (id: string) => {
    SoundEngine.playClick();
    if (onSelectToolId) {
      onSelectToolId(id);
    } else {
      setLocalToolId(id);
    }
  };

  // Build 2D character / tile map
  const charGrid: { char: string; color: string; agentId?: string }[][] = Array.from(
    { length: gridHeight },
    () => Array.from({ length: gridWidth }, () => ({ char: '·', color: isLightMode ? 'text-slate-300' : 'text-zinc-700' }))
  );

  // Background subtle terrain features
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const hash = (x * 37 + y * 73) % 23;
      if (hash === 0) {
        charGrid[y][x] = {
          char: '"',
          color: season === 'Winter' 
            ? (isLightMode ? 'text-sky-400' : 'text-cyan-900') 
            : (isLightMode ? 'text-emerald-500' : 'text-emerald-900'),
        };
      } else if (hash === 5) {
        charGrid[y][x] = { char: '.', color: isLightMode ? 'text-slate-300' : 'text-zinc-800' };
      }
    }
  }

  // Draw living agents
  for (const a of agents) {
    if (a.y >= 0 && a.y < gridHeight && a.x >= 0 && a.x < gridWidth) {
      if (a.type === 'rabbit') {
        const symbol = a.age > 8 ? 'R' : 'r';
        const color = isLightMode
          ? 'text-emerald-700 font-bold'
          : season === 'Winter'
          ? 'text-emerald-300'
          : 'text-emerald-400 font-semibold';
        charGrid[a.y][a.x] = { char: symbol, color, agentId: a.id };
      } else if (a.type === 'fox') {
        const symbol = a.age > 8 ? 'F' : 'f';
        charGrid[a.y][a.x] = {
          char: symbol,
          color: isLightMode ? 'text-orange-700 font-extrabold' : 'text-orange-400 font-bold',
          agentId: a.id,
        };
      } else if (a.type === 'wolf') {
        const symbol = a.age > 8 ? 'W' : 'w';
        charGrid[a.y][a.x] = {
          char: symbol,
          color: isLightMode ? 'text-rose-700 font-extrabold' : 'text-rose-400 font-bold',
          agentId: a.id,
        };
      }
    }
  }

  // Overlay particles
  for (const p of particles) {
    const px = Math.floor(p.x);
    const py = Math.floor(p.y);
    if (py >= 0 && py < gridHeight && px >= 0 && px < gridWidth) {
      charGrid[py][px] = {
        char: p.char,
        color:
          p.type === 'splatter'
            ? 'text-red-500 font-extrabold glow-red'
            : p.type === 'birth'
            ? 'text-emerald-400 font-bold glow-green'
            : p.type === 'disease'
            ? 'text-purple-400 font-bold'
            : p.type === 'snow'
            ? 'text-cyan-300 font-bold'
            : 'text-amber-400 font-bold',
      };
    }
  }

  // Handle cell click
  const handleCellClick = (x: number, y: number) => {
    if (onTriggerTool && activeTool) {
      onTriggerTool(activeTool as EcosystemTool, x, y);
      return;
    }

    // Fallback legacy support
    SoundEngine.playClick();
    if (activeTool.actionType === 'feed_prey') {
      onDropCarrots?.(x, y);
    } else if (activeTool.actionType === 'spawn_agent') {
      const sp = activeTool.targetSpecies === 'wolves' ? 'wolf' : activeTool.targetSpecies === 'foxes' ? 'fox' : 'rabbit';
      onSpawnAgent?.(sp as Species, x, y);
    }
  };

  // Get background meadow color based on season and light/dark mode
  const getCanvasBg = () => {
    if (isLightMode) {
      if (season === 'Winter') return 'bg-sky-50/70 border-sky-200';
      if (season === 'Autumn') return 'bg-amber-50/50 border-amber-200';
      return 'bg-emerald-50/40 border-slate-200';
    }
    if (season === 'Winter') return 'bg-cyan-950/20 border-zinc-900';
    if (season === 'Autumn') return 'bg-amber-950/20 border-zinc-900';
    return 'bg-black/90 border-zinc-900';
  };

  return (
    <div
      className={`rounded-md p-2.5 flex flex-col font-mono text-xs select-none transition-colors border shadow-lg ${
        isLightMode
          ? 'bg-white border-slate-300 shadow-slate-200 text-slate-800'
          : 'bg-zinc-950 border-emerald-900/60 shadow-black/60 text-zinc-200'
      }`}
    >
      {/* Box Header */}
      <div
        className={`flex flex-wrap items-center justify-between border-b pb-2 mb-2 gap-2 ${
          isLightMode ? 'border-slate-200' : 'border-emerald-900/40'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-emerald-500 font-bold tracking-wider flex items-center gap-1">
            ┌─ ECOSYSTEM HABITAT ({gridWidth}x{gridHeight})
          </span>
          {/* Render Mode Switcher */}
          <div
            className={`flex items-center rounded border p-0.5 text-[10px] transition-colors ${
              isLightMode
                ? 'border-slate-300 bg-slate-100 shadow-xs'
                : 'border-zinc-700 bg-zinc-900/50'
            }`}
          >
            <button
              onClick={() => {
                SoundEngine.playClick();
                onChangeRenderMode('graphic');
              }}
              className={`px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition ${
                renderMode === 'graphic'
                  ? isLightMode
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-emerald-600 text-white font-bold'
                  : isLightMode
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
              title="Graphic Avatar World (Cute animated animals & FX)"
            >
              <Monitor className="w-3 h-3" />
              <span>🎮 Graphic</span>
            </button>
            <button
              onClick={() => {
                SoundEngine.playClick();
                onChangeRenderMode('ascii');
              }}
              className={`px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition ${
                renderMode === 'ascii'
                  ? isLightMode
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-emerald-600 text-white font-bold'
                  : isLightMode
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
              title="Retro Terminal ASCII character grid"
            >
              <Grid className="w-3 h-3" />
              <span>📟 ASCII</span>
            </button>
          </div>
        </div>

        {/* Dynamic Habitat Tools Bar (Configurable from Settings) */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-zinc-500 text-[11px] mr-0.5 hidden sm:inline">TOOL:</span>
          {enabledTools.map((tool) => {
            const isSelected = tool.id === activeTool.id;
            return (
              <button
                key={tool.id}
                onClick={() => handleSelectTool(tool.id)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition cursor-pointer border flex items-center gap-1 ${
                  isSelected
                    ? isLightMode
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-400 font-bold shadow-xs'
                      : 'bg-emerald-900/80 border-emerald-400 text-emerald-300 font-bold shadow-xs'
                    : isLightMode
                    ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
                title={`${tool.emoji} ${tool.name}: ${tool.description}`}
              >
                <span>{tool.emoji}</span>
                <span>{tool.name}</span>
                {tool.actionType === 'hunt_predators' && (
                  <span className="text-[9px] text-rose-400 opacity-90 hidden md:inline">
                    (Apex)
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Tools Settings Link */}
          {onOpenSettings && (
            <button
              onClick={() => {
                SoundEngine.playClick();
                onOpenSettings();
              }}
              className={`p-1 rounded text-[10px] font-mono border transition cursor-pointer flex items-center gap-1 ${
                isLightMode
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600'
                  : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-emerald-400'
              }`}
              title="Configure, enable, or add custom tools (e.g. Hunter for predators) in Settings"
            >
              <Settings className="w-3 h-3" />
              <span className="hidden xl:inline">Config</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Canvas Screen (Graphic Mode or ASCII Mode) */}
      <div
        className={`relative rounded border p-2 overflow-hidden cursor-crosshair group flex justify-center items-center select-none transition-colors ${getCanvasBg()}`}
        title={`Click on habitat to deploy ${activeTool.name} (${activeTool.description})`}
      >
        {/* Weather / Disease Overlay effects */}
        {hasDisease && (
          <div className="absolute inset-0 bg-purple-950/20 pointer-events-none animate-pulse flex items-center justify-center">
            <span className="text-purple-500/50 text-xs font-mono font-bold tracking-widest uppercase">
              ~ ~ ~ VIRULENT PLAGUE OUTBREAK ACTIVE ~ ~ ~
            </span>
          </div>
        )}

        {season === 'Winter' && (
          <div className="absolute inset-0 bg-cyan-900/10 pointer-events-none" />
        )}

        {/* 1. GRAPHIC AVATAR MODE */}
        {renderMode === 'graphic' ? (
          <div
            className="w-full relative min-h-[220px] grid"
            style={{
              gridTemplateColumns: `repeat(${gridWidth}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${gridHeight}, minmax(0, 1fr))`,
              aspectRatio: `${gridWidth} / ${gridHeight}`,
              maxHeight: '260px',
            }}
          >
            {/* Background meadow texture */}
            {Array.from({ length: gridHeight }).map((_, y) =>
              Array.from({ length: gridWidth }).map((_, x) => {
                const hash = (x * 37 + y * 73) % 23;
                return (
                  <div
                    key={`bg-${x}-${y}`}
                    onClick={() => handleCellClick(x, y)}
                    className="relative flex items-center justify-center hover:bg-emerald-500/20 transition-colors duration-75 cursor-pointer text-[10px]"
                  >
                    {hash === 0 && (
                      <span className={isLightMode ? 'text-emerald-400 opacity-60' : 'text-emerald-900 opacity-70'}>
                        {season === 'Winter' ? '❄' : '🌱'}
                      </span>
                    )}
                    {hash === 7 && (
                      <span className={isLightMode ? 'text-amber-400 opacity-50' : 'text-zinc-800'}>
                        {season === 'Autumn' ? '🍂' : '·'}
                      </span>
                    )}
                  </div>
                );
              })
            )}

            {/* Render Living Agents with Avatars */}
            {agents.map((agent) => {
              const leftPercent = (agent.x / gridWidth) * 100;
              const topPercent = (agent.y / gridHeight) * 100;

              return (
                <div
                  key={agent.id}
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="absolute pointer-events-none transition-all duration-300 ease-out flex items-center justify-center"
                >
                  {agent.type === 'rabbit' && (
                    <div className="relative group/agent">
                      <span className="text-sm sm:text-base inline-block hover:scale-125 transition-transform animate-bounce">
                        🐰
                      </span>
                      {agent.energy < 20 && (
                        <span className="absolute -top-1 -right-1 text-[8px] text-amber-400 font-bold">!</span>
                      )}
                    </div>
                  )}

                  {agent.type === 'fox' && (
                    <div className="relative group/agent">
                      <span className="text-sm sm:text-base inline-block hover:scale-125 transition-transform">
                        🦊
                      </span>
                    </div>
                  )}

                  {agent.type === 'wolf' && (
                    <div className="relative group/agent">
                      <span className="text-base sm:text-lg inline-block hover:scale-125 transition-transform">
                        🐺
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Render Particle Effects */}
            {particles.map((p) => {
              const leftPercent = (p.x / gridWidth) * 100;
              const topPercent = (p.y / gridHeight) * 100;

              return (
                <div
                  key={p.id}
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="absolute pointer-events-none transition-opacity duration-150 flex items-center justify-center font-bold text-xs"
                >
                  {p.type === 'splatter' ? (
                    <span className="text-rose-500 font-extrabold animate-ping">
                      {p.char || '💥'}
                    </span>
                  ) : p.type === 'birth' ? (
                    <span className="text-emerald-400 font-bold animate-pulse">
                      {p.char || '✨'}
                    </span>
                  ) : p.type === 'carrots' ? (
                    <span className="text-amber-500 font-bold animate-bounce">
                      {p.char || '🥕'}
                    </span>
                  ) : p.type === 'snow' ? (
                    <span className="text-cyan-300 font-bold">❄</span>
                  ) : (
                    <span className="text-purple-400 font-bold">☣</span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* 2. CLASSIC ASCII MATRIX MODE */
          <div className="inline-block leading-none tracking-normal font-mono text-[13px] sm:text-[14px] md:text-[15px]">
            {charGrid.map((row, y) => (
              <div key={y} className="flex">
                {row.map((cell, x) => (
                  <span
                    key={x}
                    onClick={() => handleCellClick(x, y)}
                    className={`char-cell inline-block text-center hover:bg-emerald-500/20 cursor-pointer transition-colors duration-75 ${cell.color}`}
                  >
                    {cell.char}
                  </span>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Legend, Active Tool Info and Status */}
      <div
        className={`mt-2 pt-1.5 border-t flex flex-wrap items-center justify-between text-[11px] gap-1.5 ${
          isLightMode ? 'border-slate-200 text-slate-600' : 'border-zinc-900 text-zinc-400'
        }`}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span>
            <strong className="text-emerald-500">🐰 Rabbits</strong>: {Math.round(rabbits)}
          </span>
          <span>
            <strong className="text-orange-500">🦊 Foxes</strong>: {Math.round(foxes)}
          </span>
          {wolves > 0 && (
            <span>
              <strong className="text-rose-500">🐺 Wolves</strong>: {Math.round(wolves)}
            </span>
          )}
          <span className="text-emerald-400 font-medium">
            Active: {activeTool.emoji} {activeTool.name} — {activeTool.description}
          </span>
        </div>
        <div className="text-zinc-500 font-mono">
          Living Agents: {agents.length} active
        </div>
      </div>
    </div>
  );
};

