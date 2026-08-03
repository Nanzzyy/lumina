import { describe, it, expect, afterEach, vi } from 'vitest';
import { fileURLToPath } from 'node:url';
import { WorkerSandbox, IframeSandbox, createSandbox } from './sandbox';

const WORKER_ENTRY = fileURLToPath(new URL('./__fixtures__/echo-worker.mjs', import.meta.url));

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

describe('WorkerSandbox against a real worker', () => {
  let sb: WorkerSandbox | null = null;

  afterEach(() => {
    sb?.terminate();
    sb = null;
  });

  it('round-trips a call through the postMessage protocol', async () => {
    sb = new WorkerSandbox({ kind: 'worker', entry: WORKER_ENTRY });
    await sb.start();
    await expect(sb.call('echo', 1, 'two')).resolves.toEqual([1, 'two']);
  });

  it('resolves concurrent calls to their own results', async () => {
    sb = new WorkerSandbox({ kind: 'worker', entry: WORKER_ENTRY });
    await sb.start();
    const [a, b] = await Promise.all([sb.call('echo', 'a'), sb.call('echo', 'b')]);
    expect([a, b]).toEqual([['a'], ['b']]);
  });

  it('rejects with the error the worker reports', async () => {
    sb = new WorkerSandbox({ kind: 'worker', entry: WORKER_ENTRY });
    await sb.start();
    await expect(sb.call('boom')).rejects.toThrow(/plugin exploded/);
    // The sandbox stays usable after a plugin-level error.
    await expect(sb.call('echo', 'still here')).resolves.toEqual(['still here']);
  });

  it('rejects unknown methods reported by the worker', async () => {
    sb = new WorkerSandbox({ kind: 'worker', entry: WORKER_ENTRY });
    await sb.start();
    await expect(sb.call('nope')).rejects.toThrow(/unknown method: nope/);
  });

  it('forwards unsolicited events to onEvent', async () => {
    const onEvent = vi.fn();
    sb = new WorkerSandbox({ kind: 'worker', entry: WORKER_ENTRY, onEvent });
    await sb.start();
    await sb.call('emit');
    expect(onEvent).toHaveBeenCalledWith('ready', { ok: true });
  });

  it('ignores responses for unknown message ids', async () => {
    sb = new WorkerSandbox({ kind: 'worker', entry: WORKER_ENTRY });
    await sb.start();
    await expect(sb.call('unknown-id')).resolves.toBe('done');
  });

  it('rejects with a timeout when the worker never replies', async () => {
    sb = new WorkerSandbox({ kind: 'worker', entry: WORKER_ENTRY, timeout: 30 });
    await sb.start();
    await expect(sb.call('silent')).rejects.toThrow(/timeout: silent/);
  });

  it('reports worker startup failures through onError', async () => {
    const onError = vi.fn();
    sb = new WorkerSandbox({ kind: 'worker', entry: `${WORKER_ENTRY}.missing`, onError });
    await sb.start();
    await vi.waitUntil(() => onError.mock.calls.length > 0, { timeout: 2000 });
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it('call after terminate throws again', async () => {
    sb = new WorkerSandbox({ kind: 'worker', entry: WORKER_ENTRY });
    await sb.start();
    sb.terminate();
    await expect(sb.call('echo')).rejects.toThrow(/not started/);
  });
});
