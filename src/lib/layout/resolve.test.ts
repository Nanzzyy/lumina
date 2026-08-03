import { describe, it, expect } from 'vitest';
import { mergeNode, resolveNode } from './resolve';
import type { LayoutNode, NodeOverrides } from './tree';

const P = { x: 0, y: 0, w: 12, h: 3 };

const node = (id: string, over: Partial<LayoutNode> = {}): LayoutNode => ({
  id,
  kind: 'section',
  placement: { ...P },
  ...over,
});

describe('mergeNode', () => {
  it('returns the definition untouched when there are no overrides', () => {
    const def = node('a');
    expect(mergeNode(def)).toBe(def);
  });

  it('overrides variant, hidden and merges props', () => {
    const def = node('a', { variant: 'light', hidden: false, props: { title: 'def', sub: 'keep' } });
    const merged = mergeNode(def, { variant: 'dark', hidden: true, props: { title: 'ov' } });
    expect(merged).toMatchObject({
      variant: 'dark',
      hidden: true,
      props: { title: 'ov', sub: 'keep' },
    });
  });

  it('keeps definition values for fields the overrides omit', () => {
    const def = node('a', { variant: 'light', hidden: true, props: { a: 1 } });
    const merged = mergeNode(def, {});
    expect(merged).toMatchObject({ variant: 'light', hidden: true, props: { a: 1 } });
  });

  it('applies a partial placement override', () => {
    const def = node('a', { placement: { x: 1, y: 2, w: 6, h: 4 } });
    expect(mergeNode(def, { placement: { w: 12 } }).placement).toEqual({ x: 1, y: 2, w: 12, h: 4 });
  });

  it('merges child overrides by child id and leaves other children alone', () => {
    const def = node('root', {
      kind: 'composite',
      children: [node('left', { variant: 'a' }), node('right', { variant: 'b' })],
    });
    const ov: NodeOverrides = { children: { left: { variant: 'z' } } };
    const merged = mergeNode(def, ov);
    expect(merged.children?.[0].variant).toBe('z');
    expect(merged.children?.[1]).toBe(def.children?.[1]);
  });

  it('does not mutate the definition', () => {
    const def = node('a', { variant: 'light', props: { title: 'def' } });
    mergeNode(def, { variant: 'dark', props: { title: 'ov' } });
    expect(def).toMatchObject({ variant: 'light', props: { title: 'def' } });
  });
});

describe('resolveNode', () => {
  it('passes plain nodes through unchanged', () => {
    const n = node('a');
    expect(resolveNode(n, new Map())).toBe(n);
  });

  it('expands a widget instance from its definition, keeping instance id and placement', () => {
    const def = node('widget-def', {
      kind: 'composite',
      variant: 'light',
      props: { title: 'from-def' },
      wrapper: { container: 'contained' },
      children: [node('slot', { type: 'hero' })],
    });
    const instance = node('inst', {
      widgetId: 'w1',
      placement: { x: 2, y: 4, w: 6, h: 2 },
    });

    const out = resolveNode(instance, new Map([['w1', def]]));
    expect(out.id).toBe('inst');
    expect(out.placement).toEqual({ x: 2, y: 4, w: 6, h: 2 });
    expect(out.variant).toBe('light');
    expect(out.props).toEqual({ title: 'from-def' });
    expect(out.wrapper).toEqual({ container: 'contained' });
    expect(out.widgetId).toBe('w1');
  });

  it('namespaces descendant ids with the instance id', () => {
    const def = node('widget-def', {
      kind: 'composite',
      children: [node('slot', { children: [node('deep')] })],
    });
    const out = resolveNode(node('inst', { widgetId: 'w1' }), new Map([['w1', def]]));
    expect(out.children?.[0].id).toBe('inst__slot');
    expect(out.children?.[0].children?.[0].id).toBe('inst__deep');
  });

  it('does not double-prefix ids that already carry the instance prefix', () => {
    const def = node('widget-def', { kind: 'composite', children: [node('inst__slot')] });
    const out = resolveNode(node('inst', { widgetId: 'w1' }), new Map([['w1', def]]));
    expect(out.children?.[0].id).toBe('inst__slot');
  });

  it('applies instance overrides on top of the definition', () => {
    const def = node('widget-def', { variant: 'light', props: { title: 'def', sub: 'keep' } });
    const out = resolveNode(
      node('inst', { widgetId: 'w1', overrides: { variant: 'dark', props: { title: 'ov' } } }),
      new Map([['w1', def]]),
    );
    expect(out.variant).toBe('dark');
    expect(out.props).toEqual({ title: 'ov', sub: 'keep' });
  });

  it('renders a placeholder when the widget definition is missing', () => {
    const out = resolveNode(node('inst', { widgetId: 'gone', type: 'hero', props: { a: 1 } }), new Map());
    expect(out).toMatchObject({
      kind: 'section',
      type: undefined,
      props: { a: 1, __missingWidget: 'gone' },
    });
  });

  it('prefers the instance snapshot children over the definition children', () => {
    const def = node('widget-def', {
      kind: 'composite',
      variant: 'light',
      wrapper: { container: 'card' },
      props: { title: 'def', sub: 'keep' },
      children: [node('def-child')],
    });
    const instance = node('inst', {
      widgetId: 'w1',
      props: { title: 'edited' },
      children: [node('snapshot-child')],
    });

    const out = resolveNode(instance, new Map([['w1', def]]));
    expect(out.children?.map((c) => c.id)).toEqual(['snapshot-child']);
    expect(out.variant).toBe('light');
    expect(out.wrapper).toEqual({ container: 'card' });
    expect(out.props).toEqual({ title: 'edited', sub: 'keep' });
  });

  it('keeps an instance wrapper over the definition wrapper', () => {
    const def = node('widget-def', { wrapper: { container: 'card' } });
    const out = resolveNode(
      node('inst', { widgetId: 'w1', wrapper: { container: 'full-width' } }),
      new Map([['w1', def]]),
    );
    expect(out.wrapper).toEqual({ container: 'full-width' });
  });
});
