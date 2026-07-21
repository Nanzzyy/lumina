/**
 * Theme Engine + Token Resolver — ADR-018 (3-layer Design Tokens).
 *
 * Resolution cascade: defaultTheme → workspace → project → component → node.
 * Token alias resolution with cycle detection (R9). Computed cache invalidated
 * when a source token key changes (via DependencyGraph from ADR-016).
 *
 * Pure: no React/DB (R5/R7). The DB layer (themes/tokens tables) resolves into
 * this module's input types.
 */

import type { TokenLayer } from './token';

// ─── Types ──────────────────────────────────────────────────
export interface ThemeToken {
  key: string;
  layer: TokenLayer;
  value: string;
  /** Optional alias to another key (e.g. `Button.Primary.Bg → color.primary`). */
  alias?: string;
}

export interface Theme {
  id: string;
  name: string;
  tokens: ThemeToken[];
}

export interface ThemeInput {
  defaultTheme: Theme;
  workspaceTheme?: Theme;
  projectTheme?: Theme;
  componentTokens?: ThemeToken[];  // from the component's manifest
  nodeOverrides?: Record<string, string>;  // node.props with token-ref prefix
}

export interface ResolvedToken {
  key: string;
  value: string;
  origin: 'default' | 'workspace' | 'project' | 'component' | 'node';
}

// ─── Token alias cache ──────────────────────────────────────
const RESOLVED_CACHE = new Map<string, string>();
let cacheDirty = true;

export function invalidateTokenCache(): void {
  RESOLVED_CACHE.clear();
  cacheDirty = true;
}

function cacheKey(key: string, themeLayer: string): string {
  return `${themeLayer}:${key}`;
}

// ─── Alias resolution with cycle detection ──────────────────
class TokenCycleError extends Error {
  constructor(cycle: string[]) {
    super(`[token] cycle: ${cycle.join(' → ')}`);
    this.name = 'TokenCycleError';
  }
}

function resolveAlias(
  key: string,
  tokens: Map<string, ThemeToken>,
  visited: Set<string> = new Set(),
  path: string[] = [],
): string {
  if (visited.has(key)) {
    path.push(key);
    throw new TokenCycleError(path);
  }
  visited.add(key);
  path.push(key);

  const token = tokens.get(key);
  if (!token) return key;
  if (!token.alias) return token.value;
  return resolveAlias(token.alias, tokens, visited, path);
}

// ─── Resolver ───────────────────────────────────────────────
/**
 * Resolve a single token key across the cascade. Returns the resolved value
 * and origin layer. Throws TokenCycleError on alias cycles.
 */
export function resolveToken(
  key: string,
  input: ThemeInput,
): ResolvedToken | null {
  const cacheKeyStr = cacheKey(key, `${input.defaultTheme.id}`);

  if (!cacheDirty) {
    const cached = RESOLVED_CACHE.get(cacheKeyStr);
    if (cached) return { key, value: cached, origin: 'default' };
  }

  // Build cascade map — narrower origins override broader.
  const layers: { origin: ResolvedToken['origin']; tokens: ThemeToken[] }[] = [
    { origin: 'default', tokens: input.defaultTheme.tokens },
    { origin: 'workspace', tokens: input.workspaceTheme?.tokens ?? [] },
    { origin: 'project', tokens: input.projectTheme?.tokens ?? [] },
    { origin: 'component', tokens: input.componentTokens ?? [] },
  ];

  let found: ThemeToken | undefined;
  let foundOrigin: ResolvedToken['origin'] = 'default';

  for (const layer of layers) {
    const t = layer.tokens.find((tk) => tk.key === key);
    if (t) {
      found = t;
      foundOrigin = layer.origin;
    }
  }

  // Check node overrides (narrowest)
  if (input.nodeOverrides?.[key]) {
    return { key, value: input.nodeOverrides[key], origin: 'node' };
  }

  if (!found) return null;

  // Resolve alias
  const tokenMap = new Map<string, ThemeToken>();
  for (const layer of layers) {
    for (const t of layer.tokens) {
      if (!tokenMap.has(t.key) || layer.origin !== 'default') {
        tokenMap.set(t.key, t);
      }
    }
  }

  let value: string;
  try {
    value = resolveAlias(found.key, tokenMap);
  } catch (e) {
    if (e instanceof TokenCycleError) throw e;
    value = found.value;
  }

  RESOLVED_CACHE.set(cacheKeyStr, value);
  return { key, value, origin: foundOrigin };
}

/**
 * Resolve all tokens for all three layers into a flat value map.
 * Used by the Resolution Pipeline step 5 (ADR-016).
 */
