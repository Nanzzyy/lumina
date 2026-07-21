import { describe, it, expect } from 'vitest';
import { resolveVar, resolveBinding, resolveProps } from './variable';
import type { VarScopeInput } from './variable';
import type { Variable, PropValue } from './values';

const scope: VarScopeInput = {
  workspace: [{ id: 'w1', scope: 'workspace', key: 'bride', type: 'string', value: 'Anastasia' }],
  project: [{ id: 'p1', scope: 'project', key: 'bride', type: 'string', value: 'Anya (shadow)' }],
  page: [{ id: 'g1', scope: 'page', key: 'event.date', type: 'string', value: '2026-09-12' }],
  frame: [{ id: 'f1', scope: 'frame', key: 'frame.x', type: 'number', value: 10 }],
  runtime: [{ id: 'r1', scope: 'runtime', key: 'now', type: 'string', value: '2026-07-19T00:00:00Z' }],
  system: [],
};

describe('variable resolver (ADR-003, ADR-016)', () => {
  it('unqualified key: narrowest scope wins (CSS cascade)', () => {
    const r = resolveVar(scope, 'bride');
    expect(r).not.toBeNull();
    expect(r!.value).toBe('Anya (shadow)'); // project shadows workspace
    expect(r!.origin).toBe('project');
  });

  it('qualified key bypasses cascade', () => {
    const r = resolveVar(scope, 'workspace.bride');
    expect(r).not.toBeNull();
    expect(r!.value).toBe('Anastasia');
    expect(r!.origin).toBe('workspace');
  });

  it('runtime qualified key returns dynamic=true', () => {
    const r = resolveVar(scope, 'runtime.now');
    expect(r).not.toBeNull();
    expect(r!.dynamic).toBe(true);
  });

  it('returns null for missing key', () => {
    expect(resolveVar(scope, 'nonexistent')).toBeNull();
  });

  it('resolveBinding returns inline for non-bind value', () => {
    const r = resolveBinding(scope, 'plain text', 'title');
    expect(r.value).toBe('plain text');
    expect(r.dynamic).toBe(false);
  });

  it('resolveBinding resolves $var', () => {
    const r = resolveBinding(scope, { $var: 'runtime.now' }, 'time');
    expect(r.dynamic).toBe(true);
    expect(r.value).toBe('2026-07-19T00:00:00Z');
  });

  it('resolveBinding passes $expr through for pipeline step 4', () => {
    const r = resolveBinding(scope, { $expr: 'format(event.date, "long")' }, 'date');
    expect(r.value).toBe('format(event.date, "long")');
  });

  it('resolveProps resolves all bindings in one pass', () => {
    const props: Record<string, PropValue> = {
      title: 'Hello',
      brideKey: { $var: 'workspace.bride' },
      date: { $var: 'page.event.date' },
    };
    const r = resolveProps(scope, props);
    expect(r.title).toBe('Hello');
    expect(r.brideKey).toBe('Anastasia');
    expect(r.date).toBe('2026-09-12');
  });
});
