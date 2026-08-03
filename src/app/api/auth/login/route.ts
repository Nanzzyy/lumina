import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getJwtSecret, JWT_ALGORITHM } from '@/lib/auth';
import { rateLimit, clientIp } from '@/lib/rate-limit';

/** Length-independent constant-time string comparison. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

const JWT_EXPIRY = '24h';
const PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const PLAIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimit(`login:${ip}`, 10)) {
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
    valid = PLAIN_PASSWORD.length > 0 && safeEqual(password, PLAIN_PASSWORD);
  }
  if (!valid) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const token = jwt.sign(
    { sub: 'admin', role: 'owner', iat: Math.floor(Date.now() / 1000) },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRY, algorithm: JWT_ALGORITHM },
  );

  // Token is returned only as an httpOnly cookie — never in the body, where any
  // script or proxy log could capture it.
  const res = NextResponse.json({ success: true });
  res.cookies.set('lumina_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 86400,
  });
  return res;
}
