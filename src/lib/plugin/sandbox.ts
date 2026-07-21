/**
 * Plugin Sandbox — ADR-024 §sandbox.
 *
 * Two isolation modes: Web Worker (pure compute, no DOM) and sandboxed iframe
 * (DOM-touching plugins like embedded maps, custom widgets). Both communicate
 * with the host via a postMessage protocol.
 *
 * WorkerSandbox: spawns a Worker, routes method calls through postMessage,
 * enforces timeout (30s default), forwards errors.
 * IframeSandbox: creates an iframe with restricted sandbox attributes,
 * same messaging protocol.
 *
 * ponytail: production hardening (capability-based messages, content security,
 * origin validation) lands in P10 alongside the security audit.
 */

import { genId } from '../core/id';

// ─── Message protocol ──────────────────────────────────────
export interface SandboxMessage {
  id: string;
  type: 'call' | 'response' | 'error' | 'event';
  method?: string;
  args?: unknown[];
  result?: unknown;
  error?: string;
  event?: string;
  data?: unknown;
}

export type SandboxKind = 'worker' | 'iframe';

export interface SandboxOptions {
  kind: SandboxKind;
  entry: string;
  timeout?: number;      // ms, default 30000
  onError?: (err: Error) => void;
  onEvent?: (event: string, data: unknown) => void;
}

// ─── WorkerSandbox ─────────────────────────────────────────
export class WorkerSandbox {
  private worker: Worker | null = null;
  private pending = new Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  private id = genId('sb');
  private options: SandboxOptions;

  constructor(options: SandboxOptions) {
    this.options = { timeout: 30000, ...options };
  }

  async start(): Promise<void> {
    const { Worker: ThreadWorker } = await import('worker_threads') as any;
    this.worker = new ThreadWorker(this.options.entry, { eval: false });
    (this.worker as any).on('message', (msg: SandboxMessage) => this.handleMessage(msg));
    (this.worker as any).on('error', (err: Error) => this.options.onError?.(err));
  }

  async call(method: string, ...args: unknown[]): Promise<unknown> {
    if (!this.worker) throw new Error('[sandbox] not started');
    const id = genId('msg');
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`[sandbox] timeout: ${method}`));
      }, this.options.timeout ?? 30000);
      this.worker!.postMessage({ id, type: 'call', method, args } as SandboxMessage);
      // Override resolve to clear timeout
      const origReject = reject;
      this.pending.set(id, {
        resolve: (v) => { clearTimeout(timeout); resolve(v); },
        reject: (e) => { clearTimeout(timeout); origReject(e); },
      });
    });
  }

  terminate(): void {
    this.worker?.terminate();
    this.worker = null;
    this.pending.clear();
  }

  private handleMessage(msg: SandboxMessage): void {
    if (msg.type === 'response' || msg.type === 'error') {
      const pending = this.pending.get(msg.id);
      if (!pending) return;
      this.pending.delete(msg.id);
      if (msg.type === 'error') pending.reject(new Error(msg.error));
      else pending.resolve(msg.result);
    } else if (msg.type === 'event') {
      this.options.onEvent?.(msg.event ?? '', msg.data);
    }
  }
}

// ─── IframeSandbox ─────────────────────────────────────────
export class IframeSandbox {
  private iframe: HTMLIFrameElement | null = null;
  private pending = new Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  private options: SandboxOptions;

  constructor(options: SandboxOptions) {
    this.options = { timeout: 30000, ...options };
  }

  start(parent: HTMLElement = document.body): Promise<void> {
    return new Promise((resolve) => {
      this.iframe = document.createElement('iframe');
      this.iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
      this.iframe.setAttribute('src', this.options.entry);
      this.iframe.style.display = 'none';
      this.iframe.onload = () => {
        this.iframe!.contentWindow?.addEventListener('message', (e: MessageEvent<SandboxMessage>) => {
          if (e.source !== this.iframe?.contentWindow) return;
          this.handleMessage(e.data);
        });
        resolve();
      };
      parent.appendChild(this.iframe);
    });
  }

  async call(method: string, ...args: unknown[]): Promise<unknown> {
    if (!this.iframe?.contentWindow) throw new Error('[sandbox] not started');
    const id = genId('msg');
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`[sandbox] timeout: ${method}`));
      }, this.options.timeout ?? 30000);
      this.iframe!.contentWindow!.postMessage({ id, type: 'call', method, args } as SandboxMessage, '*');
      this.pending.set(id, {
        resolve: (v) => { clearTimeout(timeout); resolve(v); },
        reject: (e) => { clearTimeout(timeout); reject(e); },
      });
    });
  }

  destroy(): void {
    this.iframe?.remove();
    this.iframe = null;
    this.pending.clear();
  }

  private handleMessage(msg: SandboxMessage): void {
    if (msg.type === 'response' || msg.type === 'error') {
      const pending = this.pending.get(msg.id);
      if (!pending) return;
      this.pending.delete(msg.id);
      if (msg.type === 'error') pending.reject(new Error(msg.error));
      else pending.resolve(msg.result);
    }
  }
}

// ─── Factory ────────────────────────────────────────────────
export function createSandbox(options: SandboxOptions): WorkerSandbox | IframeSandbox {
  if (options.kind === 'worker') return new WorkerSandbox(options);
  return new IframeSandbox(options);
}
