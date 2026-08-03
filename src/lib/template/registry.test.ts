import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { registerTemplate, getTemplate, getAllTemplates, clearRegistry } from './registry';
import { SectionRegistry } from './SectionRegistry';
import type { SectionComponent } from './SectionRegistry';
import type { TemplateDefinition } from './types';

const template = (id: string, over: Partial<TemplateDefinition> = {}): TemplateDefinition => ({
  id,
  name: id,
  description: '',
  ...over,
});

describe('template registry', () => {
  beforeEach(() => {
    clearRegistry();
  });

  afterEach(() => {
    clearRegistry();
    vi.restoreAllMocks();
  });

  it('registers and reads a template by id', () => {
    const t = template('aria', { category: 'wedding' });
    registerTemplate(t);
    expect(getTemplate('aria')).toBe(t);
  });

  it('returns undefined for an unknown id', () => {
    expect(getTemplate('nope')).toBeUndefined();
  });

  it('warns and overwrites when the same id is registered twice', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    registerTemplate(template('aria', { name: 'first' }));
    registerTemplate(template('aria', { name: 'second' }));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Overwriting template "aria"'));
    expect(getAllTemplates()).toHaveLength(1);
    expect(getTemplate('aria')?.name).toBe('second');
  });

  it('lists templates in registration order and clears them', () => {
    registerTemplate(template('aria'));
    registerTemplate(template('noir'));
    expect(getAllTemplates().map((t) => t.id)).toEqual(['aria', 'noir']);
    clearRegistry();
    expect(getAllTemplates()).toEqual([]);
  });
});

describe('SectionRegistry', () => {
  const stub = (label: string): SectionComponent => {
    const c: SectionComponent = () => null;
    c.displayName = label;
    return c;
  };

  it('registers and returns a section component', () => {
    const hero = stub('Hero');
    SectionRegistry.register('hero', hero);
    expect(SectionRegistry.get('hero')).toBe(hero);
    expect(SectionRegistry.has('hero')).toBe(true);
  });

  it('re-registering replaces the previous component', () => {
    SectionRegistry.register('quote', stub('Quote1'));
    const second = stub('Quote2');
    SectionRegistry.register('quote', second);
    expect(SectionRegistry.get('quote')).toBe(second);
  });

  it('throws a hint-bearing error for an unregistered type', () => {
    expect(SectionRegistry.has('gift')).toBe(false);
    expect(() => SectionRegistry.get('gift')).toThrow(/Unknown section type: "gift"/);
    expect(() => SectionRegistry.get('gift')).toThrow(/initializeRegistries/);
  });
});
