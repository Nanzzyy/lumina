/**
 * Resolution Pipeline — ADR-016.
 *
 * 6-step deterministic pipeline: Scope → Variables → Data Sources → Expressions →
 * Tokens → Constraints. Every step is a pure function over the prior step's output.
 * Input is never mutated.
 *
 * The DependencyGraph (ADR-016 §DAG) gates incremental re-resolve:
 * markDirty(changedKeys) → getAffected() → re-resolve only affected nodes.
 *
 * Pipeline version = 1. A future engine inserts itself via a migrator (ADR-002).
 */

import type { Document, Node, NodeFrame, ConstraintSpec, PerBreakpoint, LayoutMode, LayoutProps } from './document';
import type { VarScopeInput } from './variable';
import type { Resolved } from './values';
import { resolveProps } from './variable';
import { resolveDataSources } from './data-source';
import type { DataResolverInput } from './data-source';
import { DependencyGraph } from './dependency-graph';
import { evaluate, exprDependencies } from './expression-eval';
import { resolveAllTokens } from './theme';
import type { ThemeInput } from './theme';
import { getProperty, listProperties } from './property-registry';
import { resolveLayout } from './layout';

export const PIPELINE_VERSION = 1;

// ─── Context passed through every resolver step ────────────
export interface ResolveContext {
  variables: VarScopeInput;
  dataInput: DataResolverInput;
  /** Theme input for token resolution (step 5). */
  theme: ThemeInput;
  /** Pre-resolved token map (cached from resolveAllTokens). */
  tokens: Record<string, string>;
  breakpoint?: string;
}

// ─── Step types ─────────────────────────────────────────────
export interface Resolver<TIn, TOut> {
  (input: TIn, ctx: ResolveContext): TOut;
}

// ─── Resolved Document ──────────────────────────────────────
export interface ResolvedNode {
  id: string;
  componentId?: string;
  name?: string;
  props: Record<string, unknown>;
  hidden?: boolean;
  /** Carried from Node.frame so target adapters can position the node. */
  frame?: NodeFrame;
  /** Layout Engine (E5) — flex solver consumed these to compute child frames. */
  layout?: LayoutMode;
  layoutProps?: LayoutProps;
  /** Constraint pins (E6) — render tree emits the constraint CSS. */
  constraints?: ConstraintSpec;
  /** Per-breakpoint overrides (E7/ADR-019) — render tree resolves for the target. */
  responsive?: PerBreakpoint;
  /** Nested children — the node tree is preserved end-to-end (E8). */
  children?: ResolvedNode[];
}

export interface ResolvedDocument {
  schemaVersion: number;
  pipelineVersion: number;
  nodes: ResolvedNode[];
  variables: Record<string, Resolved>;
  dataSources: any[];
}

/**
 * Step 1: Inject scope values (workspace → project → page → frame cascade).
 * Already expressed by VarScopeInput; the scope cascade is inherent to the
 * variable resolver (ADR-003).
 */
export function resolverStep1(input: VarScopeInput, _ctx: ResolveContext): VarScopeInput { // eslint-disable-line @typescript-eslint/no-unused-vars
  return input;
}

/**
 * Step 2: Resolve bindings into literal values. Passes expressions through as-is
 * for step 4.
 */
export function resolverStep2(
  doc: { project: { pages: { frames: { nodes: Node[] }[] }[] } },
  ctx: ResolveContext,
): Record<string, unknown>[][] { // eslint-disable-line @typescript-eslint/no-explicit-any
  return doc.project.pages[0].frames.map((frame) =>
    frame.nodes.map((node) => resolveProps(ctx.variables, node.props ?? {}))
  );
}

/**
 * Step 3: Resolve data sources (local rows → table rows → plugin stubs).
 */
export function resolverStep3(
  _doc: unknown,
  ctx: ResolveContext,
): ReturnType<typeof resolveDataSources> {
  return resolveDataSources(ctx.dataInput);
}

