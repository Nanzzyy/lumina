/**
 * Core id generator (ADR-011 R2: Core must not import the DB layer, so this is
 * independent of the cuid() that lives in src/lib/db.ts).
 * Monotonic-ish: timestamp + in-process counter + randomness. Pure, no DOM.
 */
let counter = 0;
export function genId(prefix = 'id'): string {
  counter = (counter + 1) % 1_000_000_000;
  const t = Date.now().toString(36);
  const c = counter.toString(36);
  const r = Math.random().toString(36).slice(2, 6);
  return `${prefix}_${t}${c}${r}`;
}
