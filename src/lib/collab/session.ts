/**
 * Collaboration Runtime — ADR-027.
 *
 * Session management, presence, role enforcement, and patch broadcast.
 * Pure core: no WebSocket/network I/O — injects a Transport interface.
 * The Timeline (ADR-020) stores all patches including remote ones.
 */

import { genId } from '../core/id';
import type {
  CollabSession, CollabUser, CollabRole, ConnectionState,
  PresenceState, CursorPosition, RemotePatch,
} from './types';
import type { DocumentPatch } from '../core/history';

// ─── Role permissions ─────────────────────────────────────
const ROLE_CAPABILITIES: Record<CollabRole, string[]> = {
  viewer: ['document.read'],
  commenter: ['document.read', 'document.comment'],
  editor: ['document.read', 'document.patch', 'history.branch', 'history.merge'],
  owner: ['document.read', 'document.patch', 'history.branch', 'history.merge', 'publish',
    'collab.manage'],
};

export function canRole(role: CollabRole, capability: string): boolean {
  return ROLE_CAPABILITIES[role]?.includes(capability) ?? false;
}

// ─── Transport interface ──────────────────────────────────
export interface Transport {
  send(data: unknown): void;
  onMessage(handler: (data: unknown) => void): void;
  close(): void;
}

// ─── PresenceManager ──────────────────────────────────────
export class PresenceManager {
  private presences = new Map<string, PresenceState>();

  update(userId: string, name: string, partial: Partial<PresenceState>, color?: string): void {
    const existing = this.presences.get(userId) ?? { userId, name, lastSeen: Date.now(), color };
    this.presences.set(userId, {
      ...existing,
      ...partial,
      name,
      lastSeen: Date.now(),
      color: color ?? existing.color,
    });
  }

  remove(userId: string): void {
    this.presences.delete(userId);
  }

  getAll(): PresenceState[] {
    return Array.from(this.presences.values());
  }

  get(userId: string): PresenceState | undefined {
    return this.presences.get(userId);
  }

  /**
   * Prune stale entries older than `ageMs` (default 30s).
   * Returns removed userIds.
   */
  prune(ageMs = 30000): string[] {
    const now = Date.now();
    const removed: string[] = [];
    for (const [id, state] of this.presences) {
      if (now - state.lastSeen > ageMs) {
        this.presences.delete(id);
        removed.push(id);
      }
    }
    return removed;
  }

  clear(): void {
    this.presences.clear();
  }
}

// ─── SessionManager ───────────────────────────────────────
export class SessionManager {
  private sessions = new Map<string, CollabSession>();
  private transport: Transport | null = null;
  private messageHandler: ((data: unknown) => void) | null = null;

  /** Join a project collaboration session. */
  join(projectId: string, user: CollabUser, transport: Transport): CollabSession {
    if (!canRole(user.role, 'document.read')) {
      throw new Error(`[collab] role "${user.role}" cannot join`);
    }
    const session: CollabSession = {
      sessionId: genId('collab'),
      user,
      projectId,
      state: 'connecting',
      connectedAt: Date.now(),
    };
    this.sessions.set(session.sessionId, session);
    this.transport = transport;

    transport.onMessage((data) => {
      this.messageHandler?.(data);
    });

    session.state = 'connected';
    return session;
  }

  /** Leave a session (cleanup). */
  leave(sessionId: string): void {
    const s = this.sessions.get(sessionId);
    if (!s) return;
    s.state = 'disconnected';
    this.sessions.delete(sessionId);
    this.transport?.close();
    this.transport = null;
  }

  /** Register handler for incoming messages (patches, presence, etc.). */
  onMessage(handler: (data: unknown) => void): void {
    this.messageHandler = handler;
  }

  /** Get active session for a project. */
  getSession(projectId: string): CollabSession | undefined {
    return Array.from(this.sessions.values()).find(
      (s) => s.projectId === projectId && s.state === 'connected',
    );
  }

  /** Check if a user has a specific capability within their session. */
  can(userId: string, capability: string): boolean {
    const session = Array.from(this.sessions.values()).find((s) => s.user.userId === userId);
    if (!session) return false;
    return canRole(session.user.role, capability);
  }

  /** Send a patch to all remote peers. */
  broadcast(remotePatch: RemotePatch): void {
    if (!this.transport || !this.can(remotePatch.meta.actor, 'document.patch')) return;
    this.transport.send(remotePatch);
  }

  /** Incoming remote patch handler — called by the transport layer. */
  handleRemotePatch(
    remotePatch: RemotePatch,
    applyLocal: (patch: DocumentPatch) => void,
  ): void {
    if (!this.can(remotePatch.meta.actor, 'document.patch')) {
      console.warn('[collab] rejected patch from unauthorized user');
      return;
    }
    applyLocal(remotePatch.patch);
  }
}
