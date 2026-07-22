'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { initializeRegistries } from '@/lib/registry';
import { getTemplate, TemplateRenderer } from '@/lib/template';
import { getLayout } from '@/lib/layout';
import { ThemeProvider } from '@/lib/theme';
import type { InvitationContent } from '@/lib/content/types';
import type { DeepPartial, ThemeConfig } from '@/lib/theme/types';

// Registries must be populated before getTemplate()/getLayout() resolve.
initializeRegistries();

interface PublicInvitation {
  published?: boolean;
  templateId: string;
  layoutId?: string;
  content: InvitationContent;
  themeOverrides?: { colors?: Record<string, string> };
}

export default function InvitationPublicPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [inv, setInv] = useState<PublicInvitation | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'notfound'>('loading');

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/invitations/${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        if (!d) return setStatus('notfound');
        setInv(d);
        setStatus('ready');
      })
      .catch(() => !cancelled && setStatus('notfound'));
    return () => { cancelled = true; };
  }, [slug]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-zinc-400 text-sm">Memuat undangan…</div>;
  }
  if (status === 'notfound' || !inv) {
    return <Message title="Undangan tidak ditemukan" body="Periksa kembali link undangan Anda." />;
  }
  if (!inv.published) {
    return <Message title="Undangan belum dipublikasikan" body="Pemilik belum menerbitkan undangan ini." />;
  }

  const template = getTemplate(inv.templateId);
  if (!template) {
    return <Message title="Template tidak tersedia" body={`Template "${inv.templateId}" tidak ditemukan.`} />;
  }
  const layout = getLayout(inv.layoutId || 'default');
  const content = inv.content as InvitationContent;
  const theme: DeepPartial<ThemeConfig> = {
    ...template.theme,
    colors: { ...((template.theme?.colors || {}) as Record<string, string>), ...((inv.themeOverrides?.colors || {}) as Record<string, string>) },
  };

  const isMobile = template.category === 'mobile';

  return (
    <ThemeProvider theme={theme} scopeClass="lumina-invitation-scope">
      {isMobile ? (
        <div className="flex items-start justify-center min-h-screen bg-zinc-100 overflow-auto">
          <div className="w-full max-w-[384px] min-h-screen bg-white shadow-2xl mx-auto md:my-0">
            <TemplateRenderer
              template={template}
              layout={layout}
              content={content}
              slug={slug}
              scopeClass="lumina-invitation-scope"
            />
          </div>
        </div>
      ) : (
        <TemplateRenderer
          template={template}
          layout={layout}
          content={content}
          slug={slug}
          scopeClass="lumina-invitation-scope"
        />
      )}
    </ThemeProvider>
  );
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-xl font-semibold text-zinc-800 mb-2">{title}</h1>
      <p className="text-sm text-zinc-500">{body}</p>
    </div>
  );
}
