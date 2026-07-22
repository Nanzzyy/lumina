'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutBuilder } from '@/components/studio/LayoutBuilder';
import { TreeLayoutBuilder } from '@/components/studio/canvas/TreeLayoutBuilder';
import { initializeRegistries } from '@/lib/registry';
import type { SectionConfig } from '@/lib/template/types';
import type { ContainerConfig } from '@/lib/layout/types';
import type { LayoutNode } from '@/lib/layout/tree';

initializeRegistries();

function LayoutBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  // Default to the tree (canvas) engine; legacy builder still reachable via ?engine=legacy.
  const engine = searchParams.get('engine') === 'legacy' ? 'legacy' : 'tree';

  const [saving, setSaving] = useState(false);
  const [initialSections, setInitialSections] = useState<SectionConfig[] | undefined>();
  const [initialContainers, setInitialContainers] = useState<ContainerConfig[] | undefined>();
  const [initialNodes, setInitialNodes] = useState<LayoutNode[] | undefined>();
  const [initialName, setInitialName] = useState('');
  const [initialDescription, setInitialDescription] = useState('');
  const [initialMode, setInitialMode] = useState<'basic' | 'advanced'>('basic');
  const [loadedEditId, setLoadedEditId] = useState<string | null>(null);
  const [widgets, setWidgets] = useState<{ id: string; name: string; thumbnail?: string; definition?: LayoutNode }[]>([]);

  useEffect(() => {
    fetch('/api/widgets').then((r) => r.json()).then(setWidgets).catch(() => {});
  }, []);

  useEffect(() => {
    if (editId && editId !== loadedEditId) {
      fetch(`/api/layouts/${editId}`)
        .then((r) => r.json())
        .then((layout) => {
          if (layout) {
            setInitialName(layout.name);
            setInitialDescription(layout.description);
            if (layout.config?.engine === 'tree' || layout.config?.nodes) {
              setInitialNodes(layout.config.nodes);
              setInitialMode(layout.config.mode || 'basic');
            } else {
              setInitialSections(layout.config.sections);
              setInitialContainers(layout.config.containers);
            }
            setLoadedEditId(editId);
          }
        })
        .catch(() => {});
    }
  }, [editId, loadedEditId]);

  const saveTree = async (data: { name: string; description: string; nodes: LayoutNode[]; animation?: { preset: string }; mode?: 'basic' | 'advanced' }) => {
    if (saving) return;
    setSaving(true);
    try {
      const body = { name: data.name || 'Custom Layout', description: data.description, config: { engine: 'tree', nodes: data.nodes, animation: data.animation, mode: data.mode } };
      await send(editId ? `/api/layouts/${editId}` : '/api/layouts', editId ? 'PUT' : 'POST', body);
      router.push('/studio/layouts');
    } catch {
      alert('Failed to save layout');
    } finally {
      setSaving(false);
    }
  };

  const saveLegacy = async (data: { name: string; description: string; sections: SectionConfig[]; containers: ContainerConfig[]; animation?: { preset: string } }) => {
    if (saving) return;
    setSaving(true);
    try {
      const body = { name: data.name || 'Custom Layout', description: data.description, config: { sections: data.sections, containers: data.containers, animation: data.animation } };
      await send(editId ? `/api/layouts/${editId}` : '/api/layouts', editId ? 'PUT' : 'POST', body);
      router.push('/studio/layouts');
    } catch {
      alert('Failed to save layout');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <button onClick={() => router.push('/studio/layouts')} className="text-sm text-zinc-400 hover:text-zinc-600 flex items-center gap-1 mb-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to layouts
          </button>
          <h1 className="text-2xl font-bold font-[var(--typography-font-heading)] text-zinc-900">
            {editId ? 'Edit Layout' : engine === 'tree' ? 'Layout Builder (Canvas)' : 'Layout Builder'}
          </h1>
        </div>
        <p className="text-xs text-zinc-400">{saving ? 'Saving…' : engine === 'tree' ? 'Drag/resize widget di canvas kanvas' : 'Drag sections, reorder, configure containers'}</p>
      </div>

      {engine === 'tree' ? (
        <TreeLayoutBuilder
          initialNodes={initialNodes}
          initialName={initialName}
          initialDescription={initialDescription}
          initialMode={initialMode}
          widgets={widgets}
          onSave={saveTree}
          onEditWidget={(widgetId) => router.push(`/studio/widgets/${widgetId}`)}
        />
      ) : (
        <LayoutBuilder
          initialSections={initialSections}
          initialContainers={initialContainers}
          initialName={initialName}
          initialDescription={initialDescription}
          onSave={saveLegacy}
        />
      )}
    </div>
  );
}

async function send(url: string, method: string, body: unknown) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save layout');
  }
  return res.json();
}

export default function LayoutBuilderPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Loading layout builder…</div>}>
      <LayoutBuilderContent />
    </Suspense>
  );
}
