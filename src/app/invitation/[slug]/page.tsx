import type { Metadata } from 'next';
import { getInvitation } from '@/lib/db';
import { initializeRegistries } from '@/lib/registry';
import { loadExternalTemplates } from '@/lib/registry/server-init';
import { getPublicBaseUrl, toAbsoluteUrl } from '@/lib/metadata';
import { InvitationClient } from './client';

initializeRegistries();
loadExternalTemplates();

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const inv = getInvitation(slug);

  if (!inv || !inv.published) {
    return { title: 'Undangan tidak ditemukan' };
  }

  const content = inv.publishedSnapshot?.content || inv.content;
  const c = content?.couple;
  const p1 = c?.partner1 || 'Mempelai 1';
  const p2 = c?.partner2 || 'Mempelai 2';
  const title = `${p1} & ${p2}`;
  const description = content?.ogDescription
    || (content?.quote?.text
      ? `Undangan pernikahan ${p1} & ${p2}. ${content.quote.text.slice(0, 120)}…`
      : `Undangan pernikahan ${p1} & ${p2}. Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir memberikan restu.`);
  const baseUrl = await getPublicBaseUrl();
  const coverImage = toAbsoluteUrl(content?.ogImage || content?.media?.cover, baseUrl);
  const ogImage = coverImage ? `${baseUrl}/api/og/${encodeURIComponent(slug)}` : undefined;

  return {
    title: `${title} — Undangan Pernikahan`,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/invitation/${slug}`,
      type: 'website',
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function InvitationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const inv = getInvitation(slug);

  // Snapshot-backed: if the invitation has a published snapshot, render the
  // frozen data so live edits don't affect published invites.
  let data: {
    published: boolean;
    templateId: string;
    layoutId?: string;
    content: any;
    themeOverrides?: any;
  } | null = null;

  if (inv) {
    if (inv.publishedSnapshot) {
      const snap = inv.publishedSnapshot;
      data = {
        published: true,
        templateId: snap.template_id,
        layoutId: snap.layout_id,
        content: snap.content,
        themeOverrides: snap.theme_overrides,
      };
    } else {
      data = {
        published: !!inv.published,
        templateId: inv.templateId,
        layoutId: inv.layoutId,
        content: inv.content,
        themeOverrides: inv.themeOverrides,
      };
    }
  }

  return <InvitationClient slug={slug} data={data} />;
}
