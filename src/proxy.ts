import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.LUMINA_JWT_SECRET || 'lumina-dev-secret-do-not-use-in-production';
const AUTH_COOKIE = 'lumina_session';

// ─── JWT ───────────────────────────────────────────────────
interface JwtPayload { sub: string; role: string; iat: number; exp?: number; }

function verifyToken(req: NextRequest): JwtPayload | null {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  try { return jwt.verify(token, JWT_SECRET) as JwtPayload; }
  catch { return null; }
}

// ─── Rate limiter (simple in-memory, per-session) ─────────
const RATE_LIMIT = 100; // requests per window
const RATE_WINDOW = 60_000; // 1 minute
const rateMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(req: NextRequest): boolean {
  const key = req.cookies.get(AUTH_COOKIE)?.value ?? (req as any).ip ?? 'anonymous';
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

// ─── CSP ──────────────────────────────────────────────────
// unsafe-eval only needed in dev (React devtools + Turbopack HMR).
// In production, CSP is stricter.
const IS_DEV = process.env.NODE_ENV !== 'production';
const SCRIPT_SRC = `'self' 'unsafe-inline'${IS_DEV ? " 'unsafe-eval'" : ''}`;
const CSP_VALUE = [
  "default-src 'self'",
  `script-src ${SCRIPT_SRC}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https: blob:",
  "font-src 'self' https://fonts.gstatic.com https:",
  "frame-src 'self' https:",
  "media-src 'self' https:",
  "connect-src 'self' https:",
  "object-src 'none'",
  "base-uri 'self'",
].join('; ');

function addSecurityHeaders(response: NextResponse, isPublished: boolean): void {
  if (isPublished) {
    response.headers.set('Content-Security-Policy', CSP_VALUE);
  }
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
}

// ─── Proxy ─────────────────────────────────────────────────
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublishedPage = pathname.startsWith('/') && !pathname.startsWith('/studio') && !pathname.startsWith('/_next') && !pathname.startsWith('/api/') && !pathname.startsWith('/uploads') && !pathname.startsWith('/login') && pathname !== '/favicon.ico';

  // Rate limiting (API routes)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth') && isRateLimited(req)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // Public paths
  if (
    pathname === '/' || pathname === '/login' ||
    pathname.startsWith('/_next') || pathname.startsWith('/uploads') ||
    pathname.startsWith('/api/auth') || pathname === '/api/health' || pathname === '/favicon.ico'
  ) {
    const response = NextResponse.next();
    addSecurityHeaders(response, isPublishedPage);
    return response;
  }

  // Public read-only API
  if (
    pathname === '/api/rsvp' || pathname === '/api/wishes' ||
    (pathname.startsWith('/api/invitations') && req.method === 'GET') ||
    (pathname.startsWith('/api/layouts') && req.method === 'GET') ||
    (pathname.startsWith('/api/widgets') && req.method === 'GET')
  ) {
    const response = NextResponse.next();
    addSecurityHeaders(response, false);
    return response;
  }

  // Protected: studio + API
  const needsAuth = pathname.startsWith('/studio') || pathname.startsWith('/api/');
  if (needsAuth) {
    const payload = verifyToken(req);
    if (!payload) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', req.url));
    }
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-lumina-user', payload.sub);
    requestHeaders.set('x-lumina-role', payload.role);
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    addSecurityHeaders(response, false);
    return response;
  }

  const response = NextResponse.next();
  addSecurityHeaders(response, isPublishedPage);
  return response;
}
