import { listWidgets, createWidget } from '@/lib/db';
import { createWidgetSchema } from '@/lib/validation';
import { authedRoute, created, json, parseBody, route } from '@/lib/api/respond';
import { serializeWidgetRow } from '@/lib/api/serialize';

export const GET = route(async () => json(listWidgets().map(serializeWidgetRow)));

export const POST = authedRoute(async (req) => {
  const { id, name, description, thumbnail, category, definition } = await parseBody(req, createWidgetSchema);
  return created(createWidget({ id, name, description, thumbnail, category, definition }));
});
