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
        <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Templates</h1>
        <p className="text-sm text-zinc-400 mt-0.5">Color themes and visual styles for your invitations</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => {
          const colors = t.theme?.colors || {};
          const c1 = colors.primary || '#db2777';
          const c2 = colors.secondary || '#9333ea';
          return (
            <button
              key={t.id}
              onClick={() => router.push(`/studio/new?template=${t.id}`)}
              className="text-left bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_24px_-6px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-200 group"
            >
              {/* Cover — invitation-style */}
              <div
                className="h-44 relative flex flex-col items-center justify-center gap-2.5"
                style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
              >
                <span className="w-8 h-px bg-white/40" />
                <span className="font-[var(--typography-font-heading)] text-2xl text-white/95 tracking-wide text-center px-6">
                  {t.name}
                </span>
                <span className="w-8 h-px bg-white/40" />
                {t.category && (
                  <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/90 text-zinc-700 capitalize backdrop-blur-sm">
                    {t.category}
                  </span>
                )}
              </div>

              <div className="p-5">
                <p className="text-sm text-zinc-500 line-clamp-2 min-h-[2.5rem]">
                  {t.description || `Start from the ${t.name} theme.`}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {['primary', 'secondary', 'accent'].map((key) => (
                      <span
                        key={key}
                        className="w-4 h-4 rounded-full ring-1 ring-inset ring-black/5"
                        style={{ backgroundColor: (colors as Record<string, string>)[key] || '#e5e7eb' }}
                        title={key}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-zinc-400 group-hover:text-[var(--colors-primary)] transition-colors flex items-center gap-1">
                    Use template
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
