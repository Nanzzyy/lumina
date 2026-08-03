import { describe, it, expect, afterEach, vi } from 'vitest';
import type { NextRequest } from 'next/server';
import { rateLimit, clientIp } from './rate-limit';

// The bucket map is module-level state; each test uses a distinct key.
let keySeq = 0;
const nextKey = () => `key-${keySeq++}`;

const reqWith = (xff?: string): NextRequest =>
  ({ headers: new Headers(xff === undefined ? {} : { 'x-forwarded-for': xff }) }) as NextRequest;

describe('rateLimit', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows the first call and everything up to max', () => {
    const key = nextKey();
    expect(rateLimit(key, 3)).toBe(false);
    expect(rateLimit(key, 3)).toBe(false);
    expect(rateLimit(key, 3)).toBe(false);
  });

  it('blocks once the count exceeds max inside the window', () => {
    const key = nextKey();
    expect(rateLimit(key, 2)).toBe(false);
    expect(rateLimit(key, 2)).toBe(false);
    expect(rateLimit(key, 2)).toBe(true);
    expect(rateLimit(key, 2)).toBe(true);
  });

  it('tracks keys independently', () => {
    const a = nextKey();
    const b = nextKey();
    expect(rateLimit(a, 1)).toBe(false);
    expect(rateLimit(a, 1)).toBe(true);
    expect(rateLimit(b, 1)).toBe(false);
  });

  it('resets the counter after the window elapses', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-01-01T00:00:00Z'));
    const key = nextKey();
    expect(rateLimit(key, 1, 1_000)).toBe(false);
    expect(rateLimit(key, 1, 1_000)).toBe(true);

    vi.advanceTimersByTime(1_001);
    expect(rateLimit(key, 1, 1_000)).toBe(false);
  });

  it('keeps blocking while still inside the window', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-01-01T00:00:00Z'));
    const key = nextKey();
    expect(rateLimit(key, 1, 10_000)).toBe(false);
    vi.advanceTimersByTime(9_000);
    expect(rateLimit(key, 1, 10_000)).toBe(true);
  });
});

describe('clientIp', () => {
  it('returns the first hop of x-forwarded-for', () => {
    expect(clientIp(reqWith('1.2.3.4, 5.6.7.8'))).toBe('1.2.3.4');
  });

  it('trims whitespace around the hop', () => {
    expect(clientIp(reqWith('  9.9.9.9  '))).toBe('9.9.9.9');
  });

  it('falls back to "unknown" when the header is missing or empty', () => {
    expect(clientIp(reqWith())).toBe('unknown');
    expect(clientIp(reqWith(''))).toBe('unknown');
  });
});
