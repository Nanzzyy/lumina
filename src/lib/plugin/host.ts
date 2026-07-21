/**
 * PluginHost + PluginRuntime API — ADR-024.
 *
 * The single seam for all extensions. A plugin declares capabilities in its
 * manifest (ADR-005); the host validates them, creates a sandbox (Worker/iframe,
 * ADR-024 §sandbox), injects a restricted Runtime API, and manages the plugin
 * lifecycle (load → init → run → suspend → resume → deactivate → uninstall).
 *
 * Pure/Isomorphic: the Runtime API definition works in Node and the browser.
 * Sandbox creation is environment-specific (Worker in browser, Worker mock in tests).
 */

import type { PluginManifest, PermissionKind, ComponentDef } from '../core/plugin';
import type { DocumentPatch } from '../core/history';
import type { RenderNode } from '../publish/render-tree';

export type { PluginManifest, PermissionKind, ComponentDef };

// ─── Capabilities ──────────────────────────────────────────
export type PluginCapability =
  | 'doc.read'
  | 'doc.patch'
  | 'renderTree.read'
  | 'renderTree.transform'
  | 'assets.read'
  | 'theme.read'
  | 'registry.read'
  | 'ui.panel'
  | 'ui.toolbar'
  | 'publish.target';

// ─── PluginRuntime API (ADR-024 §API surface) ──────────────
export interface PluginRuntimeRead {
  doc: {
    getProject(): unknown;
    getPage(pageId: string): unknown;
    getNode(nodeId: string): unknown;
  };
  renderTree: {
    getTree(): unknown;
    getNode(nodeId: string): RenderNode | undefined;
  };
  registry: {
    listComponents(): ComponentDef[];
    getComponent(id: string): ComponentDef | undefined;
    listProperties(): unknown[];
  };
  assets: {
    resolve(url: string): string;
    getManifest(hash: string): unknown;
  };
  bus: {
    on(event: string, handler: (data: unknown) => void): () => void;
    emit(event: string, data: unknown): void;
  };
}

export interface PluginRuntimeMutate {
  applyPatch(patch: DocumentPatch): void;
  setVariable(key: string, value: unknown): void;
  /** Transform the RenderTree before publish. */
  transformRenderTree(fn: (tree: unknown) => unknown): void;
}

export interface PluginRuntime extends PluginRuntimeRead, PluginRuntimeMutate {}

// ─── Lifecycle (ADR-024 §lifecycle) ────────────────────────
export type PluginLifecycle =
  | 'installed'
  | 'activating'
  | 'active'
  | 'suspended'
  | 'deactivating'
  | 'deactivated'
  | 'error';

export interface PluginContext {
  manifest: PluginManifest;
  runtime: PluginRuntime;
  /** Workspace-scoped storage (persisted, e.g. plugin config). */
  storage: { get(key: string): unknown; set(key: string, value: unknown): void };
}

export interface PluginLifecycleHooks {
  onInit?(ctx: PluginContext): Promise<void> | void;
  onActivate?(ctx: PluginContext): Promise<void> | void;
  onDeactivate?(ctx: PluginContext): Promise<void> | void;
  onUninstall?(ctx: PluginContext): Promise<void> | void;
  onError?(ctx: PluginContext, error: Error): void;
}

// ─── Host ──────────────────────────────────────────────────
export type SandboxKind = 'worker' | 'iframe';

export interface SandboxOptions {
  kind: SandboxKind;
  entry: string;  // path to JS bundle
  permissions: PluginCapability[];
}

export interface PluginInstance {
  id: string;
  manifest: PluginManifest;
  lifecycle: PluginLifecycle;
  sandbox: SandboxKind | null;
  capabilities: PluginCapability[];
  hooks: PluginLifecycleHooks;
  context: PluginContext | null;
}

// ─── PluginHost ────────────────────────────────────────────
export class PluginHost {
  private plugins = new Map<string, PluginInstance>();
  private sandboxes = new Map<string, unknown>(); // Worker | HTMLIFrameElement

  /** Register a plugin by manifest. Validates capabilities against allowlist. */
  register(manifest: PluginManifest, hooks: PluginLifecycleHooks): PluginInstance {
    if (this.plugins.has(manifest.id)) throw new Error(`[plugin] duplicate: ${manifest.id}`);

    const capabilities = this.resolveCapabilities(manifest.permissions);

    const instance: PluginInstance = {
      id: manifest.id,
      manifest,
      lifecycle: 'installed',
      sandbox: manifest.runtime?.sandbox ?? null,
      capabilities,
      hooks,
      context: null,
    };

    this.plugins.set(manifest.id, instance);
    return instance;
  }

