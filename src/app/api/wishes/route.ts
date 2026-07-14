import { NextRequest, NextResponse } from 'next/server';
import { createWish, listWishes } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { slug, name, message } = await req.json();
    if (!slug || !name || !message) {
      return NextResponse.json({ error: 'slug, name, and message required' }, { status: 400 });
    }
    const wish = createWish({
      slug,
      name: name.trim().slice(0, 100),
      message: message.trim().slice(0, 1000),
    });
    if (!wish) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(wish, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });
  try {
    const list = listWishes(slug);
    return NextResponse.json(list);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
