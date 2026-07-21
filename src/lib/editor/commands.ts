/**
 * Canvas commands — ADR-014 §2 (every interaction is a Command).
 *
 * Gestures (drag/resize/rotate) build an RFC 6902 patch (ADR-010) that replaces a
 * node's `frame`. The inverse is computed from the document, so undo/redo is free
 * and uniform with AI/plugin/autosave. Coalesce keys merge a gesture's per-frame
 * ticks into one history entry (applied on pointer-up by the store).
 *
 * Pure: no React, no DOM (R7).
 */

import { makeCommand, computeInverse } from '../core/history';
import type { Command, DocumentPatch } from '../core/history';
import { findNode, findNodePath } from '../core/document';
import type { Document, NodeFrame, Node, BreakpointKey, PerBreakpoint } from '../core/document';
import { genId } from '../core/id';

function frameOf(doc: Document, nodeId: string): NodeFrame {
  const node = findNode(doc, nodeId);
  if (!node) throw new Error(`[commands] node not found: ${nodeId}`);
  return node.frame;
}

function framePointer(doc: Document, nodeId: string): string {
  const p = findNodePath(doc, nodeId);
  if (!p) throw new Error(`[commands] node not found: ${nodeId}`);
  return `${p}/frame`;
}

/** Replace a node's frame. Primitive backing move/resize/rotate. */
export function setFrameCommand(
  doc: Document,
  nodeId: string,
  next: NodeFrame,
  coalesceKey: string,
  label?: string,
): Command {
  const ptr = framePointer(doc, nodeId);
  const forward: DocumentPatch = [{ op: 'replace', path: ptr, value: next }];
  const inverse = computeInverse(doc, forward);
  return makeCommand(forward, inverse, { coalesceKey, meta: { source: 'user', label } });
}

export function moveNodeCommand(doc: Document, nodeId: string, x: number, y: number): Command {
  return setFrameCommand(doc, nodeId, { ...frameOf(doc, nodeId), x, y }, `move:${nodeId}`, 'Move');
}

export function resizeNodeCommand(doc: Document, nodeId: string, w: number, h: number, x?: number, y?: number): Command {
  const base = frameOf(doc, nodeId);
  return setFrameCommand(
    doc,
    nodeId,
    { ...base, w, h, ...(x != null ? { x } : {}), ...(y != null ? { y } : {}) },
    `resize:${nodeId}`,
    'Resize',
  );
}

export function rotateNodeCommand(doc: Document, nodeId: string, rotation: number): Command {
  return setFrameCommand(doc, nodeId, { ...frameOf(doc, nodeId), rotation }, `rotate:${nodeId}`, 'Rotate');
}

// ─── Structural patches (E1: editable scene) ───────────────
// Active frame = pages[0].frames[0] (the editor's single-frame model).
// ponytail: multi-page/multi-frame addressing once the editor grows frames.

const ACTIVE_NODES = '/project/pages/0/frames/0/nodes';

/** Append a node to the active frame. */
export function addNodePatch(node: Node): DocumentPatch {
  return [{ op: 'add', path: `${ACTIVE_NODES}/-`, value: node }];
}

/** Remove a node (top-level or nested) by id. */
export function deleteNodePatch(doc: Document, nodeId: string): DocumentPatch {
  const p = findNodePath(doc, nodeId);
  if (!p) throw new Error(`[commands] node not found: ${nodeId}`);
  return [{ op: 'remove', path: p }];
}

/** Set one prop on a node. Replaces the whole `props` object so the inverse is
 *  a single op and absent-props (add) vs present-props (replace) both round-trip. */
export function setPropPatch(doc: Document, nodeId: string, key: string, value: unknown): DocumentPatch {
  const node = findNode(doc, nodeId);
  if (!node) throw new Error(`[commands] node not found: ${nodeId}`);
  const base = findNodePath(doc, nodeId)!;
  const nextProps = { ...(node.props ?? {}), [key]: value };
  return [{ op: node.props ? 'replace' : 'add', path: `${base}/props`, value: nextProps }];
}

// ─── Arrange ops (E3 Transform Engine) — pure patch builders ──
export type AlignMode = 'left' | 'centerH' | 'right' | 'top' | 'middle' | 'bottom';
export type DistributeAxis = 'h' | 'v';
export type FlipAxis = 'h' | 'v';

interface Located { frame: NodeFrame; path: string; }

function locateAll(doc: Document, ids: string[]): Located[] {
  return ids.map((id) => {
    const n = findNode(doc, id);
    const p = findNodePath(doc, id);
    if (!n || !p) throw new Error(`[commands] node not found: ${id}`);
    return { frame: n.frame, path: p };
  });
}

