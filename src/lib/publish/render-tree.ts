/**
 * Render Tree IR — ADR-021 §IR.
 *
 * A target-neutral intermediate representation of the resolved document.
 * Consumed by Target Adapters (HTML, React, Flutter, PDF, Email…).
 * Pure, deterministic, serializable: same ResolvedDocument → same RenderTree JSON.
 *
 * ponytail: style model, event model, accessibility metadata — added as ADR-023
 * specifies the full IR contract. This is the minimal stable spine for P6.
 */

import type { ResolvedDocument, ResolvedNode } from '../core/resolve';
import type { NodeFrame, ConstraintSpec } from '../core/document';
import type { RenderKind } from '../core/plugin';
import { resolveNodeConstraints } from '../core/constraints';
import { resolveResponsiveFrame } from '../core/responsive';
import type { DeviceKey } from '../core/responsive';
import { resolveComponentKind } from './component-kinds';
import { genId } from '../core/id';

// ─── Render Node types ─────────────────────────────────────
// Kind is the core-owned RenderKind union (ADR-005) plus 'unknown' for nodes whose
// componentId has no registered renderKind. No duplicate literal list.
export type RenderNodeKind = RenderKind | 'unknown';

export interface RenderNode {
  id: string;
  kind: RenderNodeKind;
  frame: NodeFrame;
  /** Resolved CSS style map (from PropertyDef.toStyle). */
  style: Record<string, string>;
  /** Resolved content (text, image URL, video URL…). */
  content?: Record<string, unknown>;
  /** Children (stack/grid/container nesting). */
  children?: RenderNode[];
  /** Accessibility metadata. */
  aria?: { label?: string; role?: string; hidden?: boolean };
  /** True if this node needs runtime hydration. */
  needsHydration?: boolean;
  /** Asset references (for AssetGraph collector). */
  assetRefs?: { url: string; kind: string }[];
}

/** Full Render Tree output. */
export interface RenderTree {
  id: string;
  /** Version of the IR format. */
  version: number;
  /** Page-level metadata. */
  pages: RenderPage[];
}

export interface RenderPage {
  id: string;
  route: string;
  seo?: { title?: string; description?: string; image?: string };
  /** Frames rendered sequentially (or stacked, depending on target). */
  nodes: RenderNode[];
  /** Style map keyed by property key (from Theme + Property engines). */
  globalStyle: Record<string, string>;
}

// ─── Builder ────────────────────────────────────────────────
export const RENDER_TREE_VERSION = 1;

export interface BuildRenderTreeOptions {
  /** Publish viewport (frame size); the constraint parent for top-level nodes. */
  viewport?: { w: number; h: number };
  /** Target breakpoint for responsive resolution (default 'base'). */
  breakpoint?: DeviceKey;
}

/**
 * Build a Render Tree from a ResolvedDocument. Deterministic: same input →
 * identical output JSON. Pure: no side effects.
 */
export function buildRenderTree(
  resolved: ResolvedDocument,
  baseUrl = '/',
  opts: BuildRenderTreeOptions = {},
): RenderTree {
  const viewport = opts.viewport ?? { w: 384, h: 728 };
  const breakpoint: DeviceKey = opts.breakpoint ?? 'base';
  const page: RenderPage = {
    id: genId('page'),
    route: '/',
    globalStyle: resolved.variables as unknown as Record<string, string>,
    nodes: resolved.nodes.map((n) => nodeToRenderNode(n, baseUrl, viewport.w, viewport.h, breakpoint)),
  };

  return { id: genId('rt'), version: RENDER_TREE_VERSION, pages: [page] };
}

/**
 * Map a resolved node → render node. Kind comes from the component registry
 * (resolveComponentKind); geometry comes from the Responsive engine (E7) layered
 * on the Layout-engine-resolved frame, then the Constraint CSS solver (E6). The
 * node tree recurses through children.
 */
function nodeToRenderNode(
  node: ResolvedNode,
  baseUrl: string,
  parentW: number,
  parentH: number,
  breakpoint: DeviceKey,
): RenderNode {
  const props = node.props ?? {};
  const content: Record<string, unknown> = {};
  const style: Record<string, string> = {};
  const assetRefs: { url: string; kind: string }[] = [];

  // Aesthetic props → style. Geometry is owned by the frame + constraint engine.
  if (props.opacity != null) style.opacity = String(props.opacity);
  if (props.backgroundColor) style.backgroundColor = String(props.backgroundColor);
  if (props.color) style.color = String(props.color);
  if (props.fontSize) style.fontSize = String(props.fontSize);
  if (props.fontFamily) style.fontFamily = String(props.fontFamily);
  if (props.borderRadius) style.borderRadius = String(props.borderRadius);
  if (props.boxShadow) style.boxShadow = String(props.boxShadow);
  if (props.textAlign) style.textAlign = String(props.textAlign);

  // E7: layer per-breakpoint overrides for the publish target onto the (layout-
  // resolved) base frame; E6: emit constraint CSS using the parent's dimensions.
  const baseFrame: NodeFrame = node.frame ?? { x: 0, y: 0, w: 0, h: 0 };
  const frame = resolveResponsiveFrame(baseFrame, node.responsive, breakpoint);
  Object.assign(style, resolveNodeConstraints(frame, parentW, parentH, node.constraints).style);

  // Content
  if (props.text) content.text = props.text;
  if (props.title) content.title = props.title;
  if (props.subtitle) content.subtitle = props.subtitle;
  if (props.image) {
    content.image = resolveUrl(props.image as string, baseUrl);
    assetRefs.push({ url: content.image as string, kind: 'image' });
  }
  if (props.video) {
    content.video = resolveUrl(props.video as string, baseUrl);
    assetRefs.push({ url: content.video as string, kind: 'video' });
  }
  if (props.src) {
    content.src = resolveUrl(props.src as string, baseUrl);
    assetRefs.push({ url: content.src as string, kind: 'resource' });
  }

  // Kind + hydration from the registry (ADR-005) — no heuristic detection.
  const { kind, hydrates } = resolveComponentKind(node.componentId);

  const rn: RenderNode = {
    id: node.id,
    kind,
    frame,
    style,
    content: Object.keys(content).length > 0 ? content : undefined,
    needsHydration: hydrates || undefined,
    assetRefs: assetRefs.length > 0 ? assetRefs : undefined,
  };

  if (node.children && node.children.length > 0) {
    rn.children = node.children.map((c) => nodeToRenderNode(c, baseUrl, frame.w, frame.h, breakpoint));
  }

  return rn;
}

function resolveUrl(url: string, baseUrl: string): string {
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) return url;
  return `${baseUrl}${url}`;
}

/**
 * Serialize RenderTree to JSON. Used by the publisher for caching and verification.
 */
export function serializeRenderTree(tree: RenderTree): string {
  return JSON.stringify(tree, null, 2);
}

/**
 * Deserialize RenderTree from JSON. Returns null on invalid input.
 */
export function deserializeRenderTree(json: string): RenderTree | null {
  try {
    const obj = JSON.parse(json);
    if (!obj || obj.version !== RENDER_TREE_VERSION) return null;
    return obj as RenderTree;
  } catch {
    return null;
  }
}
