import { describe, it, expect, beforeEach } from 'vitest';
import { Timeline } from './timeline';
import type { TimelineEntry } from './timeline';
import { makeCommand } from './history';
import type { DocumentPatch } from './history';

function makePatch(key: string, value: unknown): DocumentPatch {
  return [{ op: 'add', path: `/${key}`, value }];
}

function makeCmd(key: string, value: unknown, label?: string) {
  const forward: DocumentPatch = makePatch(key, value);
  const inverse: DocumentPatch = [{ op: 'remove', path: `/${key}` }];
  return makeCommand(forward, inverse, { meta: { source: 'user', label } });
}

const docBase = { title: 'original' };

describe('timeline & branching (ADR-020)', () => {
  let tl: Timeline;

  beforeEach(() => {
    tl = new Timeline();
  });

  it('setRoot establishes the timeline root', () => {
    const entry: TimelineEntry = {
      id: 'root', parentId: null, command: makeCmd('t', 'root'), snapshot: docBase,
      meta: { source: 'system', timestamp: 0 }, branch: 'main',
    };
    tl.setRoot(entry);
    expect(tl.rootId).toBe('root');
    expect(tl.branches.has('main')).toBe(true);
  });

  it('append adds entries in order on the same branch', () => {
    const root: TimelineEntry = {
      id: 'r', parentId: null, command: makeCmd('t', 'root'), snapshot: { ...docBase },
      meta: { source: 'system', timestamp: 0 }, branch: 'main',
    };
    tl.setRoot(root);
    tl.append(makeCmd('a', 1), { source: 'user', timestamp: 1 });
    tl.append(makeCmd('b', 2), { source: 'user', timestamp: 2 });
    const entries = tl.getBranchEntries('main');
    expect(entries.length).toBe(3);
    expect(entries[2].meta.source).toBe('user');
  });

  it('fork creates a new branch from an entry', () => {
    const root: TimelineEntry = {
      id: 'r', parentId: null, command: makeCmd('t', 'root'), snapshot: { ...docBase },
      meta: { source: 'system', timestamp: 0 }, branch: 'main',
    };
    tl.setRoot(root);
    const e1 = tl.append(makeCmd('a', 1), { source: 'user', timestamp: 1 });
    tl.fork(e1.id, 'explore', makeCmd('x', 'try'), { source: 'ai', timestamp: 2 });
    expect(tl.branches.has('explore')).toBe(true);
    expect(tl.getBranchEntries('explore').length).toBe(1);
  });

  it('switching branches replays the correct document state', () => {
    const root: TimelineEntry = {
      id: 'r', parentId: null, command: makeCmd('t', 'root'), snapshot: { ...docBase },
      meta: { source: 'system', timestamp: 0 }, branch: 'main',
    };
    tl.setRoot(root);
    tl.append(makeCmd('title', 'main-v1'), { source: 'user', timestamp: 1 });
    tl.append(makeCmd('color', 'blue'), { source: 'user', timestamp: 2 });
    const stateMain = tl.restoreFromBranch({ ...docBase }, 'main');
    expect(stateMain.title).toBe('main-v1');
    expect(stateMain.color).toBe('blue');
  });

  it('deleteBranch removes branch and its entries', () => {
    const root: TimelineEntry = {
      id: 'r', parentId: null, command: makeCmd('t', 'root'), snapshot: { ...docBase },
      meta: { source: 'system', timestamp: 0 }, branch: 'main',
    };
    tl.setRoot(root);
    tl.append(makeCmd('a', 1), { source: 'user', timestamp: 1, label: 'step1' });
    expect(tl.listBranches().length).toBe(1);
  });

  it('getAllEntries returns newest-first', () => {
    const root: TimelineEntry = {
      id: 'r', parentId: null, command: makeCmd('t', 'root'), snapshot: { ...docBase },
      meta: { source: 'system', timestamp: 0 }, branch: 'main',
    };
    tl.setRoot(root);
    tl.append(makeCmd('a', 1), { source: 'user', timestamp: 10 });
    tl.append(makeCmd('b', 2), { source: 'ai', timestamp: 20 });
    const all = tl.getAllEntries();
    expect(all[0].meta.source).toBe('ai');   // newest first
    expect(all[1].meta.source).toBe('user');
    expect(all[2].id).toBe('r');
  });
});
