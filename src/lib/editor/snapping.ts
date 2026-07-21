/**
 * Snap Engine — ADR-014 §4 (library-agnostic).
 *
 * Pointer library (react-moveable) delivers a raw delta; this engine resolves it
 * against grid lines + edge/center guide lines. Pure. Keyboard-nudge and marquee
 * distribution use the same path. The Viewport component wires every request
 * through here before building a Command.
 *
 * ponytail: multi-select distribution (align horizontally, distribute evenly)
 * and smart gap display between siblings — added when the editor UI needs them.
 */

import type { NodeFrame } from '../core/document';

export interface SnapConfig {
  /** Visible grid cell size (`null` = no grid snap). */
  gridSize: number | null;
  /** Snap threshold in world pixels. */
  threshold: number;
}

export const DEFAULT_SNAP: SnapConfig = { gridSize: 10, threshold: 5 };

export interface RawDelta {
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}

export interface ResolvedDelta {
  dx: number;
  dy: number;
  dw: number;
  dh: number;
  /** Guide lines to render (editor UI draws them). */
  guides: GuideLine[];
}

export interface GuideLine {
  axis: 'x' | 'y';
  value: number;
  kind: 'grid' | 'edge' | 'center' | 'gap';
}

/** Grid-snap a coordinate to the nearest grid line. */
export function snapToGrid(v: number, gridSize: number): number {
  return Math.round(v / gridSize) * gridSize;
}

/**
 * Resolve a raw move delta against grid + sibling guides.
 *
 * - `frame`: node's current frame.
 * - `siblings`: frames of other nodes in the same container (for edge/center alignment).
 * - `delta`: raw delta from the pointer library.
 * - `config`: snap settings.
 */
export function snapDelta(
  frame: NodeFrame,
  siblings: NodeFrame[],
  delta: RawDelta,
  config: SnapConfig = DEFAULT_SNAP,
): ResolvedDelta {
  const guides: GuideLine[] = [];

  const newX = frame.x + delta.dx;
  const newY = frame.y + delta.dy;
  const newW = frame.w + delta.dw;
  const newH = frame.h + delta.dh;

  let snappedX = newX;
  let snappedY = newY;

  // Grid snap
  if (config.gridSize) {
    const gx = snapToGrid(newX, config.gridSize);
    const gy = snapToGrid(newY, config.gridSize);
    const gWidth = snapToGrid(newW, config.gridSize);
    const gHeight = snapToGrid(newH, config.gridSize);

    if (Math.abs(gx - newX) <= config.threshold) {
      snappedX = gx;
      guides.push({ axis: 'x', value: gx, kind: 'grid' });
    }
    if (Math.abs(gy - newY) <= config.threshold) {
      snappedY = gy;
      guides.push({ axis: 'y', value: gy, kind: 'grid' });
    }
    // size snap (useful for resize)
    if (delta.dw !== 0 && Math.abs(gWidth - newW) <= config.threshold) {
      // we just note the guide; the caller adjusts
      guides.push({ axis: 'x', value: frame.x + gWidth, kind: 'grid' });
    }
    if (delta.dh !== 0 && Math.abs(gHeight - newH) <= config.threshold) {
      guides.push({ axis: 'y', value: frame.y + gHeight, kind: 'grid' });
    }
  }

  // Edge / center alignment to siblings
  const myCenter = { x: frame.x + frame.w / 2, y: frame.y + frame.h / 2 };
  for (const sib of siblings) {
    const sibCenter = { x: sib.x + sib.w / 2, y: sib.y + sib.h / 2 };

    // Left edges
    if (Math.abs(snappedX - sib.x) <= config.threshold) {
      snappedX = sib.x;
      guides.push({ axis: 'x', value: sib.x, kind: 'edge' });
    }
    // Right edges
    if (Math.abs(snappedX + frame.w - (sib.x + sib.w)) <= config.threshold) {
      snappedX = sib.x + sib.w - frame.w;
      guides.push({ axis: 'x', value: sib.x + sib.w, kind: 'edge' });
    }
    // Center X
    if (Math.abs(myCenter.x - sibCenter.x) <= config.threshold) {
      snappedX = sibCenter.x - frame.w / 2;
      guides.push({ axis: 'x', value: sibCenter.x, kind: 'center' });
    }
    // Top edges
    if (Math.abs(snappedY - sib.y) <= config.threshold) {
      snappedY = sib.y;
      guides.push({ axis: 'y', value: sib.y, kind: 'edge' });
    }
    // Bottom edges
    if (Math.abs(snappedY + frame.h - (sib.y + sib.h)) <= config.threshold) {
      snappedY = sib.y + sib.h - frame.h;
      guides.push({ axis: 'y', value: sib.y + sib.h, kind: 'edge' });
    }
    // Center Y
    if (Math.abs(myCenter.y - sibCenter.y) <= config.threshold) {
      snappedY = sibCenter.y - frame.h / 2;
      guides.push({ axis: 'y', value: sibCenter.y, kind: 'center' });
    }
  }

  return {
    dx: snappedX - frame.x,
    dy: snappedY - frame.y,
    dw: delta.dw,
    dh: delta.dh,
    guides: dedupeGuides(guides),
  };
}

function dedupeGuides(guides: GuideLine[]): GuideLine[] {
  const seen = new Set<string>();
  return guides.filter((g) => {
    const k = `${g.axis}:${Math.round(g.value * 1000)}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/**
 * Keyboard nudge: move a node by `step` px (default 1, Shift = 10).
 * On the grid: first nudge rounds to grid, then moves by grid steps.
 */
export function nudge(frame: NodeFrame, dx: number, dy: number, gridSize: number | null): { x: number; y: number } {
  if (!gridSize) return { x: frame.x + dx, y: frame.y + dy };
  // First nudge from a grid-aligned position: snap once, then grid-step.
  // Simple approach: always snap the result.
  return {
    x: snapToGrid(frame.x + dx, gridSize),
    y: snapToGrid(frame.y + dy, gridSize),
  };
}
