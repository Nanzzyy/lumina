# ADR-012: Performance Budget

- Status: Proposed
- Date: 2026-07-19
- Phase gate: P1 (budget Accepted); enforced P2 onward, gated P6

## Context
The spec demands 1000+ objects without lag and a published output as fast as today's zero-JS site. Without explicit budgets, "fast enough" drifts; regressions land silently. Budgets must be measurable and gating.

## Decision
**Editor budget:**
- Frame budget **16 ms** (≥60 FPS) during pan/zoom/select/drag on a 1000-node frame.
- First contentful paint of the editor route < 1.5 s on a mid laptop.
- Node mount: only viewport-intersecting nodes (virtualization); `NodeView` memoized on `frame` + bound-prop slice.
- History memory < 50 MB (patch-based, stack cap 100, ADR-010).
- Worker offload for snap candidates, asset hashing, expression eval over large repeats.

**Publish budget:**
- Lighthouse Performance **≥ 95** (mobile, simulated 4G) for the default static target.
- JS payload for the default static page < 40 KB gzipped (Runtime islands only); LCP < 2.5 s.
- Zero layout shift (CLS < 0.1) — frames/nodes carry intrinsic sizes; images emit `width`/`height` + `srcset`.

**Measurement & enforcement:**
- Perf unit test: synthetic 1000-node frame; assert p95 frame time via Performance marks (Playwright) — gating in CI from P6.
- Lighthouse CI on the static target per PR — gating from P5.
- Telemetry (§16.7) records slow-component, slow-render, budget-breaches in prod (sampled, opt-out).
- Budgets are constants in `core/perf-budget.ts`; tests assert against them.

## Consequences
- Virtualization + memoization are P2 requirements, not optimizations.
- Static-binding baking (ADR-008) is mandatory to hit the JS payload budget.
- Asset pipeline (ADR-009) is required to hit Lighthouse, not cosmetic.

## Alternatives
- **"Optimize later":** rejected — performance is architectural; deferred optimization rarely lands.
- **Canvas-based rendering for the editor (Konva):** revisitable if DOM virtualization misses budget at 1000 nodes; current bet is DOM + virtualization keeps widget fidelity (decision §canvas).
