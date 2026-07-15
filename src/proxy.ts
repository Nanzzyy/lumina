import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'lumina_session';

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.has(AUTH_COOKIE);
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public pages
  if (pathname === '/' || pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/uploads')) {
    return NextResponse.next();
  }

  // Public API
  if (pathname.startsWith('/api/rsvp') || pathname.startsWith('/api/wishes') || pathname.startsWith('/api/upload') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Public GET for invitations, layouts, RSVPs, wishes data
  if ((pathname.startsWith('/api/invitations') || pathname.startsWith('/api/layouts')) && req.method === 'GET') {
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
