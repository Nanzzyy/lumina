'use client';

import { getAllTemplates } from '@/lib/template';
import { useRouter } from 'next/navigation';

export function TemplateShowcase() {
  const templates = getAllTemplates();
  const router = useRouter();

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold font-[var(--typography-font-heading)] text-zinc-900">Templates</h2>
          <p className="mt-3 text-zinc-500">Choose from 10 carefully crafted color themes</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => router.push(`/studio/new?template=${t.id}`)}
              className="text-left bg-white rounded-xl border border-zinc-200 p-5 hover:border-[var(--colors-primary)]/40 hover:shadow-md transition-all group"
            >
              <div
                className="h-24 rounded-lg mb-4 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${t.theme?.colors?.primary || '#db2777'}, ${t.theme?.colors?.secondary || '#7c3aed'})`,
                }}
              >
                <span className="text-white/90 text-lg font-bold font-[var(--typography-font-heading)]">
                  {t.name}
                </span>
              </div>
              <h3 className="font-semibold text-zinc-900 group-hover:text-[var(--colors-primary)] transition-colors">
                {t.name}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">{t.description}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
