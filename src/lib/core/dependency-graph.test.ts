import { describe, it, expect } from 'vitest';
import { DependencyGraph, DependencyError } from './dependency-graph';

describe('DependencyGraph (ADR-016 §DAG + R9)', () => {
  it('topologicalSort of linear chain', () => {
    const g = new DependencyGraph();
    g.addEdge('bride', 'heroTitle');
    g.addEdge('heroTitle', 'seoTitle');
    g.addEdge('seoTitle', 'ogTitle');
    const order = g.topologicalSort();
    expect(order.indexOf('bride')).toBeLessThan(order.indexOf('heroTitle'));
    expect(order.indexOf('heroTitle')).toBeLessThan(order.indexOf('seoTitle'));
    expect(order.indexOf('seoTitle')).toBeLessThan(order.indexOf('ogTitle'));
  });

  it('topologicalSort of diamond graph', () => {
    const g = new DependencyGraph();
    g.addEdge('a', 'b');
    g.addEdge('a', 'c');
    g.addEdge('b', 'd');
    g.addEdge('c', 'd');
    const order = g.topologicalSort();
    expect(order.indexOf('a')).toBeLessThan(order.indexOf('b'));
    expect(order.indexOf('a')).toBeLessThan(order.indexOf('c'));
    expect(order.indexOf('b')).toBeLessThan(order.indexOf('d'));
    expect(order.indexOf('c')).toBeLessThan(order.indexOf('d'));
  });

  it('throws DependencyError on cycle', () => {
    const g = new DependencyGraph();
    g.addEdge('a', 'b');
    g.addEdge('b', 'c');
    expect(() => g.addEdge('c', 'a')).toThrow(DependencyError);
    try {
      g.addEdge('c', 'a');
    } catch (e) {
      expect(e).toBeInstanceOf(DependencyError);
      expect(((e as DependencyError).cycle ?? [])).toContain('a');
    }
  });

  it('getAffected returns transitive dependents', () => {
    const g = new DependencyGraph();
    g.addEdge('bride', 'heroTitle');
    g.addEdge('heroTitle', 'seoTitle');
    g.addEdge('seoTitle', 'ogTitle');
    g.markDirty('bride');
    const affected = g.getAffected();
    expect(affected.has('bride')).toBe(true);
    expect(affected.has('heroTitle')).toBe(true);
    expect(affected.has('seoTitle')).toBe(true);
    expect(affected.has('ogTitle')).toBe(true);
  });

  it('getAffected does not include unrelated keys', () => {
    const g = new DependencyGraph();
    g.addEdge('bride', 'heroTitle');
    g.addNode('groom'); // unrelated
    g.markDirty('bride');
    const affected = g.getAffected();
    expect(affected.has('groom')).toBe(false);
  });

  it('clearDirty resets dirty set', () => {
    const g = new DependencyGraph();
    g.addEdge('a', 'b');
    g.markDirty('a');
    expect(g.getAffected().size).toBe(2);
    g.clearDirty();
    expect(g.getAffected().size).toBe(0);
  });

  it('dependsOn checks direct edges', () => {
    const g = new DependencyGraph();
    g.addEdge('a', 'b');
    expect(g.dependsOn('a', 'b')).toBe(true);
    expect(g.dependsOn('b', 'a')).toBe(false);
  });
});
