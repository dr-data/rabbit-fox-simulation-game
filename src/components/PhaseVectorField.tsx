/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { HistoryPoint, SimParameters } from '../types';
import { calculateEquilibrium } from '../utils/mathEngine';
import { Compass, Info, RotateCcw } from 'lucide-react';

interface PhaseVectorFieldProps {
  history: HistoryPoint[];
  currentRabbits: number;
  currentFoxes: number;
  params: SimParameters;
  isLightMode?: boolean;
}

export const PhaseVectorField: React.FC<PhaseVectorFieldProps> = ({
  history,
  currentRabbits,
  currentFoxes,
  params,
  isLightMode = false,
}) => {
  const eq = calculateEquilibrium(params);

  const width = 500;
  const height = 230;
  const padding = { top: 20, right: 25, bottom: 35, left: 45 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Max bounds
  const maxR = Math.max(eq.rabbitEq * 2.2, 160, currentRabbits * 1.3);
  const maxF = Math.max(eq.foxEq * 2.2, 50, currentFoxes * 1.3);

  const getX = (r: number) => padding.left + (Math.max(0, Math.min(maxR, r)) / maxR) * innerWidth;
  const getY = (f: number) => padding.top + innerHeight - (Math.max(0, Math.min(maxF, f)) / maxF) * innerHeight;

  // Generate vector field arrows on a 12x7 grid
  const vectorArrows = useMemo(() => {
    const cols = 14;
    const rows = 8;
    const arrows: {
      x: number;
      y: number;
      dx: number;
      dy: number;
      mag: number;
      r: number;
      f: number;
    }[] = [];

    for (let i = 1; i <= cols; i++) {
      const r = (i / (cols + 1)) * maxR;
      for (let j = 1; j <= rows; j++) {
        const f = (j / (rows + 1)) * maxF;

        // Compute derivatives
        const logisticTerm = params.useLogistic ? 1 - r / params.carryCapacityK : 1;
        const dR = params.alpha * r * logisticTerm - params.beta * r * f;
        const dF = params.delta * r * f - params.gamma * f;

        const mag = Math.sqrt(dR * dR + dF * dF);
        if (mag > 0.001) {
          // Normalize length to 10px
          const len = 10;
          const scaleX = innerWidth / maxR;
          const scaleY = innerHeight / maxF;
          const pixelDx = dR * scaleX;
          const pixelDy = -dF * scaleY; // Invert for screen coords
          const pixelMag = Math.sqrt(pixelDx * pixelDx + pixelDy * pixelDy);

          const normDx = (pixelDx / (pixelMag || 1)) * len;
          const normDy = (pixelDy / (pixelMag || 1)) * len;

          arrows.push({
            x: getX(r),
            y: getY(f),
            dx: normDx,
            dy: normDy,
            mag,
            r,
            f,
          });
        }
      }
    }
    return arrows;
  }, [maxR, maxF, params, innerWidth, innerHeight]);

  // Orbit path from history (last 70 points)
  const orbitPath = useMemo(() => {
    if (history.length < 2) return '';
    const slice = history.slice(-70);
    return slice
      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(pt.rabbits).toFixed(1)} ${getY(pt.foxes).toFixed(1)}`)
      .join(' ');
  }, [history, maxR, maxF]);

  // Nullclines
  // Prey Nullcline: dR/dt = 0 => F = (alpha / beta) * (1 - R/K)
  const preyNullclinePath = useMemo(() => {
    if (!params.useLogistic) {
      // Horizontal line F = alpha/beta
      const fVal = params.alpha / params.beta;
      return `M ${padding.left} ${getY(fVal)} L ${width - padding.right} ${getY(fVal)}`;
    }
    // Sloped line
    const r0 = 0;
    const f0 = params.alpha / params.beta;
    const rK = params.carryCapacityK;
    const fK = 0;
    return `M ${getX(r0)} ${getY(f0)} L ${getX(rK)} ${getY(fK)}`;
  }, [params, maxR, maxF]);

  // Predator Nullcline: dF/dt = 0 => R = gamma / delta (Vertical line)
  const predNullclinePath = useMemo(() => {
    const rVal = params.gamma / params.delta;
    return `M ${getX(rVal)} ${padding.top} L ${getX(rVal)} ${height - padding.bottom}`;
  }, [params, maxR, maxF]);

  return (
    <div className="flex flex-col gap-2 font-mono select-none">
      {/* Visual Vector Field Canvas */}
      <div
        className={`relative rounded border p-1 overflow-hidden transition-colors ${
          isLightMode ? 'bg-white border-slate-200' : 'bg-black/95 border-zinc-900'
        }`}
      >
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto block">
          <defs>
            <marker
              id="vectorArrow"
              viewBox="0 0 6 6"
              refX="5"
              refY="3"
              markerWidth="4"
              markerHeight="4"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 6 3 L 0 6 z" fill={isLightMode ? '#94a3b8' : '#334155'} />
            </marker>
          </defs>

          {/* Background Grid */}
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke={isLightMode ? '#cbd5e1' : '#334155'}
            strokeWidth="1.5"
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke={isLightMode ? '#cbd5e1' : '#334155'}
            strokeWidth="1.5"
          />

          {/* Vector flow arrows */}
          {vectorArrows.map((arrow, idx) => (
            <line
              key={idx}
              x1={arrow.x}
              y1={arrow.y}
              x2={arrow.x + arrow.dx}
              y2={arrow.y + arrow.dy}
              stroke={isLightMode ? '#94a3b8' : '#334155'}
              strokeWidth="1"
              markerEnd="url(#vectorArrow)"
              opacity={0.7}
            />
          ))}

          {/* Nullclines */}
          {/* Prey Nullcline (dR/dt = 0) */}
          <path
            d={preyNullclinePath}
            fill="none"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeDasharray="4,4"
            opacity={0.8}
          />
          {/* Predator Nullcline (dF/dt = 0) */}
          <path
            d={predNullclinePath}
            fill="none"
            stroke="#f97316"
            strokeWidth="1.5"
            strokeDasharray="4,4"
            opacity={0.8}
          />

          {/* Orbit Trail */}
          {orbitPath && (
            <path
              d={orbitPath}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.9}
            />
          )}

          {/* Equilibrium Point Center ⊙ */}
          <g>
            <circle
              cx={getX(eq.rabbitEq)}
              cy={getY(eq.foxEq)}
              r="6"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
            />
            <circle cx={getX(eq.rabbitEq)} cy={getY(eq.foxEq)} r="2" fill="#f59e0b" />
          </g>

          {/* Current State Marker ◆ */}
          <circle
            cx={getX(currentRabbits)}
            cy={getY(currentFoxes)}
            r="5"
            fill="#06b6d4"
            stroke="#ffffff"
            strokeWidth="1.5"
            className="animate-pulse"
          />

          {/* Axis Labels */}
          <text
            x={width / 2}
            y={height - 8}
            textAnchor="middle"
            fontSize="10"
            fill={isLightMode ? '#334155' : '#94a3b8'}
            fontFamily="monospace"
            fontWeight="bold"
          >
            Prey Population: Rabbits (R) →
          </text>

          <text
            x={14}
            y={height / 2}
            textAnchor="middle"
            fontSize="10"
            fill={isLightMode ? '#334155' : '#94a3b8'}
            fontFamily="monospace"
            fontWeight="bold"
            transform={`rotate(-90 14 ${height / 2})`}
          >
            Predators: Foxes (F) →
          </text>
        </svg>
      </div>

      {/* Legend & Intuitive Explanation */}
      <div
        className={`flex flex-wrap items-center justify-between text-[11px] px-1 gap-2 ${
          isLightMode ? 'text-slate-600' : 'text-zinc-400'
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <strong className="text-cyan-400">Current Orbit (R={Math.round(currentRabbits)}, F={Math.round(currentFoxes)})</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full border border-amber-400 bg-amber-400/20" />
            <span className="text-amber-400 font-semibold">Equilibrium Focus (R*={eq.rabbitEq}, F*={eq.foxEq})</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-emerald-500 inline-block" />
            <span className="text-emerald-500">dR/dt=0 Isocline</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-orange-500 inline-block" />
            <span className="text-orange-500">dF/dt=0 Isocline</span>
          </span>
        </div>
      </div>
    </div>
  );
};
