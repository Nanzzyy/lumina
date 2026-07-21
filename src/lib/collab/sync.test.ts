import { describe, it, expect, beforeEach } from 'vitest';
import {
  LamportClock, detectConflict, mergePatches, resolveLWW,
  OfflineQueue, tagRemotePatch,
} from './sync';
import type { DocumentPatch } from '../core/history';
import type { RemotePatch } from './types';

describe('operational sync (ADR-028)', () => {
  describe('LamportClock', () => {
    let c: LamportClock;

    beforeEach(() => { c = new LamportClock(); });

    it('starts at 0', () => {
      expect(c.value).toBe(0);
    });

    it('tick increments', () => {
      expect(c.tick()).toBe(1);
      expect(c.tick()).toBe(2);
    });

    it('merge takes max + 1', () => {
      c.merge(10);
      expect(c.value).toBe(11);
    });

    it('reset clears', () => {
      c.tick();
      c.reset();
      expect(c.value).toBe(0);
    });
  });

  describe('conflict detection', () => {
    it('detects auto-merge for disjoint paths', () => {
      const local: DocumentPatch = [{ op: 'replace', path: '/a', value: 1 }];
      const remote: DocumentPatch = [{ op: 'replace', path: '/b', value: 2 }];
      expect(detectConflict(local, remote)).toBe('auto-merge');
    });

    it('detects LWW for same path replace', () => {
      const local: DocumentPatch = [{ op: 'replace', path: '/a', value: 1 }];
      const remote: DocumentPatch = [{ op: 'replace', path: '/a', value: 2 }];
      expect(detectConflict(local, remote)).toBe('lww');
    });

    it('detects manual for remove + edit conflict', () => {
      const local: DocumentPatch = [{ op: 'remove', path: '/nodes/0' }];
      const remote: DocumentPatch = [{ op: 'replace', path: '/nodes/0/color', value: 'red' }];
      expect(detectConflict(local, remote)).toBe('manual');
    });

    it('detects LWW for add at same path', () => {
      const local: DocumentPatch = [{ op: 'add', path: '/nodes/-', value: { id: 'n1' } }];
      const remote: DocumentPatch = [{ op: 'add', path: '/nodes/-', value: { id: 'n2' } }];
      // '-' isn't a specific index path — treat as LWW
      expect(detectConflict(local, remote)).toBe('lww');
    });
  });

  describe('mergePatches', () => {
    it('concatenates disjoint patches', () => {
      const a: DocumentPatch = [{ op: 'replace', path: '/a', value: 1 }];
      const b: DocumentPatch = [{ op: 'replace', path: '/b', value: 2 }];
      expect(mergePatches(a, b)).toHaveLength(2);
    });
  });

  describe('resolveLWW', () => {
    it('later clock wins', () => {
      const local: DocumentPatch = [{ op: 'replace', path: '/a', value: 'local' }];
      const remote: DocumentPatch = [{ op: 'replace', path: '/a', value: 'remote' }];
      const result = resolveLWW(local, remote, 1, 2);
      expect(result).toBe(remote);
    });

    it('earlier clock loses', () => {
      const local: DocumentPatch = [{ op: 'replace', path: '/a', value: 'local' }];
      const remote: DocumentPatch = [{ op: 'replace', path: '/a', value: 'remote' }];
      const result = resolveLWW(local, remote, 5, 3);
      expect(result).toBe(local);
    });

    it('equal clock: remote wins (tiebreaker)', () => {
      const local: DocumentPatch = [{ op: 'replace', path: '/a', value: 'local' }];
      const remote: DocumentPatch = [{ op: 'replace', path: '/a', value: 'remote' }];
      const result = resolveLWW(local, remote, 3, 3);
      expect(result).toBe(remote);
    });
  });

  describe('OfflineQueue', () => {
    let q: OfflineQueue;

    beforeEach(() => { q = new OfflineQueue(); });

    it('enqueue adds to queue', () => {
      q.enqueue([{ op: 'replace', path: '/a', value: 1 }], 1);
      expect(q.length).toBe(1);
    });

    it('drain returns all and clears', () => {
      q.enqueue([{ op: 'replace', path: '/a', value: 1 }], 1);
      q.enqueue([{ op: 'replace', path: '/b', value: 2 }], 2);
      const items = q.drain();
      expect(items).toHaveLength(2);
      expect(q.length).toBe(0);
    });

    it('peek returns items without clearing', () => {
      q.enqueue([{ op: 'replace', path: '/a', value: 1 }], 1);
      expect(q.peek()).toHaveLength(1);
      expect(q.length).toBe(1);
    });

    it('clear empties queue', () => {
      q.enqueue([{ op: 'replace', path: '/a', value: 1 }], 1);
      q.clear();
      expect(q.length).toBe(0);
    });
  });

  describe('tagRemotePatch', () => {
    it('creates CommandMeta from remote patch', () => {
      const rp: RemotePatch = {
        patch: [{ op: 'replace', path: '/a', value: 1 }],
        meta: { actor: 'Alice', session: 's1', clock: 5, branch: 'main', timestamp: 100 },
      };
      const meta = tagRemotePatch(rp, 6);
      expect(meta.source).toBe('collab');
      expect(meta.label).toContain('Alice');
    });
  });
});