/** Align a set of nodes along one axis. Requires ≥1 (no-op feel below 2). */
export function alignNodesPatch(doc: Document, ids: string[], mode: AlignMode): DocumentPatch {
  const items = locateAll(doc, ids);
  const ops: DocumentPatch = [];
  const replace = (it: Located, frame: NodeFrame) =>
    ops.push({ op: 'replace', path: `${it.path}/frame`, value: frame });

  if (mode === 'left') {
    const t = Math.min(...items.map((f) => f.frame.x));
    items.forEach((it) => replace(it, { ...it.frame, x: t }));
  } else if (mode === 'right') {
    const t = Math.max(...items.map((f) => f.frame.x + f.frame.w));
    items.forEach((it) => replace(it, { ...it.frame, x: t - it.frame.w }));
  } else if (mode === 'centerH') {
    const cs = items.map((f) => f.frame.x + f.frame.w / 2);
    const t = (Math.min(...cs) + Math.max(...cs)) / 2;
    items.forEach((it) => replace(it, { ...it.frame, x: t - it.frame.w / 2 }));
  } else if (mode === 'top') {
    const t = Math.min(...items.map((f) => f.frame.y));
    items.forEach((it) => replace(it, { ...it.frame, y: t }));
  } else if (mode === 'bottom') {
    const t = Math.max(...items.map((f) => f.frame.y + f.frame.h));
    items.forEach((it) => replace(it, { ...it.frame, y: t - it.frame.h }));
  } else {
    // middle
    const cs = items.map((f) => f.frame.y + f.frame.h / 2);
    const t = (Math.min(...cs) + Math.max(...cs)) / 2;
    items.forEach((it) => replace(it, { ...it.frame, y: t - it.frame.h / 2 }));
  }
  return ops;
}

/** Evenly distribute nodes along an axis. Requires ≥2. */
export function distributeNodesPatch(doc: Document, ids: string[], axis: DistributeAxis): DocumentPatch {
  if (ids.length < 2) return [];
  const items = locateAll(doc, ids);
  const key = axis === 'h' ? 'x' : 'y';
  const dim = axis === 'h' ? 'w' : 'h';
  const sorted = [...items].sort((a, b) => a.frame[key] - b.frame[key]);
  const first = sorted[0].frame;
  const last = sorted[sorted.length - 1].frame;
  const span = last[key] + last[dim] - first[key];
  const sumSize = sorted.reduce((s, it) => s + it.frame[dim], 0);
  const gap = (span - sumSize) / (sorted.length - 1);
  const ops: DocumentPatch = [];
  let cursor = first[key];
  for (const it of sorted) {
    ops.push({ op: 'replace', path: `${it.path}/frame`, value: { ...it.frame, [key]: cursor } });
    cursor += it.frame[dim] + gap;
  }
  return ops;
}

/** Toggle horizontal/vertical flip on a node (rendered via transform in NodeView). */
export function flipNodePatch(doc: Document, nodeId: string, axis: FlipAxis): DocumentPatch {
  const node = findNode(doc, nodeId);
  if (!node) throw new Error(`[commands] node not found: ${nodeId}`);
  const base = findNodePath(doc, nodeId)!;
  const key = axis === 'h' ? 'flipH' : 'flipV';
  const current = Boolean((node.props as Record<string, unknown> | undefined)?.[key]);
  const nextProps = { ...(node.props ?? {}), [key]: !current };
  return [{ op: node.props ? 'replace' : 'add', path: `${base}/props`, value: nextProps }];
}

// ─── Grouping (E4) — pure patch builders ────────────────────

/** Split a node JSON-pointer into its parent array path + index. */
function splitArrayPath(path: string): { arrayPath: string; index: number } {
  const segs = path.split('/');
  const index = Number(segs[segs.length - 1]);
  const arrayPath = segs.slice(0, -1).join('/');
  return { arrayPath, index };
}

/**
 * Wrap sibling nodes into a new group. Group frame = bbox of the nodes (in parent
 * space); children frames rewritten relative to the group origin. Requires all
 * nodes share the same parent array. Returns the patch + the new group id.
 */
