import { NextRequest, NextResponse } from 'next/server';
import { listWidgets, createWidget } from '@/lib/db';
import { createWidgetSchema } from '@/lib/validation';
import { verifySession, unauthorized } from '@/lib/auth';
import { logError } from '@/lib/log';

export async function GET() {
  try {
    const list = listWidgets();
    return NextResponse.json(list.map((r: any) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      thumbnail: r.thumbnail,
      category: r.category,
      definition: r.definition,
      isBuiltin: !!r.is_builtin,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })));
  } catch (e) {
    logError('GET /api/widgets', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!verifySession(req)) return unauthorized();
  try {
    const body = await req.json();
    const parsed = createWidgetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }
    const { id, name, description, thumbnail, category, definition } = parsed.data;
    const result = createWidget({ id, name, description, thumbnail, category, definition });
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    logError('POST /api/widgets', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
