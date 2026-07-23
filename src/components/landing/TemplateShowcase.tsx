'use client';

import type { TemplateDefinition } from '@/lib/template/types';
import { useRouter } from 'next/navigation';

/** Signature [primary, secondary] gradients for monolithic templates (no theme.colors). */
const SIG: Record<string, [string, string]> = {
  'undangan-premium': ['#b76e79', '#e8c4c8'],
  'undangan-terracotta': ['#b5664a', '#d4a574'],
  'undangan-luxury': ['#c9a84c', '#1f3d2e'],
  'undangan-metatah-bali': ['#c8612e', '#d4af37'],
  'undangan-birthday-gala': ['#d4af37', '#1a1a2e'],
  'undangan-birthday-wish': ['#f472b6', '#fbcfe8'],
  'undangan-flora': ['#e8a0a0', '#f6c6c6'],
  hana: ['#c9a86a', '#f5efe0'],
  sakura: ['#e08898', '#f0c0c8'],
  kaze: ['#15171c', '#d14b3d'],
  liana: ['#243b2e', '#c66b4e'],
  sora: ['#0a1230', '#3fd8c9'],
  matahari: ['#ff6f61', '#f6b93b'],
  yuki: ['#9ec2dc', '#b8aedc'],
  pasir: ['#c17a4b', '#3fa9a0'],
  cinta: ['#5e1a2b', '#d4b26a'],
  bumi: ['#d98460', '#7a8450'],
  awan: ['#a5b4e0', '#b5dcc2'],
  ratu: ['#0f5132', '#c9a227'],
  laut: ['#0e5a5a', '#e8765a'],
  hutan: ['#16261a', '#e6a23c'],
};

function swatchColors(t: { id: string; theme?: { colors?: { primary?: string; secondary?: string } } }): [string, string] {
  if (SIG[t.id]) return SIG[t.id];
  const p = t.theme?.colors?.primary || '#db2777';
  const s = t.theme?.colors?.secondary || '#7c3aed';
  return [p, s];
}

const CAT_LABEL: Record<string, string> = {
  wedding: 'Wedding', event: 'Event', mobile: 'Premium', 'mobile-canvas': 'Builder',
};

export function TemplateShowcase({ templates }: { templates: TemplateDefinition[] }) {
  const router = useRouter();

  return (
    <section className="py-20 sm:py-28 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-50 to-white pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--colors-primary)]">Gallery</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold font-[var(--typography-font-heading)] text-zinc-900">
            {templates.length} Templates, Endless Character
          </h2>
          <p className="mt-3 text-zinc-500 max-w-xl mx-auto">
            Each template carries its own palette, typography, ornaments, and motion —
            from sumi-ink editorial to botanical sage and art-deco gold.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templates.map((t) => {
            const [a, b] = swatchColors(t);
            const cat = CAT_LABEL[t.category || ''] || 'Theme';
            return (
              <button
                key={t.id}
                onClick={() => router.push(`/studio/new?template=${t.id}`)}
                className="group text-left bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:border-[var(--colors-primary)]/40 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div
                  className="relative h-36 flex items-end p-4 overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${a} 0%, ${b} 100%)` }}
                >
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                  <span className="absolute top-3 right-3 text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/85 text-zinc-700 backdrop-blur">
                    {cat}
                  </span>
                  <span className="relative font-[var(--typography-font-heading)] text-white text-2xl font-semibold drop-shadow-sm tracking-tight">
                    {t.name}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 h-8">
                    {t.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--colors-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                    Use this template
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
