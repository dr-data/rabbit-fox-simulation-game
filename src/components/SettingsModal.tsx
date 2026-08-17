/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ColorTheme, EcosystemTool, GridRenderMode, ParticleDensity, PlotViewMode, ToolActionType, UISettings } from '../types';
import { SoundEngine } from '../utils/soundSynthesizer';
import { DEFAULT_ECOSYSTEM_TOOLS } from '../utils/settingsStorage';
import {
  Settings,
  X,
  Palette,
  Layout,
  Tv,
  Volume2,
  VolumeX,
  RotateCcw,
  Check,
  Zap,
  Activity,
  Sparkles,
  Monitor,
  AreaChart,
  Compass,
  BookOpen,
  Terminal,
  Binary,
  Sun,
  Moon,
  Crosshair,
  Plus,
  Trash2,
  Sliders,
  ShieldAlert,
  Feather,
  Heart,
  Wrench,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  isLightMode: boolean;
  currentSettings: UISettings;
  onClose: () => void;
  onApplySettings: (settings: UISettings, savePermanent: boolean) => void;
  onResetDefaults: () => void;
}

const THEME_OPTIONS: Array<{
  id: ColorTheme;
  name: string;
  category: 'Light' | 'Dark Retro';
  desc: string;
  bgHex: string;
  accentHex: string;
  borderHex: string;
  textColor: string;
}> = [
  {
    id: 'light-lab',
    name: 'Light Academic Lab',
    category: 'Light',
    desc: 'High-contrast clean white and emerald lab dashboard',
    bgHex: '#ffffff',
    accentHex: '#059669',
    borderHex: '#cbd5e1',
    textColor: '#1e293b',
  },
  {
    id: 'light-paper',
    name: 'Field Biology Paper',
    category: 'Light',
    desc: 'Warm parchment paper aesthetic with vintage ink',
    bgHex: '#fefce8',
    accentHex: '#d97706',
    borderHex: '#e2e8f0',
    textColor: '#292524',
  },
  {
    id: 'phosphor-green',
    name: 'Phosphor Green CRT',
    category: 'Dark Retro',
    desc: 'Classic VT100 / Apple II emerald luminescence',
    bgHex: '#000000',
    accentHex: '#10b981',
    borderHex: '#064e3b',
    textColor: '#6ee7b7',
  },
  {
    id: 'amber-crt',
    name: 'Amber CRT Terminal',
    category: 'Dark Retro',
    desc: 'Warm monochrome amber glow from vintage mainframes',
    bgHex: '#000000',
    accentHex: '#f59e0b',
    borderHex: '#78350f',
    textColor: '#fcd34d',
  },
  {
    id: 'cyber-neon',
    name: 'Cyberpunk Neon',
    category: 'Dark Retro',
    desc: 'Vibrant cyan, magenta, and electric violet',
    bgHex: '#05050f',
    accentHex: '#06b6d4',
    borderHex: '#4c1d95',
    textColor: '#67e8f9',
  },
  {
    id: 'arctic-ice',
    name: 'Arctic Ice Polar',
    category: 'Dark Retro',
    desc: 'Crisp deep-sea sapphire with frosty blue highlights',
    bgHex: '#030712',
    accentHex: '#38bdf8',
    borderHex: '#0c4a6e',
    textColor: '#bae6fd',
  },
  {
    id: 'matrix-dark',
    name: 'Matrix Obsidian',
    category: 'Dark Retro',
    desc: 'Pitch-black obsidian with sharp laser matrix green',
    bgHex: '#000000',
    accentHex: '#22c55e',
    borderHex: '#14532d',
    textColor: '#86efac',
  },
];

