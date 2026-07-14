'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getAllTemplates } from '@/lib/template';
import { initializeRegistries } from '@/lib/registry';

initializeRegistries();

export default function TemplatesBrowser() {
  const router = useRouter();
  const templates = useMemo(() => getAllTemplates(), []);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[var(--typography-font-heading)] text-zinc-900">Templates</h1>
        <p className="text-sm text-zinc-500 mt-1">Color themes and visual styles for your invitations</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => router.push(`/studio/new?template=${t.id}`)}
            className="text-left bg-white rounded-xl border border-zinc-200 overflow-hidden hover:border-[var(--colors-primary)]/40 hover:shadow-md transition-all group"
          >
            <div
              className="h-40 flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${t.theme?.colors?.primary || '#db2777'}, ${t.theme?.colors?.secondary || '#7c3aed'})`,
              }}
            >
              <span className="text-white/90 text-3xl font-bold font-[var(--typography-font-heading)]">
                {t.name}
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-zinc-900 group-hover:text-[var(--colors-primary)] transition-colors">{t.name}</h3>
              <p className="text-sm text-zinc-500 mt-1">{t.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {['primary', 'secondary', 'accent', 'background', 'text'].map((key) => {
                  const colors = t.theme?.colors || {};
                  const color = (colors as Record<string, string>)[key];
                  return (
                    <div
                      key={key}
                      className="w-5 h-5 rounded-full border border-zinc-200"
                      style={{ backgroundColor: color || '#ccc' }}
                      title={key}
                    />
                  );
                })}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
