import type { NextRequest } from 'next/server';

/**
 * In-memory fixed-window rate limiter. Single-instance — fine for the current
 * deployment; move to Redis when multi-node. Returns true when `key` has exceeded
 * `max` actions inside `windowMs`.
 */
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, max: number, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now > entry.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > max;
}

/** Best-effort client IP from x-forwarded-for (first hop). */
export function clientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}
