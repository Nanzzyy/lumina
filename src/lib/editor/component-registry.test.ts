import { describe, it, expect } from 'vitest';
import { registerComponent, getComponent, listComponents, createNodeFromDef } from './component-registry';
import { textComponent } from '../../data/library/plugins/text';
import type { ComponentDef } from '../core/plugin';

describe('ComponentRegistry — E1.5 plugin foundation', () => {
  it('createNodeFromDef builds a node driven entirely by the ComponentDef', () => {
    const node = createNodeFromDef(textComponent);
    expect(node.componentId).toBe('text');
    expect(node.name).toBe('Text');
    // props pulled from schema field defaults
    expect(node.props?.text).toBe('Teks baru');
    expect(node.props?.color).toBe('#111827');
    expect(node.props?.textAlign).toBe('center');
    // capabilities derived from the manifest
    expect(node.capabilities?.editable?.tier).toBe('required');
    expect(node.capabilities?.resizable?.tier).toBe('optional');
    expect(node.id).toMatch(/^n_/);
  });

  it('registerComponent / getComponent / listComponents round-trip', () => {
    const def: ComponentDef = {
      id: 'test-x', name: 'X', category: 'primitive',
      schema: { fields: [{ key: 'a', label: 'A', type: 'text', default: 'hi' }] },
    };
    registerComponent(def);
    expect(getComponent('test-x')?.name).toBe('X');
    expect(listComponents().some((d) => d.id === 'test-x')).toBe(true);
    expect(getComponent('does-not-exist')).toBeUndefined();
  });

  it('registerComponent throws on duplicate id', () => {
    const def: ComponentDef = { id: 'test-dup', name: 'D', category: 'primitive', schema: { fields: [] } };
    registerComponent(def);
    expect(() => registerComponent(def)).toThrow(/duplicate/);
  });

  it('createNodeFromDef yields no props when schema has no defaults', () => {
    const def: ComponentDef = { id: 'test-empty', name: 'E', category: 'primitive', schema: { fields: [] } };
    const node = createNodeFromDef(def);
    expect(node.props).toBeUndefined();
    expect(node.componentId).toBe('test-empty');
  });
});
