# ADR-027: Collaboration Runtime

- Status: Accepted (2026-07-19)
- Date: 2026-07-19
- Phase gate: P9 (must be Accepted before any P9 code)

## Context
P1–P8 built Lumina as a single-user platform. P9 adds multi-user capabilities: presence, cursors, selection awareness, and session management. Collaboration is not a separate system — it is a **layer over the existing History Timeline, Event Bus, and RFC6902 Patch infrastructure**. Users collaborate on the same document model, using the same patch language every other component uses.

## Decision

### Architecture
```
User 1 (Editor/Plugin/AI)
  → Patch → Timeline → Broadcast → Remote Users
    ↕                                          ↕
  User N ← Broadcast ← Timeline ← Patch (User N)
```

### Session Manager
Manages WebSocket connections per workspace-project scope. Each session tracks:
- User identity (anonymous or authenticated)
- Active project/page/frame
- Connection state (connected, reconnecting, disconnected)
- Capabilities (read-only, edit, admin — mirrors ADR-005 permissions)

### Presence & Awareness
Lightweight, high-frequency messages (not patches):
```
{ type: 'cursor', userId, projectId, pageId, x, y, timestamp }
{ type: 'selection', userId, nodeIds[] }
{ type: 'viewport', userId, zoom, panX, panY }
```
These update the UI (non-historical, ADR-014 §3) and are never stored in the History Timeline. They use a separate WebSocket channel or a sub-protocol over the main connection.

### Selection isolation
Each user's selection is local UI state (ADR-014 §3). Broadcast selection is **only for awareness display** — it never enters the document. Remote cursors/selection are rendered as overlay indicators in the canvas (similar to SelectionOverlay but per-user).

### Patch broadcast
When a user executes a command (ADR-010), the resulting `DocumentPatch` is broadcast to all other clients in the same session. Remote clients apply it through their local History Timeline, triggering a re-resolve (ADR-016). No special "sync" logic — the same `applyPatch` + `History.executeCommand` path used by local edits.

### Connection lifecycle
1. Connect (WebSocket or WebRTC data channel)
2. Handshake (projectId, userId, capabilities)
3. Sync (latest document state from host)
4. Live (bidirectional patch stream)
5. Disconnect (cleanup presence, notify users)

## Consequences
- Collaboration reuses the entire existing stack: Document, History, Resolution Pipeline, Event Bus.
- The RFC6902 Patch format (ADR-010) is already merge-friendly; conflict resolution can be built on top (ADR-028).
- Presence traffic is separate from patch traffic — no document mutation, no history entries.

## Alternatives
- **Full OT/CRDT from the start:** deferred to ADR-028; collaboration without conflict resolution is still useful (awareness + turn-based editing).
- **Separate collab server with its own document model:** rejected — would create a second document model that drifts from the primary one.
