/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Keyboard } from 'lucide-react';

interface ControlsFooterProps {
  isLightMode?: boolean;
}

export const ControlsFooter: React.FC<ControlsFooterProps> = ({ isLightMode = false }) => {
  return (
    <footer
      className={`border-t px-3 py-2 text-[11px] font-mono select-none transition-colors ${
        isLightMode
          ? 'border-slate-300 bg-white/95 text-slate-600'
          : 'border-emerald-900/60 bg-black/95 text-zinc-400'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 font-bold text-emerald-600">
          <Keyboard className="w-3.5 h-3.5" />
          <span>TERMINAL SHORTCUTS:</span>
        </div>

        <div
          className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${
            isLightMode ? 'text-slate-700' : 'text-zinc-300'
          }`}
        >
          <span>
            <kbd className={`px-1.5 py-0.5 rounded border font-bold ${
              isLightMode ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-zinc-800 border-zinc-700 text-emerald-300'
            }`}>
              Space
            </kbd>{' '}
            Pause/Play
          </span>
          <span>
            <kbd className={`px-1.5 py-0.5 rounded border font-bold ${
              isLightMode ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-zinc-800 border-zinc-700 text-emerald-300'
            }`}>
              ←/→
            </kbd>{' '}
            Select Param
          </span>
          <span>
            <kbd className={`px-1.5 py-0.5 rounded border font-bold ${
              isLightMode ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-zinc-800 border-zinc-700 text-emerald-300'
            }`}>
              +/-
            </kbd>{' '}
            Adjust Value
          </span>
          <span>
            <kbd className={`px-1.5 py-0.5 rounded border font-bold ${
              isLightMode ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-zinc-800 border-zinc-700 text-emerald-300'
            }`}>
              1-5
            </kbd>{' '}
            Visual Views
          </span>
          <span>
            <kbd className={`px-1.5 py-0.5 rounded border font-bold ${
              isLightMode ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-zinc-800 border-zinc-700 text-emerald-300'
            }`}>
              R
            </kbd>{' '}
            Reset
          </span>
          <span>
            <kbd className={`px-1.5 py-0.5 rounded border font-bold ${
              isLightMode ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-zinc-800 border-zinc-700 text-emerald-300'
            }`}>
              H
            </kbd>{' '}
            Math Guide
          </span>
          <span>
            <kbd className={`px-1.5 py-0.5 rounded border font-bold ${
              isLightMode ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-zinc-800 border-zinc-700 text-emerald-300'
            }`}>
              S
            </kbd>{' '}
            Speed
          </span>
        </div>

        <div className={`hidden xl:inline ${isLightMode ? 'text-slate-400' : 'text-zinc-600'}`}>
          Model: Extended Lotka-Volterra RK4
        </div>
      </div>
    </footer>
  );
};
