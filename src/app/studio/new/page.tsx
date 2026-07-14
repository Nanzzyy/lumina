'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAllTemplates } from '@/lib/template';
import { useStudioStore } from '@/lib/studio/store';
import { defaultInvitationContent } from '@/lib/content/defaults';

function NewInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { create, invitations } = useStudioStore();
  const templates = useMemo(() => getAllTemplates(), []);
  const [layouts, setLayouts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/layouts')
      .then((r) => r.json())
      .then(setLayouts)
      .catch(() => {});
  }, []);

  const preSelectedTemplate = searchParams.get('template') || '';

  const [step, setStep] = useState<'template' | 'layout' | 'name'>(preSelectedTemplate ? 'layout' : 'template');
  const [selectedTemplate, setSelectedTemplate] = useState(preSelectedTemplate);
  const [selectedLayout, setSelectedLayout] = useState('default');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');

  const handlePickTemplate = (id: string) => {
    setSelectedTemplate(id);
    setStep('layout');
  };

  const handlePickLayout = (id: string) => {
    setSelectedLayout(id);
    setStep('name');
  };

  const handleCreate = async () => {
    if (!title.trim() || !selectedTemplate || !selectedLayout) return;
    let finalSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (!finalSlug) finalSlug = 'invitation';

    const existingSlugs = new Set(invitations.map(i => i.slug));
    let uniqueSlug = finalSlug;
    let counter = 1;
    while (existingSlugs.has(uniqueSlug)) {
      uniqueSlug = `${finalSlug}-${counter}`;
      counter++;
    }
    finalSlug = uniqueSlug;

    const content = { ...defaultInvitationContent, slug: finalSlug };
    content.couple = { ...content.couple, partner1: 'Partner 1', partner2: 'Partner 2' };

    await create({
      slug: finalSlug,
      templateId: selectedTemplate,
      layoutId: selectedLayout,
      title: title.trim(),
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    router.push(`/studio/${finalSlug}`);
  };

  // Step 1: Pick Template
  if (step === 'template') {
    return (
      <div>
        <h1 className="text-2xl font-bold font-[var(--typography-font-heading)] text-zinc-900 mb-2">Choose a Template</h1>
        <p className="text-sm text-zinc-500 mb-8">Pick a color theme for your invitation.</p>
        <div className="grid gap-5 sm:grid-cols-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => handlePickTemplate(t.id)}
              className="text-left bg-white rounded-xl border border-zinc-200 p-6 hover:border-[var(--colors-primary)]/40 hover:shadow-md transition-all group"
            >
              <div className="h-32 rounded-lg mb-4 overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${t.theme?.colors?.primary || '#db2777'}, ${t.theme?.colors?.secondary || '#7c3aed'})` }}>
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white/80 text-2xl font-[var(--typography-font-heading)]">{t.name}</span>
                </div>
              </div>
              <h3 className="font-semibold text-zinc-900 group-hover:text-[var(--colors-primary)] transition-colors">{t.name}</h3>
              <p className="text-sm text-zinc-500 mt-1">{t.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Pick Layout
  if (step === 'layout') {
    return (
      <div>
        <button onClick={() => setStep('template')} className="text-sm text-zinc-400 hover:text-zinc-600 mb-6 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to templates
        </button>

        <h1 className="text-2xl font-bold font-[var(--typography-font-heading)] text-zinc-900 mb-2">Choose a Layout</h1>
        <p className="text-sm text-zinc-500 mb-8">Pick a section arrangement for your invitation.</p>

        <div className="grid gap-5 sm:grid-cols-2">
          {layouts.map((l) => (
            <button
              key={l.id}
              onClick={() => handlePickLayout(l.id)}
              className={`text-left bg-white rounded-xl border p-6 transition-all ${
                selectedLayout === l.id ? 'border-[var(--colors-primary)] ring-1 ring-[var(--colors-primary)]' : 'border-zinc-200 hover:border-[var(--colors-primary)]/40 hover:shadow-md'
              }`}
            >
              <h3 className="font-semibold text-zinc-900">{l.name}</h3>
              <p className="text-sm text-zinc-500 mt-1 mb-4">{l.description}</p>
              <div className="flex flex-col gap-1">
                {(l.config?.sections || l.sections || []).map((s: { type: string }, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--colors-primary)]/60 flex-shrink-0" />
                    <span className="text-zinc-500 capitalize">{s.type}</span>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 3: Name & Create
  const pickedTemplate = templates.find((t) => t.id === selectedTemplate);
  const pickedLayout = layouts.find((l) => l.id === selectedLayout);

  return (
    <div className="max-w-lg mx-auto">
      <button onClick={() => setStep('layout')} className="text-sm text-zinc-400 hover:text-zinc-600 mb-6 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to layouts
      </button>

      <h1 className="text-2xl font-bold font-[var(--typography-font-heading)] text-zinc-900 mb-2">Name Your Invitation</h1>
      <div className="flex items-center gap-4 text-sm text-zinc-500 mb-8">
        <span>Template: <span className="font-medium text-zinc-700">{pickedTemplate?.name}</span></span>
        <span className="text-zinc-300">|</span>
        <span>Layout: <span className="font-medium text-zinc-700">{pickedLayout?.name}</span></span>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">Invitation Title</label>
          <input value={title} onChange={(e) => { setTitle(e.target.value); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')); }}
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--colors-primary)] focus:border-transparent"
            placeholder="e.g. Sarah & Alexander" />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">URL Slug</label>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-400">/studio/</span>
            <input value={slug} onChange={(e) => setSlug(e.target.value.replace(/[^a-z0-9-]/g, ''))}
              className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--colors-primary)] focus:border-transparent"
              placeholder="sarah-and-alexander" />
          </div>
        </div>

        <button onClick={handleCreate} disabled={!title.trim()}
          className="w-full py-3 bg-[var(--colors-primary)] text-white rounded-lg font-medium text-sm hover:bg-[var(--colors-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          Create Invitation
        </button>
      </div>
    </div>
  );
}

export default function NewInvitationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Loading...</div>}>
      <NewInvitationContent />
    </Suspense>
  );
}
