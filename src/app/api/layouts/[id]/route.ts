import { NextRequest, NextResponse } from 'next/server';
import { getLayout, updateLayout, deleteLayout } from '@/lib/db';
import { updateLayoutSchema } from '@/lib/validation';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const layout = getLayout(id);
    if (!layout) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(layout);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = updateLayoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }
    const { name, description, config } = parsed.data;
    const updated = updateLayout(id, { name, description, config });
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const deleted = deleteLayout(id);
    if (!deleted) return NextResponse.json({ error: 'Not found or built-in layout cannot be deleted' }, { status: 403 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
