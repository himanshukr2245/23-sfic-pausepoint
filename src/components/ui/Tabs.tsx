'use client';

// components/ui/Tabs.tsx — High-contrast accessible segmented tab controller (HK Universal Library v3).
// Seamless tactile Web Audio synthesizer integration with ARIA role="tablist" standards.
import { unlockAudio, playHapticTick } from '@/lib/audio/synthesizer';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
  function handleSelect(id: string) {
    if (id === activeTab) return;
    unlockAudio();
    playHapticTick();
    onChange(id);
  }

  return (
    <div
      role="tablist"
      aria-label="Navigation Tabs"
      className={`inline-flex items-center gap-1.5 rounded-2xl border border-border/80 bg-surface-2/60 p-1.5 shadow-xs ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => handleSelect(tab.id)}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-surface text-fg shadow-xs border border-border/80 font-bold'
                : 'text-fg-muted hover:text-fg hover:bg-surface/50'
            }`}
          >
            {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
                  isActive
                    ? 'bg-brand/10 text-brand font-bold'
                    : 'bg-surface-3 text-fg-muted'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
