import { describe, it, expect } from 'vitest';
import { applyPatch, computeInverse } from '../core/history';
import { findNodePath } from '../core/document';
import type { Document } from '../core/document';
import {
  moveNodeCommand, resizeNodeCommand, rotateNodeCommand,
  addNodePatch, deleteNodePatch, setPropPatch,
  alignNodesPatch, distributeNodesPatch, flipNodePatch,
  groupNodesPatch, ungroupNodesPatch, renameNodePatch,
  setResponsiveOverridePatch, clearResponsiveBreakpointPatch,
} from './commands';
import type { Node } from '@core/document';

function makeDoc(): Document {
  return {
    schemaVersion: 1,
    workspace: { id: 'ws', schemaVersion: 1, name: 'ws', variables: [], dataSources: [] },
    project: {
      id: 'p',
      schemaVersion: 1,
      workspaceId: 'ws',
      name: 'p',
      slug: 'p',
      status: 'draft',
      pages: [
        {
          id: 'pg',
          projectId: 'p',
          name: 'Home',
          route: '/',
          ordinal: 0,
          frames: [
            {
              id: 'f',
              pageId: 'pg',
              name: 'Mobile',
              viewport: { w: 390, h: 844, device: 'mobile' },
              ordinal: 0,
              nodes: [
                { id: 'n1', frame: { x: 10, y: 10, w: 100, h: 50 } },
                {
                  id: 'n2',
                  frame: { x: 0, y: 0, w: 50, h: 50 },
                  children: [{ id: 'c1', frame: { x: 0, y: 0, w: 10, h: 10 } }],
                },
              ],
            },
          ],
        },
      ],
      variables: [],
      dataSources: [],
    },
  };
}

describe('findNodePath (ADR-010 pointers)', () => {
  it('addresses top-level nodes', () => {
    expect(findNodePath(makeDoc(), 'n1')).toBe('/project/pages/0/frames/0/nodes/0');
  });
  it('addresses nested children', () => {
    expect(findNodePath(makeDoc(), 'c1')).toBe('/project/pages/0/frames/0/nodes/1/children/0');
  });
  it('returns undefined for missing nodes', () => {
    expect(findNodePath(makeDoc(), 'nope')).toBeUndefined();
  });
});

describe('canvas commands (ADR-014 §2)', () => {
  it('moveNodeCommand builds a patch + inverse that round-trip', () => {
    const doc = makeDoc();
    const cmd = moveNodeCommand(doc, 'n1', 20, 30);
    expect(cmd.coalesceKey).toBe('move:n1');
    const next = applyPatch(doc, cmd.forward);
    expect(next.project.pages[0].frames[0].nodes[0].frame).toEqual({ x: 20, y: 30, w: 100, h: 50 });
    const restored = applyPatch(next, cmd.inverse);
    expect(restored.project.pages[0].frames[0].nodes[0].frame).toEqual({ x: 10, y: 10, w: 100, h: 50 });
  });

  it('resizeNodeCommand changes only w/h', () => {
    const doc = makeDoc();
    const cmd = resizeNodeCommand(doc, 'n1', 200, 75);
    expect(cmd.coalesceKey).toBe('resize:n1');
    const next = applyPatch(doc, cmd.forward);
    expect(next.project.pages[0].frames[0].nodes[0].frame).toEqual({ x: 10, y: 10, w: 200, h: 75 });
  });

  it('rotateNodeCommand changes only rotation', () => {
    const doc = makeDoc();
    const cmd = rotateNodeCommand(doc, 'n1', 45);
    expect(cmd.coalesceKey).toBe('rotate:n1');
    const next = applyPatch(doc, cmd.forward);
    expect(next.project.pages[0].frames[0].nodes[0].frame).toEqual({ x: 10, y: 10, w: 100, h: 50, rotation: 45 });
  });

  it('works on a nested child node', () => {
    const doc = makeDoc();
    const cmd = moveNodeCommand(doc, 'c1', 5, 5);
    const next = applyPatch(doc, cmd.forward);
    expect(next.project.pages[0].frames[0].nodes[1].children![0].frame).toEqual({ x: 5, y: 5, w: 10, h: 10 });
  });

  it('throws on unknown node', () => {
    expect(() => moveNodeCommand(makeDoc(), 'nope', 0, 0)).toThrow(/not found/);
  });
});

