/**
 * Constraint Solver — ADR-019.
 *
 * Resolves node constraints (pin, aspect, min/max, safe-area, container) into
 * CSS-compatible output. Operates as Resolution Pipeline step 6 (resolverStep6).
 * Pure: no React/DB (R5/R7).
 *
 * The solver runs AFTER tokens, properties, and responsive overrides are applied,
 * so it works on fully resolved frames.
 */

import type { ConstraintSpec, ConstraintPin, NodeFrame } from './document';

export interface ConstrainedFrame extends NodeFrame {
  _css?: Record<string, string>;
}

export interface ResolvedConstraints {
  /** CSS properties to emit. */
  style: Record<string, string>;
  /** True if this node uses container queries (needs @container wrapper). */
  usesContainerQuery: boolean;
}

// ─── Pin resolution ─────────────────────────────────────────
/**
 * Resolve pin constraints. Given a parent frame size and the node's target frame,
 * emit CSS properties that pin the node according to `spec`. Returns a style map.
 */
export function resolvePin(
  frame: NodeFrame,
  parentW: number,
  parentH: number,
  spec: ConstraintSpec,
): Record<string, string> {
  const css: Record<string, string> = {};

  // Pin horizontal
  if (spec.horizontal?.pin === 'left') {
    css.left = `${frame.x}px`;
    css.right = 'auto';
  } else if (spec.horizontal?.pin === 'right') {
    css.right = `${parentW - frame.x - frame.w}px`;
    css.left = 'auto';
  } else if (spec.horizontal?.pin === 'centerX') {
    css.left = `${(parentW - frame.w) / 2}px`;
  } else if (spec.horizontal?.pin === 'scale') {
    css.left = `${(frame.x / parentW) * 100}%`;
    css.width = `${(frame.w / parentW) * 100}%`;
  } else if (spec.horizontal?.pin === 'fixed') {
    css.left = `${frame.x}px`;
    css.width = `${frame.w}px`;
  } else {
    // default: absolute positioning
    css.left = `${frame.x}px`;
  }

  // Pin vertical
  if (spec.vertical?.pin === 'top') {
    css.top = `${frame.y}px`;
    css.bottom = 'auto';
  } else if (spec.vertical?.pin === 'bottom') {
    css.bottom = `${parentH - frame.y - frame.h}px`;
    css.top = 'auto';
  } else if (spec.vertical?.pin === 'centerY') {
    css.top = `${(parentH - frame.h) / 2}px`;
  } else if (spec.vertical?.pin === 'scale') {
    css.top = `${(frame.y / parentH) * 100}%`;
    css.height = `${(frame.h / parentH) * 100}%`;
  } else if (spec.vertical?.pin === 'fixed') {
    css.top = `${frame.y}px`;
    css.height = `${frame.h}px`;
  } else {
    css.top = `${frame.y}px`;
  }

  // Min/Max
  if (spec.horizontal) {
    if (spec.horizontal.min != null) { css.minWidth = `${spec.horizontal.min}px`; }
    if (spec.horizontal.max != null) { css.maxWidth = `${spec.horizontal.max}px`; }
  }
  if (spec.vertical) {
    if (spec.vertical.min != null) { css.minHeight = `${spec.vertical.min}px`; }
    if (spec.vertical.max != null) { css.maxHeight = `${spec.vertical.max}px`; }
  }

  return css;
}

/**
 * Resolve aspect ratio constraint. If the frame has a constrained aspect, adjust
 * size to match. Returns the adjusted frame (pure).
 */
export function applyAspectRatio(
  frame: NodeFrame,
  aspect: number,
  lock: 'width' | 'height' = 'width',
): NodeFrame {
  if (lock === 'width') {
    return { ...frame, h: frame.w / aspect };
  }
  return { ...frame, w: frame.h * aspect };
}

/**
 * Resolve safe-area padding. Returns inset in pixels.
 */
export function safeAreaInset(spec: ConstraintSpec): { top: number; right: number; bottom: number; left: number } {
  if (!spec.safeArea) return { top: 0, right: 0, bottom: 0, left: 0 };
  // For web, safe-area constants from env(safe-area-inset-*).
  // Returns CSS-compatible env() references.
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };
}

/**
 * Full constraint resolution for a single node.
 * Extends the frame with CSS style output used by the renderer.
 */
export function resolveNodeConstraints(
  frame: NodeFrame,
  parentW: number,
  parentH: number,
  spec?: ConstraintSpec,
): ResolvedConstraints {
  const style: Record<string, string> = {};
  let usesContainerQuery = false;

  if (!spec) {
    // Default: absolute position
    style.position = 'absolute';
    style.left = `${frame.x}px`;
    style.top = `${frame.y}px`;
    style.width = `${frame.w}px`;
    style.height = `${frame.h}px`;
    if (frame.rotation) style.transform = `rotate(${frame.rotation}deg)`;
    return { style, usesContainerQuery };
  }

  style.position = 'absolute';
  Object.assign(style, resolvePin(frame, parentW, parentH, spec));

  // Aspect ratio
  if (spec.aspect != null && spec.aspect > 0) {
    const adjusted = applyAspectRatio(frame, spec.aspect, spec.vertical?.pin === 'scale' ? 'height' : 'width');
    style.width = `${adjusted.w}px`;
    style.height = `${adjusted.h}px`;
  }

  // Safe area
  if (spec.safeArea) {
    const env = 'env(safe-area-inset-top)';
    style.marginTop = env;
    style.marginBottom = 'env(safe-area-inset-bottom)';
    style.marginLeft = 'env(safe-area-inset-left)';
    style.marginRight = 'env(safe-area-inset-right)';
  }

  // Container query
  if (spec.container === 'query') {
    usesContainerQuery = true;
  }

  return { style, usesContainerQuery };
}

/**
 * E6: Compute a node's frame after its container resized, per its pins.
 * Frame-math counterpart to the CSS solver above — used for editor preview
 * (device-switch) and responsive repositioning. left/top pins keep offset,
 * right/bottom preserve the far-edge offset, centerX/centerY recenter, scale
 * resizes proportionally, fixed (or unset) leaves the axis unchanged.
 *
 * ponytail: two-edge stretch (pin left+right simultaneously) — the current
 * ConstraintSpec carries one pin per axis, so 'scale' covers proportional resize.
 */
export function resolveConstraintFrame(
  frame: NodeFrame,
  spec: ConstraintSpec,
  oldW: number,
  oldH: number,
  newW: number,
  newH: number,
): NodeFrame {
  if (newW === oldW && newH === oldH) return frame;
  let { x, y, w, h } = frame;

  switch (spec.horizontal?.pin) {
    case 'right': { const rightOffset = oldW - x - w; x = newW - rightOffset - w; break; }
    case 'centerX': x = (newW - w) / 2; break;
    case 'scale': x = (x / oldW) * newW; w = (w / oldW) * newW; break;
    // 'left' | 'fixed' | undefined → unchanged
  }
  switch (spec.vertical?.pin) {
    case 'bottom': { const bottomOffset = oldH - y - h; y = newH - bottomOffset - h; break; }
    case 'centerY': y = (newH - h) / 2; break;
    case 'scale': y = (y / oldH) * newH; h = (h / oldH) * newH; break;
  }
  return { ...frame, x, y, w, h };
}
