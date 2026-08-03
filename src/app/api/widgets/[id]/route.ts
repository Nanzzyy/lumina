import { getWidget, updateWidget, deleteWidget } from '@/lib/db';
import { updateWidgetSchema } from '@/lib/validation';
import { authedRoute, json, notFound, parseBody, requireFound, route } from '@/lib/api/respond';
import { serializeWidgetRow } from '@/lib/api/serialize';

type Params = { id: string };

export const GET = route<Params>(async (_req, { id }) => json(serializeWidgetRow(requireFound(getWidget(id)))));

export const PUT = authedRoute<Params>(async (req, { id }) => {
  const data = await parseBody(req, updateWidgetSchema);
  return json(requireFound(updateWidget(id, data)));
});

export const DELETE = authedRoute<Params>(async (_req, { id }) => {
  if (!deleteWidget(id)) throw notFound('Not found or built-in');
  return json({ success: true });
});
