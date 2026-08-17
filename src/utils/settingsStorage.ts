/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EcosystemTool, UISettings } from '../types';

export const STORAGE_KEY_UI_SETTINGS = 'lotka_volterra_ui_settings_v1';

export const DEFAULT_ECOSYSTEM_TOOLS: EcosystemTool[] = [
  {
    id: 'tool-rabbit',
    name: 'Rabbit',
    emoji: '🐰',
    category: 'spawn',
    description: 'Spawns a cluster of fast-breeding prey rabbits (+4).',
    actionType: 'spawn_agent',
    targetSpecies: 'rabbits',
    potency: 4,
    color: '#10b981',
    enabled: true,
    isBuiltin: true,
  },
  {
    id: 'tool-fox',
    name: 'Fox',
    emoji: '🦊',
    category: 'spawn',
    description: 'Introduces a predator fox pair to hunt rabbits (+2).',
    actionType: 'spawn_agent',
    targetSpecies: 'foxes',
    potency: 2,
    color: '#f97316',
    enabled: true,
    isBuiltin: true,
  },
  {
    id: 'tool-wolf',
    name: 'Wolf',
    emoji: '🐺',
    category: 'spawn',
    description: 'Introduces an apex wolf pack into the trophic chain (+2).',
    actionType: 'spawn_agent',
    targetSpecies: 'wolves',
    potency: 2,
    color: '#f43f5e',
    enabled: true,
    isBuiltin: true,
  },
  {
    id: 'tool-carrot',
    name: 'Carrot',
    emoji: '🥕',
    category: 'prey_support',
    description: 'Drops nutritional food forage to boost local prey population (+3).',
    actionType: 'feed_prey',
    targetSpecies: 'rabbits',
    potency: 3,
    color: '#f59e0b',
    enabled: true,
    isBuiltin: true,
  },
  {
    id: 'tool-hunter',
    name: 'Apex Hunter',
    emoji: '🎯',
    category: 'predator_control',
    description: 'Predator for the predators: wildlife ranger culls overpopulated foxes and wolves (-3).',
    actionType: 'hunt_predators',
    targetSpecies: 'predators',
    potency: 3,
    radius: 3,
    color: '#ef4444',
    enabled: true,
    isBuiltin: true,
  },
  {
    id: 'tool-eagle',
    name: 'Apex Eagle',
    emoji: '🦅',
    category: 'predator_control',
    description: 'Airborne apex raptor swoops down to hunt foxes and overabundant prey (-2).',
    actionType: 'apex_predator',
    targetSpecies: 'predators',
    potency: 2,
    radius: 2,
    color: '#06b6d4',
    enabled: true,
    isBuiltin: true,
  },
  {
    id: 'tool-trap',
    name: 'Predator Trap',
    emoji: '🪤',
    category: 'predator_control',
    description: 'Mechanical humane cage trap that safely captures and relocates predatory foxes (-2).',
    actionType: 'predator_trap',
    targetSpecies: 'foxes',
    potency: 2,
    radius: 2,
    color: '#d97706',
    enabled: true,
    isBuiltin: true,
  },
  {
    id: 'tool-vaccine',
    name: 'Bio-Vaccine',
    emoji: '💉',
    category: 'environment',
    description: 'Clears active virulent contagion plague and protects the ecosystem.',
    actionType: 'bio_vaccine',
    targetSpecies: 'disease',
    potency: 1,
    color: '#a855f7',
    enabled: true,
    isBuiltin: true,
  },
  {
    id: 'tool-clover',
    name: 'Lush Clover',
    emoji: '🌿',
    category: 'prey_support',
    description: 'Super-dense patch of clover that rapidly expands rabbit carrying capacity (+6).',
    actionType: 'feed_prey',
    targetSpecies: 'rabbits',
    potency: 6,
    color: '#22c55e',
    enabled: false,
    isBuiltin: true,
  },
];

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
  tools: DEFAULT_ECOSYSTEM_TOOLS,
  defaultSelectedToolId: 'tool-rabbit',
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
    
    // Ensure all built-in tools exist if user has existing saved data
    let mergedTools: EcosystemTool[] = DEFAULT_ECOSYSTEM_TOOLS;
    if (Array.isArray(parsed.tools) && parsed.tools.length > 0) {
      const storedMap = new Map<string, EcosystemTool>(parsed.tools.map((t: EcosystemTool) => [t.id, t]));
      // Keep user modifications and any user custom tools
      mergedTools = [
        ...DEFAULT_ECOSYSTEM_TOOLS.map((defTool) => {
          const existing = storedMap.get(defTool.id);
          return existing ? { ...defTool, ...existing } : defTool;
        }),
        ...parsed.tools.filter((t: EcosystemTool) => !DEFAULT_ECOSYSTEM_TOOLS.some((d) => d.id === t.id)),
      ];
    }

    return {
      ...DEFAULT_UI_SETTINGS,
      ...parsed,
      tools: mergedTools,
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
