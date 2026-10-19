// src/lib/native/shield.ts — PausePoint Shield Web/Native Bridge.
// Implements unified interface between Next.js UI layer and Capacitor/Android background services.
// Fully runtime validated via Zod schemas, with a zero-dependency web mock adapter for dev and browser testing.
import * as z from '../zod.ts';

export const ShieldStatusSchema = z.object({
  active: z.boolean(),
  flavor: z.enum(['public', 'shield', 'web']),
  callRoleGranted: z.boolean(),
  smsPermissionGranted: z.boolean(),
  notificationAccessGranted: z.boolean(),
  casesCount: z.number(),
  retentionDays: z.number(),
  version: z.string(),
});
export type ShieldStatus = z.infer<typeof ShieldStatusSchema>;

export const CaseSummarySchema = z.object({
  id: z.string(),
  source: z.enum(['sms', 'call', 'whatsapp', 'telegram', 'manual']),
  sender: z.string(),
  preview: z.string(),
  playbook: z.string(),
  timestamp: z.number(),
  threatScore: z.number(),
  status: z.enum(['flagged', 'reported', 'dismissed', 'safe']),
});
export type CaseSummary = z.infer<typeof CaseSummarySchema>;

export const EventDetailSchema = z.object({
  id: z.string(),
  source: z.enum(['sms', 'call', 'whatsapp', 'telegram', 'manual']),
  sender: z.string(),
  rawText: z.string(),
  playbook: z.string(),
  truth: z.string(),
  tactics: z.array(z.string()),
  timestamp: z.number(),
  threatScore: z.number(),
  status: z.enum(['flagged', 'reported', 'dismissed', 'safe']),
  links: z.optional(z.array(z.string())),
});
export type EventDetail = z.infer<typeof EventDetailSchema>;

export const ShieldSettingsSchema = z.object({
  retentionDays: z.number(),
  seniorMode: z.boolean(),
  demoMode: z.boolean(),
  trustedName: z.optional(z.string()),
  trustedPhone: z.optional(z.string()),
});
export type ShieldSettings = z.infer<typeof ShieldSettingsSchema>;

export interface ShieldPlugin {
  getStatus(): Promise<ShieldStatus>;
  requestCallRole(): Promise<{ granted: boolean }>;
  requestSms(): Promise<{ granted: boolean }>;
  openNotificationAccess(): Promise<{ opened: boolean }>;
  listCases(options?: { limit?: number }): Promise<{ cases: CaseSummary[] }>;
  getEvent(options: { id: string }): Promise<EventDetail>;
  markSafe(options: { id: string; scope: 'number' | 'link' | 'phrase' }): Promise<{ success: boolean }>;
  deleteEverything(): Promise<{ success: boolean }>;
  setSettings(settings: ShieldSettings): Promise<{ success: boolean }>;
  getSettings(): Promise<ShieldSettings>;
}

declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform?: () => boolean;
      Plugins?: {
        ShieldPlugin?: ShieldPlugin;
      };
    };
  }
}

export function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.Capacitor?.isNativePlatform?.());
}

// ── Web Mock Adapter ─────────────────────────────────────────────────────────

const MOCK_STORAGE_KEY_CASES = 'pausepoint_shield_mock_cases';
const MOCK_STORAGE_KEY_SETTINGS = 'pausepoint_shield_mock_settings';

const DEFAULT_MOCK_CASES: CaseSummary[] = [
  {
    id: 'case-8401',
    source: 'whatsapp',
    sender: '+91 98765 43210',
    preview: 'Your task commission Rs 8,400 is ready. Pay Rs 5,000 to unlock withdrawal immediately.',
    playbook: 'Task / Part-Time Job Scam',
    timestamp: Date.now() - 60000 * 5,
    threatScore: 85,
    status: 'flagged',
  },
  {
    id: 'case-8399',
    source: 'sms',
    sender: '+91 98123 45678',
    preview: 'Dear consumer your electricity will be disconnected tonight at 9.30 pm. Contact officer immediately.',
    playbook: 'Electricity Disconnection Scam',
    timestamp: Date.now() - 60000 * 120,
    threatScore: 90,
    status: 'flagged',
  },
  {
    id: 'case-8350',
    source: 'sms',
    sender: '+91 99887 76655',
    preview: 'SBI alert: Account blocked due to missing KYC. Update immediately on http://sbi-kyc.top',
    playbook: 'Bank / SIM KYC Block Trap',
    timestamp: Date.now() - 86400000,
    threatScore: 95,
    status: 'reported',
  },
];

