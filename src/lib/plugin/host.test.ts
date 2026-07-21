import { describe, it, expect, vi } from 'vitest';
import { PluginHost } from './host';
import type { PluginRuntime, PluginCapability } from './host';
import type { PluginManifest } from '../core/plugin';

const minimalManifest: PluginManifest = {
  id: 'test.hello',
  name: 'Hello Plugin',
  version: '1.0.0',
  vendor: 'Test',
  manifestVersion: 1,
  apiVersion: '1',
  engineVersion: '>=1.0',
  permissions: [{ kind: 'runtime.read' }, { kind: 'runtime.mutate' }],
};

const createMockRuntime = (): PluginRuntime => ({
  doc: { getProject: vi.fn(), getPage: vi.fn(), getNode: vi.fn() },
  renderTree: { getTree: vi.fn(), getNode: vi.fn() },
  registry: { listComponents: vi.fn(() => []), getComponent: vi.fn(), listProperties: vi.fn(() => []) },
  assets: { resolve: vi.fn((url) => url), getManifest: vi.fn() },
  bus: { on: vi.fn(() => () => {}), emit: vi.fn() },
  applyPatch: vi.fn(),
  setVariable: vi.fn(),
  transformRenderTree: vi.fn(),
});

describe('PluginHost + PluginRuntime (ADR-024)', () => {
  it('registers a plugin by manifest', () => {
    const host = new PluginHost();
    const inst = host.register(minimalManifest, {});
    expect(inst.id).toBe('test.hello');
    expect(inst.lifecycle).toBe('installed');
  });

  it('rejects duplicate registration', () => {
    const host = new PluginHost();
    host.register(minimalManifest, {});
    expect(() => host.register(minimalManifest, {})).toThrow(/duplicate/);
  });

  it('activate transitions lifecycle', async () => {
    const host = new PluginHost();
    const inst = host.register(minimalManifest, { onInit: vi.fn(), onActivate: vi.fn() });
    await host.activate(inst.id, createMockRuntime());
    expect(inst.lifecycle).toBe('active');
  });

  it('activate calls onInit and onActivate', async () => {
    const onInit = vi.fn();
    const onActivate = vi.fn();
    const host = new PluginHost();
    const inst = host.register(minimalManifest, { onInit, onActivate });
    await host.activate(inst.id, createMockRuntime());
    expect(onInit).toHaveBeenCalledOnce();
    expect(onActivate).toHaveBeenCalledOnce();
  });

  it('activate injects context with runtime + storage', async () => {
    const onInit = vi.fn();
    const host = new PluginHost();
    const inst = host.register(minimalManifest, { onInit });
    await host.activate(inst.id, createMockRuntime());
    expect(inst.context).not.toBeNull();
    expect(inst.context!.runtime).toBeDefined();
    expect(inst.context!.storage).toBeDefined();
  });

  it('denies mutation capability when not declared', async () => {
    const readOnlyManifest: PluginManifest = {
      ...minimalManifest,
      permissions: [{ kind: 'runtime.read' }],
    };
    const host = new PluginHost();
    const inst = host.register(readOnlyManifest, { onInit: vi.fn() });
    await host.activate(inst.id, createMockRuntime());
    expect(() => inst.context!.runtime.applyPatch([])).toThrow(/denied/);
  });

  it('deactivate transitions to deactivated', async () => {
    const host = new PluginHost();
    const inst = host.register(minimalManifest, { onInit: vi.fn() });
    await host.activate(inst.id, createMockRuntime());
    await host.deactivate(inst.id);
    expect(inst.lifecycle).toBe('deactivated');
  });

  it('uninstall removes plugin from registry', async () => {
    const host = new PluginHost();
    host.register(minimalManifest, { onInit: vi.fn() });
    await host.uninstall('test.hello');
    expect(host.getPlugin('test.hello')).toBeUndefined();
  });

  it('suspend and resume work', () => {
    const host = new PluginHost();
    const inst = host.register(minimalManifest, {});
    host.suspend(inst.id);
    expect(inst.lifecycle).toBe('suspended');
    host.resume(inst.id);
    expect(inst.lifecycle).toBe('active');
  });

  it('listPlugins returns registered entries', () => {
    const host = new PluginHost();
    host.register(minimalManifest, {});
    expect(host.listPlugins()).toHaveLength(1);
  });
});
