'use client';

// components/ui/AudioEqualizerPill.tsx — Real-Time Procedural Audio Activity Visualizer & Mute Controller.
// Listens directly to Web Audio synthesized ticks/chimes with <1ms delay and animates 3 tactile equalizer bars.
import { useState, useEffect, useSyncExternalStore } from 'react';
import {
  subscribeAudioActivity,
  unlockAudio,
  playSuccessChime,
  setAudioMuted,
} from '@/lib/audio/synthesizer';

function subscribeMute(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('hk:sound-muted-changed', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('hk:sound-muted-changed', callback);
  };
}

function getMuteSnapshot(): boolean {
  try {
    return localStorage.getItem('hk-sound-muted') === 'true';
  } catch {
    return false;
  }
}

function getMuteServerSnapshot(): boolean {
  return false;
}

export function AudioEqualizerPill() {
  const [activePeak, setActivePeak] = useState(0);
  const muted = useSyncExternalStore(subscribeMute, getMuteSnapshot, getMuteServerSnapshot);

  useEffect(() => {
    // Subscribe to synthesizer micro-events
    const unsubscribe = subscribeAudioActivity((_type, peak) => {
      try {
        if (localStorage.getItem('hk-sound-muted') === 'true') return;
      } catch {
        // ignore
      }
      setActivePeak(peak);
      const timer = setTimeout(() => {
        setActivePeak(0);
      }, 160);
      return () => clearTimeout(timer);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  function toggleMute() {
    unlockAudio();
    const next = !muted;
    setAudioMuted(next);
    if (!next) {
      // Audible confirmation when unmuting
      playSuccessChime();
    }
  }

  return (
    <button
      type="button"
      onClick={toggleMute}
      suppressHydrationWarning
      title={muted ? 'Unmute procedural audio haptics' : 'Mute procedural audio haptics'}
      aria-label={muted ? 'Audio muted. Click to enable sound.' : 'Audio active. Click to mute sound.'}
      className={`group inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-mono transition-all duration-200 cursor-pointer ${
        muted
          ? 'border-border/60 bg-surface-2 text-fg-muted opacity-70 hover:opacity-100'
          : activePeak > 0
          ? 'border-cyan/50 bg-cyan/15 text-cyan shadow-cyan-soft'
          : 'border-border/80 bg-surface-2/60 text-fg-muted hover:text-fg hover:border-brand/40'
      }`}
    >
      {/* 3-Bar Audio Equalizer Visualizer */}
      <span className="flex items-end gap-[2px] h-3 w-3 py-[1px]">
        <span
          className={`w-[2px] rounded-full transition-all duration-100 ${
            muted
              ? 'h-1 bg-fg-muted/40'
              : activePeak > 0
              ? 'h-3 bg-cyan animate-pulse'
              : 'h-1.5 bg-fg-muted group-hover:bg-brand'
          }`}
        />
        <span
          className={`w-[2px] rounded-full transition-all duration-100 ${
            muted
              ? 'h-1 bg-fg-muted/40'
              : activePeak > 0
              ? 'h-2 bg-cyan animate-pulse'
              : 'h-2.5 bg-fg-muted group-hover:bg-brand'
          }`}
        />
        <span
          className={`w-[2px] rounded-full transition-all duration-100 ${
            muted
              ? 'h-1 bg-fg-muted/40'
              : activePeak > 0
              ? 'h-3 bg-cyan animate-pulse'
              : 'h-1 bg-fg-muted group-hover:bg-brand'
          }`}
        />
      </span>

      <span className="text-[10px] font-semibold tracking-tight hidden xl:inline">
        {muted ? 'Muted' : 'Audio'}
      </span>
    </button>
  );
}