describe('structural commands — E1 editable scene', () => {
  it('addNodePatch appends a node and round-trips via inverse', () => {
    const doc = makeDoc();
    const node: Node = { id: 'nx', name: 'Text', frame: { x: 0, y: 0, w: 100, h: 40 }, props: { text: 'hi' } };
    const patch = addNodePatch(node);
    const next = applyPatch(doc, patch);
    expect(next.project.pages[0].frames[0].nodes).toHaveLength(3);
    expect(next.project.pages[0].frames[0].nodes[2].id).toBe(node.id);
    const restored = applyPatch(next, computeInverse(doc, patch));
    expect(restored.project.pages[0].frames[0].nodes).toHaveLength(2);
  });

  it('deleteNodePatch removes a top-level node and round-trips', () => {
    const doc = makeDoc();
    const patch = deleteNodePatch(doc, 'n1');
    const next = applyPatch(doc, patch);
    expect(next.project.pages[0].frames[0].nodes.find((n) => n.id === 'n1')).toBeUndefined();
    const restored = applyPatch(next, computeInverse(doc, patch));
    expect(restored.project.pages[0].frames[0].nodes.find((n) => n.id === 'n1')).toBeDefined();
  });

  it('deleteNodePatch removes a nested child', () => {
    const doc = makeDoc();
    const next = applyPatch(doc, deleteNodePatch(doc, 'c1'));
    expect(next.project.pages[0].frames[0].nodes[1].children).toHaveLength(0);
  });

  it('setPropPatch adds an absent prop and round-trips', () => {
    const doc = makeDoc(); // n1 has no props
    const patch = setPropPatch(doc, 'n1', 'color', '#ff0000');
    const next = applyPatch(doc, patch);
    expect(next.project.pages[0].frames[0].nodes[0].props?.color).toBe('#ff0000');
    const restored = applyPatch(next, computeInverse(doc, patch));
    expect(restored.project.pages[0].frames[0].nodes[0].props).toBeUndefined();
  });

  it('setPropPatch replaces an existing prop and round-trips', () => {
    const doc = applyPatch(makeDoc(), setPropPatch(makeDoc(), 'n1', 'color', '#ff0000'));
    const patch = setPropPatch(doc, 'n1', 'color', '#00ff00');
    const next = applyPatch(doc, patch);
    expect(next.project.pages[0].frames[0].nodes[0].props?.color).toBe('#00ff00');
    const restored = applyPatch(next, computeInverse(doc, patch));
    expect(restored.project.pages[0].frames[0].nodes[0].props?.color).toBe('#ff0000');
  });

  it('throw on unknown node', () => {
    expect(() => deleteNodePatch(makeDoc(), 'nope')).toThrow(/not found/);
    expect(() => setPropPatch(makeDoc(), 'nope', 'k', 'v')).toThrow(/not found/);
  });
});

describe('arrange commands — E3 Transform Engine', () => {
  // makeDoc: n1 {x:10,y:10,w:100,h:50}, n2 {x:0,y:0,w:50,h:50}

  it('alignNodesPatch left aligns all to min x', () => {
    const doc = makeDoc();
    const patch = alignNodesPatch(doc, ['n1', 'n2'], 'left');
    const next = applyPatch(doc, patch);
    const nodes = next.project.pages[0].frames[0].nodes;
    expect(nodes[0].frame.x).toBe(0); // min(10,0)
    expect(nodes[1].frame.x).toBe(0);
  });

  it('alignNodesPatch centerH centers horizontally', () => {
    const doc = makeDoc();
    const patch = alignNodesPatch(doc, ['n1', 'n2'], 'centerH');
    const next = applyPatch(doc, patch);
    const nodes = next.project.pages[0].frames[0].nodes;
    // centers should now be equal
    const c1 = nodes[0].frame.x + nodes[0].frame.w / 2;
    const c2 = nodes[1].frame.x + nodes[1].frame.w / 2;
    expect(c1).toBeCloseTo(c2);
  });

  it('distributeNodesPatch spaces nodes evenly', () => {
    const doc = makeDoc();
    const patch = distributeNodesPatch(doc, ['n1', 'n2'], 'h');
    const next = applyPatch(doc, patch);
    expect(applyPatch(next, computeInverse(doc, patch)).project.pages[0].frames[0].nodes[0].frame.x).toBe(10);
  });

  it('distributeNodesPatch returns [] for fewer than 2', () => {
    expect(distributeNodesPatch(makeDoc(), ['n1'], 'h')).toEqual([]);
  });

  it('flipNodePatch toggles flipH and round-trips', () => {
    const doc = makeDoc();
    const patch = flipNodePatch(doc, 'n1', 'h');
    const next = applyPatch(doc, patch);
    expect(next.project.pages[0].frames[0].nodes[0].props?.flipH).toBe(true);
    const restored = applyPatch(next, computeInverse(doc, patch));
    expect(restored.project.pages[0].frames[0].nodes[0].props?.flipH).toBeUndefined();
  });
});