  /** Activate a plugin: inject runtime API, call onInit, transition to 'active'. */
  async activate(pluginId: string, runtime: PluginRuntime): Promise<void> {
    const inst = this.plugins.get(pluginId);
    if (!inst) throw new Error(`[plugin] not found: ${pluginId}`);

    inst.lifecycle = 'activating';
    inst.context = {
      manifest: inst.manifest,
      runtime: this.createRestrictedRuntime(runtime, inst.capabilities),
      storage: this.createStorage(pluginId),
    };

    try {
      if (inst.hooks.onInit) await inst.hooks.onInit(inst.context);
      if (inst.hooks.onActivate) await inst.hooks.onActivate(inst.context);
      inst.lifecycle = 'active';
    } catch (e) {
      inst.lifecycle = 'error';
      inst.hooks.onError?.(inst.context!, e instanceof Error ? e : new Error(String(e)));
      throw e;
    }
  }

  /** Suspend a plugin (e.g. when user disables it mid-session). */
  suspend(pluginId: string): void {
    const inst = this.plugins.get(pluginId);
    if (!inst) return;
    inst.lifecycle = 'suspended';
  }

  /** Resume a suspended plugin. */
  resume(pluginId: string): void {
    const inst = this.plugins.get(pluginId);
    if (inst?.lifecycle === 'suspended') inst.lifecycle = 'active';
  }

  /** Deactivate: call onDeactivate, clean up sandbox. */
  async deactivate(pluginId: string): Promise<void> {
    const inst = this.plugins.get(pluginId);
    if (!inst) return;
    inst.lifecycle = 'deactivating';
    try {
      if (inst.hooks.onDeactivate && inst.context) await inst.hooks.onDeactivate(inst.context);
    } finally {
      inst.lifecycle = 'deactivated';
      this.sandboxes.delete(pluginId);
    }
  }

  /** Uninstall: call onUninstall, remove from registry. */
  async uninstall(pluginId: string): Promise<void> {
    const inst = this.plugins.get(pluginId);
    if (!inst) return;
    await this.deactivate(pluginId);
    if (inst.hooks.onUninstall && inst.context) await inst.hooks.onUninstall(inst.context);
    this.plugins.delete(pluginId);
  }

  getPlugin(id: string): PluginInstance | undefined {
    return this.plugins.get(id);
  }

  listPlugins(): PluginInstance[] {
    return Array.from(this.plugins.values());
  }

  // ── Internals ───────────────────────────────────────────

  private capabilitiesForPermission = new Map<PermissionKind, PluginCapability[]>([
    ['runtime.read', ['doc.read', 'renderTree.read', 'registry.read', 'theme.read']],
    ['runtime.mutate', ['doc.patch']],
    ['network', []],
    ['storage', []],
    ['ai', []],
  ]);

  private resolveCapabilities(permissions: import('../core/plugin').Permission[]): PluginCapability[] {
    const caps = new Set<PluginCapability>();
    for (const perm of permissions) {
      const mapped = this.capabilitiesForPermission.get(perm.kind) ?? [];
      for (const c of mapped) caps.add(c);
    }
    return Array.from(caps);
  }

  private createRestrictedRuntime(full: PluginRuntime, capabilities: PluginCapability[]): PluginRuntime {
    const can = (cap: PluginCapability) => capabilities.includes(cap);
    return {
      doc: can('doc.read') ? full.doc : { getProject: () => { throw denial('doc.read'); }, getPage: () => { throw denial('doc.read'); }, getNode: () => { throw denial('doc.read'); } },
      renderTree: can('renderTree.read') ? full.renderTree : { getTree: () => { throw denial('renderTree.read'); }, getNode: () => { throw denial('renderTree.read'); } },
      registry: can('registry.read') ? full.registry : { listComponents: () => [], getComponent: () => undefined, listProperties: () => [] },
      assets: can('assets.read') ? full.assets : { resolve: () => { throw denial('assets.read'); }, getManifest: () => { throw denial('assets.read'); } },
      bus: full.bus,  // event bus is always readable
      applyPatch: can('doc.patch') ? full.applyPatch : () => { throw denial('doc.patch'); },
      setVariable: can('doc.patch') ? full.setVariable : () => { throw denial('doc.patch'); },
      transformRenderTree: can('renderTree.transform') ? full.transformRenderTree : () => { throw denial('renderTree.transform'); },
    };
  }

  private createStorage(pluginId: string): PluginContext['storage'] {
    const store = new Map<string, unknown>();
    return {
      get: (key: string) => store.get(key),
      set: (key: string, value: unknown) => { store.set(key, value); },
    };
  }
}

function denial(cap: string): Error {
  return new Error(`[plugin] capability denied: ${cap}`);
}
