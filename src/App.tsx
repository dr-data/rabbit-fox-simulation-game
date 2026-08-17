/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChallengePreset,
  ColorTheme,
  GameMode,
  GridAgent,
  GridRenderMode,
  HistoryPoint,
  Particle,
  PlotViewMode,
  SimEvent,
  SimParameters,
  Species,
} from './types';
import { PRESET_MODELS } from './data/presets';
import { GAME_CHALLENGES } from './data/challenges';
import { calculateEquilibrium, calculateSeasonality, rk4Step, updateSpatialGrid } from './utils/mathEngine';
import { SoundEngine } from './utils/soundSynthesizer';
import { TerminalHeader } from './components/TerminalHeader';
import { EcosystemGrid } from './components/EcosystemGrid';
import { AsciiPlotPanel } from './components/AsciiPlotPanel';
import { ParameterPanel } from './components/ParameterPanel';
import { EventDeck } from './components/EventDeck';
import { ChallengeModal } from './components/ChallengeModal';
import { MathHelpModal } from './components/MathHelpModal';
import { ControlsFooter } from './components/ControlsFooter';

export default function App() {
  // 1. Simulation Mathematical Parameters
  const [params, setParams] = useState<SimParameters>(PRESET_MODELS[0].params);
  const [selectedParamIndex, setSelectedParamIndex] = useState<number>(0);

  // 2. Simulation State (ODE)
  const [day, setDay] = useState<number>(0);
  const [rabbits, setRabbits] = useState<number>(PRESET_MODELS[0].initial.rabbits);
  const [foxes, setFoxes] = useState<number>(PRESET_MODELS[0].initial.foxes);
  const [wolves, setWolves] = useState<number>(PRESET_MODELS[0].initial.wolves);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [timeSpeed, setTimeSpeed] = useState<number>(1);
  const [fps, setFps] = useState<number>(30);

  // 3. History timeline for charts
  const [history, setHistory] = useState<HistoryPoint[]>([]);

  // 4. Spatial 2D Grid Agents and Particles
  const [agents, setAgents] = useState<GridAgent[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);

  // 5. Game Mode & Challenge state
  const [gameMode, setGameMode] = useState<GameMode>('sandbox');
  const [activeChallenge, setActiveChallenge] = useState<ChallengePreset | null>(null);
  const [challengeStatus, setChallengeStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [challengeFailureReason, setChallengeFailureReason] = useState<string>('');

  // 6. Visual Settings & UI state
  const [viewMode, setViewMode] = useState<PlotViewMode>('visual_chart');
  const [gridRenderMode, setGridRenderMode] = useState<GridRenderMode>('graphic');
  const [theme, setTheme] = useState<ColorTheme>('phosphor-green');
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasDisease, setHasDisease] = useState<boolean>(false);
  const [diseaseTimer, setDiseaseTimer] = useState<number>(0);

  // Derive light mode flag
  const isLightMode = theme.startsWith('light-');

  // 7. Event Logs
  const [events, setEvents] = useState<SimEvent[]>([
    {
      id: 'init-1',
      day: 0,
      timeStr: 'Day 0',
      message: 'Lotka-Volterra Ecosystem Core initialized. RK4 Integrator & Dynamic Visualizers active.',
      type: 'info',
    },
  ]);

  // 8. Modals
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState<boolean>(false);
  const [isMathHelpOpen, setIsMathHelpOpen] = useState<boolean>(false);

  // Stable references for requestAnimationFrame loop
  const simRef = useRef({
    day,
    rabbits,
    foxes,
    wolves,
    params,
    isPaused,
    timeSpeed,
    history,
    agents,
    particles,
    activeChallenge,
    challengeStatus,
    hasDisease,
    diseaseTimer,
  });

  useEffect(() => {
    simRef.current = {
      day,
      rabbits,
      foxes,
      wolves,
      params,
      isPaused,
      timeSpeed,
      history,
      agents,
      particles,
      activeChallenge,
      challengeStatus,
      hasDisease,
      diseaseTimer,
    };
  });

  // Logging helper
  const addEventLog = useCallback((message: string, type: SimEvent['type'] = 'info') => {
    const curDay = Math.floor(simRef.current.day);
    const newEvent: SimEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      day: curDay,
      timeStr: `Day ${curDay}`,
      message,
      type,
    };
    setEvents((prev) => [...prev.slice(-40), newEvent]);
  }, []);

  // Reset Simulation
  const handleReset = useCallback(() => {
    const initial = activeChallenge
      ? activeChallenge.initialState
      : PRESET_MODELS[0].initial;

    setDay(0);
    setRabbits(initial.rabbits);
    setFoxes(initial.foxes);
    setWolves(initial.wolves);
    setHistory([]);
    setAgents([]);
    setParticles([]);
    setHasDisease(false);
    setDiseaseTimer(0);
    if (activeChallenge) {
      setChallengeStatus('playing');
      setChallengeFailureReason('');
    }
    addEventLog('Simulation reset to initial conditions.', 'info');
  }, [activeChallenge, addEventLog]);

  // Step 1 Day forward manually
  const handleStepForward = useCallback(() => {
    const { params, day: curDay, rabbits: curR, foxes: curF, wolves: curW } = simRef.current;
    const dt = 1.0; // 1 full day
    const nextState = rk4Step(
      { rabbits: curR, foxes: curF, wolves: curW },
      curDay,
      dt,
      params
    );

    const nextDay = curDay + dt;
    const { alphaT, season } = calculateSeasonality(
      nextDay,
      params.alpha,
      params.useSeasonality,
      params.seasonalityA,
      params.seasonalityPeriod
    );

    const { nextAgents, newParticles } = updateSpatialGrid(
      simRef.current.agents,
      { rabbits: nextState.rabbits, foxes: nextState.foxes, wolves: nextState.wolves },
      42,
      18
    );

    setDay(nextDay);
    setRabbits(nextState.rabbits);
    setFoxes(nextState.foxes);
    setWolves(nextState.wolves);
    setAgents(nextAgents);
    setParticles(newParticles);
    setHistory((prev) => [
      ...prev.slice(-100),
      {
        t: nextDay,
        day: Math.floor(nextDay),
        rabbits: Math.round(nextState.rabbits),
        foxes: Math.round(nextState.foxes),
        wolves: Math.round(nextState.wolves),
        alphaT,
        season,
      },
    ]);
    addEventLog(`Stepped forward to Day ${Math.floor(nextDay)}.`, 'info');
  }, [addEventLog]);

  // Auto-Balance / Set to theoretical equilibrium
  const handleSetToEquilibrium = useCallback(() => {
    const eq = calculateEquilibrium(params);
    setRabbits(eq.rabbitEq);
    setFoxes(eq.foxEq);
    if (params.useWolves) {
      setWolves(10);
    }
    addEventLog(`Populations locked to equilibrium center: R*=${eq.rabbitEq}, F*=${eq.foxEq}.`, 'success');
  }, [params, addEventLog]);

  // Toggle Light / Dark Mode
  const handleToggleLightDark = useCallback(() => {
    setTheme((cur) => (cur.startsWith('light-') ? 'phosphor-green' : 'light-lab'));
  }, []);

  // Load Preset
  const handleLoadPreset = (presetId: string) => {
    const found = PRESET_MODELS.find((p) => p.id === presetId);
    if (!found) return;
    setParams(found.params);
    setRabbits(found.initial.rabbits);
    setFoxes(found.initial.foxes);
    setWolves(found.initial.wolves);
    setDay(0);
    setHistory([]);
    setAgents([]);
    setParticles([]);
    setGameMode('sandbox');
    setActiveChallenge(null);
    setChallengeStatus('idle');
    addEventLog(`Loaded preset: ${found.name} (${found.tagline})`, 'success');
  };

  // Launch Challenge
  const handleStartChallenge = (ch: ChallengePreset) => {
    setActiveChallenge(ch);
    setGameMode('challenge');
    setParams((prev) => ({ ...prev, ...ch.initialState.params }));
    setRabbits(ch.initialState.rabbits);
    setFoxes(ch.initialState.foxes);
    setWolves(ch.initialState.wolves);
    setDay(0);
    setHistory([]);
    setAgents([]);
    setParticles([]);
    setChallengeStatus('playing');
    setChallengeFailureReason('');
    setIsChallengeModalOpen(false);
    addEventLog(`Trial Launched: ${ch.title}. ${ch.objective}`, 'alert');
  };

  // Event Triggers (Interventions)
  const handleTriggerEvent = (eventType: string) => {
    switch (eventType) {
      case 'disease': {
        setHasDisease(true);
        setDiseaseTimer(15);
        setRabbits((r) => Math.max(1, Math.round(r * 0.75)));
        SoundEngine.playAlarm();
        addEventLog(`Plague outbreak! Rabbit population decimated by 25%.`, 'danger');
        break;
      }
      case 'winter_shock': {
        SoundEngine.playWinterWind();
        setParams((p) => ({ ...p, alpha: Math.max(0.1, p.alpha * 0.6) }));
        const newSnow: Particle[] = Array.from({ length: 15 }, () => ({
          id: `snow-${Math.random()}`,
          x: Math.floor(Math.random() * 42),
          y: 0,
          char: Math.random() > 0.5 ? '❄' : '*',
          color: '#a5f3fc',
          life: 20,
          maxLife: 20,
          vx: (Math.random() - 0.5) * 0.2,
          vy: 0.5,
          type: 'snow',
        }));
        setParticles((prev) => [...prev, ...newSnow]);
        addEventLog(`Severe frost shock! Growth severely impaired.`, 'alert');
        break;
      }
      case 'carrots': {
        SoundEngine.playBirth();
        setRabbits((r) => r + 30);
        addEventLog(`Airdropped high-yield vegetation! +30 Rabbits.`, 'success');
        break;
      }
      case 'add_foxes': {
        SoundEngine.playClick();
        setFoxes((f) => f + 8);
        addEventLog(`Fox pack migrated into ecosystem! +8 Foxes.`, 'predation');
        break;
      }
      case 'add_wolves': {
        SoundEngine.playWolfHowl();
        setParams((p) => ({ ...p, useWolves: true }));
        setWolves((w) => w + 5);
        addEventLog(`Apex wolf pack released into habitat! +5 Wolves.`, 'danger');
        break;
      }
      case 'cull_rabbits': {
        SoundEngine.playClick();
        setRabbits((r) => Math.max(0, Math.round(r * 0.8)));
        addEventLog(`Prey culling conducted (-20% Rabbits).`, 'info');
        break;
      }
      case 'hunt_foxes': {
        SoundEngine.playClick();
        setFoxes((f) => Math.max(0, Math.round(f * 0.75)));
        if (params.useWolves) {
          setWolves((w) => Math.max(0, Math.round(w * 0.8)));
        }
        addEventLog(`Predator hunt conducted (-25% Foxes).`, 'info');
        break;
      }
      case 'random_shock': {
        SoundEngine.playAlarm();
        const shock = (Math.random() - 0.5) * 0.4;
        setParams((p) => ({ ...p, alpha: Math.max(0.2, Math.min(1.8, p.alpha + shock)) }));
        addEventLog(`Unpredictable climate anomaly altered growth rate to ${params.alpha.toFixed(2)}.`, 'event');
        break;
      }
    }
  };

  // Interactive Grid Spawn Agent
  const handleSpawnAgent = (type: Species, x: number, y: number) => {
    if (type === 'rabbit') {
      setRabbits((r) => r + 4);
      SoundEngine.playBirth();
    } else if (type === 'fox') {
      setFoxes((f) => f + 2);
      SoundEngine.playPredation();
    } else if (type === 'wolf') {
      setParams((p) => ({ ...p, useWolves: true }));
      setWolves((w) => w + 2);
      SoundEngine.playWolfHowl();
    }
  };

  // Interactive Grid Drop Carrots
  const handleDropCarrots = (x: number, y: number) => {
    SoundEngine.playBirth();
    setRabbits((r) => r + 3);
    setParticles((prev) => [
      ...prev,
      {
        id: `carrot-${Date.now()}`,
        x,
        y,
        char: '✦',
        color: '#f59e0b',
        life: 10,
        maxLife: 10,
        vx: 0,
        vy: -0.2,
        type: 'carrots',
      },
    ]);
  };

  // Parameter update helper
  const handleUpdateParam = <K extends keyof SimParameters>(key: K, value: SimParameters[K]) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  // Main Simulation Loop
  useEffect(() => {
    let frameCount = 0;
    let fpsTimer = performance.now();

    const interval = setInterval(() => {
      const {
        isPaused,
        timeSpeed,
        params,
        day: curDay,
        rabbits: curR,
        foxes: curF,
        wolves: curW,
        activeChallenge,
        challengeStatus,
        diseaseTimer: curDiseaseTimer,
      } = simRef.current;

      if (isPaused) return;

      // 1. RK4 Time step (scaled by timeSpeed)
      const dt = 0.08 * timeSpeed;
      const nextState = rk4Step(
        { rabbits: curR, foxes: curF, wolves: curW },
        curDay,
        dt,
        params
      );

      const nextDay = curDay + dt;

      // Seasonality info
      const { alphaT, season } = calculateSeasonality(
        nextDay,
        params.alpha,
        params.useSeasonality,
        params.seasonalityA,
        params.seasonalityPeriod
      );

      // 2. Disease timer countdown
      let nextDiseaseTimer = curDiseaseTimer;
      let nextHasDisease = simRef.current.hasDisease;
      if (nextHasDisease) {
        nextDiseaseTimer -= dt;
        if (nextDiseaseTimer <= 0) {
          nextHasDisease = false;
          nextDiseaseTimer = 0;
          addEventLog('Plague outbreak has naturally subsided.', 'info');
        }
      }

      // 3. Update spatial grid & agent graphics
      const { nextAgents, newParticles } = updateSpatialGrid(
        simRef.current.agents,
        { rabbits: nextState.rabbits, foxes: nextState.foxes, wolves: nextState.wolves },
        42,
        18,
        (type) => {
          if (type === 'predation' && Math.random() > 0.7) SoundEngine.playPredation();
          else if (type === 'birth' && Math.random() > 0.8) SoundEngine.playBirth();
        }
      );

      // 4. Update particles (decay life, move)
      const updatedParticles = [
        ...simRef.current.particles
          .map((p) => ({
            ...p,
            life: p.life - 1,
            x: p.x + p.vx,
            y: p.y + p.vy,
          }))
          .filter((p) => p.life > 0),
        ...newParticles,
      ];

      // 5. Check Challenge Win/Loss conditions
      if (activeChallenge && challengeStatus === 'playing') {
        const { limits, targetDays } = activeChallenge;

        let failed = false;
        let reason = '';

        if (limits.minR !== undefined && nextState.rabbits < limits.minR) {
          failed = true;
          reason = `Rabbits fell below threshold (${Math.round(nextState.rabbits)} < ${limits.minR})`;
        } else if (limits.maxR !== undefined && nextState.rabbits > limits.maxR) {
          failed = true;
          reason = `Rabbits overpopulated habitat (${Math.round(nextState.rabbits)} > ${limits.maxR})`;
        } else if (limits.minF !== undefined && nextState.foxes < limits.minF) {
          failed = true;
          reason = `Foxes starved / went extinct (${Math.round(nextState.foxes)} < ${limits.minF})`;
        } else if (limits.maxF !== undefined && nextState.foxes > limits.maxF) {
          failed = true;
          reason = `Foxes overpopulated (${Math.round(nextState.foxes)} > ${limits.maxF})`;
        } else if (params.useWolves && limits.minW !== undefined && nextState.wolves < limits.minW) {
          failed = true;
          reason = `Wolves went extinct (${Math.round(nextState.wolves)} < ${limits.minW})`;
        }

        if (failed) {
          setChallengeStatus('lost');
          setChallengeFailureReason(reason);
          SoundEngine.playGameOver();
          addEventLog(`CHALLENGE FAILED: ${reason}`, 'danger');
        } else if (nextDay >= targetDays) {
          setChallengeStatus('won');
          SoundEngine.playVictory();
          addEventLog(`VICTORY! Target of ${targetDays} days achieved!`, 'success');
        }
      }

      // Check Extinction in Sandbox
      if (
        !activeChallenge &&
        curR > 0 &&
        nextState.rabbits <= 0 &&
        curF > 0
      ) {
        SoundEngine.playGameOver();
        addEventLog('CRITICAL: Prey species has gone completely extinct!', 'danger');
      }

      // 6. Commit state updates
      setDay(nextDay);
      setRabbits(nextState.rabbits);
      setFoxes(nextState.foxes);
      setWolves(nextState.wolves);
      setAgents(nextAgents);
      setParticles(updatedParticles);
      setHasDisease(nextHasDisease);
      setDiseaseTimer(nextDiseaseTimer);

      // Record history sample periodically (~every 0.4 days)
      if (Math.floor(nextDay * 2.5) !== Math.floor(curDay * 2.5)) {
        setHistory((prev) => [
          ...prev.slice(-120),
          {
            t: nextDay,
            day: Math.floor(nextDay),
            rabbits: Math.round(nextState.rabbits),
            foxes: Math.round(nextState.foxes),
            wolves: Math.round(nextState.wolves),
            alphaT,
            season,
          },
        ]);
      }

      // FPS tracking
      frameCount++;
      const now = performance.now();
      if (now - fpsTimer >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - fpsTimer)));
        frameCount = 0;
        fpsTimer = now;
      }
    }, 45); // ~22 updates/sec

    return () => clearInterval(interval);
  }, [addEventLog]);

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          SoundEngine.playClick();
          setIsPaused((p) => !p);
          break;
        case 'KeyR':
          e.preventDefault();
          SoundEngine.playClick();
          handleReset();
          break;
        case 'KeyM':
          e.preventDefault();
          SoundEngine.playClick();
          setIsChallengeModalOpen((o) => !o);
          break;
        case 'KeyH':
        case 'Slash':
          e.preventDefault();
          SoundEngine.playClick();
          setIsMathHelpOpen((o) => !o);
          break;
        case 'KeyS':
          e.preventDefault();
          SoundEngine.playClick();
          setTimeSpeed((s) => (s === 1 ? 2 : s === 2 ? 5 : s === 5 ? 0.5 : 1));
          break;
        case 'Digit1':
          e.preventDefault();
          SoundEngine.playClick();
          setViewMode('visual_chart');
          break;
        case 'Digit2':
          e.preventDefault();
          SoundEngine.playClick();
          setViewMode('phase_portrait');
          break;
        case 'Digit3':
          e.preventDefault();
          SoundEngine.playClick();
          setViewMode('cycle_explainer');
          break;
        case 'Digit4':
          e.preventDefault();
          SoundEngine.playClick();
          setViewMode('timeseries');
          break;
        case 'Digit5':
          e.preventDefault();
          SoundEngine.playClick();
          setViewMode('math_inspector');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          SoundEngine.playClick();
          setSelectedParamIndex((idx) => (idx > 0 ? idx - 1 : 11));
          break;
        case 'ArrowRight':
          e.preventDefault();
          SoundEngine.playClick();
          setSelectedParamIndex((idx) => (idx < 11 ? idx + 1 : 0));
          break;
        case 'Escape':
          setIsChallengeModalOpen(false);
          setIsMathHelpOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleReset]);

  // Derive theme class wrapper
  const getThemeWrapperClass = () => {
    switch (theme) {
      case 'light-lab':
        return 'bg-slate-100 text-slate-900';
      case 'light-paper':
        return 'bg-amber-50/70 text-stone-900';
      case 'amber-crt':
        return 'bg-black text-amber-300';
      case 'cyber-neon':
        return 'bg-black text-cyan-300';
      case 'arctic-ice':
        return 'bg-black text-sky-200';
      case 'matrix-dark':
        return 'bg-black text-green-400';
      default:
        return 'bg-black text-emerald-300';
    }
  };

  const { alphaT: currentAlphaT, season: currentSeason } = calculateSeasonality(
    day,
    params.alpha,
    params.useSeasonality,
    params.seasonalityA,
    params.seasonalityPeriod
  );

  return (
    <div
      className={`min-h-screen flex flex-col justify-between font-mono relative overflow-hidden transition-colors duration-200 ${getThemeWrapperClass()}`}
    >
      {/* Optional CRT Overlay Scanlines & Vignette (Dark modes only) */}
      {!isLightMode && crtEnabled && <div className="crt-overlay fixed inset-0 z-40 pointer-events-none" />}
      {!isLightMode && crtEnabled && <div className="crt-vignette fixed inset-0 z-40 pointer-events-none" />}

      {/* Main Terminal Header */}
      <TerminalHeader
        day={day}
        timeSpeed={timeSpeed}
        isPaused={isPaused}
        gameMode={gameMode}
        season={currentSeason}
        alphaEffective={currentAlphaT}
        rabbits={rabbits}
        foxes={foxes}
        wolves={wolves}
        useWolves={params.useWolves}
        crtEnabled={crtEnabled}
        isMuted={isMuted}
        theme={theme}
        fps={fps}
        isLightMode={isLightMode}
        onTogglePause={() => setIsPaused((p) => !p)}
        onStepForward={handleStepForward}
        onCycleSpeed={() => setTimeSpeed((s) => (s === 1 ? 2 : s === 2 ? 5 : s === 5 ? 0.5 : 1))}
        onReset={handleReset}
        onToggleCrt={() => setCrtEnabled((c) => !c)}
        onToggleMute={() => setIsMuted(SoundEngine.toggleMute())}
        onChangeTheme={(th) => setTheme(th)}
        onToggleLightDark={handleToggleLightDark}
        onOpenChallenges={() => setIsChallengeModalOpen(true)}
        onOpenMathHelp={() => setIsMathHelpOpen(true)}
      />

      {/* Main Content Multi-Panel HUD Layout */}
      <main className="flex-1 p-2 sm:p-3 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3">
        {/* Left Column: Animated 2D Ecosystem Grid + Event Deck */}
        <div className="lg:col-span-6 flex flex-col gap-2 sm:gap-3">
          <EcosystemGrid
            agents={agents}
            particles={particles}
            season={currentSeason}
            gridWidth={42}
            gridHeight={18}
            rabbits={rabbits}
            foxes={foxes}
            wolves={wolves}
            hasDisease={hasDisease}
            isLightMode={isLightMode}
            renderMode={gridRenderMode}
            onChangeRenderMode={(m) => setGridRenderMode(m)}
            onSpawnAgent={handleSpawnAgent}
            onDropCarrots={handleDropCarrots}
          />
          <EventDeck
            events={events}
            isLightMode={isLightMode}
            onTriggerEvent={handleTriggerEvent}
            onClearLog={() => setEvents([])}
            isWolvesActive={params.useWolves}
          />
        </div>

        {/* Right Column: Dynamics Visualizer (Visual Chart / Vector Field / Explainer / ASCII / Math) + Parameter Controls */}
        <div className="lg:col-span-6 flex flex-col gap-2 sm:gap-3">
          <AsciiPlotPanel
            history={history}
            currentRabbits={rabbits}
            currentFoxes={foxes}
            currentWolves={wolves}
            day={day}
            params={params}
            viewMode={viewMode}
            isLightMode={isLightMode}
            onSetViewMode={(m) => setViewMode(m)}
          />
          <ParameterPanel
            params={params}
            selectedParamIndex={selectedParamIndex}
            isLightMode={isLightMode}
            onSelectParamIndex={(idx) => setSelectedParamIndex(idx)}
            onUpdateParam={handleUpdateParam}
            onLoadPreset={handleLoadPreset}
            onSetToEquilibrium={handleSetToEquilibrium}
          />
        </div>
      </main>

      {/* Bottom Footer & Hotkey legend */}
      <ControlsFooter isLightMode={isLightMode} />

      {/* Modals */}
      <ChallengeModal
        isOpen={isChallengeModalOpen}
        activeChallenge={activeChallenge}
        day={day}
        rabbits={rabbits}
        foxes={foxes}
        wolves={wolves}
        challengeStatus={challengeStatus}
        failureReason={challengeFailureReason}
        isLightMode={isLightMode}
        onClose={() => setIsChallengeModalOpen(false)}
        onStartChallenge={handleStartChallenge}
        onRestartCurrent={handleReset}
        onSwitchToSandbox={() => {
          setGameMode('sandbox');
          setActiveChallenge(null);
          setChallengeStatus('idle');
          setIsChallengeModalOpen(false);
          addEventLog('Returned to free Sandbox mode.', 'info');
        }}
      />

      <MathHelpModal
        isOpen={isMathHelpOpen}
        isLightMode={isLightMode}
        onClose={() => setIsMathHelpOpen(false)}
      />
    </div>
  );
}
