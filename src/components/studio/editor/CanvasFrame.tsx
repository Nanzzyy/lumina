'use client';

import { useMemo, useCallback, memo, useRef, useState } from 'react';
import type { FC, CSSProperties } from 'react';
import type { Node, NodeFrame, Document } from '@core/document';
import { findNode } from '@core/document';
import { useEditorStore } from '@editor/store';
import { resizeNodeCommand, rotateNodeCommand } from '@editor/commands';
import { can } from '@core/capabilities';
import { resolveLayoutNode } from '@core/layout';
import { flattenWithWorldFrame, rectsIntersect } from '@editor/node-tree';
import dynamic from 'next/dynamic';
import NodeView from './NodeView';
import SelectionOverlay from './SelectionOverlay';

const MoveableHost = dynamic(() => import('./MoveableHost'), { ssr: false });

interface CanvasFrameProps {
  /** The active frame's nodes (top-level; children render recursively). */
  nodes: Node[];
  /** The full document (for command building). */
  doc: Document;
  viewportW: number;
  viewportH: number;
}

/**
 * CanvasFrame = one artboard (ADR-014 §1). Renders the NodeView tree (recursive),
 * the Selection Overlay, and the Moveable host.
 *
 * E2 Selection Engine: world-frame selection (nested-aware), marquee box-select on
 * empty canvas, locked/hidden nodes excluded from selection + hit-test.
 */
