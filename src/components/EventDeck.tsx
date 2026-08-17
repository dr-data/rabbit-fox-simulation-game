/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { SimEvent } from '../types';
import { SoundEngine } from '../utils/soundSynthesizer';
import { Terminal, Zap, ShieldAlert, Sparkles, Snowflake, Biohazard, Target, Trash2 } from 'lucide-react';

interface EventDeckProps {
  events: SimEvent[];
  isLightMode?: boolean;
  onTriggerEvent: (type: string) => void;
  onClearLog: () => void;
  isWolvesActive: boolean;
}

export const EventDeck: React.FC<EventDeckProps> = ({
  events,
  isLightMode = false,
  onTriggerEvent,
  onClearLog,
  isWolvesActive,
}) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only scroll the internal log container without scrolling the window or visualizer view
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [events.length]);

  const handleTrigger = (eventType: string) => {
    SoundEngine.playClick();
    onTriggerEvent(eventType);
  };

  const getEventBadgeClass = (type: SimEvent['type']) => {
    switch (type) {
      case 'danger':
      case 'alert':
        return isLightMode
          ? 'bg-rose-100 text-rose-800 border-rose-300'
          : 'bg-red-950/80 text-rose-300 border border-red-700/60';
      case 'birth':
        return isLightMode
          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60';
      case 'predation':
        return isLightMode
          ? 'bg-orange-100 text-orange-800 border-orange-300'
          : 'bg-orange-950/80 text-orange-300 border border-orange-700/60';
      case 'event':
        return isLightMode
          ? 'bg-purple-100 text-purple-800 border-purple-300'
          : 'bg-purple-950/80 text-purple-300 border border-purple-700/60';
      case 'success':
        return isLightMode
          ? 'bg-sky-100 text-sky-800 border-sky-300'
          : 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60';
      default:
        return isLightMode
          ? 'bg-slate-100 text-slate-700 border-slate-300'
          : 'bg-zinc-900 text-zinc-400 border border-zinc-800';
    }
  };

  return (
    <div
      className={`rounded-md p-2.5 flex flex-col font-mono text-xs select-none transition-colors border shadow-lg ${
        isLightMode
          ? 'bg-white border-slate-300 shadow-slate-200 text-slate-800'
          : 'bg-zinc-950 border-emerald-900/60 shadow-black/60 text-zinc-200'
      }`}
    >
      {/* Event Deck Header */}
      <div
        className={`flex flex-wrap items-center justify-between border-b pb-1.5 mb-2 gap-2 ${
          isLightMode ? 'border-slate-200' : 'border-emerald-900/40'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-emerald-500 font-bold tracking-wider flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            ┌─ EVENT TRIGGER DECK
          </span>
          <span className="text-zinc-600 hidden sm:inline">──────────────────┐</span>
        </div>
        <button
          onClick={() => {
            SoundEngine.playClick();
            onClearLog();
          }}
          className={`flex items-center gap-1 cursor-pointer text-[11px] transition ${
            isLightMode ? 'text-slate-500 hover:text-slate-900' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title="Clear Event Log"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear</span>
        </button>
      </div>

      {/* Interactive Quick Trigger Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2.5">
        <button
          onClick={() => handleTrigger('disease')}
          className={`p-1.5 rounded border flex items-center gap-1.5 cursor-pointer text-left transition ${
            isLightMode
              ? 'bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100'
              : 'bg-purple-950/40 border-purple-800/60 text-purple-300 hover:bg-purple-900/60 hover:border-purple-500'
          }`}
        >
          <Biohazard className="w-3.5 h-3.5 text-purple-500 shrink-0" />
          <div>
            <div className="font-bold text-[11px]">Plague Outbreak</div>
            <div className="text-[10px] text-purple-500">-25% Rabbits [1]</div>
          </div>
        </button>

        <button
          onClick={() => handleTrigger('winter_shock')}
          className={`p-1.5 rounded border flex items-center gap-1.5 cursor-pointer text-left transition ${
            isLightMode
              ? 'bg-sky-50 border-sky-200 text-sky-900 hover:bg-sky-100'
              : 'bg-cyan-950/40 border-cyan-800/60 text-cyan-300 hover:bg-cyan-900/60 hover:border-cyan-500'
          }`}
        >
          <Snowflake className="w-3.5 h-3.5 text-sky-500 shrink-0" />
          <div>
            <div className="font-bold text-[11px]">Harsh Frost</div>
            <div className="text-[10px] text-sky-500">Freeze Growth [2]</div>
          </div>
        </button>

        <button
          onClick={() => handleTrigger('carrots')}
          className={`p-1.5 rounded border flex items-center gap-1.5 cursor-pointer text-left transition ${
            isLightMode
              ? 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
              : 'bg-amber-950/40 border-amber-800/60 text-amber-300 hover:bg-amber-900/60 hover:border-amber-500'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <div>
            <div className="font-bold text-[11px]">Airdrop Carrots</div>
            <div className="text-[10px] text-amber-600">+30 Rabbits [3]</div>
          </div>
        </button>

        <button
          onClick={() => handleTrigger('add_foxes')}
          className={`p-1.5 rounded border flex items-center gap-1.5 cursor-pointer text-left transition ${
            isLightMode
              ? 'bg-orange-50 border-orange-200 text-orange-900 hover:bg-orange-100'
              : 'bg-orange-950/40 border-orange-800/60 text-orange-300 hover:bg-orange-900/60 hover:border-orange-500'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <div>
            <div className="font-bold text-[11px]">Spawn Fox Pack</div>
            <div className="text-[10px] text-orange-600">+8 Foxes [4]</div>
          </div>
        </button>

        <button
          onClick={() => handleTrigger('add_wolves')}
          className={`p-1.5 rounded border flex items-center gap-1.5 cursor-pointer text-left transition ${
            isLightMode
              ? 'bg-rose-50 border-rose-200 text-rose-900 hover:bg-rose-100'
              : 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/60 hover:border-rose-500'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <div>
            <div className="font-bold text-[11px]">Release Wolves</div>
            <div className="text-[10px] text-rose-600">+5 Wolves [5]</div>
          </div>
        </button>

        <button
          onClick={() => handleTrigger('cull_rabbits')}
          className={`p-1.5 rounded border flex items-center gap-1.5 cursor-pointer text-left transition ${
            isLightMode
              ? 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100'
              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-emerald-600'
          }`}
        >
          <div className="text-emerald-500 font-bold shrink-0">🎯</div>
          <div>
            <div className="font-bold text-[11px]">Cull Prey</div>
            <div className="text-[10px] text-zinc-500">-20% Rabbits [6]</div>
          </div>
        </button>

        <button
          onClick={() => handleTrigger('hunt_foxes')}
          className={`p-1.5 rounded border flex items-center gap-1.5 cursor-pointer text-left transition ${
            isLightMode
              ? 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100'
              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-orange-600'
          }`}
        >
          <div className="text-orange-500 font-bold shrink-0">🏹</div>
          <div>
            <div className="font-bold text-[11px]">Hunt Predators</div>
            <div className="text-[10px] text-zinc-500">-25% Foxes [7]</div>
          </div>
        </button>

        <button
          onClick={() => handleTrigger('random_shock')}
          className={`p-1.5 rounded border flex items-center gap-1.5 cursor-pointer text-left transition ${
            isLightMode
              ? 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100'
              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-cyan-600'
          }`}
        >
          <div className="text-cyan-500 font-bold shrink-0">⚡</div>
          <div>
            <div className="font-bold text-[11px]">Weather Shock</div>
            <div className="text-[10px] text-zinc-500">Random Shift [8]</div>
          </div>
        </button>
      </div>

      {/* Terminal Live Event Log Console */}
      <div className={`border-t pt-1.5 ${isLightMode ? 'border-slate-200' : 'border-zinc-900'}`}>
        <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
          <span className="flex items-center gap-1">
            <Terminal className="w-3 h-3 text-emerald-500" />
            <span>TERMINAL TELEMETRY & LOG</span>
          </span>
          <span>{events.length} records</span>
        </div>

        <div
          ref={logContainerRef}
          className={`rounded border p-2 h-[95px] overflow-y-auto font-mono text-[11px] space-y-1 ${
            isLightMode ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-black/90 border-zinc-900 text-zinc-300'
          }`}
        >
          {events.length === 0 ? (
            <div className="text-zinc-500 italic">No events recorded yet. Simulation nominal.</div>
          ) : (
            events.map((ev) => (
              <div
                key={ev.id}
                className={`flex items-start gap-2 p-0.5 rounded ${
                  isLightMode ? 'hover:bg-slate-200/60' : 'hover:bg-zinc-900/40'
                }`}
              >
                <span className="text-zinc-500 shrink-0">[{ev.timeStr}]</span>
                <span className={`px-1 py-0.2 rounded text-[10px] uppercase font-bold shrink-0 border ${getEventBadgeClass(ev.type)}`}>
                  {ev.type}
                </span>
                <span className="leading-tight break-words">{ev.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