const VIEW_MODE_OPTIONS: Array<{
  id: PlotViewMode;
  num: string;
  name: string;
  desc: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'visual_chart',
    num: '[1]',
    name: 'Visual Chart',
    desc: 'Smooth SVG population time series with area fills & event pins',
    icon: <AreaChart className="w-4 h-4 text-emerald-500" />,
  },
  {
    id: 'phase_portrait',
    num: '[2]',
    name: 'Vector Field',
    desc: '2D phase space orbit (Rabbits vs Foxes) with dynamic velocity flow',
    icon: <Compass className="w-4 h-4 text-cyan-500" />,
  },
  {
    id: 'cycle_explainer',
    num: '[3]',
    name: 'Cycle Guide',
    desc: 'Intuitive 4-stage biological cycle tracker & quadrant breakdown',
    icon: <BookOpen className="w-4 h-4 text-amber-500" />,
  },
  {
    id: 'timeseries',
    num: '[4]',
    name: 'ASCII Plot',
    desc: 'Retro monospace scrolling terminal graph with historical scrubber',
    icon: <Terminal className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'math_inspector',
    num: '[5]',
    name: 'Math/ODE',
    desc: 'Analytical rate equations, real-time derivatives & Jacobian matrix',
    icon: <Binary className="w-4 h-4 text-purple-400" />,
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  isLightMode,
  currentSettings,
  onClose,
  onApplySettings,
  onResetDefaults,
}) => {
  const [tempSettings, setTempSettings] = useState<UISettings>(currentSettings);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);
  const [isAddingCustomTool, setIsAddingCustomTool] = useState<boolean>(false);

  // New Custom Tool Form State
  const [customName, setCustomName] = useState<string>('Forest Ranger');
  const [customEmoji, setCustomEmoji] = useState<string>('🎯');
  const [customAction, setCustomAction] = useState<ToolActionType>('hunt_predators');
  const [customTarget, setCustomTarget] = useState<'predators' | 'foxes' | 'wolves' | 'rabbits' | 'all' | 'disease'>('predators');
  const [customPotency, setCustomPotency] = useState<number>(3);
  const [customDesc, setCustomDesc] = useState<string>('Apex predator control: culls surplus foxes & wolves to protect prey.');
  const [customColor, setCustomColor] = useState<string>('#ef4444');

  const toolsList = tempSettings.tools || DEFAULT_ECOSYSTEM_TOOLS;

  // Sync temp settings when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTempSettings(currentSettings);
      setSavedNotice(false);
      setIsAddingCustomTool(false);
    }
  }, [isOpen, currentSettings]);

  if (!isOpen) return null;

  const handleUpdate = <K extends keyof UISettings>(key: K, value: UISettings[K]) => {
    const next = { ...tempSettings, [key]: value };
    setTempSettings(next);
    // Apply live immediately so user previews changes
    onApplySettings(next, next.autoSaveOnChange);
    if (next.autoSaveOnChange) {
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    }
  };

  const handleToggleTool = (toolId: string) => {
    SoundEngine.playClick();
    const updated = toolsList.map((t) => (t.id === toolId ? { ...t, enabled: !t.enabled } : t));
    handleUpdate('tools', updated);
  };

  const handleUpdateToolPotency = (toolId: string, potency: number) => {
    const updated = toolsList.map((t) => (t.id === toolId ? { ...t, potency } : t));
    handleUpdate('tools', updated);
  };

  const handleUpdateToolTarget = (toolId: string, targetSpecies: any) => {
    SoundEngine.playClick();
    const updated = toolsList.map((t) => (t.id === toolId ? { ...t, targetSpecies } : t));
    handleUpdate('tools', updated);
  };

  const handleDeleteTool = (toolId: string) => {
    SoundEngine.playClick();
    const updated = toolsList.filter((t) => t.id !== toolId);
    handleUpdate('tools', updated);
  };

  const handleResetTools = () => {
    SoundEngine.playClick();
    handleUpdate('tools', DEFAULT_ECOSYSTEM_TOOLS);
  };

  const handleCreateCustomTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    SoundEngine.playBirth();
    const newTool: EcosystemTool = {
      id: `custom-tool-${Date.now()}`,
      name: customName.trim(),
      emoji: customEmoji || '🎯',
      category: customAction === 'hunt_predators' || customAction === 'apex_predator' || customAction === 'predator_trap'
        ? 'predator_control'
        : customAction === 'feed_prey'
        ? 'prey_support'
        : customAction === 'bio_vaccine'
        ? 'environment'
        : 'spawn',
      description: customDesc.trim() || `${customName} ecological intervention.`,
      actionType: customAction,
      targetSpecies: customTarget,
      potency: customPotency,
      color: customColor,
      enabled: true,
      isBuiltin: false,
    };

    const nextTools = [...toolsList, newTool];
    handleUpdate('tools', nextTools);
    setIsAddingCustomTool(false);
    // Reset form defaults
    setCustomName('');
    setCustomDesc('');
  };

  const handleSaveDefaults = () => {
    SoundEngine.playBirth();
    onApplySettings(tempSettings, true);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleReset = () => {
    SoundEngine.playClick();
    onResetDefaults();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs font-mono">
      <div
        className={`w-full max-w-3xl max-h-[92vh] flex flex-col rounded-lg border shadow-2xl overflow-hidden transition-colors ${
          isLightMode
            ? 'bg-white border-slate-300 text-slate-800 shadow-slate-400/30'
            : 'bg-zinc-950 border-emerald-800 text-zinc-200 shadow-emerald-950/50'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-4 py-3 border-b ${
            isLightMode ? 'border-slate-200 bg-slate-50' : 'border-emerald-900/60 bg-zinc-900/80'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-emerald-500/20 text-emerald-500 border border-emerald-500/40">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-wide">
                DEFAULT UI STYLE & DISPLAY PREFERENCES
              </h2>
              <p className="text-[11px] text-zinc-500">
                Configure your preferred startup theme, visualizer tab, rendering modes, and sensory effects.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              SoundEngine.playClick();
              onClose();
            }}
            className={`p-1.5 rounded border transition cursor-pointer ${
              isLightMode
                ? 'hover:bg-slate-200 border-slate-300 text-slate-600'
                : 'hover:bg-zinc-800 border-zinc-700 text-zinc-400'
            }`}
            title="Close Settings (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Settings Form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
          {/* SECTION 1: COLOR PALETTE & THEME */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-emerald-500">
                <Palette className="w-3.5 h-3.5" />
                <span>1. DEFAULT COLOR PALETTE & THEME</span>
              </span>
              <span className="text-[11px] text-zinc-500">Applies instantly</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {THEME_OPTIONS.map((th) => {
                const isSelected = tempSettings.defaultTheme === th.id;
                return (
                  <button
                    key={th.id}
                    onClick={() => {
                      SoundEngine.playClick();
                      handleUpdate('defaultTheme', th.id);
                    }}
                    className={`p-2.5 rounded border text-left flex items-center justify-between gap-2 cursor-pointer transition relative ${
                      isSelected
                        ? isLightMode
                          ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/40'
                          : 'border-emerald-400 bg-emerald-950/40 ring-2 ring-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                        : isLightMode
                        ? 'border-slate-200 bg-white hover:border-slate-300'
                        : 'border-zinc-800 bg-zinc-900/70 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Mini visual swatch badge */}
                      <div
                        className="w-7 h-7 rounded border flex items-center justify-center shrink-0 shadow-inner"
                        style={{
                          backgroundColor: th.bgHex,
                          borderColor: th.borderHex,
                          color: th.accentHex,
                        }}
                      >
                        {th.category === 'Light' ? (
                          <Sun className="w-3.5 h-3.5" />
                        ) : (
                          <Moon className="w-3.5 h-3.5" />
                        )}
                      </div>

                      <div>
                        <div className="font-bold text-[12px] flex items-center gap-1.5">
                          <span>{th.name}</span>
                          <span
                            className={`text-[9px] px-1 py-0.2 rounded border uppercase ${
                              th.category === 'Light'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                            }`}
                          >
                            {th.category}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-500 leading-tight mt-0.5">
                          {th.desc}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: DEFAULT VISUALIZER TAB */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/40">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-cyan-500">
                <Layout className="w-3.5 h-3.5" />
                <span>2. DEFAULT DYNAMICS VISUALIZER TAB</span>
              </span>
              <span className="text-[11px] text-zinc-500">Select initial panel on launch</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {VIEW_MODE_OPTIONS.map((vm) => {
                const isSelected = tempSettings.defaultViewMode === vm.id;
                return (
                  <button
                    key={vm.id}
                    onClick={() => {
                      SoundEngine.playClick();
                      handleUpdate('defaultViewMode', vm.id);
                    }}
                    className={`p-2 rounded border text-left flex flex-col justify-between gap-1 cursor-pointer transition ${
                      isSelected
                        ? isLightMode
                          ? 'border-cyan-600 bg-cyan-50 text-cyan-900 ring-2 ring-cyan-500/30'
                          : 'border-cyan-400 bg-cyan-950/40 text-cyan-200 ring-2 ring-cyan-500/30'
                        : isLightMode
                        ? 'border-slate-200 bg-white hover:border-slate-300'
                        : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {vm.icon}
                        <span className="font-bold text-[11px]">
                          {vm.num} {vm.name}
                        </span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-500" />}
                    </div>
                    <p className="text-[10px] text-zinc-500 line-clamp-2 mt-0.5">
                      {vm.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: HABITAT RENDER STYLE & SIMULATION SPEED */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800/40">
            {/* Grid Render Mode */}
            <div className="space-y-1.5">
              <span className="font-bold flex items-center gap-1.5 text-amber-500">
                <Monitor className="w-3.5 h-3.5" />
                <span>3. DEFAULT HABITAT RENDER STYLE</span>
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => {
                    SoundEngine.playClick();
                    handleUpdate('defaultGridRenderMode', 'graphic');
                  }}
                  className={`p-2 rounded border text-left cursor-pointer transition flex items-center justify-between ${
                    tempSettings.defaultGridRenderMode === 'graphic'
                      ? isLightMode
                        ? 'border-amber-600 bg-amber-50 font-bold'
                        : 'border-amber-500 bg-amber-950/40 font-bold text-amber-300'
                      : isLightMode
                      ? 'border-slate-200 bg-white'
                      : 'border-zinc-800 bg-zinc-900/60'
                  }`}
                >
                  <div>
                    <div className="text-[11px]">🎨 Graphic Avatars</div>
                    <div className="text-[9px] text-zinc-500">Smooth 2D badges & FX</div>
                  </div>
                  {tempSettings.defaultGridRenderMode === 'graphic' && (
                    <Check className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </button>

                <button
                  onClick={() => {
                    SoundEngine.playClick();
                    handleUpdate('defaultGridRenderMode', 'ascii');
                  }}
                  className={`p-2 rounded border text-left cursor-pointer transition flex items-center justify-between ${
                    tempSettings.defaultGridRenderMode === 'ascii'
                      ? isLightMode
                        ? 'border-amber-600 bg-amber-50 font-bold'
                        : 'border-amber-500 bg-amber-950/40 font-bold text-amber-300'
                      : isLightMode
                      ? 'border-slate-200 bg-white'
                      : 'border-zinc-800 bg-zinc-900/60'
                  }`}
                >
                  <div>
                    <div className="text-[11px]">📟 Monospace ASCII</div>
                    <div className="text-[9px] text-zinc-500">Pure terminal matrix</div>
                  </div>
                  {tempSettings.defaultGridRenderMode === 'ascii' && (
                    <Check className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Default Clock Speed */}
            <div className="space-y-1.5">
              <span className="font-bold flex items-center gap-1.5 text-purple-500">
                <Zap className="w-3.5 h-3.5" />
                <span>4. DEFAULT SIMULATION SPEED</span>
              </span>
              <div className="grid grid-cols-4 gap-1">
                {[0.5, 1, 2, 5].map((spd) => {
                  const isSelected = tempSettings.defaultTimeSpeed === spd;
                  return (
                    <button
                      key={spd}
                      onClick={() => {
                        SoundEngine.playClick();
                        handleUpdate('defaultTimeSpeed', spd);
                      }}
                      className={`py-1.5 px-1 rounded border text-center font-bold text-[11px] cursor-pointer transition ${
                        isSelected
                          ? isLightMode
                            ? 'border-purple-600 bg-purple-100 text-purple-900'
                            : 'border-purple-400 bg-purple-950/60 text-purple-300'
                          : isLightMode
                          ? 'border-slate-200 bg-white text-slate-600'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      {spd}x
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 4: DISPLAY, SENSORY & SPLAY EFFECTS */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/40">
            <span className="font-bold flex items-center gap-1.5 text-emerald-500">
              <Tv className="w-3.5 h-3.5" />
              <span>5. SENSORY & SCREEN EFFECTS</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* CRT Toggle */}
              <div
                className={`p-2.5 rounded border flex items-center justify-between gap-2 ${
                  isLightMode ? 'border-slate-200 bg-slate-50' : 'border-zinc-800 bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-zinc-400" />
                  <div>
                    <div className="font-bold text-[11px]">CRT Scanlines</div>
                    <div className="text-[9px] text-zinc-500">Vintage screen phosphor</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={tempSettings.crtEnabled}
                  onChange={(e) => {
                    SoundEngine.playClick();
                    handleUpdate('crtEnabled', e.target.checked);
                  }}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Sound Synthesizer Toggle */}
              <div
                className={`p-2.5 rounded border flex items-center justify-between gap-2 ${
                  isLightMode ? 'border-slate-200 bg-slate-50' : 'border-zinc-800 bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  {tempSettings.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-zinc-500" />
                  )}
                  <div>
                    <div className="font-bold text-[11px]">8-Bit Audio Synth</div>
                    <div className="text-[9px] text-zinc-500">Sound cues & alerts</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={tempSettings.soundEnabled}
                  onChange={(e) => {
                    SoundEngine.playClick();
                    handleUpdate('soundEnabled', e.target.checked);
                  }}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* FPS Counter Toggle */}
              <div
                className={`p-2.5 rounded border flex items-center justify-between gap-2 ${
                  isLightMode ? 'border-slate-200 bg-slate-50' : 'border-zinc-800 bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-zinc-400" />
                  <div>
                    <div className="font-bold text-[11px]">FPS Performance</div>
                    <div className="text-[9px] text-zinc-500">Top bar live monitor</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={tempSettings.showFpsCounter}
                  onChange={(e) => {
                    SoundEngine.playClick();
                    handleUpdate('showFpsCounter', e.target.checked);
                  }}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: PARTICLE DENSITY & STORAGE PERSISTENCE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800/40">
            {/* Particle Density */}
            <div className="space-y-1.5">
              <span className="font-bold flex items-center gap-1.5 text-zinc-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>PARTICLE DENSITY (Weather & Birth FX)</span>
              </span>
              <div className="grid grid-cols-3 gap-1">
                {(['high', 'medium', 'low'] as ParticleDensity[]).map((den) => (
                  <button
                    key={den}
                    onClick={() => {
                      SoundEngine.playClick();
                      handleUpdate('particleDensity', den);
                    }}
                    className={`py-1 rounded border text-center capitalize text-[10px] cursor-pointer transition ${
                      tempSettings.particleDensity === den
                        ? isLightMode
                          ? 'border-amber-600 bg-amber-100 text-amber-900 font-bold'
                          : 'border-amber-400 bg-amber-950/60 text-amber-300 font-bold'
                        : isLightMode
                        ? 'border-slate-200 bg-white text-slate-600'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    {den}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto Save Toggle */}
            <div
              className={`p-2 rounded border flex items-center justify-between gap-2 ${
                isLightMode ? 'border-slate-200 bg-slate-50' : 'border-zinc-800 bg-zinc-900/60'
              }`}
            >
              <div>
                <div className="font-bold text-[11px]">Auto-Save to LocalStorage</div>
                <div className="text-[9px] text-zinc-500">Persists changes as future default</div>
              </div>
              <input
                type="checkbox"
                checked={tempSettings.autoSaveOnChange}
                onChange={(e) => {
                  SoundEngine.playClick();
                  handleUpdate('autoSaveOnChange', e.target.checked);
                }}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* SECTION 6: HABITAT TOOLS & PREDATOR INTERVENTIONS */}
          <div className="space-y-3 pt-3 border-t border-zinc-800/40">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Crosshair className="w-4 h-4 text-rose-500" />
                <span className="font-bold text-xs uppercase tracking-wider text-rose-400">
                  6. HABITAT TOOLS & PREDATOR CONTROLS (Predators of Predators)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetTools}
                  className={`text-[10px] px-2 py-0.5 rounded border transition cursor-pointer flex items-center gap-1 ${
                    isLightMode
                      ? 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-600'
                      : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
                  }`}
                  title="Reset tools list to default configuration"
                >
                  <RotateCcw className="w-3 h-3 text-zinc-400" />
                  <span>Reset Tools</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    SoundEngine.playClick();
                    setIsAddingCustomTool((prev) => !prev);
                  }}
                  className="text-[10px] px-2.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isAddingCustomTool ? 'Close Form' : 'Add Custom Tool'}</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Enable, disable, or adjust interactive habitat god-tools — including apex hunters and rangers that cull surplus predators (foxes & wolves), traps, and custom ecological interventions.
            </p>

            {/* Custom Tool Creation Form */}
            {isAddingCustomTool && (
              <form
                onSubmit={handleCreateCustomTool}
                className={`p-3 rounded-lg border space-y-2.5 shadow-md ${
                  isLightMode
                    ? 'bg-rose-50/50 border-rose-200 text-slate-800'
                    : 'bg-rose-950/20 border-rose-900/60 text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between border-b pb-1.5 border-rose-900/30">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" />
                    CREATE NEW ECOSYSTEM TOOL
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingCustomTool(false)}
                    className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Tool Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold block">TOOL NAME</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Grizzly Bear / Forest Ranger"
                      required
                      className={`w-full px-2 py-1 rounded text-xs border outline-hidden font-mono ${
                        isLightMode
                          ? 'bg-white border-slate-300 text-slate-800'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-rose-500'
                      }`}
                    />
                  </div>

                  {/* Emoji Preset Buttons */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold block">EMOJI ICON</label>
                    <div className="flex items-center gap-1 flex-wrap">
                      {['🎯', '🦅', '🐻', '🏹', '🪤', '💉', '🌿', '⚡', '🐾', '🪓', '🔔', '🐺', '🦁', '🦊', '🐰'].map(
                        (em) => (
                          <button
                            key={em}
                            type="button"
                            onClick={() => {
                              SoundEngine.playClick();
                              setCustomEmoji(em);
                            }}
                            className={`w-6 h-6 rounded border text-xs flex items-center justify-center cursor-pointer transition ${
                              customEmoji === em
                                ? 'border-rose-500 bg-rose-500/20 scale-110 font-bold'
                                : 'border-zinc-700 hover:bg-zinc-800'
                            }`}
                          >
                            {em}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Action Type */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold block">ACTION EFFECT</label>
                    <select
                      value={customAction}
                      onChange={(e) => {
                        const act = e.target.value as ToolActionType;
                        setCustomAction(act);
                        if (act === 'hunt_predators') {
                          setCustomTarget('predators');
                          setCustomDesc('Apex predator control: culls surplus foxes & wolves to protect prey.');
                        } else if (act === 'apex_predator') {
                          setCustomTarget('predators');
                          setCustomDesc('Airborne apex predator hunts foxes and rabbits.');
                        } else if (act === 'predator_trap') {
                          setCustomTarget('foxes');
                          setCustomDesc('Traps and relocates predatory foxes.');
                        } else if (act === 'bio_vaccine') {
                          setCustomTarget('disease');
                          setCustomDesc('Cures disease contagion and boosts herd immunity.');
                        } else if (act === 'feed_prey') {
                          setCustomTarget('rabbits');
                          setCustomDesc('Provides nutrition to accelerate prey reproduction.');
                        }
                      }}
                      className={`w-full px-2 py-1 rounded text-xs border outline-hidden font-mono ${
                        isLightMode
                          ? 'bg-white border-slate-300 text-slate-800'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-rose-500'
                      }`}
                    >
                      <option value="hunt_predators">🎯 Hunt Predators (Apex Hunter / Ranger Cull)</option>
                      <option value="apex_predator">🦅 Apex Raptor (Preys on predators & prey)</option>
                      <option value="predator_trap">🪤 Predator Trap (Humane capture/relocation)</option>
                      <option value="spawn_agent">🐰 Spawn Species Population</option>
                      <option value="feed_prey">🥕 Feed Prey / Nutrition Forage</option>
                      <option value="bio_vaccine">💉 Bio-Vaccine / Cure Pathogen</option>
                      <option value="custom_cull">🪓 Custom Cull</option>
                      <option value="custom_boost">✨ Custom Population Boost</option>
                    </select>
                  </div>

                  {/* Target Species */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold block">TARGET SPECIES</label>
                    <select
                      value={customTarget}
                      onChange={(e) => setCustomTarget(e.target.value as any)}
                      className={`w-full px-2 py-1 rounded text-xs border outline-hidden font-mono ${
                        isLightMode
                          ? 'bg-white border-slate-300 text-slate-800'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-rose-500'
                      }`}
                    >
                      <option value="predators">🦊🐺 All Predators (Foxes & Wolves)</option>
                      <option value="foxes">🦊 Foxes Only</option>
                      <option value="wolves">🐺 Wolves Only</option>
                      <option value="rabbits">🐰 Rabbits (Prey)</option>
                      <option value="disease">☣ Virulent Disease</option>
                      <option value="all">🌐 All Species</option>
                    </select>
                  </div>

                  {/* Potency */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-zinc-400 font-bold">POTENCY / IMPACT</span>
                      <span className="text-rose-400 font-bold">{customPotency} animals</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={12}
                      step={1}
                      value={customPotency}
                      onChange={(e) => setCustomPotency(Number(e.target.value))}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold block">DESCRIPTION</label>
                    <input
                      type="text"
                      value={customDesc}
                      onChange={(e) => setCustomDesc(e.target.value)}
                      placeholder="Short explanation of what the tool does"
                      className={`w-full px-2 py-1 rounded text-xs border outline-hidden font-mono ${
                        isLightMode
                          ? 'bg-white border-slate-300 text-slate-800'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-rose-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingCustomTool(false)}
                    className="px-2.5 py-1 rounded border text-xs text-zinc-400 hover:text-zinc-200 border-zinc-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-md"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Tool to Habitat</span>
                  </button>
                </div>
              </form>
            )}

            {/* List of Configured Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {toolsList.map((tool) => {
                const isPredatorControl =
                  tool.actionType === 'hunt_predators' ||
                  tool.actionType === 'apex_predator' ||
                  tool.actionType === 'predator_trap';

                return (
                  <div
                    key={tool.id}
                    className={`p-2.5 rounded-lg border transition-all flex flex-col justify-between gap-1.5 ${
                      tool.enabled
                        ? isLightMode
                          ? isPredatorControl
                            ? 'bg-rose-50/40 border-rose-300 text-slate-800'
                            : 'bg-emerald-50/30 border-emerald-300 text-slate-800'
                          : isPredatorControl
                          ? 'bg-rose-950/20 border-rose-900/60 text-zinc-200'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-200'
                        : isLightMode
                        ? 'bg-slate-100/50 border-slate-200 text-slate-400 opacity-60'
                        : 'bg-zinc-950 border-zinc-900 text-zinc-600 opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{tool.emoji}</span>
                        <div>
                          <div className="font-bold text-xs flex items-center gap-1.5">
                            <span>{tool.name}</span>
                            {isPredatorControl && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                Apex Predator Control
                              </span>
                            )}
                            {tool.actionType === 'feed_prey' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                Prey Support
                              </span>
                            )}
                            {tool.actionType === 'bio_vaccine' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                Vaccine
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">{tool.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <label className="flex items-center gap-1 text-[10px] cursor-pointer font-bold">
                          <input
                            type="checkbox"
                            checked={tool.enabled}
                            onChange={() => handleToggleTool(tool.id)}
                            className="w-3.5 h-3.5 accent-emerald-500 cursor-pointer"
                          />
                          <span className={tool.enabled ? 'text-emerald-500' : 'text-zinc-500'}>
                            {tool.enabled ? 'Active' : 'Off'}
                          </span>
                        </label>
                        {!tool.isBuiltin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTool(tool.id)}
                            className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition cursor-pointer"
                            title="Delete custom tool"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Tool Potency & Target Settings */}
                    <div
                      className={`flex items-center justify-between pt-1 border-t text-[10px] ${
                        isLightMode ? 'border-slate-200' : 'border-zinc-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-500">Target:</span>
                        <select
                          value={tool.targetSpecies}
                          onChange={(e) => handleUpdateToolTarget(tool.id, e.target.value)}
                          className={`px-1 py-0.5 rounded text-[10px] border outline-hidden font-mono ${
                            isLightMode
                              ? 'bg-white border-slate-300 text-slate-700'
                              : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                          }`}
                        >
                          <option value="predators">🦊🐺 Predators</option>
                          <option value="foxes">🦊 Foxes</option>
                          <option value="wolves">🐺 Wolves</option>
                          <option value="rabbits">🐰 Rabbits</option>
                          <option value="disease">☣ Disease</option>
                          <option value="all">🌐 All</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-500">Potency:</span>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={tool.potency || 1}
                          onChange={(e) => handleUpdateToolPotency(tool.id, Math.max(1, Number(e.target.value) || 1))}
                          className={`w-12 px-1 py-0.5 rounded text-[10px] border text-center font-bold ${
                            isLightMode
                              ? 'bg-white border-slate-300 text-slate-800'
                              : 'bg-zinc-900 border-zinc-700 text-zinc-200'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions & Save Confirmation */}
        <div
          className={`flex flex-wrap items-center justify-between px-4 py-2.5 border-t gap-2 ${
            isLightMode ? 'border-slate-200 bg-slate-50' : 'border-emerald-900/60 bg-zinc-900/90'
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className={`px-2.5 py-1 rounded border flex items-center gap-1.5 text-xs cursor-pointer transition ${
                isLightMode
                  ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                  : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
              title="Reset all preferences to factory defaults"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Reset Defaults</span>
            </button>

            {savedNotice && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 animate-pulse">
                <Check className="w-3.5 h-3.5" />
                Saved & Applied!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveDefaults}
              className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save As Default</span>
            </button>

            <button
              onClick={() => {
                SoundEngine.playClick();
                onClose();
              }}
              className={`px-3 py-1 rounded border text-xs font-bold cursor-pointer transition ${
                isLightMode
                  ? 'border-slate-300 bg-slate-200 text-slate-800 hover:bg-slate-300'
                  : 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
              }`}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
