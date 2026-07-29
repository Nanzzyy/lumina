import { NextRequest, NextResponse } from 'next/server';
import { createRSVP, listRSVPs } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/rate-limit';

const VALID_STATUSES = ['hadir', 'tidak_hadir', 'ragu'];

export async function POST(req: NextRequest) {
  // Guest-facing → public, but rate-limited per IP to stop spam/flooding.
  if (rateLimit(`rsvp:${clientIp(req)}`, 20)) {
    return NextResponse.json({ error: 'Too many submissions. Please wait a moment.' }, { status: 429 });
  }
  try {
    const { slug, name, status, guests, message } = await req.json();
    if (!slug || !name) return NextResponse.json({ error: 'slug and name required' }, { status: 400 });
    const rsvp = createRSVP({
      slug,
      name: name.trim().slice(0, 100),
      status: VALID_STATUSES.includes(status) ? status : 'hadir',
      guests: Math.max(1, Math.min(Number(guests) || 1, 99)),
      message: (message || '').trim().slice(0, 500),
    });
    if (!rsvp) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(rsvp, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });
  try {
    const list = listRSVPs(slug);
    return NextResponse.json(list);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
