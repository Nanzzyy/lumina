import type { SectionType, AnimationConfig } from '@/lib/template/types';
import type { ContainerType } from './types';

/** 12-column grid coordinates. `y` is row (0-based); renderer compacts sparse rows. */
export interface Placement {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Per-instance overrides applied on top of a library widget definition.
 * One-way merge: instance never writes back to the library definition.
 */
export interface NodeOverrides {
  variant?: string;
  props?: Record<string, unknown>;
  placement?: Partial<Placement>;
  /** Child overrides keyed by child id. */
  children?: Record<string, NodeOverrides>;
  hidden?: boolean;
}

/**
 * A layout node is EITHER:
 *  - `section`: renders an existing SectionRegistry component (leaf).
 *  - `composite`: contains editable slot `children` (e.g. hero-split = image + text slot).
 *
 * A node may also be an *instance* of a library widget via `widgetId`; in that case
 * the library `definition` is the base and `overrides` are layered on top at render.
 */
export interface LayoutNode {
  id: string;
  kind: 'section' | 'composite';
  /** kind 'section': a SectionType. kind 'composite': semantic label, e.g. 'hero-split'. */
  type?: SectionType | string;
  /** Library widget this node instances (undefined = ad-hoc node authored inline). */
  widgetId?: string;
  overrides?: NodeOverrides;
  /** Desktop placement on the 12-col grid. Mobile ignores x/y; stacks in array order. */
  placement: Placement;
  variant?: string;
  props?: Record<string, unknown>;
  /** Optional cosmetic wrapper (maps the legacy 7 container types). gridstack IS the real layout. */
  wrapper?: { container: ContainerType; columns?: number; className?: string };
  /** Composite slots. Recursive in the data model (gridstack on-canvas editing caps at 1 level). */
  children?: LayoutNode[];
  hidden?: boolean;
  /** Override mobile/DOM stack order (default = source array order). */
  order?: number;
}

export interface TreeLayoutDefinition {
  nodes: LayoutNode[];
  animation?: AnimationConfig;
  wrapper?: { bgClass?: string; containerClass?: string; maxWidth?: string };
}
