/**
 * Event Runtime & Scheduler — ADR-007.
 *
 * EventRule = Trigger → (schedule) → Condition → Action. The Runtime exposes a
 * Read API (side-effect free, safe to hand broadly) and a Mutate API (requires
 * 'runtime.mutate' permission). One execution model in editor, preview, publish.
 */

import type { DocumentPatch } from './history';
import type { Resolved } from './values';

// ─── Triggers ───────────────────────────────────────────────
export type Trigger =
  | { kind: 'load' }
  | { kind: 'click' | 'hover' | 'scroll-into-view'; nodeId: string }
  | { kind: 'scroll' }
  | { kind: 'countdown-end'; nodeId: string }
  | { kind: 'data-submit'; dataSource: string }
  | { kind: 'time'; at: string }
  | { kind: 'variable-change'; key: string }
  | { kind: 'custom'; ref: string };

// ─── Scheduler ──────────────────────────────────────────────
export type ScheduleSpec =
  | { type: 'interval'; ms: number }
  | { type: 'delay'; ms: number }
  | { type: 'debounce'; ms: number }
  | { type: 'throttle'; ms: number }
  | { type: 'cron'; expr: string };

// ─── Actions ────────────────────────────────────────────────
export type Action =
  | { kind: 'play-music' | 'pause-music' | 'open-modal' | 'close-modal' | 'navigate' | 'show' | 'hide' | 'scroll-to'; target?: string }
  | { kind: 'set-variable'; key: string; value: unknown }
  | { kind: 'run-animation'; animationId: string }
  | { kind: 'call-plugin'; pluginAction: string; config?: Record<string, unknown> };

export interface EventRule {
  id: string;
  trigger: Trigger;
  schedule?: ScheduleSpec;
  /** Expression (ADR-004) that must resolve truthy for actions to run. */
  condition?: string;
  actions: Action[];
  priority?: number;
}

export interface CancelHandle {
  cancel(): void;
}

// ─── Runtime API (ADR-007 §read-vs-mutate) ──────────────────
export interface RuntimeRead {
  resolveVariable(key: string): Resolved;
  resolveToken(path: string): string;
  evaluateExpression(expr: string, ctx?: Record<string, unknown>): Resolved;
}

export interface RuntimeMutate {
  applyPatch(patch: DocumentPatch): void;
  dispatchEvent(trigger: Trigger, payload?: unknown): void;
  setVariable(key: string, value: unknown): void;
  runAnimation(id: string, opts?: Record<string, unknown>): CancelHandle;
}

export interface Runtime extends RuntimeRead, RuntimeMutate {}
