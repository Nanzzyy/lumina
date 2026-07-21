import { NextRequest, NextResponse } from 'next/server';
import { getWidget, updateWidget, deleteWidget } from '@/lib/db';
import { updateWidgetSchema } from '@/lib/validation';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const widget = getWidget(id);
    if (!widget) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({
      id: widget.id,
      name: widget.name,
      description: widget.description,
      thumbnail: widget.thumbnail,
      category: widget.category,
      definition: widget.definition,
      isBuiltin: !!widget.is_builtin,
      createdAt: widget.created_at,
      updatedAt: widget.updated_at,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateWidgetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }
    const result = updateWidget(id, parsed.data);
    if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ok = deleteWidget(id);
    if (!ok) return NextResponse.json({ error: 'Not found or built-in' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
