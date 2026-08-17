/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HistoryPoint } from '../types';

/**
 * Renders an ASCII / Braille time-series graph of population histories
 */
export function renderAsciiTimeSeries(
  points: HistoryPoint[],
  width: number = 48,
  height: number = 11,
  showWolves: boolean = false,
  isViewingPast: boolean = false
): string[] {
  if (!points || points.length === 0) {
    const empty = Array(height).fill(' '.repeat(width));
    empty.push('      Day 0'.padEnd(width + 6, ' '));
    return empty;
  }
  
  // Find max value for Y-axis scaling
  let maxVal = 50;
  for (const p of points) {
    if (p.rabbits > maxVal) maxVal = p.rabbits;
    if (p.foxes > maxVal) maxVal = p.foxes;
    if (showWolves && p.wolves > maxVal) maxVal = p.wolves;
  }
  maxVal = Math.ceil(maxVal / 10) * 10;
  if (maxVal < 20) maxVal = 20;

  // Grid lines initialization
  const chart: string[][] = Array.from({ length: height }, () => 
    Array.from({ length: width }, () => ' ')
  );

  // Background subtle guide grid lines
  for (let r = 0; r < height; r++) {
    if (r === height - 1) {
      for (let c = 0; c < width; c++) chart[r][c] = '─';
    } else if (r === Math.floor(height / 2)) {
      for (let c = 0; c < width; c++) chart[r][c] = '·';
    }
  }

  // Offset from right if not enough points yet
  const colOffset = width - points.length;

  // Plot lines for Rabbits, Foxes, Wolves and Event markers
  for (let i = 0; i < points.length; i++) {
    const col = colOffset + i;
    if (col < 0 || col >= width) continue;

    const pt = points[i];

    // Normalized Y coordinate (0 at bottom, height-1 at top)
    const normR = Math.min(1, Math.max(0, pt.rabbits / maxVal));
    const normF = Math.min(1, Math.max(0, pt.foxes / maxVal));
    const normW = Math.min(1, Math.max(0, pt.wolves / maxVal));

    const rowR = Math.max(0, Math.min(height - 1, height - 1 - Math.round(normR * (height - 1))));
    const rowF = Math.max(0, Math.min(height - 1, height - 1 - Math.round(normF * (height - 1))));
    const rowW = Math.max(0, Math.min(height - 1, height - 1 - Math.round(normW * (height - 1))));

    // Event markers at the top
    if (pt.eventDetails || pt.eventMarker) {
      let icon = '!';
      if (pt.eventDetails?.icon) {
        icon = pt.eventDetails.icon;
      } else if (pt.eventMarker) {
        icon = pt.eventMarker;
      }
      chart[0][col] = icon;
      // Dotted line down column if cell is blank
      for (let r = 1; r < height - 1; r++) {
        if (chart[r][col] === ' ' || chart[r][col] === '·') {
          chart[r][col] = '┊';
        }
      }
    }

    // Overlap handling:
    // Rabbit = 'r'
    // Fox = 'f'
    // Wolf = 'w'
    if (chart[rowR][col] === ' ' || chart[rowR][col] === '·' || chart[rowR][col] === '┊') {
      chart[rowR][col] = 'r';
    }
    
    if (showWolves && pt.wolves > 0) {
      if (chart[rowW][col] === 'r') chart[rowW][col] = 'X';
      else chart[rowW][col] = 'w';
    }

    if (chart[rowF][col] === 'r') chart[rowF][col] = 'X';
    else if (chart[rowF][col] === 'w') chart[rowF][col] = 'Ж';
    else chart[rowF][col] = 'f';
  }

  // Build string lines with Y axis labels
  const result: string[] = [];
  for (let r = 0; r < height; r++) {
    let yLabel = '';
    if (r === 0) {
      yLabel = `${maxVal}`.padStart(4, ' ') + ' │';
    } else if (r === Math.floor((height - 1) / 2)) {
      yLabel = `${Math.round(maxVal / 2)}`.padStart(4, ' ') + ' │';
    } else if (r === height - 1) {
      yLabel = '   0 └';
    } else {
      yLabel = '     │';
    }

    result.push(yLabel + chart[r].join(''));
  }

  // Add X axis timeline label at bottom
  const startDay = points.length > 0 ? points[0].day : 0;
  const endDay = points.length > 0 ? points[points.length - 1].day : 0;
  const pastTag = isViewingPast ? ' [PAST]' : ' [LIVE]';
  const bottomTimeline = `      Day ${startDay}`.padEnd(Math.floor(width / 2), ' ') + 
    `${pastTag} Day ${endDay}`.padStart(Math.ceil(width / 2) + 6, ' ');
  result.push(bottomTimeline);

  return result;
}

