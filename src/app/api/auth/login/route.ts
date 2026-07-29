import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '@/lib/auth';

const JWT_EXPIRY = '24h';
const PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const PLAIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

// ─── Login rate limit (per-IP, in-memory) ──────────────────────────
// Single-instance limiter. ponytail: move to Redis/shared store when multi-node.
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 10;
const attempts = new Map<string, { count: number; reset: number }>();

function clientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.reset) {
    attempts.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  // Fail-closed: in production an admin password must be configured.
  if (process.env.NODE_ENV === 'production' && !PASSWORD_HASH && !PLAIN_PASSWORD) {
    return NextResponse.json({ error: 'Admin credentials not configured' }, { status: 500 });
  }

  const { password } = await req.json();
  if (!password || typeof password !== 'string') {
    return NextResponse.json({ error: 'Password required' }, { status: 400 });
  }

  let valid = false;
  if (PASSWORD_HASH) {
    valid = await bcrypt.compare(password, PASSWORD_HASH);
  } else {
    valid = password === PLAIN_PASSWORD;
  }
  if (!valid) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const token = jwt.sign(
    { sub: 'admin', role: 'owner', iat: Math.floor(Date.now() / 1000) },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRY },
  );

  const res = NextResponse.json({ success: true, token });
  res.cookies.set('lumina_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 86400,
  });
  return res;
}
