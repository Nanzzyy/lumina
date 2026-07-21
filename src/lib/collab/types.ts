/**
 * Collaboration types — ADR-027, ADR-028.
 */

import type { DocumentPatch } from '../core/history';

// ─── Session ────────────────────────────────────────────────
export type ConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export type CollabRole = 'viewer' | 'commenter' | 'editor' | 'owner';

export interface CollabUser {
  userId: string;
  name: string;
  role: CollabRole;
  avatar?: string;
  color?: string;    // hex for cursor/selection overlay
}

export interface CollabSession {
  sessionId: string;
  user: CollabUser;
  projectId: string;
  state: ConnectionState;
  connectedAt: number;
}

// ─── Presence (ADR-027 §presence) ─────────────────────────
export interface CursorPosition {
  x: number;
  y: number;
}

export interface PresenceState {
  userId: string;
  name: string;
  cursor?: CursorPosition;
  selectedNodeIds?: string[];
  viewport?: { zoom: number; panX: number; panY: number };
  lastSeen: number;
  color?: string;
}

// ─── Patch broadcast (ADR-028) ────────────────────────────
export interface RemotePatch {
  patch: DocumentPatch;
  meta: {
    actor: string;       // userId
    session: string;     // sessionId
    clock: number;       // logical clock
    branch: string;      // 'main' or branch name
    timestamp: number;   // wall clock (for display only)
  };
}

// ─── Logical clock (ADR-028) ──────────────────────────────
export interface LogicalClock {
  /** Current clock value. Monotonic within a session. */
  value: number;
  /** Advance by one tick and return the new value. */
  tick(): number;
  /** Merge with a remote clock (take the max). */
  merge(remote: number): void;
}
