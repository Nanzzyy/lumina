# ADR-024: Plugin Runtime

- Status: Accepted (2026-07-19)
- Date: 2026-07-19
- Phase gate: P7 (must be Accepted before any P7 code)

## Context
ADR-005 (Plugin Manifest & Capability System) defined *what* a plugin declares: components, data sources, event actions, AI providers, tokens. But it did not define *how* a plugin runs — its runtime boundary, API surface, lifecycle, and sandbox. P7 now needs to turn the manifest into a live executable.

## Decision
A plugin is a self-contained module that runs in a **sandboxed context** (Web Worker for pure compute, iframe for DOM). It communicates with the host exclusively through a **Plugin Runtime API** — a subset of the Core Runtime API (ADR-007) limited to the capabilities the manifest declares.

### Runtime boundary
```
Plugin (sandboxed: worker / iframe)
  ↔ Runtime API (read-only or read-write, per manifest permissions)
  → Emits: patches (RFC6902), render tree transforms, errors, telemetry
  ← Receives: resolved document slices, events, asset references
```

### API surface
Plugins see only:
```ts
interface PluginRuntime {
  // Read
  doc: DocumentAPI;        // read-only view of workspace/project/page/frame
  renderTree: RenderTreeAPI; // read-only view of current Render Tree
  registry: RegistryAPI;   // list components, properties, tokens
  bus: EventBus;           // subscribe to platform events

  // Mutate (requires 'runtime.mutate' permission)
  applyPatch(patch: DocumentPatch): void;
  setVariable(key: string, value: unknown): void;
  dispatchEvent(trigger: Trigger): void;
}
```

A plugin **never** imports engine internals, never touches the DOM (unless iframe sandbox with explicit `dom` permission), and never accesses the database.

### Lifecycle
1. **Load:** manifest parsed, permissions checked, sandbox created, runtime API injected.
2. **Init:** `onInit(ctx)` — register components, data sources, event handlers.
3. **Run:** handle events, produce patches, respond to queries.
4. **Unload:** `onDestroy()` — clean up timers, unsubscribe, free resources.
5. **Error:** uncaught errors in the sandbox trigger `onError(err)` which logs to telemetry and optionally reverts any patches the plugin applied in the current turn.

### Builtin plugins
First-party components (Hero, Countdown, RSVP, Maps, Gift, Music, Gallery) ship as **builtin plugins** loading through the same runtime. This proves the seam before any third-party code loads, and it's the migration path out of the hardcoded `SectionRegistry`. The builtin plugin manifests live in `src/data/library/plugins/`.

### Marketplace (future)
Marketplace distribution (P8) is a transport layer over this same plugin format. A plugin downloaded from the marketplace is an archive containing `manifest.json` + `runtime.js` + assets, installed per-workspace.

## Consequences
- New components can be added without engine changes — register via plugin manifest.
- The sandbox prevents malicious/broken plugins from crashing the editor or accessing other workspace data.
- `SectionRegistry` (hardcoded component list) is replaced with a plugin-fed registry during P7 migration.
- Runtime API design forces plugins to speak the same patch language as AI, user, and collab — no special mutation paths.

## Alternatives
- **No sandbox (trust all plugins):** rejected — the moment marketplace exists, an unsandboxed plugin is a data-loss and XSS incident waiting to happen.
- **Full Node.js child_process sandbox:** too heavy for a browser editor; Worker/iframe gives the right boundary for P7, process-level isolation reserved for server-side plugins later.
