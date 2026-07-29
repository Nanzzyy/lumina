import { NextRequest, NextResponse } from 'next/server';
import { publishInvitation, unpublishInvitation } from '@/lib/db';
import { verifySession, unauthorized } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!verifySession(req)) return unauthorized();
  const { slug } = await params;
  try {
    const result = publishInvitation(slug);
    if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!verifySession(req)) return unauthorized();
  const { slug } = await params;
  try {
    const result = unpublishInvitation(slug);
    if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
