import { NextRequest, NextResponse } from 'next/server';
import { saveDocument, loadDocumentBySlug } from '@/lib/db';
import { verifySession } from '@/lib/auth';
import type { Document } from '@/lib/core/document';

export const dynamic = 'force-dynamic';

// Public read: world-readable published document (feeds /os/[slug]).
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = loadDocumentBySlug(slug);
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(doc);
}

// Auth-gated write: editor Publish persists the Document (DB write = trust boundary).
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!verifySession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { slug } = await params;
  const doc = (await req.json()) as Document;
  if (doc.project.slug !== slug) {
    return NextResponse.json({ error: 'slug mismatch' }, { status: 400 });
  }
  try {
    saveDocument(doc);
    return NextResponse.json({ success: true, slug });
  } catch {
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}
