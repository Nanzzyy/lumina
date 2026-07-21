/**
 * Session guard for trust-boundary API routes (DB writes). Verifies the
 * `lumina_session` JWT issued by /api/auth/login. Public read routes (/os/[slug])
 * do NOT use this — published invitations are world-readable.
 *
 * Must mirror the JWT_SECRET in the login route.
 */
import jwt from 'jsonwebtoken';
import type { NextRequest } from 'next/server';

const JWT_SECRET = process.env.LUMINA_JWT_SECRET || 'lumina-dev-secret-do-not-use-in-production';

export function verifySession(req: NextRequest): boolean {
  const token = req.cookies.get('lumina_session')?.value;
  if (!token) return false;
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}
