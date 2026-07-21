import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SessionManager, PresenceManager, canRole } from './session';
import type { CollabUser, RemotePatch } from './types';
import type { Transport } from './session';

const mockTransport = (): Transport => {
  const handlers: ((data: unknown) => void)[] = [];
  return {
    send: vi.fn(),
    onMessage: vi.fn((h) => handlers.push(h)),
    close: vi.fn(),
  };
};

const editorUser: CollabUser = { userId: 'u1', name: 'Alice', role: 'editor' };
const viewerUser: CollabUser = { userId: 'u2', name: 'Bob', role: 'viewer' };

describe('collaboration runtime (ADR-027)', () => {
  describe('canRole', () => {
    it('editor can read and patch', () => {
      expect(canRole('editor', 'document.read')).toBe(true);
      expect(canRole('editor', 'document.patch')).toBe(true);
    });
    it('viewer can only read', () => {
      expect(canRole('viewer', 'document.read')).toBe(true);
      expect(canRole('viewer', 'document.patch')).toBe(false);
    });
    it('owner can do everything including publish', () => {
      expect(canRole('owner', 'publish')).toBe(true);
      expect(canRole('owner', 'collab.manage')).toBe(true);
    });
    it('commenter can read and comment but not patch', () => {
      expect(canRole('commenter', 'document.comment')).toBe(true);
      expect(canRole('commenter', 'document.patch')).toBe(false);
    });
  });

  describe('PresenceManager', () => {
    let pm: PresenceManager;

    beforeEach(() => { pm = new PresenceManager(); });

    it('update adds or updates presence', () => {
      pm.update('u1', 'Alice', { cursor: { x: 10, y: 20 } });
      expect(pm.get('u1')!.name).toBe('Alice');
      expect(pm.get('u1')!.cursor).toEqual({ x: 10, y: 20 });
    });

    it('update preserves existing fields', () => {
      pm.update('u1', 'Alice', { selectedNodeIds: ['n1'] });
      pm.update('u1', 'Alice', { cursor: { x: 5, y: 5 } });
      expect(pm.get('u1')!.selectedNodeIds).toEqual(['n1']);
      expect(pm.get('u1')!.cursor).toEqual({ x: 5, y: 5 });
    });

    it('remove deletes presence', () => {
      pm.update('u1', 'Alice', {});
      pm.remove('u1');
      expect(pm.get('u1')).toBeUndefined();
    });

    it('prune removes stale entries', () => {
      pm.update('u1', 'Alice', {});
      // Force lastSeen to be old
      const state = pm.get('u1')!;
      state.lastSeen = Date.now() - 60000;
      const removed = pm.prune(30000);
      expect(removed).toContain('u1');
    });

    it('getAll returns all presences', () => {
      pm.update('u1', 'Alice', {});
      pm.update('u2', 'Bob', {});
      expect(pm.getAll()).toHaveLength(2);
    });
  });

  describe('SessionManager', () => {
    let sm: SessionManager;

    beforeEach(() => { sm = new SessionManager(); });

    it('join creates a connected session', () => {
      const s = sm.join('proj-1', editorUser, mockTransport());
      expect(s.state).toBe('connected');
      expect(s.projectId).toBe('proj-1');
    });

    it('viewer can also join (read permission)', () => {
      const s = sm.join('proj-1', viewerUser, mockTransport());
      expect(s.state).toBe('connected');
    });

    it('leave disconnects and removes session', () => {
      const s = sm.join('proj-1', editorUser, mockTransport());
      sm.leave(s.sessionId);
      expect(sm.getSession('proj-1')).toBeUndefined();
    });

    it('broadcast sends remote patch via transport', () => {
      const t = mockTransport();
      sm.join('proj-1', editorUser, t);
      const rp: RemotePatch = {
        patch: [{ op: 'replace', path: '/a', value: 1 }],
        meta: { actor: 'u1', session: 's1', clock: 1, branch: 'main', timestamp: Date.now() },
      };
      sm.broadcast(rp);
      expect(t.send).toHaveBeenCalledWith(rp);
    });

    it('broadcast blocked for viewer role', () => {
      const t = mockTransport();
      sm.join('proj-1', viewerUser, t);
      sm.broadcast({
        patch: [{ op: 'replace', path: '/a', value: 1 }],
        meta: { actor: 'u2', session: 's2', clock: 1, branch: 'main', timestamp: Date.now() },
      });
      expect(t.send).not.toHaveBeenCalled();
    });

    it('handleRemotePatch blocks unauthorized users', () => {
      const applyLocal = vi.fn();
      sm.join('proj-1', viewerUser, mockTransport());
      sm.handleRemotePatch({
        patch: [{ op: 'replace', path: '/a', value: 99 }],
        meta: { actor: 'u2', session: 's2', clock: 1, branch: 'main', timestamp: Date.now() },
      }, applyLocal);
      expect(applyLocal).not.toHaveBeenCalled();
    });

    it('can checks capability by userId', () => {
      sm.join('proj-1', editorUser, mockTransport());
      expect(sm.can('u1', 'document.patch')).toBe(true);
      expect(sm.can('u1', 'publish')).toBe(false);
    });
  });
});
