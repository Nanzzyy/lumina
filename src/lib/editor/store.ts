/**
 * Editor session store — ADR-014 §3 (selection = UI state, never Document).
 *
 * Slices:
 * - selection (non-historical, ADR-014 §3)
 * - viewport / camera (non-historical)
 * - history (past/future, commands via ADR-010)
 * - ui (snap config, guides, ruler, device preview, tool)
 *
 * Pure zustand + immer; no React-DOM (R5). Mutation only via commands.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import type { Camera } from './camera';
import { makeCamera, clampZoom, zoomAtPoint } from './camera';
import type { Command } from '../core/history';
import { computeInverse, makeCommand, applyPatch } from '../core/history';
import type { DocumentPatch } from '../core/history';
import type { Document, Node, NodeFrame, LayoutMode, LayoutProps, ConstraintPin, ConstraintSpec, BreakpointKey } from '../core/document';
import { findNode, findNodePath } from '../core/document';
import { moveNodeCommand, addNodePatch, setPropPatch, alignNodesPatch, distributeNodesPatch, flipNodePatch, groupNodesPatch, ungroupNodesPatch, renameNodePatch, setResponsiveOverridePatch, clearResponsiveBreakpointPatch } from './commands';
import type { AlignMode, DistributeAxis, FlipAxis } from './commands';
import type { SnapConfig } from './snapping';
import { DEFAULT_SNAP } from './snapping';

// ─── Types ─────────────────────────────────────────────────
export type ToolMode = 'select' | 'text' | 'shape' | 'pan';

export interface EditorUI {
  tool: ToolMode;
  snapConfig: SnapConfig;
  showGuides: boolean;
  showRuler: boolean;
  devicePreview: 'mobile' | 'tablet' | 'desktop' | null; // null = canvas viewport
  hoveredId: string | null;
  /** Guides currently active — driven by snap engine. */
  activeGuides: import('./snapping').GuideLine[];
  marqueeRect: { x: number; y: number; w: number; h: number } | null;
}

export interface EditorState {
  doc: Document;
  selection: Set<string>;
  camera: Camera;
  past: Command[];
  future: Command[];
  ui: EditorUI;
}

// ─── Actions ───────────────────────────────────────────────
export interface EditorActions {
  setDoc: (doc: Document) => void;
  select: (ids: string[]) => void;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  setHovered: (id: string | null) => void;
  setActiveGuides: (guides: import('./snapping').GuideLine[]) => void;
  setMarqueeRect: (r: { x: number; y: number; w: number; h: number } | null) => void;
  setTool: (t: ToolMode) => void;
  setCamera: (cam: Camera) => void;
  panBy: (dx: number, dy: number) => void;
  zoomAt: (screenX: number, screenY: number, z: number) => void;
  zoomToFit: (viewportW: number, viewportH: number, worldW: number, worldH: number) => void;
  snapConfig: (c: Partial<SnapConfig>) => void;
  toggleGuides: () => void;
  toggleRuler: () => void;
  setDevice: (d: EditorUI['devicePreview']) => void;
  /** Apply a command; push forward, compute inverse, push onto past stack, clear future. */
  executeCommand: (cmd: Command) => void;
  undo: () => void;
  redo: () => void;
  /** Convenience: apply a full DocumentPatch and record it as a command. */
  applyPatch: (patch: DocumentPatch, label?: string) => void;
  /** Canvas interaction helpers: move/resize/rotate built from current selection. */
  moveSelected: (nodeId: string, x: number, y: number) => void;
  /** E1: structural ops. Each goes through a Command (undoable). */
  addNode: (node: Node) => void;
  deleteSelected: () => void;
  setProp: (nodeId: string, key: string, value: unknown) => void;
  setNodeFlag: (nodeId: string, key: 'hidden' | 'locked', value: boolean) => void;
  /** E3: transform ops over the current selection (one undo each). */
  moveSelectedBy: (dx: number, dy: number) => void;
  alignSelected: (mode: AlignMode) => void;
  distributeSelected: (axis: DistributeAxis) => void;
  flipSelected: (axis: FlipAxis) => void;
  /** E4: grouping. */
  groupSelected: () => void;
  ungroupSelected: () => void;
  renameNode: (id: string, name: string) => void;
  /** E5: Auto Layout. */
  setLayoutMode: (nodeId: string, mode: 'none' | LayoutMode) => void;
  setLayoutProps: (nodeId: string, partial: Partial<LayoutProps>) => void;
  /** E6: Constraints. */
  setConstraintPin: (nodeId: string, axis: 'horizontal' | 'vertical', pin: ConstraintPin | undefined) => void;
  /** E7: Responsive per-breakpoint frame overrides (ADR-019). */
  setResponsiveOverride: (nodeId: string, bp: BreakpointKey, partial: Partial<NodeFrame>) => void;
  clearResponsiveBreakpoint: (nodeId: string, bp: BreakpointKey) => void;
}

