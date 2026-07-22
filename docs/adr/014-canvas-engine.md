# ADR-014: Canvas Engine Architecture

- Status: Accepted (2026-07-19)
- Date: 2026-07-19
- Phase gate: P2 (Accepted — P2 may begin)

## Context
P1 laid the Core contracts (document model, RFC6902 patch, schema versioning, layer rules R1–R7). P2 builds the interactive canvas on top of them. Six decisions must be locked **before** P2 code so the canvas doesn't create debt that P3 (Variables/Data/Schema) and later phases inherit. These sharpen bible §7 from a sketch into a binding spec.

## Decision

### 1. Layered transform model — Viewport ≠ Canvas
Strict separation; each is a distinct module, never conflated:
```
Viewport   — DOM element receiving pan/zoom input; applies the camera transform
  Camera     — { zoom, panX, panY }; pure transform matrix; screen ↔ world conversion
    Canvas     — world coordinate space; infinite; contains Frames
      Frame    — artboard with a viewport size (device); contains the Node tree
        Node   — element positioned in world coords (frame {x,y,w,h,rotation})
```
- Pan/zoom mutate the **Camera** (UI state, ADR-011 non-historical), never the Document.
- Nodes live in world coords; the Viewport renders them through the Camera transform.
- A Frame maps 1:1 to a publishable page-frame (ADR-008).

### 2. Every interaction is a Command
No direct Document mutation from input handlers. Each gesture resolves to a Core command over the existing RFC6902 patch (ADR-010):
```
drag   → MoveNodeCommand   { id, frame:{x,y} }
resize → ResizeNodeCommand { id, frame:{w,h} }
rotate → RotateNodeCommand { id, frame:{rotation} }
```
Coalesce on pointer-up (one history entry per gesture). Undo/Redo is therefore free and uniform with every other mutation source (AI, plugin, autosave).

### 3. Interaction state is UI state, never Document
Selection, hover, marquee, alignment guides, snap-preview live in the editor store's UI slice (non-historical). They **never** enter Document JSON. Keeps the document serializable, shareable, and AI-addressable (ADR-006) without ephemeral editor state.

### 4. Snap Engine is library-agnostic and isolated
react-moveable (or any transform library) only requests a move; it does not snap. Flow:
```
pointer → moveable → raw delta → Snap Engine → resolved position → Command
```
The Snap Engine is pure logic (`src/lib/editor/snapping.ts`) consuming node geometry + grid + guide lines. Keyboard-nudge and marquee-distribution use the same engine. Swapping or removing react-moveable leaves snapping intact.

### 5. Components render; Moveable is an overlay
Node renderers know nothing of react-moveable. Layout:
```
Node renderer          (clean presentation; resolved props only)
  ↑ selected by
Selection Overlay      (single canvas-wide layer; draws boxes/handles for the selection set)
  ↑ driven by
react-moveable         (attached to overlay proxy targets, NOT to node DOM)
```
- One overlay layer for the whole canvas, not a moveable-per-node → scales toward 1000 nodes.
- Component code never imports the transform library (reinforces ADR-011 R5/R6).

### 6. Performance budget (gating)
Hard targets on a representative 1000-node project. If any fails, **stop adding features until met** (ADR-012):
- pan  < 16 ms/frame
- zoom < 16 ms/frame
- drag of 100 nodes stays responsive (< 16 ms/frame)
- select 1000 nodes (marquee) does not freeze (budget-bounded)
- virtualization ON: only nodes intersecting the viewport + buffer are mounted

## P2 Exit Criteria (all must hold before P2 is Accepted)
1. Create, select, move, resize, and rotate a node.
2. Undo/Redo works for every canvas operation (via commands, ADR-010).
3. gridstack remains as a fallback; the new editor can build a simple layout end-to-end.
4. No regression on the publish renderer (`TreeRenderer`) — snapshot parity vs P1.
5. Editor perf targets met on a representative project.

## Consequences
- Camera/Canvas/Frame/Node split adds small modules, each trivial and unit-testable.
- Overlay model means moveable targets proxy elements, not node DOM → a bit more wiring, large perf win at scale + clean components.
- Snap isolation adds one call site (raw → resolved) but buys library independence.
- Perf budget may force virtualization + memoization choices before convenience features.

## Alternatives
- **react-moveable-per-node (wrap each node):** rejected — doesn't scale to 1000 nodes; couples component code to the transform library.
- **Snapping inside react-moveable:** rejected — library lock-in; can't reuse for keyboard-nudge or marquee distribution.
- **Selection stored in Document:** rejected — pollutes the serializable contract; breaks share/AI/collab merge.
