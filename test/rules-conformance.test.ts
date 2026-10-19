// test/rules-conformance.test.ts — Validates rules/pack.json and fixtures conformance
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { decode } from '../src/lib/engine/decoder.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

interface RulePack {
  version: string;
  thresholds: { danger: number; caution: number };
  levers: Array<{ id: string; label: string; weight: number; pattern: string }>;
  playbooks: Array<{ id: string; name: string; truth: string; weight: number }>;
  senderRules: { officialBankHeaderPattern: string; personalMobilePattern: string };
  brakeRules: { pattern: string; truth: string };
  acknowledgementRules: { pattern: string; triggerWords: string[] };
}

interface FixtureMessage {
  id: string;
  source: string;
  sender: string;
  text: string;
  expect: 'danger' | 'caution' | 'safe';
  playbook: string | null;
}

test('rules/pack.json integrity and schema validation', () => {
  const packPath = path.join(rootDir, 'rules', 'pack.json');
  assert.ok(fs.existsSync(packPath), 'rules/pack.json must exist');
  
  const raw = fs.readFileSync(packPath, 'utf8');
  const pack: RulePack = JSON.parse(raw);
  
  assert.equal(pack.version, '2026.11.1');
  assert.equal(pack.thresholds.danger, 25);
  assert.equal(pack.thresholds.caution, 12);
  assert.ok(pack.levers.length >= 10, 'must define at least 10 levers');
  assert.ok(pack.playbooks.length >= 10, 'must define at least 10 playbooks');
  assert.ok(pack.senderRules.officialBankHeaderPattern, 'must define officialBankHeaderPattern');
  assert.ok(pack.brakeRules.pattern, 'must define brakeRules pattern');
  assert.ok(pack.acknowledgementRules.pattern, 'must define acknowledgementRules pattern');
});

test('fixtures/messages.jsonl conformance against decoder engine', () => {
  const fixturesPath = path.join(rootDir, 'fixtures', 'messages.jsonl');
  assert.ok(fs.existsSync(fixturesPath), 'fixtures/messages.jsonl must exist');
  
  const lines = fs.readFileSync(fixturesPath, 'utf8').trim().split('\n');
  assert.ok(lines.length >= 20, 'must contain at least 20 test fixtures');
  
  for (const line of lines) {
    if (!line.trim()) continue;
    const fixture: FixtureMessage = JSON.parse(line);
    const result = decode(fixture.text);
    
    if (fixture.expect === 'danger') {
      assert.notEqual(result.level, 'low', `Fixture ${fixture.id} expected danger/caution but got low`);
    } else if (fixture.expect === 'safe') {
      assert.equal(result.level, 'low', `Fixture ${fixture.id} expected safe/low but got ${result.level}`);
    }
  }
});
