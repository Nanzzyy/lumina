import { NextRequest, NextResponse } from 'next/server';
import { getInvitation, updateInvitation, deleteInvitation } from '@/lib/db';
import { updateInvitationSchema } from '@/lib/validation';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const inv = getInvitation(slug);
    if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(inv);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
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
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    deleteInvitation(slug);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
