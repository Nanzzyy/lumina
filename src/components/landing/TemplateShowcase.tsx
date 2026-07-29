'use client';

import type { TemplateDefinition } from '@/lib/template/types';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Reveal } from './Reveal';

const SWATCH_COLORS: Record<string, [string, string]> = {
  'undangan-premium': ['#b76e79', '#e8c4c8'],
  'undangan-terracotta': ['#b5664a', '#d4a574'],
  'undangan-luxury': ['#c9a84c', '#1f3d2e'],
  'undangan-metatah-bali': ['#c8612e', '#d4af37'],
  'undangan-birthday-gala': ['#d4af37', '#1a1a2e'],
  'undangan-birthday-wish': ['#f472b6', '#fbcfe8'],
  'undangan-flora': ['#e8a0a0', '#f6c6c6'],
};

function getSwatch(t: { id: string; theme?: { colors?: Record<string, string> } }): [string, string] {
  if (SWATCH_COLORS[t.id]) return SWATCH_COLORS[t.id];
  return [t.theme?.colors?.primary || '#c0765a', t.theme?.colors?.secondary || '#5a7d6c'];
}

const CAT_LABEL: Record<string, string> = { wedding: 'Wedding', event: 'Event', mobile: 'Premium' };

export function TemplateShowcase({ templates }: { templates: TemplateDefinition[] }) {
  const router = useRouter();
  const items = useMemo(() => templates.filter((t) => t.id !== 'mobile-canvas'), [templates]);

  return (
    <section className="bg-stone-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">Gallery</span>
          <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            {items.length} Templates,{' '}
            <span className="italic text-amber-600">Endless Character</span>
          </h2>
          <p className="mt-4 text-stone-500">
            Every template has its own soul — from minimalist editorial to art-deco gold and botanical warmth.
          </p>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((t, i) => {
            const [a, b] = getSwatch(t);
            const cat = CAT_LABEL[t.category || ''] || 'Theme';
            return (
              <Reveal key={t.id} delay={(i % 4) * 0.07}>
                <button
                  onClick={() => router.push(`/studio/new?template=${t.id}`)}
                  className="group block h-full w-full cursor-pointer overflow-hidden rounded-2xl border border-stone-200 bg-white text-left transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg"
                >
                  <div
                    className="relative flex h-48 items-end overflow-hidden p-5"
                    style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                    <span className="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-stone-700">
                      {cat}
                    </span>
                    <span className="relative z-10 font-serif text-2xl font-semibold tracking-tight text-white">
                      {t.name}
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="line-clamp-2 text-sm leading-relaxed text-stone-500">
                      {t.description}
                    </p>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
