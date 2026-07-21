'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TreeLayoutBuilder } from '@/components/studio/canvas/TreeLayoutBuilder';
import type { LayoutNode } from '@/lib/layout/tree';

export default function WidgetEditorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [widget, setWidget] = useState<{ id: string; name: string; description: string; definition: LayoutNode; isBuiltin: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/widgets/${id}`)
      .then((r) => r.json())
      .then((w) => { if (w?.id) setWidget(w); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-zinc-500">Loading widget…</div>;
  if (!widget) return (
    <div className="p-8 text-center">
      <p className="text-zinc-500">Widget not found.</p>
      <button onClick={() => router.push('/studio/widgets')} className="mt-4 text-sm text-[var(--colors-primary)] hover:underline">Back to widgets</button>
    </div>
  );

  const handleSave = async (data: { name: string; description: string; nodes: LayoutNode[] }) => {
    if (saving) return;
    setSaving(true);
    try {
      await fetch(`/api/widgets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name || widget.name,
          description: data.description,
          definition: { ...widget.definition, children: data.nodes },
        }),
      });
      router.push('/studio/widgets');
    } catch {
      alert('Failed to save widget');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <button onClick={() => router.push('/studio/widgets')} className="text-sm text-zinc-400 hover:text-zinc-600 flex items-center gap-1 mb-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to widgets
          </button>
          <h1 className="text-2xl font-bold font-[var(--typography-font-heading)] text-zinc-900">
            Edit Widget: {widget.name}
            {widget.isBuiltin && <span className="ml-2 text-[10px] px-2 py-0.5 bg-zinc-100 text-zinc-400 rounded-full align-middle">Built-in</span>}
          </h1>
        </div>
        <p className="text-xs text-zinc-400">{saving ? 'Saving…' : 'Define slot composition — dipakai ulang ke layout mana pun'}</p>
      </div>

      <TreeLayoutBuilder
        initialNodes={widget.definition.children ?? []}
        initialName={widget.name}
        initialDescription={widget.description}
        onSave={handleSave}
      />
    </div>
  );
}
