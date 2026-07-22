# ADR-008: Publish Pipeline & Targets

- Status: Proposed
- Date: 2026-07-19
- Phase gate: P1 (adapter contract Accepted); static target P5, others phased

## Context
Rev 1 hardcoded one output (Next SSR + `TreeRenderer`). Products need different deployment shapes: a static host, an AMP-fast page, a PWA, or a ZIP the user self-hosts. Hardcoding one target forces refactor every time a new output matters.

## Decision
Publish is a **target adapter** pipeline over the resolved document:

```
Resolved Document (Core)
  → Bake static bindings / mark dynamic   (ADR-003)
  → Apply Constraint Solver → CSS         (§16.2)
  → Inject tokens as CSS vars             (3-layer)
  → Target Adapter                        ← static-html | ssr | spa | amp | pwa | zip
  → Emit artifacts (+ Runtime bundle for dynamic)
```

- **Adapter contract:** `{ id, build(resolvedDoc): Artifacts, needsRuntime: boolean, supports: Capability[] }`.
- **Bake vs hydrate:** each binding is classified static (baked to literal at build) or dynamic (hydrated). Adapter decides how much Runtime bundle to include: `static-html` bakes everything possible + ships Runtime only for dynamic islands; `spa` ships full Runtime; `amp` forbids JS → only statically-bakeable bindings allowed (validator rejects otherwise).
- **Default target:** `static-html` + hydrate islands (countdown, RSVP, music, events). Matches today's zero-JS `TreeRenderer` intent — kept as the static adapter's renderer.
- **`zip-export`** = static-html adapter output bundled with assets for self-hosting.
- Targets are pluggable via plugin manifest (ADR-005).

## Consequences
- `TreeRenderer` becomes the static adapter's render core (not deleted).
- Per-target validators gate publish (e.g. AMP can't use a dynamic binding).
- Adds a build step for non-SSR targets; cache resolved documents.

## Alternatives
- **Single SSR target forever:** rejected — limits deployment, blocks ZIP/AMP/PWA demand.
- **Separate renderers per target:** rejected — diverge quickly; one resolved-doc → many adapters is the cheap path.