export function groupNodesPatch(doc: Document, ids: string[]): { patch: DocumentPatch; groupId: string } {
  if (ids.length === 0) throw new Error('[commands] group requires ≥1 node');
  const located = ids.map((id) => {
    const n = findNode(doc, id);
    const p = findNodePath(doc, id);
    if (!n || !p) throw new Error(`[commands] node not found: ${id}`);
    return { node: n, path: p, ...splitArrayPath(p) };
  });
  const parents = new Set(located.map((l) => l.arrayPath));
  if (parents.size !== 1) throw new Error('[commands] group requires sibling nodes (same parent)');

  const minX = Math.min(...located.map((l) => l.node.frame.x));
  const minY = Math.min(...located.map((l) => l.node.frame.y));
  const maxR = Math.max(...located.map((l) => l.node.frame.x + l.node.frame.w));
  const maxB = Math.max(...located.map((l) => l.node.frame.y + l.node.frame.h));
  const groupId = genId('grp');
  const children: Node[] = located.map((l) => ({
    ...l.node,
    frame: { ...l.node.frame, x: l.node.frame.x - minX, y: l.node.frame.y - minY },
  }));
  const group: Node = {
    id: groupId,
    name: 'Group',
    frame: { x: minX, y: minY, w: maxR - minX, h: maxB - minY },
    children,
  };

  // Remove selected descending by index (keeps remaining paths valid), then append group.
  const desc = [...located].sort((a, b) => b.index - a.index);
  const patch: DocumentPatch = desc.map((l) => ({ op: 'remove', path: l.path }));
  patch.push({ op: 'add', path: `${located[0].arrayPath}/-`, value: group });
  return { patch, groupId };
}

/**
 * Dissolve a group: lift its children into the parent array (frames back to
 * parent space = group.origin + child.local), then remove the group.
 */
export function ungroupNodesPatch(doc: Document, groupId: string): DocumentPatch {
  const group = findNode(doc, groupId);
  const path = findNodePath(doc, groupId);
  if (!group || !path) throw new Error(`[commands] node not found: ${groupId}`);
  const { arrayPath } = splitArrayPath(path);
  const children = group.children ?? [];
  if (children.length === 0) return [{ op: 'remove', path }];

  const lifted: Node[] = children.map((c) => ({
    ...c,
    frame: {
      ...c.frame,
      x: group.frame.x + c.frame.x,
      y: group.frame.y + c.frame.y,
    },
  }));
  const patch: DocumentPatch = lifted.map((c) => ({ op: 'add', path: `${arrayPath}/-`, value: c }));
  patch.push({ op: 'remove', path });
  return patch;
}

/** Rename a node (the node-level `name`, not a prop). */
export function renameNodePatch(doc: Document, nodeId: string, name: string): DocumentPatch {
  const node = findNode(doc, nodeId);
  if (!node) throw new Error(`[commands] node not found: ${nodeId}`);
  const base = findNodePath(doc, nodeId)!;
  return [{ op: node.name ? 'replace' : 'add', path: `${base}/name`, value: name }];
}

// ─── E7: Responsive overrides (ADR-019) — pure patch builders ──
// Writes a per-breakpoint frame delta into node.responsive[bp]. The Responsive
// Engine (resolveResponsiveFrame) cascades base ← sm ← … ← 2xl at preview time;
// here we only store the diff for one breakpoint.
export function setResponsiveOverridePatch(
  doc: Document,
  nodeId: string,
  bp: BreakpointKey,
  partial: Partial<NodeFrame>,
): DocumentPatch {
  const node = findNode(doc, nodeId);
  if (!node) throw new Error(`[commands] node not found: ${nodeId}`);
  const base = findNodePath(doc, nodeId)!;
  const cur: PerBreakpoint = node.responsive ?? {};
  const nextBp: Record<string, unknown> = { ...(cur[bp] ?? {}), ...partial };
  for (const k of Object.keys(nextBp)) if (nextBp[k] === undefined) delete nextBp[k];
  const next: PerBreakpoint = { ...cur, [bp]: nextBp };
  return [{ op: node.responsive ? 'replace' : 'add', path: `${base}/responsive`, value: next }];
}

export function clearResponsiveBreakpointPatch(
  doc: Document,
  nodeId: string,
  bp: BreakpointKey,
): DocumentPatch {
  const node = findNode(doc, nodeId);
  if (!node) throw new Error(`[commands] node not found: ${nodeId}`);
  if (!node.responsive?.[bp]) return [];
  const base = findNodePath(doc, nodeId)!;
  const next: PerBreakpoint = { ...node.responsive };
  delete next[bp];
  return Object.keys(next).length > 0
    ? [{ op: 'replace', path: `${base}/responsive`, value: next }]
    : [{ op: 'remove', path: `${base}/responsive` }];
}
