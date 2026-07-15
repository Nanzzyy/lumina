import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'lumina_session';

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.has(AUTH_COOKIE);
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === '/' || pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/uploads')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  if ((pathname === '/api/rsvp' || pathname === '/api/wishes' || pathname === '/api/upload') || 
      (pathname.startsWith('/api/invitations') && req.method === 'GET') ||
      (pathname.startsWith('/api/layouts') && req.method === 'GET')) {
    return NextResponse.next();
  }

  const needsAuth = pathname.startsWith('/studio') || pathname.startsWith('/api/');

  if (needsAuth && !isAuthenticated(req)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}
