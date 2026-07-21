/**
 * History & Document Patch — ADR-010.
 *
 * Canonical RFC 6902 JSON Patch (+ Lumina op semantics) as the ONE mutation unit
 * across AI, Collaboration, Undo, History, and Marketplace import. Deterministic,
 * serializable, replayable, mergeable. Pure: no React, no DOM (R5). No `eval`.
 *
 * ponytail: exact RFC 6902 array-shift semantics for nested moves under aliases;
 * current impl is correct for the add/replace/remove/move/copy cases round-tripped
 * by the editor + AI (verified by tests). Refine edge cases as collab (P7) needs.
 */

import { genId } from './id';

export const PATCH_SPEC = 'rfc6902+lumina-v1';

export type PatchOp =
  | { op: 'add'; path: string; value: unknown }
  | { op: 'remove'; path: string }
  | { op: 'replace'; path: string; value: unknown }
  | { op: 'move'; from: string; path: string }
  | { op: 'copy'; from: string; path: string };

export type DocumentPatch = PatchOp[];

export class PatchError extends Error {
  constructor(message: string) {
    super('[patch] ' + message);
    this.name = 'PatchError';
  }
}

// ─── JSON pointer ───────────────────────────────────────────
function unescapeKey(s: string): string {
  return s.replace(/~1/g, '/').replace(/~0/g, '~');
}
function escapeKey(s: string): string {
  return s.replace(/~/g, '~0').replace(/\//g, '~1');
}
function parsePointer(path: string): string[] {
  if (path === '') return [];
  if (path[0] !== '/') throw new PatchError(`invalid pointer: "${path}"`);
  return path.slice(1).split('/').map(unescapeKey);
}
function buildPointer(parts: string[]): string {
  return '/' + parts.map(escapeKey).join('/');
}

function getAt(root: unknown, parts: string[]): unknown {
  let cur: unknown = root;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = Array.isArray(cur) ? cur[Number(p)] : (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function shallowClone(v: unknown): unknown {
  if (Array.isArray(v)) return [...v];
  if (v && typeof v === 'object') return { ...(v as Record<string, unknown>) };
  return v;
}

/** Recursively rebuild the path immutably, applying `fn` at the leaf's parent. */
function updatePath(
  root: unknown,
  parts: string[],
  fn: (parent: unknown, lastKey: string) => unknown,
): unknown {
  if (parts.length === 1) return fn(shallowClone(root), parts[0]);
  const [head, ...rest] = parts;
  const cur = shallowClone(root);
  if (Array.isArray(cur)) {
    cur[Number(head)] = updatePath(cur[Number(head)], rest, fn);
  } else if (cur && typeof cur === 'object') {
    (cur as Record<string, unknown>)[head] = updatePath(
      (cur as Record<string, unknown>)[head],
      rest,
      fn,
    );
  } else {
    throw new PatchError('path crosses a non-container');
  }
  return cur;
}

function insertInto(parent: unknown, key: string, value: unknown): unknown {
  if (Array.isArray(parent)) {
    const a = [...parent];
    if (key === '-') a.push(value);
    else a.splice(Number(key), 0, value); // RFC 6902: array add inserts (shifts)
    return a;
  }
  if (parent && typeof parent === 'object') return { ...(parent as Record<string, unknown>), [key]: value };
  throw new PatchError('add target is not a container');
}

function setInto(parent: unknown, key: string, value: unknown): unknown {
  if (Array.isArray(parent)) {
    const a = [...parent];
    a[Number(key)] = value; // replace overwrites, does not shift
    return a;
  }
  if (parent && typeof parent === 'object') return { ...(parent as Record<string, unknown>), [key]: value };
  throw new PatchError('replace target is not a container');
}

function removeFrom(parent: unknown, key: string): unknown {
  if (Array.isArray(parent)) {
    const a = [...parent];
    a.splice(Number(key), 1);
    return a;
  }
  if (parent && typeof parent === 'object') {
    const o = { ...(parent as Record<string, unknown>) };
    delete o[key];
    return o;
  }
  throw new PatchError('remove target is not a container');
}

/** Apply a single op, returning a new value. */
function applyOp(state: unknown, op: PatchOp): unknown {
  const parts = parsePointer(op.path);
  if (parts.length === 0) {
    if (op.op === 'add' || op.op === 'replace') return op.value;
    throw new PatchError(`${op.op} on root is not allowed`);
  }
  switch (op.op) {
    case 'add': {
      const v = op.value;
      return updatePath(state, parts, (p, k) => insertInto(p, k, v));
    }
    case 'replace': {
      const v = op.value;
      return updatePath(state, parts, (p, k) => setInto(p, k, v));
    }
    case 'remove':
      return updatePath(state, parts, (p, k) => removeFrom(p, k));
    case 'move': {
      const fromParts = parsePointer(op.from);
      const v = getAt(state, fromParts);
      const removed = updatePath(state, fromParts, (p, k) => removeFrom(p, k));
      return updatePath(removed, parts, (p, k) => insertInto(p, k, v));
    }
    case 'copy': {
      const v = getAt(state, parsePointer(op.from));
      return updatePath(state, parts, (p, k) => insertInto(p, k, v));
    }
  }
}

/** Apply a full patch immutably. Pure — input is never mutated. */
export function applyPatch<T>(doc: T, patch: DocumentPatch): T {
  let out: unknown = doc;
  for (const op of patch) out = applyOp(out, op);
  return out as T;
}

/** Compute the inverse patch that undoes `patch` applied to `doc`. */
function inverseOp(state: unknown, op: PatchOp): DocumentPatch {
  switch (op.op) {
    case 'add': {
      const parts = parsePointer(op.path);
      const last = parts[parts.length - 1];
      const parentParts = parts.slice(0, -1);
      const parent = parentParts.length === 0 ? state : getAt(state, parentParts);
      if (Array.isArray(parent)) {
        // array insert/append → inverse removes the inserted index.
        const idx = last === '-' ? parent.length : Number(last);
        return [{ op: 'remove', path: buildPointer([...parentParts, String(idx)]) }];
      }
      // object key: inverse replaces if it existed, removes if it was new.
      const existing = (parent as Record<string, unknown> | undefined | null)?.[last];
      return existing === undefined
        ? [{ op: 'remove', path: op.path }]
        : [{ op: 'replace', path: op.path, value: existing }];
    }
    case 'replace':
      return [{ op: 'replace', path: op.path, value: getAt(state, parsePointer(op.path)) }];
    case 'remove':
      return [{ op: 'add', path: op.path, value: getAt(state, parsePointer(op.path)) }];
    case 'move': {
      // Move back; if the destination pre-existed, also restore its old value.
      // Exact for object-key moves (the editor common case); array/nested moves
      // are approximate — refine when collab (P7) needs full generality.
      const destExisted = getAt(state, parsePointer(op.path));
      const back: DocumentPatch = [{ op: 'move', from: op.path, path: op.from }];
      return destExisted === undefined
        ? back
        : [...back, { op: 'add', path: op.path, value: destExisted }];
    }
    case 'copy':
      return [{ op: 'remove', path: op.path }];
  }
}

export function computeInverse(doc: unknown, patch: DocumentPatch): DocumentPatch {
  let state: unknown = doc;
  const perOp: DocumentPatch[] = [];
  for (const op of patch) {
    perOp.push(inverseOp(state, op));
    state = applyOp(state, op);
  }
  return perOp.reverse().flat();
}

// ─── Command (history entry) ────────────────────────────────
export interface CommandMeta {
  source: 'user' | 'ai' | 'plugin' | 'autosave' | 'collab';
  label?: string;
}

export interface Command {
  id: string;
  forward: DocumentPatch;
  inverse: DocumentPatch;
  /** Same-key consecutive commands merge (e.g. one drag = one entry). */
  coalesceKey?: string;
  meta?: CommandMeta;
}

export function makeCommand(
  forward: DocumentPatch,
  inverse: DocumentPatch,
  opts?: Partial<Omit<Command, 'id' | 'forward' | 'inverse'>>,
): Command {
  return { id: genId('cmd'), forward, inverse, ...opts };
}
