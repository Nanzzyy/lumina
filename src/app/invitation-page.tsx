'use client';

import { useMemo, useState, useEffect } from 'react';
import { TemplateRenderer, getTemplate, getAllTemplates } from '@/lib/template';
import { ThemeProvider } from '@/lib/theme';
import { demoInvitations } from '@/data/invitations/demo-all';
import { initializeRegistries } from '@/lib/registry';
import { MusicPlayer } from '@/components/primitives/MusicPlayer';
import { StickyNav } from '@/components/primitives/StickyNav';

initializeRegistries();

export function InvitationPage() {
  const [templateId, setTemplateId] = useState('aurora');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const template = useMemo(() => getTemplate(templateId), [templateId]);
  const content = useMemo(() => demoInvitations[templateId] || demoInvitations.aurora, [templateId]);
  const templates = useMemo(() => getAllTemplates(), []);

  const navItems = useMemo(() => {
    if (!template) return [];
    return template.sections.map((s) => ({ id: s.id, label: s.type.charAt(0).toUpperCase() + s.type.slice(1) }));
  }, [template]);

  if (!template) return <div className="p-8 text-center text-[var(--colors-text-muted)]">Template not found</div>;

  const isDark = templateId === 'aurora' || templateId === 'luna' || templateId === 'royal' || templateId === 'noir';

  return (
    <>
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex gap-1 bg-white/90 backdrop-blur-md shadow-lg rounded-full px-2 py-1.5 border border-zinc-200 overflow-x-auto max-w-[95vw]">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => setTemplateId(t.id)}
            className={`px-3 py-1 text-[11px] rounded-full whitespace-nowrap transition-all ${
              templateId === t.id
                ? 'bg-[var(--colors-primary)] text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      <StickyNav items={navItems} variant={isDark ? 'noir' : 'default'} />

      {mounted && content.music?.src && (
        <MusicPlayer src={content.music.src} title={content.music.title} autoplay={content.music.autoplay} variant={isDark ? 'noir' : 'default'} />
      )}

      <ThemeProvider theme={template.theme} scopeClass="lumina-invitation-scope">
        <TemplateRenderer template={template} content={content} scopeClass="lumina-invitation-scope" />
      </ThemeProvider>
    </>
  );
}
