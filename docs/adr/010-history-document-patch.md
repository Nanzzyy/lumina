# ADR-010: History & Document Patch

- Status: Accepted (minor notes integrated 2026-07-19)
- Date: 2026-07-19
- Phase gate: P1 (patch format Accepted before P1); engine built P5

## Context
Rev 1 had no undo/redo; editor state was `useState` mutated freely. The platform requires reliable, memory-bounded history, multi-surface mutation (commands, AI, plugins, runtime, autosave), and version snapshots. Rule R4 forbids direct mutation — every change must be a patch.

## Decision
**Patch is the single mutation unit and the canonical format everywhere.** Format = **RFC 6902 JSON Patch** (`add`/`remove`/`replace`/`move`/`copy`) over JSON-pointer paths, extended with a small set of typed Lumina ops (`bind`, `setVar`, `setCapability`) that desugar to standard ops where possible. One format — no parallel representations — so **AI, Collaboration, Undo, History, and Marketplace import** all speak the same patch language.

Required properties (non-negotiable, tested):
- **Deterministic** — same patch + same doc → same result, independent of order within a single patch where the spec allows.
- **Serializable** — plain JSON; no functions, no refs.
- **Replayable** — applying a stored patch to its base doc reproduces the target state (powers version restore, collab merge-replay, marketplace import).
- **Mergeable** — commutative/associative rules defined for concurrent patches (foundation for P7 CRDT/OT; patches are already OT-friendly).

Patches are content-versioned (`patchSpec: 'rfc6902+lumina-v1'`); a future spec change ships a migrator (ADR-002) rather than mutating live patches.

```ts
type Op = { op:'add'|'remove'|'replace'|'move'|'copy'; path: string; value?: unknown; from?: string };
type DocumentPatch = Op[];
```

- **Command** wraps a patch with its **inverse** (computed by Core from the op type + prior value) + coalescing hint:
```ts
interface Cmd { id; forward: DocumentPatch; inverse: DocumentPatch;
                coalesceKey?: string;   // e.g. `move:${nodeId}` → merge consecutive drags
                meta?: { source: 'user'|'ai'|'plugin'|'autosave' }; }
```
- **Document is immutable** (immer/structural sharing); mutations apply via `applyPatch(doc, patch)` → new doc. Direct mutation is blocked by frozen dev-mode objects + lint (ADR-011 R4).
- **Stacks:** `past[]` / `future[]`, cap 100 in memory; older entries spilled to the `history` table. Coalescing merges same-key commands within a tick (one drag = one entry).
- **Versions:** named/manual saves + rolling autosaves stored as patch-or-snapshot rows in `history`, each tagged with its `schemaVersion` (ADR-002). Restore = re-run migrator chain + apply.
- **Autosave** PUTs a patch (or snapshot if too large) to `/autosave` debounced; recovery offered when autosave > last manual save.

## Consequences
- AI/plugins/runtime all mutate through `Runtime.mutate(patch)` (ADR-007) → uniformly undoable (ADR-006).
- Patch size, not document size, drives history cost → scales to 1000+ nodes.
- Snapshots immutable; deleting a node doesn't break old version restore.

## Alternatives
- **Full-state snapshots in history:** rejected — O(document) memory, blows up at 1000 nodes.
- **Custom command objects without patches:** rejected — R4 (no direct mutation) requires a serializable patch; also enables AI/remote patch application.
- **OT/CRDS for patches now:** deferred to P7 collaboration; patches are merge-friendly enough to adopt CRDT later.
