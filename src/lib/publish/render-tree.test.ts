import { describe, it, expect } from 'vitest';
import { buildRenderTree, serializeRenderTree, deserializeRenderTree, RENDER_TREE_VERSION } from './render-tree';
import type { ResolvedDocument } from '../core/resolve';

const makeResolved = (): ResolvedDocument => ({
  schemaVersion: 1,
  pipelineVersion: 1,
  nodes: [
    { id: 'n1', componentId: 'hero', props: { title: 'Hello', image: '/img.png', color: '#000' } },
    { id: 'n2', componentId: 'countdown', props: { date: '2026-09-12' } },
    { id: 'n3', componentId: 'text', props: { text: 'Welcome to our wedding' } },
  ],
  variables: {},
  dataSources: [],
});

describe('Render Tree IR (ADR-021)', () => {
  it('buildRenderTree produces a deterministic tree (ignoring non-deterministic ids)', () => {
    const doc = makeResolved();
    const tree1 = buildRenderTree(doc);
    const tree2 = buildRenderTree(doc);
    // Strip id fields before comparison (genId includes Date.now + counter)
    const stripIds = (o: unknown): unknown => {
      if (Array.isArray(o)) return o.map(stripIds);
      if (o && typeof o === 'object') {
        const n: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
          if (k !== 'id') n[k] = stripIds(v);
        }
        return n;
      }
      return o;
    };
    expect(stripIds(tree1)).toEqual(stripIds(tree2));
  });

  it('contains the correct version', () => {
    const tree = buildRenderTree(makeResolved());
    expect(tree.version).toBe(RENDER_TREE_VERSION);
  });

  it('serialize → deserialize round-trips', () => {
    const tree = buildRenderTree(makeResolved());
    const json = serializeRenderTree(tree);
    const restored = deserializeRenderTree(json);
    expect(restored).not.toBeNull();
    expect(restored!.pages.length).toBe(1);
  });

  it('deserializeRenderTree returns null for invalid input', () => {
    expect(deserializeRenderTree('{bad')).toBeNull();
  });

  it('maps componentId to render node kind', () => {
    const tree = buildRenderTree(makeResolved());
    const kinds = tree.pages[0].nodes.map((n) => n.kind);
    expect(kinds).toContain('section');  // hero
    expect(kinds).toContain('countdown');
    expect(kinds).toContain('text');
  });

  it('needsHydration is true for interactive components', () => {
    const tree = buildRenderTree(makeResolved());
    const countdownNode = tree.pages[0].nodes.find((n) => n.kind === 'countdown');
    expect(countdownNode?.needsHydration).toBe(true);
    const heroNode = tree.pages[0].nodes.find((n) => n.kind === 'section');
    expect(heroNode?.needsHydration).toBeUndefined();
  });

  it('asset references are collected', () => {
    const tree = buildRenderTree(makeResolved());
    const heroNode = tree.pages[0].nodes.find((n) => n.kind === 'section');
    expect(heroNode?.assetRefs).toBeDefined();
    expect(heroNode!.assetRefs![0].url).toContain('/img.png');
  });

  it('E8: applies responsive overrides for the publish breakpoint', () => {
    const doc: ResolvedDocument = {
      schemaVersion: 1, pipelineVersion: 1, variables: {}, dataSources: [],
      nodes: [{
        id: 'n', componentId: 'rectangle',
        frame: { x: 0, y: 0, w: 100, h: 50 },
        responsive: { lg: { w: 300 } },
        props: {},
      }],
    };
    expect(buildRenderTree(doc).pages[0].nodes[0].frame.w).toBe(100);         // base
    expect(buildRenderTree(doc, '/', { breakpoint: 'lg' }).pages[0].nodes[0].frame.w).toBe(300); // lg override
  });

  it('E8: constraint solver emits pin-based geometry (right-pin → left:auto)', () => {
    const doc: ResolvedDocument = {
      schemaVersion: 1, pipelineVersion: 1, variables: {}, dataSources: [],
      nodes: [{
        id: 'n', componentId: 'rectangle',
        frame: { x: 10, y: 10, w: 100, h: 50 },
        constraints: { horizontal: { pin: 'right' } },
        props: {},
      }],
    };
    const style = buildRenderTree(doc, '/', { viewport: { w: 390, h: 844 } }).pages[0].nodes[0].style;
    expect(style.position).toBe('absolute');
    expect(style.left).toBe('auto');             // right-pinned, not the raw x
    expect(style.right).toBe('280px');            // 390 - 10 - 100
  });
});