const DEFAULT_SETTINGS: ShieldSettings = {
  retentionDays: 7,
  seniorMode: false,
  demoMode: false,
};

class WebMockShieldAdapter implements ShieldPlugin {
  private getStoredCases(): CaseSummary[] {
    if (typeof window === 'undefined') return DEFAULT_MOCK_CASES;
    try {
      const raw = localStorage.getItem(MOCK_STORAGE_KEY_CASES);
      if (!raw) {
        localStorage.setItem(MOCK_STORAGE_KEY_CASES, JSON.stringify(DEFAULT_MOCK_CASES));
        return DEFAULT_MOCK_CASES;
      }
      return JSON.parse(raw);
    } catch {
      return DEFAULT_MOCK_CASES;
    }
  }

  private saveCases(cases: CaseSummary[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(MOCK_STORAGE_KEY_CASES, JSON.stringify(cases));
    } catch {
      // storage unavailable
    }
  }

  async getStatus(): Promise<ShieldStatus> {
    const cases = this.getStoredCases();
    return ShieldStatusSchema.parse({
      active: true,
      flavor: 'web',
      callRoleGranted: true,
      smsPermissionGranted: true,
      notificationAccessGranted: true,
      casesCount: cases.length,
      retentionDays: 7,
      version: '1.0.0-web',
    });
  }

  async requestCallRole(): Promise<{ granted: boolean }> {
    return { granted: true };
  }

  async requestSms(): Promise<{ granted: boolean }> {
    return { granted: true };
  }

  async openNotificationAccess(): Promise<{ opened: boolean }> {
    return { opened: true };
  }

  async listCases(options?: { limit?: number }): Promise<{ cases: CaseSummary[] }> {
    const cases = this.getStoredCases();
    const limit = options?.limit ?? 50;
    const items = cases.slice(0, limit);
    return {
      cases: items.map((c) => CaseSummarySchema.parse(c)),
    };
  }

  async getEvent(options: { id: string }): Promise<EventDetail> {
    const cases = this.getStoredCases();
    const found = cases.find((c) => c.id === options.id);
    const detail: EventDetail = {
      id: options.id,
      source: found?.source ?? 'sms',
      sender: found?.sender ?? 'Unknown Sender',
      rawText: found?.preview ?? 'Sample alert payload for inspection',
      playbook: found?.playbook ?? 'General Suspicious Pattern',
      truth: 'Official organizations never ask for immediate fee transfers or OTPs over chat or phone.',
      tactics: ['Urgency', 'Fear / Threat', 'Fee Brake'],
      timestamp: found?.timestamp ?? Date.now(),
      threatScore: found?.threatScore ?? 75,
      status: found?.status ?? 'flagged',
      links: [],
    };
    return EventDetailSchema.parse(detail);
  }

  async markSafe(options: { id: string; scope: 'number' | 'link' | 'phrase' }): Promise<{ success: boolean }> {
    const cases = this.getStoredCases();
    const updated = cases.map((c) => (c.id === options.id ? { ...c, status: 'safe' as const } : c));
    this.saveCases(updated);
    return { success: true };
  }

