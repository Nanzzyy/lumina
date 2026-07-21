/**
 * Fluid Token Resolver — ADR-019 §fluid.
 *
 * Extends theme.ts token resolution with fluid (clamp) support.
 * A fluid token produces `clamp(min, preferred, max)` instead of a fixed value.
 * Enabled when the token's value is an object with {min, preferred, max} or
 * when the token key is registered as fluid (spacing, typography headings).
 *
 * Pure: no React/DB (R5/R7).
 */

import type { ThemeToken, ThemeInput } from './theme';
import { resolveToken, DEFAULT_THEME } from './theme';

// ─── Fluid token config ─────────────────────────────────────
export interface FluidConfig {
  min: string;
  preferred: string;
  max: string;
}

const FLUID_TOKEN_SUFFIXES = [
  'spacing-section',
  'spacing-gap',
  'font-heading',
  'font-body',
  'font-size',
  'spacing-container',
];

/**
 * Check if a token key is eligible for fluid scaling.
 */
export function isFluidToken(key: string): boolean {
  return FLUID_TOKEN_SUFFIXES.some((suffix) => key.includes(suffix));
}

/**
 * Compute a clamp() value for a spacing token.
 * Uses the token's resolved pixel value as the preferred size,
 * then scales min/max proportionally.
 */
export function toClamp(
  resolvedValue: string,
  minScale = 0.5,
  maxScale = 2,
): string {
  const num = parseFloat(resolvedValue);
  if (Number.isNaN(num) || num <= 0) return resolvedValue;
  const unit = resolvedValue.replace(String(num), '') || 'px';
  const min = num * minScale;
  const max = num * maxScale;
  return `clamp(${min}${unit}, ${num * 0.07}vw + ${min}${unit}, ${max}${unit})`;
}

/**
 * Resolve a token to a fluid value if applicable.
 * If the token is not fluid, returns the raw resolved value.
 */
export function resolveTokenFluid(key: string, input: ThemeInput): string {
  const resolved = resolveToken(key, input);
  if (!resolved) return '';
  if (isFluidToken(key)) {
    return toClamp(resolved.value, 0.5, 2);
  }
  return resolved.value;
}

/**
 * Resolve all tokens with fluid support.
 */
export function resolveAllTokensFluid(input: ThemeInput): Record<string, string> {
  const allKeys = new Set<string>();
  const add = (tokens: import('./theme').ThemeToken[]) => tokens.forEach((t) => allKeys.add(t.key));
  add(input.defaultTheme.tokens);
  if (input.workspaceTheme) add(input.workspaceTheme.tokens);
  if (input.projectTheme) add(input.projectTheme.tokens);
  if (input.componentTokens) add(input.componentTokens);

  const out: Record<string, string> = {};
  for (const key of allKeys) {
    out[key] = resolveTokenFluid(key, input);
  }
  return out;
}