const CanvasFrame: FC<CanvasFrameProps> = memo(function CanvasFrameFn({ nodes, doc, viewportW, viewportH }) {
  const selection = useEditorStore((s) => s.selection);
  const hovered = useEditorStore((s) => s.ui.hoveredId);
  const ui = useEditorStore((s) => s.ui);
  const zoom = useEditorStore((s) => s.camera.zoom);
  const moveSelectedBy = useEditorStore((s) => s.moveSelectedBy);
  const setActiveGuides = useEditorStore((s) => s.setActiveGuides);
  const select = useEditorStore((s) => s.select);
  const toggleSelect = useEditorStore((s) => s.toggleSelect);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const setMarqueeRect = useEditorStore((s) => s.setMarqueeRect);

  const frameRef = useRef<HTMLDivElement>(null);
  const marquee = useRef<{ active: boolean; sx: number; sy: number }>({ active: false, sx: 0, sy: 0 });

  // E5: resolve Auto Layout (flex) into computed frames before rendering / hit-test.
  const resolvedNodes = useMemo(() => nodes.map(resolveLayoutNode), [nodes]);
  // Flatten to world-frame positioned nodes (recursive over children).
  const positioned = useMemo(() => flattenWithWorldFrame(resolvedNodes), [resolvedNodes]);
  const selectedFrames = useRef<NodeFrame[]>([]);
  const selectedPositioned = useMemo(
    () => positioned.filter((p) => selection.has(p.node.id)),
    [positioned, selection],
  );
  selectedFrames.current = selectedPositioned.map((p) => p.world);

  const siblingFrames = useMemo(
    () => positioned.filter((p) => !selection.has(p.node.id) && !p.node.locked).map((p) => p.world),
    [positioned, selection],
  );

  const [targetBbox, setTargetBbox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Screen px → world px (the frame lives inside the camera-transformed canvas).
  const toWorld = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      const r = frameRef.current?.getBoundingClientRect();
      if (!r) return { x: 0, y: 0 };
      return { x: (clientX - r.left) / zoom, y: (clientY - r.top) / zoom };
    },
    [zoom],
  );

  // ─── Node pointer (click / shift-toggle) ───────────────────
  const handleNodePointerDown = useCallback(
    (e: React.PointerEvent, nodeId: string) => {
      if (ui.tool !== 'select') return;
      e.stopPropagation();
      const p = positioned.find((it) => it.node.id === nodeId);
      if (p?.node.locked) return; // locked nodes are not selectable
      if (e.shiftKey) toggleSelect(nodeId);
      else if (!selection.has(nodeId)) select([nodeId]);
    },
    [ui.tool, select, toggleSelect, selection, positioned],
  );

  // ─── Marquee box-select on empty canvas ────────────────────
  const handleFramePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (ui.tool !== 'select' || e.button !== 0) return;
      // NodeView stops propagation, so reaching here == empty canvas.
      const w = toWorld(e.clientX, e.clientY);
      marquee.current = { active: true, sx: w.x, sy: w.y };
      setMarqueeRect({ x: w.x, y: w.y, w: 0, h: 0 });
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [ui.tool, toWorld, setMarqueeRect],
  );

  const handleFramePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!marquee.current.active) return;
      const w = toWorld(e.clientX, e.clientY);
      const { sx, sy } = marquee.current;
      setMarqueeRect({
        x: Math.min(sx, w.x),
        y: Math.min(sy, w.y),
        w: Math.abs(w.x - sx),
        h: Math.abs(w.y - sy),
      });
    },
    [toWorld, setMarqueeRect],
  );

  const handleFramePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!marquee.current.active) return;
      marquee.current.active = false;
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
      const rect = ui.marqueeRect;
      setMarqueeRect(null);
      if (!rect || (rect.w < 2 && rect.h < 2)) {
        // Treat as a plain empty click → clear (shift keeps current).
        if (!e.shiftKey) clearSelection();
        return;
      }
      const hits = positioned
        .filter((p) => !p.node.locked && !p.node.hidden && rectsIntersect(p.world, rect))
        .map((p) => p.node.id);
      if (e.shiftKey) {
        const next = new Set(selection);
        hits.forEach((id) => next.add(id));
        select([...next]);
      } else {
        select(hits);
      }
    },
    [ui.marqueeRect, positioned, selection, select, setMarqueeRect, clearSelection],
  );

  // ─── Moveable callbacks ────────────────────────────────────
  const handleMoveBy = useCallback((dx: number, dy: number) => moveSelectedBy(dx, dy), [moveSelectedBy]);
  const handleResize = useCallback(
    ({ nodeId, x, y, w, h }: { nodeId: string; x?: number; y?: number; w: number; h: number }) => {
      if (!findNode(doc, nodeId)) return;
      useEditorStore.getState().executeCommand(resizeNodeCommand(doc, nodeId, w, h, x, y));
    },
    [doc],
  );
  const handleRotate = useCallback(
    ({ nodeId, rotation }: { nodeId: string; rotation: number }) => {
      useEditorStore.getState().executeCommand(rotateNodeCommand(doc, nodeId, rotation));
    },
    [doc],
  );

  const primary = selectedPositioned[0]?.node;
  const canDrag = primary ? can(primary, 'draggable') : true;
  const canResize = primary ? can(primary, 'resizable') : true;
  const canRotate = primary ? can(primary, 'rotatable') : true;

  const frameStyle: CSSProperties = {
    width: viewportW,
    height: viewportH,
    position: 'relative',
    overflow: 'hidden',
    background: 'white',
    boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
    borderRadius: 8,
    touchAction: 'none',
  };

  return (
    <div
      ref={frameRef}
      style={frameStyle}
      onPointerDown={handleFramePointerDown}
      onPointerMove={handleFramePointerMove}
      onPointerUp={handleFramePointerUp}
    >
      {resolvedNodes.map((node) => (
        <NodeView
          key={node.id}
          node={node}
          selection={selection}
          hoveredId={hovered}
          onPointerDown={handleNodePointerDown}
          onClick={(id) => select([id])}
        />
      ))}

      <SelectionOverlay
        selectedFrames={selectedFrames.current}
        selectedIds={selection}
        activeGuides={ui.activeGuides}
        showGuides={ui.showGuides}
        marqueeRect={ui.marqueeRect}
        onBbox={setTargetBbox}
      />

      <MoveableHost
        targetBbox={targetBbox}
        selectedFrames={selectedPositioned.map((p) => ({ id: p.node.id, frame: p.world }))}
        snapConfig={ui.snapConfig}
        siblingFrames={siblingFrames}
        zoom={zoom}
        canDrag={canDrag}
        canResize={canResize}
        canRotate={canRotate}
        onMoveBy={handleMoveBy}
        onResize={handleResize}
        onRotate={handleRotate}
        onGuides={setActiveGuides}
        disabled={selection.size === 0}
      />
    </div>
  );
});

export default CanvasFrame;
