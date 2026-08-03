import { createWish, listWishes } from '@/lib/db';
import { badRequest, created, guestRoute, json, requireFound, requireQuery, route } from '@/lib/api/respond';

export const POST = guestRoute('wish', async (req) => {
  const { slug, name, message } = await req.json();
  if (!slug || !name || !message) throw badRequest('slug, name, and message required');
  const wish = createWish({
    slug,
    name: name.trim().slice(0, 100),
    message: message.trim().slice(0, 1000),
  });
  return created(requireFound(wish));
});

export const GET = route(async (req) => json(listWishes(requireQuery(req, 'slug'))));
