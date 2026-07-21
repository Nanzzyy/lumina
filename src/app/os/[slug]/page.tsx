import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { renderInvitationHtml } from '@/lib/publish/render-invitation';
import { loadDocumentBySlug } from '@/lib/db';

// DB-backed: any published slug renders per-request (sqlite is local; ISR/SSG
// optimization is a later ponytail).
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = loadDocumentBySlug(slug);
  // ponytail: richer SEO from Page.seo once the editor persists it.
  return { title: doc ? `${doc.project.name} — Undangan` : 'Undangan' };
}

export default async function OsInvitationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const out = renderInvitationHtml(slug);
  if (!out) notFound();

  // Output is produced by our own html-adapter (which escapes content); safe to inject.
  return <div dangerouslySetInnerHTML={{ __html: out.html }} />;
}
