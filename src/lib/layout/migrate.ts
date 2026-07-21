import type { LayoutDefinition } from './types';
import type { LayoutNode, Placement, TreeLayoutDefinition } from './tree';

/** Default row height per legacy container type (12-col grid). */
const H_BY_CONTAINER: Record<string, number> = {
  'hero-banner': 6,
  'full-width': 4,
  contained: 3,
  split: 4,
  card: 2,
  grid: 4,
  carousel: 4,
};

/** Clamp placement so a node never overflows the 12-column grid. Rounds fractional values. */
export function clampPlacement(p: Placement, columns = 12): Placement {
  const w = Math.max(1, Math.min(Math.round(p.w), columns));
  const x = Math.max(0, Math.min(Math.round(p.x), columns - w));
  return { x, y: Math.max(0, Math.round(p.y)), w, h: Math.max(1, Math.round(p.h)) };
}

/**
 * Migrate a legacy parallel-array layout (sections[] + containers[]) into a node tree.
 *
 * Preserves render equivalence: every section becomes a `kind:'section'` node rendering
 * the SAME section component (legacy renderer ignored containers, so we do too). The split
 * container is kept as a cosmetic `wrapper.container='split'` rather than forced into a
 * composite — inventing child slots here would render extra sections not in the original.
 * Composite-with-children is authored via the tree builder (Fase 3) and widget library (Fase 4).
 */
export function migrateToTree(def: LayoutDefinition): TreeLayoutDefinition {
  if (def.sections && def.containers && def.sections.length !== def.containers.length) {
    // containers[] is dead data in the legacy renderer; real rows may mismatch. Default to contained.
    console.warn(`[migrate] sections/containers length mismatch (${def.sections.length}/${def.containers?.length}) for layout "${def.id}"`);
  }

  let y = 0;
  const nodes: LayoutNode[] = def.sections.map((s, i) => {
    const c = def.containers?.[i] ?? { type: 'contained' as const };
    const h = H_BY_CONTAINER[c.type] ?? 3;
    const node: LayoutNode = {
      id: s.id,
      kind: 'section',
      type: s.type,
      variant: s.variant,
      props: s.props,
      hidden: s.hidden,
      placement: clampPlacement({ x: 0, y, w: 12, h }),
      wrapper: { container: c.type, columns: c.columns },
    };
    y += h;
    return node;
  });

  return { nodes, animation: def.animation, wrapper: def.wrapper };
}

/**
 * Resolve a layout to its tree form. Uses authored `nodes[]` when present (engine:'tree'),
 * otherwise lazily migrates from legacy sections/containers. Pure & idempotent.
 */
export function normalizeLayout(layout: LayoutDefinition): TreeLayoutDefinition {
  if (layout.nodes && layout.nodes.length > 0) {
    return {
      nodes: layout.nodes.map((n) => ({ ...n, placement: clampPlacement(n.placement) })),
      animation: layout.animation,
      wrapper: layout.wrapper,
    };
  }
  return migrateToTree(layout);
}
