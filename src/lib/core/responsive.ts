/**
 * Responsive Override Resolver — ADR-019.
 *
 * Given a node's base frame + per-breakpoint overrides (PerBreakpoint) + target
 * breakpoint key, produces the resolved frame as a **diff** (not a copy). The
 * diff is a set of RFC6902 PatchOp entries that transform base → device-specific.
 *
 * This keeps the document lean: only what changes per breakpoint is stored,
 * not a full copy of each device layout.
 *
 * Pure: no React/DB (R5/R7).
 */

import type { NodeFrame, PerBreakpoint, BreakpointKey } from './document';
import type { PatchOp } from './history';
import { genId } from './id';

// ─── Public types ───────────────────────────────────────────
export const BREAKPOINT_ORDER: BreakpointKey[] = ['sm', 'md', 'lg', 'xl', '2xl'];
export const DEVICE_VIEWPORTS: Record<string, { w: number; h: number; label: string }> = {
  base: { w: 384, h: 728, label: 'Phone' },
  sm: { w: 640, h: 360, label: 'Phone Landscape' },
  md: { w: 768, h: 1024, label: 'Tablet' },
  lg: { w: 1024, h: 768, label: 'Desktop' },
  xl: { w: 1280, h: 800, label: 'Wide' },
  '2xl': { w: 1536, h: 864, label: 'Ultra-wide' },
};

export type DeviceKey = 'base' | BreakpointKey | 'custom';

/**
 * Resolve a node's effective frame for a given target breakpoint.
 * Cascades: base ← sm ← md ← lg ← xl ← 2xl (narrower override beats wider).
 * Returns the resolved frame (pure, no mutation).
 */
export function resolveResponsiveFrame(
  baseFrame: NodeFrame,
  responsive: PerBreakpoint | undefined,
  target: DeviceKey,
): NodeFrame {
  if (!responsive || target === 'base') return { ...baseFrame };

  const targetIdx = BREAKPOINT_ORDER.indexOf(target as BreakpointKey);
  if (targetIdx === -1) return { ...baseFrame };

  // Build the effective frame by layering overrides from base upward to target.
  let resolved: Partial<NodeFrame> = { ...baseFrame };

  for (let i = 0; i <= targetIdx && i < BREAKPOINT_ORDER.length; i++) {
    const bp = BREAKPOINT_ORDER[i];
    const override = responsive[bp];
    if (override) {
      resolved = { ...resolved, ...override };
    }
  }

  return resolved as NodeFrame;
}

/**
 * Compute the patch (RFC6902 style) that transforms base frame into the
 * target-responsive frame. Returns PatchOp[] for use with History (ADR-010).
 */
export function responsivePatch(
  nodeId: string,
  baseFrame: NodeFrame,
  responsive: PerBreakpoint | undefined,
  target: DeviceKey,
  framePath: string, // e.g. /project/pages/0/frames/0/nodes/3/frame
): PatchOp[] {
  const resolved = resolveResponsiveFrame(baseFrame, responsive, target);
  const patch: PatchOp[] = [];

  for (const key of ['x', 'y', 'w', 'h', 'rotation'] as const) {
    if (resolved[key] !== baseFrame[key]) {
      patch.push({
        op: 'replace',
        path: `${framePath}/${key}`,
        value: resolved[key],
      });
    }
  }
  return patch;
}

/**
 * All breakpoints resolved at once for a node.
 */
export function resolveAllResponsiveFrames(
  baseFrame: NodeFrame,
  responsive: PerBreakpoint | undefined,
): Record<string, NodeFrame> {
  const result: Record<string, NodeFrame> = { base: { ...baseFrame } };
  for (const bp of BREAKPOINT_ORDER) {
    result[bp] = resolveResponsiveFrame(baseFrame, responsive, bp);
  }
  return result;
}
