import { describe, it, expect } from 'vitest';
import { applyPatch, computeInverse, makeCommand } from './history';
import type { DocumentPatch } from './history';

describe('applyPatch (ADR-010)', () => {
  it('adds to an object key', () => {
    const out = applyPatch({ a: 1 }, [{ op: 'add', path: '/b', value: 2 }]);
    expect(out).toEqual({ a: 1, b: 2 });
  });

  it('replaces a value and does not mutate input', () => {
    const doc = { a: { b: 1 } };
    const out = applyPatch(doc, [{ op: 'replace', path: '/a/b', value: 9 }]);
    expect(out).toEqual({ a: { b: 9 } });
    expect(doc).toEqual({ a: { b: 1 } }); // immutable
  });

  it('removes a key', () => {
    const out = applyPatch({ a: 1, b: 2 }, [{ op: 'remove', path: '/b' }]);
    expect(out).toEqual({ a: 1 });
  });

  it('appends to an array with "-"', () => {
    const out = applyPatch({ xs: [1] }, [{ op: 'add', path: '/xs/-', value: 2 }]);
    expect(out).toEqual({ xs: [1, 2] });
  });

  it('inserts into an array at index (shifts)', () => {
    const out = applyPatch({ xs: [1, 3] }, [{ op: 'add', path: '/xs/1', value: 2 }]);
    expect(out).toEqual({ xs: [1, 2, 3] });
  });

  it('moves a value between paths (RFC 6902: source removed)', () => {
    const out = applyPatch({ a: 1, b: null }, [
      { op: 'move', from: '/a', path: '/b' },
    ]);
    expect(out).toEqual({ b: 1 });
  });

  it('copies a value', () => {
    const out = applyPatch({ a: 1 }, [{ op: 'copy', from: '/a', path: '/b' }]);
    expect(out).toEqual({ a: 1, b: 1 });
  });
});

describe('computeInverse (round-trip)', () => {
  const cases: { name: string; doc: unknown; patch: DocumentPatch }[] = [
    { name: 'add', doc: { a: 1 }, patch: [{ op: 'add', path: '/b', value: 2 }] },
    { name: 'replace', doc: { a: 1 }, patch: [{ op: 'replace', path: '/a', value: 2 }] },
    { name: 'remove', doc: { a: 1, b: 2 }, patch: [{ op: 'remove', path: '/b' }] },
    { name: 'array insert', doc: { xs: [1, 3] }, patch: [{ op: 'add', path: '/xs/1', value: 2 }] },
    { name: 'array append', doc: { xs: [1] }, patch: [{ op: 'add', path: '/xs/-', value: 2 }] },
    { name: 'move', doc: { a: 1, b: null }, patch: [{ op: 'move', from: '/a', path: '/b' }] },
    { name: 'nested', doc: { p: { q: { r: 1 } } }, patch: [{ op: 'replace', path: '/p/q/r', value: 99 }] },
  ];

  for (const c of cases) {
    it(`undo restores original (${c.name})`, () => {
      const next = applyPatch(c.doc, c.patch);
      const inverse = computeInverse(c.doc, c.patch);
      const restored = applyPatch(next, inverse);
      expect(restored).toEqual(c.doc);
    });
  }
});

describe('makeCommand', () => {
  it('records forward + inverse + coalesce key', () => {
    const forward: DocumentPatch = [{ op: 'replace', path: '/a', value: 2 }];
    const inverse: DocumentPatch = [{ op: 'replace', path: '/a', value: 1 }];
    const cmd = makeCommand(forward, inverse, { coalesceKey: 'move:n1', meta: { source: 'user' } });
    expect(cmd.forward).toBe(forward);
    expect(cmd.inverse).toBe(inverse);
    expect(cmd.coalesceKey).toBe('move:n1');
    expect(cmd.meta?.source).toBe('user');
    expect(cmd.id).toMatch(/^cmd_/);
  });
});
