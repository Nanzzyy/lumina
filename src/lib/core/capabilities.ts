/**
 * Node Capability System — ADR-005.
 *
 * Capabilities are declared by a component's plugin manifest (source of truth).
 * A node may narrow (disable an optional capability) but never widen; a required
 * capability refuses disable. AI/Plugin/Renderer ask capabilities instead of
 * branching on component type.
 */

export type CapabilityKind =
  | 'editable'
  | 'draggable'
  | 'resizable'
  | 'rotatable'
  | 'droppable'
  | 'animatable'
  | 'repeatable'
  | 'bindable'
  | 'exportable'
  | 'searchable'
  | 'lockable';

export type CapabilityTier = 'required' | 'optional' | 'experimental';

export interface CapabilitySpec {
  kind: CapabilityKind;
  tier: CapabilityTier;
  config?: Record<string, unknown>;
}

/** A node's effective capability map (manifest-declared, optionally narrowed). */
export type NodeCapabilities = Partial<Record<CapabilityKind, CapabilitySpec>>;

export function can(node: { capabilities?: NodeCapabilities }, kind: CapabilityKind): boolean {
  return Boolean(node.capabilities?.[kind]);
}

/** Returns the tier of a capability, or undefined if absent. */
export function capabilityTier(node: { capabilities?: NodeCapabilities }, kind: CapabilityKind): CapabilityTier | undefined {
  return node.capabilities?.[kind]?.tier;
}

/**
 * Narrow a node's capability (disable). Refuses required capabilities.
 * Returns the new map (pure). Used by the inspector "lock/disable" controls.
 */
export function narrowCapability(
  declared: NodeCapabilities,
  kind: CapabilityKind,
  enabled: boolean,
): NodeCapabilities {
  const spec = declared[kind];
  if (!enabled && spec?.tier === 'required') return declared; // cannot disable required
  const next: NodeCapabilities = { ...declared };
  if (enabled) {
    if (spec) next[kind] = spec;
    else delete next[kind];
  } else {
    next[kind] = { kind, tier: spec?.tier ?? 'optional', config: { disabled: true } };
  }
  return next;
}
