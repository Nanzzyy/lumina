import { describe, it, expect, beforeEach } from 'vitest';
import { resolveToken, resolveAllTokens, invalidateTokenCache, markThemeDirty } from './theme';
import { DEFAULT_THEME } from './theme';
import type { ThemeInput } from './theme';

const baseInput: ThemeInput = {
  defaultTheme: DEFAULT_THEME,
};

const overriddenInput: ThemeInput = {
  defaultTheme: DEFAULT_THEME,
  projectTheme: {
    id: 'project-theme',
    name: 'Project',
    tokens: [
      { key: 'color-primary', layer: 'semantic', value: '#ff6600' },
    ],
  },
};

describe('token resolver (ADR-018)', () => {
  beforeEach(() => invalidateTokenCache());

  it('resolves raw token directly', () => {
    expect(resolveToken('color-rose-600', baseInput)!.value).toBe('#db2777');
    expect(resolveToken('color-rose-600', baseInput)!.origin).toBe('default');
  });

  it('resolves semantic token alias chain', () => {
    const r = resolveToken('color-primary', baseInput);
    expect(r).not.toBeNull();
    expect(r!.value).toBe('#db2777');
    expect(r!.origin).toBe('default');
  });

  it('resolves component token alias chain (2 hops)', () => {
    // button-bg → color-primary → color-rose-600 → #db2777
    const r = resolveToken('button-bg', baseInput);
    expect(r).not.toBeNull();
    expect(r!.value).toBe('#db2777');
  });

  it('project theme overrides default', () => {
    const r = resolveToken('color-primary', overriddenInput);
    expect(r!.value).toBe('#ff6600');
    expect(r!.origin).toBe('project');
  });

  it('node overrides beat everything', () => {
    const input: ThemeInput = {
      defaultTheme: DEFAULT_THEME,
      nodeOverrides: { 'button-bg': '#00ff00' },
    };
    const r = resolveToken('button-bg', input);
    expect(r!.value).toBe('#00ff00');
    expect(r!.origin).toBe('node');
  });

  it('returns null for unknown key', () => {
    expect(resolveToken('nope', baseInput)).toBeNull();
  });

  it('resolves all tokens into a flat map', () => {
    const map = resolveAllTokens(baseInput);
    expect(map['color-primary']).toBe('#db2777');
    expect(map['button-bg']).toBe('#db2777');
    expect(map['spacing-section']).toBe('5rem');
    expect(map['color-background']).toBe('#ffffff');
  });
});
