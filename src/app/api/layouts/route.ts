import { NextRequest, NextResponse } from 'next/server';
import { listLayouts, createLayout } from '@/lib/db';
import { createLayoutSchema } from '@/lib/validation';

export async function GET() {
  try {
    const list = listLayouts();
    return NextResponse.json(list.map((r: any) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      config: r.config,
      isBuiltin: !!r.is_builtin,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })));
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createLayoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }
    const { id, name, description, config, isBuiltin } = parsed.data;
    const result = createLayout({ id, name, description, config, isBuiltin });
    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
