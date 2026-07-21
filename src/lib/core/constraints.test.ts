import { describe, it, expect } from 'vitest';
import { resolveNodeConstraints, resolvePin, applyAspectRatio, resolveConstraintFrame } from './constraints';
import type { ConstraintSpec } from './document';

describe('constraint solver (ADR-019 step 6)', () => {
  it('default: absolute position', () => {
    const r = resolveNodeConstraints({ x: 10, y: 20, w: 100, h: 50 }, 400, 800);
    expect(r.style.left).toBe('10px');
    expect(r.style.top).toBe('20px');
    expect(r.style.width).toBe('100px');
    expect(r.style.height).toBe('50px');
  });

  it('pin left/top', () => {
    const spec: ConstraintSpec = {
      horizontal: { pin: 'left' },
      vertical: { pin: 'top' },
    };
    const r = resolveNodeConstraints({ x: 10, y: 20, w: 100, h: 50 }, 400, 800, spec);
    expect(r.style.left).toBe('10px');
    expect(r.style.right).toBe('auto');
    expect(r.style.top).toBe('20px');
    expect(r.style.bottom).toBe('auto');
  });

  it('pin right/bottom', () => {
    const spec: ConstraintSpec = {
      horizontal: { pin: 'right' },
      vertical: { pin: 'bottom' },
    };
    const r = resolveNodeConstraints({ x: 10, y: 20, w: 100, h: 50 }, 400, 800, spec);
    expect(r.style.right).toBe('290px');  // 400 - 10 - 100
    expect(r.style.bottom).toBe('730px'); // 800 - 20 - 50
    expect(r.style.left).toBe('auto');
    expect(r.style.top).toBe('auto');
  });

  it('pin center', () => {
    const spec: ConstraintSpec = {
      horizontal: { pin: 'centerX' },
      vertical: { pin: 'centerY' },
    };
    const r = resolveNodeConstraints({ x: 0, y: 0, w: 100, h: 50 }, 400, 800, spec);
    expect(r.style.left).toBe('150px'); // (400-100)/2
    expect(r.style.top).toBe('375px');  // (800-50)/2
  });

  it('pin scale (percentage)', () => {
    const spec: ConstraintSpec = {
      horizontal: { pin: 'scale' },
      vertical: { pin: 'scale' },
    };
    const r = resolveNodeConstraints({ x: 10, y: 20, w: 100, h: 50 }, 400, 800, spec);
    expect(r.style.left).toBe('2.5%');   // 10/400*100
    expect(r.style.width).toBe('25%');   // 100/400*100
    expect(r.style.top).toBe('2.5%');    // 20/800*100
    expect(r.style.height).toBe('6.25%'); // 50/800*100
  });

  it('aspect ratio lock', () => {
    const spec: ConstraintSpec = { horizontal: { pin: 'left' }, vertical: { pin: 'top' }, aspect: 2 }; // w/h = 2
    const r = resolveNodeConstraints({ x: 0, y: 0, w: 200, h: 100 }, 400, 800, spec);
    // width is locked → height adjusts: 200/2 = 100
    expect(r.style.height).toBe('100px');
  });

  it('min/max constraints', () => {
    const spec: ConstraintSpec = {
      horizontal: { pin: 'left', min: 50, max: 300 },
      vertical: { pin: 'top', min: 30 },
    };
    // x=10 is less than minWidth=50
    const r = resolveNodeConstraints({ x: 10, y: 10, w: 200, h: 100 }, 400, 800, spec);
    expect(r.style.left).toBe('10px');
    expect(r.style.minWidth).toBe('50px');
    expect(r.style.maxWidth).toBe('300px');
    expect(r.style.minHeight).toBe('30px');
  });

  it('safe area emits env()', () => {
    const spec: ConstraintSpec = {
      horizontal: { pin: 'left' },
      vertical: { pin: 'top' },
      safeArea: true,
    };
    const r = resolveNodeConstraints({ x: 0, y: 0, w: 100, h: 50 }, 400, 800, spec);
    expect(r.style.marginTop).toContain('safe-area-inset');
  });

  it('container query flag', () => {
    const spec: ConstraintSpec = {
      horizontal: { pin: 'left' },
      vertical: { pin: 'top' },
      container: 'query',
    };
    const r = resolveNodeConstraints({ x: 0, y: 0, w: 100, h: 50 }, 400, 800, spec);
    expect(r.usesContainerQuery).toBe(true);
  });

  it('applyAspectRatio adjusts height when width locked', () => {
    const r = applyAspectRatio({ x: 0, y: 0, w: 200, h: 100 }, 2, 'width');
    expect(r.h).toBe(100); // 200/2
  });

  it('applyAspectRatio adjusts width when height locked', () => {
    const r = applyAspectRatio({ x: 0, y: 0, w: 200, h: 100 }, 2, 'height');
    expect(r.w).toBe(200); // 100*2
  });
});

describe('resolveConstraintFrame — E6 resize', () => {
  it('right pin preserves the far-edge offset', () => {
    const f = resolveConstraintFrame({ x: 200, y: 0, w: 80, h: 50 }, { horizontal: { pin: 'right' } }, 300, 100, 400, 100);
    expect(f.x).toBe(300); // 400 - 20 - 80
    expect(f.w).toBe(80);
  });
  it('centerX recenters horizontally', () => {
    const f = resolveConstraintFrame({ x: 0, y: 0, w: 80, h: 50 }, { horizontal: { pin: 'centerX' } }, 300, 100, 400, 100);
    expect(f.x).toBe(160); // (400-80)/2
  });
  it('scale resizes proportionally on both axes', () => {
    const f = resolveConstraintFrame(
      { x: 100, y: 50, w: 50, h: 25 },
      { horizontal: { pin: 'scale' }, vertical: { pin: 'scale' } },
      300, 100, 600, 200,
    );
    expect(f.x).toBe(200);
    expect(f.w).toBe(100);
    expect(f.y).toBe(100);
    expect(f.h).toBe(50);
  });
  it('left/fixed leaves the axis unchanged', () => {
    const f = resolveConstraintFrame({ x: 10, y: 10, w: 50, h: 50 }, { horizontal: { pin: 'left' } }, 300, 100, 600, 200);
    expect(f.x).toBe(10);
    expect(f.w).toBe(50);
  });
  it('no resize returns the same frame reference', () => {
    const frame = { x: 1, y: 2, w: 3, h: 4 };
    expect(resolveConstraintFrame(frame, { horizontal: { pin: 'scale' } }, 300, 100, 300, 100)).toBe(frame);
  });
});
