'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initializeRegistries } from '@/lib/registry';

initializeRegistries();

interface LayoutItem {
  id: string;
  name: string;
  description: string;
  config: {
    engine?: 'legacy' | 'tree';
    sections: { id: string; type: string; variant?: string; hidden?: boolean }[];
    containers: { id: string; type: string; columns?: number }[];
    nodes?: { id: string; kind?: string; type?: string; hidden?: boolean }[];
    animation?: { preset: string };
  };
  isBuiltin: boolean;
}

export default function LayoutsBrowser() {
  const router = useRouter();
  const [layouts, setLayouts] = useState<LayoutItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/layouts')
      .then((r) => r.json())
      .then(setLayouts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-[var(--typography-font-heading)] text-zinc-900">Layouts</h1>
          <p className="text-sm text-zinc-500 mt-1">Section arrangements and flow structures</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/studio/layouts/new')}
            className="px-4 py-2 bg-[var(--colors-primary)] text-white text-sm rounded-lg hover:bg-[var(--colors-primary-hover)] transition-colors shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Layout
          </button>
          <button
            onClick={() => router.push('/studio/layouts/new?engine=legacy')}
            className="px-4 py-2 bg-white text-zinc-700 text-sm rounded-lg hover:bg-zinc-50 border border-zinc-200 transition-colors"
          >
            Legacy Builder
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-400">Loading layouts...</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {layouts.map((l) => {
            const isTree = l.config.engine === 'tree' || (l.config.nodes && l.config.nodes.length > 0);
            const items = isTree ? (l.config.nodes ?? []) : l.config.sections;
            return (
              <button
                key={l.id}
                onClick={() => router.push(`/studio/layouts/new?edit=${l.id}${isTree ? '&engine=tree' : ''}`)}
                className="text-left bg-white rounded-xl border border-zinc-200 p-6 hover:border-[var(--colors-primary)]/40 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-zinc-900 group-hover:text-[var(--colors-primary)] transition-colors">
                    {l.name}
                  </h3>
                  <div className="flex gap-1">
                    {isTree && <span className="text-[10px] px-2 py-0.5 bg-[var(--colors-primary-light)] text-[var(--colors-primary)] rounded-full">canvas</span>}
                    {l.isBuiltin && <span className="text-[10px] px-2 py-0.5 bg-zinc-100 text-zinc-400 rounded-full">Built-in</span>}
                  </div>
                </div>
                <p className="text-sm text-zinc-500 mb-4">{l.description}</p>
                <div className="flex flex-col gap-1.5">
                  {items.slice(0, 8).map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--colors-primary)]/60 flex-shrink-0" />
                      <span className="text-zinc-500 capitalize">{s.type}</span>
                      {!isTree && l.config.containers[i] && (
                        <span className="text-zinc-300 text-[10px] ml-auto">{l.config.containers[i].type}</span>
                      )}
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
