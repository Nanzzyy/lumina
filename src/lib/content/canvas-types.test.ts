import { describe, it, expect } from 'vitest';
import { createDefaultElement, defaultCanvasElements } from './canvas-types';
import type { CanvasElement } from './canvas-types';

const TYPES: CanvasElement['type'][] = ['text', 'image', 'shape', 'button', 'video', 'divider', 'icon'];

describe('createDefaultElement', () => {
  it('places the element at the requested coordinates with sane base defaults', () => {
    const el = createDefaultElement('text', 40, 120);
    expect(el).toMatchObject({
      type: 'text',
      x: 40,
      y: 120,
      rotation: 0,
      zIndex: 1,
      opacity: 1,
      visible: true,
      animation: { entrance: 'fadeIn', duration: 0.5, delay: 0 },
    });
  });

  it('generates a unique prefixed id per call', () => {
    const ids = new Set(Array.from({ length: 50 }, () => createDefaultElement('shape', 0, 0).id));
    expect(ids.size).toBe(50);
    for (const id of ids) expect(id).toMatch(/^el-[0-9a-z]{1,7}$/);
  });

  it('gives every element type a positive size and props object', () => {
    for (const type of TYPES) {
      const el = createDefaultElement(type, 0, 0);
      expect(el.type).toBe(type);
      expect(el.w).toBeGreaterThan(0);
      expect(el.h).toBeGreaterThan(0);
      expect(el.props).toBeTypeOf('object');
    }
  });

  it('uses type-specific sizes and props', () => {
    expect(createDefaultElement('text', 0, 0)).toMatchObject({ w: 240, h: 48, props: { text: 'Teks Baru', fontSize: 16 } });
    expect(createDefaultElement('image', 0, 0)).toMatchObject({ w: 200, h: 200, props: { fit: 'cover' } });
    expect(createDefaultElement('shape', 0, 0)).toMatchObject({ w: 80, h: 80, props: { shape: 'circle' } });
    expect(createDefaultElement('button', 0, 0)).toMatchObject({ w: 200, h: 48, props: { text: 'Klik Disini', borderRadius: 24 } });
    expect(createDefaultElement('video', 0, 0)).toMatchObject({ w: 200, h: 150, props: { src: '' } });
    expect(createDefaultElement('divider', 0, 0)).toMatchObject({ w: 200, h: 2, props: { opacity: 0.3 } });
    expect(createDefaultElement('icon', 0, 0)).toMatchObject({ w: 40, h: 40, props: { name: 'Heart', size: 24 } });
  });

  it('falls back to the base element for an unknown type', () => {
    const el = createDefaultElement('gizmo' as CanvasElement['type'], 5, 6);
    expect(el).toMatchObject({ type: 'gizmo', w: 120, h: 40, props: {} });
  });

  it('returns independent elements (no shared props object)', () => {
    const a = createDefaultElement('text', 0, 0);
    const b = createDefaultElement('text', 0, 0);
    a.props.text = 'changed';
    expect(b.props.text).toBe('Teks Baru');
  });
});

describe('defaultCanvasElements', () => {
  it('returns two text elements inside the virtual 375x667 canvas', () => {
    const els = defaultCanvasElements();
    expect(els).toHaveLength(2);
    for (const el of els) {
      expect(el.type).toBe('text');
      expect(el.x).toBeGreaterThanOrEqual(0);
      expect(el.x + el.w).toBeLessThanOrEqual(375);
      expect(el.y + el.h).toBeLessThanOrEqual(667);
    }
  });

  it('uses the sample copy and widens the subtitle', () => {
    const [title, subtitle] = defaultCanvasElements();
    expect(title.props).toMatchObject({ text: 'Selamat Datang', fontSize: 28 });
    expect(subtitle.props).toMatchObject({ text: 'Bersama kita rayakan', fontSize: 14 });
    expect(subtitle.w).toBe(280);
  });

  it('returns fresh elements with unique ids on each call', () => {
    const a = defaultCanvasElements();
    const b = defaultCanvasElements();
    expect(a[0].id).not.toBe(b[0].id);
    expect(a[0].id).not.toBe(a[1].id);
  });
});
