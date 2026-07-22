# ADR-020: History Timeline & Branching

- Status: Accepted (2026-07-19)
- Date: 2026-07-19
- Phase gate: P5 (must be Accepted before any P5 code)

## Context
P1 established the command-pattern history (ADR-010): `Command { forward, inverse, coalesceKey }` + past/future stacks. This works for undo/redo but is flat (linear, no branching). As AI (ADR-006), plugins (ADR-005), autosave (P7), and collaboration (P9) all produce patches, the history becomes a **shared timeline** where multiple sources append. Without branching and timeline visualization, the user cannot:
- Compare "before AI suggestion" vs "after."
- Revert to an autosave from 10 minutes ago.
- Fork a project (try a risky edit without losing the current state).
- See a visual timeline of changes (who, what, when).

## Decision

### Timeline model
History is a **timeline** — an ordered sequence of `TimelineEntry` entries. Each entry references the command that produced it plus metadata about the source and the document state after it.

```ts
interface TimelineEntry {
  id: string;
  parentId: string | null;          // previous entry (null = root)
  command: Command;                 // the patch + inverse (ADR-010)
  snapshot?: Document;              // optional full state (autosave / branch point)
  meta: {
    source: 'user' | 'ai' | 'plugin' | 'autosave' | 'collab';
    label?: string;
    timestamp: number;              // wall-clock; for collab ordering
    authorId?: string;
  };
  branch?: string;                  // branch name (null = main)
}
```

### Branching
- Every timeline starts with a root entry. A **branch** is a fork from an existing entry: the new entry's `parentId` points to the branch point, and `branch` is a user-given name (or auto-generated).
- The `branch` field forms a tree. The **active path** is the current branch + all ancestors up to root.
- Switching branches = rebuilding the document by replaying that branch's entries from the branch point. (The snapshot on the branch point avoids replaying the entire history.)
- Merging (P9 collab) = applying a patch set from one branch onto another.

### Visualization
The editor shows a **timeline panel** (rail or dropdown) listing entries in reverse chronological order, grouped by source (user, AI, autosave) and marked with branch names. Selecting an entry restores the document to that point (by replaying or loading its snapshot).

### Autosave integration
- Autosave writes a `TimelineEntry` with `source: 'autosave'` and a full `snapshot` (periodically, e.g. every 30 changes or 60s of inactivity).
- On session restore: find the latest autosave entry → load snapshot → replay any user entries after it (from the command journal). This survives browser close without data loss.
- Autosave entries are compacted (keep last 20 snapshots per branch, oldest removed).

### History stack (current undo/redo)
The past/future stacks remain in the EditorStore for low-latency undo/redo during a session (ADR-010). On each `executeCommand`, a `TimelineEntry` is also appended to the timeline persistence layer (DB `history` table). The stacks are a **performance cache** over the timeline — they are rebuilt from the timeline on page load.

## Consequences
- Every mutation is durably recorded in the `history` table (was: only manual versions).
- Branching enables "try this risky edit" without fear — revert to the pre-fork entry.
- Timeline forms the foundation for collaboration (P9): entries from multiple users merge into one ordered sequence.
- The command stack (ADR-010) is unchanged — timeline adds but does not replace it.
- Snapshot in autosave entries enables cheap restore without replaying 1000 patches.

## Alternatives
- **Linear history only (current):** rejected — no branching, no autosave restore, no collab foundation.
- **Full OT/CRDT now:** deferred to P9; the timeline + patch model (RFC6902, ADR-010) is merge-friendly enough to adopt CRDT wrapping later.
