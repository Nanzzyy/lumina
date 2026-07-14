import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public/uploads');

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, name), buffer);

    return NextResponse.json({ url: `/uploads/${name}` });
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
