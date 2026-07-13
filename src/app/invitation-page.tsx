'use client';

import { useMemo, useState, useEffect } from 'react';
import { TemplateRenderer, getTemplate, getAllTemplates } from '@/lib/template';
import { ThemeProvider } from '@/lib/theme';
import { ariaDemoInvitation, noirDemoInvitation } from '@/data/invitations';
import { initializeRegistries } from '@/lib/registry';
import { MusicPlayer } from '@/components/primitives/MusicPlayer';
import { StickyNav } from '@/components/primitives/StickyNav';
import type { InvitationContent } from '@/lib/content/types';

// Register all sections and templates at module load time
initializeRegistries();

const invitations: Record<string, InvitationContent> = {
  'aria': ariaDemoInvitation,
  'noir': noirDemoInvitation,
};

export function InvitationPage() {
  const [templateId, setTemplateId] = useState('aria');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const template = useMemo(() => getTemplate(templateId), [templateId]);
  const content = useMemo(() => invitations[templateId], [templateId]);
  const templates = useMemo(() => getAllTemplates(), []);

  const navItems = useMemo(() => {
    if (!template) return [];
    return template.sections.map((s) => ({ id: s.id, label: s.type.charAt(0).toUpperCase() + s.type.slice(1) }));
  }, [template]);

  if (!template) return <div className="p-8 text-center text-[var(--colors-text-muted)]">Template not found</div>;

  return (
    <>
      {/* Template switcher — for demo only. In production this is the admin panel. */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-white/90 backdrop-blur-md shadow-lg rounded-full px-3 py-2 border border-[var(--colors-border-light)]">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => setTemplateId(t.id)}
            className={`px-4 py-1.5 text-xs rounded-full transition-all ${
              templateId === t.id
                ? 'bg-[var(--colors-primary)] text-white shadow-sm'
                : 'text-[var(--colors-text-secondary)] hover:text-[var(--colors-text)] hover:bg-[var(--colors-primary-light)]'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      <StickyNav items={navItems} variant={templateId === 'noir' ? 'noir' : 'default'} />

      {mounted && (
        <MusicPlayer
          src={content.music?.src}
          title={content.music?.title}
          autoplay={content.music?.autoplay}
          variant={templateId === 'noir' ? 'noir' : 'default'}
        />
      )}

      <ThemeProvider theme={template.theme} scopeClass="lumina-invitation-scope">
        <TemplateRenderer template={template} content={content} scopeClass="lumina-invitation-scope" />
      </ThemeProvider>
    </>
  );
}
