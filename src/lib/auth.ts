/**
 * Session guard for trust-boundary API routes (DB writes). Verifies the
 * `lumina_session` JWT issued by /api/auth/login. Public read routes (/os/[slug])
 * do NOT use this — published invitations are world-readable.
 */
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * JWT secret — **fail-closed in production.** In dev a known constant is fine;
 * in production an unset `LUMINA_JWT_SECRET` is a hard error: never run with the
 * publicly-known fallback or every session token becomes forgeable.
 *
 * Shared by login (signs) and verifySession (verifies) so they cannot drift.
 */
export function getJwtSecret(): string {
  const secret = process.env.LUMINA_JWT_SECRET;
  if (process.env.NODE_ENV === 'production' && !secret) {
    throw new Error('LUMINA_JWT_SECRET must be set in production');
  }
  return secret || 'lumina-dev-secret-do-not-use-in-production';
}

/** Signing/verification algorithm — pinned so a token cannot pick its own. */
export const JWT_ALGORITHM = 'HS256' as const;

/** Verify a raw session token. Returns false for missing/expired/forged tokens. */
export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    jwt.verify(token, getJwtSecret(), { algorithms: [JWT_ALGORITHM] });
    return true;
  } catch {
    return false;
  }
}

export function verifySession(req: NextRequest): boolean {
  return verifySessionToken(req.cookies.get('lumina_session')?.value);
}

/** Standard 401 for trust-boundary routes whose verifySession check failed. */
export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
