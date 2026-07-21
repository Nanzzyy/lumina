import type { GridStackWidget, GridStackNode } from 'gridstack';
import type { LayoutNode, Placement } from '@/lib/layout/tree';
import { clampPlacement } from '@/lib/layout/migrate';

export const GRID_COLUMNS = 12;

/** Convert a LayoutNode to the subset gridstack needs to place a widget. */
export function nodeToWidget(n: LayoutNode): GridStackWidget {
  return {
    id: n.id,
    x: n.placement.x,
    y: n.placement.y,
    w: n.placement.w,
    h: n.placement.h,
    // ponytail: subGridOpts wired in Fase 3 for composite slot editing (depth 1).
  };
}

/** Read a placement back out of a gridstack engine node. */
export function widgetToPlacement(gs: GridStackNode): Placement {
  return clampPlacement({
    x: gs.x ?? 0,
    y: gs.y ?? 0,
    w: gs.w ?? 1,
    h: gs.h ?? 1,
  });
}

/** Auto-place the next free-ish position for a freshly added node. */
export function nextPlacement(existing: LayoutNode[], w = 12, h = 3): Placement {
  const maxY = existing.reduce((m, n) => Math.max(m, n.placement.y + n.placement.h), 0);
  return clampPlacement({ x: 0, y: maxY, w, h });
}

/**
 * First free slot scanning top→down, left→right (shelf-pack).
 * Used in advanced mode so new widgets tile into gaps instead of stacking.
 */
export function findEmptySlot(existing: LayoutNode[], w: number, h: number): Placement {
  const occ = existing.map((n) => n.placement);
  for (let y = 0; y < 500; y++) {
    for (let x = 0; x + w <= GRID_COLUMNS; x++) {
      const hit = occ.some(
        (o) => !(x + w <= o.x || x >= o.x + o.w || y + h <= o.y || y >= o.y + o.h),
      );
      if (!hit) return clampPlacement({ x, y, w, h });
    }
  }
  return nextPlacement(existing, w, h);
}
