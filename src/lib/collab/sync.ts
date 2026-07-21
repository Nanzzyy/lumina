/**
 * Operational Synchronization — ADR-028.
 *
 * Logical clock, conflict detection, merge (auto-merge / LWW / manual),
 * offline queue with replay on reconnect. Pure: no I/O.
 */

import { genId } from '../core/id';
import type { DocumentPatch, PatchOp } from '../core/history';
import type { RemotePatch, LogicalClock } from './types';

// ─── LogicalClock (Lamport clock) ──────────────────────────
export class LamportClock implements LogicalClock {
  value = 0;

  tick(): number {
    this.value += 1;
    return this.value;
  }

  merge(remote: number): void {
    this.value = Math.max(this.value, remote) + 1;
  }

  reset(): void {
    this.value = 0;
  }
}

// ─── Conflict types ────────────────────────────────────────
export type ConflictResultKind = 'auto-merge' | 'lww' | 'manual';

export interface ConflictResult {
  kind: ConflictResultKind;
  /** The resolved patch (for auto-merge and LWW). */
  resolved: DocumentPatch;
  /** Conflicting ops that need manual resolution (for manual kind). */
  conflicts?: { local: PatchOp; remote: PatchOp }[];
}

// ─── Conflict detection ────────────────────────────────────
/**
 * Check if two patches overlap. Two ops conflict when they target the same
 * JSON-pointer path with write operations.
 */
function opsOverlap(a: PatchOp, b: PatchOp): boolean {
  // Remove and add at same path
  if ((a.op === 'remove' || a.op === 'replace') && (b.op === 'remove' || b.op === 'replace')) {
    // Only if same path or one is a parent of the other
    return a.path === b.path || a.path.startsWith(b.path + '/') || b.path.startsWith(a.path + '/');
  }
  if (a.op === 'add' && b.op === 'add') return a.path === b.path;
  return a.path === b.path;
}

/**
 * Detect conflicts between a local and a remote patch.
 */
export function detectConflict(local: DocumentPatch, remote: DocumentPatch): ConflictResultKind {
  for (const a of local) {
    for (const b of remote) {
      if (opsOverlap(a, b)) {
        // Destructive ops (remove node + edit same node) → manual
        if (a.op === 'remove' || b.op === 'remove') return 'manual';
        // Same path different values → LWW
        return 'lww';
      }
    }
  }
  return 'auto-merge';
}

/**
 * Merge two non-conflicting patches. Returns concatenation (order-independent
 * because they operate on disjoint paths).
 */
export function mergePatches(local: DocumentPatch, remote: DocumentPatch): DocumentPatch {
  return [...local, ...remote];
}

/**
 * Resolve conflicting patches using LWW (later clock wins).
 * Returns the winner's patch.
 */
export function resolveLWW(local: DocumentPatch, remote: DocumentPatch, localClock: number, remoteClock: number): DocumentPatch {
  return remoteClock >= localClock ? remote : local;
}

// ─── Offline queue (ADR-027 §offline) ─────────────────────
export interface QueuedPatch {
  id: string;
  patch: DocumentPatch;
  clock: number;
  queuedAt: number;
}

export class OfflineQueue {
  private queue: QueuedPatch[] = [];

  /** Enqueue a patch while offline. */
  enqueue(patch: DocumentPatch, clock: number): QueuedPatch {
    const qp: QueuedPatch = { id: genId('off'), patch, clock, queuedAt: Date.now() };
    this.queue.push(qp);
    return qp;
  }

  /** Drain the queue — returns all patches and clears. */
  drain(): QueuedPatch[] {
    const items = [...this.queue];
    this.queue = [];
    return items;
  }

  /** Peek at queued patches (for conflict detection on reconnect). */
  peek(): QueuedPatch[] {
    return [...this.queue];
  }

  /** Number of queued patches. */
  get length(): number {
    return this.queue.length;
  }

  /** Clear the queue (e.g. on discard). */
  clear(): void {
    this.queue = [];
  }
}

// ─── Metadata tagging ─────────────────────────────────────
import type { CommandMeta } from '../core/history';

export function tagRemotePatch(
  rp: RemotePatch,
  clock: number,
): CommandMeta {
  return {
    source: 'collab',
    label: `[${rp.meta.actor}] ${rp.meta.branch ?? 'main'}`,
  };
}
