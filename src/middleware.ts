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

export function middleware(req: NextRequest) {
  const response = NextResponse.next();

  const { pathname } = req.nextUrl;

  // CSP for published invitation pages
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

  // Override Next.js default s-maxage=31536000 on HTML pages
  response.headers.set('Cache-Control', 'public, no-cache, must-revalidate');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}
