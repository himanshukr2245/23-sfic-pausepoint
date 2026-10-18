import { describe, it, expect } from 'vitest';
import { nextChoice, resolveTheme, THEME_INIT_SCRIPT } from './theme';

describe('theme', () => {
  it('cycles light → dark → system → light', () => {
    expect(nextChoice('light')).toBe('dark');
    expect(nextChoice('dark')).toBe('system');
    expect(nextChoice('system')).toBe('light');
  });
  it('resolves "system" from the OS preference', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
  });
  it('the no-flash script is valid JavaScript and never throws', () => {
    expect(() => new Function(THEME_INIT_SCRIPT)).not.toThrow();
  });
});
