import { NextRequest, NextResponse } from 'next/server';
import { listInvitations, createInvitation } from '@/lib/db';
import { createInvitationSchema } from '@/lib/validation';
import { verifySession, unauthorized } from '@/lib/auth';
import { logError, toError } from '@/lib/log';

export async function GET(req: NextRequest) {
  if (!verifySession(req)) return unauthorized();
  try {
    const list = listInvitations();
    return NextResponse.json(list.map((r: any) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      templateId: r.template_id,
      layoutId: r.layout_id,
      content: JSON.parse(r.content),
      themeOverrides: JSON.parse(r.theme_overrides),
      published: !!r.published,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })));
  } catch (e) {
    logError('GET /api/invitations', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!verifySession(req)) return unauthorized();
  try {
    const body = await req.json();
    const parsed = createInvitationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }
    const { slug, title, templateId, layoutId, content, themeOverrides, published } = parsed.data;
    const result = createInvitation({ slug, title: title || slug, templateId, layoutId, content, themeOverrides, published });
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    if (toError(e).message.includes('UNIQUE')) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }
    logError('POST /api/invitations', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