// ─── Store ──────────────────────────────────────────────────
// selection is a Set<string>; Immer needs the MapSet plugin to draft it.
enableMapSet();
const MAX_HISTORY = 100;

export const useEditorStore = create<EditorState & EditorActions>()(
  immer((set, get) => ({
    doc: null as unknown as Document,
    selection: new Set<string>(),
    camera: makeCamera(1, 0, 0),
    past: [],
    future: [],
    ui: {
      tool: 'select',
      snapConfig: DEFAULT_SNAP,
      showGuides: true,
      showRuler: false,
      devicePreview: null,
      hoveredId: null,
      activeGuides: [],
      marqueeRect: null,
    },

    setDoc: (doc) => set((s) => { s.doc = doc; }),

    select: (ids) => set((s) => { s.selection = new Set(ids); }),
    toggleSelect: (id) => set((s) => {
      if (s.selection.has(id)) s.selection.delete(id);
      else s.selection.add(id);
    }),
    clearSelection: () => set((s) => { s.selection.clear(); }),
    setHovered: (id) => set((s) => { s.ui.hoveredId = id; }),
    setActiveGuides: (guides) => set((s) => { s.ui.activeGuides = guides; }),
    setMarqueeRect: (r) => set((s) => { s.ui.marqueeRect = r; }),
    setTool: (t) => set((s) => { s.ui.tool = t; }),
    setCamera: (cam) => set((s) => { s.camera = cam; }),
    panBy: (dx, dy) => set((s) => { s.camera.panX += dx; s.camera.panY += dy; }),
    zoomAt: (sx, sy, z) => set((s) => {
      s.camera = zoomAtPoint(s.camera, sx, sy, z);
    }),
    zoomToFit: (vw, vh, ww, wh) => set((s) => {
      if (ww === 0 || wh === 0) return;
      const z = Math.min(vw / ww, vh / wh, 1);
      s.camera = { zoom: clampZoom(z), panX: (vw - ww * z) / 2, panY: (vh - wh * z) / 2 };
    }),
    snapConfig: (c) => set((s) => { Object.assign(s.ui.snapConfig, c); }),
    toggleGuides: () => set((s) => { s.ui.showGuides = !s.ui.showGuides; }),
    toggleRuler: () => set((s) => { s.ui.showRuler = !s.ui.showRuler; }),
    setDevice: (d) => set((s) => { s.ui.devicePreview = d; }),

    executeCommand: (cmd) => set((s) => {
      s.doc = applyPatch(s.doc, cmd.forward);
      s.past.push(cmd);
      if (s.past.length > MAX_HISTORY) s.past.shift();
      s.future = [];
    }),

    undo: () => set((s) => {
      const cmd = s.past.pop();
      if (!cmd) return;
      s.doc = applyPatch(s.doc, cmd.inverse);
      s.future.push(cmd);
    }),

    redo: () => set((s) => {
      const cmd = s.future.pop();
      if (!cmd) return;
      s.doc = applyPatch(s.doc, cmd.forward);
      s.past.push(cmd);
    }),

    applyPatch: (patch, label) => {
      const s = get();
      // Deterministic: compute inverse from current state (before applying patch)
      const inverse = computeInverse(s.doc, patch);
      const cmd = makeCommand(patch, inverse, { meta: { source: 'user', label } });
      s.executeCommand(cmd);
    },

    moveSelected: (nodeId, x, y) => {
      const s = get();
      if (!s.doc) return;
      const cmd = moveNodeCommand(s.doc, nodeId, x, y);
      s.executeCommand(cmd);
    },

    addNode: (node) => {
      get().applyPatch(addNodePatch(node), 'Add');
      get().select([node.id]);
    },

    deleteSelected: () => {
      const s = get();
      if (!s.doc || s.selection.size === 0) return;
      // Re-find each path against the evolving doc so array indices stay correct
      // after each removal (one undo entry for the whole batch).
      let working: Document = s.doc;
      const ops: DocumentPatch = [];
      for (const id of s.selection) {
        const p = findNodePath(working, id);
        if (!p) continue;
        ops.push({ op: 'remove', path: p });
        working = applyPatch(working, [{ op: 'remove', path: p }]);
      }
      if (ops.length > 0) {
        s.applyPatch(ops, 'Delete');
        s.clearSelection();
      }
    },

    setProp: (nodeId, key, value) => {
      const s = get();
      if (!s.doc) return;
      s.applyPatch(setPropPatch(s.doc, nodeId, key, value), 'Edit');
    },

    setNodeFlag: (nodeId, key, value) => {
      const s = get();
      if (!s.doc) return;
      const p = findNodePath(s.doc, nodeId);
      if (!p) return;
      const node = findNode(s.doc, nodeId);
      const present = node ? (node as unknown as Record<string, unknown>)[key] !== undefined : false;
      s.applyPatch([{ op: present ? 'replace' : 'add', path: `${p}/${key}`, value }], `Toggle ${key}`);
    },

    moveSelectedBy: (dx, dy) => {
      const s = get();
      if (!s.doc || s.selection.size === 0) return;
      let working: Document = s.doc;
      const ops: DocumentPatch = [];
      for (const id of s.selection) {
        const n = findNode(working, id);
        const p = findNodePath(working, id);
        if (!n || !p) continue;
        const nextFrame = { ...n.frame, x: n.frame.x + dx, y: n.frame.y + dy };
        ops.push({ op: 'replace', path: `${p}/frame`, value: nextFrame });
        working = applyPatch(working, [{ op: 'replace', path: `${p}/frame`, value: nextFrame }]);
      }
      if (ops.length > 0) s.applyPatch(ops, 'Move');
    },

    alignSelected: (mode) => {
      const s = get();
      if (!s.doc || s.selection.size === 0) return;
      s.applyPatch(alignNodesPatch(s.doc, [...s.selection], mode), `Align ${mode}`);
    },

    distributeSelected: (axis) => {
      const s = get();
      if (!s.doc || s.selection.size < 2) return;
      s.applyPatch(distributeNodesPatch(s.doc, [...s.selection], axis), `Distribute ${axis}`);
    },

    flipSelected: (axis) => {
      const s = get();
      if (!s.doc || s.selection.size === 0) return;
      const ids = [...s.selection];
      const ops = ids.flatMap((id) => flipNodePatch(s.doc as Document, id, axis));
      if (ops.length > 0) s.applyPatch(ops, `Flip ${axis}`);
    },

    groupSelected: () => {
      const s = get();
      if (!s.doc || s.selection.size === 0) return;
      try {
        const { patch, groupId } = groupNodesPatch(s.doc, [...s.selection]);
        s.applyPatch(patch, 'Group');
        s.select([groupId]);
      } catch {
        // Selection spans different parents (non-siblings) — silently skip.
      }
    },

    ungroupSelected: () => {
      const s = get();
      if (!s.doc || s.selection.size === 0) return;
      let working: Document = s.doc;
      const ops: DocumentPatch = [];
      const lifted: string[] = [];
      for (const id of s.selection) {
        const g = findNode(working, id);
        if (!g?.children?.length) continue;
        lifted.push(...g.children.map((c) => c.id));
        const part = ungroupNodesPatch(working, id);
        ops.push(...part);
        working = applyPatch(working, part);
      }
      if (ops.length > 0) {
        s.applyPatch(ops, 'Ungroup');
        if (lifted.length > 0) s.select(lifted);
      }
    },

    renameNode: (id, name) => {
      const s = get();
      if (!s.doc) return;
      s.applyPatch(renameNodePatch(s.doc, id, name), 'Rename');
    },

    setLayoutMode: (nodeId, mode) => {
      const s = get();
      if (!s.doc) return;
      const node = findNode(s.doc, nodeId);
      const p = findNodePath(s.doc, nodeId);
      if (!node || !p) return;
      let ops: DocumentPatch = [];
      if (mode === 'none') {
        if (node.layout) ops = [{ op: 'remove', path: `${p}/layout` }];
      } else {
        ops = [{ op: node.layout ? 'replace' : 'add', path: `${p}/layout`, value: mode }];
      }
      if (ops.length > 0) s.applyPatch(ops, `Layout ${mode}`);
    },

    setLayoutProps: (nodeId, partial) => {
      const s = get();
      if (!s.doc) return;
      const node = findNode(s.doc, nodeId);
      const p = findNodePath(s.doc, nodeId);
      if (!node || !p) return;
      const next = { ...(node.layoutProps ?? {}), ...partial };
      s.applyPatch([{ op: node.layoutProps ? 'replace' : 'add', path: `${p}/layoutProps`, value: next }], 'Layout props');
    },

    setConstraintPin: (nodeId, axis, pin) => {
      const s = get();
      if (!s.doc) return;
      const node = findNode(s.doc, nodeId);
      const p = findNodePath(s.doc, nodeId);
      if (!node || !p) return;
      const cur: ConstraintSpec = node.constraints ?? {};
      let next: ConstraintSpec;
      if (pin) {
        next = { ...cur, [axis]: { pin, ...(cur[axis] ?? {}) } };
      } else {
        const c = { ...cur };
        delete c[axis];
        next = c;
      }
      s.applyPatch([{ op: node.constraints ? 'replace' : 'add', path: `${p}/constraints`, value: next }], 'Constraint');
    },

    setResponsiveOverride: (nodeId, bp, partial) => {
      const s = get();
      if (!s.doc) return;
      s.applyPatch(setResponsiveOverridePatch(s.doc, nodeId, bp, partial), `Responsive ${bp}`);
    },

    clearResponsiveBreakpoint: (nodeId, bp) => {
      const s = get();
      if (!s.doc) return;
      const ops = clearResponsiveBreakpointPatch(s.doc, nodeId, bp);
      if (ops.length > 0) s.applyPatch(ops, `Clear ${bp}`);
    },
  })),
);
