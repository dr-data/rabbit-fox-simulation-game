/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { HistoryPoint, SimParameters, TimelineEventMarker } from '../types';
import { calculateEquilibrium } from '../utils/mathEngine';
import { SoundEngine } from '../utils/soundSynthesizer';
import { 
  Download, 
  Eye, 
  EyeOff, 
  Info, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  Radio, 
  AlertCircle,
  Clock
} from 'lucide-react';

interface VisualChartProps {
  history: HistoryPoint[];
  currentRabbits: number;
  currentFoxes: number;
  currentWolves: number;
  params: SimParameters;
  isLightMode?: boolean;
}

export const VisualChart: React.FC<VisualChartProps> = ({
  history,
  currentRabbits,
  currentFoxes,
  currentWolves,
  params,
  isLightMode = false,
}) => {
  const [timeWindow, setTimeWindow] = useState<'all' | '120' | '60' | '30'>('60');
  const [windowEndDay, setWindowEndDay] = useState<number | null>(null); // null = Live tracking
  const [showRabbits, setShowRabbits] = useState(true);
  const [showFoxes, setShowFoxes] = useState(true);
  const [showWolves, setShowWolves] = useState(true);
  const [showEquilibriumLines, setShowEquilibriumLines] = useState(true);
  const [showEventMarkers, setShowEventMarkers] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<TimelineEventMarker | null>(null);

  const latestDay = history.length > 0 ? history[history.length - 1].day : 0;
  const isViewingPast = windowEndDay !== null && windowEndDay < latestDay;

  // Window span in days
  const windowSpan = useMemo(() => {
    if (timeWindow === '30') return 30;
    if (timeWindow === '60') return 60;
    if (timeWindow === '120') return 120;
    return Math.max(30, latestDay);
  }, [timeWindow, latestDay]);

  // Current effective end day
  const effectiveEndDay = windowEndDay !== null ? Math.min(latestDay, Math.max(windowSpan, windowEndDay)) : latestDay;
  const effectiveStartDay = Math.max(0, effectiveEndDay - windowSpan);

  // Filter history points based on window
  const displayHistory = useMemo(() => {
    if (history.length === 0) return [];
    if (timeWindow === 'all' && windowEndDay === null) return history;
    return history.filter((pt) => pt.day >= effectiveStartDay && pt.day <= effectiveEndDay);
  }, [history, timeWindow, windowEndDay, effectiveStartDay, effectiveEndDay]);

  // Events present in current visible window (deduplicated by id)
  const visibleEvents = useMemo(() => {
    const seen = new Set<string>();
    const evs: TimelineEventMarker[] = [];
    displayHistory.forEach((pt) => {
      if (pt.eventDetails && !seen.has(pt.eventDetails.id)) {
        seen.add(pt.eventDetails.id);
        evs.push(pt.eventDetails);
      }
    });
    return evs;
  }, [displayHistory]);

  const eq = calculateEquilibrium(params);

  // Calculate scales
  const chartWidth = 620;
  const chartHeight = 220;
  const padding = { top: 24, right: 30, bottom: 35, left: 45 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const { minT, maxT, maxPop } = useMemo(() => {
    if (displayHistory.length === 0) {
      return { minT: 0, maxT: 30, maxPop: 150 };
    }
    const minT = displayHistory[0].t;
    const maxT = Math.max(minT + 4, displayHistory[displayHistory.length - 1].t);
    let max = Math.max(
      ...displayHistory.map((d) => Math.max(d.rabbits, d.foxes, params.useWolves ? d.wolves : 0)),
      params.useLogistic ? params.carryCapacityK * 0.8 : 0,
      eq.rabbitEq * 1.2,
      eq.foxEq * 1.2,
      50
    );
    // Add 15% headroom
    max = Math.ceil(max * 1.15 / 10) * 10;
    return { minT, maxT, maxPop: max };
  }, [displayHistory, params.useWolves, params.useLogistic, params.carryCapacityK, eq.rabbitEq, eq.foxEq]);

  const getX = (t: number) => {
    if (maxT === minT) return padding.left;
    return padding.left + ((t - minT) / (maxT - minT)) * innerWidth;
  };

  const getY = (pop: number) => {
    const clamped = Math.max(0, Math.min(maxPop, pop));
    return padding.top + innerHeight - (clamped / maxPop) * innerHeight;
  };

  // Build SVG path strings
  const rabbitPath = useMemo(() => {
    if (displayHistory.length === 0) return '';
    return displayHistory
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.t).toFixed(1)} ${getY(d.rabbits).toFixed(1)}`)
      .join(' ');
  }, [displayHistory, minT, maxT, maxPop]);

  const rabbitArea = useMemo(() => {
    if (displayHistory.length === 0) return '';
    const baseLine = getY(0).toFixed(1);
    const line = displayHistory
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.t).toFixed(1)} ${getY(d.rabbits).toFixed(1)}`)
      .join(' ');
    const lastX = getX(displayHistory[displayHistory.length - 1].t).toFixed(1);
    const firstX = getX(displayHistory[0].t).toFixed(1);
    return `${line} L ${lastX} ${baseLine} L ${firstX} ${baseLine} Z`;
  }, [displayHistory, minT, maxT, maxPop]);

  const foxPath = useMemo(() => {
    if (displayHistory.length === 0) return '';
    return displayHistory
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.t).toFixed(1)} ${getY(d.foxes).toFixed(1)}`)
      .join(' ');
  }, [displayHistory, minT, maxT, maxPop]);

  const foxArea = useMemo(() => {
    if (displayHistory.length === 0) return '';
    const baseLine = getY(0).toFixed(1);
    const line = displayHistory
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.t).toFixed(1)} ${getY(d.foxes).toFixed(1)}`)
      .join(' ');
    const lastX = getX(displayHistory[displayHistory.length - 1].t).toFixed(1);
    const firstX = getX(displayHistory[0].t).toFixed(1);
    return `${line} L ${lastX} ${baseLine} L ${firstX} ${baseLine} Z`;
  }, [displayHistory, minT, maxT, maxPop]);

  const wolfPath = useMemo(() => {
    if (!params.useWolves || displayHistory.length === 0) return '';
    return displayHistory
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.t).toFixed(1)} ${getY(d.wolves).toFixed(1)}`)
      .join(' ');
  }, [displayHistory, minT, maxT, maxPop, params.useWolves]);

  // Backward and Forward Navigation Handlers
  const handleStepBack = (stepDays: number = 15) => {
    SoundEngine.playClick();
    const curEnd = windowEndDay !== null ? windowEndDay : latestDay;
    const newEnd = Math.max(windowSpan, curEnd - stepDays);
    setWindowEndDay(newEnd);
  };

  const handleStepForward = (stepDays: number = 15) => {
    SoundEngine.playClick();
    if (windowEndDay === null) return;
    const newEnd = windowEndDay + stepDays;
    if (newEnd >= latestDay) {
      setWindowEndDay(null); // Return to live
    } else {
      setWindowEndDay(newEnd);
    }
  };

  const handleJumpToStart = () => {
    SoundEngine.playClick();
    setWindowEndDay(Math.min(latestDay, windowSpan));
  };

  const handleJumpToLive = () => {
    SoundEngine.playClick();
    setWindowEndDay(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (history.length === 0) return;
    const header = params.useWolves
      ? 'Day,Time,Rabbits,Foxes,Wolves,Season,Alpha_Effective,Event\n'
      : 'Day,Time,Rabbits,Foxes,Season,Alpha_Effective,Event\n';
    const rows = history
      .map((h) => {
        const ev = h.eventDetails ? `"${h.eventDetails.label}"` : '';
        return params.useWolves
          ? `${h.day},${h.t.toFixed(2)},${h.rabbits},${h.foxes},${h.wolves},${h.season},${h.alphaT.toFixed(3)},${ev}`
          : `${h.day},${h.t.toFixed(2)},${h.rabbits},${h.foxes},${h.season},${h.alphaT.toFixed(3)},${ev}`;
      })
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `lotka_volterra_simulation_data_day_${Math.floor(latestDay)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hoveredData = hoverIndex !== null && displayHistory[hoverIndex] ? displayHistory[hoverIndex] : null;

  // Y-axis ticks (strictly unique)
  const yTicks = useMemo(() => {
    const raw = [0, Math.round(maxPop * 0.25), Math.round(maxPop * 0.5), Math.round(maxPop * 0.75), maxPop];
    return Array.from(new Set(raw)).sort((a, b) => a - b);
  }, [maxPop]);

  // X-axis ticks (approx 5 ticks, strictly unique)
  const xTicks = useMemo(() => {
    const count = 5;
    const diff = maxT - minT;
    if (diff <= 0) return [Math.round(minT)];
    const step = diff / count;
    const raw = Array.from({ length: count + 1 }, (_, i) => Math.round(minT + i * step));
    return Array.from(new Set(raw)).sort((a, b) => a - b);
  }, [minT, maxT]);

  return (
    <div className="flex flex-col gap-2 font-mono select-none">
      {/* Top Filter & Species Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Toggle species lines */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setShowRabbits((v) => !v)}
            className={`px-2 py-0.5 rounded flex items-center gap-1 text-[11px] font-bold transition cursor-pointer border ${
              showRabbits
                ? isLightMode
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-500'
                : isLightMode
                ? 'bg-slate-100 text-slate-400 border-slate-200'
                : 'bg-zinc-900 text-zinc-600 border-zinc-800 opacity-60'
            }`}
            title="Toggle Rabbit trajectory"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>🐰 Rabbits</span>
            {showRabbits ? <Eye className="w-3 h-3 ml-0.5" /> : <EyeOff className="w-3 h-3 ml-0.5" />}
          </button>

          <button
            onClick={() => setShowFoxes((v) => !v)}
            className={`px-2 py-0.5 rounded flex items-center gap-1 text-[11px] font-bold transition cursor-pointer border ${
              showFoxes
                ? isLightMode
                  ? 'bg-orange-100 text-orange-800 border-orange-300'
                  : 'bg-orange-950/80 text-orange-300 border-orange-500'
                : isLightMode
                ? 'bg-slate-100 text-slate-400 border-slate-200'
                : 'bg-zinc-900 text-zinc-600 border-zinc-800 opacity-60'
            }`}
            title="Toggle Fox trajectory"
          >
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>🦊 Foxes</span>
            {showFoxes ? <Eye className="w-3 h-3 ml-0.5" /> : <EyeOff className="w-3 h-3 ml-0.5" />}
          </button>

          {params.useWolves && (
            <button
              onClick={() => setShowWolves((v) => !v)}
              className={`px-2 py-0.5 rounded flex items-center gap-1 text-[11px] font-bold transition cursor-pointer border ${
                showWolves
                  ? isLightMode
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-rose-950/80 text-rose-300 border-rose-500'
                  : isLightMode
                  ? 'bg-slate-100 text-slate-400 border-slate-200'
                  : 'bg-zinc-900 text-zinc-600 border-zinc-800 opacity-60'
              }`}
              title="Toggle Wolf trajectory"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>🐺 Wolves</span>
              {showWolves ? <Eye className="w-3 h-3 ml-0.5" /> : <EyeOff className="w-3 h-3 ml-0.5" />}
            </button>
          )}

          <button
            onClick={() => setShowEquilibriumLines((v) => !v)}
            className={`px-1.5 py-0.5 rounded text-[10px] transition cursor-pointer border hidden sm:inline-flex items-center gap-1 ${
              showEquilibriumLines
                ? isLightMode
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-zinc-900 text-amber-300 border-amber-600/50'
                : isLightMode
                ? 'bg-slate-100 text-slate-400 border-slate-200'
                : 'bg-zinc-900 text-zinc-600 border-zinc-800'
            }`}
            title="Toggle theoretical equilibrium reference lines (R*, F*)"
          >
            <span>Isoclines</span>
          </button>

          <button
            onClick={() => setShowEventMarkers((v) => !v)}
            className={`px-1.5 py-0.5 rounded text-[10px] transition cursor-pointer border hidden sm:inline-flex items-center gap-1 ${
              showEventMarkers
                ? isLightMode
                  ? 'bg-cyan-50 text-cyan-800 border-cyan-300'
                  : 'bg-zinc-900 text-cyan-300 border-cyan-600/50'
                : isLightMode
                ? 'bg-slate-100 text-slate-400 border-slate-200'
                : 'bg-zinc-900 text-zinc-600 border-zinc-800'
            }`}
            title="Toggle Event trigger & relief markers on timeline"
          >
            <span>⚡ Events</span>
          </button>
        </div>

        {/* Time window selector & export */}
        <div className="flex items-center gap-1.5">
          <div
            className={`flex items-center rounded border p-0.5 text-[11px] transition-colors ${
              isLightMode
                ? 'border-slate-300 bg-slate-100 shadow-xs'
                : 'border-zinc-700 bg-zinc-900/60'
            }`}
          >
            <button
              onClick={() => {
                setTimeWindow('30');
              }}
              className={`px-2 py-0.5 rounded cursor-pointer transition ${
                timeWindow === '30'
                  ? isLightMode
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-emerald-600 text-white font-bold'
                  : isLightMode
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              30d
            </button>
            <button
              onClick={() => {
                setTimeWindow('60');
              }}
              className={`px-2 py-0.5 rounded cursor-pointer transition ${
                timeWindow === '60'
                  ? isLightMode
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-emerald-600 text-white font-bold'
                  : isLightMode
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              60d
            </button>
            <button
              onClick={() => {
                setTimeWindow('120');
              }}
              className={`px-2 py-0.5 rounded cursor-pointer transition ${
                timeWindow === '120'
                  ? isLightMode
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-emerald-600 text-white font-bold'
                  : isLightMode
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              120d
            </button>
            <button
              onClick={() => {
                setTimeWindow('all');
                setWindowEndDay(null);
              }}
              className={`px-2 py-0.5 rounded cursor-pointer transition ${
                timeWindow === 'all'
                  ? isLightMode
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-emerald-600 text-white font-bold'
                  : isLightMode
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              All
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className={`px-2 py-0.5 rounded text-[11px] font-mono border flex items-center gap-1 cursor-pointer transition ${
              isLightMode
                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-emerald-300'
            }`}
            title="Export simulation history as CSV file"
          >
            <Download className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Horizontal Timeline Backward/Forward Scrubber Control Bar */}
      <div
        className={`px-2 py-1 rounded border flex flex-wrap items-center justify-between gap-2 text-[11px] transition-colors ${
          isViewingPast
            ? isLightMode
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-amber-950/40 border-amber-600/60 text-amber-300'
            : isLightMode
            ? 'bg-slate-50 border-slate-200 text-slate-700'
            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
        }`}
      >
        {/* Navigation Step Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleJumpToStart}
            disabled={effectiveStartDay === 0}
            className={`p-1 rounded cursor-pointer border disabled:opacity-40 disabled:cursor-not-allowed transition ${
              isLightMode ? 'bg-white hover:bg-slate-100 border-slate-200' : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700'
            }`}
            title="Jump to Start (Day 0)"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleStepBack(15)}
            disabled={effectiveStartDay === 0}
            className={`px-1.5 py-0.5 rounded cursor-pointer border flex items-center gap-0.5 disabled:opacity-40 disabled:cursor-not-allowed transition text-[10px] ${
              isLightMode ? 'bg-white hover:bg-slate-100 border-slate-200' : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700'
            }`}
            title="Step back 15 days"
          >
            <ChevronLeft className="w-3 h-3" />
            <span>-15d</span>
          </button>
          <button
            onClick={() => handleStepForward(15)}
            disabled={!isViewingPast}
            className={`px-1.5 py-0.5 rounded cursor-pointer border flex items-center gap-0.5 disabled:opacity-40 disabled:cursor-not-allowed transition text-[10px] ${
              isLightMode ? 'bg-white hover:bg-slate-100 border-slate-200' : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700'
            }`}
            title="Step forward 15 days"
          >
            <span>+15d</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Timeline Slider & Span indicator */}
        <div className="flex-1 min-w-[140px] flex items-center gap-2">
          <span className="text-[10px] font-bold shrink-0">
            Day {effectiveStartDay}
          </span>
          <input
            type="range"
            min={windowSpan}
            max={Math.max(windowSpan, latestDay)}
            step={1}
            value={effectiveEndDay}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= latestDay) {
                setWindowEndDay(null);
              } else {
                setWindowEndDay(val);
              }
            }}
            className="w-full accent-emerald-500 h-1.5 rounded bg-zinc-700 cursor-pointer"
          />
          <span className="text-[10px] font-bold shrink-0">
            Day {effectiveEndDay}
          </span>
        </div>

        {/* Live / Past Status Tag & Jump to Live */}
        <div className="flex items-center gap-1.5">
          {isViewingPast ? (
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Clock className="w-3 h-3" />
                PAST
              </span>
              <button
                onClick={handleJumpToLive}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition shadow-xs flex items-center gap-1"
              >
                <Radio className="w-3 h-3 animate-pulse text-white" />
                <span>Jump to Live (Day {latestDay})</span>
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

      {/* SVG Canvas Area */}
      <div
        className={`relative rounded border p-1 overflow-hidden transition-colors ${
          isLightMode ? 'bg-white border-slate-200' : 'bg-black/95 border-zinc-900'
        }`}
      >
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto block"
          onMouseLeave={() => {
            setHoverIndex(null);
            setHoveredEvent(null);
          }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * chartWidth;
            if (mouseX >= padding.left && mouseX <= chartWidth - padding.right && displayHistory.length > 0) {
              const relX = (mouseX - padding.left) / innerWidth;
              const targetT = minT + relX * (maxT - minT);
              // Find closest data point
              let closestIdx = 0;
              let minDiff = Infinity;
              displayHistory.forEach((pt, i) => {
                const diff = Math.abs(pt.t - targetT);
                if (diff < minDiff) {
                  minDiff = diff;
                  closestIdx = i;
                }
              });
              setHoverIndex(closestIdx);
            }
          }}
        >
          <defs>
            {/* Rabbit Gradient Area */}
            <linearGradient id="rabbitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={isLightMode ? 0.35 : 0.4} />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>

            {/* Fox Gradient Area */}
            <linearGradient id="foxGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={isLightMode ? 0.3 : 0.35} />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
            </linearGradient>

            {/* Wolf Gradient Area */}
            <linearGradient id="wolfGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={isLightMode ? 0.3 : 0.35} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines */}
          {yTicks.map((val, idx) => {
            const y = getY(val);
            return (
              <g key={`y-tick-${val}-${idx}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke={isLightMode ? '#e2e8f0' : '#1e293b'}
                  strokeDasharray={val === 0 ? 'none' : '3,3'}
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill={isLightMode ? '#64748b' : '#64748b'}
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* X Axis Ticks */}
          {xTicks.map((val, idx) => {
            const x = getX(val);
            return (
              <g key={`x-tick-${val}-${idx}`}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={chartHeight - padding.bottom}
                  stroke={isLightMode ? '#f1f5f9' : '#0f172a'}
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={chartHeight - padding.bottom + 14}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isLightMode ? '#64748b' : '#64748b'}
                  fontFamily="monospace"
                >
                  Day {val}
                </text>
              </g>
            );
          })}

          {/* Theoretical Carrying Capacity K Line */}
          {params.useLogistic && (
            <g>
              <line
                x1={padding.left}
                y1={getY(params.carryCapacityK)}
                x2={chartWidth - padding.right}
                y2={getY(params.carryCapacityK)}
                stroke="#06b6d4"
                strokeDasharray="4,4"
                strokeWidth="1"
                opacity={0.7}
              />
              <text
                x={chartWidth - padding.right - 4}
                y={getY(params.carryCapacityK) - 4}
                textAnchor="end"
                fontSize="8"
                fill="#06b6d4"
                fontFamily="monospace"
                fontWeight="bold"
              >
                K = {params.carryCapacityK} (Capacity)
              </text>
            </g>
          )}

          {/* Equilibrium Reference Lines (R*, F*) */}
          {showEquilibriumLines && (
            <>
              <line
                x1={padding.left}
                y1={getY(eq.rabbitEq)}
                x2={chartWidth - padding.right}
                y2={getY(eq.rabbitEq)}
                stroke="#10b981"
                strokeDasharray="2,4"
                strokeWidth="1"
                opacity={0.4}
              />
              <line
                x1={padding.left}
                y1={getY(eq.foxEq)}
                x2={chartWidth - padding.right}
                y2={getY(eq.foxEq)}
                stroke="#f97316"
                strokeDasharray="2,4"
                strokeWidth="1"
                opacity={0.4}
              />
            </>
          )}

          {/* Area Fills */}
          {showRabbits && <path d={rabbitArea} fill="url(#rabbitGrad)" />}
          {showFoxes && <path d={foxArea} fill="url(#foxGrad)" />}

          {/* Trajectory Stroke Lines */}
          {showRabbits && (
            <path
              d={rabbitPath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {showFoxes && (
            <path
              d={foxPath}
              fill="none"
              stroke="#f97316"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {params.useWolves && showWolves && (
            <path
              d={wolfPath}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* EVENT TRIGGER & RELIEF MARKERS */}
          {showEventMarkers &&
            visibleEvents.map((ev, idx) => {
              const x = getX(ev.t);
              const isHovered = hoveredEvent?.id === ev.id;
              return (
                <g 
                  key={`event-pin-${ev.id}-${idx}`} 
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredEvent(ev)}
                >
                  {/* Vertical dashed event line */}
                  <line
                    x1={x}
                    y1={padding.top - 8}
                    x2={x}
                    y2={chartHeight - padding.bottom}
                    stroke={ev.color || '#06b6d4'}
                    strokeDasharray="3,3"
                    strokeWidth={isHovered ? '2' : '1.2'}
                    opacity={isHovered ? 1 : 0.8}
                  />

                  {/* Top Pin Badge */}
                  <circle
                    cx={x}
                    cy={padding.top - 10}
                    r={isHovered ? '8' : '6.5'}
                    fill={ev.color || '#06b6d4'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="transition-all"
                  />
                  <text
                    x={x}
                    y={padding.top - 6.5}
                    textAnchor="middle"
                    fontSize={isHovered ? '9' : '8'}
                    fill="#ffffff"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {ev.icon}
                  </text>
                </g>
              );
            })}

          {/* Active Live End Dots */}
          {!isViewingPast && displayHistory.length > 0 && (
            <>
              {showRabbits && (
                <circle
                  cx={getX(displayHistory[displayHistory.length - 1].t)}
                  cy={getY(currentRabbits)}
                  r="4"
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="animate-pulse"
                />
              )}
              {showFoxes && (
                <circle
                  cx={getX(displayHistory[displayHistory.length - 1].t)}
                  cy={getY(currentFoxes)}
                  r="4"
                  fill="#f97316"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="animate-pulse"
                />
              )}
              {params.useWolves && showWolves && (
                <circle
                  cx={getX(displayHistory[displayHistory.length - 1].t)}
                  cy={getY(currentWolves)}
                  r="4"
                  fill="#ef4444"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="animate-pulse"
                />
              )}
            </>
          )}

          {/* Interactive Hover Crosshair & Dots */}
          {hoveredData && (
            <g>
              {/* Vertical guideline */}
              <line
                x1={getX(hoveredData.t)}
                y1={padding.top}
                x2={getX(hoveredData.t)}
                y2={chartHeight - padding.bottom}
                stroke={isLightMode ? '#94a3b8' : '#64748b'}
                strokeWidth="1"
                strokeDasharray="2,2"
              />

              {showRabbits && (
                <circle
                  cx={getX(hoveredData.t)}
                  cy={getY(hoveredData.rabbits)}
                  r="4.5"
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              )}

              {showFoxes && (
                <circle
                  cx={getX(hoveredData.t)}
                  cy={getY(hoveredData.foxes)}
                  r="4.5"
                  fill="#f97316"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              )}

              {params.useWolves && showWolves && (
                <circle
                  cx={getX(hoveredData.t)}
                  cy={getY(hoveredData.wolves)}
                  r="4.5"
                  fill="#ef4444"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              )}
            </g>
          )}
        </svg>

        {/* Hover Tooltip Overlay for Data Point */}
        {hoveredData && !hoveredEvent && (
          <div
            className={`absolute top-2 right-2 p-2 rounded border text-xs shadow-lg font-mono pointer-events-none ${
              isLightMode
                ? 'bg-white/95 border-slate-300 text-slate-800 shadow-slate-200'
                : 'bg-zinc-950/95 border-emerald-900/80 text-zinc-200 shadow-black'
            }`}
          >
            <div className="font-bold border-b border-zinc-700/50 pb-1 mb-1 flex items-center justify-between gap-3 text-[11px]">
              <span>Day {hoveredData.day} ({hoveredData.season})</span>
              <span className="text-zinc-500">t: {hoveredData.t.toFixed(1)}</span>
            </div>
            <div className="space-y-0.5 text-[11px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-emerald-500 font-semibold">🐰 Rabbits:</span>
                <span className="font-bold">{hoveredData.rabbits}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-orange-500 font-semibold">🦊 Foxes:</span>
                <span className="font-bold">{hoveredData.foxes}</span>
              </div>
              {params.useWolves && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-rose-500 font-semibold">🐺 Wolves:</span>
                  <span className="font-bold">{hoveredData.wolves}</span>
                </div>
              )}
              {hoveredData.eventDetails && (
                <div className="text-[10px] text-cyan-400 pt-0.5 border-t border-zinc-800 font-bold flex items-center gap-1">
                  <span>{hoveredData.eventDetails.icon}</span>
                  <span>{hoveredData.eventDetails.label}</span>
                </div>
              )}
              {params.useSeasonality && (
                <div className="text-[10px] text-amber-500 pt-0.5 border-t border-zinc-800">
                  Effective α(t): {hoveredData.alphaT.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hovered Event Tooltip */}
        {hoveredEvent && (
          <div
            className={`absolute top-2 right-2 p-2.5 rounded border text-xs shadow-lg font-mono pointer-events-none max-w-[260px] ${
              isLightMode
                ? 'bg-white border-slate-300 text-slate-800 shadow-slate-200'
                : 'bg-zinc-950 border-cyan-500/80 text-zinc-200 shadow-black'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-[12px] pb-1 mb-1 border-b border-zinc-700/60" style={{ color: hoveredEvent.color }}>
              <span className="text-sm">{hoveredEvent.icon}</span>
              <span>{hoveredEvent.label}</span>
            </div>
            <div className="text-[11px] text-zinc-400 mb-1">
              Triggered on <strong>Day {hoveredEvent.day}</strong> (t={hoveredEvent.t.toFixed(1)})
            </div>
            <p className="text-[10px] text-zinc-300 leading-relaxed">
              {hoveredEvent.description}
            </p>
          </div>
        )}
      </div>

      {/* Events Summary Strip in current visible time window */}
      {visibleEvents.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 px-1 text-[11px]">
          <span className="text-zinc-500 font-bold flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-cyan-400" />
            Events in Window:
          </span>
          {visibleEvents.map((ev, idx) => (
            <button
              key={`event-btn-${ev.id}-${idx}`}
              onClick={() => {
                SoundEngine.playClick();
                setHoveredEvent(ev);
              }}
              className="px-1.5 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 cursor-pointer transition"
              style={{
                backgroundColor: isLightMode ? '#f8fafc' : '#18181b',
                borderColor: ev.color,
                color: ev.color,
              }}
              title={ev.description}
            >
              <span>{ev.icon}</span>
              <span>Day {ev.day}: {ev.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      )}

      {/* Footer info & biological equilibrium summary */}
      <div
        className={`flex flex-wrap items-center justify-between text-[11px] px-1 gap-1 ${
          isLightMode ? 'text-slate-500' : 'text-zinc-500'
        }`}
      >
        <div className="flex items-center gap-2">
          <Info className="w-3 h-3 text-cyan-400" />
          <span>Equilibrium Center: R* = {eq.rabbitEq} prey, F* = {eq.foxEq} predators</span>
        </div>
        <div>
          Viewing Window: {displayHistory.length} data points (Day {effectiveStartDay} - Day {effectiveEndDay})
        </div>
      </div>
    </div>
  );
};
