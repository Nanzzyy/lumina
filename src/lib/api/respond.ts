/**
 * Shared plumbing for the `/api/*` route handlers: every route repeated the same
 * session guard, `await params`, try/catch → 500, Zod → 400 and error-payload
 * shapes. `route`/`authedRoute` wrap a handler with all of it; failures are
 * signalled by throwing `ApiError` (or one of the `badRequest`/`notFound`
 * shorthands) instead of returning a hand-rolled `NextResponse`.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { z } from 'zod';
import { unauthorized, verifySession } from '@/lib/auth';
import { clientIp, rateLimit } from '@/lib/rate-limit';

/** Error whose status + message are sent verbatim to the client. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const badRequest = (message: string, details?: unknown) => new ApiError(400, message, details);
export const notFound = (message = 'Not found') => new ApiError(404, message);
export const forbidden = (message: string) => new ApiError(403, message);
export const conflict = (message: string) => new ApiError(409, message);

/** `{ error }` payload for a thrown error; anything unexpected becomes a 500. */
export function errorResponse(e: unknown): NextResponse {
  if (e instanceof ApiError) {
    return NextResponse.json(
      e.details === undefined ? { error: e.message } : { error: e.message, details: e.details },
      { status: e.status },
    );
  }
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

export const json = <T>(data: T) => NextResponse.json(data);
export const created = <T>(data: T) => NextResponse.json(data, { status: 201 });
export const ok = () => NextResponse.json({ ok: true });

type RouteContext<P> = { params: Promise<P> };
type Handler<P> = (req: NextRequest, params: P) => Promise<NextResponse>;

/**
 * Public route: resolves dynamic `params` and converts thrown errors into
 * `{ error }` responses.
 */
export function route<P = Record<string, never>>(handler: Handler<P>) {
  return async (req: NextRequest, ctx?: RouteContext<P>): Promise<NextResponse> => {
    try {
      const params = (ctx?.params ? await ctx.params : {}) as P;
      return await handler(req, params);
    } catch (e) {
      return errorResponse(e);
    }
  };
}

/** Trust-boundary route (DB writes): `route` + `lumina_session` check. */
export function authedRoute<P = Record<string, never>>(handler: Handler<P>) {
  const wrapped = route(handler);
  return async (req: NextRequest, ctx?: RouteContext<P>): Promise<NextResponse> => {
    if (!verifySession(req)) return unauthorized();
    return wrapped(req, ctx);
  };
}

/**
 * Guest-facing submission route: public (no session) but rate-limited per IP so
 * the wish/RSVP endpoints cannot be flooded.
 */
export function guestRoute<P = Record<string, never>>(bucket: string, handler: Handler<P>, limit = 20) {
  const wrapped = route(handler);
  return async (req: NextRequest, ctx?: RouteContext<P>): Promise<NextResponse> => {
    if (rateLimit(`${bucket}:${clientIp(req)}`, limit)) {
      return NextResponse.json({ error: 'Too many submissions. Please wait a moment.' }, { status: 429 });
    }
    return wrapped(req, ctx);
  };
}

/** Parse + validate a JSON body, or throw a 400 carrying the field errors. */
export async function parseBody<T>(req: NextRequest, schema: z.ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw badRequest('Invalid JSON body');
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw badRequest('Validation failed', parsed.error.flatten());
  return parsed.data;
}

/** Read a required query string param, or throw `"<name> required"` as a 400. */
export function requireQuery(req: NextRequest, name: string): string {
  const value = req.nextUrl.searchParams.get(name);
  if (!value) throw badRequest(`${name} required`);
  return value;
}

/** Return `value`, or throw a 404 when the record does not exist. */
export function requireFound<T>(value: T | null | undefined, message?: string): T {
  if (value === null || value === undefined) throw notFound(message);
  return value;
}
