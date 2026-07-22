import { describe, it, expect } from 'vitest';
import { performance } from 'node:perf_hooks';
import { buildGoldenProject, GOLDEN_SPEC, countAll, countNodes } from './golden-project';
import { moveNodeCommand } from '../src/lib/editor/commands';
import { applyPatch } from '../src/lib/core/history';

// Use a smaller spec for the structural/round-trip tests to avoid OOM in vitest forks.
// The FULL spec (1000 nodes) is used only for the build+serialize budget test.
const SMALL_SPEC = { ...GOLDEN_SPEC, frames: 2, nodesPerFrame: 20, imageNodes: 10, bindings: 5, events: 5, pluginComponents: 5 };

describe('golden benchmark fixture (ADR-014 §6 / ADR-012)', () => {
  it('hits the target structural counts (small spec)', () => {
    const doc = buildGoldenProject(SMALL_SPEC);
    const counts = countAll(doc);
    expect(counts.frames).toBe(2);
    expect(counts.nodes).toBe(40);
    expect(counts.bindings).toBe(5);
  });

  it('builds + serializes full spec within budget', () => {
    const t0 = performance.now();
    const doc = buildGoldenProject(GOLDEN_SPEC);
    const json = JSON.stringify(doc);
    const ms = performance.now() - t0;
    expect(countNodes(doc)).toBe(GOLDEN_SPEC.frames * GOLDEN_SPEC.nodesPerFrame);
    expect(ms).toBeLessThan(500);
    // Verify JSON is non-trivial (~hundreds of KB)
    expect(json.length).toBeGreaterThan(10000);
  });

  it('a canvas command patches + round-trips on the full fixture', () => {
    const doc = buildGoldenProject(GOLDEN_SPEC);
    const firstNode = doc.project.pages[0].frames[0].nodes[0];
    const cmd = moveNodeCommand(doc, firstNode.id, 999, 999);
    const next = applyPatch(doc, cmd.forward);
    expect(next.project.pages[0].frames[0].nodes[0].frame.x).toBe(999);
    const restored = applyPatch(next, cmd.inverse);
    expect(restored.project.pages[0].frames[0].nodes[0].frame.x).toBe(firstNode.frame.x);
  });
});
