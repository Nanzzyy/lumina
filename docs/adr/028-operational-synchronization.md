# ADR-028: Operational Synchronization

- Status: Accepted (2026-07-19)
- Date: 2026-07-19
- Phase gate: P9 (must be Accepted before any P9 code)

## Context
ADR-027 defines real-time awareness and patch broadcast. But when two users edit the same node simultaneously, patches can conflict. Lumina's RFC6902 Patch format (ADR-010) and History Timeline (ADR-020) provide the foundation for conflict resolution: every mutation is a serializable, replayable operation. ADR-028 defines how concurrent operations are ordered, validated, merged, or rejected.

## Decision

### Conflict resolution strategy: Last-Writer-Wins (LWW) per patch
For P9, conflict resolution uses **per-operation LWW** — the simplest strategy that works with the existing patch infrastructure. Each patch carries a monotonic timestamp (logical clock, not wall clock). When two patches conflict (same path, overlapping scope), the later timestamp wins. The earlier patch is recorded in the Timeline but marked `superseded`.

```ts
interface TimestampedPatch {
  patch: DocumentPatch;
  logicalClock: number;     // monotonic per session
  source: string;           // userId + sessionId
}
```

### Logical clock
Each session maintains a logical clock (Lamport clock) incremented on every patch. Clocks are exchanged during handshake and piggybacked on patches. This provides a total order without depending on wall-clock synchronization.

### Conflict detection
Before applying a remote patch, the host checks whether any of its paths conflict with locally-applied patches since the last sync point. Conflicts are defined as:
- Same JSON-pointer path + same op type (e.g., two `replace` on `/project/pages/0/frames/0/nodes/3/frame/x`)
- Same array index insert/remove

Non-conflicting patches are applied immediately. Conflicting patches are ordered by logical clock; the later one wins.

### Merging
For non-conflicting concurrent patches, the host merges them: applies both in logical-clock order. This is safe because RFC6902 operations on disjoint paths are commutative.

### Timeline and branching
Conflicting/superseded patches remain in the Timeline (ADR-020) with a `supersededBy` field. Users can review a "conflict log" in the Timeline Panel. Branch-first editing (ADR-026 §branch) provides a natural resolution path: a user branches, edits, and merges — the merge applies conflicts in LWW order.

### Future: CRDT
If LWW proves too lossy (data overwritten without merge), a CRDT layer can wrap the patch format without changing the document model. The patch stays RFC6902; the CRDT ensures that concurrent edits to the same field converge rather than losing one. This is deferred until P9 proves LWW insufficient — the patch infrastructure is compatible with both approaches.

## Consequences
- LWW is simple, zero additional dependencies, and works with the existing `applyPatch`.
- The Timeline records all patches including superseded ones — full audit trail.
- Users can see "your change was overwritten by Alice" in the conflict log.
- Branch-first AI editing naturally avoids most conflicts (AI works on a branch, not main).

## Alternatives
- **Full OT (Operational Transform):** complex to implement correctly over RFC6902 paths; deferred until LWW proves insufficient.
- **Lock-step editing (one user at a time):** too restrictive for real-time collaboration.
- **CRDT from the start:** viable but adds complexity before LWW's limitations are observed.
