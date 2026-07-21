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
