import { describe, it, expect } from 'vitest';
import {
  clampZoom,
  makeCamera,
  worldToScreen,
  screenToWorld,
  zoomAtPoint,
  cameraTransform,
  CAMERA_MIN_ZOOM,
  CAMERA_MAX_ZOOM,
} from './camera';

describe('camera (ADR-014 §1)', () => {
  it('clamps zoom to [min, max]', () => {
    expect(clampZoom(0)).toBe(CAMERA_MIN_ZOOM);
    expect(clampZoom(100)).toBe(CAMERA_MAX_ZOOM);
    expect(clampZoom(2)).toBe(2);
  });

  it('worldToScreen / screenToWorld round-trip', () => {
    const cam = makeCamera(2, 100, 50);
    const s = worldToScreen(cam, 10, 5);
    const w = screenToWorld(cam, s.x, s.y);
    expect(w.x).toBeCloseTo(10, 7);
    expect(w.y).toBeCloseTo(5, 7);
  });

  it('zoomAtPoint keeps the world point under the anchor fixed', () => {
    const cam = makeCamera(1, 0, 0);
    const anchor = { x: 200, y: 150 };
    const worldBefore = screenToWorld(cam, anchor.x, anchor.y);
    const next = zoomAtPoint(cam, anchor.x, anchor.y, 2);
    const worldAfter = screenToWorld(next, anchor.x, anchor.y);
    expect(worldAfter.x).toBeCloseTo(worldBefore.x, 7);
    expect(worldAfter.y).toBeCloseTo(worldBefore.y, 7);
    expect(next.zoom).toBe(2);
  });

  it('cameraTransform emits a CSS transform', () => {
    expect(cameraTransform(makeCamera(1.5, 10, 20))).toBe('translate(10px, 20px) scale(1.5)');
  });
});
