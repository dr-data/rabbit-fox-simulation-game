/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChallengePreset } from '../types';
import { GAME_CHALLENGES } from '../data/challenges';
import { SoundEngine } from '../utils/soundSynthesizer';
import { Trophy, CheckCircle, XCircle, Play, RefreshCw, X } from 'lucide-react';

interface ChallengeModalProps {
  isOpen: boolean;
  activeChallenge: ChallengePreset | null;
  day: number;
  rabbits: number;
  foxes: number;
  wolves: number;
  challengeStatus: 'idle' | 'playing' | 'won' | 'lost';
  failureReason: string;
  isLightMode?: boolean;
  onClose: () => void;
  onStartChallenge: (challenge: ChallengePreset) => void;
  onRestartCurrent: () => void;
  onSwitchToSandbox: () => void;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  isOpen,
  activeChallenge,
  day,
  rabbits,
  foxes,
  wolves,
  challengeStatus,
  failureReason,
  isLightMode = false,
  onClose,
  onStartChallenge,
  onRestartCurrent,
  onSwitchToSandbox,
}) => {
  if (!isOpen) return null;

  const currentDays = activeChallenge ? Math.min(activeChallenge.targetDays, Math.floor(day)) : 0;
  const progressPct = activeChallenge ? Math.min(100, Math.round((currentDays / activeChallenge.targetDays) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 font-mono">
      <div
        className={`border rounded-lg max-w-2xl w-full p-4 text-xs shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto ${
          isLightMode
            ? 'bg-white border-slate-300 text-slate-800 shadow-slate-400'
            : 'bg-zinc-950 border-emerald-500/80 text-zinc-200 shadow-emerald-950/50'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b pb-2 mb-3 ${
            isLightMode ? 'border-slate-200' : 'border-emerald-900/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-sm text-emerald-600 tracking-wider">
              GAME CHALLENGES // ECOSYSTEM TRIALS
            </span>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded cursor-pointer ${
              isLightMode ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Challenge Status Banner if playing or won/lost */}
        {activeChallenge && (
          <div
            className={`mb-4 p-3 rounded-md border ${
              isLightMode ? 'bg-slate-50 border-slate-300' : 'bg-zinc-900 border-zinc-700'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div>
                <span className="text-zinc-500">ACTIVE TRIAL: </span>
                <span className="font-bold text-emerald-600 text-sm">{activeChallenge.title}</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded font-bold border ${
                  isLightMode ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-zinc-800 text-amber-400 border-zinc-700'
                }`}
              >
                {activeChallenge.difficulty.toUpperCase()}
              </span>
            </div>

            {/* Victory / Defeat notification */}
            {challengeStatus === 'won' && (
              <div
                className={`p-3 mb-2 rounded border flex items-center gap-2 ${
                  isLightMode
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-900'
                    : 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                }`}
              >
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <div className="font-bold text-sm">MISSION ACCOMPLISHED!</div>
                  <div className="text-[11px]">
                    You maintained ecosystem equilibrium for {activeChallenge.targetDays} days!
                  </div>
                </div>
              </div>
            )}

            {challengeStatus === 'lost' && (
              <div
                className={`p-3 mb-2 rounded border flex items-center gap-2 ${
                  isLightMode
                    ? 'bg-rose-100 border-rose-400 text-rose-900'
                    : 'bg-red-950/80 border-red-500 text-rose-300'
                }`}
              >
                <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <div>
                  <div className="font-bold text-sm">TRIAL FAILED: EXTINCTION EVENT</div>
                  <div className="text-[11px]">{failureReason}</div>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>
                  Progress: {currentDays} / {activeChallenge.targetDays} Days
                </span>
                <span className="font-bold text-emerald-600">{progressPct}%</span>
              </div>
              <div
                className={`w-full rounded-full h-2 overflow-hidden border ${
                  isLightMode ? 'bg-slate-200 border-slate-300' : 'bg-zinc-800 border-zinc-700'
                }`}
              >
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Current Objectives */}
            <div
              className={`mt-2.5 pt-2 border-t text-[11px] ${
                isLightMode ? 'border-slate-200 text-slate-700' : 'border-zinc-800 text-zinc-300'
              }`}
            >
              <span className="font-bold text-zinc-500">OBJECTIVE: </span>
              {activeChallenge.objective}
            </div>

            <div className="mt-2 flex gap-2">
              <button
                onClick={() => {
                  SoundEngine.playClick();
                  onRestartCurrent();
                }}
                className={`px-3 py-1 rounded flex items-center gap-1.5 cursor-pointer font-bold border transition ${
                  isLightMode
                    ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                    : 'bg-zinc-800 border-zinc-600 hover:bg-zinc-700 text-zinc-200'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restart Trial</span>
              </button>
              <button
                onClick={() => {
                  SoundEngine.playClick();
                  onSwitchToSandbox();
                }}
                className={`px-3 py-1 rounded flex items-center gap-1.5 cursor-pointer border transition ${
                  isLightMode
                    ? 'bg-white border-slate-300 text-sky-800 hover:bg-slate-100'
                    : 'bg-zinc-800 border-zinc-600 hover:bg-zinc-700 text-cyan-300'
                }`}
              >
                <span>Return to Sandbox</span>
              </button>
            </div>
          </div>
        )}

        {/* Challenge Selection List */}
        <div className="space-y-2.5">
          <div className="text-zinc-500 font-bold text-xs uppercase tracking-wider">
            AVAILABLE CHALLENGES & SIMULATION SCENARIOS:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {GAME_CHALLENGES.map((ch) => {
              const isCurrent = activeChallenge?.id === ch.id;
              return (
                <div
                  key={ch.id}
                  className={`p-3 rounded border transition flex flex-col justify-between ${
                    isCurrent
                      ? isLightMode
                        ? 'bg-emerald-50 border-emerald-400'
                        : 'bg-emerald-950/40 border-emerald-500'
                      : isLightMode
                      ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-emerald-600 text-xs">{ch.title}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                          isLightMode
                            ? 'bg-white text-amber-800 border-amber-300'
                            : 'bg-zinc-800 text-amber-300 border-zinc-700'
                        }`}
                      >
                        {ch.difficulty}
                      </span>
                    </div>
                    <p className="text-zinc-500 text-[11px] mb-2 leading-relaxed">{ch.description}</p>
                    <div
                      className={`p-1.5 rounded border text-[11px] mb-2 ${
                        isLightMode
                          ? 'bg-white border-slate-200 text-slate-700'
                          : 'bg-black/60 border-zinc-800/80 text-zinc-300'
                      }`}
                    >
                      <strong className="text-emerald-600">Goal:</strong> {ch.objective}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      SoundEngine.playClick();
                      onStartChallenge(ch);
                    }}
                    className={`w-full py-1.5 rounded font-bold flex items-center justify-center gap-1.5 cursor-pointer transition border ${
                      isLightMode
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-sm'
                        : 'bg-emerald-900/80 hover:bg-emerald-800 border-emerald-600 text-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isCurrent ? 'RESTART TRIAL' : 'LAUNCH TRIAL'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
