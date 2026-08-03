import { getLayout, updateLayout, deleteLayout } from '@/lib/db';
import { updateLayoutSchema } from '@/lib/validation';
import { authedRoute, forbidden, json, ok, parseBody, requireFound, route } from '@/lib/api/respond';

type Params = { id: string };

export const GET = route<Params>(async (_req, { id }) => json(requireFound(getLayout(id))));

export const PUT = authedRoute<Params>(async (req, { id }) => {
  const { name, description, config } = await parseBody(req, updateLayoutSchema);
  return json(requireFound(updateLayout(id, { name, description, config })));
});

export const DELETE = authedRoute<Params>(async (_req, { id }) => {
  if (!deleteLayout(id)) throw forbidden('Not found or built-in layout cannot be deleted');
  return ok();
});
