/**
 * Plugin Manifest — ADR-005. The single extension seam.
 *
 * A manifest registers platform capabilities (components, data sources, event
 * actions, AI providers, tokens). First-party engines ship as builtin plugins.
 * Versioned (manifestVersion/apiVersion/engineVersion) for compatibility checks;
 * runtime executes in a sandbox (ADR-013).
 */

import type { PropSchema } from './schema';
import type { CapabilityKind, CapabilityTier } from './capabilities';
import type { RecordSchema } from './values';
import type { TokenPack } from './token';
import type { AIProviderDef } from './ai';

export type PermissionKind =
  | 'runtime.read'
  | 'runtime.mutate'
  | 'network'
  | 'storage'
  | 'ai';

export interface Permission {
  kind: PermissionKind;
}

/**
 * How a component maps to a target-neutral render node (ADR-021 IR). Declared on
 * the manifest so publish resolves `kind` from the registry instead of heuristic
 * componentId/props sniffing. Lives in core (R7) so publish and editor both read
 * one definition; `RenderNodeKind` in publish = `RenderKind | 'unknown'`.
 */
export type RenderKind =
  | 'frame'
  | 'section'
  | 'container'
  | 'text'
  | 'image'
  | 'video'
  | 'button'
  | 'stack'
  | 'grid'
  | 'divider'
  | 'shape'
  | 'icon'
  | 'music'
  | 'rsvp-form'
  | 'countdown';

export interface ComponentDef {
  id: string;
  name: string;
  category: string;
  thumbnail?: string;
  schema: PropSchema;
  /** Declared capabilities + tier (ADR-005). Source of truth for nodes. */
  capabilities?: Partial<Record<CapabilityKind, CapabilityTier>>;
  tokens?: TokenPack;
  defaultEvents?: unknown[];
  /** Plugin runtime entry; resolved by the host into a render function. */
  renderEntry?: string;
  /** Render IR kind for this component (ADR-021). Drives publish; no heuristic. */
  renderKind?: RenderKind;
  /** True if render needs client hydration (countdown/rsvp/music). */
  hydrates?: boolean;
}

export interface DataSourceDef {
  id: string;
  schema: RecordSchema;
  source: 'local' | 'table' | 'plugin';
}

export interface ActionDef {
  id: string;
  label: string;
  configSchema?: PropSchema;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string; // semver — the plugin's own version
  vendor: string;
  /** Manifest schema version (migrator, ADR-002). */
  manifestVersion: number;
  /** Runtime API contract version the plugin targets (ADR-007). */
  apiVersion: string;
  /** Minimum Lumina engine version (semver range). */
  engineVersion: string;
  permissions: Permission[];
  components?: ComponentDef[];
  dataSources?: DataSourceDef[];
  eventActions?: ActionDef[];
  aiProviders?: AIProviderDef[];
  tokens?: TokenPack;
  runtime?: { entry: string; sandbox: 'worker' | 'iframe' };
}
