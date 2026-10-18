// .hk-template/hk-init.test.mjs — the init engine's rules (vitest; deleted with the template by hk:init itself).
import { describe, it, expect } from 'vitest';
import { applyMarkers, evaluate, validate, parseArgs, hexToOklch, brandTokens } from './hk-init.mjs';

describe('conditions', () => {
  it('evaluates module conditions', () => {
    expect(evaluate('auth', ['auth'])).toBe(true);
    expect(evaluate('auth && !offline', ['auth'])).toBe(true);
    expect(evaluate('auth && !offline', ['auth', 'offline'])).toBe(false);
    expect(evaluate('auth || offline', [])).toBe(false);
    expect(evaluate('(auth || offline) && !auth', ['offline'])).toBe(true);
  });
  it('rejects unknown modules and junk', () => {
    expect(() => evaluate('payments', [])).toThrow(/unknown module/);
    expect(() => evaluate('auth; rm -rf', [])).toThrow(/bad condition/);
  });
});

describe('markers', () => {
  const src = ['a', '// #if auth', 'b', '// #endif', '{/* #if offline */}', 'c', '{/* #endif */}', '# #if auth || offline', 'd', '# #endif', 'e'].join('\n');
  it('keeps or drops each block, and always drops the marker lines', () => {
    expect(applyMarkers(src, [])).toBe('a\ne');
    expect(applyMarkers(src, ['auth'])).toBe('a\nb\nd\ne');
    expect(applyMarkers(src, ['auth', 'offline'])).toBe('a\nb\nc\nd\ne');
  });
  it('refuses nesting, a lonely #endif and an unclosed #if — naming the line', () => {
    expect(() => applyMarkers('// #if auth\n// #if offline\n// #endif\n// #endif', [], 'x.ts')).toThrow(/x\.ts:2: #if inside #if/);
    expect(() => applyMarkers('// #endif', [])).toThrow(/#endif without #if/);
    expect(() => applyMarkers('// #if auth\nb', [], 'y.ts')).toThrow(/y\.ts:1: #if is never closed/);
  });
});

describe('arguments', () => {
  it('accepts a good set and normalises modules', () => {
    const a = parseArgs(['--name', 'My App', '--slug', 'my-app', '--domain', 'notes.example.com', '--modules', 'offline,auth', '--dry-run']);
    expect(a.flags.has('dry-run')).toBe(true);
    expect(validate(a)).toEqual({ errors: [], chosen: ['auth', 'offline'] });
    expect(validate({ ...a, modules: 'none' }).chosen).toEqual([]);
  });
  it('explains every bad value', () => {
    const { errors } = validate({ name: 'A"b', slug: 'My_App', domain: 'https://x.com', modules: 'auth,pay' });
    expect(errors).toHaveLength(4);
    expect(() => parseArgs(['--force'])).toThrow(/unknown option/);
  });
});

describe('--brand', () => {
  it('converts hex to OKLCH (white, a known blue)', () => {
    expect(hexToOklch('#ffffff').L).toBeCloseTo(1, 3);
    const blue = hexToOklch('#4f46e5');
    expect(blue.L).toBeCloseTo(0.51, 1);
    expect(Math.round(blue.h)).toBeGreaterThan(260);
  });
  it('every brand, even a pale one, gets light and dark tokens with readable text (≥ 4.5:1)', () => {
    for (const hex of ['#0ea5e9', '#ffd60a', '#22c55e', '#4f46e5', '#111111']) {
      const t = brandTokens(hex);
      expect(t.lightRatio, hex).toBeGreaterThanOrEqual(4.5);
      expect(t.darkRatio, hex).toBeGreaterThanOrEqual(4.5);
      expect(t.light).toMatch(/^oklch\(/);
    }
  });
  it('rejects a colour that is not #rrggbb', () => {
    expect(validate({ name: 'A', slug: 'abc', domain: 'a.example.com', modules: 'none', brand: 'blue' }).errors).toContain('--brand: a hex colour like #0ea5e9');
  });
});
