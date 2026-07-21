import { describe, it, expect } from 'vitest';
import { isFluidToken, toClamp, resolveTokenFluid, resolveAllTokensFluid } from './tokens-fluid';
import { DEFAULT_THEME } from './theme';
import type { ThemeInput } from './theme';

const input: ThemeInput = { defaultTheme: DEFAULT_THEME };

describe('fluid token resolver (ADR-019)', () => {
  it('detects spacing tokens as fluid', () => {
    expect(isFluidToken('spacing-section')).toBe(true);
    expect(isFluidToken('font-heading')).toBe(true);
  });

  it('non-fluid tokens are not fluid', () => {
    expect(isFluidToken('color-primary')).toBe(false);
    expect(isFluidToken('button-bg')).toBe(false);
  });

  it('toClamp produces clamp() from px value', () => {
    expect(toClamp('80px', 0.5, 2)).toContain('clamp(');
    expect(toClamp('80px', 0.5, 2)).toContain('40px');
    expect(toClamp('80px', 0.5, 2)).toContain('160px');
  });

  it('toClamp handles unitless values', () => {
    expect(toClamp('16', 0.5, 2)).toContain('clamp(');
  });

  it('toClamp passes through non-numeric values', () => {
    expect(toClamp('auto', 0.5, 2)).toBe('auto');
  });

  it('resolveTokenFluid applies clamp to spacing token', () => {
    const val = resolveTokenFluid('spacing-section-mobile', input);
    expect(val).toContain('clamp(');
  });

  it('resolveTokenFluid passes through color token unchanged', () => {
    const val = resolveTokenFluid('color-primary', input);
    expect(val).toBe('#db2777');
  });

  it('resolveAllTokensFluid returns fluid values for spacing keys', () => {
    const map = resolveAllTokensFluid(input);
    expect(map['spacing-section']).toContain('clamp(');
    expect(map['color-primary']).toBe('#db2777');
    expect(map['button-bg']).toBe('#db2777');
  });
});