/**
 * Step 4: Evaluate expressions in resolved props. The DAG ensures only affected
 * nodes re-resolve.
 */
export function resolverStep4(
  resolvedProps: Record<string, unknown>[],
  ctx: ResolveContext,
): Record<string, unknown>[] {
  return resolvedProps.map((props) => {
    const out: Record<string, unknown> = { ...props };
    for (const [key, val] of Object.entries(props)) {
      if (typeof val === 'string' && val.startsWith('$expr:')) {
        // Expression stored as raw $expr string
        const expr = val.slice(6);
        out[key] = evaluate(expr, { vars: ctx.variables as unknown as Record<string, unknown>, fns: {} });
      } else if (typeof val === 'string' && val.includes('{{')) {
        // Inline expression
        out[key] = evaluate(val, { vars: ctx.variables as unknown as Record<string, unknown>, fns: {} });
      }
    }
    return out;
  });
}

export interface TokenStepInput {
  resolvedProps: Record<string, unknown>[];
}

/**
 * Step 5: Apply theme tokens — ADR-018 integration.
 * Resolves token refs via the ThemeInput cascade + alias chain.
 * Falls back to PropertyDef.tokenRef for properties with a token binding.
 */
export function resolverStep5(input: TokenStepInput, ctx: ResolveContext): TokenStepInput {
  // Warm the token cache from the theme input if not already done.
  if (Object.keys(ctx.tokens).length === 0 && ctx.theme) {
    ctx.tokens = resolveAllTokens(ctx.theme);
  }
  const TOKEN_RE = /^\$token:(.+)$/;
  return {
    resolvedProps: input.resolvedProps.map((props) => {
      const out: Record<string, unknown> = { ...props };
      for (const [key, val] of Object.entries(props)) {
        if (typeof val === 'string' && TOKEN_RE.test(val)) {
          const ref = val.match(TOKEN_RE)![1];
          out[key] = ctx.tokens[ref] ?? val;
        }
        // Apply default from PropertyDef.tokenRef when the prop is not set
        const propDef = typeof key === 'string' ? getProperty(key) : undefined;
        if (propDef?.tokenRef && out[key] == null) {
          const tokenVal = ctx.tokens[propDef.tokenRef];
          if (tokenVal) out[key] = tokenVal;
        }
      }
      return out;
    }),
  };
}

/**
 * Step 6: Apply constraints (responsive breakpoints, aspect, pin, container).
 * ponytail: full Constraint Solver (§16.2) lands in P4/P5. Step 6 passes through.
 */
export function resolverStep6<T>(input: T, _ctx: ResolveContext): T { // eslint-disable-line @typescript-eslint/no-unused-vars
  return input;
}

/**
 * ADR-017: Resolve a single property value through the full pipeline:
 * raw → variable binding → expression → token → computed style via toStyle.
 */
export function resolveProperty(
  key: string,
  value: unknown,
  ctx: ResolveContext,
): Record<string, string> {
  // Step 2: variable binding
  let resolved = resolveProps(ctx.variables, { [key]: value })[key];
  // Step 4: expression eval
  if (typeof resolved === 'string' && resolved.includes('{{')) {
    resolved = evaluate(resolved, { vars: ctx.variables as unknown as Record<string, unknown>, fns: {} });
  }
  // Step 5: token ref
  if (typeof resolved === 'string' && resolved.startsWith('$token:')) {
    if (Object.keys(ctx.tokens).length === 0 && ctx.theme) {
      ctx.tokens = resolveAllTokens(ctx.theme);
    }
    const ref = resolved.slice(7);
    resolved = ctx.tokens[ref] ?? resolved;
  }
  // PropertyDef.tokenRef fallback
  const propDef = getProperty(key);
  if (propDef?.tokenRef && !resolved) {
    if (Object.keys(ctx.tokens).length === 0 && ctx.theme) {
      ctx.tokens = resolveAllTokens(ctx.theme);
    }
    resolved = ctx.tokens[propDef.tokenRef] ?? resolved;
  }
  // toStyle adapter per ADR-017
  if (propDef?.toStyle) {
    return propDef.toStyle(resolved, ctx);
  }
  return { [key]: String(resolved ?? '') };
}