export function resolveAllTokens(input: ThemeInput): Record<string, string> {
  const allKeys = new Set<string>();
  const add = (tokens: ThemeToken[]) => tokens.forEach((t) => allKeys.add(t.key));
  add(input.defaultTheme.tokens);
  if (input.workspaceTheme) add(input.workspaceTheme.tokens);
  if (input.projectTheme) add(input.projectTheme.tokens);
  if (input.componentTokens) add(input.componentTokens);

  const out: Record<string, string> = {};
  for (const key of allKeys) {
    try {
      const r = resolveToken(key, input);
      if (r) out[key] = r.value;
    } catch {
      // skip unresolved / invalid
    }
  }
  return out;
}

export function markThemeDirty(): void {
  cacheDirty = true;
}

// ─── Seed: defaultTheme → raw→semantic + component defaults ─
export const DEFAULT_THEME: Theme = {
  id: 'default',
  name: 'Default',
  tokens: [
    // Raw
    { key: 'color-rose-600', layer: 'raw', value: '#db2777' },
    { key: 'color-rose-800', layer: 'raw', value: '#be185d' },
    { key: 'color-rose-50', layer: 'raw', value: '#fdf2f8' },
    { key: 'color-violet-600', layer: 'raw', value: '#7c3aed' },
    { key: 'color-amber-500', layer: 'raw', value: '#f59e0b' },
    { key: 'color-white', layer: 'raw', value: '#ffffff' },
    { key: 'color-gray-50', layer: 'raw', value: '#fafafa' },
    { key: 'color-gray-900', layer: 'raw', value: '#171717' },
    { key: 'color-gray-600', layer: 'raw', value: '#525252' },
    { key: 'color-gray-400', layer: 'raw', value: '#a3a3a3' },
    { key: 'color-gray-200', layer: 'raw', value: '#e5e5e5' },
    { key: 'color-gray-100', layer: 'raw', value: '#f5f5f5' },
    { key: 'space-section', layer: 'raw', value: '5rem' },
    { key: 'space-section-mobile', layer: 'raw', value: '2.5rem' },
    { key: 'space-container', layer: 'raw', value: '1024px' },
    { key: 'space-gap', layer: 'raw', value: '2rem' },
    { key: 'space-gap-element', layer: 'raw', value: '1rem' },
    { key: 'radius-sm', layer: 'raw', value: '0.25rem' },
    { key: 'radius-md', layer: 'raw', value: '0.5rem' },
    { key: 'radius-lg', layer: 'raw', value: '1rem' },
    { key: 'radius-full', layer: 'raw', value: '9999px' },
    // Semantic (alias to raw)
    { key: 'color-primary', layer: 'semantic', value: '', alias: 'color-rose-600' },
    { key: 'color-primary-hover', layer: 'semantic', value: '', alias: 'color-rose-800' },
    { key: 'color-primary-light', layer: 'semantic', value: '', alias: 'color-rose-50' },
    { key: 'color-secondary', layer: 'semantic', value: '', alias: 'color-violet-600' },
    { key: 'color-accent', layer: 'semantic', value: '', alias: 'color-amber-500' },
    { key: 'color-background', layer: 'semantic', value: '', alias: 'color-white' },
    { key: 'color-surface', layer: 'semantic', value: '', alias: 'color-gray-50' },
    { key: 'color-text', layer: 'semantic', value: '', alias: 'color-gray-900' },
    { key: 'color-text-secondary', layer: 'semantic', value: '', alias: 'color-gray-600' },
    { key: 'color-text-muted', layer: 'semantic', value: '', alias: 'color-gray-400' },
    { key: 'color-border', layer: 'semantic', value: '', alias: 'color-gray-200' },
    { key: 'color-border-light', layer: 'semantic', value: '', alias: 'color-gray-100' },
    { key: 'spacing-section', layer: 'semantic', value: '', alias: 'space-section' },
    { key: 'spacing-section-mobile', layer: 'semantic', value: '', alias: 'space-section-mobile' },
    { key: 'spacing-container', layer: 'semantic', value: '', alias: 'space-container' },
    { key: 'spacing-gap', layer: 'semantic', value: '', alias: 'space-gap' },
    { key: 'radius-card', layer: 'semantic', value: '', alias: 'radius-lg' },
    { key: 'radius-button', layer: 'semantic', value: '', alias: 'radius-md' },
    // Component tokens (alias to semantic)
    { key: 'button-bg', layer: 'component', value: '', alias: 'color-primary' },
    { key: 'button-color', layer: 'component', value: '', alias: 'color-white' },
    { key: 'button-radius', layer: 'component', value: '', alias: 'radius-button' },
    { key: 'hero-bg', layer: 'component', value: '', alias: 'color-background' },
    { key: 'card-radius', layer: 'component', value: '', alias: 'radius-card' },
    { key: 'card-shadow', layer: 'component', value: '', alias: 'shadow-md' },
    { key: 'countdown-accent', layer: 'component', value: '', alias: 'color-accent' },
    { key: 'footer-bg', layer: 'component', value: '', alias: 'color-primary-light' },
  ],
};
