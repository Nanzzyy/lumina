import { describe, it, expect, vi, afterEach } from 'vitest';
import { clampPlacement, migrateToTree, normalizeLayout } from './migrate';
import type { LayoutDefinition, ContainerConfig } from './types';
import type { LayoutNode } from './tree';

const layout = (over: Partial<LayoutDefinition> = {}): LayoutDefinition => ({
  id: 'l1',
  name: 'L1',
  description: '',
  sections: [],
  containers: [],
  ...over,
});

const container = (id: string, type: ContainerConfig['type'], columns?: number): ContainerConfig =>
  ({ id, type, columns });

describe('clampPlacement', () => {
  it('keeps an in-bounds placement untouched', () => {
    expect(clampPlacement({ x: 2, y: 3, w: 6, h: 4 })).toEqual({ x: 2, y: 3, w: 6, h: 4 });
  });

  it('clamps width to the column count and pulls x back inside the grid', () => {
    expect(clampPlacement({ x: 10, y: 0, w: 20, h: 1 })).toEqual({ x: 0, y: 0, w: 12, h: 1 });
    expect(clampPlacement({ x: 11, y: 0, w: 4, h: 1 })).toEqual({ x: 8, y: 0, w: 4, h: 1 });
  });

  it('enforces minimums for w/h and clamps negative coordinates', () => {
    expect(clampPlacement({ x: -5, y: -2, w: 0, h: 0 })).toEqual({ x: 0, y: 0, w: 1, h: 1 });
  });

  it('rounds fractional values', () => {
    expect(clampPlacement({ x: 1.4, y: 2.6, w: 3.5, h: 1.2 })).toEqual({ x: 1, y: 3, w: 4, h: 1 });
  });

  it('honours a custom column count', () => {
    expect(clampPlacement({ x: 5, y: 0, w: 4, h: 1 }, 6)).toEqual({ x: 2, y: 0, w: 4, h: 1 });
  });
});

describe('migrateToTree', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps every section to a full-width section node', () => {
    const def = layout({
      sections: [
        { id: 'hero', type: 'hero', variant: 'a', props: { title: 'x' } },
        { id: 'story', type: 'story', hidden: true },
      ],
      containers: [container('c1', 'hero-banner'), container('c2', 'contained')],
    });

    const { nodes } = migrateToTree(def);
    expect(nodes).toHaveLength(2);
    expect(nodes[0]).toMatchObject({
      id: 'hero',
      kind: 'section',
      type: 'hero',
      variant: 'a',
      props: { title: 'x' },
      placement: { x: 0, y: 0, w: 12, h: 6 },
      wrapper: { container: 'hero-banner' },
    });
    expect(nodes[1]).toMatchObject({ id: 'story', hidden: true, placement: { x: 0, y: 6, w: 12, h: 3 } });
  });

  it('stacks rows using the per-container-type heights', () => {
    const def = layout({
      sections: [
        { id: 'a', type: 'hero' },
        { id: 'b', type: 'story' },
        { id: 'c', type: 'gallery' },
      ],
      containers: [container('c1', 'card'), container('c2', 'split'), container('c3', 'grid')],
    });

    const ys = migrateToTree(def).nodes.map((n) => n.placement.y);
    expect(ys).toEqual([0, 2, 6]); // card h=2, split h=4
  });

  it('defaults to a contained row when the container is missing', () => {
    const def = layout({ sections: [{ id: 'a', type: 'hero' }], containers: [] });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { nodes } = migrateToTree(def);
    expect(nodes[0].placement.h).toBe(3);
    expect(nodes[0].wrapper).toEqual({ container: 'contained', columns: undefined });
    expect(warn).toHaveBeenCalledOnce();
  });

  it('warns when sections and containers have mismatched lengths', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    migrateToTree(layout({
      sections: [{ id: 'a', type: 'hero' }, { id: 'b', type: 'story' }],
      containers: [container('c1', 'card')],
    }));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('sections/containers length mismatch (2/1)'));
  });

  it('carries animation and wrapper through unchanged', () => {
    const def = layout({
      animation: { preset: 'fade-up', duration: 0.3 },
      wrapper: { bgClass: 'bg-black' },
    });
    const tree = migrateToTree(def);
    expect(tree.animation).toEqual(def.animation);
    expect(tree.wrapper).toEqual(def.wrapper);
  });

  it('preserves the container column count on the wrapper', () => {
    const def = layout({
      sections: [{ id: 'a', type: 'gallery' }],
      containers: [container('c1', 'grid', 3)],
    });
    expect(migrateToTree(def).nodes[0].wrapper).toEqual({ container: 'grid', columns: 3 });
  });
});

describe('normalizeLayout', () => {
  const node = (id: string, placement: LayoutNode['placement']): LayoutNode => ({ id, kind: 'section', placement });

  it('uses authored nodes when present, clamping their placements', () => {
    const def = layout({ nodes: [node('a', { x: 9, y: 0, w: 8, h: 2.4 })] });
    const { nodes } = normalizeLayout(def);
    expect(nodes).toHaveLength(1);
    expect(nodes[0].placement).toEqual({ x: 4, y: 0, w: 8, h: 2 });
  });

  it('is idempotent for authored nodes', () => {
    const def = layout({ nodes: [node('a', { x: 0, y: 0, w: 12, h: 4 })] });
    const once = normalizeLayout(def);
    const twice = normalizeLayout({ ...def, nodes: once.nodes });
    expect(twice).toEqual(once);
  });

  it('falls back to migration when nodes are absent or empty', () => {
    const legacy = layout({
      sections: [{ id: 'hero', type: 'hero' }],
      containers: [container('c1', 'hero-banner')],
    });
    expect(normalizeLayout(legacy).nodes[0].placement).toEqual({ x: 0, y: 0, w: 12, h: 6 });
    expect(normalizeLayout({ ...legacy, nodes: [] }).nodes[0].id).toBe('hero');
  });

  it('does not mutate the input layout', () => {
    const def = layout({ nodes: [node('a', { x: 20, y: 0, w: 4, h: 1 })] });
    normalizeLayout(def);
    expect(def.nodes![0].placement).toEqual({ x: 20, y: 0, w: 4, h: 1 });
  });
});
