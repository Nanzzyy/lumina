'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function LayoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [layout, setLayout] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/layouts/${id}`)
      .then((r) => r.json())
      .then(setLayout)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-zinc-500">Loading...</div>;
  if (!layout) return (
    <div className="p-8 text-center">
      <p className="text-zinc-500">Layout not found.</p>
      <button onClick={() => router.push('/studio/layouts')} className="mt-4 text-sm text-[var(--colors-primary)] hover:underline">Back to layouts</button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => router.push('/studio/layouts')} className="text-sm text-zinc-400 hover:text-zinc-600 flex items-center gap-1 mb-4">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to layouts
      </button>

      <h1 className="text-2xl font-bold font-[var(--typography-font-heading)] text-zinc-900 mb-2">{layout.name}</h1>
      <p className="text-sm text-zinc-500 mb-8">{layout.description}</p>

      {!layout.is_builtin && (
        <button
          onClick={() => router.push(`/studio/layouts/new?edit=${layout.id}${layout.config?.engine === 'tree' ? '&engine=tree' : ''}`)}
          className="px-4 py-2 bg-[var(--colors-primary)] text-white text-sm rounded-lg hover:bg-[var(--colors-primary-hover)] transition-colors mb-8"
        >
          Edit Layout
        </button>
      )}

      {layout.config?.mode && (
        <div className="mb-4">
          <span className="text-xs font-semibold px-2 py-1 bg-zinc-100 text-zinc-600 rounded">Mode: {layout.config.mode}</span>
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-xl divide-y divide-zinc-100">
        {(() => {
          const cfg = layout.config || {};
          const isTree = cfg.engine === 'tree' || (cfg.nodes && cfg.nodes.length > 0);
          const items = isTree ? (cfg.nodes || []) : (cfg.sections || []);
          return items.map((s: any, i: number) => (
            <div key={i} className="px-4 py-3 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--colors-primary-light)] text-[var(--colors-primary)] text-xs font-medium flex items-center justify-center">
                {i + 1}
              </span>
              <span className="text-sm text-zinc-700 capitalize flex-1">{s.type}</span>
              {!isTree && cfg.containers?.[i] && (
                <span className="text-[10px] text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                  {cfg.containers[i].type}
                </span>
              )}
              {isTree && s.placement && (
                <span className="text-[10px] text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full font-mono">
                  {s.placement.w}×{s.placement.h} ({s.placement.x},{s.placement.y})
                </span>
              )}
            </div>
          ));
        })()}
      </div>
    </div>
  );
}
