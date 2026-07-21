/**
 * Recursive node-tree helpers for the canvas — E2 Selection Engine.
 *
 * World frame = a node's frame offset accumulated through its ancestors
 * (parent.x + child.x, …). Used so nested/grouped nodes hit-test and draw
 * selection boxes at the correct place, matching the CSS nesting that NodeView
 * renders (child absolute-inside-positioned-parent == accumulated offset).
 *
 * ponytail: rotation-aware world matrix — currently translation-only, so a
 * rotated parent does not rotate its children's world positions. Fine while
 * groups stay axis-aligned.
 */

import type { Node, NodeFrame } from '../core/document';

export interface PositionedNode {
  node: Node;
  world: NodeFrame;
}

export function flattenWithWorldFrame(
  nodes: Node[] | undefined,
  origin: { x: number; y: number } = { x: 0, y: 0 },
): PositionedNode[] {
  if (!nodes || nodes.length === 0) return [];
  const out: PositionedNode[] = [];
  for (const n of nodes) {
    const world: NodeFrame = {
      x: origin.x + n.frame.x,
      y: origin.y + n.frame.y,
      w: n.frame.w,
      h: n.frame.h,
      rotation: n.frame.rotation,
      opacity: n.frame.opacity,
    };
    out.push({ node: n, world });
    if (n.children && n.children.length > 0) {
      for (const p of flattenWithWorldFrame(n.children, { x: world.x, y: world.y })) {
        out.push(p);
      }
    }
  }
  return out;
}

/** Axis-aligned intersection (rotation ignored — ponytail). */
export function rectsIntersect(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
