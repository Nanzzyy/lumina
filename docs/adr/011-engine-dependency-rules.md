# ADR-011: Engine Dependency Rules (R1–R6)

- Status: Accepted (minor notes integrated 2026-07-19)
- Date: 2026-07-19
- Phase gate: P1 (must be Accepted before P1 starts; enforced from first commit)

## Context
With 13+ engines, unmanaged coupling guarantees the "big ball of mud" within a year. The review mandates hard dependency rules so plugins, AI, and engines never reach into each other's internals.

## Decision
Adopt and enforce six rules:

- **R1 — No engine imports another engine directly.** Cross-engine interaction goes through the published **Contract** (input/output/events/deps) and the **Runtime API** (ADR-007). Engines declare dependencies as interfaces, not concrete modules.
- **R2 — No Component knows the Database.** Components receive resolved props + Runtime API handle; persistence lives behind Core/repo boundaries.
- **R3 — No AI Provider knows Document internals.** Providers consume `AIRequest`/emit `AIResult`/`DocumentPatch` only (ADR-006).
- **R4 — All document changes produce a Patch.** No direct object mutation; immer + frozen dev objects (ADR-010).
- **R5 — All engines are pure.** No `react`/React-DOM import, no DOM access, no I/O inside engines. Side-effects isolated to Editor (UI) and Runtime (publish client).
- **R6 — Renderer and Editor never import each other.** Both depend on Core only (the document contract).
- **R7 — Every engine is testable without the Editor.** `npm test` runs Core to 100% coverage with no React, no DOM, no DB — pure functions over plain document objects. Engines must not import `react`, `react-dom`, or anything UI. This makes large refactors safe and keeps the boundary honest.

**Layered dependency DAG (acyclic):**
```
Editor  ──→  Core engines  ←──  Runtime/Renderer
 (UI)        (pure)              (side-effects)
              ↑
        Plugin/AI (via Contract + Runtime API only)
```

**Enforcement:**
- `eslint` `no-restricted-imports` per layer (e.g. `src/lib/core/**` bans `react`, DOM globals, `better-sqlite3`; `src/components/**` bans `src/lib/db`).
- Path aliases segregate layers (`@core`, `@editor`, `@canvas`, `@runtime`, `@ui`).
- PR review gate + a dependency-cruiser check in CI asserting the DAG stays acyclic and layer-pure.
- Each engine ships a `contract.ts` (types) consumed by dependents; internals are barrel-hidden.

## Consequences
- Engines become independently testable (pure) and replaceable.
- Adding engines later doesn't ripple — they implement contracts.
- Slight upfront ceremony (interfaces, lint config) pays back continuously.

## Alternatives
- **Convention-only (no enforcement):** rejected — drifts under deadline pressure; the whole point is to make violation impossible.
- **Monorepo packages per engine (Nx/Turborepo):** viable later; layer aliases give 90% of the boundary now without the tooling cost in P1.
