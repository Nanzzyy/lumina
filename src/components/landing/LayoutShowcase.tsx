'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface LayoutItem {
  id: string;
  name: string;
  description: string;
  config?: { sections?: Array<{ type: string }> };
  sections?: Array<{ type: string }>;
}

export function LayoutShowcase() {
  const [layouts, setLayouts] = useState<LayoutItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/layouts')
      .then((r) => r.json())
      .then(setLayouts)
      .catch(() => {});
  }, []);

  return (
    <section className="py-20 sm:py-28 bg-zinc-50/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--colors-primary)]">Structures</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold font-[var(--typography-font-heading)] text-zinc-900">
            Choose Your Flow
          </h2>
          <p className="mt-3 text-zinc-500 max-w-xl mx-auto">
            Section arrangements for every style and culture — from classic wedding order to adat Bali.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {layouts.map((l) => {
            const secs = l.config?.sections || l.sections || [];
            return (
              <button
                key={l.id}
                onClick={() => router.push(`/studio/layouts/${l.id}`)}
                className="text-left bg-white rounded-xl border border-zinc-200 p-6 hover:border-[var(--colors-primary)]/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <h3 className="font-semibold text-zinc-900 group-hover:text-[var(--colors-primary)] transition-colors">
                  {l.name}
                </h3>
                <p className="text-sm text-zinc-500 mt-1 mb-4">{l.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {secs.map((s: { type: string }, i: number) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded-full capitalize">
                      {s.type}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
