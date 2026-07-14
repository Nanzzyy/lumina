'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutBuilder } from '@/components/studio/LayoutBuilder';
import { initializeRegistries } from '@/lib/registry';
import type { SectionConfig } from '@/lib/template/types';
import type { ContainerConfig } from '@/lib/layout/types';

initializeRegistries();

function LayoutBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const [saving, setSaving] = useState(false);
  const [initialSections, setInitialSections] = useState<SectionConfig[] | undefined>();
  const [initialContainers, setInitialContainers] = useState<ContainerConfig[] | undefined>();
  const [initialName, setInitialName] = useState('');
  const [initialDescription, setInitialDescription] = useState('');
  const [loadedEditId, setLoadedEditId] = useState<string | null>(null);

  useEffect(() => {
    if (editId && editId !== loadedEditId) {
      fetch(`/api/layouts/${editId}`)
        .then((r) => r.json())
        .then((layout) => {
          if (layout) {
            setInitialSections(layout.config.sections);
            setInitialContainers(layout.config.containers);
            setInitialName(layout.name);
            setInitialDescription(layout.description);
            setLoadedEditId(editId);
          }
        })
        .catch(() => {});
    }
  }, [editId, loadedEditId]);

  const handleSave = async (data: { name: string; description: string; sections: SectionConfig[]; containers: ContainerConfig[]; animation?: { preset: string } }) => {
    if (saving) return;
    setSaving(true);

    try {
      const body = { name: data.name || 'Custom Layout', description: data.description, config: { sections: data.sections, containers: data.containers, animation: data.animation } };
      const url = editId ? `/api/layouts/${editId}` : '/api/layouts';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to save layout');
        return;
      }

      router.push('/studio/layouts');
    } catch (e) {
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
            {editId ? 'Edit Layout' : 'Layout Builder'}
          </h1>
        </div>
        <p className="text-xs text-zinc-400">
          {saving ? 'Saving...' : 'Drag sections, reorder, configure containers'}
        </p>
      </div>

      <LayoutBuilder
        initialSections={initialSections}
        initialContainers={initialContainers}
        initialName={initialName}
        initialDescription={initialDescription}
        onSave={handleSave}
      />
    </div>
  );
}

export default function LayoutBuilderPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Loading layout builder...</div>}>
      <LayoutBuilderContent />
    </Suspense>
  );
}