// ─── Full pipeline ──────────────────────────────────────────
export function resolveDocument(doc: Document, ctx: ResolveContext): ResolvedDocument {
  // Steps 1–6 in order (ADR-016). Step 1 (scope) is inherent to VarScopeInput;
  // step 3 (data sources) warms the resolver; step 6 (constraints) emits CSS in
  // the render tree, not here.
  resolverStep1(ctx.variables, ctx);
  resolverStep3(doc, ctx);

  // Layout Engine (E5): compute flex child frames per frame BEFORE mapping to
  // ResolvedNode, so published frames carry laid-out geometry. Pure tree rewrite.
  const laidOutPages = doc.project.pages.map((page) => ({
    ...page,
    frames: page.frames.map((frame) => ({ ...frame, nodes: resolveLayout(frame.nodes) })),
  }));
  const laidOutDoc: Document = { ...doc, project: { ...doc.project, pages: laidOutPages } };

  return {
    schemaVersion: doc.schemaVersion,
    pipelineVersion: PIPELINE_VERSION,
    nodes: laidOutDoc.project.pages[0].frames.flatMap((frame) =>
      frame.nodes.map((n) => resolveNodeRecursive(n, ctx)),
    ),
    variables: {},
    dataSources: [],
  };
}

/**
 * Resolve a single node and its subtree: props run through steps 2 → 4 → 5
 * (variables → expressions → tokens) per-node — no flat-array indexing — and the
 * node tree (children) is preserved so groups/nested/auto-layout reach publish.
 */
function resolveNodeRecursive(node: Node, ctx: ResolveContext): ResolvedNode {
  const bound = resolveProps(ctx.variables, node.props ?? {});
  const exprResolved = resolverStep4([bound], ctx)[0];
  const tokenResolved = resolverStep5({ resolvedProps: [exprResolved] }, ctx).resolvedProps[0];

  const resolved: ResolvedNode = {
    id: node.id,
    componentId: node.componentId,
    name: node.name,
    props: tokenResolved,
    hidden: node.hidden,
    frame: node.frame,
    layout: node.layout,
    layoutProps: node.layoutProps,
    constraints: node.constraints,
    responsive: node.responsive,
  };
  if (node.children && node.children.length > 0) {
    resolved.children = node.children.map((c) => resolveNodeRecursive(c, ctx));
  }
  return resolved;
}

// ─── DAG integration ────────────────────────────────────────
export function buildDependencyGraph(doc: Document): DependencyGraph {
  const g = new DependencyGraph();
  const visitNode = (node: Node) => {
    for (const [key, val] of Object.entries(node.props ?? {})) {
      if (typeof val === 'string' && val.includes('{{')) {
        // $expr: is a storage prefix (ADR-003); the dependency graph reads the
        // expression body, mirroring resolverStep4 which strips it before evaluate.
        const expr = val.startsWith('$expr:') ? val.slice(6) : val;
        const deps = exprDependencies(expr);
        for (const dep of deps) {
          g.addNode(dep);
          g.addNode(`${node.id}.${key}`);
          g.addEdge(dep, `${node.id}.${key}`);
        }
      } else if (typeof val === 'object' && val !== null && '$var' in val) {
        g.addNode((val as any).$var);
        g.addNode(`${node.id}.${key}`);
        g.addEdge((val as any).$var, `${node.id}.${key}`);
      }
    }
    if (node.children) node.children.forEach(visitNode);
  };
  for (const page of doc.project.pages) {
    for (const frame of page.frames) {
      frame.nodes.forEach(visitNode);
    }
  }
  return g;
}
