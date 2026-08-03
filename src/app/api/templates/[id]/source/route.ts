import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifySession, unauthorized } from '@/lib/auth';

const templateSourceMap: Record<string, string> = {
  'undangan-flora': 'src/templates/premium/UndanganPernikahanFlora.tsx',
};

// Auth-gated: returns application source code, for studio use only.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifySession(req)) return unauthorized();
  try {
    const { id } = await params;
    const rel = templateSourceMap[id];
    if (!rel) {
      return NextResponse.json({ error: 'Template source not available' }, { status: 404 });
    }
    const abs = path.join(process.cwd(), rel);
    const source = fs.readFileSync(abs, 'utf-8');
    return NextResponse.json({ id, source, filename: path.basename(rel) });
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
