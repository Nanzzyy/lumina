'use client';

import { useRef, useState, useCallback, memo, useEffect } from 'react';
import type { CSSProperties, FC, ReactNode } from 'react';
import { useEditorStore } from '@editor/store';

interface ViewportProps {
  children: ReactNode;
  /** World area to fill (default 20000×20000 — infinite-ish). */
  worldW?: number;
  worldH?: number;
  /** Size of the actual rendered frames area (for zoom-to-fit). */
  framesAreaW?: number;
  framesAreaH?: number;
}

/**
 * Viewport — ADR-014 §1. Handles pan/zoom input, applies the camera transform.
 * Contains Canvas (world coords) which contains Frames.
 */
const Viewport: FC<ViewportProps> = memo(function ViewportFn({
  children,
  worldW = 20000,
  worldH = 20000,
  framesAreaW = 400,
  framesAreaH = 900,
}) {
  const camera = useEditorStore((s) => s.camera);
  const tool = useEditorStore((s) => s.ui.tool);
  const panBy = useEditorStore((s) => s.panBy);
  const zoomAt = useEditorStore((s) => s.zoomAt);
  const zoomToFit = useEditorStore((s) => s.zoomToFit);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [panning, setPanning] = useState(false);
  const isPanning = useRef(false);
  const lastPtr = useRef({ x: 0, y: 0 });

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSize((s) => {
          const w = entry.contentRect.width, h = entry.contentRect.height;
          if (s.w === w && s.h === h) return s;
          return { w, h };
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Fit-once on mount, then re-fit only when the device/frame size changes (so
  // window resizes / devtools docks don't clobber the user's wheel-zoom + pan).
  const didFit = useRef(false);
  const prevArea = useRef({ w: 0, h: 0 });
  useEffect(() => {
    const areaChanged = prevArea.current.w !== framesAreaW || prevArea.current.h !== framesAreaH;
    if (size.w > 0 && size.h > 0 && framesAreaW > 0 && (!didFit.current || areaChanged)) {
      zoomToFit(size.w, size.h, framesAreaW, framesAreaH);
      didFit.current = true;
      prevArea.current = { w: framesAreaW, h: framesAreaH };
    }
  }, [size.w, size.h, framesAreaW, framesAreaH, zoomToFit]);

  // Mouse wheel → zoom toward cursor
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const delta = -e.deltaY * 0.001;
      const nextZoom = Math.max(0.5, Math.min(4, camera.zoom * (1 + delta)));
      zoomAt(sx, sy, nextZoom);
    },
    [camera.zoom, zoomAt],
  );

  // Pan: middle-mouse always, OR left-mouse when the Pan tool is active.
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const pan = e.button === 1 || (tool === 'pan' && e.button === 0);
      if (!pan) return;
      isPanning.current = true;
      setPanning(true);
      lastPtr.current = { x: e.clientX, y: e.clientY };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [tool],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPanning.current) return;
      const dx = e.clientX - lastPtr.current.x;
      const dy = e.clientY - lastPtr.current.y;
      panBy(dx, dy);
      lastPtr.current = { x: e.clientX, y: e.clientY };
    },
    [panBy],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (isPanning.current) {
        isPanning.current = false;
        setPanning(false);
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      }
    },
    [],
  );

  const viewportStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
    background: '#e5e7eb',
    cursor: panning ? 'grabbing' : tool === 'pan' ? 'grab' : 'default',
  };

  const canvasStyle: CSSProperties = {
    position: 'absolute',
    width: worldW,
    height: worldH,
    transform: `translate(${camera.panX}px, ${camera.panY}px) scale(${camera.zoom})`,
    transformOrigin: '0 0',
    willChange: 'transform',
  };

  return (
    <div
      ref={containerRef}
      style={viewportStyle}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Canvas — world coordinate space */}
      <div style={canvasStyle}>
        {children}
      </div>
    </div>
  );
});

export default Viewport;
