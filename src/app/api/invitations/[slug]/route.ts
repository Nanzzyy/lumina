import { getInvitation, updateInvitation, deleteInvitation } from '@/lib/db';
import { updateInvitationSchema } from '@/lib/validation';
import { authedRoute, json, ok, parseBody, requireFound } from '@/lib/api/respond';

type Params = { slug: string };

export const GET = authedRoute<Params>(async (_req, { slug }) => json(requireFound(getInvitation(slug))));

export const PUT = authedRoute<Params>(async (req, { slug }) => {
  const { title, templateId, layoutId, content, themeOverrides, published } = await parseBody(
    req,
    updateInvitationSchema,
  );
  return json(
    requireFound(updateInvitation(slug, { title, templateId, layoutId, content, themeOverrides, published })),
  );
});

export const DELETE = authedRoute<Params>(async (_req, { slug }) => {
  deleteInvitation(slug);
  return ok();
});
