import { NextRequest, NextResponse } from 'next/server';
import { listInvitations, createInvitation } from '@/lib/db';

export async function GET() {
  try {
    const list = listInvitations();
    return NextResponse.json(list.map((r: any) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      templateId: r.template_id,
      content: JSON.parse(r.content),
      themeOverrides: JSON.parse(r.theme_overrides),
      published: !!r.published,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })));
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, title, templateId, content, themeOverrides, published } = body;
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });
    const result = createInvitation({ slug, title: title || slug, templateId: templateId || 'aurora', content: content || {}, themeOverrides, published });
    return NextResponse.json(result, { status: 201 });
  } catch (e: any) {
    if (e?.message?.includes('UNIQUE')) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
