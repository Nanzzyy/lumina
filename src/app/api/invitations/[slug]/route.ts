import { NextRequest, NextResponse } from 'next/server';
import { getInvitation, updateInvitation, deleteInvitation } from '@/lib/db';
import { updateInvitationSchema } from '@/lib/validation';
import { verifySession, unauthorized } from '@/lib/auth';
import { logError } from '@/lib/log';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!verifySession(req)) return unauthorized();
  const { slug } = await params;
  try {
    const inv = getInvitation(slug);
    if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(inv);
  } catch (e) {
    logError(`GET /api/invitations/${slug}`, e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!verifySession(req)) return unauthorized();
  const { slug } = await params;
  try {
    const body = await req.json();
    const parsed = updateInvitationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }
    const { title, templateId, layoutId, content, themeOverrides, published } = parsed.data;
    const updated = updateInvitation(slug, { title, templateId, layoutId, content, themeOverrides, published });
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e) {
    logError(`PUT /api/invitations/${slug}`, e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!verifySession(req)) return unauthorized();
  const { slug } = await params;
  try {
    deleteInvitation(slug);
    return NextResponse.json({ ok: true });
  } catch (e) {
    logError(`DELETE /api/invitations/${slug}`, e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
