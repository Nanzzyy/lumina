/**
 * Test fixture for WorkerSandbox (src/lib/plugin/sandbox.ts).
 * Speaks the SandboxMessage protocol: replies to `call` with `response`/`error`,
 * and can push an unsolicited `event`. `silent` never replies (timeout path).
 */
import { parentPort } from 'node:worker_threads';

parentPort.on('message', (msg) => {
  if (msg.type !== 'call') return;
  switch (msg.method) {
    case 'echo':
      parentPort.postMessage({ id: msg.id, type: 'response', result: msg.args });
      break;
    case 'boom':
      parentPort.postMessage({ id: msg.id, type: 'error', error: 'plugin exploded' });
      break;
    case 'emit':
      parentPort.postMessage({ type: 'event', id: 'evt', event: 'ready', data: { ok: true } });
      parentPort.postMessage({ id: msg.id, type: 'response', result: null });
      break;
    case 'unknown-id':
      parentPort.postMessage({ id: 'no-such-id', type: 'response', result: 'ignored' });
      parentPort.postMessage({ id: msg.id, type: 'response', result: 'done' });
      break;
    case 'silent':
      break;
    default:
      parentPort.postMessage({ id: msg.id, type: 'error', error: `unknown method: ${msg.method}` });
  }
});