  async deleteEverything(): Promise<{ success: boolean }> {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(MOCK_STORAGE_KEY_CASES);
      } catch {
        // ignore
      }
    }
    return { success: true };
  }

  async getSettings(): Promise<ShieldSettings> {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const raw = localStorage.getItem(MOCK_STORAGE_KEY_SETTINGS);
      if (!raw) return DEFAULT_SETTINGS;
      return ShieldSettingsSchema.parse(JSON.parse(raw));
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  async setSettings(settings: ShieldSettings): Promise<{ success: boolean }> {
    const parsed = ShieldSettingsSchema.parse(settings);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(MOCK_STORAGE_KEY_SETTINGS, JSON.stringify(parsed));
      } catch {
        // ignore
      }
    }
    return { success: true };
  }
}

const mockAdapter = new WebMockShieldAdapter();

// ── Exported Facade ──────────────────────────────────────────────────────────

export const shieldBridge = {
  async getStatus(): Promise<ShieldStatus> {
    if (isNativePlatform() && window.Capacitor?.Plugins?.ShieldPlugin) {
      const raw = await window.Capacitor.Plugins.ShieldPlugin.getStatus();
      return ShieldStatusSchema.parse(raw);
    }
    return mockAdapter.getStatus();
  },

  async requestCallRole(): Promise<boolean> {
    if (isNativePlatform() && window.Capacitor?.Plugins?.ShieldPlugin) {
      const res = await window.Capacitor.Plugins.ShieldPlugin.requestCallRole();
      return Boolean(res.granted);
    }
    const res = await mockAdapter.requestCallRole();
    return res.granted;
  },

  async requestSms(): Promise<boolean> {
    if (isNativePlatform() && window.Capacitor?.Plugins?.ShieldPlugin) {
      const res = await window.Capacitor.Plugins.ShieldPlugin.requestSms();
      return Boolean(res.granted);
    }
    const res = await mockAdapter.requestSms();
    return res.granted;
  },

  async openNotificationAccess(): Promise<boolean> {
    if (isNativePlatform() && window.Capacitor?.Plugins?.ShieldPlugin) {
      const res = await window.Capacitor.Plugins.ShieldPlugin.openNotificationAccess();
      return Boolean(res.opened);
    }
    const res = await mockAdapter.openNotificationAccess();
    return res.opened;
  },

  async listCases(limit?: number): Promise<CaseSummary[]> {
    if (isNativePlatform() && window.Capacitor?.Plugins?.ShieldPlugin) {
      const res = await window.Capacitor.Plugins.ShieldPlugin.listCases({ limit });
      return z.array(CaseSummarySchema).parse(res.cases);
    }
    const res = await mockAdapter.listCases({ limit });
    return res.cases;
  },

  async getEvent(id: string): Promise<EventDetail> {
    if (isNativePlatform() && window.Capacitor?.Plugins?.ShieldPlugin) {
      const res = await window.Capacitor.Plugins.ShieldPlugin.getEvent({ id });
      return EventDetailSchema.parse(res);
    }
    return mockAdapter.getEvent({ id });
  },

  async markSafe(id: string, scope: 'number' | 'link' | 'phrase' = 'number'): Promise<void> {
    if (isNativePlatform() && window.Capacitor?.Plugins?.ShieldPlugin) {
      await window.Capacitor.Plugins.ShieldPlugin.markSafe({ id, scope });
      return;
    }
    await mockAdapter.markSafe({ id, scope });
  },

  async deleteEverything(): Promise<void> {
    if (isNativePlatform() && window.Capacitor?.Plugins?.ShieldPlugin) {
      await window.Capacitor.Plugins.ShieldPlugin.deleteEverything();
      return;
    }
    await mockAdapter.deleteEverything();
  },

  async getSettings(): Promise<ShieldSettings> {
    if (isNativePlatform() && window.Capacitor?.Plugins?.ShieldPlugin) {
      const res = await window.Capacitor.Plugins.ShieldPlugin.getSettings();
      return ShieldSettingsSchema.parse(res);
    }
    return mockAdapter.getSettings();
  },

  async setSettings(settings: ShieldSettings): Promise<void> {
    if (isNativePlatform() && window.Capacitor?.Plugins?.ShieldPlugin) {
      await window.Capacitor.Plugins.ShieldPlugin.setSettings(settings);
      return;
    }
    await mockAdapter.setSettings(settings);
  },
};
