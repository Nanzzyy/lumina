'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Reveal } from './Reveal';

interface LayoutItem {
  id: string;
  name: string;
  description: string;
  config?: { sections?: Array<{ type: string }> };
  sections?: Array<{ type: string }>;
}

export function LayoutShowcase() {
  const [layouts, setLayouts] = useState<LayoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/layouts')
      .then((r) => r.json())
      .then((data) => {
        setLayouts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">Structures</span>
          <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            Choose <span className="italic text-amber-600">Your Flow</span>
          </h2>
          <p className="mt-4 text-stone-500">
            Section arrangements crafted for every style and culture.
          </p>
        </Reveal>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl bg-stone-100" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {layouts.map((l, i) => {
              const secs = l.config?.sections || l.sections || [];
              return (
                <Reveal key={l.id} delay={(i % 3) * 0.08}>
                  <button
                    onClick={() => router.push(`/studio/layouts/${l.id}`)}
                    className="block h-full w-full cursor-pointer rounded-2xl border border-stone-200 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg"
                  >
                    <h3 className="font-serif text-lg font-semibold text-stone-900">{l.name}</h3>
                    <p className="mb-4 mt-1 text-sm text-stone-500">{l.description || 'No description'}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {secs.length > 0 ? (
                        secs.map((s: { type: string }, j: number) => (
                          <span
                            key={j}
                            className="rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[10px] capitalize text-stone-500"
                          >
                            {s.type}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs italic text-stone-400">Flexible layout</span>
                      )}
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
