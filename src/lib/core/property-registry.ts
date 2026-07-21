/**
 * Property Registry — ADR-017 (Property Resolution Engine).
 *
 * Every node property type registers a PropertyDef here. The Inspector reads
 * metadata from this registry (no switch/if on type). PropertyDef.toStyle adapts
 * the resolved value to output format (CSS, Flutter, RN, PDF).
 *
 * Pure: no React/DB (R5/R7). Testable — every registered prop round-trips.
 */

import type { ResolveContext } from './resolve';

// ─── Types ──────────────────────────────────────────────────
export type PropertyCategory = 'position' | 'size' | 'layout' | 'typography' | 'border' | 'radius' | 'shadow' | 'effects' | 'background' | 'spacing' | 'appearance';

export type PropertyType =
  | 'number' | 'string' | 'color' | 'boolean' | 'select' | 'unit-slider'
  | 'shadow' | 'gradient' | 'image' | 'radius-4' | 'spacing-4' | 'font'
  | 'css';

export interface SelectOption {
  label: string;
  value: string;
}

export interface PropertyDef {
  key: string;
  category: PropertyCategory;
  type: PropertyType;
  label: string;
  defaultValue: unknown;
  options?: SelectOption[];
  min?: number;
  max?: number;
  step?: number;
  description?: string;
  /** If true, this property maps to a theme token (ADR-018), not raw value. */
  tokenRef?: string;
  /** Inspector widget override. */
  uiWidget?: 'text' | 'color' | 'number' | 'select' | 'slider' | 'spacing-editor' | 'shadow-editor' | 'gradient-editor' | 'radius-editor';
  /** Adapter emit CSS custom properties for the web renderer target. */
  toStyle?(value: unknown, ctx?: ResolveContext): Record<string, string>;
}

// ─── Registry ───────────────────────────────────────────────
const registry = new Map<string, PropertyDef>();

export function registerProperty(def: PropertyDef): void {
  if (registry.has(def.key)) throw new Error(`[registry] duplicate property: ${def.key}`);
  registry.set(def.key, def);
}

export function getProperty(key: string): PropertyDef | undefined {
  return registry.get(key);
}

export function listProperties(category?: PropertyCategory): PropertyDef[] {
  const all = Array.from(registry.values());
  return category ? all.filter((p) => p.category === category) : all;
}

export function listCategories(): PropertyCategory[] {
  const cats = new Set(Array.from(registry.values()).map((p) => p.category));
  return Array.from(cats);
}

export function clearRegistry(): void { registry.clear(); }

// ─── toStyle adapters ──────────────────────────────────────
function px(v: unknown): string {
  const n = Number(v);
  return Number.isFinite(n) ? `${n}px` : String(v ?? '');
}

function pct(v: unknown): string {
  const n = Number(v);
  return Number.isFinite(n) ? `${n}%` : String(v ?? '');
}

