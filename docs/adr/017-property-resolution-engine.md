# ADR-017: Property Resolution Engine

- Status: Accepted (2026-07-19)
- Date: 2026-07-19
- Phase gate: P4 (must be Accepted before any P4 code)

## Context
P3 established the Resolution Pipeline (ADR-016) for Variables → Data → Expressions → Tokens → Constraints. But properties themselves (width, color, radius, shadow, opacity, typography) currently pass through ad-hoc paths: some are resolved by the pipeline, others by hardcoded `switch(type)` in the Inspector, others by direct JSON mutation. This scattering makes AI patches (ADR-006), theme switches, and cross-target rendering (ADR-008) unpredictable.

A single, mandated path is needed: Inspector → Property Engine → Patch → History → Pipeline → Resolve → Renderer. Every surface (AI, Plugin, Keyboard, API) goes through the same seam.

## Decision

### Architecture
```
Raw Property (from Document JSON or UI)
  → Variable Binding resolve (ADR-003)
  → Expression resolve (ADR-004)
  → Token resolve (3-layer raw→semantic→component, ADR-018)
  → Computed Style (unit conversion, spacing math)
  → Resolved Property (immutable, consumed by Renderer + Inspector preview)
```

Every step is pure, deterministic, and follows the existing Resolution Pipeline ordering (ADR-016).

### Property Registry
Every property type registers into a single registry:
```ts
interface PropertyDef {
  key: string;
  type: 'width' | 'color' | 'radius' | 'shadow' | 'opacity' | 'typography' | 'spacing' | 'motion' | 'elevation' | 'gradient' | 'glass' | 'custom';
  label: string;
  default?: unknown;
  validate?(value: unknown): boolean;
  serialize?(value: unknown): unknown;
  toStyle?(value: unknown, ctx: ResolveContext): Record<string, string>; // renderer adapter
  uiWidget?: 'text' | 'color' | 'number' | 'select' | 'slider' | 'spacing-editor' | 'shadow-editor'; // Inspector widget
}
```

- No `switch(type)` in the Inspector — it iterates `PropertyDef[]` from the registry.
- The `toStyle` adapter emits CSS vars (default), Flutter styles, React Native styles, or PDF styles depending on the publish target (ADR-008).
- Custom properties from plugins register into the same registry (P6).

### Style inheritance (cascade)
```
Workspace Theme (default) → Project Theme → Page Theme → Frame Theme → Node overrides
```
Each level deep-merges into the last (CSS-like). Variable bindings in a node's props override theme tokens at that node's scope. This is an extension of the existing scope cascade (ADR-003 VarScopeInput), now with dedicated style-layers.

### Integration with History
The Property Engine produces a `DocumentPatch` (ADR-010) for every property mutation. The Inspector never writes to JSON directly. This satisfies the user's requirement: "AI, Plugin, Inspector, Shortcut, and API all use the identical path."

## Consequences
- The Inspector becomes a thin renderer over `PropertyDef[]` + resolved values. Adding a new property type = register a `PropertyDef`.
- `toStyle` adapters decouple design tokens from any specific output format.
- Style inheritance follows the existing scope cascade, avoiding a second inheritance system.

## Alternatives
- **Per-component property switch:** rejected — duplicates logic, AI-hostile, not extensible by plugins.
- **Token → CSS directly:** rejected — makes Publish Targets (ADR-008) harder; the adapter layer is cheap now and saves major rework.
