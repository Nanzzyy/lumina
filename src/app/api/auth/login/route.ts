import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!password || typeof password !== 'string') {
    return NextResponse.json({ error: 'Password required' }, { status: 400 });
  }

  if (!PASSWORD_HASH) {
    const plainPassword = process.env.ADMIN_PASSWORD || 'lumina-studio-2026';
    if (password !== plainPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
    const token = crypto.randomBytes(32).toString('hex');
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

  const valid = await bcrypt.compare(password, PASSWORD_HASH);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const token = crypto.randomBytes(32).toString('hex');
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
