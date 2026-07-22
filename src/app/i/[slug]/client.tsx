'use client';

import { initializeRegistries } from '@/lib/registry';
import { getTemplate, TemplateRenderer } from '@/lib/template';
import { getLayout } from '@/lib/layout';
import { ThemeProvider } from '@/lib/theme';
import type { InvitationContent } from '@/lib/content/types';
import type { DeepPartial, ThemeConfig } from '@/lib/theme/types';

initializeRegistries();

interface InvitationData {
  published?: boolean;
  templateId: string;
  layoutId?: string;
  content: InvitationContent;
  themeOverrides?: { colors?: Record<string, string> };
}

export function InvitationClient({ slug, data }: { slug: string; data: InvitationData | null }) {
  if (!data) {
    return <Message title="Undangan tidak ditemukan" body="Periksa kembali link undangan Anda." />;
  }
  if (!data.published) {
    return <Message title="Undangan belum dipublikasikan" body="Pemilik belum menerbitkan undangan ini." />;
  }

  const template = getTemplate(data.templateId);
  if (!template) {
    return <Message title="Template tidak tersedia" body={`Template "${data.templateId}" tidak ditemukan.`} />;
  }

  const layout = getLayout(data.layoutId || 'default');
  const content = data.content;
  const theme: DeepPartial<ThemeConfig> = {
    ...template.theme,
    colors: { ...((template.theme?.colors || {}) as Record<string, string>), ...((data.themeOverrides?.colors || {}) as Record<string, string>) },
  };

  return (
    <ThemeProvider theme={theme} scopeClass="lumina-invitation-scope">
      <TemplateRenderer
        template={template}
        layout={layout}
        content={content}
        slug={slug}
        scopeClass="lumina-invitation-scope"
      />
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
