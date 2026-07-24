import { NextResponse } from 'next/server';
import { getAllTemplates } from '@/lib/template';
import { initializeRegistries } from '@/lib/registry';
import { loadExternalTemplates } from '@/lib/registry/server-init';

initializeRegistries();
loadExternalTemplates();

export async function GET() {
  const templates = getAllTemplates().map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    kind: t.kind || 'composed',
    category: t.category || 'wedding',
    mode: t.mode || 'couple',
    colors: t.theme?.colors
      ? {
          primary: (t.theme.colors as Record<string, string>).primary,
          secondary: (t.theme.colors as Record<string, string>).secondary,
          background: (t.theme.colors as Record<string, string>).background,
          text: (t.theme.colors as Record<string, string>).text,
        }
      : {},
  }));

  return NextResponse.json(templates);
}
