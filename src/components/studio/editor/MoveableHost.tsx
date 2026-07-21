'use client';

import { useState, useEffect, memo } from 'react';
import Moveable from 'react-moveable';
import type { MoveableDefaultProps, GroupableProps, IndividualGroupableProps, BeforeRenderableProps, RenderableProps } from 'react-moveable';
import type { SnapConfig } from '@editor/snapping';
import { snapDelta } from '@editor/snapping';
import type { GuideLine } from '@editor/snapping';

// ADR-014 §5: react-moveable attaches to a single proxy element (`#moveable-target`).
// One MoveableHost per frame, one Moveable instance. The overlay proxy is positioned
// at the selection bounding box by SelectionOverlay.
//
// ADR-014 §4: moveable sends raw deltas → Snap Engine resolves → Command.
// The Swap Engine is library-agnostic; swapping react-moveable for something else
// only rewrites this file.

interface MoveableHostProps {
  /** World-coord bbox of the selection (from SelectionOverlay). */
  targetBbox: { x: number; y: number; w: number; h: number } | null;
  /** Current world frames of selected nodes (for sprite-offset calc). */
  selectedFrames: { id: string; frame: import('@core/document').NodeFrame }[];
  snapConfig: SnapConfig;
  siblingFrames: import('@core/document').NodeFrame[];
  onMoveBy: (dx: number, dy: number) => void;
  onResize: (params: { nodeId: string; x?: number; y?: number; w: number; h: number }) => void;
  onRotate: (params: { nodeId: string; rotation: number }) => void;
  onGuides: (guides: GuideLine[]) => void;
  disabled?: boolean;
  /** Camera zoom so react-moveable converts screen px ↔ world px correctly. */
  zoom?: number;
  /** E1.5: transform capabilities for the primary selected node (ADR-005). */
  canDrag?: boolean;
  canResize?: boolean;
  canRotate?: boolean;
}

const MoveableHost: React.FC<MoveableHostProps> = memo(function MoveableHostFn({
  targetBbox,
  selectedFrames,
  snapConfig,
  siblingFrames,
  onMoveBy,
  onResize,
  onRotate,
  onGuides,
  disabled,
  zoom = 1,
  canDrag = true,
  canResize = true,
  canRotate = true,
}) {
  // Resolve the proxy element (#moveable-target, rendered by SelectionOverlay) into
  // state so Moveable re-renders once it exists — passing a ref object leaves
  // `.current` null on first render and Moveable mounts against nothing.
  const [targetEl, setTargetEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const el = document.getElementById('moveable-target');
    if (el && el !== targetEl) setTargetEl(el);
  }, [targetBbox, targetEl]);

  if (!targetBbox || !selectedFrames.length || disabled || !targetEl) return null;

  return (
    <Moveable
      target={targetEl}
      zoom={zoom}
      draggable={canDrag}
      resizable={canResize}
      rotatable={canRotate}
      throttleDrag={0}
      throttleResize={0}
      throttleRotate={0}
      origin={false}

      onDrag={(e: Record<string, any>) => {
        // ADR-014 §4: raw delta → Snap Engine → resolved → command.
        // react-moveable 0.56 exposes total gesture displacement as distX/distY.
        if (!selectedFrames[0]) return;
        const f = selectedFrames[0].frame;
        const raw = { dx: (e as any).distX ?? 0, dy: (e as any).distY ?? 0, dw: 0, dh: 0 };
        const resolved = snapDelta(f, siblingFrames, raw, snapConfig);
        onGuides(resolved.guides);
        if (e.target) {
          e.target.style.transform = `translate(${resolved.dx}px, ${resolved.dy}px)`;
        }
      }}
      onDragEnd={(e: Record<string, any>) => {
        if (!selectedFrames[0] || !e.target) return;
        const f = selectedFrames[0].frame;
        const raw = { dx: (e as any).distX ?? 0, dy: (e as any).distY ?? 0, dw: 0, dh: 0 };
        const resolved = snapDelta(f, siblingFrames, raw, snapConfig);
        // E3: move the whole selection by the resolved delta (multi-select move).
        onMoveBy(resolved.dx, resolved.dy);
        e.target.style.transform = '';
        onGuides([]);
      }}

      onResize={(e: Record<string, any>) => {
        if (!selectedFrames[0]) return;
        if (e.target) {
          e.target.style.width = `${e.width}px`;
          e.target.style.height = `${e.height}px`;
        }
      }}
      onResizeEnd={(e: Record<string, any>) => {
        const lastEvent = (e as any).lastEvent;
        if (!selectedFrames[0] || !lastEvent) return;
        // react-moveable emits drag.left/drag.top for the position delta when a
        // non-bottom-right handle is pulled; apply it so the node keeps its corner.
        const f = selectedFrames[0].frame;
        const left = lastEvent.drag?.left;
        const top = lastEvent.drag?.top;
        onResize({
          nodeId: selectedFrames[0].id,
          x: left != null ? f.x + left : undefined,
          y: top != null ? f.y + top : undefined,
          w: lastEvent.width,
          h: lastEvent.height,
        });
      }}

      onRotate={(e: Record<string, any>) => {
        if (e.target) {
          e.target.style.transform = `rotate(${e.beforeRotate}deg)`;
        }
      }}
      onRotateEnd={(e: Record<string, any>) => {
        const lastEvent = (e as any).lastEvent;
        if (!selectedFrames[0] || !lastEvent) return;
        onRotate({ nodeId: selectedFrames[0].id, rotation: lastEvent.beforeRotate });
      }}
    />
  );
});

export default MoveableHost;
