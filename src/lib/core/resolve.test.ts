import { describe, it, expect, beforeEach } from 'vitest';
import { resolveDocument, buildDependencyGraph } from './resolve';
import type { ResolveContext } from './resolve';
import type { Document } from './document';
import { DEFAULT_THEME } from './theme';

const makeDoc = (): Document => ({
  schemaVersion: 1,
  workspace: { id: 'ws', schemaVersion: 1, name: 'ws', variables: [], dataSources: [] },
  project: {
    id: 'p', schemaVersion: 1, workspaceId: 'ws', name: 'p', slug: 'p', status: 'draft',
    pages: [{
      id: 'pg', projectId: 'p', name: 'Home', route: '/', ordinal: 0,
      frames: [{
        id: 'f', pageId: 'pg', name: 'Mobile',
        viewport: { w: 390, h: 844, device: 'mobile' },
        ordinal: 0,
        nodes: [
          { id: 'n1', frame: { x: 0, y: 0, w: 100, h: 50 }, props: { title: 'Hello', greet: { $var: 'workspace.greeting' } } },
          { id: 'n2', frame: { x: 0, y: 0, w: 50, h: 50 }, props: { countExpr: '$expr:count({{rsvps}})', raw: 'plain' } },
        ],
      }],
    }],
    variables: [], dataSources: [],
  },
});

const ctx: ResolveContext = {
  variables: {
    workspace: [{ id: 'wv', scope: 'workspace', key: 'greeting', type: 'string', value: 'Hello Bride' }],
    project: [], page: [], frame: [],
    runtime: [], system: [],
  },
  dataInput: { dataSources: [], tableRows: {} },
  theme: { defaultTheme: DEFAULT_THEME },
  tokens: { 'color-primary': '#db2777' },
};

describe('resolveDocument (ADR-016)', () => {
  it('resolves variable bindings in props', () => {
    const r = resolveDocument(makeDoc(), ctx);
    expect(r.nodes.length).toBe(2);
    expect(r.pipelineVersion).toBe(1);
  });

  it('E8: preserves nested children + runs the layout engine (flex frames computed)', () => {
    const flexDoc: Document = {
      schemaVersion: 1,
      workspace: { id: 'ws', schemaVersion: 1, name: 'ws', variables: [], dataSources: [] },
      project: {
        id: 'p', schemaVersion: 1, workspaceId: 'ws', name: 'p', slug: 'p', status: 'draft',
        pages: [{
          id: 'pg', projectId: 'p', name: 'Home', route: '/', ordinal: 0,
          frames: [{
            id: 'f', pageId: 'pg', name: 'Mobile',
            viewport: { w: 390, h: 844, device: 'mobile' }, ordinal: 0,
            nodes: [{
              id: 'row', layout: 'flex',
              layoutProps: { direction: 'row', gap: 8, padding: 0, align: 'start', justify: 'start' },
              frame: { x: 0, y: 0, w: 300, h: 50 },
              children: [
                { id: 'c1', frame: { x: 0, y: 0, w: 100, h: 50 }, props: { text: 'a' } },
                { id: 'c2', frame: { x: 0, y: 0, w: 100, h: 50 }, props: { text: 'b' } },
              ],
            }],
          }],
        }],
        variables: [], dataSources: [],
      },
    };
    const r = resolveDocument(flexDoc, ctx);
    // Tree preserved end-to-end: the flex parent carries its children.
    expect(r.nodes.length).toBe(1);
    expect(r.nodes[0].children?.length).toBe(2);
    // Layout Engine ran: children get computed x positions (not both 0).
    const xs = r.nodes[0].children!.map((c) => c.frame?.x ?? 0);
    expect(xs[1]).toBeGreaterThan(xs[0]);
  });

  it('buildDependencyGraph extracts var dependencies', () => {
    const g = buildDependencyGraph(makeDoc());
    // n1 binds greet: { $var: 'workspace.greeting' } -> n1.greet
    expect(g.dependsOn('workspace.greeting', 'n1.greet')).toBe(true);
    // n2 has $expr:count({{rsvps}}) -> n2.countExpr depends on rsvps
    expect(g.dependsOn('rsvps', 'n2.countExpr')).toBe(true);
  });

  it('DAG topological sort does not throw (acyclic)', () => {
    const g = buildDependencyGraph(makeDoc());
    expect(() => g.topologicalSort()).not.toThrow();
  });
});
