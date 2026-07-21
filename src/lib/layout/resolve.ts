import type { LayoutNode, NodeOverrides } from './tree';

/** Deep-merge an instance's overrides onto a library widget definition (one-way). */
export function mergeNode(def: LayoutNode, ov?: NodeOverrides): LayoutNode {
  if (!ov) return def;
  return {
    ...def,
    variant: ov.variant ?? def.variant,
    props: { ...def.props, ...ov.props },
    hidden: ov.hidden ?? def.hidden,
    placement: { ...def.placement, ...ov.placement },
    children: def.children?.map((c) => (ov.children?.[c.id] ? mergeNode(c, ov.children[c.id]) : c)),
  };
}

/** Prefix descendant ids so two instances of the same widget don't collide (React keys, bg lookups). */
function reId(node: LayoutNode, prefix: string): LayoutNode {
  return {
    ...node,
    id: node.id.startsWith(prefix) ? node.id : `${prefix}__${node.id}`,
    children: node.children?.map((c) => reId(c, prefix)),
  };
}

/**
 * Resolve a layout node. Library widget instances (widgetId set) are expanded from
 * their definition + per-instance overrides. Plain nodes pass through unchanged.
 * The instance keeps its own id + placement; descendant ids are namespaced.
 *
 * IMPORTANT: If the instance already carries snapshot children (from the builder),
 * those take priority over the definition's children to preserve per-instance edits.
 */
export function resolveNode(node: LayoutNode, widgets: Map<string, LayoutNode>): LayoutNode {
  if (!node.widgetId) return node;
  const def = widgets.get(node.widgetId);
  if (!def) {
    // Definition missing (deleted from library): render as a muted placeholder instead of throwing.
    return { ...node, kind: 'section', type: undefined, props: { ...node.props, __missingWidget: node.widgetId } };
  }
  // If the instance carries its own snapshot children (from builder), keep them.
  // Otherwise expand from the definition.
  if (node.children && node.children.length > 0) {
    return {
      ...node,
      id: node.id,
      placement: node.placement,
      wrapper: node.wrapper ?? def.wrapper,
      widgetId: node.widgetId,
      // Merge variant/props from definition if not overridden by instance
      variant: node.variant ?? def.variant,
      props: { ...def.props, ...node.props },
    };
  }
  const merged = mergeNode(def, node.overrides);
  const namespaced = { ...merged, children: merged.children?.map((c) => reId(c, node.id)) };
  return {
    ...namespaced,
    id: node.id,
    placement: node.placement,
    wrapper: node.wrapper ?? merged.wrapper,
    widgetId: node.widgetId,
  };
}
