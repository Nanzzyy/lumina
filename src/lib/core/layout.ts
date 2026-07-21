/**
 * Layout Engine — E5 Auto Layout.
 *
 * Pure solver over the Node tree (ADR-001). A node with `layout: 'flex'` becomes a
 * flexbox container: its children's local frames are COMPUTED from
 * `layoutProps` (direction / gap / padding / align / justify / wrap) and the
 * children's own w/h as basis sizes.
 *
 * Contract: returns a NEW resolved Node tree (never mutates input). NodeView and
 * the publish renderer keep reading `node.frame` unchanged — only flex children
 * get recomputed local positions. Selection / hit-test keep working because the
 * frame stays the single source of truth.
 *
 * Structural sharing: a non-flex node with no flex descendants is returned as-is
 * (zero allocation), so cost is proportional to the flex-parent count, not node
 * count.
 *
 * ponytail: explicit grid (columns/rows), flex-grow/shrink, drag-to-reorder,
 * rotation-aware layout. Flex + wrap + gap covers the auto-layout core.
 */

import type { Node, NodeFrame, LayoutProps } from './document';

type Padding = { top: number; right: number; bottom: number; left: number };

function normalizePadding(p: LayoutProps['padding']): Padding {
  const z: Padding = { top: 0, right: 0, bottom: 0, left: 0 };
  if (p == null) return z;
  if (typeof p === 'number') return { top: p, right: p, bottom: p, left: p };
  if (Array.isArray(p)) {
    if (p.length === 2) return { top: p[0], right: p[1], bottom: p[0], left: p[1] };
    if (p.length >= 4) return { top: p[0], right: p[1], bottom: p[2], left: p[3] };
  }
  return z;
}

function justifyPack(justify: LayoutProps['justify'], free: number, n: number): { start: number; gapExtra: number } {
  if (free <= 0 || n === 0) return { start: 0, gapExtra: 0 };
  switch (justify) {
    case 'center': return { start: free / 2, gapExtra: 0 };
    case 'end': return { start: free, gapExtra: 0 };
    case 'between': return { start: 0, gapExtra: n > 1 ? free / (n - 1) : 0 };
    case 'around': return { start: free / (2 * n), gapExtra: free / n };
    default: return { start: 0, gapExtra: 0 }; // start
  }
}

function alignCross(align: LayoutProps['align'], lineCross: number, size: number): { offset: number; stretch: boolean } {
  switch (align) {
    case 'center': return { offset: (lineCross - size) / 2, stretch: false };
    case 'end': return { offset: lineCross - size, stretch: false };
    case 'stretch': return { offset: 0, stretch: true };
    default: return { offset: 0, stretch: false }; // start
  }
}

/** Lay out a flex parent's children, returning new child nodes with computed frames. */
function applyFlex(parent: Node, children: Node[]): Node[] {
  const lp: LayoutProps = parent.layoutProps ?? {};
  const pad = normalizePadding(lp.padding);
  const gap = lp.gap ?? 0;
  const dir = lp.direction ?? 'row';
  const row = dir === 'row' || dir === 'row-reverse';
  const wrap = !!lp.wrap;
  const align = lp.align ?? 'start';
  const justify = lp.justify ?? 'start';

  const innerMain = row ? parent.frame.w - pad.left - pad.right : parent.frame.h - pad.top - pad.bottom;
  const innerCross = row ? parent.frame.h - pad.top - pad.bottom : parent.frame.w - pad.left - pad.right;

  // Wrap: split children into lines when the running main size exceeds innerMain.
  const lines: Node[][] = [];
  if (wrap) {
    let cur: Node[] = [];
    let used = 0;
    for (const c of children) {
      const sz = row ? c.frame.w : c.frame.h;
      if (cur.length > 0 && used + gap + sz > innerMain) {
        lines.push(cur);
        cur = [];
        used = 0;
      }
      cur.push(c);
      used += sz + (cur.length > 1 ? gap : 0);
    }
    if (cur.length > 0) lines.push(cur);
  } else {
    lines.push(children);
  }

  const out: Node[] = [];
  let crossCursor = row ? pad.top : pad.left;

  for (const line of lines) {
    const mainSizes = line.map((c) => (row ? c.frame.w : c.frame.h));
    const crossSizes = line.map((c) => (row ? c.frame.h : c.frame.w));
    // Single-line (no wrap) fills the container cross axis; wrapped lines use natural height.
    const lineCross = wrap
      ? (crossSizes.length ? Math.max(...crossSizes) : 0)
      : innerCross;
    const totalMain = mainSizes.reduce((a, b) => a + b, 0) + gap * Math.max(0, line.length - 1);
    const free = innerMain - totalMain;
    const jp = justifyPack(justify, free, line.length);

    let mainCursor = (row ? pad.left : pad.top) + jp.start;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      const mainSize = mainSizes[i];
      const crossSize = crossSizes[i];
      const ac = alignCross(align, lineCross, crossSize);
      const crossPos = crossCursor + ac.offset;
      const frame: NodeFrame = row
        ? { ...c.frame, x: mainCursor, y: crossPos, h: ac.stretch ? lineCross : c.frame.h }
        : { ...c.frame, y: mainCursor, x: crossPos, w: ac.stretch ? lineCross : c.frame.w };
      out.push({ ...c, frame });
      mainCursor += mainSize + gap + jp.gapExtra;
    }
    crossCursor += lineCross + gap;
  }
  return out;
}

/**
 * Resolve layout for a node (deep, pure). Flex children get computed local frames;
 * everything else is structurally shared.
 */
export function resolveLayoutNode(node: Node): Node {
  if (node.layout === 'flex') {
    const resolvedChildren = (node.children ?? []).map(resolveLayoutNode);
    return { ...node, children: applyFlex(node, resolvedChildren) };
  }
  if (node.children && node.children.length > 0) {
    const resolvedChildren = node.children.map(resolveLayoutNode);
    const changed = resolvedChildren.some((c, i) => c !== node.children![i]);
    return changed ? { ...node, children: resolvedChildren } : node;
  }
  return node;
}

export function resolveLayout(nodes: Node[]): Node[] {
  return nodes.map(resolveLayoutNode);
}
