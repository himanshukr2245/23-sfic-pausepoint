// lib/audio/synthesizer.ts — Zero-asset procedural Web Audio synthesizer (PRF-3, PRF-5).
// Generates audible, silky micro-haptic sound feedback with 0 network bytes.

type AudioActivityListener = (type: string, peak: number) => void;
const listeners = new Set<AudioActivityListener>();

export function subscribeAudioActivity(listener: AudioActivityListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Check if audio haptics are muted in user preferences */
export function isAudioMuted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('hk-sound-muted') === 'true';
  } catch {
    return false;
  }
}

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

function notifyActivity(type: string, peak = 1) {
  if (isAudioMuted()) return;
  for (const fn of listeners) {
    try {
      fn(type, peak);
    } catch {
      // Ignore listener error
    }
  }
}

/** Get or initialize the unified AudioContext and MasterGainNode */
function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      const muted = isAudioMuted();
      masterGain.gain.setValueAtTime(muted ? 0 : 1, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
    }
  }

  if (audioCtx && audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }

  return audioCtx;
}

/** Set audio haptics muted state in user preferences and clamp MasterGainNode */
export function setAudioMuted(muted: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('hk-sound-muted', String(muted));
    window.dispatchEvent(new Event('hk:sound-muted-changed'));
  } catch {
    // ignore
  }

  if (masterGain && audioCtx) {
    try {
      const now = audioCtx.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(masterGain.gain.value, now);
      masterGain.gain.linearRampToValueAtTime(muted ? 0 : 1, now + 0.015);
    } catch {
      // ignore
    }
  }
}

/** Ensure browser audio context is unlocked by user gesture */
export function unlockAudio() {
  const ctx = getContext();
  if (ctx && ctx.state === 'suspended') {
    void ctx.resume();
  }
}

// Auto-unlock on first user interaction in browser
if (typeof window !== 'undefined') {
  const unlockEvents = ['pointerdown', 'touchstart', 'keydown', 'click'];
  const onFirstInteraction = () => {
    unlockAudio();
    unlockEvents.forEach((evt) => {
      window.removeEventListener(evt, onFirstInteraction, { capture: true });
    });
  };
  unlockEvents.forEach((evt) => {
    window.addEventListener(evt, onFirstInteraction, { capture: true, passive: true });
  });
}

/** Safe dispatcher that ensures audio context is running before scheduling */
function runWithContext(fn: (ctx: AudioContext, destination: AudioNode) => void) {
  if (isAudioMuted()) return;
  const ctx = getContext();
  if (!ctx || !masterGain) return;

  if (ctx.state === 'suspended') {
    void ctx.resume().then(() => {
      if (!isAudioMuted() && masterGain) {
        fn(ctx, masterGain);
      }
    });
    return;
  }

  fn(ctx, masterGain);
}

/** 1. Crisp physical mechanical switch click (audible on laptop speakers) */
export function playHapticTick() {
  if (isAudioMuted()) return;
  notifyActivity('tick', 0.85);

  runWithContext((ctx, destination) => {
    const now = ctx.currentTime;

    // Transient snap
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1100, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.045);

    gain.gain.setValueAtTime(0.38, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(destination);

    // Warm body resonance for laptop speakers
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();

    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(320, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(120, now + 0.035);

    bodyGain.gain.setValueAtTime(0.22, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(destination);

    osc.start(now);
    osc.stop(now + 0.045);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.035);
  });
}

/** 2. Harmonious crystal accomplishment chime (dual frequency E6 & B6) */
export function playSuccessChime() {
  if (isAudioMuted()) return;
  notifyActivity('chime', 1.0);

  runWithContext((ctx, destination) => {
    const now = ctx.currentTime;
    const notes = [
      { freq: 1318.51, delay: 0, duration: 0.42, vol: 0.32 },    // E6
      { freq: 1975.53, delay: 0.05, duration: 0.48, vol: 0.28 }, // B6
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, now + note.delay);

      gain.gain.setValueAtTime(note.vol, now + note.delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.delay + note.duration);

      osc.connect(gain);
      gain.connect(destination);

      osc.start(now + note.delay);
      osc.stop(now + note.delay + note.duration);
    });
  });
}

/** 3. Punchy sub-bass tactile thud (low-frequency physical bump) */
export function playSubBassThud() {
  if (isAudioMuted()) return;
  notifyActivity('thud', 0.95);

  runWithContext((ctx, destination) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.14);

    gain.gain.setValueAtTime(0.42, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now);
    osc.stop(now + 0.14);
  });
}

/** 4. Hyper-fast modern laser sweep (future UI micro-zip) */
export function playLaserZip() {
  if (isAudioMuted()) return;
  notifyActivity('laser', 0.9);

  runWithContext((ctx, destination) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(2600, now + 0.09);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now);
    osc.stop(now + 0.09);
  });
}

/** 5. Bubbly fluid toggle pop */
export function playPop() {
  if (isAudioMuted()) return;
  notifyActivity('pop', 0.8);

  runWithContext((ctx, destination) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now);
    osc.stop(now + 0.06);
  });
}
