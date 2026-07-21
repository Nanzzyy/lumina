import { describe, it, expect } from 'vitest';
import {
  resolveResponsiveFrame,
  resolveAllResponsiveFrames,
  responsivePatch,
  DEVICE_VIEWPORTS,
} from './responsive';
import type { PerBreakpoint, NodeFrame } from './document';

const base: NodeFrame = { x: 0, y: 0, w: 390, h: 100 };

const responsive: PerBreakpoint = {
  sm: { x: 10, w: 300 },
  md: { x: 50, w: 500, h: 150 },
  lg: { x: 100, w: 800 },
};

describe('responsive override resolver (ADR-019)', () => {
  it('base breakpoint returns base frame unchanged', () => {
    expect(resolveResponsiveFrame(base, responsive, 'base')).toEqual(base);
  });

  it('sm applies only sm overrides', () => {
    const r = resolveResponsiveFrame(base, responsive, 'sm');
    expect(r.x).toBe(10);
    expect(r.w).toBe(300);
    expect(r.y).toBe(0);  // unchanged
    expect(r.h).toBe(100); // unchanged
  });

  it('md layers sm+md overrides (sm override then md override)', () => {
    // cascade: base → sm (x=10,w=300) → md (x=50,w=500,h=150)
    const r = resolveResponsiveFrame(base, responsive, 'md');
    expect(r.x).toBe(50);  // md overrides sm
    expect(r.w).toBe(500); // md overrides sm
    expect(r.h).toBe(150); // md adds
    expect(r.y).toBe(0);   // base unchanged
  });

  it('lg layers sm+md+lg', () => {
    const r = resolveResponsiveFrame(base, responsive, 'lg');
    expect(r.x).toBe(100); // lg overrides md
    expect(r.w).toBe(800); // lg overrides md
    expect(r.h).toBe(150); // md value (lg doesn't touch h)
  });

  it('xl falls back to lg cascade (no xl override)', () => {
    const r = resolveResponsiveFrame(base, responsive, 'xl');
    expect(r.x).toBe(100);  // lg value (cascade ends at lg)
    expect(r.w).toBe(800);  // lg
    expect(r.h).toBe(150);  // md
  });

  it('responsivePatch produces RFC6902 ops for changed keys', () => {
    const patch = responsivePatch('n1', base, responsive, 'md', '/proj/p0/f0/n0/frame');
    expect(patch.length).toBe(3); // x, w, h changed
    const ops = patch.map((p) => p.op + ':' + p.path);
    expect(ops).toContain('replace:/proj/p0/f0/n0/frame/x');
    expect(ops).toContain('replace:/proj/p0/f0/n0/frame/w');
    expect(ops).toContain('replace:/proj/p0/f0/n0/frame/h');
  });

  it('responsivePatch empty when no overrides for breakpoint', () => {
    const patch = responsivePatch('n1', base, undefined, 'md', '/path');
    expect(patch).toEqual([]);
  });

  it('no responsive returns base for all breakpoints', () => {
    const frames = resolveAllResponsiveFrames(base, undefined);
    expect(frames.base.x).toBe(0);
    expect(frames.md.x).toBe(0);
  });

  it('DEVICE_VIEWPORTS has all expected devices', () => {
    expect(DEVICE_VIEWPORTS.base.w).toBe(390);
    expect(DEVICE_VIEWPORTS.md.w).toBe(768);
    expect(DEVICE_VIEWPORTS.lg.w).toBe(1024);
  });
});
