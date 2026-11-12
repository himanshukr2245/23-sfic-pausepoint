'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button, ButtonLink } from '@/components/ui/Button';

const DEFAULT_DEMO_URL = process.env.NEXT_PUBLIC_DEMO_VIDEO_URL || 'https://youtu.be/demo_pausepoint_sifc';

export default function DemoVideoPage() {
  const [countdown, setCountdown] = useState(4);
  const [isRedirectPaused, setIsRedirectPaused] = useState(false);
  const [isOnline, setIsOnline] = useState(() => (typeof window !== 'undefined' ? navigator.onLine : true));
  const [copiedLink, setCopiedLink] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setIsRedirectPaused(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Dynamic Auto-redirect countdown
  useEffect(() => {
    if (isRedirectPaused || !isOnline) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          window.location.href = DEFAULT_DEMO_URL;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRedirectPaused, isOnline]);

  const handlePause = () => {
    setIsRedirectPaused(true);
  };

  const handleOpenNow = () => {
    window.open(DEFAULT_DEMO_URL, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <main className="min-h-screen bg-bg text-fg px-4 py-8 md:py-16 flex flex-col items-center justify-center font-sans">
      <div className="max-w-3xl w-full space-y-6">
        
        {/* Top Header Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center shadow">
              <svg className="w-5 h-5 text-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-cyan bg-surface-3 border border-border px-2 py-0.5 rounded">
                  SIFC 2026 Jury Hub
                </span>
                <span className="text-xs font-semibold text-success bg-surface-3 border border-border px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  Live Redirect
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-fg mt-1">
                PausePoint Shield Demonstration
              </h1>
            </div>
          </div>

          <ButtonLink
            href="/"
            variant="quiet"
            size="sm"
            sound="tick"
            className="text-xs font-bold"
          >
            ← Back to Web App
          </ButtonLink>
        </div>

        {/* Dynamic Redirect Card */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-2xl backdrop-blur-xl">
          <div className="relative space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-cyan font-bold">
                  {isRedirectPaused ? 'Redirect Paused' : 'Automatic Forwarding Active'}
                </p>
                <h2 className="text-lg md:text-xl font-bold text-fg mt-0.5">
                  {isRedirectPaused ? (
                    'Viewing On-Page Jury Briefing'
                  ) : (
                    <>
                      Opening Live 90-Second Demo in{' '}
                      <span className="text-cyan font-mono text-2xl font-black">{countdown}s</span>
                    </>
                  )}
                </h2>
                <p className="text-xs text-fg-muted mt-1 max-w-xl">
                  This permanent link redirects judges to the latest high-resolution video walk-through without breaking QR codes printed on pitch decks or posters.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {!isRedirectPaused ? (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      sound="pop"
                      onClick={handlePause}
                      className="text-xs font-bold"
                    >
                      Pause Redirect & Stay
                    </Button>
                    <Button
                      variant="cyber-solid"
                      size="sm"
                      sound="laser"
                      onClick={handleOpenNow}
                      className="text-xs font-black flex items-center gap-1.5"
                    >
                      <span>Watch Demo Now</span>
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="cyber-solid"
                    size="sm"
                    sound="laser"
                    onClick={handleOpenNow}
                    className="text-xs font-black flex items-center gap-1.5"
                  >
                    <span>Open YouTube Video</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </Button>
                )}
              </div>
            </div>

            {/* Target Destination Indicator */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-2 border border-border font-mono text-xs text-fg-muted overflow-hidden">
              <span className="text-cyan font-bold shrink-0">DESTINATION:</span>
              <span className="truncate text-fg select-all">{DEFAULT_DEMO_URL}</span>
              <Button
                variant="quiet"
                size="sm"
                sound="tick"
                onClick={handleCopyLink}
                className="ml-auto shrink-0 text-[10px] font-sans font-bold px-2 py-0.5 rounded"
              >
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          </div>
        </div>

        {/* Standalone Native APK Direct Download */}
        <div className="rounded-2xl border border-border bg-surface-2 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-lg">🤖</span>
              <h3 className="text-base font-black text-fg">Standalone Android Release APK</h3>
              <span className="text-[10px] font-bold bg-surface-3 text-success border border-border px-2 py-0.5 rounded-full">
                v1.0 Signed (8.9 MB)
              </span>
            </div>
            <p className="text-xs text-fg-muted max-w-lg">
              Install the sovereign, 100% airgapped Kotlin APK directly on your Android phone. Fully obfuscated with ProGuard R8, zero network permissions, and instant on-device forensics.
            </p>
          </div>

          <ButtonLink
            href="/PausePoint-Shield-v1.0.apk"
            download="PausePoint-Shield-v1.0.apk"
            variant="primary"
            sound="chime"
            className="w-full md:w-auto shrink-0 px-5 py-2.5 text-xs font-black flex items-center justify-center gap-2 shadow"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download Shield APK</span>
          </ButtonLink>
        </div>

        {/* 3 Pillars of SIFC Jury Evaluation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          {/* Pillar 1 */}
          <div className="rounded-xl border border-border bg-surface p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-success font-bold text-sm">
              01
            </div>
            <h4 className="text-sm font-bold text-fg">Sovereign Airgap Architecture</h4>
            <p className="text-xs text-fg-muted leading-relaxed">
              No central database, no Firebase, and no cloud leaks. Runs with zero internet permission (<code className="text-success text-[10px]">tools:node=&quot;remove&quot;</code>) to preserve absolute citizen privacy.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="rounded-xl border border-border bg-surface p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-cyan font-bold text-sm">
              02
            </div>
            <h4 className="text-sm font-bold text-fg">Golden Hour 1930 Automation</h4>
            <p className="text-xs text-fg-muted leading-relaxed">
              Deconstructs SMS alerts and transaction receipts into 14-point structured dockets, isolating suspect UTRs and payee UPI handles in under 60 seconds.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-xl border border-border bg-surface p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-warning font-bold text-sm">
              03
            </div>
            <h4 className="text-sm font-bold text-fg">Section 63 BSA 2023 Stamp</h4>
            <p className="text-xs text-fg-muted leading-relaxed">
              Cryptographically hashes raw digital evidence on-device with SHA-256 and timestamps it for direct admissibility before cyber police and magistrates.
            </p>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-center pt-4 border-t border-border text-[11px] text-fg-muted font-mono">
          PausePoint Shield · SIFC 2026 Innovation Flagship · Built by Himanshu Kumar
        </div>

      </div>
    </main>
  );
}
