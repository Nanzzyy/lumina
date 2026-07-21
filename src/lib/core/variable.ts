/**
 * Variable resolver + Binding resolution + scope cascade — ADR-003, ADR-016.
 *
 * Resolution order (ADR-016 step 2): scope cascade widest → narrowest;
 * every value is typed (VarType), namespaced (`workspace.*`, `project.*`, …).
 * Pure: no React/DB (R5/R7).
 *
 * Used by the Resolution Pipeline. The DependencyGraph (ADR-016 §DAG) tracks
 * which variables each binding reads so incremental re-resolve works.
 */

import type {
  Resolved, VarScope, VarBinding, ExprBinding, PropValue,
} from './values';
import type { Variable } from './values';
import { isBound, isVarBinding, isExprBinding } from './values';

export interface VarRow {
  variable: Variable;
  /** True if the value comes from a runtime source (countdown `now`, live rows). */
  dynamic: boolean;
}

/** Input to the variable resolver: all variables across all scopes for a document. */
export interface VarScopeInput {
  workspace: Variable[];
  project: Variable[];
  page: Variable[];
  frame: Variable[];
  /** Runtime/system values injected by the editor (e.g. `runtime.now`, `system.locale`). */
  runtime: Variable[];
  system: Variable[];
}

const QUALIFIED_RE = /^(workspace|project|page|frame|runtime|system)\.(.+)$/;

/**
 * Resolve a single variable key against the cascade.
 *
 * - Qualified key (`runtime.now`) → exact scope lookup.
 * - Unqualified key (`couple.bride`) → workspace ⊂ project ⊂ page ⊂ frame cascade
 *   (first found wins, narrowest before widest — CSS-like).
 */
export function resolveVar(scope: VarScopeInput, key: string): Resolved | null {
  const match = key.match(QUALIFIED_RE);
  if (match) {
    const [, scopeName, rest] = match as [string, string, string];
    const pool = (scope as unknown as Record<string, Variable[]>)[scopeName];
    if (!pool) return null;
    const v = pool.find((v) => v.key === rest);
    if (!v) return null;
    return { value: v.value, origin: scopeName as VarScope, dynamic: scopeName === 'runtime' || scopeName === 'system' };
  }

  // Unqualified cascade: workspace → project → page → frame (broadest first, narrowest overrides).
  const cascade: { name: VarScope; vars: Variable[] }[] = [
    { name: 'system', vars: scope.system },
    { name: 'runtime', vars: scope.runtime },
    { name: 'frame', vars: scope.frame },
    { name: 'page', vars: scope.page },
    { name: 'project', vars: scope.project },
    { name: 'workspace', vars: scope.workspace },
  ];
  for (const { name, vars } of cascade) {
    const v = vars.find((v) => v.key === key);
    if (v) return { value: v.value, origin: name, dynamic: name === 'runtime' || name === 'system' };
  }
  return null;
}

/** Gather all variables defined across scopes into a flat map for the DAG. */
export function allVarKeys(scope: VarScopeInput): string[] {
  const keys = new Set<string>();
  for (const pool of Object.values(scope)) {
    for (const v of pool) keys.add(v.key);
  }
  return Array.from(keys);
}

/**
 * Resolve a binding within a prop. Returns the resolved value.
 * Propagates `dynamic: true` when the source is runtime/system.
 */
export function resolveBinding(scope: VarScopeInput, value: PropValue, _key: string): Resolved { // eslint-disable-line @typescript-eslint/no-unused-vars
  if (!isBound(value)) return { value, origin: 'inline', dynamic: false };
  if (isVarBinding(value)) {
    const result = resolveVar(scope, (value as VarBinding).$var);
    return result ?? { value: null, origin: 'inline', dynamic: false };
  }
  if (isExprBinding(value)) {
    // Expression evaluation is a separate pipeline step (ADR-016 step 4).
    // Ensure `expr` steps sees the expression in the resolved output for later evaluation.
    return { value: (value as ExprBinding).$expr, origin: 'inline', dynamic: true };
  }
  return { value, origin: 'inline', dynamic: false };
}

/**
 * Resolve all bindings in a props record, returning a flat value map.
 * Single-pass; does not cascade — the Pipeline calls this per step.
 */
export function resolveProps(scope: VarScopeInput, props: Record<string, PropValue>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(props)) {
    out[key] = resolveBinding(scope, val, key).value;
  }
  return out;
}
