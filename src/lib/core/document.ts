/**
 * Document Model — ADR-001 (hierarchy) + the Node shape binding all engines.
 *
 *   Workspace → Project → Page → Frame → Node
 *
 * Pure types. A Node carries its frame (free transform), layout mode, props
 * (literals or bindings, ADR-003), capabilities (ADR-005), events (ADR-007),
 * responsive constraints (§16.2), and optional children (composite).
 */

import type { PropValue, Variable, DataSource } from './values';
import type { NodeCapabilities } from './capabilities';
import type { EventRule } from './runtime';
import type { Versioned } from './version';

// ─── Node ───────────────────────────────────────────────────
export interface NodeFrame {
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number;
  opacity?: number;
}

export type LayoutMode = 'absolute' | 'flex' | 'grid';

export interface LayoutProps {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  gap?: number;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  padding?: number | [number, number] | [number, number, number, number];
  columns?: number;
  /** E5: wrap children onto new lines when exceeding the container's main axis. */
  wrap?: boolean;
}

/** Constraint Solver pins (§16.2) — how a node scales within its frame. */
export type ConstraintPin = 'top' | 'left' | 'right' | 'bottom' | 'centerX' | 'centerY' | 'scale' | 'fixed';

export interface ConstraintAxis {
  pin: ConstraintPin;
  min?: number;
  max?: number;
}

export interface ConstraintSpec {
  horizontal?: ConstraintAxis;
  vertical?: ConstraintAxis;
  aspect?: number;
  safeArea?: boolean;
  /** 'query' = container-query driven; 'viewport' = breakpoint driven. */
  container?: 'query' | 'viewport';
}

export type BreakpointKey = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/** Per-breakpoint overrides of a node's frame/layout (Responsive Engine). */
export interface PerBreakpoint {
  sm?: Partial<NodeFrame> & { layoutProps?: LayoutProps };
  md?: Partial<NodeFrame> & { layoutProps?: LayoutProps };
  lg?: Partial<NodeFrame> & { layoutProps?: LayoutProps };
  xl?: Partial<NodeFrame> & { layoutProps?: LayoutProps };
  '2xl'?: Partial<NodeFrame> & { layoutProps?: LayoutProps };
}

export interface RepeatSpec {
  /** Binding expression resolving to a list (Data Source, ADR-003). */
  source: string;
  itemKey?: string;
  indexKey?: string;
}

export interface Node {
  id: string;
  /** References a ComponentDef in a plugin manifest (ADR-005). */
  componentId?: string;
  name?: string;
  frame: NodeFrame;
  layout?: LayoutMode;
  layoutProps?: LayoutProps;
  /** Prop values are literals OR bindings (ADR-003). */
  props?: Record<string, PropValue>;
  capabilities?: NodeCapabilities;
  events?: EventRule[];
  constraints?: ConstraintSpec;
  responsive?: PerBreakpoint;
  repeat?: RepeatSpec;
  children?: Node[];
  locked?: boolean;
  hidden?: boolean;
  z?: number;
}

// ─── Hierarchy ──────────────────────────────────────────────
export type DeviceKind = 'mobile' | 'tablet' | 'desktop' | 'landscape' | 'custom';

export interface Frame {
  id: string;
  pageId: string;
  name: string;
  viewport: { w: number; h: number; device: DeviceKind };
  nodes: Node[];
  ordinal: number;
}

export interface SeoMeta {
  title?: string;
  description?: string;
  image?: string;
}

export interface Page {
  id: string;
  projectId: string;
  name: string;
  route: string;
  ordinal: number;
  frames: Frame[];
  seo?: SeoMeta;
}

export type ProjectStatus = 'draft' | 'published';

export interface Project extends Versioned {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  themeId?: string;
  status: ProjectStatus;
  pages: Page[];
  variables: Variable[];
  dataSources: DataSource[];
}

export interface Workspace extends Versioned {
  id: string;
  name: string;
  ownerId?: string;
  variables: Variable[];
  dataSources: DataSource[];
  themeLibraryId?: string;
  assetLibraryId?: string;
}

/** The editable unit passed through Core/Editor/Renderer. */
export interface Document extends Versioned {
  workspace: Workspace;
  project: Project;
}

/** Locate a node anywhere in the document by id. Returns [node] or undefined. */
export function findNode(doc: Document, nodeId: string): Node | undefined {
  const visit = (nodes: Node[] | undefined): Node | undefined => {
    if (!nodes) return undefined;
    for (const n of nodes) {
      if (n.id === nodeId) return n;
      const found = visit(n.children);
      if (found) return found;
    }
    return undefined;
  };
  for (const page of doc.project.pages) {
    for (const frame of page.frames) {
      const found = visit(frame.nodes);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Locate a node's JSON-pointer path (RFC 6902, ADR-010) within the document.
 * Returns e.g. `/project/pages/0/frames/1/nodes/3` (children under `/children/i`).
 * Pure; used by canvas commands to address a node's `frame` field for patching.
 */
export function findNodePath(doc: Document, nodeId: string): string | undefined {
  const locate = (
    nodes: Node[] | undefined,
    base: string,
    arrayKey: string,
  ): string | undefined => {
    if (!nodes) return undefined;
    for (let i = 0; i < nodes.length; i++) {
      const here = `${base}/${arrayKey}/${i}`;
      if (nodes[i].id === nodeId) return here;
      const c = locate(nodes[i].children, here, 'children');
      if (c) return c;
    }
    return undefined;
  };
  for (let pi = 0; pi < doc.project.pages.length; pi++) {
    const page = doc.project.pages[pi];
    for (let fi = 0; fi < page.frames.length; fi++) {
      const found = locate(
        page.frames[fi].nodes,
        `/project/pages/${pi}/frames/${fi}`,
        'nodes',
      );
      if (found) return found;
    }
  }
  return undefined;
}
