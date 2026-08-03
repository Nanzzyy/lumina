import fs from 'fs';
import path from 'path';
import { json, notFound, route } from '@/lib/api/respond';

const templateSourceMap: Record<string, string> = {
  'undangan-flora': 'src/templates/premium/UndanganPernikahanFlora.tsx',
};

export const GET = route<{ id: string }>(async (_req, { id }) => {
  const rel = templateSourceMap[id];
  if (!rel) throw notFound('Template source not available');
  const source = fs.readFileSync(path.join(process.cwd(), rel), 'utf-8');
  return json({ id, source, filename: path.basename(rel) });
});
