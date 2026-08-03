import { describe, it, expect, beforeAll } from 'vitest';
import { registerAllProperties, getProperty, listProperties, listCategories, clearRegistry, registerProperty } from './property-registry';

// Register once (stable per file). No before each — avoids GC thrash.
clearRegistry();
registerAllProperties();

describe('PropertyDef registry (ADR-017)', () => {
  it('registers all standard properties', () => {
    const all = listProperties();
    expect(all.length).toBeGreaterThan(30);
    expect(getProperty('width')).toBeDefined();
    expect(getProperty('x')).toBeDefined();
    expect(getProperty('fontSize')).toBeDefined();
    expect(getProperty('color')).toBeDefined();
    expect(getProperty('borderRadius')).toBeDefined();
    expect(getProperty('boxShadow')).toBeDefined();
    expect(getProperty('backgroundColor')).toBeDefined();
    expect(getProperty('opacity')).toBeDefined();
    expect(getProperty('rotation')).toBeDefined();
    expect(getProperty('gap')).toBeDefined();
    expect(getProperty('padding')).toBeDefined();
  });

  it('every registered property has key + type + label', () => {
    const all = listProperties();
    for (const p of all) {
      expect(p.key).toBeTruthy();
      expect(p.type).toBeTruthy();
      expect(p.label).toBeTruthy();
      // defaultValue can be undefined for optional fields (e.g. backgroundImage)
      expect('defaultValue' in p).toBe(true);
    }
  });

  it('lists categories', () => {
    const cats = listCategories();
    expect(cats).toContain('position');
    expect(cats).toContain('size');
    expect(cats).toContain('typography');
  });

  it('supports duplicate detection', () => {
    expect(() => registerProperty({ key: 'width', category: 'size', type: 'number', label: 'W', defaultValue: 0 })).toThrow(/duplicate/);
  });

  it('toStyle produces CSS strings', () => {
    expect(getProperty('x')!.toStyle?.(10)).toEqual({ left: '10px' });
    expect(getProperty('opacity')!.toStyle?.(0.5)).toEqual({ opacity: '0.5' });
    expect(getProperty('color')!.toStyle?.('#ff0000')).toEqual({ color: '#ff0000' });
  });

  it('padding toStyle handles array, string, and number', () => {
    const p = getProperty('padding')!;
    expect(p.toStyle?.('16px')).toEqual({ padding: '16px' });
    expect(p.toStyle?.([10, 20, 10, 20])).toEqual({ padding: '10px 20px 10px 20px' });
    expect(p.toStyle?.(16)).toEqual({ padding: '16px' });
  });
});

describe('toStyle adapters (ADR-017 — every registered prop round-trips)', () => {
  it('every property exposes a toStyle returning a string-valued record', () => {
    for (const p of listProperties()) {
      expect(p.toStyle, `missing toStyle for ${p.key}`).toBeTypeOf('function');
      const style = p.toStyle!(p.defaultValue);
      for (const [k, v] of Object.entries(style)) {
        expect(v, `${p.key}.${k}`).toBeTypeOf('string');
      }
    }
  });

  it('px adapters append the unit and pass non-numeric values through', () => {
    expect(getProperty('gap')!.toStyle!(8)).toEqual({ gap: '8px' });
    expect(getProperty('fontSize')!.toStyle!('inherit')).toEqual({ fontSize: 'inherit' });
    expect(getProperty('letterSpacing')!.toStyle!(undefined)).toEqual({ letterSpacing: '' });
  });

  it('unit-slider sizes keep the "auto" keyword', () => {
    expect(getProperty('width')!.toStyle!('auto')).toEqual({ width: 'auto' });
    expect(getProperty('width')!.toStyle!(320)).toEqual({ width: '320px' });
    expect(getProperty('height')!.toStyle!('auto')).toEqual({ height: 'auto' });
    expect(getProperty('height')!.toStyle!(200)).toEqual({ height: '200px' });
  });

  it('layout mode maps to the matching display/position declaration', () => {
    const layout = getProperty('layout')!;
    expect(layout.toStyle!('flex')).toEqual({ display: 'flex' });
    expect(layout.toStyle!('grid')).toEqual({ display: 'grid' });
    expect(layout.toStyle!('absolute')).toEqual({ position: 'absolute' });
  });

  it('rotation emits a transform in degrees', () => {
    expect(getProperty('rotation')!.toStyle!(45)).toEqual({ transform: 'rotate(45deg)' });
  });

  it('borderRadius toStyle handles array, string, number and nullish', () => {
    const p = getProperty('borderRadius')!;
    expect(p.toStyle!('50%')).toEqual({ borderRadius: '50%' });
    expect(p.toStyle!([1, 2, 3, 4])).toEqual({ borderRadius: '1px 2px 3px 4px' });
    expect(p.toStyle!(8)).toEqual({ borderRadius: '8px' });
    expect(p.toStyle!(null)).toEqual({ borderRadius: '0px' });
  });

  it('optional visual props emit nothing when unset', () => {
    for (const key of ['backgroundImage', 'backgroundGradient', 'backdropFilter', 'mixBlendMode']) {
      expect(getProperty(key)!.toStyle!(undefined), key).toEqual({});
    }
  });

  it('optional visual props emit their declaration when set', () => {
    expect(getProperty('backgroundImage')!.toStyle!('/a.png')).toEqual({ backgroundImage: 'url(/a.png)' });
    expect(getProperty('backgroundGradient')!.toStyle!('linear-gradient(red, blue)')).toEqual({ background: 'linear-gradient(red, blue)' });
    expect(getProperty('backdropFilter')!.toStyle!('blur(4px)')).toEqual({ backdropFilter: 'blur(4px)' });
    expect(getProperty('mixBlendMode')!.toStyle!('multiply')).toEqual({ mixBlendMode: 'multiply' });
  });

  it('select props carry non-empty option lists', () => {
    for (const p of listProperties().filter((p) => p.type === 'select')) {
      expect(p.options?.length, p.key).toBeGreaterThan(1);
      for (const o of p.options!) {
        expect(o.label).toBeTruthy();
        expect(o.value).toBeTruthy();
      }
    }
  });

  it('listProperties filters by category', () => {
    const radius = listProperties('radius');
    expect(radius.length).toBeGreaterThan(0);
    expect(radius.every((p) => p.category === 'radius')).toBe(true);
    expect(radius.map((p) => p.key)).toContain('borderRadius');
  });
});
