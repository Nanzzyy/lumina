import { publishInvitation, unpublishInvitation } from '@/lib/db';
import { authedRoute, json, ok, requireFound } from '@/lib/api/respond';

type Params = { slug: string };

export const POST = authedRoute<Params>(async (_req, { slug }) => json(requireFound(publishInvitation(slug))));

export const DELETE = authedRoute<Params>(async (_req, { slug }) => {
  requireFound(unpublishInvitation(slug));
  return ok();
});
