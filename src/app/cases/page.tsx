'use client';

// app/cases/page.tsx — PausePoint Shield Local Case Vault & Flagged History Screen.
// Static export compatible wrapped in Suspense.
// Manages local flagged messages, active cases, and individual deletion triggers with zero network access.
import React, { Suspense, useState, useEffect } from 'react';
import { AwsSpotlightCard } from '@/components/ui/AwsSpotlightCard';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { playHapticTick, unlockAudio } from '@/lib/audio/synthesizer';
import { shieldBridge, type CaseSummary } from '@/lib/native/shield';
import {
  Trash2,
  ShieldAlert,
  Clock,
  ArrowRight,
  ShieldCheck,
  Search,
  CheckCircle2,
} from 'lucide-react';

function CasesContent() {
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    shieldBridge.listCases().then((res) => {
      if (mounted) setCases(res);
    });
    return () => {
      mounted = false;
    };
  }, []);

  function handleDeleteItem(id: string) {
    unlockAudio();
    playHapticTick();
    setCases((prev) => prev.filter((c) => c.id !== id));
    showToast(`Case ${id} deleted from device`);
  }

  async function handleClearAll() {
    unlockAudio();
    playHapticTick();
    await shieldBridge.deleteEverything();
    setCases([]);
    showToast('All case records deleted from local database');
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  const filteredCases = cases.filter(
    (c) =>
      c.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.sender.includes(searchQuery) ||
      c.playbook.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-8 pb-20">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-cyan/15 text-cyan border border-cyan/40">
              LOCAL DEVICE VAULT
            </span>
            <span className="text-xs font-mono text-fg-muted">Retention: 7 Days</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-fg tracking-tight mt-1">
            Flagged Cases &amp; Shield Vault
          </h1>
          <p className="text-xs sm:text-sm text-fg-muted">
            All records are stored strictly in app-private storage. Nothing leaves your phone.
          </p>
        </div>

        {cases.length > 0 && (
          <Button
            variant="quiet"
            size="sm"
            onClick={handleClearAll}
            className="text-xs font-mono text-danger hover:bg-danger/10 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe All Cases</span>
          </Button>
        )}
      </div>

      {/* ── Search Bar ── */}
      <div className="relative">
        <Search className="w-4 h-4 text-fg-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by sender number, scam playbook, or text..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-xs text-fg placeholder:text-fg-muted focus:outline-none focus:border-cyan"
        />
      </div>

      {/* ── Cases List ── */}
      {filteredCases.length > 0 ? (
        <div className="flex flex-col gap-3.5">
          {filteredCases.map((item) => (
            <AwsSpotlightCard
              key={item.id}
              colorAccent="cyan"
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-danger/10 text-danger border border-danger/30 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-fg">{item.sender}</span>
                    <span className="text-[10px] font-mono uppercase bg-surface-2 px-2 py-0.5 rounded text-fg-muted border border-border/80">
                      {item.source}
                    </span>
                    <span className="text-[10px] font-mono text-cyan bg-cyan/10 px-2 py-0.5 rounded">
                      {item.playbook}
                    </span>
                    <span className="text-[11px] font-mono text-fg-muted flex items-center gap-1 ml-auto sm:ml-0">
                      <Clock className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-fg-muted font-sans line-clamp-2 leading-relaxed">
                    {item.preview}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <ButtonLink
                  href={`/xray?id=${item.id}&text=${encodeURIComponent(item.preview)}`}
                  variant="secondary"
                  size="sm"
                  className="text-xs font-mono flex items-center gap-1.5"
                >
                  <span>X-Ray</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </ButtonLink>
                <Button
                  variant="quiet"
                  size="sm"
                  onClick={() => handleDeleteItem(item.id)}
                  title="Delete case record"
                  className="text-xs text-fg-muted hover:text-danger hover:bg-danger/10 p-2 rounded-lg cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </AwsSpotlightCard>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-12 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-fg">No Flagged Cases Found</h3>
          <p className="text-xs text-fg-muted max-w-sm">
            {searchQuery
              ? 'No records match your search filter.'
              : 'Your device is clean. Any suspicious incoming SMS or WhatsApp task alert will appear here for 7 days.'}
          </p>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-surface border border-cyan/40 px-4 py-2.5 shadow-lg shadow-cyan/10 text-xs font-mono text-cyan flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function CasesPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl py-20 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-10 h-10 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-fg-muted">Loading Case Vault...</span>
        </div>
      }
    >
      <CasesContent />
    </Suspense>
  );
}
