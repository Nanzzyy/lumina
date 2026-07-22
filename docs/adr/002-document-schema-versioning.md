# ADR-002: Document Schema Versioning

- Status: Accepted (2026-07-19)
- Date: 2026-07-19
- Phase gate: P1 (must be Accepted before P1 starts)

## Context
The persisted Document JSON (project → pages → frames → nodes, plus variables, data sources, theme refs) will evolve over years. Without versioning, a format change silently corrupts every existing project, or forces a risky big-bang migration. We need old projects to keep loading and rendering years later.

## Decision
Every persisted document object carries an integer `schemaVersion`. Core owns a **migrator registry** mapping `vN → vN+1`.

- **On load:** read `schemaVersion`; run the chain of migrators up to `CURRENT`. Migrators are pure, idempotent, single-direction functions `doc_vN → doc_v(N+1)`.
- **On save:** write back at `CURRENT`. A document is upgraded lazily, only when touched — untouched old projects are never rewritten (so a broken migrator can't mass-corrupt).
- **Migrators may not fail silently:** on unrecoverable input, throw a typed `MigrationError` with the offending path; the editor surfaces "project needs repair" rather than rendering garbage.
- **Version history rows keep their original `schemaVersion`** (ADR-010); restoring an old version re-runs the migrator chain. Snapshots are immutable.
- No down-migrators (`vN+1 → vN`); forward-only. If a feature is reverted, ship a new forward migrator.

## Consequences
- New engine fields default sensibly in their migrator; old projects gain capabilities for free on next edit.
- Every Core change to a persisted shape **must** ship a migrator + a fixture test (golden v(N-1) → vN).
- `schemaVersion` lives on `projects`, `pages`, `frames`, and standalone library rows (`components`, `themes`, `variables`) — each versioned independently where they have independent lifecycles.

## Alternatives
- **No versioning / "always latest":** rejected — guarantees future corruption.
- **Per-field optional/defaulted (no migrator):** rejected — untestable, drift accumulates, no way to reason about a document's shape.
- **JSON Schema `$schema` URI + migration-on-read:** equivalent in spirit; we use an integer for simplicity and linear ordering.
