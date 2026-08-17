/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API Calming Organic Sound & Generative Ambient Music Synthesizer
let audioCtx: AudioContext | null = null;
let isMuted = false;
let isMusicMuted = false;
let sfxVolume = 0.35;
let musicVolume = 0.3;
let musicStyle: 'meadow' | 'zen' | 'ethereal' = 'meadow';

// Master gain nodes
let masterGainNode: GainNode | null = null;
let sfxGainNode: GainNode | null = null;
let musicGainNode: GainNode | null = null;

// Background music timer / state
let isMusicPlaying = false;
let musicTimerId: ReturnType<typeof setTimeout> | null = null;
let currentChordNodes: { osc: OscillatorNode; gain: GainNode }[] = [];

// Rate-limiting timestamps for SFX to avoid noise accumulation
let lastBirthTime = 0;
let lastPredationTime = 0;
let lastClickTime = 0;
let birthPitchIndex = 0;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      
      // Setup master routing
      masterGainNode = audioCtx.createGain();
      masterGainNode.gain.setValueAtTime(isMuted ? 0 : 1, audioCtx.currentTime);
      masterGainNode.connect(audioCtx.destination);

      sfxGainNode = audioCtx.createGain();
      sfxGainNode.gain.setValueAtTime(sfxVolume, audioCtx.currentTime);
      sfxGainNode.connect(masterGainNode);

      musicGainNode = audioCtx.createGain();
      musicGainNode.gain.setValueAtTime(isMusicMuted ? 0 : musicVolume, audioCtx.currentTime);
      musicGainNode.connect(masterGainNode);
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Pentatonic scales for soothing melodic generation
const PENTATONIC_MEADOW = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25]; // C4 to E5
const PENTATONIC_ZEN = [220.0, 246.94, 293.66, 329.63, 369.99, 440.0, 493.88, 587.33]; // A minor/dorian pentatonic
const PENTATONIC_ETHEREAL = [277.18, 311.13, 369.99, 415.3, 466.16, 554.37, 622.25]; // Db major pentatonic

