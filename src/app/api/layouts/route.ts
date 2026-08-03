import { listLayouts, createLayout } from '@/lib/db';
import { createLayoutSchema } from '@/lib/validation';
import { authedRoute, created, json, parseBody, route } from '@/lib/api/respond';
import { serializeLayoutRow } from '@/lib/api/serialize';

export const GET = route(async () => json(listLayouts().map(serializeLayoutRow)));

export const POST = authedRoute(async (req) => {
  const { id, name, description, config, isBuiltin } = await parseBody(req, createLayoutSchema);
  return created(createLayout({ id, name, description, config, isBuiltin }));
});
