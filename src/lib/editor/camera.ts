/**
 * Camera / viewport math — ADR-014 §1 (Viewport ≠ Canvas).
 *
 * The Camera is the {zoom, pan} transform between screen pixels and world coords.
 * Pure: no React, no DOM (R7). The Viewport component applies `cameraTransform()`
 * to a wrapper; pan/zoom mutate the Camera (UI state, non-historical).
 */

export interface Camera {
  zoom: number;
  panX: number;
  panY: number;
}

export const CAMERA_MIN_ZOOM = 0.1;
export const CAMERA_MAX_ZOOM = 8;

export function clampZoom(z: number): number {
  return Math.min(CAMERA_MAX_ZOOM, Math.max(CAMERA_MIN_ZOOM, z));
}

export function makeCamera(zoom = 1, panX = 0, panY = 0): Camera {
  return { zoom: clampZoom(zoom), panX, panY };
}

/** World coordinates → screen pixels. */
export function worldToScreen(cam: Camera, wx: number, wy: number): { x: number; y: number } {
  return { x: wx * cam.zoom + cam.panX, y: wy * cam.zoom + cam.panY };
}

/** Screen pixels → world coordinates. */
export function screenToWorld(cam: Camera, sx: number, sy: number): { x: number; y: number } {
  return { x: (sx - cam.panX) / cam.zoom, y: (sy - cam.panY) / cam.zoom };
}

/** CSS transform string for the viewport wrapper. */
export function cameraTransform(cam: Camera): string {
  return `translate(${cam.panX}px, ${cam.panY}px) scale(${cam.zoom})`;
}

/**
 * Zoom toward a screen anchor (cursor) so the world point under the cursor stays
 * fixed. Returns a new Camera; pure.
 */
export function zoomAtPoint(cam: Camera, screenX: number, screenY: number, nextZoom: number): Camera {
  const z = clampZoom(nextZoom);
  const world = screenToWorld(cam, screenX, screenY);
  return { zoom: z, panX: screenX - world.x * z, panY: screenY - world.y * z };
}
