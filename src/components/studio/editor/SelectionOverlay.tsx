'use client';

import { useRef, useEffect, memo } from 'react';
import type { FC } from 'react';
import type { NodeFrame } from '@core/document';
import type { GuideLine } from '@editor/snapping';

// ADR-014 §5: ONE canvas-wide overlay draws selection boxes + handles + guides.
// The overlay is transparent to pointer events where there's no content.
// react-moveable attaches to `#moveable-target` (a proxy element), NOT to
// individual node DOM. This keeps NodeView clean and scales to 1000 nodes.

interface SelectionOverlayProps {
  /** Node frames in world coords for the current selection. */
  selectedFrames: NodeFrame[];
  /** Set of selected node ids. */
  selectedIds: Set<string>;
  /** Active snap guide lines (from Snap Engine). */
  activeGuides: GuideLine[];
  showGuides: boolean;
  /** Marquee rectangle in world coords. */
  marqueeRect: { x: number; y: number; w: number; h: number } | null;
  /** Bounding box of the selection (for moveable host). */
  onBbox: (bbox: { x: number; y: number; w: number; h: number } | null) => void;
}

const HANDLE_SIZE = 8;

const SelectionOverlay: FC<SelectionOverlayProps> = memo(function SelectionOverlayFn({
  selectedFrames,
  selectedIds,
  activeGuides,
  showGuides,
  marqueeRect,
  onBbox,
}) {
  const selCount = selectedIds.size;

  // Compute bounding box of the current selection set. Seed with the first frame
  // (NOT an Infinity sentinel — Infinity would leak into `w`/`h` via max(x+w,…)
  // and produce an invalid CSS width). Guard for selection set whose nodes aren't
  // in the current frame (selectedFrames empty).
  const bbox: { x: number; y: number; w: number; h: number } | null =
    selCount > 0 && selectedFrames.length > 0
      ? selectedFrames.reduce(
          (acc, f) => ({
            x: Math.min(acc.x, f.x),
            y: Math.min(acc.y, f.y),
            w: Math.max(acc.x + acc.w, f.x + f.w) - Math.min(acc.x, f.x),
            h: Math.max(acc.y + acc.h, f.y + f.h) - Math.min(acc.y, f.y),
          }),
          { x: selectedFrames[0].x, y: selectedFrames[0].y, w: selectedFrames[0].w, h: selectedFrames[0].h },
        )
      : null;

  // Deferred bbox callback so the parent (moveable host) gets the latest
  // after render (useEffect runs after paint).
  const prevBboxRef = useRef<typeof bbox>(null);
  useEffect(() => {
    if (
      bbox?.x !== prevBboxRef.current?.x || bbox?.y !== prevBboxRef.current?.y ||
      bbox?.w !== prevBboxRef.current?.w || bbox?.h !== prevBboxRef.current?.h
    ) {
      onBbox(bbox);
      prevBboxRef.current = bbox;
    }
  }, [bbox, onBbox]);

  if (!bbox) {
    return (
      <div id="moveable-target" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {showGuides && <GuidesLayer guides={activeGuides} />}
        {marqueeRect && <Marquee rect={marqueeRect} />}
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {/* Proxy target for react-moveable — overlays the selection bbox.
          Stop propagation so the pointerdown reaches react-moveable, NOT the
          frame's marquee handler (which would steal pointer capture). */}
      <div
        id="moveable-target"
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          left: bbox.x,
          top: bbox.y,
          width: bbox.w,
          height: bbox.h,
          pointerEvents: 'auto',
          zIndex: 9999999,
        }}
      />

      {/* Selection boxes (one per selected item) */}
      {selectedFrames.map((f, i) => (
        <div
          key={Array.from(selectedIds)[i] ?? i}
          style={{
            position: 'absolute',
            left: f.x,
            top: f.y,
            width: f.w,
            height: f.h,
            border: '2px solid #3b82f6',
            pointerEvents: 'none',
            zIndex: 9999998,
          }}
        />
      ))}

      {/* Handle dots at bounding box corners */}
      {corners(bbox).map((pt, i) => (
        <div
          key={`h-${i}`}
          style={{
            position: 'absolute',
            left: pt.x - HANDLE_SIZE / 2,
            top: pt.y - HANDLE_SIZE / 2,
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            borderRadius: '50%',
            background: '#3b82f6',
            border: '1px solid white',
            pointerEvents: 'none',
            zIndex: 9999999,
          }}
        />
      ))}

      {showGuides && <GuidesLayer guides={activeGuides} />}
      {marqueeRect && <Marquee rect={marqueeRect} />}
    </div>
  );
});

function corners(r: { x: number; y: number; w: number; h: number }) {
  return [
    { x: r.x, y: r.y },
    { x: r.x + r.w, y: r.y },
    { x: r.x, y: r.y + r.h },
    { x: r.x + r.w, y: r.y + r.h },
  ];
}

function GuidesLayer({ guides }: { guides: GuideLine[] }) {
  return (
    <>
      {guides.map((g, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            ...(g.axis === 'x'
              ? { left: g.value, top: -5000, width: 1, height: 10000 }
              : { top: g.value, left: -5000, height: 1, width: 10000 }),
            background: '#3b82f6',
            opacity: 0.7,
            pointerEvents: 'none',
            zIndex: 9999995,
          }}
        />
      ))}
    </>
  );
}

function Marquee({ rect }: { rect: { x: number; y: number; w: number; h: number } }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        border: '1px dashed #3b82f6',
        background: 'rgba(59,130,246,0.08)',
        pointerEvents: 'none',
        zIndex: 9999996,
      }}
    />
  );
}

export default SelectionOverlay;
