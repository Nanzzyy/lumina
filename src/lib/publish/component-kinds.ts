/**
 * Publish-side component read-path (ADR-005 "one manifest, N read paths").
 *
 * The editor's sync ComponentRegistry (`@editor/component-registry`) is a runtime
 * Map populated at editor entry — unavailable to the server publish pipeline. So
 * publish reads the SAME ComponentDef manifests directly and flattens them to a
 * lookup. This is the sole source of `renderKind`/`hydrates` for the render tree,
 * replacing the old componentId/props heuristic in render-tree.ts.
 *
 * Pure/server-safe (R5/R7): imports only manifest data + core types.
 */

import type { ComponentDef, RenderKind } from '../core/plugin';
import { textComponent } from '@/data/library/plugins/text';
import { rectangleComponent } from '@/data/library/plugins/rectangle';
import { imageComponent } from '@/data/library/plugins/image';
import { buttonComponent } from '@/data/library/plugins/button';
import { heroManifest } from '@/data/library/plugins/hero';
import { countdownManifest } from '@/data/library/plugins/countdown';
import { rsvpManifest } from '@/data/library/plugins/rsvp';

const BY_ID: ReadonlyMap<string, ComponentDef> = new Map(
  [
    textComponent,
    rectangleComponent,
    imageComponent,
    buttonComponent,
    ...(heroManifest.components ?? []),
    ...(countdownManifest.components ?? []),
    ...(rsvpManifest.components ?? []),
  ].map((d) => [d.id, d] as const),
);

export function getPublishComponent(id?: string): ComponentDef | undefined {
  return id ? BY_ID.get(id) : undefined;
}

export interface ComponentKindInfo {
  kind: RenderKind | 'unknown';
  hydrates: boolean;
}

/** Resolve a node's render kind + hydration flag from its componentId. */
export function resolveComponentKind(componentId?: string): ComponentKindInfo {
  const def = getPublishComponent(componentId);
  return {
    kind: def?.renderKind ?? 'unknown',
    hydrates: def?.hydrates === true,
  };
}
