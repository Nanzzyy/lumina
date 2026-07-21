/**
 * Editor-facing Component Registry — the sync read path for the design surface.
 *
 * First-party object types (text/rectangle/image/…) register a ComponentDef (manifest
 * schema + capabilities, ADR-005) here. Toolbar / NodeView / Inspector read from this
 * registry instead of branching on type — adding a new object type never touches editor
 * core (the VSCode-extension pattern).
 *
 * React-free: lives in the editor lib layer (R5/R7). Canvas renderers (which need React)
 * are registered separately in `components/studio/editor/canvas-renderers/registry.ts`.
 * The async sandboxed PluginHost (ADR-024) stays for third-party runtime; the same
 * ComponentDef manifests can feed it later. One manifest, two read paths.
 */

import type { ComponentDef } from '../core/plugin';
import type { Node } from '../core/document';
import { genId } from '../core/id';
import type { CapabilityKind, CapabilityTier, NodeCapabilities } from '../core/capabilities';

const registry = new Map<string, ComponentDef>();

export function registerComponent(def: ComponentDef): void {
  if (registry.has(def.id)) throw new Error(`[component-registry] duplicate: ${def.id}`);
  registry.set(def.id, def);
}

export function getComponent(id: string): ComponentDef | undefined {
  return registry.get(id);
}

export function listComponents(): ComponentDef[] {
  return Array.from(registry.values());
}

/** Convert a ComponentDef's declared capability tiers into a node's capability map. */
function capabilitiesFromDef(
  declared?: Partial<Record<CapabilityKind, CapabilityTier>>,
): NodeCapabilities | undefined {
  if (!declared) return undefined;
  const out: NodeCapabilities = {};
  for (const [kind, tier] of Object.entries(declared) as [CapabilityKind, CapabilityTier][]) {
    out[kind] = { kind, tier };
  }
  return out;
}

/** Pull default prop values from a component's PropSchema. */
function defaultsFromSchema(def: ComponentDef): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const field of def.schema?.fields ?? []) {
    if (field.default !== undefined) props[field.key] = field.default;
  }
  return props;
}

const DEFAULT_FRAME = { x: 40, y: 40, w: 200, h: 120 };

/**
 * Generic, registry-driven node factory — replaces per-type createTextNode/createRectNode.
 * Identity (componentId), props (from schema defaults), and capabilities all come from the
 * component's manifest. No switch, no hardcode.
 */
export function createNodeFromDef(def: ComponentDef, overrides: Partial<Node> = {}): Node {
  const props = defaultsFromSchema(def);
  return {
    id: genId('n'),
    componentId: def.id,
    name: def.name,
    frame: { ...DEFAULT_FRAME },
    props: Object.keys(props).length > 0 ? props : undefined,
    capabilities: capabilitiesFromDef(def.capabilities),
    ...overrides,
  };
}
