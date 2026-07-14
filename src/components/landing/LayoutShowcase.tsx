'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function LayoutShowcase() {
  const [layouts, setLayouts] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/layouts')
      .then((r) => r.json())
      .then(setLayouts)
      .catch(() => {});
  }, []);

  return (
    <section className="py-16 sm:py-20 bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold font-[var(--typography-font-heading)] text-zinc-900">Layouts</h2>
          <p className="mt-3 text-zinc-500">Section arrangements for every style and culture</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {layouts.map((l) => (
            <button
              key={l.id}
              onClick={() => router.push(`/studio/layouts/${l.id}`)}
              className="text-left bg-white rounded-xl border border-zinc-200 p-6 hover:border-[var(--colors-primary)]/40 hover:shadow-md transition-all group"
            >
              <h3 className="font-semibold text-zinc-900 group-hover:text-[var(--colors-primary)] transition-colors">
                {l.name}
              </h3>
              <p className="text-sm text-zinc-500 mt-1 mb-4">{l.description}</p>
              <div className="flex flex-wrap gap-1">
                {(l.config?.sections || l.sections || []).map((s: any, i: number) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded-full">
                    {s.type}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