// ─── Register all standard properties ──────────────────────
export function registerAllProperties(): void {
  // Position
  registerProperty({ key: 'x', category: 'position', type: 'number', label: 'x', defaultValue: 0, toStyle: (v) => ({ left: px(v) }) });
  registerProperty({ key: 'y', category: 'position', type: 'number', label: 'y', defaultValue: 0, toStyle: (v) => ({ top: px(v) }) });
  registerProperty({ key: 'rotation', category: 'position', type: 'number', label: 'Rotation', defaultValue: 0, step: 0.1, description: 'Degrees (0–360)', toStyle: (v) => ({ transform: `rotate(${v}deg)` }) });
  registerProperty({ key: 'opacity', category: 'appearance', type: 'number', label: 'Opacity', defaultValue: 1, min: 0, max: 1, step: 0.01, toStyle: (v) => ({ opacity: String(v) }) });

  // Size
  registerProperty({ key: 'width', category: 'size', type: 'unit-slider', label: 'Width', defaultValue: 'auto', uiWidget: 'slider', toStyle: (v) => ({ width: v === 'auto' ? 'auto' : px(v) }) });
  registerProperty({ key: 'height', category: 'size', type: 'unit-slider', label: 'Height', defaultValue: 'auto', uiWidget: 'slider', toStyle: (v) => ({ height: v === 'auto' ? 'auto' : px(v) }) });
  registerProperty({ key: 'minWidth', category: 'size', type: 'number', label: 'Min Width', defaultValue: 0, toStyle: (v) => ({ minWidth: px(v) }) });
  registerProperty({ key: 'maxWidth', category: 'size', type: 'number', label: 'Max Width', defaultValue: 0, toStyle: (v) => ({ maxWidth: px(v) }) });

  // Layout
  registerProperty({ key: 'layout', category: 'layout', type: 'select', label: 'Layout Mode', defaultValue: 'absolute', options: [
    { label: 'Absolute', value: 'absolute' }, { label: 'Flex', value: 'flex' }, { label: 'Grid', value: 'grid' },
  ], toStyle: (v) => (v === 'flex' ? { display: 'flex' } : v === 'grid' ? { display: 'grid' } : { position: 'absolute' }) as Record<string, string> });
  registerProperty({ key: 'flexDirection', category: 'layout', type: 'select', label: 'Direction', defaultValue: 'column', options: [
    { label: 'Column', value: 'column' }, { label: 'Row', value: 'row' },
  ], toStyle: (v) => ({ flexDirection: String(v) }) });
  registerProperty({ key: 'gap', category: 'layout', type: 'number', label: 'Gap', defaultValue: 0, toStyle: (v) => ({ gap: px(v) }) });
  registerProperty({ key: 'alignItems', category: 'layout', type: 'select', label: 'Align', defaultValue: 'start', options: [
    { label: 'Start', value: 'start' }, { label: 'Center', value: 'center' }, { label: 'End', value: 'end' }, { label: 'Stretch', value: 'stretch' },
  ], toStyle: (v) => ({ alignItems: String(v) }) });
  registerProperty({ key: 'justifyContent', category: 'layout', type: 'select', label: 'Justify', defaultValue: 'start', options: [
    { label: 'Start', value: 'start' }, { label: 'Center', value: 'center' }, { label: 'End', value: 'end' }, { label: 'Between', value: 'space-between' },
  ], toStyle: (v) => ({ justifyContent: String(v) }) });
  registerProperty({ key: 'padding', category: 'layout', type: 'spacing-4', label: 'Padding', defaultValue: '0', uiWidget: 'spacing-editor', toStyle: (v) => {
    if (typeof v === 'string') return { padding: v };
    if (Array.isArray(v) && v.length === 4) return { padding: v.map(px).join(' ') };
    return { padding: px(v ?? 0) };
  } });

  // Typography
  registerProperty({ key: 'fontFamily', category: 'typography', type: 'font', label: 'Font Family', defaultValue: 'inherit', tokenRef: 'typography.font-body', toStyle: (v) => ({ fontFamily: String(v) }) });
  registerProperty({ key: 'fontSize', category: 'typography', type: 'number', label: 'Font Size', defaultValue: 16, min: 8, max: 200, toStyle: (v) => ({ fontSize: px(v) }) });
  registerProperty({ key: 'fontWeight', category: 'typography', type: 'select', label: 'Font Weight', defaultValue: '400', options: [
    { label: 'Light', value: '300' }, { label: 'Regular', value: '400' }, { label: 'Medium', value: '500' }, { label: 'Semibold', value: '600' }, { label: 'Bold', value: '700' },
  ], toStyle: (v) => ({ fontWeight: String(v) }) });
  registerProperty({ key: 'lineHeight', category: 'typography', type: 'number', label: 'Line Height', defaultValue: 1.5, step: 0.1, toStyle: (v) => ({ lineHeight: String(v) }) });
  registerProperty({ key: 'letterSpacing', category: 'typography', type: 'number', label: 'Letter Spacing', defaultValue: 0, step: 0.05, toStyle: (v) => ({ letterSpacing: px(v) }) });
  registerProperty({ key: 'textAlign', category: 'typography', type: 'select', label: 'Text Align', defaultValue: 'left', options: [
    { label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' },
  ], toStyle: (v) => ({ textAlign: String(v) }) });
  registerProperty({ key: 'color', category: 'typography', type: 'color', label: 'Text Color', defaultValue: '#000000', tokenRef: 'colors.text', toStyle: (v) => ({ color: String(v) }) });

  // Border
  registerProperty({ key: 'borderWidth', category: 'border', type: 'number', label: 'Border Width', defaultValue: 0, toStyle: (v) => ({ borderWidth: px(v) }) });
  registerProperty({ key: 'borderStyle', category: 'border', type: 'select', label: 'Border Style', defaultValue: 'solid', options: [
    { label: 'Solid', value: 'solid' }, { label: 'Dashed', value: 'dashed' }, { label: 'Dotted', value: 'dotted' }, { label: 'None', value: 'none' },
  ], toStyle: (v) => ({ borderStyle: String(v) }) });
  registerProperty({ key: 'borderColor', category: 'border', type: 'color', label: 'Border Color', defaultValue: '#e5e7eb', tokenRef: 'colors.border', toStyle: (v) => ({ borderColor: String(v) }) });

  // Radius
  registerProperty({ key: 'borderRadius', category: 'radius', type: 'radius-4', label: 'Border Radius', defaultValue: 0, uiWidget: 'radius-editor', toStyle: (v) => {
    if (typeof v === 'string') return { borderRadius: v };
    if (Array.isArray(v) && v.length === 4) return { borderRadius: v.map(px).join(' ') };
    return { borderRadius: px(v ?? 0) };
  } });
  registerProperty({ key: 'borderRadiusTopLeft', category: 'radius', type: 'number', label: 'Top Left', defaultValue: 0, toStyle: (v) => ({ borderTopLeftRadius: px(v) }) });
  registerProperty({ key: 'borderRadiusTopRight', category: 'radius', type: 'number', label: 'Top Right', defaultValue: 0, toStyle: (v) => ({ borderTopRightRadius: px(v) }) });
  registerProperty({ key: 'borderRadiusBottomLeft', category: 'radius', type: 'number', label: 'Bottom Left', defaultValue: 0, toStyle: (v) => ({ borderBottomLeftRadius: px(v) }) });
  registerProperty({ key: 'borderRadiusBottomRight', category: 'radius', type: 'number', label: 'Bottom Right', defaultValue: 0, toStyle: (v) => ({ borderBottomRightRadius: px(v) }) });

  // Shadow
  registerProperty({ key: 'boxShadow', category: 'shadow', type: 'shadow', label: 'Box Shadow', defaultValue: 'none', uiWidget: 'shadow-editor', toStyle: (v) => ({ boxShadow: String(v) }) });

  // Background
  registerProperty({ key: 'backgroundColor', category: 'background', type: 'color', label: 'Background Color', defaultValue: 'transparent', tokenRef: 'colors.surface', toStyle: (v) => ({ backgroundColor: String(v) }) });
  registerProperty({ key: 'backgroundImage', category: 'background', type: 'image', label: 'Background Image', defaultValue: undefined, toStyle: (v) => (v ? { backgroundImage: `url(${v})` } : {}) as Record<string, string> });
  registerProperty({ key: 'backgroundGradient', category: 'background', type: 'gradient', label: 'Gradient', defaultValue: undefined, uiWidget: 'gradient-editor', toStyle: (v) => (v ? { background: String(v) } : {}) as Record<string, string> });
  registerProperty({ key: 'backgroundSize', category: 'background', type: 'select', label: 'Size', defaultValue: 'cover', options: [
    { label: 'Cover', value: 'cover' }, { label: 'Contain', value: 'contain' }, { label: 'Auto', value: 'auto' },
  ], toStyle: (v) => ({ backgroundSize: String(v) }) });

  // Effects
  registerProperty({ key: 'backdropFilter', category: 'effects', type: 'css', label: 'Backdrop Blur', defaultValue: undefined, toStyle: (v) => (v ? { backdropFilter: String(v) } : {}) as Record<string, string> });
  registerProperty({ key: 'mixBlendMode', category: 'effects', type: 'select', label: 'Blend Mode', defaultValue: undefined, options: [
    { label: 'Normal', value: 'normal' }, { label: 'Multiply', value: 'multiply' }, { label: 'Screen', value: 'screen' }, { label: 'Overlay', value: 'overlay' },
  ], toStyle: (v) => (v ? { mixBlendMode: String(v) } : {}) as Record<string, string> });
}
