/**
 * Minimal structured server-side error logging.
 *
 * Central place so that errors caught at API/route boundaries are recorded
 * instead of being silently discarded. Keeping it here also gives a single
 * hook to later swap in a real observability backend.
 */
export function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}

/** Log an error against a named scope (e.g. `GET /api/rsvp`). */
export function logError(scope: string, value: unknown): void {
  const err = toError(value);
  console.error(`[${scope}] ${err.message}`, err.stack ?? err);
}

/** Log a non-fatal problem that was recovered from (e.g. a fallback path). */
export function logWarning(scope: string, value: unknown): void {
  const err = toError(value);
  console.warn(`[${scope}] ${err.message}`);
}
