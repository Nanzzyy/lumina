import { saveDocument, loadDocumentBySlug } from '@/lib/db';
import { authedRoute, badRequest, json, requireFound, route } from '@/lib/api/respond';
import type { Document } from '@/lib/core/document';

export const dynamic = 'force-dynamic';

type Params = { slug: string };

// Public read: world-readable published document (feeds /os/[slug]).
export const GET = route<Params>(async (_req, { slug }) => json(requireFound(loadDocumentBySlug(slug))));

// Auth-gated write: editor Publish persists the Document (DB write = trust boundary).
export const POST = authedRoute<Params>(async (req, { slug }) => {
  const doc = (await req.json()) as Document;
  if (doc.project.slug !== slug) throw badRequest('slug mismatch');
  saveDocument(doc);
  return json({ success: true, slug });
});
