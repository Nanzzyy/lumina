import { describe, it, expect } from 'vitest';
import { resolveLayoutNode } from './layout';
import type { Node } from './document';

const child = (id: string, w: number, h: number): Node => ({
  id,
  frame: { x: 0, y: 0, w, h },
});

const flex = (id: string, lp: Node['layoutProps'], children: Node[], frame = { x: 0, y: 0, w: 300, h: 100 }): Node => ({
  id,
  frame,
  layout: 'flex',
  layoutProps: lp,
  children,
});

describe('resolveLayoutNode — E5 Auto Layout', () => {
  it('non-flex node is returned as-is (structural sharing)', () => {
    const n: Node = { id: 'a', frame: { x: 0, y: 0, w: 10, h: 10 } };
    expect(resolveLayoutNode(n)).toBe(n);
  });

  it('flex row lays children sequentially with gap', () => {
    const parent = flex('p', { direction: 'row', gap: 10 }, [child('a', 100, 50), child('b', 100, 50)]);
    const out = resolveLayoutNode(parent);
    expect(out.children![0].frame.x).toBe(0);
    expect(out.children![1].frame.x).toBe(110); // 100 + gap 10
    expect(out.children![0].frame.y).toBe(0);
  });

  it('flex column stacks vertically', () => {
    const parent = flex('p', { direction: 'column', gap: 10 }, [child('a', 100, 50), child('b', 100, 50)]);
    const out = resolveLayoutNode(parent);
    expect(out.children![0].frame.y).toBe(0);
    expect(out.children![1].frame.y).toBe(60); // 50 + gap 10
  });

  it('align center centers children in the container cross axis', () => {
    const parent = flex('p', { direction: 'row', align: 'center' }, [child('a', 100, 50)]);
    const out = resolveLayoutNode(parent);
    expect(out.children![0].frame.y).toBe(25); // (100-50)/2
  });

  it('justify between pushes the last child to the far edge', () => {
    const parent = flex('p', { direction: 'row', gap: 10, justify: 'between' }, [child('a', 100, 50), child('b', 100, 50)]);
    const out = resolveLayoutNode(parent);
    expect(out.children![0].frame.x).toBe(0);
    expect(out.children![1].frame.x).toBe(200); // pushed to right edge (300-100)
  });

  it('wrap breaks children into lines when exceeding width', () => {
    const parent = flex('p', { direction: 'row', wrap: true, gap: 0 }, [
      child('a', 100, 50), child('b', 100, 50), child('c', 100, 50),
    ], { x: 0, y: 0, w: 150, h: 300 });
    const out = resolveLayoutNode(parent);
    expect(out.children![0].frame.y).toBe(0);
    expect(out.children![1].frame.y).toBe(50); // wrapped to next line
    expect(out.children![2].frame.y).toBe(100);
  });

  it('padding insets children', () => {
    const parent = flex('p', { direction: 'row', padding: 10, gap: 0 }, [child('a', 100, 50)]);
    const out = resolveLayoutNode(parent);
    expect(out.children![0].frame.x).toBe(10);
    expect(out.children![0].frame.y).toBe(10);
  });

  it('align stretch fills the container cross size', () => {
    const parent = flex('p', { direction: 'row', align: 'stretch' }, [child('a', 100, 50)]);
    const out = resolveLayoutNode(parent);
    expect(out.children![0].frame.h).toBe(100); // stretched to container height
  });

  it('nested flex resolves inner containers', () => {
    const inner = flex('inner', { direction: 'column', gap: 10 }, [child('g1', 50, 20), child('g2', 50, 20)]);
    const outer = flex('outer', { direction: 'row', gap: 0 }, [child('a', 100, 50), inner]);
    const out = resolveLayoutNode(outer);
    const resolvedInner = out.children![1];
    expect(resolvedInner.children![0].frame.y).toBe(0);
    expect(resolvedInner.children![1].frame.y).toBe(30); // 20 + gap 10
  });

  it('does not mutate the input tree', () => {
    const parent = flex('p', { direction: 'row', gap: 10 }, [child('a', 100, 50)]);
    const before = JSON.stringify(parent);
    resolveLayoutNode(parent);
    expect(JSON.stringify(parent)).toBe(before);
  });
});
