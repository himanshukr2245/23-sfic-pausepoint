// test/shield-bridge.test.ts — Validates PausePoint Shield Web/Native Bridge and Zod schemas
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  shieldBridge,
  ShieldStatusSchema,
  CaseSummarySchema,
  EventDetailSchema,
  ShieldSettingsSchema,
} from '../src/lib/native/shield.ts';

test('shieldBridge: getStatus returns compliant status object', async () => {
  const status = await shieldBridge.getStatus();
  assert.ok(status.active);
  assert.equal(status.flavor, 'web');
  assert.equal(status.retentionDays, 7);
  assert.ok(status.casesCount >= 0);

  // Validate directly against Zod schema
  const parsed = ShieldStatusSchema.safeParse(status);
  assert.ok(parsed.success, 'Status must satisfy ShieldStatusSchema');
});

test('shieldBridge: listCases returns validated cases array', async () => {
  const cases = await shieldBridge.listCases();
  assert.ok(Array.isArray(cases));
  assert.ok(cases.length > 0);

  for (const c of cases) {
    const parsed = CaseSummarySchema.safeParse(c);
    assert.ok(parsed.success, `Case ${c.id} must satisfy CaseSummarySchema`);
    assert.ok(c.preview.length > 0);
    assert.ok(c.threatScore >= 0 && c.threatScore <= 100);
  }
});

test('shieldBridge: getEvent returns complete forensic detail', async () => {
  const detail = await shieldBridge.getEvent('case-8401');
  assert.equal(detail.id, 'case-8401');
  assert.ok(detail.truth.length > 0);
  assert.ok(Array.isArray(detail.tactics));

  const parsed = EventDetailSchema.safeParse(detail);
  assert.ok(parsed.success, 'Event detail must satisfy EventDetailSchema');
});

test('shieldBridge: settings roundtrip and validation rules', async () => {
  const defaultSettings = await shieldBridge.getSettings();
  assert.equal(defaultSettings.retentionDays, 7);

  await shieldBridge.setSettings({
    retentionDays: 14,
    seniorMode: true,
    demoMode: false,
    trustedName: 'Elder Sister',
    trustedPhone: '+91 98765 00000',
  });

  // Invalid retention (> 30) should be rejected by Zod
  const invalid = ShieldSettingsSchema.safeParse({ retentionDays: 99 });
  assert.ok(!invalid.success, 'Retention days > 30 must be rejected');
});
