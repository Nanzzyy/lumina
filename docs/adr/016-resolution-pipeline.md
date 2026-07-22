# ADR-016: Resolution Pipeline

- Status: Accepted (2026-07-19)
- Date: 2026-07-19
- Phase gate: P3 (must be Accepted before any P3 code)

## Context
P1–P2 defined multiple engine contracts (Variables ADR-003, Expression ADR-004, Tokens 3-layer, Data Sources, Constraint Solver §16.2). Currently the resolution order is implicit: which runs first when a document renders? Without a deterministic pipeline, AI patches (ADR-006), theme switches, variable edits, and data-source loads produce unpredictable results when multiple engines touch the same resolved value.

A single, versioned, deterministic **Resolution Pipeline** is needed: an ordered sequence of transforms from raw Document → Resolved Document, consumed by the Renderer and the Editor's property preview.

**Every step is immutable** — receives input, produces output, never mutates prior state.

```
Raw Document
      ↓
Scope Resolver    (workspace→project→page→frame cascade)
      ↓
Variable Resolver (resolve bindings, ADR-003)
      ↓
Data Resolver     (local rows, table queries, plugin fetches)
      ↓
Expression Resolver (format, if, repeat, date → inject, ADR-004)
      ↓
Token Resolver    (raw→semantic→component cascade)
      ↓
Constraint Solver (responsive breakpoints, aspect, pin, container)
      ↓
Resolved Document (immutable, consumed by Renderer + Editor)
```

## Decision
Every `resolve()` call follows this pipeline order:

```
Document (raw)
 1. Inject Scope Values     (workspace → project → page → frame cascade, ADR-003)
 2. Evaluate Variables       (resolve bindings, compute expressions ADR-004)
 3. Resolve Data Sources    (local rows, table queries, plugin fetches)
 4. Apply Expressions       (format, if, repeat, date → inject into props)
 5. Merge Theme Tokens      (raw → semantic → component cascade via CSS var map)
 6. Apply Constraints       (responsive breakpoints, aspect, pin, container)
 7. → Resolved Document      (immutable output; consumed by Renderer + Editor)
```

- **Each step is a pure function** over the prior step's output. Input is never mutated (R4/R5).
- **Steps 2–4 (Variables/Data/Expressions) are gated by a dependency graph** (a **DAG** — Directed Acyclic Graph) to avoid recomputing the entire document when one variable changes. Dependency edges are derived from static analysis of expressions (`exprDependencies` ADR-004) and variable references (`$var`, ADR-003). Example:
  ```
  BrideName → HeroTitle → SEOTitle → OpenGraphTitle
  ```
  Changing `BrideName` re-evaluates only dependents (O(dependents), not O(document)). `dependency-graph.ts` in Core manages the graph.
- **Cycle detection** is mandatory. Any expression that creates a dependency cycle (e.g. `A = B+1; B = A+1`) is caught before resolution begins via topological sort failure, emitting a diagnostic message to the editor. The resolver never falls into an infinite loop.
- **The pipeline is versioned** (`pipelineVersion`); a future engine adds itself as a step by inserting into the chain with a migrator (ADR-002).
- **AI/Plugin don't bypass the pipeline** — they propose `DocumentPatch` (ADR-006), then the pipeline re-resolves from step 1 for the affected scope only (via the dependency graph).
- **The Editor's preview pane** runs the same pipeline as the Renderer, guaranteeing parity (a core Lumina principle).

## Rules

### R8 — Resolver purity
Every resolver is a pure, deterministic function over its input. No resoler mutates the document or any prior stage's output. Signature:

```ts
type Resolver<I, O> = (input: I, context: ResolveContext) => O;
```

not:

```ts
type Resolver = (doc: Document) => void;   // mutates — forbidden (R4, ADR-011)
```

### R9 — Cycle detection
The dependency graph must be a **DAG**. Before resolution begins, the graph is topologically sorted; a cycle (e.g. `A → B → A`) is detected and rejected with a diagnostic message. The editor surfaces: *"Circular dependency: BrideName → HeroName → BrideName"*.

## Consequences
- Every engine knows its slot and isolation boundary. A variable change never accidentally re-runs a theme merge first.
- Dependency graph → incremental resolve: O(dependents), not O(document).
- A new engine slots into the pipeline without reordering existing steps.

## Alternatives
- **Ad-hoc resolve per engine call:** rejected — unpredictable, breaks AI parity, testable only by integration tests.
- **One big resolve function:** rejected — not extensible; adding an engine requires editing the monolith.

P1–P2 core modules are already written as pure functions (R5), so the pipeline is a thin orchestrator around them. Implementation in P3.
