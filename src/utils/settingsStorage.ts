/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UISettings } from '../types';

export const STORAGE_KEY_UI_SETTINGS = 'lotka_volterra_ui_settings_v1';

export const DEFAULT_UI_SETTINGS: UISettings = {
  defaultTheme: 'phosphor-green',
  defaultViewMode: 'visual_chart',
  defaultGridRenderMode: 'graphic',
  defaultTimeSpeed: 1,
  crtEnabled: true,
  soundEnabled: true,
  showFpsCounter: true,
  particleDensity: 'high',
  autoSaveOnChange: true,
};

/**
 * Loads stored UI settings from localStorage or returns defaults
 */
export function loadUISettings(): UISettings {
  if (typeof window === 'undefined') return { ...DEFAULT_UI_SETTINGS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY_UI_SETTINGS);
    if (!raw) return { ...DEFAULT_UI_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_UI_SETTINGS,
      ...parsed,
    };
  } catch (e) {
    console.warn('Failed to load UI settings from localStorage, falling back to defaults:', e);
    return { ...DEFAULT_UI_SETTINGS };
  }
}

/**
 * Persists UI settings to localStorage
 */
export function saveUISettings(settings: UISettings): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(STORAGE_KEY_UI_SETTINGS, JSON.stringify(settings));
    return true;
  } catch (e) {
    console.error('Failed to save UI settings to localStorage:', e);
    return false;
  }
}

/**
 * Resets UI settings in localStorage to factory defaults
 */
export function resetUISettings(): UISettings {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY_UI_SETTINGS);
    } catch {}
  }
  return { ...DEFAULT_UI_SETTINGS };
}
