import { describe, it, expect } from 'vitest';
import { WorkerSandbox, IframeSandbox, createSandbox } from './sandbox';

describe('plugin sandbox (ADR-024)', () => {
  it('createSandbox returns correct type', () => {
    const w = createSandbox({ kind: 'worker', entry: '/worker.js' });
    expect(w).toBeInstanceOf(WorkerSandbox);
  });

  it('WorkerSandbox call before start throws', async () => {
    const sb = new WorkerSandbox({ kind: 'worker', entry: '/worker.js' });
    await expect(sb.call('test')).rejects.toThrow(/not started/);
  });

  it('terminate does not throw when not started', () => {
    const sb = new WorkerSandbox({ kind: 'worker', entry: '/worker.js' });
    expect(() => sb.terminate()).not.toThrow();
  });

  it('IframeSandbox createSandbox returns IframeSandbox', () => {
    const sb = createSandbox({ kind: 'iframe', entry: '/iframe.html' });
    expect(sb).toBeInstanceOf(IframeSandbox);
  });

  it('IframeSandbox call before start throws', async () => {
    const sb = new IframeSandbox({ kind: 'iframe', entry: '/iframe.html' });
    await expect(sb.call('test')).rejects.toThrow(/not started/);
  });
});
