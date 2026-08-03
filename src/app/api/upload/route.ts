import { NextRequest, NextResponse } from 'next/server';
import { storeAsset } from '@/lib/assets';
import { verifySession, unauthorized } from '@/lib/auth';
import { logError } from '@/lib/log';

// SVG excluded: served verbatim from /uploads with no CSP → embedded <script> = stored XSS.
// ponytail: re-enable via a sanitizing proxy (DOMPurify) if SVG upload is ever needed.
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  if (!verifySession(req)) return unauthorized();
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 413 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 415 });
    }

    if (file.type && !ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 415 });
    }

    // ADR-009: content-addressed storage + DB index (dedup by sha256, immutable path).
    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await storeAsset(buffer, {
      ext,
      mime: file.type || 'application/octet-stream',
      bytes: file.size,
    });

    return NextResponse.json({
      url: stored.url,
      id: stored.id,
      hash: stored.hash,
      duplicated: stored.duplicated,
    });
  } catch (e) {
    logError('POST /api/upload', e);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
