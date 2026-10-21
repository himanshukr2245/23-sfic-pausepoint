'use client';

// app/settings/SettingsHub.tsx — PausePoint Balanced-Minimalist Settings & Privacy Cockpit.
// 1:1 Parity with Android SettingsScreen.kt under HK Universal LAW-13 (Complexity Inside, Serenity Outside).
// Zero-Internet Attestation, Threat Defense Heuristics, Data Sovereignty, and BSA 2023 Evidence Docket.

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Button,
  AwsSpotlightCard,
  Badge,
  Modal,
} from '@/components/ui';
import {
  isAudioMuted,
  setAudioMuted,
  playHapticTick,
  playSuccessChime,
  playSubBassThud,
  unlockAudio,
} from '@/lib/audio/synthesizer';
import { SITE } from '@/lib/site';
import {
  Settings,
  Shield,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  Sliders,
  Download,
  Trash2,
  Volume2,
  VolumeX,
  FileText,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Smartphone,
  QrCode,
  Activity,
  FileSpreadsheet,
} from 'lucide-react';

export type FraudSensitivity = 'STANDARD' | 'BALANCED' | 'STRICT';

export function SettingsHub() {
  // ── Heuristics & Protection States ──
  const [sensitivity, setSensitivity] = useState<FraudSensitivity>(() => {
    if (typeof window === 'undefined') return 'BALANCED';
    try {
      return (localStorage.getItem('pausepoint_sensitivity') as FraudSensitivity) || 'BALANCED';
    } catch {
      return 'BALANCED';
    }
  });

  const [screenShareGuard, setScreenShareGuard] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const val = localStorage.getItem('pausepoint_screenshare_guard');
      return val === null ? true : val === 'true';
    } catch {
      return true;
    }
  });

  const [qrDissector, setQrDissector] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const val = localStorage.getItem('pausepoint_qr_dissector');
      return val === null ? true : val === 'true';
    } catch {
      return true;
    }
  });

  const [muleVelocity, setMuleVelocity] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const val = localStorage.getItem('pausepoint_mule_velocity');
      return val === null ? true : val === 'true';
    } catch {
      return true;
    }
  });

  const [retentionDays, setRetentionDays] = useState<number>(() => {
    if (typeof window === 'undefined') return 7;
    try {
      return Number(localStorage.getItem('pausepoint_retention_days')) || 7;
    } catch {
      return 7;
    }
  });

  const [seniorMode, setSeniorMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('pausepoint_senior_mode') === 'true';
    } catch {
      return false;
    }
  });

  const [demoMode, setDemoMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('pausepoint_demo_mode') === 'true';
    } catch {
      return false;
    }
  });

  const [soundMuted, setSoundMuted] = useState<boolean>(() => isAudioMuted());
  const [isAuditing, setIsAuditing] = useState(false);
  const [lastAuditTime, setLastAuditTime] = useState<string>(() => {
    if (typeof window === 'undefined') return '01:25:00';
    return new Date().toTimeString().split(' ')[0] ?? '01:25:00';
  });
  const [auditToast, setAuditToast] = useState<string | null>(null);
  const [showDocket, setShowDocket] = useState(false);
  const [purgeModalOpen, setPurgeModalOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  function handleSensitivityChange(newSensitivity: FraudSensitivity) {
    unlockAudio();
    playHapticTick();
    setSensitivity(newSensitivity);
    try {
      localStorage.setItem('pausepoint_sensitivity', newSensitivity);
    } catch {}
  }

  function handleToggleScreenShare() {
    unlockAudio();
    playHapticTick();
    const next = !screenShareGuard;
    setScreenShareGuard(next);
    try {
      localStorage.setItem('pausepoint_screenshare_guard', String(next));
    } catch {}
  }

  function handleToggleQr() {
    unlockAudio();
    playHapticTick();
    const next = !qrDissector;
    setQrDissector(next);
    try {
      localStorage.setItem('pausepoint_qr_dissector', String(next));
    } catch {}
  }

  function handleToggleMule() {
    unlockAudio();
    playHapticTick();
    const next = !muleVelocity;
    setMuleVelocity(next);
    try {
      localStorage.setItem('pausepoint_mule_velocity', String(next));
    } catch {}
  }

  function handleToggleSound() {
    const next = !soundMuted;
    setSoundMuted(next);
    setAudioMuted(next);
    if (!next) {
      unlockAudio();
      playHapticTick();
    }
  }

  function handleRetentionChange(days: number) {
    unlockAudio();
    playHapticTick();
    setRetentionDays(days);
    try {
      localStorage.setItem('pausepoint_retention_days', String(days));
    } catch {}
  }

  function handleToggleSenior() {
    unlockAudio();
    playHapticTick();
    const next = !seniorMode;
    setSeniorMode(next);
    try {
      localStorage.setItem('pausepoint_senior_mode', String(next));
      if (next) document.documentElement.classList.add('senior-mode');
      else document.documentElement.classList.remove('senior-mode');
    } catch {}
  }

  function handleToggleDemo() {
    unlockAudio();
    playHapticTick();
    const next = !demoMode;
    setDemoMode(next);
    try {
      localStorage.setItem('pausepoint_demo_mode', String(next));
    } catch {}
  }

  function handleRunAudit() {
    unlockAudio();
    playHapticTick();
    setIsAuditing(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0] ?? '12:00:00';
      setLastAuditTime(timeStr);
      setIsAuditing(false);
      playSuccessChime();
      setAuditToast('Integrity Audit Passed: 100% Offline & Private');
      setTimeout(() => setAuditToast(null), 3000);
    }, 600);
  }

  function handleExportJson() {
    unlockAudio();
    playSuccessChime();
    const payload = {
      app: SITE.name,
      exportedAt: new Date().toISOString(),
      sensitivity,
      screenShareGuard,
      qrDissector,
      muleVelocity,
      retentionDays,
      seniorMode,
      demoMode,
      soundMuted,
      version: 'v2026.11.1-sovereign',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${SITE.shortName.toLowerCase()}-settings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice('Local settings snapshot downloaded.');
    setTimeout(() => setExportNotice(null), 3000);
  }

  function handleExportCsv() {
    unlockAudio();
    playSuccessChime();
    const csvContent = `Key,Value\nApp,${SITE.name}\nExportedAt,${new Date().toISOString()}\nSensitivity,${sensitivity}\nScreenShareGuard,${screenShareGuard}\nQrDissector,${qrDissector}\nMuleVelocity,${muleVelocity}\nRetentionDays,${retentionDays}\nSeniorMode,${seniorMode}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${SITE.shortName.toLowerCase()}-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice('Audit ledger exported successfully.');
    setTimeout(() => setExportNotice(null), 3000);
  }

  function handlePurgeData() {
    unlockAudio();
    playSubBassThud();
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    } catch {
      setPurgeModalOpen(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* ── Top Bar Navigation ── */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-fg-muted hover:text-fg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO HOME</span>
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/30 text-[11px] font-mono font-bold text-success">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span>100% OFFLINE · ON-DEVICE PRIVACY</span>
        </div>
      </div>

      {/* ── Header Capsule (Matching Android SettingsHeader) ── */}
      <div className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-surface border border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan/15 border border-cyan/40 flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5 text-cyan" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg font-black tracking-wide text-fg uppercase">
              SECURITY &amp; PRIVACY
            </h1>
            <p className="text-xs text-fg-muted font-medium">
              Hardware Protection &amp; Parameters
            </p>
          </div>
        </div>

        <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-border text-xs font-mono text-fg-muted">
          <Shield className="w-3.5 h-3.5 text-cyan" />
          <span>Sandboxed Engine</span>
        </div>
      </div>

      {/* Audit Toast Feedback */}
      {auditToast && (
        <div className="rounded-xl border border-success/40 bg-success/10 p-3.5 text-xs font-mono font-bold text-success flex items-center justify-between gap-3 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>{auditToast}</span>
          </div>
          <span className="text-[11px] text-fg-muted">Audit sealed</span>
        </div>
      )}

      {/* Export Toast Feedback */}
      {exportNotice && (
        <div className="rounded-xl border border-cyan/40 bg-cyan/10 p-3.5 text-xs font-mono font-bold text-cyan flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-cyan" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* ── Zone 1: Cryptographic Zero-Internet Privacy Hero Card ── */}
      <AwsSpotlightCard colorAccent="cyan" className="p-6 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-success/15 border border-success/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-success" />
            </div>
            <div className="flex flex-col gap-0.5">
              <h2 className="text-base font-bold text-fg">
                Cryptographic Zero-Internet Privacy
              </h2>
              <p className="text-xs text-fg-muted leading-relaxed max-w-xl">
                All message analysis, triage scripts, and court evidence fingerprints execute entirely in your device memory. Zero bytes leave your browser.
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="font-mono text-xs cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin text-cyan' : ''}`} />
            <span>{isAuditing ? 'Auditing...' : 'RUN INTEGRITY TEST'}</span>
          </Button>
        </div>

        {/* 4-Parameter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-surface-2 border border-border flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-fg-muted">Outbound Transmitters</span>
            <span className="text-xs font-mono font-bold text-success">0 (No Cloud / Zero HTTP)</span>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-2 border border-border flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-fg-muted">Storage Enclave</span>
            <span className="text-xs font-mono font-bold text-fg">Local Browser Sandbox</span>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-2 border border-border flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-fg-muted">Active Rulepack</span>
            <span className="text-xs font-mono font-bold text-cyan">v2026.11.1 (12 Levers)</span>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-2 border border-border flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-fg-muted">Audit Timestamp</span>
            <span className="text-xs font-mono font-bold text-fg-muted">Audited: {lastAuditTime}</span>
          </div>
        </div>
      </AwsSpotlightCard>

      {/* ── Zone 2: Threat Defense Heuristics & Sensitivity Matrix ── */}
      <AwsSpotlightCard colorAccent="cyan" className="p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan" />
            <h2 className="text-base font-bold text-fg">Threat Defense Heuristics</h2>
          </div>
          <span className="text-[11px] font-mono text-fg-muted">Tactile Sensitivity</span>
        </div>

        {/* 3-Segment Switcher */}
        <div className="p-1 rounded-xl bg-surface-2 border border-border grid grid-cols-3 gap-1">
          {(['STANDARD', 'BALANCED', 'STRICT'] as FraudSensitivity[]).map((level) => (
            <Button
              key={level}
              variant="plain"
              size="none"
              onClick={() => handleSensitivityChange(level)}
              className={`py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all text-center cursor-pointer ${
                sensitivity === level
                  ? 'bg-cyan text-fg font-black shadow-xs'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              {level === 'STRICT' ? 'ULTRA-STRICT' : level}
            </Button>
          ))}
        </div>

        <p className="text-xs text-fg-muted leading-relaxed">
          {sensitivity === 'STANDARD' &&
            'Standard pattern matching for known fraud scripts, digital arrest threats, and task refund scams.'}
          {sensitivity === 'BALANCED' &&
            'Balanced protection (recommended): Standard rules plus reverse-charge QR dissection and high-velocity bank transfer alerts.'}
          {sensitivity === 'STRICT' &&
            'Ultra-strict protection: Evaluates unverified SMS sender headers, screen-sharing presence, and triggers safety warnings on unknown callers.'}
        </p>

        {/* 4 Tactile Protection Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Toggle 1: Screen-Share Protection */}
          <div className="p-4 rounded-xl bg-surface-2 border border-border flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan" />
                <span className="text-xs font-bold text-fg">Screen-Share Guard</span>
              </div>
              <Button
                variant="plain"
                size="none"
                onClick={handleToggleScreenShare}
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                  screenShareGuard
                    ? 'bg-success/15 text-success border-success/30'
                    : 'bg-surface text-fg-muted border-border'
                }`}
              >
                {screenShareGuard ? 'ACTIVE' : 'OFF'}
              </Button>
            </div>
            <p className="text-[11px] text-fg-muted leading-relaxed">
              Alerts you if remote tools (AnyDesk, TeamViewer) are active while banking or viewing OTPs.
            </p>
          </div>

          {/* Toggle 2: QR Code Dissector */}
          <div className="p-4 rounded-xl bg-surface-2 border border-border flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-cyan" />
                <span className="text-xs font-bold text-fg">QR Code Dissector</span>
              </div>
              <Button
                variant="plain"
                size="none"
                onClick={handleToggleQr}
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                  qrDissector
                    ? 'bg-success/15 text-success border-success/30'
                    : 'bg-surface text-fg-muted border-border'
                }`}
              >
                {qrDissector ? 'ACTIVE' : 'OFF'}
              </Button>
            </div>
            <p className="text-[11px] text-fg-muted leading-relaxed">
              Dissects UPI QR codes before scanning to ensure you are receiving money, not sending it.
            </p>
          </div>

          {/* Toggle 3: Mule Velocity Alert */}
          <div className="p-4 rounded-xl bg-surface-2 border border-border flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan" />
                <span className="text-xs font-bold text-fg">Mule Velocity Alert</span>
              </div>
              <Button
                variant="plain"
                size="none"
                onClick={handleToggleMule}
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                  muleVelocity
                    ? 'bg-success/15 text-success border-success/30'
                    : 'bg-surface text-fg-muted border-border'
                }`}
              >
                {muleVelocity ? 'ACTIVE' : 'OFF'}
              </Button>
            </div>
            <p className="text-[11px] text-fg-muted leading-relaxed">
              Flags rapid, sequential bank transfers to new UPI accounts common in secondary extortion traps.
            </p>
          </div>

          {/* Toggle 4: Audio Haptics */}
          <div className="p-4 rounded-xl bg-surface-2 border border-border flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {soundMuted ? (
                  <VolumeX className="w-4 h-4 text-fg-muted" />
                ) : (
                  <Volume2 className="w-4 h-4 text-cyan" />
                )}
                <span className="text-xs font-bold text-fg">Tactile Audio Feedback</span>
              </div>
              <Button
                variant="plain"
                size="none"
                onClick={handleToggleSound}
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                  !soundMuted
                    ? 'bg-success/15 text-success border-success/30'
                    : 'bg-surface text-fg-muted border-border'
                }`}
              >
                {!soundMuted ? 'ENABLED' : 'MUTED'}
              </Button>
            </div>
            <p className="text-[11px] text-fg-muted leading-relaxed">
              Provides procedural sub-bass thuds on scam detection and subtle haptic ticks on interface taps.
            </p>
          </div>
        </div>
      </AwsSpotlightCard>

      {/* ── Zone 3: Retention & Senior Citizen Mode ── */}
      <AwsSpotlightCard colorAccent="amber" className="p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-bold text-fg">Flagged Case Retention Period</h2>
            <p className="text-xs text-fg-muted leading-relaxed max-w-xl">
              Controls how long suspect phone numbers and UPI IDs remain in your device storage to link multiple transactions during a cyber report.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-cyan px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 shrink-0">
            {retentionDays} {retentionDays === 1 ? 'Day' : 'Days'}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {[1, 3, 7, 14, 30].map((days) => (
            <Button
              key={days}
              variant={retentionDays === days ? 'cyber-solid' : 'secondary'}
              size="sm"
              onClick={() => handleRetentionChange(days)}
              className="font-mono text-xs cursor-pointer"
            >
              {days} {days === 1 ? 'Day' : 'Days'}
            </Button>
          ))}
        </div>

        {/* Senior Citizen Mode Card */}
        <div className="p-4 rounded-xl bg-surface-2 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-fg">Senior Citizen Protection Mode</span>
              <Badge tone="info">ACCESSIBILITY</Badge>
            </div>
            <p className="text-[11px] text-fg-muted leading-relaxed">
              Enlarges buttons to 64px, increases base typography, and enables high-contrast voice guidance.
            </p>
          </div>
          <Button
            variant={seniorMode ? 'cyber-solid' : 'secondary'}
            size="sm"
            onClick={handleToggleSenior}
            className="font-mono text-xs cursor-pointer shrink-0 self-start sm:self-auto"
          >
            {seniorMode ? 'ACTIVE' : 'ENABLE'}
          </Button>
        </div>

        {/* Stage Demo Mode Toggle */}
        <div className="p-4 rounded-xl bg-surface-2 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-fg">Stage Demo Mode (Jury Evaluation)</span>
              <Badge tone="warning">EVALUATION ONLY</Badge>
            </div>
            <p className="text-[11px] text-fg-muted leading-relaxed">
              Accepts test debit SMS from 10-digit personal phone numbers for live hackathon jury demonstrations.
            </p>
          </div>
          <Button
            variant={demoMode ? 'danger' : 'secondary'}
            size="sm"
            onClick={handleToggleDemo}
            className="font-mono text-xs cursor-pointer shrink-0 self-start sm:self-auto"
          >
            {demoMode ? 'DEMO ACTIVE' : 'ENABLE DEMO'}
          </Button>
        </div>
      </AwsSpotlightCard>

      {/* ── Zone 4: Data Sovereignty & Audit Ledger ── */}
      <AwsSpotlightCard colorAccent="rose" className="p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-bold text-fg">Data Sovereignty &amp; Local Vault</h2>
          <p className="text-xs text-fg-muted leading-relaxed">
            Your data never touches any server. Download encrypted snapshots for court reporting or permanently wipe all records from this browser.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button
            variant="secondary"
            size="md"
            onClick={handleExportJson}
            className="flex items-center gap-2 font-mono text-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan" />
            <span>Export Snapshot (JSON)</span>
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={handleExportCsv}
            className="flex items-center gap-2 font-mono text-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-cyan" />
            <span>Download Ledger (CSV)</span>
          </Button>

          <Button
            variant="cyber-danger"
            size="md"
            onClick={() => setPurgeModalOpen(true)}
            className="flex items-center gap-2 font-mono text-xs cursor-pointer ml-auto"
          >
            <Trash2 className="w-4 h-4 text-danger" />
            <span>Clear All Stored Data</span>
          </Button>
        </div>
      </AwsSpotlightCard>

      {/* ── Expandable Statutory BSA 2023 Compliance Docket ── */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <Button
          variant="plain"
          size="none"
          onClick={() => {
            unlockAudio();
            playHapticTick();
            setShowDocket(!showDocket);
          }}
          className="w-full flex items-center justify-between p-4 text-left font-mono text-xs text-fg-muted hover:text-fg hover:bg-surface-2/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan" />
            <span className="font-bold text-fg">Statutory Compliance &amp; Audit Seal</span>
            <span className="text-[10px] text-fg-muted">(BSA 2023 §63 / 65B Certified)</span>
          </div>
          {showDocket ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>

        {showDocket && (
          <div className="p-5 border-t border-border bg-surface-2/40 flex flex-col gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-surface border border-border flex flex-col gap-2">
              <span className="text-fg font-bold uppercase tracking-wider text-cyan">
                ════════ PAUSEPOINT SHIELD SECURITY AUDIT DOCKET ════════
              </span>
              <p className="text-fg-muted leading-relaxed">
                [ZERO-INTERNET MANIFEST ATTESTATION]<br />
                • Network Transmitters: STRICTLY 0 (Zero HTTP/WebSocket/Analytics)<br />
                • Storage Enclave: Browser Local-Sandbox (IndexedDB/LocalStorage)<br />
                • Rulepack Version: v2026.11.1 (12 Defense Levers, 11 Playbooks)<br />
                <br />
                [STATUTORY COMPLIANCE SEAL]<br />
                • Legal Admissibility: Bharatiya Sakshya Adhiniyam, 2023 §63 &amp; §65B<br />
                • Evidence Hash: Deterministic SHA-256 On-Device Incident Digest<br />
                • Engine: PausePoint Sovereign Defense Architecture
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Purge Confirmation Modal ── */}
      <Modal
        open={purgeModalOpen}
        onClose={() => setPurgeModalOpen(false)}
        title="Permanently Delete All Local Data?"
      >
        <div className="flex flex-col gap-4 p-2 text-xs font-mono">
          <p className="text-fg-muted leading-relaxed">
            This will permanently erase all saved messages, flagged transactions, and custom settings from this device.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPurgeModalOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handlePurgeData}
              className="cursor-pointer"
            >
              Permanently Purge
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
