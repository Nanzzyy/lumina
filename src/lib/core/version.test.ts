import { describe, it, expect, beforeEach } from 'vitest';
import { migrate, isCurrent, SCHEMA_VERSION, MigrationError } from './version';

// Migrator registry is module-global; tests assume the default SCHEMA_VERSION=1
// with no migrators registered (forward-only chain length 0 at v1).
describe('version (ADR-002)', () => {
  beforeEach(() => {
    // SCHEMA_VERSION starts at 1; no migrators are registered by default.
  });

  it('tags a schemaless doc with the current version', () => {
    const out = migrate({ foo: 1 });
    expect(out.schemaVersion).toBe(SCHEMA_VERSION);
    expect(out.foo).toBe(1);
  });

  it('isCurrent detects versioned docs', () => {
    expect(isCurrent({ schemaVersion: SCHEMA_VERSION })).toBe(true);
    expect(isCurrent({})).toBe(false);
  });

  it('does not mutate the input', () => {
    const doc = { foo: 1 } as { foo: number; schemaVersion?: number };
    migrate(doc);
    expect(doc.schemaVersion).toBeUndefined();
  });

  it('throws MigrationError when a migrator is missing', () => {
    // Force a target beyond any registered migrator (none registered → 0→1 missing).
    expect(() => migrate({ schemaVersion: 0 }, 2)).toThrow(MigrationError);
  });
});
