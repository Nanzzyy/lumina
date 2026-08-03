import { createRSVP, listRSVPs } from '@/lib/db';
import { badRequest, created, guestRoute, json, requireFound, requireQuery, route } from '@/lib/api/respond';

const VALID_STATUSES = ['hadir', 'tidak_hadir', 'ragu'];

export const POST = guestRoute('rsvp', async (req) => {
  const { slug, name, status, guests, message } = await req.json();
  if (!slug || !name) throw badRequest('slug and name required');
  const rsvp = createRSVP({
    slug,
    name: name.trim().slice(0, 100),
    status: VALID_STATUSES.includes(status) ? status : 'hadir',
    guests: Math.max(1, Math.min(Number(guests) || 1, 99)),
    message: (message || '').trim().slice(0, 500),
  });
  return created(requireFound(rsvp));
});

export const GET = route(async (req) => json(listRSVPs(requireQuery(req, 'slug'))));
