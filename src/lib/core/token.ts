/**
 * 3-layer Design Tokens — ADR-003 §token-engine.
 *
 * raw → semantic → component. A Theme is a mapping; components reference semantic
 * or component tokens (never raws directly), so changing one raw cascades.
 * Emitted as CSS vars for publish; in-memory maps for editor.
 */

export type TokenLayer = 'raw' | 'semantic' | 'component';

export type TokenValue = string | number;

export interface Token {
  layer: TokenLayer;
  key: string;
  value: TokenValue;
  /** Alias to another token, e.g. semantic `color-primary` → raw `color-rose-600`. */
  alias?: string;
}

/** A pack of tokens shipped by a theme or plugin. */
export interface TokenPack {
  tokens: Token[];
}

export type TokenScale = Record<string, TokenValue>;

/**
 * Theme tokens grouped by category. Mirrors existing ThemeConfig
 * (src/lib/theme/types.ts) but expressed as token scales so a theme is data.
 */
export interface ThemeTokens {
  raw: TokenScale;
  semantic: TokenScale;
  component: TokenScale;
  /** Per-component token overrides keyed by component id. */
  byComponent?: Record<string, TokenScale>;
}
