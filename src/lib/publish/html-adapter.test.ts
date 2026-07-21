import { describe, it, expect } from 'vitest';
import { renderHtml } from './html-adapter';
import { buildRenderTree } from './render-tree';
import type { ResolvedDocument } from '../core/resolve';

const makeDoc = (): ResolvedDocument => ({
  schemaVersion: 1, pipelineVersion: 1,
  nodes: [
    { id: 'n1', componentId: 'hero', props: { title: 'Hello World', image: '/img.png', color: '#000' } },
    { id: 'n2', componentId: 'countdown', props: { date: '2026-09-12' } },
    { id: 'n3', componentId: 'text', props: { text: 'Welcome' } },
  ],
  variables: {},
  dataSources: [],
});

describe('HTML adapter (ADR-021)', () => {
  it('produces a complete HTML document', () => {
    const tree = buildRenderTree(makeDoc());
    const output = renderHtml(tree);
    expect(output.html).toContain('<!DOCTYPE html>');
    expect(output.html).toContain('</html>');
  });

  it('includes rendered nodes in the body', () => {
    const tree = buildRenderTree(makeDoc());
    const output = renderHtml(tree);
    expect(output.html).toContain('Hello World');
    expect(output.html).toContain('Welcome');
  });

  it('marks pages that need runtime JS', () => {
    const tree = buildRenderTree(makeDoc());
    const output = renderHtml(tree);
    expect(output.needsRuntime).toBe(true);
    expect(output.html).toContain('runtime.js');
  });

  it('generates multiple pages from multi-page tree', () => {
    const tree = buildRenderTree(makeDoc());
    const output = renderHtml(tree);
    expect(output.pages.length).toBe(1);
    expect(output.pages[0].route).toBe('/');
  });

  it('inline CSS by default', () => {
    const tree = buildRenderTree(makeDoc());
    const output = renderHtml(tree);
    expect(output.cssLinks).toEqual([]);
  });

  it('minifies HTML when option set', () => {
    const tree = buildRenderTree(makeDoc());
    const output = renderHtml(tree, { minify: true });
    expect(output.html).not.toContain('\n');
  });

  it('escaping HTML special characters', () => {
    const doc: ResolvedDocument = {
      schemaVersion: 1, pipelineVersion: 1,
      nodes: [{ id: 'n1', componentId: 'text', props: { text: '<script>alert("xss")</script>' } }],
      variables: {}, dataSources: [],
    };
    const tree = buildRenderTree(doc);
    const output = renderHtml(tree);
    expect(output.html).not.toContain('<script>');
    expect(output.html).toContain('&lt;script&gt;');
  });
});
