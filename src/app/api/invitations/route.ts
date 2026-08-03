import type { InvitationRow } from '@/lib/db';
import { listInvitations, createInvitation } from '@/lib/db';
import { createInvitationSchema } from '@/lib/validation';
import { authedRoute, conflict, created, json, parseBody } from '@/lib/api/respond';
import { serializeInvitationRow } from '@/lib/api/serialize';

export const GET = authedRoute(async () =>
  json((listInvitations() as InvitationRow[]).map(serializeInvitationRow)),
);

export const POST = authedRoute(async (req) => {
  const { slug, title, templateId, layoutId, content, themeOverrides, published } = await parseBody(
    req,
    createInvitationSchema,
  );
  try {
    return created(
      createInvitation({ slug, title: title || slug, templateId, layoutId, content, themeOverrides, published }),
    );
  } catch (e) {
    if (e instanceof Error && e.message.includes('UNIQUE')) throw conflict('Slug already exists');
    throw e;
  }
});
