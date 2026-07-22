import { NextRequest, NextResponse } from 'next/server';
import { storeAsset } from '@/lib/assets';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
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
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