/**
 * Renders an ASCII Phase Portrait Orbit (Rabbits X-axis vs Foxes Y-axis)
 */
export function renderPhasePortrait(
  history: HistoryPoint[],
  eqR: number,
  eqF: number,
  width: number = 36,
  height: number = 14
): string[] {
  const chart: string[][] = Array.from({ length: height }, () => 
    Array.from({ length: width }, () => ' ')
  );

  // Find max values for R and F in history
  let maxR = Math.max(eqR * 1.6, 50);
  let maxF = Math.max(eqF * 1.6, 30);

  for (const p of history.slice(-120)) {
    if (p.rabbits > maxR) maxR = p.rabbits;
    if (p.foxes > maxF) maxF = p.foxes;
  }
  maxR = Math.ceil(maxR / 10) * 10;
  maxF = Math.ceil(maxF / 10) * 10;

  // Background subtle crosshair axes
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (r === height - 1 && c === 0) chart[r][c] = '└';
      else if (r === height - 1) chart[r][c] = '─';
      else if (c === 0) chart[r][c] = '│';
      else chart[r][c] = ' ';
    }
  }

  // Draw Isoclines
  // Fox isocline: vertical line at R = eqR
  if (eqR > 0 && maxR > 0) {
    const isoclineCol = Math.round((eqR / maxR) * (width - 2)) + 1;
    if (isoclineCol > 0 && isoclineCol < width) {
      for (let r = 0; r < height - 1; r++) {
        chart[r][isoclineCol] = '┆';
      }
    }
  }

  // Rabbit isocline: horizontal line at F = eqF
  if (eqF > 0 && maxF > 0) {
    const isoclineRow = height - 1 - Math.round((eqF / maxF) * (height - 2));
    if (isoclineRow >= 0 && isoclineRow < height - 1) {
      for (let c = 1; c < width; c++) {
        chart[isoclineRow][c] = '┄';
      }
    }
  }

  // Plot Equilibrium Point
  if (eqR > 0 && eqF > 0) {
    const eqCol = Math.round((eqR / maxR) * (width - 2)) + 1;
    const eqRow = height - 1 - Math.round((eqF / maxF) * (height - 2));
    if (eqRow >= 0 && eqRow < height - 1 && eqCol > 0 && eqCol < width) {
      chart[eqRow][eqCol] = '⊙';
    }
  }

  // Plot Trajectory Trail (recent ~60 points)
  const trajectory = history.slice(-70);
  for (let i = 0; i < trajectory.length; i++) {
    const pt = trajectory[i];
    const normX = Math.min(1, Math.max(0, pt.rabbits / maxR));
    const normY = Math.min(1, Math.max(0, pt.foxes / maxF));

    const col = Math.round(normX * (width - 2)) + 1;
    const row = height - 1 - Math.round(normY * (height - 2));

    if (row >= 0 && row < height - 1 && col > 0 && col < width) {
      // Latest point is brightest
      if (i === trajectory.length - 1) {
        chart[row][col] = '◆';
      } else if (i > trajectory.length - 10) {
        chart[row][col] = '●';
      } else if (i > trajectory.length - 30) {
        chart[row][col] = '•';
      } else {
        if (chart[row][col] === ' ' || chart[row][col] === '┆' || chart[row][col] === '┄') {
          chart[row][col] = '·';
        }
      }
    }
  }

  // Render to string lines
  const lines: string[] = [];
  for (let r = 0; r < height; r++) {
    let yTag = '     ';
    if (r === 0) yTag = `${maxF}`.padStart(4, ' ') + ' ';
    else if (r === Math.floor(height / 2)) yTag = 'Foxes';
    else if (r === height - 1) yTag = '   0 ';
    lines.push(yTag + chart[r].join(''));
  }

  lines.push(`       0 Rabbits (Prey) -> ${maxR}`.padEnd(width + 6, ' '));
  return lines;
}
