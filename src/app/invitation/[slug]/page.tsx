import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getInvitation } from '@/lib/db';
import { initializeRegistries } from '@/lib/registry';
import { loadExternalTemplates } from '@/lib/registry/server-init';
import { InvitationClient } from './client';

initializeRegistries();
loadExternalTemplates();

async function getBaseUrl() {
  const h = await headers();
  const host = h.get('host') || 'localhost:3000';
  const proto = h.get('x-forwarded-proto') || 'http';
  return `${proto}://${host}`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const inv = getInvitation(slug);

  if (!inv || !inv.published) {
    return { title: 'Undangan tidak ditemukan' };
  }

  const c = inv.content?.couple;
  const p1 = c?.partner1 || 'Mempelai 1';
  const p2 = c?.partner2 || 'Mempelai 2';
  const title = `${p1} & ${p2}`;
  const description = inv.content?.ogDescription
    || (inv.content?.quote?.text
      ? `Undangan pernikahan ${p1} & ${p2}. ${inv.content.quote.text.slice(0, 120)}…`
      : `Undangan pernikahan ${p1} & ${p2}. Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir memberikan restu.`);
  const coverImage = inv.content?.ogImage || inv.content?.media?.cover;
  const baseUrl = getBaseUrl();

  return {
    title: `${title} — Undangan Pernikahan`,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/invitation/${slug}`,
      type: 'website',
      images: coverImage ? [{ url: coverImage, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: coverImage ? [coverImage] : [],
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
