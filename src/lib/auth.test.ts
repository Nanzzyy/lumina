import { describe, it, expect, afterEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { getJwtSecret, verifySession, unauthorized } from './auth';

const DEV_FALLBACK = 'lumina-dev-secret-do-not-use-in-production';

const reqWithCookie = (value?: string): NextRequest =>
  new NextRequest('http://localhost/api/layouts', {
    headers: value === undefined ? {} : { cookie: `lumina_session=${value}` },
  });

describe('getJwtSecret', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns the configured secret when set', () => {
    vi.stubEnv('LUMINA_JWT_SECRET', 'configured-secret');
    expect(getJwtSecret()).toBe('configured-secret');
  });

  it('falls back to the dev constant outside production', () => {
    vi.stubEnv('LUMINA_JWT_SECRET', undefined);
    vi.stubEnv('NODE_ENV', 'development');
    expect(getJwtSecret()).toBe(DEV_FALLBACK);
  });

  it('fails closed in production when the secret is unset', () => {
    vi.stubEnv('LUMINA_JWT_SECRET', undefined);
    vi.stubEnv('NODE_ENV', 'production');
    expect(() => getJwtSecret()).toThrow(/LUMINA_JWT_SECRET must be set in production/);
  });

  it('uses the configured secret in production', () => {
    vi.stubEnv('LUMINA_JWT_SECRET', 'prod-secret');
    vi.stubEnv('NODE_ENV', 'production');
    expect(getJwtSecret()).toBe('prod-secret');
  });
});

describe('verifySession', () => {
  it('rejects a request without the session cookie', () => {
    expect(verifySession(reqWithCookie())).toBe(false);
  });

  it('accepts a token signed with the active secret', () => {
    const token = jwt.sign({ sub: 'admin' }, getJwtSecret());
    expect(verifySession(reqWithCookie(token))).toBe(true);
  });

  it('rejects a token signed with a different secret', () => {
    const token = jwt.sign({ sub: 'admin' }, 'some-other-secret');
    expect(verifySession(reqWithCookie(token))).toBe(false);
  });

  it('rejects an expired token', () => {
    const token = jwt.sign({ sub: 'admin' }, getJwtSecret(), { expiresIn: -10 });
    expect(verifySession(reqWithCookie(token))).toBe(false);
  });

  it('rejects a malformed token', () => {
    expect(verifySession(reqWithCookie('not-a-jwt'))).toBe(false);
  });
});

describe('unauthorized', () => {
  it('returns a 401 JSON response', async () => {
    const res = unauthorized();
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Unauthorized' });
  });
});
