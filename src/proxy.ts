import { NextRequest, NextResponse } from 'next/server';

const IS_DEV = process.env.NODE_ENV !== 'production';
const SCRIPT_SRC = `'self' 'unsafe-inline'${IS_DEV ? " 'unsafe-eval'" : ''}`;
const CSP_VALUE = [
  "default-src 'self'",
  `script-src ${SCRIPT_SRC} https://static.cloudflareinsights.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https: blob:",
  "font-src 'self' https://fonts.gstatic.com https:",
  "frame-src 'self' https:",
  "media-src 'self' https:",
  "connect-src 'self' https:",
  "object-src 'none'",
  "base-uri 'self'",
].join('; ');

/**
 * Edge proxy (Next 16 rename of `middleware`). Two jobs:
 *  1. Auth-gate `/studio/*` — redirect to /login if no session cookie. Signed
 *     JWT verification happens at the API write layer (verifySession); the proxy
 *     closes the open-access hole to the studio UI itself. Runs on Edge (no
 *     jsonwebtoken import) so it stays fast and runtime-stable.
 *  2. CSP + security headers for published pages.
 */
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (pathname.startsWith('/studio')) {
    const session = req.cookies.get('lumina_session')?.value;
    if (!session) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.search = `?redirect=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();

  const isPublishedPage =
    pathname.startsWith('/') &&
    !pathname.startsWith('/studio') &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/uploads') &&
    !pathname.startsWith('/login') &&
    pathname !== '/favicon.ico';

  if (isPublishedPage) {
    response.headers.set('Content-Security-Policy', CSP_VALUE);
  }

  response.headers.set('Cache-Control', 'public, no-cache, must-revalidate');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}
