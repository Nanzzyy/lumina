# ADR-005: Plugin Manifest & Capability System

- Status: Accepted (minor notes integrated 2026-07-19)
- Date: 2026-07-19
- Phase gate: P1 (manifest schema must be Accepted before P1); host built in P6

## Context
The platform must be extensible without core changes (marketplace, third-party components, AI providers). Hardcoding first-party components (today's `SectionRegistry`) makes extensibility an afterthought. Separately, nodes need a uniform way to declare what they can do so AI/Plugin/Renderer ask capability questions instead of `if(component==='gallery')`.

## Decision
**Plugins** are the single extension seam. A plugin is a declarative **manifest** that registers platform capabilities:

```ts
interface PluginManifest {
  id: string; name: string; version: semver; vendor: string;
  manifestVersion: number;                           // manifest schema version (migrator, ADR-002)
  apiVersion: string;                                // Runtime API contract version the plugin targets
  engineVersion: string;                             // min Lumina engine version (semver range)
  permissions: Permission[];                         // capability-based (ADR-013)
  components?: ComponentDef[];                       // id, render entry, PropSchema, capabilities, tokens, defaultEvents
  dataSources?: DataSourceDef[];
  eventActions?: ActionDef[];                        // custom actions for Event Engine (ADR-007)
  aiProviders?: AIProviderDef[];                     // (ADR-006)
  tokens?: TokenPack;                                // raw/semantic/component tokens (3-layer)
  runtime?: { entry: string; sandbox: 'worker' | 'iframe' };
}
```

**Capability System** — every Node exposes `capabilities` declared by its component manifest (source of truth). A node may **narrow** capabilities (e.g. lock resize) but never widen beyond its manifest.

```ts
type CapabilityKind = 'editable'|'draggable'|'resizable'|'rotatable'|'droppable'
                    |'animatable'|'repeatable'|'bindable'|'exportable'|'searchable'|'lockable';
type CapabilityTier = 'required' | 'optional' | 'experimental';
type CapabilitySpec = CapabilityKind | { kind: CapabilityKind; tier: CapabilityTier; config?: unknown };
interface NodeCapabilities { [k in CapabilityKind]?: CapabilitySpec }   // manifest-declared
```
**Tiers:** `required` (engine/AI must not disable — e.g. a countdown is `repeatable:required`), `optional` (user/owner may toggle), `experimental` (off by default, UI-gated). A node may **narrow** capabilities (disable an `optional` one) but never widen beyond its manifest; a `required` capability refuses disable.
- Canvas reads capabilities to decide handles (resizable→8 handles; rotatable→rotate).
- AI asks `can(node,'repeatable')` and reads `tier` to know whether it may turn it off (ADR-006).
- Export filters walk `exportable` nodes.

**Host:** loads manifests, validates against schema, registers into Core registries. First-party engines (Hero, Countdown, RSVP, Maps, Gift, Music, Gallery…) ship as **builtin plugins** — proving the seam before any third-party code loads. Plugin `runtime` executes in a sandbox (ADR-013): Web Worker for pure compute, iframe for DOM-touching code.

**Enabling:** per-workspace enabled-plugin list; marketplace distribution is a later transport (P8) over this same manifest.

## Consequences
- `SectionRegistry` is refactored to be plugin-fed; builtin sections become builtin plugin components during migration (P3/P6).
- A component without a manifest cannot render — manifests are mandatory, not optional metadata.
- Manifests are semver-versioned; breaking manifest schema = major Core version + migrator (ADR-002).

## Alternatives
- **Keep `SectionRegistry` hardcoded + separate "plugin" concept:** rejected — two code paths, marketplace can't reuse the registry, AI must branch on type.
- **Capabilities inferred from component type:** rejected — implicit, fragile, not extensible by plugins.
