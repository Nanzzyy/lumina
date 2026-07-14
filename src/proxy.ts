import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'lumina_admin_token';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'lumina-studio-2026';

function isAuthenticated(req: NextRequest): boolean {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  return token === ADMIN_PASSWORD;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public pages
  if (pathname === '/' || pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/uploads')) {
    return NextResponse.next();
  }

  // Public API
  if (pathname.startsWith('/api/rsvp') || pathname.startsWith('/api/wishes') || pathname.startsWith('/api/upload')) {
    return NextResponse.next();
  }

  // Public GET for invitations data
  if (pathname.startsWith('/api/invitations') && req.method === 'GET') {
    return NextResponse.next();
  }

  // Protected: /studio and mutation APIs
  const needsAuth = pathname.startsWith('/studio') || 
    (pathname.startsWith('/api/') && req.method !== 'GET');

  if (needsAuth && !isAuthenticated(req)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads).*)'],
};
