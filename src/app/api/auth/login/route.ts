import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.LUMINA_JWT_SECRET || 'lumina-dev-secret-do-not-use-in-production';
const JWT_EXPIRY = '24h';
const PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const PLAIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function POST(req: NextRequest) {
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
    JWT_SECRET,
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
