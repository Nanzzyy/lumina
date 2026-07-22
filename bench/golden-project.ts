/**
 * Golden benchmark project — ADR-014 §6 / ADR-012.
 *
 * One fixed fixture reused across ALL phases (P2, P3, P4, …). If building,
 * serializing, or rendering it regresses beyond budget, fix perf before adding
 * features. Target shape (structural; engines populate bindings/events as they
 * land): 1000 nodes · 20 frames · 200 images · 300 bindings · 100 events · 20
 * plugin components.
 *
 * Pure: uses only Core types (R7). The frame-time perf gate wires up with the
 * real canvas in P2-T4/T6; this module provides the fixture + coarse build/serialize budget.
 */

import { genId } from '@core/id';
import type { Document, Node, Frame, Page } from '@core/document';
import type { PropValue } from '@core/values';

export interface BenchmarkSpec {
  frames: number;
  nodesPerFrame: number;
  imageNodes: number;
  bindings: number;
  events: number;
  pluginComponents: number;
}

export const GOLDEN_SPEC: BenchmarkSpec = {
  frames: 20,
  nodesPerFrame: 50,
  imageNodes: 200,
  bindings: 300,
  events: 100,
  pluginComponents: 20,
};

export function buildGoldenProject(spec: BenchmarkSpec = GOLDEN_SPEC): Document {
  const totalNodes = spec.frames * spec.nodesPerFrame;
  const componentIds = Array.from({ length: spec.pluginComponents }, (_, i) => `comp-${i}`);
  const imageEvery = Math.max(1, Math.floor(totalNodes / spec.imageNodes));
  const eventEvery = Math.max(1, Math.floor(totalNodes / spec.events));
  const bindEvery = Math.max(1, Math.floor(totalNodes / spec.bindings));

  const frames: Frame[] = [];
  let nodeCounter = 0;
  let bindingCount = 0;

  for (let f = 0; f < spec.frames; f++) {
    const nodes: Node[] = [];
    for (let n = 0; n < spec.nodesPerFrame; n++) {
      const id = genId('n');
      const props: Record<string, PropValue> = {};

      if (nodeCounter % imageEvery === 0) props.image = `/uploads/img-${nodeCounter}.png`;
      if (nodeCounter % bindEvery === 0 && bindingCount < spec.bindings) {
        props.title = { $var: `workspace.field${bindingCount % 50}` };
        bindingCount += 1;
      }

      const node: Node = {
        id,
        componentId: componentIds[nodeCounter % componentIds.length],
        frame: { x: (n % 10) * 120, y: Math.floor(n / 10) * 120, w: 100, h: 100 },
        props,
      };

      if (nodeCounter % eventEvery === 0) {
        node.events = [
          {
            id: genId('ev'),
            trigger: { kind: 'click', nodeId: id },
            actions: [{ kind: 'run-animation', animationId: 'a1' }],
          },
        ];
      }

      nodes.push(node);
      nodeCounter += 1;
    }
    frames.push({
      id: genId('f'),
      pageId: 'pg',
      name: `Frame ${f}`,
      viewport: { w: 390, h: 844, device: 'mobile' },
      nodes,
      ordinal: f,
    });
  }

  const page: Page = { id: 'pg', projectId: 'p', name: 'Home', route: '/', ordinal: 0, frames };
  return {
    schemaVersion: 1,
    workspace: { id: 'ws', schemaVersion: 1, name: 'Golden', variables: [], dataSources: [] },
    project: {
      id: 'p',
      schemaVersion: 1,
      workspaceId: 'ws',
      name: 'Golden',
      slug: 'golden',
      status: 'draft',
      pages: [page],
      variables: [],
      dataSources: [],
    },
  };
}

export function countNodes(doc: Document): number {
  let c = 0;
  const walk = (ns: Node[] | undefined): void => {
    if (!ns) return;
    for (const n of ns) {
      c += 1;
      walk(n.children);
    }
  };
  for (const p of doc.project.pages) for (const f of p.frames) walk(f.nodes);
  return c;
}

export interface BenchmarkCounts {
  nodes: number;
  frames: number;
  images: number;
  bindings: number;
  events: number;
}

export function countAll(doc: Document): BenchmarkCounts {
  const out: BenchmarkCounts = { nodes: 0, frames: 0, images: 0, bindings: 0, events: 0 };
  const isVar = (v: unknown): boolean => typeof v === 'object' && v !== null && '$var' in v;
  const walk = (ns: Node[] | undefined): void => {
    if (!ns) return;
    for (const n of ns) {
      out.nodes += 1;
      if (n.props?.image) out.images += 1;
      if (n.props && Object.values(n.props).some(isVar)) out.bindings += 1;
      if (n.events?.length) out.events += 1;
      walk(n.children);
    }
  };
  for (const p of doc.project.pages) {
    out.frames += p.frames.length;
    for (const f of p.frames) walk(f.nodes);
  }
  return out;
}