describe('grouping — E4', () => {
  // makeDoc: n1 {x:10,y:10,w:100,h:50}, n2 {x:0,y:0,w:50,h:50} (siblings, top-level)

  it('groupNodesPatch wraps siblings into a group with relative child frames', () => {
    const doc = makeDoc();
    const { patch, groupId } = groupNodesPatch(doc, ['n1', 'n2']);
    const next = applyPatch(doc, patch);
    const nodes = next.project.pages[0].frames[0].nodes;
    expect(nodes).toHaveLength(1);
    const g = nodes[0];
    expect(g.id).toBe(groupId);
    expect(g.name).toBe('Group');
    expect(g.frame).toEqual({ x: 0, y: 0, w: 110, h: 60 }); // bbox
    expect(g.children).toHaveLength(2);
    expect(g.children![0].frame).toEqual({ x: 10, y: 10, w: 100, h: 50 }); // n1 relative
    expect(g.children![1].frame).toEqual({ x: 0, y: 0, w: 50, h: 50 }); // n2 relative
    // round-trip restores both nodes at top level
    const restored = applyPatch(next, computeInverse(doc, patch));
    expect(restored.project.pages[0].frames[0].nodes.map((n) => n.id)).toEqual(['n1', 'n2']);
  });

  it('groupNodesPatch refuses non-siblings', () => {
    expect(() => groupNodesPatch(makeDoc(), ['n1', 'c1'])).toThrow(/sibling/); // c1 is nested in n2
  });

  it('ungroupNodesPatch lifts children back to parent space and removes the group', () => {
    const doc = makeDoc();
    const patch = ungroupNodesPatch(doc, 'n2'); // n2 has child c1
    const next = applyPatch(doc, patch);
    const ids = next.project.pages[0].frames[0].nodes.map((n) => n.id);
    expect(ids).toContain('c1');
    expect(ids).not.toContain('n2');
  });

  it('renameNodePatch sets the node name and round-trips', () => {
    const doc = makeDoc();
    const patch = renameNodePatch(doc, 'n1', 'Hero');
    const next = applyPatch(doc, patch);
    expect(next.project.pages[0].frames[0].nodes[0].name).toBe('Hero');
    const restored = applyPatch(next, computeInverse(doc, patch));
    expect(restored.project.pages[0].frames[0].nodes[0].name).toBe(undefined); // n1 had no name
  });

  it('setResponsiveOverridePatch stores a per-breakpoint frame delta and round-trips', () => {
    const doc = makeDoc(); // n1.frame = {x:10,y:10,w:100,h:50}
    const patch = setResponsiveOverridePatch(doc, 'n1', 'lg', { w: 200 });
    expect(patch[0].op).toBe('add'); // n1 has no responsive yet
    const next = applyPatch(doc, patch);
    expect(next.project.pages[0].frames[0].nodes[0].responsive?.lg?.w).toBe(200);
    // second override on same bp merges, not replaces
    const patch2 = setResponsiveOverridePatch(next, 'n1', 'lg', { h: 80 });
    const next2 = applyPatch(next, patch2);
    expect(next2.project.pages[0].frames[0].nodes[0].responsive?.lg).toEqual({ w: 200, h: 80 });
    // base frame untouched (override is a diff, not a copy)
    expect(next2.project.pages[0].frames[0].nodes[0].frame.w).toBe(100);
    // undo round-trips
    const restored = applyPatch(next2, computeInverse(next, patch2));
    expect(restored.project.pages[0].frames[0].nodes[0].responsive?.lg).toEqual({ w: 200 });
  });

  it('clearResponsiveBreakpointPatch drops one breakpoint and removes responsive when empty', () => {
    const doc = makeDoc();
    const withOverride = applyPatch(doc, setResponsiveOverridePatch(doc, 'n1', 'lg', { w: 200 }));
    const cleared = applyPatch(withOverride, clearResponsiveBreakpointPatch(withOverride, 'n1', 'lg'));
    expect(cleared.project.pages[0].frames[0].nodes[0].responsive).toBeUndefined();
    // clearing a non-existent breakpoint is a no-op (empty patch)
    expect(clearResponsiveBreakpointPatch(doc, 'n1', 'md')).toEqual([]);
  });
});
