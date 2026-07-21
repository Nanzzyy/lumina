/**
 * Document Schema Versioning — ADR-002.
 *
 * Every persisted object carries `schemaVersion`. Core owns a migrator registry
 * mapping vN → vN+1. Migrators are pure, idempotent, single-direction. Documents
 * are upgraded lazily on load (only when touched) and written back at SCHEMA_VERSION.
 * No down-migrators; forward-only. On unrecoverable input, throw MigrationError.
 */

export const SCHEMA_VERSION = 1;

export interface Versioned {
  schemaVersion: number;
}

/** A migrator transforms a document from version `from` to `from + 1`. */
export type Migrator = (doc: Record<string, unknown>) => Record<string, unknown>;

export class MigrationError extends Error {
  constructor(
    readonly from: number,
    readonly to: number,
  ) {
    super(`[version] No migrator registered for ${from} → ${to}`);
    this.name = 'MigrationError';
  }
}

const migrators = new Map<number, Migrator>();

/** Identity migrator for version 0 (unversioned) → baseline. Overridable by registering 0→1. */
const identityMigrator: Migrator = (doc) => doc;

/** Register a forward migrator from version `from` to `from + 1`. */
export function registerMigrator(from: number, m: Migrator): void {
  if (migrators.has(from)) throw new Error(`[version] Migrator ${from}→${from + 1} already registered`);
  migrators.set(from, m);
}

/**
 * Run the migrator chain from the document's `schemaVersion` up to `to` (default
 * SCHEMA_VERSION). Pure: returns a new object; never mutates input. If the input
 * lacks schemaVersion it is treated as version 0.
 */
export function migrate<T extends Record<string, unknown>>(doc: T, to = SCHEMA_VERSION): T & Versioned {
  let current = typeof doc.schemaVersion === 'number' ? doc.schemaVersion : 0;
  let out: Record<string, unknown> = { ...doc };
  while (current < to) {
    const m = migrators.get(current) ?? (current === 0 ? identityMigrator : undefined);
    if (!m) throw new MigrationError(current, current + 1);
    out = m(out);
    current += 1;
  }
  return { ...(out as T), schemaVersion: to };
}

/** True if the document is at the current schema version (no migration needed). */
export function isCurrent(doc: { schemaVersion?: number }): boolean {
  return (doc.schemaVersion ?? 0) >= SCHEMA_VERSION;
}
