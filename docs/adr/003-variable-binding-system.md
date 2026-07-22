# ADR-003: Variable & Binding System

- Status: Proposed
- Date: 2026-07-19
- Phase gate: P3 (Variable Engine); contract finalized in P1

## Context
Today all content lives in a rigid `InvitationContent` monolith (`src/lib/content/types.ts`); components read typed fields directly. This can't scale to "thousands of unique sites" or let AI/data/plugins drive content. We need Figma-style variables: typed, scoped, bindable values that, when changed once, update every dependent node.

## Decision
A **Variable** is a typed, scoped value. A **Binding** is a prop value that references a variable or an expression (ADR-004) instead of a literal.

```ts
type VarType = 'string'|'number'|'boolean'|'color'|'date'|'image'|'enum'|'ref';
interface Variable { id; scope:'workspace'|'project'; key:string; type:VarType;
                     value:unknown; fallback?:unknown; meta?:{label;group}; }

type PropValue = Literal | VarBinding | ExprBinding;
interface VarBinding  { $var: string; }            // key, e.g. "couple.bride"
interface ExprBinding { $expr: string; }           // ADR-004
```

- **Scope resolution (ADR-001):** workspace ⊂ project; project key shadows workspace key. Deep-merge per type.
- **Resolution result:** `{ value, origin: 'workspace'|'project'|'inline', dynamic: boolean }`. `dynamic` flags values that can change at runtime (countdown `now`, live data-source rows) → hydrate; static → bake at publish (ADR-008).
- **Binding UX:** every prop field has a link toggle → bind to a variable or write an expression. Unbind returns to literal.
- **Cascade:** mutating a variable re-resolves only dependents (dependency graph, ADR-004), so "change `Bride` → all bound nodes update" is O(dependents), not O(document).
- **Data-source fields** are exposed as variables of `type:'ref'` (ADR-004 repeat/lookup).
- **Namespaces** prevent collisions. Keys carry a scope-origin prefix: `workspace.*`, `project.*`, `page.*`, `frame.*`, `runtime.*` (live values: `runtime.now`, viewport), `system.*` (read-only platform vars). An unqualified key (`couple.bride`) resolves via the scope cascade; a qualified key (`runtime.now`) bypasses it. Bindings may use either form.

## Consequences
- `InvitationContent` is decomposed into seeded variables during migration (P3); components rewritten to bind, not read a monolith. Back-compat shim reads legacy content through P5.
- Variables are first-class DB rows (`variables` table, scoped) and document subtree nodes → full history/undo (ADR-010).
- AI can generate/edit variables as plain JSON — no component-internal knowledge (ADR-006).

## Alternatives
- **Keep `InvitationContent` + add overrides:** rejected — doesn't decouple content from layout; no cross-node reuse; AI-hostile.
- **Variables as component props only (no binding):** rejected — change once → update everywhere is the core requirement; that needs binding + resolution.