export const SoundEngine = {
  init() {
    getAudioContext();
  },

  setMuted(muted: boolean) {
    isMuted = muted;
    if (masterGainNode && audioCtx) {
      const now = audioCtx.currentTime;
      masterGainNode.gain.cancelScheduledValues(now);
      masterGainNode.gain.linearRampToValueAtTime(isMuted ? 0 : 1, now + 0.1);
    }
    if (!isMuted && !isMusicPlaying && !isMusicMuted) {
      this.startAmbientMusic();
    }
  },

  getMuted(): boolean {
    return isMuted;
  },

  toggleMute(): boolean {
    this.setMuted(!isMuted);
    return isMuted;
  },

  setMusicMuted(muted: boolean) {
    isMusicMuted = muted;
    if (musicGainNode && audioCtx) {
      const now = audioCtx.currentTime;
      musicGainNode.gain.cancelScheduledValues(now);
      musicGainNode.gain.linearRampToValueAtTime(isMusicMuted ? 0 : musicVolume, now + 0.3);
    }
    if (!isMusicMuted && !isMusicPlaying) {
      this.startAmbientMusic();
    }
  },

  getMusicMuted(): boolean {
    return isMusicMuted;
  },

  toggleMusic(): boolean {
    this.setMusicMuted(!isMusicMuted);
    return isMusicMuted;
  },

  setSfxVolume(vol: number) {
    sfxVolume = Math.max(0, Math.min(1, vol));
    if (sfxGainNode && audioCtx) {
      sfxGainNode.gain.setValueAtTime(sfxVolume, audioCtx.currentTime);
    }
  },

  getSfxVolume(): number {
    return sfxVolume;
  },

  setMusicVolume(vol: number) {
    musicVolume = Math.max(0, Math.min(1, vol));
    if (musicGainNode && audioCtx && !isMusicMuted) {
      musicGainNode.gain.setValueAtTime(musicVolume, audioCtx.currentTime);
    }
  },

  getMusicVolume(): number {
    return musicVolume;
  },

  setMusicStyle(style: 'meadow' | 'zen' | 'ethereal') {
    musicStyle = style;
  },

  getMusicStyle(): 'meadow' | 'zen' | 'ethereal' {
    return musicStyle;
  },

  // -------------------------------------------------------------
  // GENERATIVE AMBIENT MUSIC ENGINE (Calming & Organic)
  // -------------------------------------------------------------
  startAmbientMusic() {
    if (isMusicPlaying || typeof window === 'undefined') return;
    isMusicPlaying = true;
    this.scheduleNextAmbientNote();
  },

  stopAmbientMusic() {
    isMusicPlaying = false;
    if (musicTimerId) {
      clearTimeout(musicTimerId);
      musicTimerId = null;
    }
    // Fade out any sustaining chord nodes
    if (audioCtx) {
      const now = audioCtx.currentTime;
      for (const node of currentChordNodes) {
        try {
          node.gain.gain.linearRampToValueAtTime(0.0001, now + 0.5);
          node.osc.stop(now + 0.5);
        } catch {
          // ignore
        }
      }
      currentChordNodes = [];
    }
  },

  scheduleNextAmbientNote() {
    if (!isMusicPlaying) return;

    try {
      const ctx = getAudioContext();
      if (ctx && !isMuted && !isMusicMuted) {
        const scale =
          musicStyle === 'zen'
            ? PENTATONIC_ZEN
            : musicStyle === 'ethereal'
            ? PENTATONIC_ETHEREAL
            : PENTATONIC_MEADOW;

        // Choose 1 or 2 harmonious notes
        const noteFreq = scale[Math.floor(Math.random() * scale.length)];
        const isHarmony = Math.random() > 0.65;
        const harmonyFreq = isHarmony ? scale[Math.floor(Math.random() * scale.length)] : null;

        const now = ctx.currentTime;
        const noteDuration = 2.2 + Math.random() * 1.5;

        // Gentle warm filtered tone (Sine with subtle triangle overtone)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(noteFreq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, now);
        filter.Q.setValueAtTime(1.0, now);

        // Soft ADSR envelope: Slow gentle attack, long soothing decay
        const attack = 0.3 + Math.random() * 0.2;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.04, now + attack);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + noteDuration);

        osc.connect(filter);
        filter.connect(gain);
        if (musicGainNode) {
          gain.connect(musicGainNode);
        } else {
          gain.connect(ctx.destination);
        }

        osc.start(now);
        osc.stop(now + noteDuration);

        // If harmony note
        if (harmonyFreq && harmonyFreq !== noteFreq) {
          const harmOsc = ctx.createOscillator();
          const harmGain = ctx.createGain();
          harmOsc.type = 'triangle';
          harmOsc.frequency.setValueAtTime(harmonyFreq, now + 0.1);
          harmGain.gain.setValueAtTime(0.0001, now + 0.1);
          harmGain.gain.linearRampToValueAtTime(0.02, now + attack + 0.1);
          harmGain.gain.exponentialRampToValueAtTime(0.0001, now + noteDuration);

          harmOsc.connect(filter);
          filter.connect(harmGain);
          if (musicGainNode) harmGain.connect(musicGainNode);

          harmOsc.start(now + 0.1);
          harmOsc.stop(now + noteDuration);
        }
      }
    } catch {
      // ignore
    }

    // Schedule next note with calm organic timing (1.8s - 3.4s)
    const nextInterval = 1800 + Math.random() * 1600;
    musicTimerId = setTimeout(() => {
      this.scheduleNextAmbientNote();
    }, nextInterval);
  },

  // -------------------------------------------------------------
  // SOUND EFFECTS (Calm, Harmonic, Throttled & Organic)
  // -------------------------------------------------------------

  // Soft melodic chime for birth (like a celesta bell / wind chime)
  playBirth() {
    if (isMuted) return;
    const nowMs = Date.now();
    // Rate limit to prevent buzzing machine gun during population spikes
    if (nowMs - lastBirthTime < 240) return;
    lastBirthTime = nowMs;

    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Rotate through pentatonic bells
      const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
      const freq = scale[birthPitchIndex % scale.length];
      birthPitchIndex++;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      if (sfxGainNode) gain.connect(sfxGainNode);
      else gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // silent fallback
    }
  },

  // Soft wooden / marimba pop for predation (no more harsh buzzy square waves!)
  playPredation() {
    if (isMuted) return;
    const nowMs = Date.now();
    // Rate limit to avoid continuous buzzing
    if (nowMs - lastPredationTime < 220) return;
    lastPredationTime = nowMs;

    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Warm triangle/sine marimba tap
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(190 + Math.random() * 30, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.08);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(filter);
      filter.connect(gain);
      if (sfxGainNode) gain.connect(sfxGainNode);
      else gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // ignore
    }
  },

  // Deep warm cinematic pad sweep for wolf howl
  playWolfHowl() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.2);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.55);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.035, now + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

      osc.connect(filter);
      filter.connect(gain);
      if (sfxGainNode) gain.connect(sfxGainNode);
      else gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);
    } catch {
      // ignore
    }
  },

  // Ultra-gentle subtle acoustic tap for UI clicks
  playClick() {
    if (isMuted) return;
    const nowMs = Date.now();
    if (nowMs - lastClickTime < 30) return;
    lastClickTime = nowMs;

    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.015);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

      osc.connect(gain);
      if (sfxGainNode) gain.connect(sfxGainNode);
      else gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.015);
    } catch {
      // ignore
    }
  },

  // Harmonic chime alert (gentle major triad)
  playAlarm() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [440, 554.37, 659.25]; // A4, C#5, E5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        const start = ctx.currentTime + idx * 0.05;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, start);

        gain.gain.setValueAtTime(0.035, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);

        osc.connect(filter);
        filter.connect(gain);
        if (sfxGainNode) gain.connect(sfxGainNode);
        else gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch {
      // ignore
    }
  },

  // Soft peaceful winter breeze
  playWinterWind() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const dur = 0.6;
      const bufferSize = Math.floor(ctx.sampleRate * dur);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      
      // Gentle pinkish noise
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.95 * b1 + white * 0.1;
        b2 = 0.85 * b2 + white * 0.2;
        output[i] = (b0 + b1 + b2) * 0.5;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, now);
      filter.frequency.linearRampToValueAtTime(160, now + dur);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      noise.connect(filter);
      filter.connect(gain);
      if (sfxGainNode) gain.connect(sfxGainNode);
      else gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + dur);
    } catch {
      // ignore
    }
  },

  // Uplifting soothing harp strum for Victory
  playVictory() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [392.0, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        const start = ctx.currentTime + idx * 0.08;
        const dur = 0.35;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, start);

        gain.gain.setValueAtTime(0.04, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

        osc.connect(filter);
        filter.connect(gain);
        if (sfxGainNode) gain.connect(sfxGainNode);
        else gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + dur);
      });
    } catch {
      // ignore
    }
  },

  // Soft mellow cello tone for Extinction / Game Over
  playGameOver() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [293.66, 261.63, 220.0, 174.61]; // D4, C4, A3, F3
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        const start = ctx.currentTime + idx * 0.14;
        const dur = 0.3;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, start);

        gain.gain.setValueAtTime(0.04, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

        osc.connect(filter);
        filter.connect(gain);
        if (sfxGainNode) gain.connect(sfxGainNode);
        else gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + dur);
      });
    } catch {
      // ignore
    }
  },

  // Soft organic wooden hit for Ranger
  playHunterShot() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

      osc.connect(filter);
      filter.connect(gain);
      if (sfxGainNode) gain.connect(sfxGainNode);
      else gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // ignore
    }
  },

  // Gentle harmonic aerial chime for eagle
  playEagleScreech() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.linearRampToValueAtTime(1100, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.2);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      osc.connect(filter);
      filter.connect(gain);
      if (sfxGainNode) gain.connect(sfxGainNode);
      else gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // ignore
    }
  },

  // Soft wooden trap click
  playTrapSnap() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.04);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      if (sfxGainNode) gain.connect(sfxGainNode);
      else gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // ignore
    }
  },

  // Sparkling celestial recovery chime
  playCureSparkle() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + idx * 0.04;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, start);

        gain.gain.setValueAtTime(0.03, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.15);

        osc.connect(gain);
        if (sfxGainNode) gain.connect(sfxGainNode);
        else gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.15);
      });
    } catch {
      // ignore
    }
  }
};
