'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface WidgetItem {
  id: string;
  name: string;
  description: string;
  category: string;
  isBuiltin: boolean;
}

export default function WidgetsBrowser() {
  const router = useRouter();
  const [widgets, setWidgets] = useState<WidgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const refresh = () => {
    fetch('/api/widgets').then((r) => r.json()).then(setWidgets).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const createWidget = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const res = await fetch('/api/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Widget',
          description: 'Composite widget definition',
          category: 'section',
          definition: { kind: 'composite', type: 'custom', placement: { x: 0, y: 0, w: 12, h: 5 }, children: [] },
        }),
      });
      const w = await res.json();
      if (w?.id) router.push(`/studio/widgets/${w.id}`);
    } catch {
      alert('Failed to create widget');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-[var(--typography-font-heading)] text-zinc-900">Widget Library</h1>
          <p className="text-sm text-zinc-500 mt-1">Komponen reusable — dipanggil & dipasang ke layout mana pun</p>
        </div>
        <button
          onClick={createWidget}
          disabled={creating}
          className="px-4 py-2 bg-[var(--colors-primary)] text-white text-sm rounded-lg hover:bg-[var(--colors-primary-hover)] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Widget
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-400">Loading widgets…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {widgets.map((w) => (
            <button
              key={w.id}
              onClick={() => router.push(`/studio/widgets/${w.id}`)}
              className="text-left bg-white rounded-xl border border-zinc-200 p-5 hover:border-[var(--colors-primary)]/40 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-zinc-900">{w.name}</h3>
                {w.isBuiltin && <span className="text-[10px] px-2 py-0.5 bg-zinc-100 text-zinc-400 rounded-full">Built-in</span>}
              </div>
              <p className="text-xs text-zinc-500 line-clamp-2">{w.description}</p>
              <span className="inline-block mt-3 text-[10px] px-2 py-0.5 bg-[var(--colors-primary-light)] text-[var(--colors-primary)] rounded-full capitalize">{w.category}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
