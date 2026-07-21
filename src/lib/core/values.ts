/**
 * Value layer — ADR-003 (Variable & Binding) + Data Source Engine.
 *
 * A prop value is either a literal, a variable binding, or an expression binding.
 * Variables are typed, scoped, namespaced. Data Sources are typed collections
 * the Expression Engine (ADR-004) can read and the renderer can iterate.
 */

// ─── Variables (ADR-003) ────────────────────────────────────
export type VarType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'color'
  | 'date'
  | 'image'
  | 'enum'
  | 'ref';

export type VarScope = 'workspace' | 'project' | 'page' | 'frame' | 'runtime' | 'system';

/**
 * Variable keys are namespaced by origin (ADR-003 §namespaces):
 * `workspace.*`, `project.*`, `page.*`, `frame.*`, `runtime.*`, `system.*`.
 * Unqualified keys resolve via scope cascade; qualified keys bypass it.
 */
export interface Variable {
  id: string;
  scope: VarScope;
  key: string;
  type: VarType;
  value: unknown;
  fallback?: unknown;
  meta?: { label?: string; group?: string; description?: string };
}

// ─── Bindings ───────────────────────────────────────────────
export interface VarBinding {
  $var: string;
}
export interface ExprBinding {
  $expr: string;
}

/** A prop value: literal, variable binding, or expression binding. */
export type PropValue = unknown | VarBinding | ExprBinding;

export function isVarBinding(v: unknown): v is VarBinding {
  return typeof v === 'object' && v !== null && '$var' in v;
}
export function isExprBinding(v: unknown): v is ExprBinding {
  return typeof v === 'object' && v !== null && '$expr' in v;
}
export function isBound(v: unknown): v is VarBinding | ExprBinding {
  return isVarBinding(v) || isExprBinding(v);
}

/** Origin of a resolved value — drives cascade + telemetry. */
export type ResolveOrigin = 'workspace' | 'project' | 'page' | 'frame' | 'runtime' | 'system' | 'inline';

export interface Resolved<T = unknown> {
  value: T;
  origin: ResolveOrigin;
  /** Static values bake at publish; dynamic values hydrate (ADR-008). */
  dynamic: boolean;
}

// ─── Data Sources ───────────────────────────────────────────
export type DataSourceKind = 'collection' | 'record';
export type DataSourceOrigin = 'local' | 'table' | 'plugin';

export interface RecordField {
  key: string;
  type: VarType;
  label?: string;
}
export interface RecordSchema {
  fields: RecordField[];
}
export interface DataSource {
  id: string;
  scope: VarScope;
  key: string;
  kind: DataSourceKind;
  schema: RecordSchema;
  /** Inline rows for `local`; table name for `table`; plugin ref for `plugin`. */
  source: DataSourceOrigin;
  rows?: Record<string, unknown>[];
  config?: { table?: string; pluginId?: string; query?: string };
}
