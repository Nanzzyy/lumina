import { NextRequest, NextResponse } from 'next/server';
import { getInvitation, updateInvitation, deleteInvitation } from '@/lib/db';

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
    const { title, templateId, content, themeOverrides, published } = body;
    const updated = updateInvitation(slug, { title, templateId, content, themeOverrides, published });
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
