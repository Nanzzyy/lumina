import { describe, it, expect } from 'vitest';
import { flattenWithWorldFrame, rectsIntersect } from './node-tree';
import type { Node } from '../core/document';

describe('flattenWithWorldFrame', () => {
  it('world == local for top-level nodes', () => {
    const nodes: Node[] = [{ id: 'a', frame: { x: 10, y: 20, w: 100, h: 50 } }];
    const out = flattenWithWorldFrame(nodes);
    expect(out).toHaveLength(1);
    expect(out[0].world).toEqual({ x: 10, y: 20, w: 100, h: 50 });
    expect(out[0].node.id).toBe('a');
  });

  it('accumulates parent offset into children and grandchildren', () => {
    const nodes: Node[] = [
      {
        id: 'parent',
        frame: { x: 100, y: 100, w: 200, h: 200 },
        children: [
          { id: 'c1', frame: { x: 10, y: 10, w: 30, h: 30 } },
          {
            id: 'c2', frame: { x: 50, y: 50, w: 20, h: 20 },
            children: [{ id: 'gc', frame: { x: 5, y: 5, w: 10, h: 10 } }],
          },
        ],
      },
    ];
    const byId = Object.fromEntries(flattenWithWorldFrame(nodes).map((p) => [p.node.id, p.world]));
    expect(byId.parent).toMatchObject({ x: 100, y: 100 });
    expect(byId.c1).toMatchObject({ x: 110, y: 110 }); // 100 + 10
    expect(byId.c2).toMatchObject({ x: 150, y: 150 }); // 100 + 50
    expect(byId.gc).toMatchObject({ x: 155, y: 155 }); // 100 + 50 + 5
  });

  it('handles empty / undefined children', () => {
    expect(flattenWithWorldFrame([])).toEqual([]);
    expect(flattenWithWorldFrame(undefined)).toEqual([]);
  });
});

describe('rectsIntersect', () => {
  it('detects overlap', () => {
    expect(rectsIntersect({ x: 0, y: 0, w: 10, h: 10 }, { x: 5, y: 5, w: 10, h: 10 })).toBe(true);
  });
  it('detects non-overlap', () => {
    expect(rectsIntersect({ x: 0, y: 0, w: 10, h: 10 }, { x: 20, y: 20, w: 5, h: 5 })).toBe(false);
  });
});
